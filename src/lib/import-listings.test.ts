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
  slug?: string;
};

function fakeDb(existing: { id: string; slug: string; name: string } | null) {
  const writes: {
    create?: ListingWrite;
    update?: ListingWrite;
    createMany?: ListingWrite[];
    cityLinks?: { listingId: string; cityId: string }[];
    cities?: { slug: string; name: string }[];
  } = {};
  const prisma = {
    city: {
      findMany: async () => [HOUSTON],
      createManyAndReturn: async ({ data }: { data: { slug: string; name: string }[] }) => {
        writes.cities = data;
        return data.map((row, index) => ({
          id: `city-new-${index}`,
          slug: row.slug,
          name: row.name,
        }));
      },
    },
    listing: {
      findMany: async () => (existing ? [existing] : []),
      update: async ({ data }: { data: ListingWrite }) => {
        writes.update = data;
        return data;
      },
      createManyAndReturn: async ({ data }: { data: ListingWrite[] }) => {
        writes.createMany = data;
        writes.create = data[0];
        return data.map((row, index) => ({
          id: `new-${index}`,
          slug: row.slug ?? `slug-${index}`,
          name: row.name ?? "",
        }));
      },
    },
    listingCity: {
      createMany: async ({ data }: { data: { listingId: string; cityId: string }[] }) => {
        writes.cityLinks = data;
        return { count: data.length };
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

test("new listings are inserted with one createMany and one city-link batch", async () => {
  const csv = `name,metro_slug,services,bio,email,status
Acme Foundation,houston,foundation,"Houston clay shop.",desk@example.com,published
Bayou Encap,houston,encapsulation,"Crawl liner shop.",stay@example.com,published
`;
  const { prisma, writes } = fakeDb(null);
  const result = await importListingsFromCsv(csv, { prisma });
  assert.deepEqual(result.created, ["Acme Foundation", "Bayou Encap"]);
  assert.deepEqual(result.updated, []);
  assert.equal(writes.createMany?.length, 2);
  assert.equal(writes.cityLinks?.length, 2);
  assert.equal(writes.update, undefined);
  assert.equal(writes.cities, undefined);
  assert.ok(result.paths.includes("/"));
  assert.ok(result.paths.includes("/sitemap.xml"));
  assert.ok(result.paths.includes("/cities/houston"));
  assert.ok(result.paths.includes("/l/acme-foundation"));
  assert.ok(result.paths.includes("/l/bayou-encap"));
});

test("insert-only skips an existing name without writing", async () => {
  const { prisma, writes } = fakeDb({
    id: "lst",
    slug: "acme-foundation",
    name: "Acme Foundation",
  });
  const result = await importListingsFromCsv(rowCsv("yes"), { prisma, insertOnly: true });
  assert.deepEqual(result.skipped, ["Acme Foundation (acme-foundation)"]);
  assert.deepEqual(result.created, []);
  assert.equal(writes.createMany, undefined);
  assert.equal(writes.update, undefined);
});

test("unknown metros error when cities are not created", async () => {
  const csv = `name,metro,services,bio,email,status
New Shop,Not A Real Metro,foundation,"A bio long enough.",desk@example.com,published
`;
  const { prisma, writes } = fakeDb(null);
  const result = await importListingsFromCsv(csv, { prisma, createCities: false });
  assert.deepEqual(result.created, []);
  assert.ok(result.errors.some((error) => error.includes('unknown metro "Not A Real Metro"')));
  assert.equal(writes.createMany, undefined);
});

test("dry-run reports creates without writing", async () => {
  const logs: string[] = [];
  const { prisma, writes } = fakeDb(null);
  const result = await importListingsFromCsv(rowCsv("no"), {
    prisma,
    dryRun: true,
    log: (message) => logs.push(message),
  });
  assert.deepEqual(result.created, ["Acme Foundation"]);
  assert.deepEqual(result.paths, []);
  assert.equal(writes.createMany, undefined);
  assert.equal(writes.update, undefined);
  assert.match(logs[0] ?? "", /\[dry-run\] create contractor "Acme Foundation"/);
});

test("new cities are created in one batch and shared by later rows", async () => {
  const csv = `name,metro,services,bio,email,status,state,region
Alpha Shop,Newport News,foundation,"Alpha bio text.",a@example.com,published,VA,Tidewater
Beta Shop,Newport News,encapsulation,"Beta bio text.",b@example.com,published,VA,Tidewater
`;
  const { prisma, writes } = fakeDb(null);
  const result = await importListingsFromCsv(csv, { prisma });
  assert.deepEqual(result.created, ["Alpha Shop", "Beta Shop"]);
  assert.equal(writes.cities?.length, 1);
  assert.equal(writes.cities?.[0]?.slug, "newport-news");
  assert.equal(writes.createMany?.length, 2);
  assert.equal(writes.cityLinks?.length, 2);
  assert.equal(writes.cityLinks?.[0]?.cityId, "city-new-0");
  assert.equal(writes.cityLinks?.[1]?.cityId, "city-new-0");
});

test("a later row that matches a new slug updates that pending listing", async () => {
  const csv = `name,metro_slug,services,bio,email,status,slug
Foo Bar,houston,foundation,"First bio text.",a@example.com,published,shared
Foo Baz,houston,encapsulation,"Second bio text.",b@example.com,published,shared
`;
  const { prisma, writes } = fakeDb(null);
  const result = await importListingsFromCsv(csv, { prisma });
  assert.deepEqual(result.created, ["Foo Bar"]);
  assert.deepEqual(result.updated, ["Foo Baz"]);
  assert.equal(writes.createMany?.length, 1);
  assert.equal(writes.createMany?.[0]?.bio, "Second bio text.");
  assert.equal(writes.createMany?.[0]?.slug, "shared");
  assert.equal(writes.createMany?.[0]?.claimable, true);
  assert.equal(writes.update, undefined);
});
