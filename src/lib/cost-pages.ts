import { citationNotes, extractCitationIds, orderedCitationIds } from "./citations";
import {
  costPath,
  encapsulationCostPath,
  foundationCostPath,
  isCostMetro,
  moistureChecklistHref,
  type CostMetroSlug,
  type CostServiceKey,
} from "./cost-paths";
import { getSource, SOURCE_ACCESSED } from "./sources";

export type PriceLabelKind = "city" | "contractor" | "national";

export type CostLink = { href: string; label: string };

export type CostPage = {
  service: CostServiceKey;
  slug: CostMetroSlug;
  cityName: string;
  state: string;
  title: string;
  description: string;
  h1: string;
  path: string;
  price: {
    labelKind: PriceLabelKind;
    label: string;
    range: string;
    sourceNote: string;
    sourceIds: string[];
    accessed: typeof SOURCE_ACCESSED;
  };
  lede: string;
  ctaLabel: string;
  ctaMicrocopy?: string;
  sections: { heading: string; bullets: string[] }[];
  signs: string[];
  signsCta?: CostLink;
  faqs: { question: string; answer: string }[];
  links: {
    hub: CostLink;
    sibling: CostLink;
    tool: CostLink;
    related: CostLink;
  };
};

const ENCAP_COVER_HEAD = [
  "A typical encapsulation is a sealed floor-and-wall liner, closed vents, and usually a dehumidifier. Basic jobs run about $2–$4 per sq ft nationally, and extensive ones $3–$10 per sq ft [N5]. This Old House puts a 1,000 sq ft crawl space at $3,000–$7,000 nationally [N7].",
  "Common national add-ons: dehumidifier installed $1,000–$3,000 [N6], interior drainage $800–$3,000 [N6], permits $50–$250 [N5].",
];

const ENCAP_NATIONAL =
  "National figures: This Old House puts typical encapsulation at **$1,500–$15,000**, averaging **$5,500** [N7]. Angi says **$5,000–$15,000** (avg $5,500) [N5]. HomeGuide says **$3,000–$15,000**, or **$3–$10 per sq ft** [N6].";

const FOUNDATION_COVER_HEAD = [
  "National benchmarks by problem: cracks $250–$800, settling or sinking $5,000–$25,000, bowing walls $4,000–$12,000, piers $1,000–$3,000 each [N1]. HomeGuide puts settling repairs at $4,500–$20,000 [N4].",
  "An independent structural engineer's report costs $340–$780 nationally [N1] (Angi: $300–$1,000 [N2]).",
];

const FOUNDATION_NATIONAL =
  "National figures: HomeAdvisor and Angi both put typical foundation repair at **$2,225–$8,133**, averaging **$5,174** [N1][N2]. This Old House reports **$2,224–$8,134** [N3].";

const ENCAP_SIGNS = [
  "A musty smell inside the house, especially from floor registers",
  "Standing water or wet soil under the house. ENERGY STAR says standing water has to be eliminated and its source found before a crawl space is closed [M3]",
  "Condensation on ducts or pipes, which EPA says can be a sign of high humidity [M2]",
  "Soft, sagging or bouncy floors over the crawl space",
  "Crawl-space humidity readings above 60% (EPA's guidance is to keep indoor RH below 60%, ideally 30–50% [M1])",
];

const FOUNDATION_SIGNS = [
  "Cracks wider than 1/8 inch. HomeAdvisor says cracks that wide warrant a structural engineer [N1]",
  "Doors or windows that newly stick or won't latch",
  "Sloping or bouncy floors, or gaps where trim meets the ceiling",
  "Stair-step cracks in brick or block",
  "Water getting in at the foundation after rain",
];

function encapLede(city: string) {
  return `A musty smell, damp insulation, or floors that feel soft over the crawl space are the usual reasons ${city} homeowners start pricing encapsulation. The figures below come from named, public sources, and each one says whether it's a ${city} estimate, a local contractor's published pricing, or a national benchmark. Your quote depends on the size of your crawl space, how wet it is, and what has to be fixed before it's sealed.`;
}

