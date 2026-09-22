/**
 * Moisture densify SEO (2026-09-22) — unique encap CTA, FAQ ×3, related-city anchors.
 * Applies only to Batch 07 / Moisture densify hubs. Titles/meta/H1 stay in `hubs.ts`.
 * Homepage strip unchanged. No mold/waterproofing hubs. Miami deferred.
 */

export type HubDensifyFaq = {
  question: string;
  answer: string;
};

export type HubDensifyRelated = {
  slug: string;
  /** Query-shaped anchor text (not “click here”). */
  anchor: string;
};

export type HubDensify = {
  slug: string;
  /** Encapsulation-primary CTA body. */
  encapCta: string;
  faqs: [HubDensifyFaq, HubDensifyFaq, HubDensifyFaq];
  related: [HubDensifyRelated, HubDensifyRelated];
};

export const HUB_DENSIFY_SLUGS = [
  "fort-myers",
  "daytona-beach",
  "sarasota",
  "pensacola",
  "west-palm-beach",
  "fort-lauderdale",
  "charleston-sc",
  "tallahassee",
] as const;

export type HubDensifySlug = (typeof HUB_DENSIFY_SLUGS)[number];

export const HUB_DENSIFY: Record<HubDensifySlug, HubDensify> = {
  "fort-myers": {
    slug: "fort-myers",
    encapCta:
      "Compare crawl space encapsulation contractors in Fort Myers and Lee County — sealed crawl packages for sandy, shell-rich soils and long wet seasons. Foundation repair stays on the chip set for settling and cracks. Inquire on BelowGradePros or claim your listing.",
    faqs: [
      {
        question: "Why does Fort Myers lean encapsulation first?",
        answer:
          "Southwest Florida heat and rain keep crawls damp on sandy soils; sealed vapor barriers and dehumidified crawls are the booking lead, with foundation repair for slab and pier settlement.",
      },
      {
        question: "When should a Lee County homeowner call for foundation vs crawl?",
        answer:
          "Soft floors and musty crawls point to the encapsulation path; diagonal cracks, sticky doors, or sloping floors call for a foundation evaluation — often both services apply.",
      },
      {
        question: "Is Fort Myers the same hub as Tampa or Sarasota?",
        answer:
          "No. Fort Myers is Lee County / Southwest Gulf. Related links go to Sarasota and Tampa; listings and H1s stay separate.",
      },
    ],
    related: [
      { slug: "sarasota", anchor: "Sarasota crawl space encapsulation" },
      { slug: "tampa", anchor: "Tampa crawl space encapsulation" },
    ],
  },
  "daytona-beach": {
    slug: "daytona-beach",
    encapCta:
      "Find crawl space encapsulation pros in Daytona Beach and Volusia County — Atlantic humidity and older beach-cottage crawls need sealed packages, not generic “moisture” directories. Foundation repair stays visible for sandy-soil settlement. Inquire or claim on BelowGradePros.",
    faqs: [
      {
        question: "What makes Daytona Beach crawls different from South Florida Atlantic hubs?",
        answer:
          "Volusia mixes barrier-island cottages with inland crawl stock; pair with Jacksonville and Orlando, not Fort Lauderdale or West Palm Beach.",
      },
      {
        question: "Encapsulation or foundation first after a wet season?",
        answer:
          "Musty smell and duct condensation point to encapsulation; sticky doors and exterior cracks on sand point to foundation — dual-service scopes are common.",
      },
      {
        question: "Does this hub cover Ormond Beach / Port Orange?",
        answer:
          "Body copy may mention Volusia suburbs; live listings stay on daytona-beach until child hubs exist.",
      },
    ],
    related: [
      { slug: "jacksonville", anchor: "Jacksonville crawl space encapsulation" },
      { slug: "orlando", anchor: "Orlando crawl space encapsulation" },
    ],
  },
  sarasota: {
    slug: "sarasota",
    encapCta:
      "Browse crawl space encapsulation contractors in Sarasota — Gulf humidity on limestone and sand drives sealed-crawl demand for mid-century homes; foundation repair covers settling and uneven floors. Inquire on BelowGradePros or claim your listing.",
    faqs: [
      {
        question: "Why Sarasota vs Fort Myers as separate hubs?",
        answer:
          "Sarasota–Manatee is central Gulf; Fort Myers is Lee County Southwest Gulf. Sibling related links only — separate listings grids and H1s.",
      },
      {
        question: "What symptoms point to encapsulation here?",
        answer:
          "Musty crawl, condensation on ducts or insulation, and soft floors over the crawl — Gulf moisture load first.",
      },
      {
        question: "Is pier-and-beam common in Sarasota?",
        answer:
          "Older stock often is; newer slabs still need settlement and crack coverage via the foundation chip.",
      },
    ],
    related: [
      { slug: "fort-myers", anchor: "Fort Myers crawl space encapsulation" },
      { slug: "tampa", anchor: "Tampa crawl space encapsulation" },
    ],
  },
  pensacola: {
    slug: "pensacola",
    encapCta:
      "Compare Pensacola crawl space encapsulation specialists — salt air and storm-season humidity punish open crawls along the Gulf Panhandle. Foundation repair stays on-chip for sandy-soil settling. Inquire or claim on BelowGradePros.",
    faqs: [
      {
        question: "Pensacola vs Tallahassee — same market?",
        answer:
          "No. Pensacola is coastal Gulf Panhandle; Tallahassee is inland Big Bend sandy-clay. Related link only — ledes stay distinct.",
      },
      {
        question: "What does “coastal humidity” mean for crawls here?",
        answer:
          "Year-round moisture plus storm seasons; failed vapor barriers and condensation are primary booking intent.",
      },
      {
        question: "Barrier islands included?",
        answer:
          "Body copy may reference barrier-island bungalows; all live listings publish under pensacola until children exist.",
      },
    ],
    related: [
      { slug: "tallahassee", anchor: "Tallahassee crawl space encapsulation" },
      { slug: "tampa", anchor: "Tampa crawl space encapsulation" },
    ],
  },
  "west-palm-beach": {
    slug: "west-palm-beach",
    encapCta:
      "Find West Palm Beach crawl space encapsulation contractors — Palm Beach County subtropical humidity keeps older wood-frame crawls damp; foundation repair covers rain-driven settlement and cracks. Full display name “West Palm Beach” (not WPB alone). Inquire or claim on BelowGradePros.",
    faqs: [
      {
        question: "Is West Palm Beach folded into Miami?",
        answer:
          "No — Palm Beach County hub only. Related links may mention South Florida peers carefully; copy and listings stay West Palm Beach–framed.",
      },
      {
        question: "Encapsulation lead — why?",
        answer:
          "Year-round humidity on sandy coastal soils; musty crawl and soft floors book first, foundation for cracks and sticky doors.",
      },
      {
        question: "How does this differ from Fort Lauderdale?",
        answer:
          "Broward versus Palm Beach County markets — sibling Atlantic South Florida links, separate grids and H1s.",
      },
    ],
    related: [
      { slug: "fort-lauderdale", anchor: "Fort Lauderdale crawl space encapsulation" },
      { slug: "orlando", anchor: "Orlando crawl space encapsulation" },
    ],
  },
  "fort-lauderdale": {
    slug: "fort-lauderdale",
    encapCta:
      "Compare Fort Lauderdale crawl space encapsulation pros — Intracoastal and Atlantic humidity drive sealed-crawl demand across Broward. Foundation repair stays visible for settling and cracks. Inquire on BelowGradePros or claim your listing.",
    faqs: [
      {
        question: "Why isn’t this the Miami hub?",
        answer:
          "Miami stays selective and foundation-first; Fort Lauderdale is encapsulation-lean Broward. Own route, own H1, own listings — never fold the two metros.",
      },
      {
        question: "What symptoms are Broward-specific in copy?",
        answer:
          "Musty crawl plus duct condensation from coastal moisture load; sagging floors often need a dual-service scope.",
      },
      {
        question: "Can related cities include Miami?",
        answer:
          "Only as a careful sibling concept — anchors must not imply one directory for both metros. This hub pairs with West Palm Beach for Atlantic South Florida.",
      },
    ],
    related: [
      { slug: "west-palm-beach", anchor: "West Palm Beach crawl space encapsulation" },
      { slug: "orlando", anchor: "Orlando crawl space encapsulation" },
    ],
  },
  "charleston-sc": {
    slug: "charleston-sc",
    encapCta:
      "Browse Charleston, SC crawl space encapsulation contractors — Lowcountry coastal humidity drives sealed-crawl and vapor-barrier work year-round; foundation repair covers settling on older pier-and-beam and slab stock. Inquire or claim on BelowGradePros.",
    faqs: [
      {
        question: "Why encapsulation-heavy in the Lowcountry?",
        answer:
          "Coastal humidity and musty crawls dominate intent; foundation settling is secondary but always chipped.",
      },
      {
        question: "Charleston SC vs Charleston WV / other Charlestons?",
        answer:
          "Slug is charleston-sc; UI always says Charleston, SC.",
      },
      {
        question: "Related inland SC hubs?",
        answer:
          "Greenville SC and Charlotte are moisture and Southeast peers — not substitutes for Lowcountry coastal framing.",
      },
    ],
    related: [
      { slug: "greenville-sc", anchor: "Greenville SC crawl space encapsulation" },
      { slug: "charlotte", anchor: "Charlotte crawl space encapsulation" },
    ],
  },
  tallahassee: {
    slug: "tallahassee",
    encapCta:
      "Compare Tallahassee crawl space encapsulation contractors — Big Bend humid summers and sandy-clay soils push musty-crawl and sealed-crawl demand; foundation repair covers wet–dry settlement, sticking doors, and brick cracks. Inquire or claim on BelowGradePros.",
    faqs: [
      {
        question: "Inland vs Pensacola coastal — why separate?",
        answer:
          "Tallahassee is Leon County / Big Bend sandy-clay; Pensacola is Gulf salt-air coastal. Related link only — never clone coastal ledes here.",
      },
      {
        question: "What books first after a humid summer?",
        answer:
          "Musty crawl and soft floors point to encapsulation; sticky doors and stair-step brick cracks point to foundation.",
      },
      {
        question: "Is Tallahassee on the homepage moisture strip?",
        answer:
          "No — Wave 1d stays off the locked moisture-8 strip; discover via /cities and internal related links.",
      },
    ],
    related: [
      { slug: "pensacola", anchor: "Pensacola crawl space encapsulation" },
      { slug: "jacksonville", anchor: "Jacksonville crawl space encapsulation" },
    ],
  },
};

export function isHubDensifySlug(slug: string): slug is HubDensifySlug {
  return (HUB_DENSIFY_SLUGS as readonly string[]).includes(slug);
}

export function getHubDensify(slug: string): HubDensify | null {
  if (!isHubDensifySlug(slug)) return null;
  return HUB_DENSIFY[slug];
}
