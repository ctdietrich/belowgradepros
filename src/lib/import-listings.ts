/**
 * Shared CSV → Listing upsert used by the CLI (`scripts/import-listings.ts`)
 * and the authenticated admin upload at `/admin/import`.
 */

import type { PrismaClient } from "@prisma/client";
import { normalizeServiceKey, serviceLabel } from "./config";

export type MappedListing = {
  slug: string;
  slugFromCsv: boolean;
  name: string;
  city: string;
  state: string;
  metro: string;
  metroSlugHint?: string;
  phone: string | null;
  website: string | null;
  email: string | null;
  services: string[];
  description: string;
  sourceUrl: string | null;
  published: boolean;
  featured: boolean;
  claimable: boolean;
  warnings: string[];
};

export type ImportListingsOptions = {
  dryRun?: boolean;
  insertOnly?: boolean;
  createMetros?: boolean;
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

const NAME_KEYS = ["name", "listing", "listing_name", "business", "business_name", "title", "company"];
const CITY_KEYS = ["city", "town"];
const STATE_KEYS = ["state", "st", "state_code"];
const METRO_KEYS = ["metro", "metro_name", "market", "msa"];
const METRO_SLUG_KEYS = ["metro_slug", "hub", "hub_slug"];
const EMAIL_KEYS = ["email", "contact_email", "contactemail"];
const WEBSITE_KEYS = ["website", "url", "web", "site", "homepage"];
const PHONE_KEYS = ["phone", "telephone", "tel", "mobile"];
const SOURCE_KEYS = ["source_url", "sourceurl", "source", "sourced_from", "attribution"];
const STATUS_KEYS = ["published", "status", "publish_status", "listing_status"];
const CLAIMABLE_KEYS = ["claimable", "claim", "can_claim"];
const FEATURED_KEYS = ["featured", "feature", "hero"];
const SLUG_KEYS = ["slug", "permalink", "handle"];
const DESC_KEYS = ["description", "bio", "about", "blurb", "summary"];
const SERVICE_KEYS = ["services", "service", "service_flags", "categories"];

export const METRO_ALIASES: Record<string, string> = {
  houston: "houston",
  "houston tx": "houston",
  "greater houston": "houston",
  dallas: "dallas",
  dfw: "dallas",
  "dallas fort worth": "dallas",
  "dallas-fort worth": "dallas",
  "fort worth": "dallas",
  atlanta: "atlanta",
  "atlanta ga": "atlanta",
  "metro atlanta": "atlanta",
  tampa: "tampa",
  "tampa bay": "tampa",
  "tampa fl": "tampa",
  "st petersburg": "tampa",
  chicago: "chicago",
  "chicago il": "chicago",
  "chicagoland": "chicago",
};

const PUBLISHED_ALIASES = new Set([
  "published",
  "publish",
  "live",
  "public",
  "ready",
  "candidate",
  "approved",
  "active",
  "true",
  "1",
  "yes",
  "y",
]);

const UNPUBLISHED_ALIASES = new Set([
  "draft",
  "pending",
  "unpublished",
  "hidden",
  "review",
  "wip",
  "hold",
  "false",
  "0",
  "no",
  "n",
]);

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

export function parsePublished(value: string, fallback = true) {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  if (PUBLISHED_ALIASES.has(normalized)) return true;
  if (UNPUBLISHED_ALIASES.has(normalized)) return false;
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

export function parseServices(value: string) {
  const raw = parseList(value);
  const services: string[] = [];
  for (const item of raw) {
    const key = normalizeServiceKey(item);
    if (key && !services.includes(key)) services.push(key);
  }
  return services;
}

export function mapRow(row: Record<string, string>, index: number): MappedListing | { error: string } {
  const warnings: string[] = [];
  const name = getField(row, NAME_KEYS);
  if (!name) return { error: `Row ${index + 2}: missing name` };

  const csvSlug = getField(row, SLUG_KEYS);
  const slug = slugify(csvSlug || name);
  if (!slug) return { error: `Row ${index + 2}: could not build a slug for "${name}"` };

  const city = getField(row, CITY_KEYS);
  const state = getField(row, STATE_KEYS);
  const metro = getField(row, METRO_KEYS) || city;
  if (!city) warnings.push(`No city for "${name}"`);
  if (!state) warnings.push(`No state for "${name}"`);
  if (!metro) warnings.push(`No metro for "${name}"`);

  const services = parseServices(getField(row, SERVICE_KEYS));
  if (!services.length) warnings.push(`No recognized services for "${name}"`);

  const description =
    getField(row, DESC_KEYS) ||
    `${name} is a sample below-grade contractor${city ? ` in ${city}` : ""}${state ? `, ${state}` : ""}.`;
  if (!getField(row, DESC_KEYS)) warnings.push(`Generated description for "${name}"`);

  const emailField = getField(row, EMAIL_KEYS);
  let email: string | null = null;
  if (looksLikeEmail(emailField)) email = emailField.toLowerCase();
  else if (emailField) warnings.push(`Ignored invalid email "${emailField}"`);

  if (!email) {
    email = `${slug.replace(/-/g, ".")}@example.com`;
    warnings.push(`No contact email for "${name}"; using ${email}`);
  }

  const website = normalizeWebsite(getField(row, WEBSITE_KEYS));
  const sourceUrl = normalizeWebsite(getField(row, SOURCE_KEYS)) || website;

  return {
    slug,
    slugFromCsv: Boolean(csvSlug),
    name,
    city: city || metro || "Unknown",
    state: state || "US",
    metro: metro || city || "Unknown",
    metroSlugHint: getField(row, METRO_SLUG_KEYS) || undefined,
    phone: getField(row, PHONE_KEYS) || null,
    website,
    email,
    services,
    description,
    sourceUrl,
    published: parsePublished(getField(row, STATUS_KEYS), true),
    featured: parseBoolean(getField(row, FEATURED_KEYS), false),
    claimable: parseBoolean(getField(row, CLAIMABLE_KEYS), true),
    warnings,
  };
}

type MetroRecord = { id: string; slug: string; name: string; state: string; stateCode: string };

export function matchMetro(name: string, metros: MetroRecord[]): MetroRecord | undefined {
  const needle = normalizePlace(name);
  if (!needle) return undefined;

  const aliasSlug = METRO_ALIASES[needle];
  if (aliasSlug) {
    const byAlias = metros.find((metro) => metro.slug === aliasSlug);
    if (byAlias) return byAlias;
  }

  return metros.find((metro) => {
    const slug = normalizePlace(metro.slug.replace(/-/g, " "));
    const label = normalizePlace(metro.name);
    return slug === needle || label === needle || slug.includes(needle) || needle.includes(slug);
  });
}

async function resolveMetro(
  prisma: PrismaClient | null,
  cache: MetroRecord[],
  listing: MappedListing,
  createMetros: boolean,
  dryRun: boolean,
) {
  const hint = listing.metroSlugHint ? matchMetro(listing.metroSlugHint, cache) : undefined;
  if (hint) return hint;
  const existing = matchMetro(listing.metro, cache) || matchMetro(listing.city, cache);
  if (existing) return existing;
  if (!createMetros) return undefined;

  const slug = METRO_ALIASES[normalizePlace(listing.metro)] || slugify(listing.metro);
  const already = cache.find((metro) => metro.slug === slug);
  if (already) return already;
  if (dryRun || !prisma) {
    const preview = {
      id: `dry-${slug}`,
      slug,
      name: listing.metro,
      state: listing.state,
      stateCode: listing.state.slice(0, 2).toUpperCase(),
    };
    cache.push(preview);
    return preview;
  }

  const created = await prisma.metro.create({
    data: {
      slug,
      name: listing.metro,
      state: listing.state,
      stateCode: listing.state.length === 2 ? listing.state.toUpperCase() : listing.state.slice(0, 2).toUpperCase(),
      description: `${listing.metro} — added from listing import.`,
    },
    select: { id: true, slug: true, name: true, state: true, stateCode: true },
  });
  cache.push(created);
  return created;
}

function listingFields(listing: MappedListing, metro: MetroRecord) {
  return {
    name: listing.name,
    city: listing.city,
    state: listing.state,
    metro: metro.name,
    metroSlug: metro.slug,
    phone: listing.phone,
    website: listing.website,
    email: listing.email,
    services: listing.services,
    description: listing.description,
    sourceUrl: listing.sourceUrl,
    published: listing.published,
    featured: listing.featured,
    claimable: listing.claimable,
  };
}

export async function importListingsFromCsv(
  csvText: string,
  options: ImportListingsOptions = {},
): Promise<ImportResult> {
  const dryRun = Boolean(options.dryRun);
  const insertOnly = Boolean(options.insertOnly);
  const createMetros = options.createMetros !== false;
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

  const metros =
    dryRun && !prisma
      ? []
      : await prisma!.metro.findMany({
          select: { id: true, slug: true, name: true, state: true, stateCode: true },
        });

  for (let index = 0; index < rows.length; index += 1) {
    const mapped = mapRow(rows[index], index);
    if ("error" in mapped) {
      errors.push(mapped.error);
      continue;
    }
    warnings.push(...mapped.warnings);

    const metro = await resolveMetro(prisma, metros, mapped, createMetros, dryRun);
    if (!metro) {
      errors.push(`Row "${mapped.name}": unknown metro "${mapped.metro}"`);
      continue;
    }

    const existing =
      dryRun && !prisma
        ? null
        : await prisma!.listing.findFirst({
            where: {
              OR: [{ slug: mapped.slug }, { name: { equals: mapped.name, mode: "insensitive" } }],
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
        `[dry-run] ${action} "${mapped.name}" → ${mapped.slug} (${mapped.published ? "published" : "draft"}) [${metro.name}] ${mapped.services.map(serviceLabel).join(", ")}`,
      );
      if (existing) updated.push(mapped.name);
      else created.push(mapped.name);
      continue;
    }

    if (existing) {
      await prisma!.listing.update({
        where: { id: existing.id },
        data: {
          ...listingFields(mapped, metro),
          slug: mapped.slugFromCsv ? mapped.slug : existing.slug,
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
          ...listingFields(mapped, metro),
          slug,
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
