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
import { WAVE1_HUB_SLUGS } from "../src/lib/hubs";

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

Ops statuses candidate, qa_pass, ready, review, and pending stay draft.
Only publish / published / live / approved / active / hero go live.
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
  const csv = `name,city,state,metro,metro_slug,services,bio,email,website,source_url,status,notes,growth_flag,license_id
"Gulf Sample Foundation",Houston,TX,Houston,houston,"foundation, pier_beam","A Houston clay sample shop.","desk@example.com",https://example.com/gulf-sample,https://example.com/source,candidate,"Steel piers first.",claimable,TX-FR-10001
Bayou Sample Encap,Houston,TX,Houston,houston,"encapsulation; waterproofing",,stay@example.com,example.com/bayou,,qa_pass,"Crawl-space liner.",claimable,TX-EN-20002
Draft Slab Shop,Austin,TX,Austin,austin,slab,"Draft row.",not-an-email,,,draft,,
Ops Publish Shop,Plano,TX,Dallas–Fort Worth,dallas-fort-worth,both,"Published ops row.",pub@example.com,,,publish,,claimable,TX-FR-30003
Ops Reject Shop,Tampa,FL,Tampa Bay,tampa,encapsulation,"Failed QA.",fail@example.com,,,qa_fail,,
`;
  const { rows } = parseCsv(csv);
  if (rows.length !== 5) throw new Error(`expected 5 rows, got ${rows.length}`);

  const candidate = mapRow(rows[0], 0);
  if ("error" in candidate) throw new Error(candidate.error);
  if (candidate.status !== "draft") throw new Error("candidate must NOT publish");
  if (candidate.type !== "contractor") throw new Error("expected contractor");
  if (candidate.claimable !== true) throw new Error("growth_flag claimable");
  if (!candidate.cityNames.includes("houston")) throw new Error("metro_slug houston");
  if (!candidate.metroSlugFromCsv) throw new Error("metro_slug preferred");
  if (candidate.primaryService !== "foundation") throw new Error("primary foundation");
  if (!candidate.services.includes("pier_beam")) throw new Error("badge pier_beam");
  if (candidate.founding !== false) throw new Error("founding defaults false");
  if (candidate.licenseId !== "TX-FR-10001") throw new Error("license_id");
  if (candidate.homeCity !== "Houston" || candidate.homeState !== "TX") throw new Error("city/state");

  const qaPass = mapRow(rows[1], 1);
  if ("error" in qaPass) throw new Error(qaPass.error);
  if (qaPass.status !== "draft") throw new Error("qa_pass must stay draft");
  if (qaPass.website !== "https://example.com/bayou") throw new Error("website protocol");
  if (qaPass.tagline !== "Crawl-space liner.") throw new Error("notes → tagline");
  if (qaPass.primaryService !== "encapsulation") throw new Error("primary encapsulation");
  if (qaPass.services.join(",") !== "waterproofing") throw new Error(`services ${qaPass.services}`);

  const draft = mapRow(rows[2], 2);
  if ("error" in draft) throw new Error(draft.error);
  if (draft.status !== "draft") throw new Error("draft should stay draft");
  if (!draft.contactEmail.endsWith("@example.com")) throw new Error("example.com fallback email");
  if (!draft.warnings.some((warning) => warning.includes("No contact email"))) {
    throw new Error("missing email warning");
  }

  const published = mapRow(rows[3], 3);
  if ("error" in published) throw new Error(published.error);
  if (published.status !== "published") throw new Error("publish must publish");
  if (published.primaryService !== "both") throw new Error("services both → primary");
  if (published.cityNames.join(",") !== "dallas-fort-worth") throw new Error("metro_slug DFW");
  if (
    !matchCity(published.cityNames[0], [
      { id: "1", slug: "dallas-fort-worth", name: "Dallas–Fort Worth" },
    ])
  ) {
    throw new Error("metro_slug must link Wave 1 DFW");
  }

  const rejected = mapRow(rows[4], 4);
  if ("error" in rejected) throw new Error(rejected.error);
  if (rejected.status !== "draft") throw new Error("qa_fail must insert as draft");
  if (rejected.claimable !== true) throw new Error("qa_fail stays claimable");
  if (rejected.cityNames.join(",") !== "tampa") throw new Error("metro_slug tampa");

  const alt = parseCsv(`Listing Name\tKind\tMetro\tServices\tStatus
Alias Contractor\tcontractor\tDFW\tFoundation repair; Slab\tREADY
`);
  const mappedAlt = mapRow(alt.rows[0], 0);
  if ("error" in mappedAlt) throw new Error(mappedAlt.error);
  if (mappedAlt.name !== "Alias Contractor") throw new Error("tab alias name");
  if (mappedAlt.type !== "contractor") throw new Error("type contractor");
  if (mappedAlt.status !== "draft") throw new Error("READY must stay draft");
  if (mappedAlt.primaryService !== "foundation" || !mappedAlt.services.includes("slab")) {
    throw new Error("service aliases");
  }

  const wave1 = WAVE1_HUB_SLUGS.map((slug, index) => ({
    id: String(index),
    slug,
    name: slug,
  }));
  if (!matchCity("dallas-fort-worth", wave1)) throw new Error("metro_slug dallas-fort-worth");
  if (!matchCity("tampa", wave1)) throw new Error("metro_slug tampa");
  if (!matchCity("st-louis", wave1)) throw new Error("metro_slug st-louis");
  if (!matchCity("Dallas", [{ id: "1", slug: "dallas-fort-worth", name: "Dallas–Fort Worth" }])) {
    throw new Error("alias Dallas");
  }
  if (!matchCity("Tampa Bay", [{ id: "2", slug: "tampa", name: "Tampa" }])) {
    throw new Error("alias Tampa Bay");
  }

  if (
    WAVE1_HUB_SLUGS.join(",") !==
    "houston,dallas-fort-worth,atlanta,tampa,chicago,charlotte,austin,st-louis"
  ) {
    throw new Error("Wave 1 seed order must be Houston → DFW → Atlanta → Tampa → Chicago …");
  }

  const samplePath = resolve(repoRoot, "data/hero-seed.sample.csv");
  const sample = parseCsv(readFileSync(samplePath, "utf8"));
  if (sample.rows.length < 5) throw new Error("sample CSV is too short");
  const mappedSample = sample.rows.map((row, index) => {
    const mapped = mapRow(row, index);
    if ("error" in mapped) throw new Error(mapped.error);
    return mapped;
  });
  const statuses = mappedSample.map((item) => item.status);
  if (!statuses.includes("published") || !statuses.includes("draft")) {
    throw new Error("sample CSV should include published and draft rows");
  }
  const candidateRow = sample.rows.find((row) => /candidate/i.test(row.status ?? ""));
  if (!candidateRow) throw new Error("sample CSV should include a candidate row");
  const candidateMapped = mapRow(candidateRow, 0);
  if ("error" in candidateMapped || candidateMapped.status !== "draft") {
    throw new Error("sample candidate row must stay draft");
  }
  if (candidateMapped.primaryService !== "foundation" || !candidateMapped.metroSlugFromCsv) {
    throw new Error("sample candidate should be foundation + metro_slug");
  }
  const publishRow = mappedSample.find((item) => item.status === "published");
  if (!publishRow?.metroSlugFromCsv || !WAVE1_HUB_SLUGS.includes(publishRow.cityNames[0] as (typeof WAVE1_HUB_SLUGS)[number])) {
    throw new Error("sample publish row must link a Wave 1 metro_slug");
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