function foundationLede(city: string) {
  return `A new crack over a door, a door that suddenly sticks, or a floor that slopes toward one wall usually sends ${city} homeowners looking up foundation repair costs. The ranges below are sourced, and each one says whether it's a ${city} estimate, a local contractor's published data, or a national benchmark. What you'll actually pay depends on what is moving, why, and how many supports it takes to stop it.`;
}

function encapFaqs(city: string, firstAnswer: string) {
  return [
    {
      question: `How much does crawl space encapsulation cost in ${city}?`,
      answer: firstAnswer,
    },
    {
      question: "Do I need a dehumidifier?",
      answer:
        "In a humid climate, usually yes. ENERGY STAR's closed-crawlspace guide calls for dehumidification to hold 30–50% RH when the space can't be conditioned [M3]. Installed units run about $1,000–$3,000 nationally [N6].",
    },
    {
      question: "Will encapsulation fix sagging floors?",
      answer: `No. A liner controls moisture. Sagging framing needs structural repair, which is priced separately. See the ${city} foundation repair cost page.`,
    },
    {
      question: "How do I get an accurate price?",
      answer:
        "Get an on-site inspection and an itemized written quote that lists liner thickness, vent and rim sealing, dehumidifier model, and any drainage.",
    },
    {
      question: "Is there a permit?",
      answer: "It depends on the municipality. Nationally, permits run $50–$250 when required [N5].",
    },
  ];
}

function foundationFaqs(city: string, firstAnswer: string) {
  return [
    {
      question: `How much does foundation repair cost in ${city}?`,
      answer: firstAnswer,
    },
    {
      question: "Should I get a structural engineer first?",
      answer:
        "For anything beyond hairline cracks, an independent report ($340–$780 nationally [N1]) helps you compare contractor proposals.",
    },
    {
      question: "How much does one pier cost?",
      answer: "Nationally $1,000–$3,000 per pier [N1]. Most settlement repairs use several.",
    },
    {
      question: "Is a crawl-space moisture problem a foundation problem?",
      answer: `Sometimes both. Damp framing and settling posts often show up together. See the ${city} crawl space encapsulation cost page.`,
    },
    {
      question: "Is a permit required?",
      answer: "Usually for structural work. Nationally, permits average $75–$150 [N2].",
    },
  ];
}

function angiEncapAnswer(city: string, range: string, average: string, sourceId: string) {
  return `Angi estimates ${range} in ${city}, averaging ${average} [${sourceId}] Your quote depends on size, moisture and repairs needed first.`;
}

function angiFoundationAnswer(city: string, range: string, average: string, sourceId: string) {
  return `Angi estimates ${range} in ${city}, averaging ${average} [${sourceId}] Pier count and access drive most of the difference.`;
}

type PageSeed = {
  service: CostServiceKey;
  slug: CostMetroSlug;
  cityName: string;
  state: string;
  title: string;
  description: string;
  labelKind: PriceLabelKind;
  label: string;
  range: string;
  sourceNote: string;
  localCover: string[];
  factors: string[];
  related: CostLink;
  firstFaq: string;
};

