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
  CITY_ALIASES,
  importListingsFromCsv,
  mapRow,
  matchCity,
  normalizePlace,
  parseCsv,
  summarizeImport,
  type ImportListingsOptions,
} from "../src/lib/import-listings";
import {
  DEPRIORITIZED_HUB_SLUGS,
  FL_ENCAP_HUB_SLUGS,
  HOMEPAGE_SERVICE_CHIPS,
  HOMEPAGE_STRIP_SLUGS,
  WAVE1_HUB_SLUGS,
  catalogCardChips,
  catalogCardHref,
  getWave1Hub,
  homepageCardChips,
  homepageCardHref,
  hubPageDescription,
  hubPageHeading,
  hubPageTitle,
} from "../src/lib/hubs";

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
  if (!matchCity("jacksonville", wave1)) throw new Error("metro_slug jacksonville");
  if (!matchCity("orlando", wave1)) throw new Error("metro_slug orlando");
  if (!matchCity("nashville", wave1)) throw new Error("metro_slug nashville");
  if (!matchCity("memphis", wave1)) throw new Error("metro_slug memphis");
  if (!matchCity("birmingham", wave1)) throw new Error("metro_slug birmingham");
  if (!matchCity("oklahoma-city", wave1)) throw new Error("metro_slug oklahoma-city");
  if (!matchCity("greenville-sc", wave1)) throw new Error("metro_slug greenville-sc");
  if (!matchCity("raleigh", wave1)) throw new Error("metro_slug raleigh");
  if (!matchCity("tulsa", wave1)) throw new Error("metro_slug tulsa");
  if (!matchCity("charleston-sc", wave1)) throw new Error("metro_slug charleston-sc");
  for (const slug of FL_ENCAP_HUB_SLUGS) {
    if (!matchCity(slug, wave1)) throw new Error(`metro_slug ${slug}`);
  }
  if (matchCity("miami", wave1)) throw new Error("Do not treat miami as a Wave 1 hub");
  if (matchCity("ft myers", wave1) || matchCity("wpb", wave1) || matchCity("ft lauderdale", wave1)) {
    throw new Error("Florida catalog hubs must use exact slugs, no aliases");
  }
  for (const needle of [
    "tallahassee",
    "pensacola",
    "fort myers",
    "ft myers",
    "sarasota",
    "west palm beach",
    "wpb",
    "fort lauderdale",
    "ft lauderdale",
    "daytona beach",
    "miami",
  ]) {
    if (CITY_ALIASES[normalizePlace(needle)]) {
      throw new Error(`Do not add an import alias for ${needle}`);
    }
  }
  if (!matchCity("OKC", wave1)) throw new Error("alias OKC");
  if (!matchCity("Charleston, SC", wave1)) throw new Error("alias Charleston, SC");
  if (!matchCity("Greenville SC", wave1)) throw new Error("alias Greenville SC");
  if (CITY_ALIASES[normalizePlace("charleston")]) {
    throw new Error("Do not alias bare charleston (WV) to charleston-sc");
  }
  if (CITY_ALIASES[normalizePlace("Charleston, SC")] !== "charleston-sc") {
    throw new Error("Charleston, SC must alias to charleston-sc");
  }
  if (!matchCity("Dallas", [{ id: "1", slug: "dallas-fort-worth", name: "Dallas–Fort Worth" }])) {
    throw new Error("alias Dallas");
  }
  if (!matchCity("Tampa Bay", [{ id: "2", slug: "tampa", name: "Tampa" }])) {
    throw new Error("alias Tampa Bay");
  }
  if (!matchCity("JAX", [{ id: "3", slug: "jacksonville", name: "Jacksonville" }])) {
    throw new Error("alias JAX");
  }

  if (
    HOMEPAGE_STRIP_SLUGS.join(",") !==
    "tampa,houston,atlanta,charlotte,jacksonville,orlando,nashville,dallas-fort-worth"
  ) {
    throw new Error("Homepage strip must be Tampa → Houston → Atlanta → Charlotte → JAX → Orlando → Nashville → DFW");
  }
  const hubSlugs = WAVE1_HUB_SLUGS as readonly string[];
  const stripSlugs = HOMEPAGE_STRIP_SLUGS as readonly string[];
  for (const slug of DEPRIORITIZED_HUB_SLUGS) {
    if (!hubSlugs.includes(slug)) throw new Error(`${slug} must remain a Wave 1 hub page`);
    if (stripSlugs.includes(slug)) throw new Error(`${slug} must stay off the homepage strip`);
  }
  if (hubSlugs.includes("miami")) {
    throw new Error("Do not auto-add Miami");
  }
  if (!hubSlugs.includes("jacksonville") || !hubSlugs.includes("orlando") || !hubSlugs.includes("nashville")) {
    throw new Error("Jacksonville, Orlando, and Nashville must exist as Wave 1 hubs");
  }
  for (const slug of [
    "memphis",
    "birmingham",
    "oklahoma-city",
    "greenville-sc",
    "raleigh",
    "tulsa",
    "charleston-sc",
    ...FL_ENCAP_HUB_SLUGS,
  ] as const) {
    if (!hubSlugs.includes(slug)) throw new Error(`${slug} must exist as a Wave 1 hub`);
    if (stripSlugs.includes(slug)) throw new Error(`${slug} must stay off the homepage strip`);
  }
  if (hubSlugs.includes("charleston")) {
    throw new Error("Charleston hub must be charleston-sc, not charleston");
  }
  if (FL_ENCAP_HUB_SLUGS.length !== 7) {
    throw new Error("Expected seven Florida encapsulation catalog hubs");
  }
  if (FL_ENCAP_HUB_SLUGS.includes("miami" as (typeof FL_ENCAP_HUB_SLUGS)[number])) {
    throw new Error("Fort Lauderdale is not a Miami desk");
  }
  for (const slug of FL_ENCAP_HUB_SLUGS) {
    if (catalogCardHref(slug) !== `/cities/${slug}?service=encapsulation`) {
      throw new Error(`${slug} catalog card must default to encapsulation`);
    }
    if (!catalogCardChips(slug).some((chip) => chip.href.endsWith("?service=foundation-repair"))) {
      throw new Error(`${slug} catalog card must keep a foundation chip`);
    }
  }
  const wave1d = [
    {
      slug: "tallahassee",
      title: "Tallahassee Crawl Space Encapsulation & Foundation",
      h1: "Tallahassee crawl space encapsulation and foundation contractors",
      description:
        "Tallahassee crawl space encapsulation and foundation repair. Humid crawl, settling, cracks. Inquire on BelowGradePros.",
    },
    {
      slug: "pensacola",
      title: "Pensacola Crawl Space Encapsulation & Foundation",
      h1: "Pensacola crawl space encapsulation and foundation contractors",
      description:
        "Pensacola crawl space encapsulation and foundation repair. Coastal humidity, musty crawl, settling. Inquire on BelowGradePros.",
    },
    {
      slug: "fort-myers",
      title: "Fort Myers Crawl Space Encapsulation & Foundation",
      h1: "Fort Myers crawl space encapsulation and foundation contractors",
      description:
        "Fort Myers crawl space encapsulation and foundation repair. Humid crawl, settling, cracks. Inquire on BelowGradePros.",
    },
    {
      slug: "sarasota",
      title: "Sarasota Crawl Space Encapsulation & Foundation",
      h1: "Sarasota crawl space encapsulation and foundation contractors",
      description:
        "Sarasota crawl space encapsulation and foundation repair. Gulf humidity, musty crawl, settling. Inquire on BelowGradePros.",
    },
    {
      slug: "west-palm-beach",
      title: "West Palm Beach Crawl Space Encapsulation & Foundation",
      h1: "West Palm Beach crawl space encapsulation and foundation contractors",
      description:
        "West Palm Beach crawl space encapsulation and foundation repair. Humid crawl, settling. Inquire on BelowGradePros.",
    },
    {
      slug: "fort-lauderdale",
      title: "Fort Lauderdale Crawl Space Encapsulation & Foundation",
      h1: "Fort Lauderdale crawl space encapsulation and foundation contractors",
      description:
        "Fort Lauderdale crawl space encapsulation and foundation repair. Broward humidity, musty crawl, settling. Inquire on BelowGradePros.",
    },
    {
      slug: "daytona-beach",
      title: "Daytona Beach Crawl Space Encapsulation & Foundation",
      h1: "Daytona Beach crawl space encapsulation and foundation contractors",
      description:
        "Daytona Beach crawl space encapsulation and foundation repair. Coastal humidity, musty crawl, settling. Inquire on BelowGradePros.",
    },
  ] as const;
  for (const hub of wave1d) {
    if (hubPageTitle(hub.slug) !== hub.title) throw new Error(`${hub.slug} title must match SEO Wave 1d`);
    if (hubPageHeading(hub.slug) !== hub.h1) throw new Error(`${hub.slug} H1 must match SEO Wave 1d`);
    if (hubPageDescription(hub.slug) !== hub.description) {
      throw new Error(`${hub.slug} meta description must match SEO Wave 1d`);
    }
  }
  if (hubPageHeading("west-palm-beach").includes("WPB")) {
    throw new Error("West Palm Beach H1 must use the full name, not WPB");
  }
  if (hubPageDescription("fort-lauderdale").toLowerCase().includes("miami")) {
    throw new Error("Fort Lauderdale copy must not treat the desk as Miami");
  }
  if (hubPageTitle("memphis") !== "Memphis Foundation Repair & Crawl Encapsulation") {
    throw new Error("Memphis hub title must match SEO Wave 1c");
  }
  if (hubPageHeading("memphis") !== "Memphis foundation repair and crawl space contractors") {
    throw new Error("Memphis H1 must match SEO Wave 1c");
  }
  if (
    hubPageDescription("memphis") !==
    "Memphis foundation repair and crawl space encapsulation contractors. Settling, cracks, musty crawl. Inquire on BelowGradePros."
  ) {
    throw new Error("Memphis meta description must match SEO Wave 1c");
  }
  if (hubPageTitle("birmingham") !== "Birmingham Crawl Space Encapsulation & Foundation") {
    throw new Error("Birmingham hub title must match SEO Wave 1c");
  }
  if (hubPageHeading("birmingham") !== "Birmingham crawl space encapsulation and foundation contractors") {
    throw new Error("Birmingham H1 must match SEO Wave 1c");
  }
  if (
    hubPageDescription("birmingham") !==
    "Birmingham crawl space encapsulation and foundation repair. Musty crawl, settling, cracks. Inquire on BelowGradePros."
  ) {
    throw new Error("Birmingham meta description must match SEO Wave 1c");
  }
  if (hubPageTitle("oklahoma-city") !== "Oklahoma City Foundation Repair Contractors") {
    throw new Error("Oklahoma City hub title must match SEO Wave 1c");
  }
  if (hubPageHeading("oklahoma-city") !== "Oklahoma City foundation repair contractors") {
    throw new Error("Oklahoma City H1 must match SEO Wave 1c");
  }
  if (
    hubPageDescription("oklahoma-city") !==
    "Oklahoma City foundation repair for clay soils, settling, and cracks. Compare contractors on BelowGradePros."
  ) {
    throw new Error("Oklahoma City meta description must match SEO Wave 1c");
  }
  if (getWave1Hub("greenville-sc")?.name !== "Greenville, SC") {
    throw new Error("Greenville display name must be Greenville, SC");
  }
  if (hubPageTitle("greenville-sc") !== "Greenville SC Crawl Space Encapsulation & Foundation") {
    throw new Error("Greenville SC hub title must match SEO Wave 1c");
  }
  if (hubPageHeading("greenville-sc") !== "Greenville, SC crawl space encapsulation and foundation contractors") {
    throw new Error("Greenville SC H1 must match SEO Wave 1c");
  }
  if (
    hubPageDescription("greenville-sc") !==
    "Greenville, SC crawl space encapsulation and foundation repair. Musty crawl, settling. Inquire on BelowGradePros."
  ) {
    throw new Error("Greenville SC meta description must match SEO Wave 1c");
  }
  if (hubPageTitle("raleigh") !== "Raleigh Foundation Repair & Crawl Encapsulation") {
    throw new Error("Raleigh hub title must match SEO Wave 1c");
  }
  if (hubPageHeading("raleigh") !== "Raleigh foundation repair and crawl space contractors") {
    throw new Error("Raleigh H1 must match SEO Wave 1c");
  }
  if (
    hubPageDescription("raleigh") !==
    "Raleigh foundation repair and crawl space encapsulation. Clay soils, settling, musty crawl. Inquire on BelowGradePros."
  ) {
    throw new Error("Raleigh meta description must match SEO Wave 1c");
  }
  if (hubPageTitle("tulsa") !== "Tulsa Foundation Repair Contractors") {
    throw new Error("Tulsa hub title must match SEO Wave 1c");
  }
  if (hubPageHeading("tulsa") !== "Tulsa foundation repair contractors") {
    throw new Error("Tulsa H1 must match SEO Wave 1c");
  }
  if (
    hubPageDescription("tulsa") !==
    "Tulsa foundation repair for clay soils, settling, and cracks. Compare contractors on BelowGradePros."
  ) {
    throw new Error("Tulsa meta description must match SEO Wave 1c");
  }
  if (getWave1Hub("charleston-sc")?.name !== "Charleston, SC") {
    throw new Error("Charleston display name must be Charleston, SC");
  }
  if (hubPageTitle("charleston-sc") !== "Charleston SC Crawl Space Encapsulation & Foundation") {
    throw new Error("Charleston SC hub title must match SEO Wave 1c");
  }
  if (hubPageHeading("charleston-sc") !== "Charleston, SC crawl space encapsulation and foundation contractors") {
    throw new Error("Charleston SC H1 must match SEO Wave 1c");
  }
  if (
    hubPageDescription("charleston-sc") !==
    "Charleston, SC crawl space encapsulation and foundation repair. Coastal humidity, musty crawl, settling. Inquire on BelowGradePros."
  ) {
    throw new Error("Charleston SC meta description must match SEO Wave 1c");
  }
  if (catalogCardHref("charleston-sc") !== "/cities/charleston-sc?service=encapsulation") {
    throw new Error("Charleston SC catalog card must default to encapsulation");
  }
  if (!catalogCardChips("charleston-sc").some((chip) => chip.href.endsWith("?service=foundation-repair"))) {
    throw new Error("Charleston SC catalog card must keep a foundation chip");
  }
  if (HOMEPAGE_SERVICE_CHIPS[0]?.href !== "/cities/tampa?service=encapsulation") {
    throw new Error("Encapsulation chip must target Tampa encapsulation");
  }
  if (HOMEPAGE_SERVICE_CHIPS[1]?.href !== "/cities/houston?service=foundation-repair") {
    throw new Error("Foundation chip must target Houston foundation-repair");
  }
  if (HOMEPAGE_SERVICE_CHIPS[2]?.href !== "/cities/dallas-fort-worth") {
    throw new Error("Pier & beam chip must target DFW hub");
  }
  if (homepageCardHref("tampa") !== "/cities/tampa?service=encapsulation") {
    throw new Error("Tampa strip card must default to encapsulation");
  }
  if (homepageCardHref("houston") !== "/cities/houston?service=encapsulation") {
    throw new Error("Houston strip card must default to encapsulation");
  }
  if (homepageCardHref("dallas-fort-worth") !== "/cities/dallas-fort-worth?service=foundation-repair") {
    throw new Error("DFW strip card must default to foundation-repair");
  }
  if (!homepageCardChips("tampa").some((chip) => chip.href.endsWith("?service=foundation-repair"))) {
    throw new Error("Tampa must keep a foundation chip");
  }
  if (!homepageCardChips("dallas-fort-worth").some((chip) => chip.label === "Pier & beam")) {
    throw new Error("DFW must keep a pier & beam chip");
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
