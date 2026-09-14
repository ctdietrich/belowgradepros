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
  { key: "pier_and_beam", label: "Pier & beam" },
  { key: "slab", label: "Slab" },
] as const;

export type ServiceKey = (typeof SERVICES)[number]["key"];

export const SERVICE_KEYS = SERVICES.map((service) => service.key);

export const site = {
  name: "BelowGradePros",
  domain: "belowgradepros.com",
  url: resolveSiteUrl(),
  tagline: "Specialists for what is under the house.",
  brandTagline: "Foundation repair · crawl-space & basement encapsulation",
  description:
    "A US national specialty directory of foundation repair and crawl-space/basement encapsulation contractors. Homeowners find a specialist. Contractors get found by people who already know they need below-grade work.",
  foundingPrice: "$199–299/mo",
};

export function listingPath(slug: string) {
  return `/l/${slug}`;
}

export function metroPath(slug: string) {
  return `/metros/${slug}`;
}

export function absoluteUrl(path = "") {
  return `${site.url.replace(/\/$/, "")}${path}`;
}

export function serviceLabel(key: string) {
  return SERVICES.find((service) => service.key === key)?.label ?? key.replace(/_/g, " ");
}

export function normalizeServiceKey(value: string): ServiceKey | null {
  const needle = value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

  const aliases: Record<string, ServiceKey> = {
    foundation_repair: "foundation_repair",
    foundation: "foundation_repair",
    foundations: "foundation_repair",
    repair: "foundation_repair",
    encapsulation: "encapsulation",
    encapsulate: "encapsulation",
    crawlspace: "encapsulation",
    crawl_space: "encapsulation",
    vapor_barrier: "encapsulation",
    dehumidifier: "encapsulation",
    waterproofing: "waterproofing",
    waterproof: "waterproofing",
    basement_waterproofing: "waterproofing",
    pier_and_beam: "pier_and_beam",
    pier: "pier_and_beam",
    pier_beam: "pier_and_beam",
    crawl_pier: "pier_and_beam",
    slab: "slab",
    slab_foundation: "slab",
    post_tension: "slab",
  };

  return aliases[needle] ?? (SERVICE_KEYS.includes(needle as ServiceKey) ? (needle as ServiceKey) : null);
}
