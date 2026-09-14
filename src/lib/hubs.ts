/** Wave 1 city hubs — SEO lock. Publish / seed order: Houston → DFW → Atlanta → Tampa → Chicago, then Charlotte, Austin, St. Louis. */
export const WAVE1_HUBS = [
  {
    slug: "houston",
    name: "Houston",
    state: "TX",
    region: "Gulf Coast",
    title: "Houston Foundation Repair & Crawl Encapsulation",
    foundationTitle: "Houston Foundation Repair Contractors",
    encapsulationTitle: "Houston Crawl Space Encapsulation Contractors",
    description:
      "Find foundation repair and crawl space encapsulation contractors in Houston. Settling, cracks, pier & beam, musty crawl. Inquire on BelowGradePros.",
  },
  {
    slug: "dallas-fort-worth",
    name: "Dallas–Fort Worth",
    state: "TX",
    region: "North Texas",
    title: "Dallas–Fort Worth Foundation Repair Contractors",
    foundationTitle: "Dallas–Fort Worth Foundation Repair Contractors",
    encapsulationTitle: "Dallas–Fort Worth Crawl Space Encapsulation Contractors",
    description:
      "Compare DFW foundation repair contractors — Dallas, Fort Worth, Plano. Clay soils, pier & beam, settling cracks. Inquire on BelowGradePros.",
  },
  {
    slug: "atlanta",
    name: "Atlanta",
    state: "GA",
    region: "Southeast",
    title: "Atlanta Foundation Repair & Crawl Encapsulation",
    foundationTitle: "Atlanta Foundation Repair Contractors",
    encapsulationTitle: "Atlanta Crawl Space Encapsulation Contractors",
    description:
      "Atlanta foundation repair and crawl space encapsulation contractors. Clay soils, settling, musty crawl spaces. Inquire on BelowGradePros.",
  },
  {
    slug: "tampa",
    name: "Tampa",
    state: "FL",
    region: "Gulf Coast",
    title: "Tampa Foundation Repair & Crawl Encapsulation",
    foundationTitle: "Tampa Foundation Repair Contractors",
    encapsulationTitle: "Tampa Crawl Space Encapsulation Contractors",
    description:
      "Tampa foundation repair and crawl space encapsulation contractors. Cracks, settling, sinkhole adjacency. Inquire on BelowGradePros.",
  },
  {
    slug: "chicago",
    name: "Chicago",
    state: "IL",
    region: "Midwest",
    title: "Chicago Foundation Repair Contractors",
    foundationTitle: "Chicago Foundation Repair Contractors",
    encapsulationTitle: "Chicago Crawl Space Encapsulation Contractors",
    description:
      "Find Chicago foundation repair contractors for cracks, settling, and bowed basement walls. Compare specialists on BelowGradePros.",
  },
  {
    slug: "charlotte",
    name: "Charlotte",
    state: "NC",
    region: "Carolinas",
    title: "Charlotte Crawl Space Encapsulation & Foundation",
    foundationTitle: "Charlotte Foundation Repair Contractors",
    encapsulationTitle: "Charlotte Crawl Space Encapsulation Contractors",
    description:
      "Charlotte crawl space encapsulation and foundation repair contractors. Musty crawl, settling, pier & beam. Inquire on BelowGradePros.",
  },
  {
    slug: "austin",
    name: "Austin",
    state: "TX",
    region: "Central Texas",
    title: "Austin Foundation Repair Contractors",
    foundationTitle: "Austin Foundation Repair Contractors",
    encapsulationTitle: "Austin Crawl Space Encapsulation Contractors",
    description:
      "Austin foundation repair contractors for clay soils, pier & beam, and settling cracks. Compare specialists on BelowGradePros.",
  },
  {
    slug: "st-louis",
    name: "St. Louis",
    state: "MO",
    region: "Midwest",
    title: "St. Louis Foundation Repair Contractors",
    foundationTitle: "St. Louis Foundation Repair Contractors",
    encapsulationTitle: "St. Louis Crawl Space Encapsulation Contractors",
    description:
      "St. Louis foundation repair for cracks, settling, and bowed walls. Compare Midwest foundation specialists on BelowGradePros.",
  },
] as const;

export type Wave1HubSlug = (typeof WAVE1_HUBS)[number]["slug"];

export const WAVE1_CITIES = WAVE1_HUBS.map(({ slug, name, state, region }) => ({
  slug,
  name,
  state,
  region,
}));

export const WAVE1_HUB_SLUGS = WAVE1_HUBS.map((hub) => hub.slug);

export function getWave1Hub(slug: string) {
  return WAVE1_HUBS.find((hub) => hub.slug === slug) ?? null;
}

export function hubPageDescription(slug: string, fallback?: string | null) {
  return getWave1Hub(slug)?.description ?? fallback ?? "";
}

/** Specialty-directory title for a hub, including `?service=foundation-repair|encapsulation`. */
export function hubPageTitle(slug: string, service?: "foundation" | "encapsulation" | null) {
  const hub = getWave1Hub(slug);
  if (hub) {
    if (service === "foundation") return hub.foundationTitle;
    if (service === "encapsulation") return hub.encapsulationTitle;
    return hub.title;
  }
  const fallback = slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
  if (service === "foundation") return `${fallback} Foundation Repair Contractors`;
  if (service === "encapsulation") return `${fallback} Crawl Space Encapsulation Contractors`;
  return `${fallback} Foundation Repair & Crawl Encapsulation`;
}
