const SITE_URL_FALLBACK = "https://belowgradepros.com";

function toAbsoluteHttpUrl(value?: string | null): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed.replace(/^\/+/, "")}`;

  try {
    const url = new URL(withProtocol);
    if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
    if (!url.hostname) return undefined;
    return url.origin;
  } catch {
    return undefined;
  }
}

export function resolveSiteUrl(): string {
  return (
    toAbsoluteHttpUrl(process.env.NEXT_PUBLIC_SITE_URL) ??
    toAbsoluteHttpUrl(process.env.VERCEL_URL) ??
    SITE_URL_FALLBACK
  );
}

/** Primary desk: foundation | encapsulation | both. */
export const PRIMARY_SERVICES = [
  { key: "foundation" as const, label: "Foundation repair", query: "foundation-repair" },
  { key: "encapsulation" as const, label: "Encapsulation", query: "encapsulation" },
  { key: "both" as const, label: "Foundation + encapsulation", query: "both" },
] as const;

export type PrimaryServiceKey = (typeof PRIMARY_SERVICES)[number]["key"];

export const PRIMARY_SERVICE_KEYS = PRIMARY_SERVICES.map((item) => item.key);

/** Extra badges — not first-class category URLs in v1. */
export const ADDITIONAL_SERVICES = [
  { key: "waterproofing" as const, label: "Waterproofing" },
  { key: "pier_beam" as const, label: "Pier & beam" },
  { key: "slab" as const, label: "Slab" },
] as const;

export type AdditionalServiceKey = (typeof ADDITIONAL_SERVICES)[number]["key"];
export type ServiceKey = PrimaryServiceKey | AdditionalServiceKey;

export const SERVICE_KEYS = [
  ...PRIMARY_SERVICE_KEYS,
  ...ADDITIONAL_SERVICES.map((item) => item.key),
] as const;

/** Wave 1 city hubs — SEO lock. Homepage strip is `HOMEPAGE_STRIP`, not DB sortOrder. */
export {
  WAVE1_CITIES,
  WAVE1_HUBS,
  WAVE1_HUB_SLUGS,
  DEPRIORITIZED_HUB_SLUGS,
  HOMEPAGE_STRIP,
  HOMEPAGE_STRIP_SLUGS,
  HOMEPAGE_SERVICE_CHIPS,
  getWave1Hub,
  hubPageTitle,
  homepageCardHref,
  homepageCardCta,
  homepageCardChips,
  buildHomepageStrip,
  buildCityIndex,
  catalogCityFallback,
  catalogCardHref,
  catalogCardCta,
  catalogCardChips,
  FL_ENCAP_HUB_SLUGS,
} from "./hubs";

export const brand = {
  slate: "#1E293B",
  deep: "#0F172A",
  concrete: "#C9B8A6",
  amber: "#D97706",
  page: "#F7F4F0",
  tagline: "Solid ground starts below grade.",
} as const;

export const site = {
  name: "BelowGradePros",
  domain: "belowgradepros.com",
  url: resolveSiteUrl(),
  tagline: brand.tagline,
  brandTagline: brand.tagline,
  description:
    "A curated national directory of foundation repair and crawl-space / basement encapsulation contractors — Wave 1 metros first.",
  listingTypes: [
    { key: "contractor" as const, label: "Contractor", plural: "Contractors", path: "/contractors" },
  ],
  primaryServices: PRIMARY_SERVICES,
  additionalServices: ADDITIONAL_SERVICES,
  services: PRIMARY_SERVICES,
};

export type ListingTypeKey = (typeof site.listingTypes)[number]["key"];

export function listingPath(slug: string) {
  return `/l/${slug}`;
}

export function cityPath(slug: string, service?: string) {
  if (!service) return `/cities/${slug}`;
  return `/cities/${slug}?service=${encodeURIComponent(service)}`;
}

export function servicePath(key: string) {
  const primary = normalizePrimaryService(key);
  if (primary === "foundation") return "/services/foundation";
  if (primary === "encapsulation") return "/services/encapsulation";
  return `/services/${key}`;
}

export function absoluteUrl(path = "") {
  return `${site.url.replace(/\/$/, "")}${path}`;
}

export function typeLabel(type: string) {
  return site.listingTypes.find((item) => item.key === type)?.label ?? type;
}

export function primaryServiceLabel(key: string) {
  const normalized = normalizePrimaryService(key);
  return PRIMARY_SERVICES.find((item) => item.key === normalized)?.label ?? key;
}

export function additionalServiceLabel(key: string) {
  const normalized = key.trim().toLowerCase().replace(/[\s-]+/g, "_");
  return ADDITIONAL_SERVICES.find((item) => item.key === normalized)?.label ?? key;
}

export function serviceLabel(key: string) {
  return primaryServiceLabel(key) !== key
    ? primaryServiceLabel(key)
    : additionalServiceLabel(key);
}

export function normalizePrimaryService(value?: string | null): PrimaryServiceKey | null {
  if (!value) return null;
  const compact = value
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
    .replace(/&/g, "")
    .replace(/__+/g, "_");
  const aliases: Record<string, PrimaryServiceKey> = {
    foundation: "foundation",
    foundation_repair: "foundation",
    foundations: "foundation",
    repair: "foundation",
    encapsulation: "encapsulation",
    encapsulate: "encapsulation",
    crawl_space: "encapsulation",
    crawlspace: "encapsulation",
    basement_encapsulation: "encapsulation",
    both: "both",
    foundation_encapsulation: "both",
    foundation_and_encapsulation: "both",
  };
  return aliases[compact] ?? null;
}

/** Hub query `?service=foundation-repair|encapsulation` (and aliases). */
export function normalizeHubServiceQuery(value?: string | null): "foundation" | "encapsulation" | null {
  const primary = normalizePrimaryService(value);
  if (primary === "foundation" || primary === "encapsulation") return primary;
  return null;
}

/** Canonical query value for hub / contractor filters. */
export function hubServiceQueryParam(value?: string | null): "foundation-repair" | "encapsulation" | null {
  const hub = normalizeHubServiceQuery(value);
  if (hub === "foundation") return "foundation-repair";
  if (hub === "encapsulation") return "encapsulation";
  return null;
}

export function normalizeAdditionalService(value: string): AdditionalServiceKey | null {
  const compact = value
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
    .replace(/&/g, "")
    .replace(/__+/g, "_");
  const aliases: Record<string, AdditionalServiceKey> = {
    waterproofing: "waterproofing",
    waterproof: "waterproofing",
    pier_beam: "pier_beam",
    pier_and_beam: "pier_beam",
    pierandbeam: "pier_beam",
    pier: "pier_beam",
    slab: "slab",
    slab_foundation: "slab",
  };
  return aliases[compact] ?? null;
}

export function normalizeServiceKey(value: string): ServiceKey | null {
  return normalizePrimaryService(value) ?? normalizeAdditionalService(value);
}

export function matchesPrimaryFilter(
  primaryService: string,
  filter?: string | null,
): boolean {
  const needle = normalizeHubServiceQuery(filter) ?? normalizePrimaryService(filter);
  if (!needle) return true;
  if (primaryService === "both") return needle === "foundation" || needle === "encapsulation" || needle === "both";
  return primaryService === needle;
}
