/** Wave 1 city hubs — SEO lock. Publish / seed order: Houston → DFW → Atlanta → Tampa → Chicago, then Charlotte, Austin, St. Louis. */
export const WAVE1_HUBS = [
  {
    slug: "houston",
    name: "Houston",
    state: "TX",
    region: "Gulf Coast",
    title: "Houston Foundation Repair & Encapsulation Contractors",
    foundationTitle: "Houston Foundation Repair Contractors",
    encapsulationTitle: "Houston Encapsulation Contractors",
    description:
      "Houston foundation repair and crawl-space encapsulation contractors. Clay soils, pier-and-beam bungalows, and slab suburbs from the Energy Corridor to the Bay.",
  },
  {
    slug: "dallas-fort-worth",
    name: "Dallas–Fort Worth",
    state: "TX",
    region: "North Texas",
    title: "Dallas–Fort Worth Foundation Repair & Encapsulation Contractors",
    foundationTitle: "Dallas–Fort Worth Foundation Repair Contractors",
    encapsulationTitle: "Dallas–Fort Worth Encapsulation Contractors",
    description:
      "Dallas–Fort Worth foundation repair and encapsulation contractors. Expansive North Texas clay, post-tension slabs, and older pier-and-beam neighborhoods.",
  },
  {
    slug: "atlanta",
    name: "Atlanta",
    state: "GA",
    region: "Southeast",
    title: "Atlanta Foundation Repair & Encapsulation Contractors",
    foundationTitle: "Atlanta Foundation Repair Contractors",
    encapsulationTitle: "Atlanta Encapsulation Contractors",
    description:
      "Atlanta foundation repair and encapsulation contractors. Piedmont clay, crawl-space ranch houses, and a growing slab ring around the perimeter.",
  },
  {
    slug: "tampa",
    name: "Tampa",
    state: "FL",
    region: "Gulf Coast",
    title: "Tampa Foundation Repair & Encapsulation Contractors",
    foundationTitle: "Tampa Foundation Repair Contractors",
    encapsulationTitle: "Tampa Encapsulation Contractors",
    description:
      "Tampa foundation repair and encapsulation contractors. High water tables, block homes, and crawl spaces that want moisture control as much as structural repair.",
  },
  {
    slug: "chicago",
    name: "Chicago",
    state: "IL",
    region: "Midwest",
    title: "Chicago Foundation Repair & Encapsulation Contractors",
    foundationTitle: "Chicago Foundation Repair Contractors",
    encapsulationTitle: "Chicago Encapsulation Contractors",
    description:
      "Chicago foundation repair and encapsulation contractors. Basement moisture, older masonry, and clay that moves through freeze-thaw.",
  },
  {
    slug: "charlotte",
    name: "Charlotte",
    state: "NC",
    region: "Carolinas",
    title: "Charlotte Foundation Repair & Encapsulation Contractors",
    foundationTitle: "Charlotte Foundation Repair Contractors",
    encapsulationTitle: "Charlotte Encapsulation Contractors",
    description:
      "Charlotte foundation repair and encapsulation contractors. Piedmont clay, crawl-space stock, and a fast suburban slab ring.",
  },
  {
    slug: "austin",
    name: "Austin",
    state: "TX",
    region: "Central Texas",
    title: "Austin Foundation Repair & Encapsulation Contractors",
    foundationTitle: "Austin Foundation Repair Contractors",
    encapsulationTitle: "Austin Encapsulation Contractors",
    description:
      "Austin foundation repair and encapsulation contractors. Hill Country limestone, Edwards clay, and a split between east-side pier-and-beam and west-side slabs.",
  },
  {
    slug: "st-louis",
    name: "St. Louis",
    state: "MO",
    region: "Midwest",
    title: "St. Louis Foundation Repair & Encapsulation Contractors",
    foundationTitle: "St. Louis Foundation Repair Contractors",
    encapsulationTitle: "St. Louis Encapsulation Contractors",
    description:
      "St. Louis foundation repair and encapsulation contractors. Brick basements, limestone, and humidity that keeps encapsulation on the calendar.",
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
  if (service === "encapsulation") return `${fallback} Encapsulation Contractors`;
  return `${fallback} Foundation Repair & Encapsulation Contractors`;
}
