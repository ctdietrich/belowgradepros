/**
 * Shared CSV → Listing upsert used by the CLI (`scripts/import-listings.ts`)
 * and the authenticated admin upload at `/admin/import`.
 */

import type { PrismaClient } from "@prisma/client";
import {
  normalizeAdditionalService,
  normalizePrimaryService,
  normalizeServiceKey,
  type AdditionalServiceKey,
  type PrimaryServiceKey,
} from "./config";
import { isRejectListingStatus, normalizeListingStatus } from "./listing-status";

export type ListingType = "contractor";

export type MappedListing = {
  slug: string;
  slugFromCsv: boolean;
  type: ListingType;
  name: string;
  tagline: string | null;
  bio: string;
  contactEmail: string;
  website: string | null;
  phone: string | null;
  homeCity: string | null;
  homeState: string | null;
  licenseId: string | null;
  photos: string[];
  primaryService: PrimaryServiceKey;
  services: AdditionalServiceKey[];
  featured: boolean;
  founding: boolean;
  verified: boolean;
  status: "published" | "draft";
  sourceUrl: string | null;
  claimable: boolean;
  cityNames: string[];
  metroSlugFromCsv: boolean;
  region?: string;
  notes?: string;
  photoPolicy?: string;
  growthFlag?: string;
  warnings: string[];
};

export type ImportListingsOptions = {
  dryRun?: boolean;
  insertOnly?: boolean;
  createCities?: boolean;
  prisma?: PrismaClient | null;
  log?: (message: string) => void;
};

export type ImportResult = {
  created: string[];
  updated: string[];
  skipped: string[];
  errors: string[];
  warnings: string[];
  total: number;
};

const NAME_KEYS = ["name", "listing", "listing_name", "business", "business_name", "title", "operator", "contractor"];
const TYPE_KEYS = ["type", "listing_type", "kind", "category", "operator_type"];
const METRO_KEYS = ["metro", "metros", "hub", "city_hub", "destination", "destinations", "dest", "location", "place"];
const METRO_SLUG_KEYS = ["metro_slug", "metroslug", "city_slug", "hub_slug"];
const CITY_KEYS = ["city", "home_city", "locality"];
const STATE_KEYS = ["state", "home_state", "st"];
const SERVICE_KEYS_CSV = ["services", "service", "service_flags", "flags", "species"];
const BIO_KEYS = ["bio", "description", "about", "blurb", "summary", "writeup"];
const EMAIL_KEYS = ["contact_email", "contactemail", "email", "e_mail"];
const CONTACT_KEYS = ["contact"];
const WEBSITE_KEYS = ["website", "url", "web", "site", "homepage"];
const PHONE_KEYS = ["phone", "telephone", "tel", "mobile"];
const SOURCE_KEYS = ["source_url", "sourceurl", "source", "sourced_from", "attribution"];
const STATUS_KEYS = ["status", "publish_status", "listing_status"];
const NOTES_KEYS = ["notes", "note", "internal_notes", "ops_notes"];
const CLAIMABLE_KEYS = ["claimable", "claim", "can_claim"];
const GROWTH_FLAG_KEYS = ["growth_flag", "growthflag", "growth", "flags_ops"];
const PHOTO_POLICY_KEYS = ["photo_policy", "photopolicy"];
const PRIMARY_KEYS = ["primary", "primary_service", "focus", "desk"];
const FOUNDING_KEYS = ["founding", "founding_listing", "paid"];
const FEATURED_KEYS = ["featured", "feature", "hero"];
const VERIFIED_KEYS = ["verified", "verify"];
const SLUG_KEYS = ["slug", "permalink", "handle"];
const TAGLINE_KEYS = ["tagline", "subtitle", "headline"];
const PHOTOS_KEYS = ["photos", "photo", "images", "image", "photo_urls"];
const REGION_KEYS = ["region", "area"];
const LICENSE_KEYS = ["license_id", "licenseid", "license", "license_no", "license_number"];

