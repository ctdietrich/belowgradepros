import assert from "node:assert/strict";
import { test } from "node:test";
import { serverlessDatabaseUrl } from "./database-url";

const DIRECT =
  "postgres://user:p%40ss@db.prisma.io:5432/postgres?sslmode=require";

test("on Vercel, direct Prisma Postgres host becomes the pooled host with a 1-connection pool", () => {
  const next = serverlessDatabaseUrl(DIRECT, { vercel: true });
  assert.equal(
    next,
    "postgres://user:p%40ss@pooled.db.prisma.io:5432/postgres?sslmode=require&connection_limit=1&pool_timeout=20",
  );
});

test("does not rewrite an already pooled host and does not override existing pool params", () => {
  const pooled =
    "postgres://user:pass@pooled.db.prisma.io:5432/postgres?sslmode=require&connection_limit=4";
  const next = serverlessDatabaseUrl(pooled, { vercel: true });
  assert.equal(
    next,
    "postgres://user:pass@pooled.db.prisma.io:5432/postgres?sslmode=require&connection_limit=4&pool_timeout=20",
  );
});

test("leaves non-Vercel URLs unchanged so migrations and local dev keep the direct string", () => {
  assert.equal(serverlessDatabaseUrl(DIRECT, { vercel: false }), DIRECT);
  assert.equal(
    serverlessDatabaseUrl("postgresql://postgres:postgres@localhost:5432/belowgradepros", {
      vercel: true,
    }),
    "postgresql://postgres:postgres@localhost:5432/belowgradepros?connection_limit=1&pool_timeout=20",
  );
});

test("does not append pool params that are already present", () => {
  const url =
    "postgres://user:pass@db.prisma.io:5432/postgres?sslmode=require&connection_limit=1&pool_timeout=20";
  assert.equal(
    serverlessDatabaseUrl(url, { vercel: true }),
    "postgres://user:pass@pooled.db.prisma.io:5432/postgres?sslmode=require&connection_limit=1&pool_timeout=20",
  );
});
