import assert from "node:assert/strict";
import { test } from "node:test";
import type { PrismaClient } from "@prisma/client";
import { importListingsFromCsv, mapRow, parseCsv } from "./import-listings";

const HOUSTON = { id: "city-houston", slug: "houston", name: "Houston" };

type ListingWrite = {
  claimable?: boolean;
  bio?: string;
  name?: string;
  status?: string;
};

function fakeDb(existing: { id: string; slug: string; name: string } | null) {
  const writes: { create?: ListingWrite; update?: ListingWrite } = {};
  const prisma = {
    city: {
      findMany: async () => [HOUSTON],
    },
    listing: {
      findFirst: async () => existing,
      findUnique: async () => null,
      create: async ({ data }: { data: ListingWrite }) => {
        writes.create = data;
        return data;
      },
      update: async ({ data }: { data: ListingWrite }) => {
        writes.update = data;
        return data;
      },
    },
  };
  return { prisma: prisma as unknown as PrismaClient, writes };
}

function rowCsv(claimable: string, column = "claimable") {
  return `name,metro_slug,services,bio,email,status,${column}
Acme Foundation,houston,foundation,"Houston clay shop.",desk@example.com,published,${claimable}
`;
}

test("claimable=no on a new published row imports claimable=true", async () => {
  for (const [column, value] of [
    ["claimable", "no"],
    ["claim", "false"],
    ["can_claim", "off"],
  ] as const) {
    const { rows } = parseCsv(rowCsv(value, column));
    const mapped = mapRow(rows[0], 0);
    assert.equal("error" in mapped, false);
    if ("error" in mapped) continue;
    assert.equal(mapped.claimable, true);
    assert.equal(mapped.status, "published");
    assert.ok(mapped.warnings.some((warning) => warning.includes(`Ignored claimable="${value}"`)));
  }

  const { prisma, writes } = fakeDb(null);
  const result = await importListingsFromCsv(rowCsv("no"), { prisma });
  assert.deepEqual(result.created, ["Acme Foundation"]);
  assert.deepEqual(result.updated, []);
  assert.equal(result.errors.length, 0);
  assert.equal(writes.create?.claimable, true);
  assert.equal(writes.create?.status, "published");
  assert.equal(writes.update, undefined);
});

test("claimable=no on an update does not change claimable", async () => {
  const existing = { id: "lst_claimed", slug: "acme-foundation", name: "Acme Foundation" };

  const denied = fakeDb(existing);
  const deniedResult = await importListingsFromCsv(rowCsv("no"), { prisma: denied.prisma });
  assert.deepEqual(deniedResult.updated, ["Acme Foundation"]);
  assert.deepEqual(deniedResult.created, []);
  assert.equal(deniedResult.errors.length, 0);
  assert.equal("claimable" in (denied.writes.update ?? {}), false);
  assert.equal(denied.writes.update?.bio, "Houston clay shop.");
  assert.equal(denied.writes.create, undefined);
  assert.ok(deniedResult.warnings.some((warning) => warning.includes('Ignored claimable="no"')));

  const affirmed = fakeDb(existing);
  const affirmedResult = await importListingsFromCsv(rowCsv("yes"), { prisma: affirmed.prisma });
  assert.deepEqual(affirmedResult.updated, ["Acme Foundation"]);
  assert.equal("claimable" in (affirmed.writes.update ?? {}), false);
  assert.equal(
    affirmedResult.warnings.some((warning) => warning.includes("Ignored claimable")),
    false,
  );
});