/** Common ops-folder names → seed slugs. */
export const CITY_ALIASES: Record<string, string> = {
  houston: "houston",
  "houston tx": "houston",
  "greater houston": "houston",
  "dallas fort worth": "dallas-fort-worth",
  dallas: "dallas-fort-worth",
  dfw: "dallas-fort-worth",
  "fort worth": "dallas-fort-worth",
  "dallas tx": "dallas-fort-worth",
  atlanta: "atlanta",
  "atlanta ga": "atlanta",
  "metro atlanta": "atlanta",
  tampa: "tampa",
  "tampa fl": "tampa",
  "tampa bay": "tampa",
  "st petersburg": "tampa",
  "saint petersburg": "tampa",
  chicago: "chicago",
  "chicago il": "chicago",
  "chicagoland": "chicago",
  charlotte: "charlotte",
  "charlotte nc": "charlotte",
  clt: "charlotte",
  austin: "austin",
  "austin tx": "austin",
  "st louis": "st-louis",
  "saint louis": "st-louis",
  "st louis mo": "st-louis",
  jacksonville: "jacksonville",
  "jacksonville fl": "jacksonville",
  jax: "jacksonville",
  orlando: "orlando",
  "orlando fl": "orlando",
  nashville: "nashville",
  "nashville tn": "nashville",
};

export const MAX_IMPORT_CSV_BYTES = 2 * 1024 * 1024;

export function normalizeHeader(value: string) {
  return value
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
    .replace(/[^\w]/g, "");
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export function normalizePlace(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function detectDelimiter(text: string) {
  const line = text.split(/\r?\n/).find((row) => row.trim()) ?? "";
  const counts = { ",": 0, "\t": 0, ";": 0 };
  let inQuotes = false;
  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (!inQuotes && char in counts) counts[char as keyof typeof counts] += 1;
  }
  const winner = (Object.entries(counts) as [string, number][]).sort((a, b) => b[1] - a[1])[0];
  return winner && winner[1] > 0 ? winner[0] : ",";
}

export function parseCsv(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const source = text.replace(/^\uFEFF/, "");
  const delimiter = detectDelimiter(source);
  const records: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  const pushField = () => {
    row.push(field);
    field = "";
  };
  const pushRow = () => {
    if (row.some((cell) => cell.trim())) records.push(row);
    row = [];
  };

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    const next = source[i + 1];
    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      inQuotes = true;
      continue;
    }
    if (char === delimiter) {
      pushField();
      continue;
    }
    if (char === "\n") {
      pushField();
      pushRow();
      continue;
    }
    if (char === "\r") continue;
    field += char;
  }
  if (field.length || row.length) {
    pushField();
    pushRow();
  }

  if (!records.length) return { headers: [], rows: [] };

  const headers = records[0].map(normalizeHeader);
  const rows = records.slice(1).map((record) => {
    const mapped: Record<string, string> = {};
    headers.forEach((header, index) => {
      if (!header) return;
      const value = (record[index] ?? "").trim();
      if (mapped[header] && !value) return;
      mapped[header] = value;
    });
    return mapped;
  });

  return { headers, rows };
}

export function getField(row: Record<string, string>, keys: string[]) {
  for (const key of keys) {
    const value = row[normalizeHeader(key)];
    if (value?.trim()) return value.trim();
  }
  return "";
}

export function parseBoolean(value: string, fallback: boolean) {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "y", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "n", "off"].includes(normalized)) return false;
  return fallback;
}

export function parseList(value: string) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (Array.isArray(parsed)) {
      return parsed
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  } catch {
    /* comma / semicolon list */
  }
  return value
    .split(/[;|]/)
    .flatMap((part) => part.split(","))
    .map((item) => item.trim())
    .filter(Boolean);
}

export function inferListingType(raw: string): ListingType {
  const value = raw.trim().toLowerCase();
  if (value && value !== "contractor") {
    /* single-type directory; ignore unknown type labels */
  }
  return "contractor";
}

