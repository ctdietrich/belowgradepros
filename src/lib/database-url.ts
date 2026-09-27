/**
 * Runtime Postgres URL for the Vercel serverless client.
 *
 * Prisma Postgres (db.prisma.io) gives each role a small direct-connection cap.
 * Application traffic has to use the pooled host (`pooled.db.prisma.io`). Migrations
 * stay on the direct URL via `DIRECT_URL` / `directUrl` — this helper is only
 * applied to the PrismaClient in `src/lib/prisma.ts`, never to `process.env.DATABASE_URL`.
 *
 * Prisma 6's pool size defaults to `num_physical_cpus * 2 + 1`. On Vercel that
 * count is the host's, so each isolate can open many TCP connections. Cap it.
 */

const PRISMA_DIRECT_HOST =
  /^(postgres(?:ql)?:\/\/(?:[^/?#]*@)?)db\.prisma\.io(?=[:/?#]|$)/i;

function hasParam(url: string, key: string) {
  return new RegExp(`[?&]${key}=`).test(url);
}

function appendParam(url: string, key: string, value: string) {
  if (hasParam(url, key)) return url;
  const hashIndex = url.indexOf("#");
  const hash = hashIndex === -1 ? "" : url.slice(hashIndex);
  const base = hashIndex === -1 ? url : url.slice(0, hashIndex);
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}${key}=${value}${hash}`;
}

export function serverlessDatabaseUrl(
  databaseUrl: string,
  options?: { vercel?: boolean },
): string {
  const onVercel = options?.vercel ?? Boolean(process.env.VERCEL);
  if (!onVercel || !databaseUrl) return databaseUrl;

  const pooled = databaseUrl.replace(PRISMA_DIRECT_HOST, "$1pooled.db.prisma.io");
  return appendParam(appendParam(pooled, "connection_limit", "1"), "pool_timeout", "20");
}
