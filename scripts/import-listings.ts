/**
 * Import curated listing rows from a CSV into the Prisma Listing model.
 *
 *   npm run import:listings -- data/hero-seed.sample.csv --dry-run
 *   DATABASE_URL="postgresql://…" npm run import:listings -- /path/to/hero.csv
 *
 * Production ops can also upload the same CSV at /admin/import (ADMIN_PASSWORD session).
 * See docs/import-listings.md for columns, aliases, and production notes.
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { PrismaClient } from "@prisma/client";
import {
  importListingsFromCsv,
  mapRow,
  matchCity,
  parseCsv,
  summarizeImport,
  type ImportListingsOptions,
} from "../src/lib/import-listings";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

export type ImportFlags = ImportListingsOptions & {
  help: boolean;
  selfTest: boolean;
  file?: string;
};

export function loadDotEnv(root = repoRoot) {
  for (const file of [".env.local", ".env"]) {
    const path = resolve(root, file);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  }
}

export function parseArgs(argv: string[]): ImportFlags {
  const flags: ImportFlags = {
    dryRun: false,
    insertOnly: false,
    createCities: true,
    help: false,
    selfTest: false,
  };

  for (const arg of argv) {
    if (arg === "--dry-run") flags.dryRun = true;
    else if (arg === "--insert-only") flags.insertOnly = true;
    else if (arg === "--no-create-destinations" || arg === "--no-create-cities") flags.createCities = false;
    else if (arg === "--help" || arg === "-h") flags.help = true;
    else if (arg === "--self-test") flags.selfTest = true;
    else if (!arg.startsWith("-")) flags.file = arg;
    else throw new Error(`Unknown flag: ${arg}`);
  }
  return flags;
}

export function helpText() {
  return `Import curated listings from a CSV into Postgres (Prisma Listing).

Usage:
  npm run import:listings -- <file.csv> [--dry-run] [--insert-only] [--no-create-cities]

On Vercel production, prefer the signed-in desk at /admin/import instead of copying DATABASE_URL.

Options:
  --dry-run                 Parse and report without writing
  --insert-only             Skip rows whose slug or name already exists
  --no-create-cities        Fail the row if a metro cannot be matched
  --self-test               Run built-in mapping tests
  --help                    Show this message

Hero-ops statuses candidate and ready are stored as published.
Do not run npm run seed against production after an import (seed wipes listings).
`;
}

export async function importListings(filePath: string, flags: ImportFlags) {
  const absolute = resolve(filePath);
  if (!existsSync(absolute)) throw new Error(`CSV not found: ${absolute}`);

  const prisma = process.env.DATABASE_URL ? new PrismaClient() : null;
  try {
    return await importListingsFromCsv(readFileSync(absolute, "utf8"), {
      dryRun: flags.dryRun,
      insertOnly: flags.insertOnly,
      createCities: flags.createCities,
      prisma,
      log: console.log,
    });
  } finally {
    await prisma?.$disconnect();
  }
}

export function runSelfTests() {
  const csv = `name,city,state,metro,services,bio,contact_email,website,source_url,status,notes,claimable,license_id
"Gulf Sample Foundation",Houston,TX,Houston,"foundation_repair, pier_beam","A Houston clay sample shop.","desk@example.com",https://example.com/gulf-sample,https://example.com/source,candidate,"Steel piers first.",yes,TX-FR-10001
Bayou Sample Encap,Houston,TX,Houston,"encapsulation; waterproofing",,stay@example.com,example.com/bayou,,ready,"Crawl-space liner.",true,TX-EN-20002
Draft Slab Shop,Austin,TX,Austin,slab,"Draft row.",not-an-email,,,draft,,
`;
  const { rows } = parseCsv(csv);
  if (rows.length !== 3) throw new Error(`expected 3 rows, got ${rows.length}`);

  const candidate = mapRow(rows[0], 0);
  if ("error" in candidate) throw new Error(candidate.error);
  if (candidate.status !== "published") throw new Error("candidate should publish");
  if (candidate.type !== "contractor") throw new Error("expected contractor");
  if (candidate.claimable !== true) throw new Error("claimable yes");
  if (!candidate.cityNames.includes("Houston")) throw new Error("metro");
  if (!candidate.services.includes("foundation_repair")) throw new Error("service flag");
  if (candidate.licenseId !== "TX-FR-10001") throw new Error("license_id");
  if (candidate.homeCity !== "Houston" || candidate.homeState !== "TX") throw new Error("city/state");

  const ready = mapRow(rows[1], 1);
  if ("error" in ready) throw new Error(ready.error);
  if (ready.status !== "published") throw new Error("ready should publish");
  if (ready.website !== "https://example.com/bayou") throw new Error("website protocol");
  if (ready.tagline !== "Crawl-space liner.") throw new Error("notes → tagline");
  if (ready.services.join(",") !== "encapsulation,waterproofing") throw new Error(`services ${ready.services}`);

  const draft = mapRow(rows[2], 2);
  if ("error" in draft) throw new Error(draft.error);
  if (draft.status !== "draft") throw new Error("draft should stay draft");
  if (!draft.contactEmail.endsWith("@example.com")) throw new Error("example.com fallback email");
  if (!draft.warnings.some((warning) => warning.includes("No contact email"))) {
    throw new Error("missing email warning");
  }

  const alt = parseCsv(`Listing Name\tKind\tMetro\tServices\tStatus
Alias Contractor\tcontractor\tDFW\tFoundation repair; Slab\tREADY
`);
  const mappedAlt = mapRow(alt.rows[0], 0);
  if ("error" in mappedAlt) throw new Error(mappedAlt.error);
  if (mappedAlt.name !== "Alias Contractor") throw new Error("tab alias name");
  if (mappedAlt.type !== "contractor") throw new Error("type contractor");
  if (mappedAlt.status !== "published") throw new Error("READY → published");
  if (!mappedAlt.services.includes("foundation_repair") || !mappedAlt.services.includes("slab")) {
    throw new Error("service aliases");
  }

  if (!matchCity("Dallas", [{ id: "1", slug: "dallas-fort-worth", name: "Dallas–Fort Worth" }])) {
    throw new Error("alias Dallas");
  }

  const samplePath = resolve(repoRoot, "data/hero-seed.sample.csv");
  const sample = parseCsv(readFileSync(samplePath, "utf8"));
  if (sample.rows.length < 5) throw new Error("sample CSV is too short");
  const statuses = sample.rows.map((row, index) => {
    const mapped = mapRow(row, index);
    if ("error" in mapped) throw new Error(mapped.error);
    return mapped.status;
  });
  if (!statuses.includes("published") || !statuses.includes("draft")) {
    throw new Error("sample CSV should include published and draft rows");
  }
  const candidateRow = sample.rows.find((row) => /candidate/i.test(row.status ?? ""));
  if (!candidateRow) throw new Error("sample CSV should include a candidate row");
  const candidateMapped = mapRow(candidateRow, 0);
  if ("error" in candidateMapped || candidateMapped.status !== "published") {
    throw new Error("sample candidate row must publish");
  }
  if (sample.rows.some((row) => {
    const email = (row.contact_email || row.email || "").toLowerCase();
    return email && !email.endsWith("@example.com");
  })) {
    throw new Error("sample CSV must use example.com emails only");
  }

  console.log("import-listings self-test: ok");
}

async function main() {
  loadDotEnv();
  let flags: ImportFlags;
  try {
    flags = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
    return;
  }

  if (flags.selfTest) {
    runSelfTests();
    return;
  }
  if (flags.help || !flags.file) {
    console.log(helpText());
    if (!flags.file && !flags.help) process.exitCode = 1;
    return;
  }

  const result = await importListings(flags.file, flags);
  console.log(summarizeImport(result, Boolean(flags.dryRun)));
  if (result.warnings.length) {
    console.log("Warnings:");
    for (const warning of result.warnings) console.log(`  - ${warning}`);
  }
  if (result.errors.length) {
    console.error("Errors:");
    for (const error of result.errors) console.error(`  - ${error}`);
    process.exitCode = 1;
  }
}

const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (invokedDirectly) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