export function parseServices(value: string): {
  primaryHints: PrimaryServiceKey[];
  services: AdditionalServiceKey[];
  unknown: string[];
} {
  const unknown: string[] = [];
  const primaryHints: PrimaryServiceKey[] = [];
  const services: AdditionalServiceKey[] = [];
  for (const item of parseList(value)) {
    const primary = normalizePrimaryService(item);
    if (primary) {
      if (!primaryHints.includes(primary)) primaryHints.push(primary);
      continue;
    }
    const badge = normalizeAdditionalService(item);
    if (badge) {
      if (!services.includes(badge)) services.push(badge);
    } else if (normalizeServiceKey(item)) {
      /* already handled */
    } else {
      unknown.push(item);
    }
  }
  return { primaryHints, services, unknown };
}

export function inferPrimaryService(
  explicit: string,
  hints: PrimaryServiceKey[],
): PrimaryServiceKey {
  const fromField = normalizePrimaryService(explicit);
  if (fromField) return fromField;
  const hasFoundation = hints.includes("foundation") || hints.includes("both");
  const hasEncap = hints.includes("encapsulation") || hints.includes("both");
  if (hints.includes("both") || (hasFoundation && hasEncap)) return "both";
  if (hasEncap) return "encapsulation";
  return "foundation";
}

function looksLikeEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeWebsite(value: string) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[\w.-]+\.[a-z]{2,}([/:?#].*)?$/i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

export function splitMetros(value: string): string[] {
  if (!value) return [];
  const full = value.trim();
  if (CITY_ALIASES[normalizePlace(full)]) return [full];

  const primary = full
    .split(/\s*;\s*|\s*\|\s*|\s+&\s+|\s+and\s+/i)
    .map((part) => part.trim())
    .filter(Boolean);
  if (primary.length > 1) return primary;

  const comma = full.split(",").map((part) => part.trim()).filter(Boolean);
  if (comma.length > 1 && comma.every((part) => part.length < 48)) {
    const places = comma.filter((part) => !/^(tx|fl|ga|il|nc|mo|texas|florida|georgia|illinois|missouri|us|usa)$/i.test(part));
    return places.length ? places : [full];
  }
  return [full];
}

export function mapRow(row: Record<string, string>, index: number): MappedListing | { error: string } {
  const warnings: string[] = [];
  const name = getField(row, NAME_KEYS);
  if (!name) return { error: `Row ${index + 2}: missing name` };

  const type = inferListingType(getField(row, TYPE_KEYS));
  const csvSlug = getField(row, SLUG_KEYS);
  const slug = slugify(csvSlug || name);
  if (!slug) return { error: `Row ${index + 2}: could not build a slug for "${name}"` };

  const metroSlug = getField(row, METRO_SLUG_KEYS);
  const metroValue = getField(row, METRO_KEYS);
  const homeCity = getField(row, CITY_KEYS) || null;
  const homeState = getField(row, STATE_KEYS) || null;
  const metroSlugFromCsv = Boolean(metroSlug);
  const cityNames = metroSlug
    ? parseList(metroSlug).flatMap((item) => splitMetros(item))
    : splitMetros(metroValue || homeCity || "");
  if (!cityNames.length) warnings.push(`No metro for "${name}"`);
  const photoPolicy = getField(row, PHOTO_POLICY_KEYS) || undefined;
  const growthFlag = getField(row, GROWTH_FLAG_KEYS);

  const notes = getField(row, NOTES_KEYS);
  const tagline = getField(row, TAGLINE_KEYS) || notes || null;
  const { primaryHints, services, unknown } = parseServices(getField(row, SERVICE_KEYS_CSV));
  const primaryService = inferPrimaryService(getField(row, PRIMARY_KEYS), primaryHints);
  if (unknown.length) warnings.push(`Unknown services for "${name}": ${unknown.join(", ")}`);

  const photos = parseList(getField(row, PHOTOS_KEYS));
  const bio =
    getField(row, BIO_KEYS) ||
    notes ||
    `${name} is a foundation and encapsulation contractor${cityNames[0] ? ` in ${cityNames[0]}` : ""}.`;

  if (!getField(row, BIO_KEYS)) warnings.push(`Generated bio for "${name}"`);

  const emailField = getField(row, EMAIL_KEYS);
  const contactField = getField(row, CONTACT_KEYS);
  let contactEmail = "";
  if (looksLikeEmail(emailField)) contactEmail = emailField.toLowerCase();
  else if (looksLikeEmail(contactField)) contactEmail = contactField.toLowerCase();
  else if (emailField) warnings.push(`Ignored invalid email "${emailField}"`);

  if (!contactEmail) {
    contactEmail = `${slug.replace(/-/g, ".")}@example.com`;
    warnings.push(`No contact email for "${name}"; using ${contactEmail}`);
  }

  const website = normalizeWebsite(getField(row, WEBSITE_KEYS));
  const sourceUrl = normalizeWebsite(getField(row, SOURCE_KEYS)) || website;
  const phone = getField(row, PHONE_KEYS) || (!looksLikeEmail(contactField) ? contactField : "") || null;
  const licenseId = getField(row, LICENSE_KEYS) || null;
  const rawStatus = getField(row, STATUS_KEYS);
  const status = normalizeListingStatus(rawStatus, "draft");
  const growthTokens = parseList(growthFlag).map((item) => item.trim().toLowerCase());
  const growthClaimable = growthTokens.some((item) => item === "claimable" || item === "claim");
  const claimable = isRejectListingStatus(rawStatus)
    ? true
    : growthClaimable || parseBoolean(getField(row, CLAIMABLE_KEYS), true);

  return {
    slug,
    slugFromCsv: Boolean(csvSlug),
    type,
    name,
    tagline,
    bio,
    contactEmail,
    website,
    phone,
    homeCity,
    homeState,
    licenseId,
    photos,
    primaryService,
    services,
    featured: parseBoolean(getField(row, FEATURED_KEYS), false),
    founding: parseBoolean(getField(row, FOUNDING_KEYS), false),
    verified: parseBoolean(getField(row, VERIFIED_KEYS), false),
    status,
    sourceUrl,
    claimable,
    cityNames,
    metroSlugFromCsv,
    region: getField(row, REGION_KEYS) || undefined,
    notes: notes || undefined,
    photoPolicy,
    growthFlag: growthFlag || undefined,
    warnings,
  };
}

type CityRecord = { id: string; slug: string; name: string };

export function matchCity(name: string, cities: CityRecord[]): CityRecord | undefined {
  const raw = name.trim();
  if (!raw) return undefined;
  const slugNeedle = raw.toLowerCase();
  const bySlug = cities.find((city) => city.slug === slugNeedle);
  if (bySlug) return bySlug;

  const needle = normalizePlace(name);
  if (!needle) return undefined;

  const aliasSlug = CITY_ALIASES[needle];
  if (aliasSlug) {
    const byAlias = cities.find((city) => city.slug === aliasSlug);
    if (byAlias) return byAlias;
  }

  return cities.find((city) => {
    const slug = normalizePlace(city.slug.replace(/-/g, " "));
    const label = normalizePlace(city.name);
    return slug === needle || label === needle;
  });
}

async function resolveCity(
  prisma: PrismaClient | null,
  cache: CityRecord[],
  listing: MappedListing,
  name: string,
  createCities: boolean,
  dryRun: boolean,
) {
  const existing = matchCity(name, cache);
  if (existing) return existing;
  if (!createCities) return undefined;

  const slug = CITY_ALIASES[normalizePlace(name)] || slugify(name);
  const already = cache.find((city) => city.slug === slug);
  if (already) return already;
  if (dryRun || !prisma) {
    const preview = {
      id: `dry-${slug}`,
      slug,
      name,
    };
    cache.push(preview);
    return preview;
  }

  const created = await prisma.city.create({
    data: {
      slug,
      name,
      state: listing.homeState || "US",
      region: listing.region || listing.homeState || name,
      description: `${name} — added from listing import.`,
      sortOrder: 99,
    },
    select: { id: true, slug: true, name: true },
  });
  cache.push(created);
  return created;
}

function listingFields(listing: MappedListing) {
  return {
    type: listing.type,
    name: listing.name,
    tagline: listing.tagline,
    bio: listing.bio,
    contactEmail: listing.contactEmail,
    website: listing.website,
    phone: listing.phone,
    homeCity: listing.homeCity,
    homeState: listing.homeState,
    licenseId: listing.licenseId,
    photos: listing.photos,
    primaryService: listing.primaryService,
    services: listing.services,
    featured: listing.featured,
    founding: listing.founding,
    verified: listing.verified,
    status: listing.status,
    sourceUrl: listing.sourceUrl,
    claimable: listing.claimable,
  };
}

export async function importListingsFromCsv(
  csvText: string,
  options: ImportListingsOptions = {},
): Promise<ImportResult> {
  const dryRun = Boolean(options.dryRun);
  const insertOnly = Boolean(options.insertOnly);
  const createCities = options.createCities !== false;
  const prisma = options.prisma ?? null;
  const log = options.log;

  if (!prisma && !dryRun) {
    throw new Error("DATABASE_URL is not set. Point it at the target Postgres database.");
  }

  const { rows } = parseCsv(csvText);
  if (!rows.length) throw new Error("CSV has a header but no data rows.");

  const created: string[] = [];
  const updated: string[] = [];
  const skipped: string[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  const cities =
    dryRun && !prisma
      ? []
      : await prisma!.city.findMany({ select: { id: true, slug: true, name: true } });

  for (let index = 0; index < rows.length; index += 1) {
    const mapped = mapRow(rows[index], index);
    if ("error" in mapped) {
      errors.push(mapped.error);
      continue;
    }
    warnings.push(...mapped.warnings);

    const cityIds: string[] = [];
    for (const cityName of mapped.cityNames) {
      const city = await resolveCity(prisma, cities, mapped, cityName, createCities, dryRun);
      if (!city) {
        errors.push(`Row "${mapped.name}": unknown metro "${cityName}"`);
        continue;
      }
      cityIds.push(city.id);
    }

    if (mapped.cityNames.length && !cityIds.length) continue;

    const existing =
      dryRun && !prisma
        ? null
        : await prisma!.listing.findFirst({
            where: {
              OR: [
                { slug: mapped.slug },
                { name: { equals: mapped.name, mode: "insensitive" } },
              ],
            },
            select: { id: true, slug: true, name: true },
          });

    if (existing && insertOnly) {
      skipped.push(`${mapped.name} (${existing.slug})`);
      continue;
    }

    if (dryRun) {
      const action = existing ? "update" : "create";
      log?.(
        `[dry-run] ${action} ${mapped.type} "${mapped.name}" → ${mapped.slug} (${mapped.status}) [${mapped.cityNames.join(", ") || "no metro"}]`,
      );
      if (existing) updated.push(mapped.name);
      else created.push(mapped.name);
      continue;
    }

    const uniqueCityIds = [...new Set(cityIds)];
    if (existing) {
      await prisma!.listing.update({
        where: { id: existing.id },
        data: {
          ...listingFields(mapped),
          slug: mapped.slugFromCsv ? mapped.slug : existing.slug,
          cities: {
            deleteMany: {},
            create: uniqueCityIds.map((cityId) => ({ cityId })),
          },
        },
      });
      updated.push(mapped.name);
    } else {
      let slug = mapped.slug;
      let suffix = 2;
      while (await prisma!.listing.findUnique({ where: { slug }, select: { id: true } })) {
        slug = `${mapped.slug}-${suffix}`;
        suffix += 1;
      }
      await prisma!.listing.create({
        data: {
          ...listingFields(mapped),
          slug,
          cities: {
            create: uniqueCityIds.map((cityId) => ({ cityId })),
          },
        },
      });
      created.push(mapped.name);
    }
  }

  return { created, updated, skipped, errors, warnings, total: rows.length };
}

export function isCsvUpload(file: { name: string; type: string }) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".csv") || name.endsWith(".tsv") || name.endsWith(".txt")) return true;
  const type = file.type.toLowerCase();
  return [
    "text/csv",
    "text/plain",
    "text/tab-separated-values",
    "application/csv",
    "application/vnd.ms-excel",
  ].includes(type);
}

export function summarizeImport(result: ImportResult, dryRun = false) {
  return [
    dryRun ? "Dry run complete." : "Import complete.",
    `${result.total} rows`,
    `${result.created.length} created`,
    `${result.updated.length} updated`,
    `${result.skipped.length} skipped`,
    `${result.errors.length} errors`,
  ].join(" · ");
}
