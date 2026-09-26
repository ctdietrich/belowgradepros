/**
 * Prisma CLI (`generate`, `migrate deploy`) needs DIRECT_URL when the schema
 * sets `directUrl`. Production app traffic may use the pooled host in
 * DATABASE_URL; migrations must stay on the direct host.
 *
 * If DIRECT_URL is unset, fall back to DATABASE_URL so a deploy that still
 * points DATABASE_URL at db.prisma.io (direct TCP) keeps working. The runtime
 * client rewrites that host itself and does not use this script.
 */
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

function loadEnvFile(path) {
  let text;
  try {
    text = readFileSync(path, "utf8");
  } catch {
    return;
  }
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
    if (process.env[key] !== undefined) continue;
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadEnvFile(".env");

if (!process.env.DIRECT_URL?.trim() && process.env.DATABASE_URL?.trim()) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("usage: node scripts/with-direct-url.mjs <command> [...args]");
  process.exit(1);
}

const [command, ...rest] = args;
const result = spawnSync(command, rest, { stdio: "inherit", env: process.env });
process.exit(result.status === null ? 1 : result.status);
