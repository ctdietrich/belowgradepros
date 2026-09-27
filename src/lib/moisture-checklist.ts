import { citationNotes, orderedCitationIds } from "./citations";
import {
  encapsulationCostPath,
  foundationCostPath,
  isCostMetro,
  MOISTURE_CHECKLIST_PATH,
  type QuoteService,
} from "./cost-paths";
import { WAVE1_HUBS } from "./hubs";

export const MOISTURE_CHECKLIST = {
  path: MOISTURE_CHECKLIST_PATH,
  title: "Crawl Space Moisture Checklist (Free Tool)",
  description:
    "Free crawl space moisture checklist: check musty smell, standing water, humidity and sagging floors, get a severity score, then local quotes.",
  h1: "Crawl space moisture checklist",
  intro:
    "Crawl-space moisture problems usually show up upstairs first: a musty smell, damp air, or a soft spot in the floor. Check off what you're seeing below and you'll get a severity score with a suggested next step. It takes about two minutes. If you have a cheap humidity meter ($10–$50, per EPA [M1]), take a reading in the crawl space first.",
  disclaimer:
    "This checklist is a quick triage tool from BelowGradePros, not an inspection or a mold test. The scores are our own weighting. Humidity and wood-moisture thresholds cite EPA and the USDA Forest Products Laboratory.",
} as const;

export type HumidityChoice = "above-60" | "50-60" | "below-50-or-none";

export type ScoreBand = "low" | "moderate" | "high";

export type CheckItem = {
  id: string;
  label: string;
  points: number;
  helper?: string;
};

export const STANDING_WATER_ID = "standing-water";
export const SAGGING_FLOORS_ID = "sagging-floors";
export const CRACKED_PIERS_ID = "cracked-piers";

export const CHECK_ITEMS_BEFORE_HUMIDITY: readonly CheckItem[] = [
  {
    id: "musty",
    label: "Musty or earthy smell inside the house",
    points: 2,
    helper: "Most first-floor complaints start with smell.",
  },
  {
    id: STANDING_WATER_ID,
    label: "**Standing water** or puddles in the crawl space",
    points: 4,
    helper:
      "ENERGY STAR: standing water must be eliminated and its source identified before a crawl space is closed [M3].",
  },
  {
    id: "bare-dirt",
    label: "Bare dirt floor, or a torn or missing plastic vapor barrier",
    points: 2,
    helper: "EPA notes bare-earth crawl spaces with high RH are common sites of hidden mold growth [M2].",
  },
];

export const HUMIDITY_OPTIONS: readonly {
  value: HumidityChoice;
  label: string;
  points: number;
  helper?: string;
}[] = [
  {
    value: "above-60",
    label: "Humidity reading **above 60% RH**",
    points: 3,
    helper: "EPA: keep indoor RH below 60%, ideally 30–50% [M1].",
  },
  {
    value: "50-60",
    label: "Humidity reading 50–60% RH",
    points: 1,
    helper: "Above EPA's ideal 30–50% band [M1].",
  },
  {
    value: "below-50-or-none",
    label: "Humidity below 50% / no reading",
    points: 0,
    helper: "Measure it: EPA says meters cost $10–$50 [M1].",
  },
];

export const CHECK_ITEMS_AFTER_HUMIDITY: readonly CheckItem[] = [
  {
    id: "condensation",
    label: '**Condensation** ("sweating") on ducts, pipes or the underside of the floor',
    points: 3,
    helper:
      "EPA: condensation can be a sign of high humidity. Its example is an uninsulated AC duct [M2].",
  },
  {
    id: "wood-moisture",
    label: "Wood moisture meter reads **above 20%** on joists or subfloor",
    points: 3,
    helper:
      "USDA Forest Products Lab: air-dried wood at ≤20% moisture content has a reasonable safety margin against fungal damage [M4].",
  },
  {
    id: "insulation",
    label: "Insulation between joists is sagging, falling, or damp",
    points: 2,
  },
  {
    id: "discoloration",
    label: "Discoloration, staining or fuzzy growth on wood",
    points: 3,
    helper:
      "Treat it as a moisture sign. The contractor finds the moisture source, and any remediation is a separate scope.",
  },
  {
    id: "pests",
    label: "Pests in the crawl space (termites, rodents, insects)",
    points: 2,
    helper: "Damp crawl spaces attract pests (Angi, HomeGuide list this among signs [N5][N6]).",
  },
  {
    id: "rain-entry",
    label: "Water gets in after heavy rain or near downspouts",
    points: 2,
  },
  {
    id: SAGGING_FLOORS_ID,
    label: "**Sagging, soft or bouncy floors** over the crawl space",
    points: 4,
    helper: "Possible structural issue. Also suggest a foundation quote.",
  },
  {
    id: CRACKED_PIERS_ID,
    label: "Cracked piers or foundation walls, or doors and windows that newly stick",
    points: 3,
    helper: "Cracks wider than 1/8 in. warrant a structural engineer, per HomeAdvisor [N1].",
  },
  {
    id: "damp-air",
    label: "Indoor air feels damp even with the AC running",
    points: 1,
  },
];

