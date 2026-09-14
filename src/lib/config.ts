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

export const SERVICES = [
  { key: "foundation_repair", label: "Foundation repair" },
  { key: "encapsulation", label: "Encapsulation" },
  { key: "waterproofing", label: "Waterproofing" },
  { key: "pier_beam", label: "Pier & beam" },
  { key: "slab", label: "Slab" },
] as const;

export type ServiceKey = (typeof SERVICES)[number]["key"];

export const SERVICE_KEYS = SERVICES.map((item) => item.key);

export const site = {
  name: "BelowGradePros",
  domain: "belowgradepros.com",
  url: resolveSiteUrl(),
  tagline: "Specialty directory for foundation repair + encapsulation pros.",
  brandTagline: "Work below grade, listed above board",
  description:
    "A curated national directory of foundation repair, crawl-space and basement encapsulation, waterproofing, pier-and-beam, and slab contractors — starting with Texas and Florida metro hubs.",
  listingTypes: [
    { key: "contractor" as const, label: "Contractor", plural: "Contractors", path: "/contractors" },
  ],
  services: SERVICES,
};

export type ListingTypeKey = (typeof site.listingTypes)[number]["key"];

export function listingPath(slug: string) {
  return `/l/${slug}`;
}

export function cityPath(slug: string) {
  return `/cities/${slug}`;
}

export function servicePath(key: string) {
  return `/services/${key}`;
}

export function absoluteUrl(path = "") {
  return `${site.url.replace(/\/$/, "")}${path}`;
}

export function typeLabel(type: string) {
  return site.listingTypes.find((item) => item.key === type)?.label ?? type;
}

export function serviceLabel(key: string) {
  const normalized = key.trim().toLowerCase().replace(/[\s-]+/g, "_");
  return SERVICES.find((item) => item.key === normalized)?.label ?? key;
}

export function normalizeServiceKey(value: string): ServiceKey | null {
  const raw = value.trim().toLowerCase();
  const compact = raw.replace(/[\s-]+/g, "_").replace(/&/g, "").replace(/__+/g, "_");
  const aliases: Record<string, ServiceKey> = {
    foundation_repair: "foundation_repair",
    foundation: "foundation_repair",
    foundations: "foundation_repair",
    repair: "foundation_repair",
    encapsulation: "encapsulation",
    encapsulate: "encapsulation",
    crawl_space: "encapsulation",
    crawlspace: "encapsulation",
    basement_encapsulation: "encapsulation",
    waterproofing: "waterproofing",
    waterproof: "waterproofing",
    pier_beam: "pier_beam",
    pier_and_beam: "pier_beam",
    pierandbeam: "pier_beam",
    pier: "pier_beam",
    slab: "slab",
    slab_foundation: "slab",
  };
  return aliases[compact] ?? aliases[raw] ?? null;
}