function buildPage(seed: PageSeed): CostPage {
  const encap = seed.service === "encapsulation";
  const path = costPath(seed.service, seed.slug);
  const sourceIds = extractCitationIds(seed.sourceNote);
  const place = `${seed.cityName}, ${seed.state}`;
  return {
    service: seed.service,
    slug: seed.slug,
    cityName: seed.cityName,
    state: seed.state,
    title: seed.title,
    description: seed.description,
    h1: encap
      ? `Crawl space encapsulation cost in ${place}`
      : `Foundation repair cost in ${place}`,
    path,
    price: {
      labelKind: seed.labelKind,
      label: seed.label,
      range: seed.range,
      sourceNote: seed.sourceNote,
      sourceIds,
      accessed: SOURCE_ACCESSED,
    },
    lede: encap ? encapLede(seed.cityName) : foundationLede(seed.cityName),
    ctaLabel: encap
      ? `Get encapsulation quotes in ${seed.cityName}`
      : `Get foundation repair quotes in ${seed.cityName}`,
    ctaMicrocopy: encap
      ? `Goes to founding contractors who serve ${seed.cityName}. No obligation.`
      : undefined,
    sections: [
      {
        heading: "What the price range covers",
        bullets: encap
          ? [...ENCAP_COVER_HEAD, ...seed.localCover, ENCAP_NATIONAL]
          : [...FOUNDATION_COVER_HEAD, ...seed.localCover, FOUNDATION_NATIONAL],
      },
      {
        heading: `What moves the price in ${seed.cityName}`,
        bullets: seed.factors,
      },
    ],
    signs: encap ? ENCAP_SIGNS : FOUNDATION_SIGNS,
    signsCta: encap
      ? {
          href: moistureChecklistHref(seed.slug),
          label: "Score your crawl space with the free moisture checklist",
        }
      : undefined,
    faqs: encap
      ? encapFaqs(seed.cityName, seed.firstFaq)
      : foundationFaqs(seed.cityName, seed.firstFaq),
    links: {
      hub: {
        href: `/cities/${seed.slug}`,
        label: encap
          ? `${seed.cityName} crawl space encapsulation contractors`
          : `${seed.cityName} foundation repair contractors`,
      },
      sibling: encap
        ? {
            href: foundationCostPath(seed.slug),
            label: `foundation repair cost in ${seed.cityName}`,
          }
        : {
            href: encapsulationCostPath(seed.slug),
            label: `crawl space encapsulation cost in ${seed.cityName}`,
          },
      tool: {
        href: moistureChecklistHref(seed.slug),
        label: "crawl space moisture checklist",
      },
      related: seed.related,
    },
  };
}

