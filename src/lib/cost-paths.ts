/** Cost-guide and checklist paths. Kept separate from page copy so hubs and the sitemap stay light. */

export const COST_METRO_SLUGS = [
  "tampa",
  "houston",
  "jacksonville",
  "orlando",
  "atlanta",
  "charlotte",
  "nashville",
] as const;

export type CostMetroSlug = (typeof COST_METRO_SLUGS)[number];

export type CostServiceKey = "encapsulation" | "foundation";

/** Homeowner quote form service prop. */
export type QuoteService = "foundation" | "encapsulation" | "both";

export const MOISTURE_CHECKLIST_PATH = "/tools/crawl-space-moisture-checklist";

export function isCostMetro(slug: string): slug is CostMetroSlug {
  return (COST_METRO_SLUGS as readonly string[]).includes(slug);
}

export function encapsulationCostPath(slug: string) {
  return `/cost/crawl-space-encapsulation/${slug}`;
}

export function foundationCostPath(slug: string) {
  return `/cost/foundation-repair/${slug}`;
}

export function costPath(service: CostServiceKey, slug: string) {
  return service === "encapsulation" ? encapsulationCostPath(slug) : foundationCostPath(slug);
}

export function moistureChecklistHref(citySlug?: string) {
  if (!citySlug) return MOISTURE_CHECKLIST_PATH;
  return `${MOISTURE_CHECKLIST_PATH}?city=${encodeURIComponent(citySlug)}`;
}

/** Fourteen cost URLs, then the checklist. Order matches the SEO package. */
export function publicGuidePaths(): string[] {
  return [
    ...COST_METRO_SLUGS.map((slug) => encapsulationCostPath(slug)),
    ...COST_METRO_SLUGS.map((slug) => foundationCostPath(slug)),
    MOISTURE_CHECKLIST_PATH,
  ];
}