export const CHECK_ITEMS: readonly CheckItem[] = [
  ...CHECK_ITEMS_BEFORE_HUMIDITY,
  ...CHECK_ITEMS_AFTER_HUMIDITY,
];

export const MOISTURE_FAQS: readonly { question: string; answer: string }[] = [
  {
    question: "What humidity should a crawl space be?",
    answer:
      "EPA's guidance for indoor spaces is below 60% RH, ideally 30–50% [M1]. ENERGY STAR's closed-crawlspace guide targets 30–50% with dehumidification [M3].",
  },
  {
    question: "Is standing water in a crawl space serious?",
    answer:
      "Yes. ENERGY STAR says it must be eliminated and its source found. It usually means a leak or groundwater getting in [M3].",
  },
  {
    question: "Does sealing a crawl space lower humidity?",
    answer:
      "DOE Building America research found unvented, conditioned crawlspaces cut humidity by over 20% and used 15–18% less heating and cooling energy [M5].",
  },
  {
    question: "What wood moisture reading is a concern?",
    answer:
      "Wood kept at or below about 20% moisture content has a reasonable margin against fungal damage [M4]. Higher readings are worth having checked.",
  },
];

const BAND_COPY: Record<ScoreBand, string> = {
  low: "Few warning signs. Re-check after heavy rain and during the humid months, and keep a humidity meter in the crawl space.",
  moderate:
    "Several moisture signs. A crawl space inspection is worth scheduling before damage spreads to framing.",
  high: "Signs of an active moisture or structural problem. Get an inspection soon. Standing water needs to be dealt with before any sealing [M3].",
};

export function bandCopy(band: ScoreBand): string {
  return BAND_COPY[band];
}

export function checklistCityOptions(): { slug: string; name: string; state: string }[] {
  return WAVE1_HUBS.map((hub) => ({ slug: hub.slug, name: hub.name, state: hub.state }));
}

export function isChecklistCity(slug: string): boolean {
  return checklistCityOptions().some((city) => city.slug === slug);
}

export function toolCitedTexts(): string[] {
  return [
    MOISTURE_CHECKLIST.intro,
    ...CHECK_ITEMS_BEFORE_HUMIDITY.map((item) => item.helper ?? ""),
    ...HUMIDITY_OPTIONS.map((item) => item.helper ?? ""),
    ...CHECK_ITEMS_AFTER_HUMIDITY.map((item) => item.helper ?? ""),
    BAND_COPY.low,
    BAND_COPY.moderate,
    BAND_COPY.high,
    ...MOISTURE_FAQS.map((item) => item.answer),
  ].filter((text) => text.length > 0);
}

export function toolCitationNotes(): Record<string, number> {
  return citationNotes(toolCitedTexts());
}

export function toolCitationIds(): string[] {
  return orderedCitationIds(toolCitedTexts());
}

export type MoistureScoreInput = {
  checkedIds: readonly string[];
  humidity: HumidityChoice | null;
};

export type MoistureScore = {
  score: number;
  maxScore: number;
  band: ScoreBand;
  /** Item 11 or 12 routes to both. Otherwise encapsulation. */
  service: Extract<QuoteService, "encapsulation" | "both">;
};

const HUMIDITY_POINTS: Record<HumidityChoice, number> = {
  "above-60": 3,
  "50-60": 1,
  "below-50-or-none": 0,
};

export function maxChecklistScore(): number {
  const checks = CHECK_ITEMS.reduce((sum, item) => sum + item.points, 0);
  return checks + HUMIDITY_POINTS["above-60"];
}

/**
 * BelowGradePros triage heuristic. Not an industry standard.
 * High band: score 10+ OR standing water OR sagging floors.
 * Routing: sagging floors or cracked piers → both; otherwise encapsulation.
 */
export function scoreMoistureChecklist(input: MoistureScoreInput): MoistureScore {
  const checked = new Set(input.checkedIds);
  let score = 0;
  for (const item of CHECK_ITEMS) {
    if (checked.has(item.id)) score += item.points;
  }
  if (input.humidity) score += HUMIDITY_POINTS[input.humidity];

  const standing = checked.has(STANDING_WATER_ID);
  const sagging = checked.has(SAGGING_FLOORS_ID);
  const cracked = checked.has(CRACKED_PIERS_ID);

  let band: ScoreBand = "low";
  if (score >= 10 || standing || sagging) band = "high";
  else if (score >= 4) band = "moderate";

  return {
    score,
    maxScore: maxChecklistScore(),
    band,
    service: sagging || cracked ? "both" : "encapsulation",
  };
}

export function encapsulationResultHref(citySlug: string): string {
  return isCostMetro(citySlug) ? encapsulationCostPath(citySlug) : `/cities/${citySlug}`;
}

export function foundationResultHref(citySlug: string): string | null {
  return isCostMetro(citySlug) ? foundationCostPath(citySlug) : null;
}