const PAGES: readonly CostPage[] = [
  buildPage({
    service: "encapsulation",
    slug: "tampa",
    cityName: "Tampa",
    state: "FL",
    title: "Tampa Crawl Space Encapsulation Cost",
    description:
      "Tampa crawl space encapsulation cost: $5,045–$15,135, sourced. What drives price up or down, plus free quotes from local pros.",
    labelKind: "city",
    label: "City estimate",
    range: "$5,045–$15,135",
    sourceNote: "Angi's Tampa estimate (average $5,550) [TPA-E1]",
    localCover: ["Angi's Tampa page lists a crawl space dehumidifier at $810–$3,030 [TPA-E1]."],
    factors: [
      "**What pushes Tampa quotes up:** Angi's Tampa page names tropical humidity, heavy summer rain, high groundwater and hurricane-season flooding as the reasons projects here often go past a basic liner to include drainage and a dehumidifier [TPA-E1].",
      "**What keeps a quote down:** a dry, reachable crawl space with decent clearance and no standing water usually needs only the liner, vent sealing and a dehumidifier, not drainage.",
      "**Tampa housing mix:** Angi notes slab foundations are common here [TPA-F1]. If your home does have a crawl space, expect the contractor to check the posts and beams as well as the moisture.",
    ],
    related: {
      href: encapsulationCostPath("orlando"),
      label: "Orlando crawl space encapsulation cost",
    },
    firstFaq: angiEncapAnswer("Tampa", "$5,045–$15,135", "$5,550", "TPA-E1"),
  }),
  buildPage({
    service: "encapsulation",
    slug: "houston",
    cityName: "Houston",
    state: "TX",
    title: "Houston Crawl Space Encapsulation Cost",
    description:
      "Houston crawl space encapsulation cost: $4,930–$14,790, sourced. What drives price up or down, plus free quotes from local pros.",
    labelKind: "city",
    label: "City estimate",
    range: "$4,930–$14,790",
    sourceNote: "Angi's Houston estimate (average $5,423) [HOU-E1]",
    localCover: ["Angi's Houston page lists a dehumidifier at $790–$2,960 [HOU-E1]."],
    factors: [
      "**Why Houston crawl spaces get wet:** Angi's Houston page points to heavy rainfall, high humidity, flooding risk and the area's pier-and-beam homes, and notes that projects here often include drainage work [HOU-E1].",
      "**Encapsulation vs. leveling:** in Houston a crawl space is usually a pier-and-beam house. If floors are sloping, you probably need a leveling quote as well as a moisture quote. Olshan reports its 2026 Houston pier-and-beam repair and leveling jobs average $10,763 [HOU-F3].",
      "**What keeps a quote down:** no standing water, good clearance and sound framing.",
    ],
    related: {
      href: "/cities/dallas-fort-worth",
      label: "Dallas–Fort Worth contractors",
    },
    firstFaq: angiEncapAnswer("Houston", "$4,930–$14,790", "$5,423", "HOU-E1"),
  }),
  buildPage({
    service: "encapsulation",
    slug: "jacksonville",
    cityName: "Jacksonville",
    state: "FL",
    title: "Jacksonville Crawl Space Encapsulation Cost",
    description:
      "Jacksonville crawl space encapsulation cost: national range plus local contractor pricing, sourced. Musty or wet crawl space? Get local quotes.",
    labelKind: "national",
    label: "National range (no Jacksonville-specific range published)",
    range: "$1,500–$15,000",
    sourceNote:
      "This Old House national range (average $5,500) [N7]. No published Jacksonville-wide range was found.",
    localCover: [
      "**Local contractor figure:** Queen Foundation Repair, a Jacksonville contractor, puts a 2,000 sq ft crawl space at **about $6,000–$14,000** in Jacksonville, or roughly $3–$7 per sq ft installed [JAX-E1]. That is one contractor's published pricing for one size, not a citywide average.",
    ],
    factors: [
      "**Sand and a shallow water table:** Queen describes older Jacksonville houses (San Marco, Avondale, Murray Hill) as raised on piers over open sand with the water table close underneath [JAX-E1]. Moisture from that ground rises into the house above.",
      "**What pushes quotes up:** water actually standing under the house means drainage goes in before the liner. Low clearance adds labor, and so does sagging framing that needs new posts or beams [JAX-E1][N6].",
      "**What keeps it down:** a dry crawl space with good headroom usually needs only the liner, vent sealing and a dehumidifier.",
    ],
    related: {
      href: encapsulationCostPath("orlando"),
      label: "Orlando crawl space encapsulation cost",
    },
    firstFaq:
      "$1,500–$15,000 (national), This Old House national range (average $5,500) [N7]. No published Jacksonville-wide range was found. Your quote depends on size, moisture and repairs needed first.",
  }),
  buildPage({
    service: "encapsulation",
    slug: "orlando",
    cityName: "Orlando",
    state: "FL",
    title: "Orlando Crawl Space Encapsulation Cost",
    description:
      "Orlando crawl space encapsulation cost: $5,070–$15,210, sourced. What drives price up or down, plus free quotes from local pros.",
    labelKind: "city",
    label: "City estimate",
    range: "$5,070–$15,210",
    sourceNote: "Angi's Orlando estimate (average $5,577) [ORL-E1]",
    localCover: [
      "Angi's Orlando page lists a dehumidifier at $810–$3,040 and permits at $50–$250 [ORL-E1].",
    ],
    factors: [
      "**Climate:** Angi's Orlando page points to the wet, humid climate as the reason crawl spaces here see mold, damp insulation, wood rot and pests [ORL-E1].",
      "**What pushes quotes up:** drainage problems, damaged framing and sagging floors are the add-ons that stretch the range on Angi's Orlando page [ORL-E1].",
      "**What keeps it down:** a clean, dry space where the crew can go straight to the liner and sealing.",
    ],
    related: {
      href: encapsulationCostPath("tampa"),
      label: "Tampa crawl space encapsulation cost",
    },
    firstFaq: angiEncapAnswer("Orlando", "$5,070–$15,210", "$5,577", "ORL-E1"),
  }),
  buildPage({
    service: "encapsulation",
    slug: "atlanta",
    cityName: "Atlanta",
    state: "GA",
    title: "Atlanta Crawl Space Encapsulation Cost",
    description:
      "Atlanta crawl space encapsulation cost: $1,502–$20,020, sourced. What drives price up or down, plus free quotes from local pros.",
    labelKind: "city",
    label: "City estimate",
    range: "$1,502–$20,020",
    sourceNote: "Angi's Atlanta estimate (average $5,506) [ATL-E1]",
    localCover: ["Angi's Atlanta page lists a dehumidifier at $800–$3,000 [ATL-E1]."],
    factors: [
      "**Older in-town crawl spaces:** Angi notes that crawl spaces are common in Atlanta's older neighborhoods and often have moisture, mold and pest problems that call for encapsulation [ATL-F1].",
      "**Red clay:** Angi also cites Atlanta's red clay soil and humid climate as reasons settling and moisture intrusion are common [ATL-F1].",
      "**Why the range is so wide:** Angi's Atlanta range runs from simple vent sealing and insulation up to full liners with dehumidifiers and sump pumps [ATL-E1]. Ask every contractor to itemize.",
    ],
    related: {
      href: encapsulationCostPath("charlotte"),
      label: "Charlotte crawl space encapsulation cost",
    },
    firstFaq: angiEncapAnswer("Atlanta", "$1,502–$20,020", "$5,506", "ATL-E1"),
  }),
  buildPage({
    service: "encapsulation",
    slug: "charlotte",
    cityName: "Charlotte",
    state: "NC",
    title: "Charlotte Crawl Space Encapsulation Cost",
    description:
      "Charlotte crawl space encapsulation cost: $4,865–$14,595, sourced. What drives price up or down, plus free quotes from local pros.",
    labelKind: "city",
    label: "City estimate",
    range: "$4,865–$14,595",
    sourceNote: "Angi's Charlotte estimate (average $5,352) [CLT-E1]",
    localCover: [
      "Carolina Encapsulation Company, a local contractor, publishes **$5,000–$15,000** for a complete Charlotte-metro system and **$7,500–$11,000** for a 1,000 sq ft crawl space [CLT-E2].",
    ],
    factors: [
      "**Humid summers, damp winters:** Angi's Charlotte page cites the climate as what sets up moisture intrusion under the house [CLT-E1].",
      "**Red clay:** a local contractor cites Mecklenburg County's red clay holding moisture near foundations [CLT-E2]. Angi describes local soil as dense and poorly draining [CLT-F1].",
      "**What pushes quotes up:** standing water, which needs drainage first; low clearance; and old barriers that have to be torn out [CLT-E2]. Permits on Angi's Charlotte page run $50–$400 [CLT-E1].",
    ],
    related: {
      href: encapsulationCostPath("atlanta"),
      label: "Atlanta crawl space encapsulation cost",
    },
    firstFaq: angiEncapAnswer("Charlotte", "$4,865–$14,595", "$5,352", "CLT-E1"),
  }),
  buildPage({
    service: "encapsulation",
    slug: "nashville",
    cityName: "Nashville",
    state: "TN",
    title: "Nashville Crawl Space Encapsulation Cost",
    description:
      "Nashville crawl space encapsulation cost: $5,000–$15,000, sourced. What drives price up or down, plus free quotes from local pros.",
    labelKind: "contractor",
    label: "Local contractor-published range",
    range: "$5,000–$15,000",
    sourceNote:
      "published by DocAir, a Nashville contractor [NSH-E1]. No publisher-wide Nashville range was found.",
    localCover: [
      "Olshan Foundation Repair reports an average of **$9,605** for its 2026 Nashville encapsulation jobs [NSH-E2].",
    ],
    factors: [
      "**Rain and clay:** DocAir cites Nashville's rainfall and clay soils as the reasons crawl-space moisture control matters here [NSH-E1].",
      "**Limestone underneath:** the Nashville (Central) Basin is mostly underlain by limestone karst [G2]. Soil depth over rock varies a lot, which affects drainage.",
      "**What pushes quotes up:** mold treatment, sump or drainage, structural repairs and larger dehumidifiers [NSH-E1][N6].",
    ],
    related: {
      href: encapsulationCostPath("atlanta"),
      label: "Atlanta crawl space encapsulation cost",
    },
    firstFaq:
      "$5,000–$15,000, published by DocAir, a Nashville contractor [NSH-E1]. No publisher-wide Nashville range was found. Your quote depends on size, moisture and repairs needed first.",
  }),
  buildPage({
    service: "foundation",
    slug: "tampa",
    cityName: "Tampa",
    state: "FL",
    title: "Foundation Repair Cost in Tampa, FL",
    description:
      "Foundation repair cost in Tampa: $2,732–$9,057, sourced. What drives the price, warning signs, and free quotes from local pros.",
    labelKind: "city",
    label: "City estimate",
    range: "$2,732–$9,057",
    sourceNote: "Angi's Tampa estimate (average $5,894) [TPA-F1]",
    localCover: [
      "Angi's Tampa page lists crack repair at $800–$3,800 and differential settlement at $5,000–$29,500. Foundation contractors there charge $95–$205 an hour, and permits run about $35–$200 [TPA-F1].",
    ],
    factors: [
      "**Soil and water:** Angi notes Tampa's limestone-rich soil and high water table. That's why most homes sit on slabs and why basements are rare [TPA-F1].",
      "**Sinkhole questions:** Florida sits on porous limestone karst, and sinkholes are a common landform statewide [G1]. A crack is not proof of a sinkhole. If a contractor raises the possibility, ask whether a geotechnical investigation is warranted before anyone quotes piers.",
      "**What drives cost up:** confirmed settlement that needs piers (national benchmark $1,000–$3,000 per pier [N1]), large repair areas, and poor access such as driveways, pools or landscaping.",
    ],
    related: {
      href: foundationCostPath("orlando"),
      label: "Orlando foundation repair cost",
    },
    firstFaq: angiFoundationAnswer("Tampa", "$2,732–$9,057", "$5,894", "TPA-F1"),
  }),
  buildPage({
    service: "foundation",
    slug: "houston",
    cityName: "Houston",
    state: "TX",
    title: "Foundation Repair Cost in Houston, TX",
    description:
      "Foundation repair cost in Houston: $3,276–$6,729, sourced. What drives the price, warning signs, and free quotes from local pros.",
    labelKind: "city",
    label: "City estimate",
    range: "$3,276–$6,729",
    sourceNote: "Angi's Houston estimate (average $5,003) [HOU-F1]",
    localCover: [
      "Angi's national guide lists Houston at $3,300–$6,800 [HOU-F2].",
      "Olshan Foundation Repair, a Houston contractor, reports an average of **$7,854** for its 2026 Houston foundation repairs, and says average repairs range from $3,050 to $7,650 [HOU-F3].",
    ],
    factors: [
      "**Clay soil:** Olshan describes Greater Houston as expansive clay soil with extreme weather swings and a high water table in many areas [HOU-F3]. Olshan also notes that clay soil shrinks under homes during drought [HOU-F3].",
      "**Slab or pier-and-beam:** Angi notes basements are rare in Houston and that slab and pier-and-beam homes, which cost less to repair, pull the local average down [HOU-F1].",
      "**What drives cost up:** how many piers are needed (national benchmark $1,000–$3,000 each [N1]), interior piers that require tunneling or breaking through the slab, and drainage fixes to stop repeat movement.",
    ],
    related: {
      href: "/cities/dallas-fort-worth",
      label: "Dallas–Fort Worth foundation repair",
    },
    firstFaq: angiFoundationAnswer("Houston", "$3,276–$6,729", "$5,003", "HOU-F1"),
  }),
  buildPage({
    service: "foundation",
    slug: "jacksonville",
    cityName: "Jacksonville",
    state: "FL",
    title: "Foundation Repair Cost in Jacksonville, FL",
    description:
      "Foundation repair cost in Jacksonville: sourced national range plus local contractor data. Cracks or settling? Get quotes from local pros.",
    labelKind: "national",
    label: "National range (no Jacksonville-specific range published)",
    range: "$2,225–$8,133",
    sourceNote:
      "HomeAdvisor / Angi national range (average $5,174) [N1][N2]. No published Jacksonville-specific range was found.",
    localCover: [
      "**Florida (statewide) contractor figure:** Queen Foundation Repair says most Florida foundation jobs land between **$2,000 and $12,000**, with piers at $1,200–$2,000 each [JAX-F1]. That figure is statewide, not Jacksonville-specific.",
    ],
    factors: [
      "**Raised homes on sand:** in the older neighborhoods, Queen says posts press down into sand that was never compacted and beams sag between them. Near the river, supports may have to go 15–25 ft deep to reach firm material [JAX-F1].",
      "**Sinkhole worry vs. reality:** Queen notes Duval County sits well away from the Pasco–Hernando–Hillsborough sinkhole belt. Washouts, settling fill or leaking lines are more common causes here [JAX-F1]. Statewide, Florida's limestone karst makes sinkholes a common landform [G1], so ask for a proper investigation before anyone uses the word.",
      "**What drives cost up:** pier count and depth, interior access, and drainage work to stop water getting under the house again.",
    ],
    related: {
      href: foundationCostPath("orlando"),
      label: "Orlando foundation repair cost",
    },
    firstFaq:
      "No publisher we checked gives a Jacksonville-specific range. Nationally it is $2,225–$8,133, averaging $5,174 [N1][N2]. See the local contractor data above. Pier count and access drive most of the difference.",
  }),
  buildPage({
    service: "foundation",
    slug: "orlando",
    cityName: "Orlando",
    state: "FL",
    title: "Foundation Repair Cost in Orlando, FL",
    description:
      "Foundation repair cost in Orlando: $1,943–$10,263, sourced. What drives the price, warning signs, and free quotes from local pros.",
    labelKind: "city",
    label: "City estimate",
    range: "$1,943–$10,263",
    sourceNote: "Angi's Orlando estimate (average $5,509) [ORL-F1]",
    localCover: [],
    factors: [
      "**Wetlands and new grading:** Angi names wetland areas and mass grading for new subdivisions as Orlando-specific foundation risks, since shifting fill can move a slab after construction [ORL-F1].",
      "**Karst:** like the rest of Florida, the Orlando area sits on limestone karst where sinkholes occur [G1]. Ask for a geotechnical opinion if a contractor raises it.",
      "**What drives cost up:** the number of piers (national benchmark $1,000–$3,000 each [N1]), soil stabilization, and whether drainage has to be fixed first.",
    ],
    related: {
      href: foundationCostPath("tampa"),
      label: "Tampa foundation repair cost",
    },
    firstFaq: angiFoundationAnswer("Orlando", "$1,943–$10,263", "$5,509", "ORL-F1"),
  }),
  buildPage({
    service: "foundation",
    slug: "atlanta",
    cityName: "Atlanta",
    state: "GA",
    title: "Foundation Repair Cost in Atlanta, GA",
    description:
      "Foundation repair cost in Atlanta: $2,253–$6,876, sourced. What drives the price, warning signs, and free quotes from local pros.",
    labelKind: "city",
    label: "City estimate",
    range: "$2,253–$6,876",
    sourceNote: "Angi's Atlanta estimate (average $4,544) [ATL-F1]",
    localCover: [],
    factors: [
      "**Clay, storms, roots:** Angi names red clay soil, erosion from intense summer storms, and large tree roots in established neighborhoods as Atlanta foundation drivers [ATL-F1].",
      "**Mixed housing stock:** older brick and block homes sit alongside newer slabs [ATL-F1]. Crawl-space homes may need new supports as well as moisture work.",
      "**What drives cost up:** piering (national benchmark $1,000–$3,000 per pier [N1]), bowing-wall reinforcement, and drainage.",
    ],
    related: {
      href: foundationCostPath("charlotte"),
      label: "Charlotte foundation repair cost",
    },
    firstFaq: angiFoundationAnswer("Atlanta", "$2,253–$6,876", "$4,544", "ATL-F1"),
  }),
  buildPage({
    service: "foundation",
    slug: "charlotte",
    cityName: "Charlotte",
    state: "NC",
    title: "Foundation Repair Cost in Charlotte, NC",
    description:
      "Foundation repair cost in Charlotte: $2,873–$12,299, sourced. What drives the price, warning signs, and free quotes from local pros.",
    labelKind: "city",
    label: "City estimate",
    range: "$2,873–$12,299",
    sourceNote: "Angi's Charlotte estimate (average $7,586) [CLT-F1]",
    localCover: [
      "Angi notes that Charlotte's 7.25% sales tax applies to both labor and materials on this work, and that a city contractor license is only required above $30,000 [CLT-F1].",
    ],
    factors: [
      "**Soil:** Angi describes dense, poorly draining soil and a high water table, which is why basements are rare and slabs and crawl spaces dominate [CLT-F1].",
      "**What drives cost up:** pier count (national benchmark $1,000–$3,000 each [N1]), drainage correction, and crawl-space framing repairs.",
      "**What keeps it down:** catching cracks early. Nationally, crack repair runs $250–$800 [N1][N4].",
    ],
    related: {
      href: foundationCostPath("atlanta"),
      label: "Atlanta foundation repair cost",
    },
    firstFaq: angiFoundationAnswer("Charlotte", "$2,873–$12,299", "$7,586", "CLT-F1"),
  }),
  buildPage({
    service: "foundation",
    slug: "nashville",
    cityName: "Nashville",
    state: "TN",
    title: "Foundation Repair Cost in Nashville, TN",
    description:
      "Foundation repair cost in Nashville: sourced national range plus local contractor data. Cracks or settling? Get quotes from local pros.",
    labelKind: "national",
    label: "National range (no Nashville-specific range published)",
    range: "$2,225–$8,133",
    sourceNote:
      "HomeAdvisor / Angi national range (average $5,174) [N1][N2]. No published Nashville-specific range was found.",
    localCover: [
      "**Local contractor average:** Olshan Foundation Repair reports an average of **$9,196** for its 2026 Nashville foundation repairs, and $8,095 across all foundation services [NSH-F1]. Olshan publishes an average only, no range. It comes from one contractor's jobs, so treat it as a data point, not a citywide range.",
    ],
    factors: [
      "**Karst geology:** most of the Nashville Basin sits on limestone, and sinkholes are among its karst landforms [G2]. USGS notes that karst processes can leave voids in the soil above the rock [G2].",
      "**What drives cost up:** pier count and depth to rock (national pier benchmark $1,000–$3,000 each [N1]), drainage correction, and combining repair with waterproofing.",
      "**What keeps it down:** early crack repair (national $250–$800 [N1][N4]) and fixing downspouts or grading before movement gets worse.",
    ],
    related: {
      href: foundationCostPath("atlanta"),
      label: "Atlanta foundation repair cost",
    },
    firstFaq:
      "No publisher we checked gives a Nashville-specific range. Nationally it is $2,225–$8,133, averaging $5,174 [N1][N2]. See the local contractor data above. Pier count and access drive most of the difference.",
  }),
];

const PAGE_INDEX = new Map(PAGES.map((page) => [`${page.service}:${page.slug}`, page]));

export function getAllCostPages(): readonly CostPage[] {
  return PAGES;
}

export function getCostPage(service: CostServiceKey, slug: string): CostPage | null {
  if (!isCostMetro(slug)) return null;
  return PAGE_INDEX.get(`${service}:${slug}`) ?? null;
}

export function costPageTexts(page: CostPage): string[] {
  return [
    page.price.sourceNote,
    page.lede,
    ...page.sections.flatMap((section) => section.bullets),
    ...page.signs,
    ...page.faqs.map((faq) => faq.answer),
  ];
}

export function costPageCitationIds(page: CostPage): string[] {
  return orderedCitationIds(costPageTexts(page));
}

export function costPageCitationNotes(page: CostPage): Record<string, number> {
  return citationNotes(costPageTexts(page));
}

export function costPageSources(page: CostPage) {
  return costPageCitationIds(page).map((id) => {
    const source = getSource(id);
    if (!source) throw new Error(`Missing source ${id} on ${page.path}`);
    return source;
  });
}
