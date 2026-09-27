/** Public cost and checklist sources. Access date is the SEO package fetch date. */
export const SOURCE_ACCESSED = "Sep 27, 2026" as const;

export type Source = {
  id: string;
  publisher: string;
  title: string;
  url: string;
  accessed: typeof SOURCE_ACCESSED;
};

const SOURCES: readonly Source[] = [
  {
    id: "N1",
    publisher: "HomeAdvisor",
    title: "How Much Does Foundation Repair Cost",
    url: "https://www.homeadvisor.com/cost/foundations/repair-a-foundation/",
    accessed: SOURCE_ACCESSED,
  },
  {
    id: "N2",
    publisher: "Angi",
    title: "How Much Does Foundation Repair Cost",
    url: "https://www.angi.com/articles/how-much-does-foundation-repair-cost.htm",
    accessed: SOURCE_ACCESSED,
  },
  {
    id: "N3",
    publisher: "This Old House",
    title: "Foundation Repair Cost",
    url: "https://www.thisoldhouse.com/foundations/reviews/foundation-repair-cost",
    accessed: SOURCE_ACCESSED,
  },
  {
    id: "N4",
    publisher: "HomeGuide",
    title: "Foundation Repair Cost",
    url: "https://homeguide.com/costs/foundation-repair-cost",
    accessed: SOURCE_ACCESSED,
  },
  {
    id: "N5",
    publisher: "Angi",
    title: "Crawl Space Encapsulation Cost",
    url: "https://www.angi.com/articles/how-much-does-crawl-space-encapsulation-cost.htm",
    accessed: SOURCE_ACCESSED,
  },
  {
    id: "N6",
    publisher: "HomeGuide",
    title: "Crawl Space Encapsulation Cost",
    url: "https://homeguide.com/costs/crawl-space-encapsulation-cost",
    accessed: SOURCE_ACCESSED,
  },
  {
    id: "N7",
    publisher: "This Old House",
    title: "Crawl Space Encapsulation Cost",
    url: "https://www.thisoldhouse.com/foundations/crawl-space-encapsulation-cost",
    accessed: SOURCE_ACCESSED,
  },
  {
    id: "TPA-E1",
    publisher: "Angi",
    title: "Crawl Space Encapsulation Cost in Tampa, Florida",
    url: "https://www.angi.com/articles/how-much-does-crawl-space-encapsulation-cost/fl/tampa",
    accessed: SOURCE_ACCESSED,
  },
  {
    id: "TPA-F1",
    publisher: "Angi",
    title: "Foundation Repair Cost in Tampa, Florida",
    url: "https://www.angi.com/articles/how-much-does-foundation-repair-cost/fl/tampa",
    accessed: SOURCE_ACCESSED,
  },
  {
    id: "HOU-E1",
    publisher: "Angi",
    title: "Crawl Space Encapsulation Cost in Houston, Texas",
    url: "https://www.angi.com/articles/how-much-does-crawl-space-encapsulation-cost/tx/houston",
    accessed: SOURCE_ACCESSED,
  },
  {
    id: "HOU-F1",
    publisher: "Angi",
    title: "Foundation Repair Cost in Houston, Texas",
    url: "https://www.angi.com/articles/how-much-does-foundation-repair-cost/tx/houston",
    accessed: SOURCE_ACCESSED,
  },
  {
    id: "HOU-F2",
    publisher: "Angi",
    title: "How Much Does Foundation Repair Cost (Houston row)",
    url: "https://www.angi.com/articles/how-much-does-foundation-repair-cost.htm",
    accessed: SOURCE_ACCESSED,
  },
  {
    id: "HOU-F3",
    publisher: "Olshan Foundation Repair",
    title: "Houston Foundation Repair",
    url: "https://www.olshanfoundation.com/regions/texas/houston/",
    accessed: SOURCE_ACCESSED,
  },
  {
    id: "ORL-E1",
    publisher: "Angi",
    title: "Crawl Space Encapsulation Cost in Orlando, Florida",
    url: "https://www.angi.com/articles/how-much-does-crawl-space-encapsulation-cost/fl/orlando",
    accessed: SOURCE_ACCESSED,
  },
  {
    id: "ORL-F1",
    publisher: "Angi",
    title: "Foundation Repair Cost in Orlando, Florida",
    url: "https://www.angi.com/articles/how-much-does-foundation-repair-cost/fl/orlando",
    accessed: SOURCE_ACCESSED,
  },
  {
    id: "ATL-E1",
    publisher: "Angi",
    title: "Crawl Space Encapsulation Cost in Atlanta, Georgia",
    url: "https://www.angi.com/articles/how-much-does-crawl-space-encapsulation-cost/ga/atlanta",
    accessed: SOURCE_ACCESSED,
  },
  {
    id: "ATL-F1",
    publisher: "Angi",
    title: "Foundation Repair Cost in Atlanta, Georgia",
    url: "https://www.angi.com/articles/how-much-does-foundation-repair-cost/ga/atlanta",
    accessed: SOURCE_ACCESSED,
  },
  {
    id: "CLT-E1",
    publisher: "Angi",
    title: "Crawl Space Encapsulation Cost in Charlotte, North Carolina",
    url: "https://www.angi.com/articles/how-much-does-crawl-space-encapsulation-cost/nc/charlotte",
    accessed: SOURCE_ACCESSED,
  },
  {
    id: "CLT-E2",
    publisher: "Carolina Encapsulation Company",
    title: "Crawl Space Encapsulation Cost in Charlotte, NC",
    url: "https://ceccarolinas.com/crawl-space-encapsulation-cost-charlotte-nc/",
    accessed: SOURCE_ACCESSED,
  },
  {
    id: "CLT-F1",
    publisher: "Angi",
    title: "Foundation Repair Cost in Charlotte, North Carolina",
    url: "https://www.angi.com/articles/how-much-does-foundation-repair-cost/nc/charlotte",
    accessed: SOURCE_ACCESSED,
  },
  {
    id: "JAX-E1",
    publisher: "Queen Foundation Repair",
    title: "Foundation Repair in Jacksonville, FL",
    url: "https://queenfoundationrepair.com/locations/foundation-repair-jacksonville-fl/",
    accessed: SOURCE_ACCESSED,
  },
  {
    id: "JAX-F1",
    publisher: "Queen Foundation Repair",
    title: "Foundation Repair in Jacksonville, FL",
    url: "https://queenfoundationrepair.com/locations/foundation-repair-jacksonville-fl/",
    accessed: SOURCE_ACCESSED,
  },
  {
    id: "NSH-E1",
    publisher: "DocAir",
    title: "Crawl Space Encapsulation",
    url: "https://docair.com/home-performance/crawl-space-encapsulation/",
    accessed: SOURCE_ACCESSED,
  },
  {
    id: "NSH-E2",
    publisher: "Olshan Foundation Repair",
    title: "Nashville Foundation Repair",
    url: "https://www.olshanfoundation.com/regions/tennessee/nashville/",
    accessed: SOURCE_ACCESSED,
  },
  {
    id: "NSH-F1",
    publisher: "Olshan Foundation Repair",
    title: "Nashville Foundation Repair",
    url: "https://www.olshanfoundation.com/regions/tennessee/nashville/",
    accessed: SOURCE_ACCESSED,
  },
  {
    id: "G1",
    publisher: "Florida DEP, Florida Geological Survey",
    title: "Sinkholes",
    url: "https://floridadep.gov/fgs/sinkholes",
    accessed: SOURCE_ACCESSED,
  },
  {
    id: "G2",
    publisher: "USGS",
    title: "Karst aquifers in Tennessee (WRIR 97-4097)",
    url: "https://pubs.usgs.gov/wri/wri974097/text/karst.html",
    accessed: SOURCE_ACCESSED,
  },
  {
    id: "M1",
    publisher: "EPA",
    title: "A Brief Guide to Mold, Moisture and Your Home",
    url: "https://www.epa.gov/mold/brief-guide-mold-moisture-and-your-home",
    accessed: SOURCE_ACCESSED,
  },
  {
    id: "M2",
    publisher: "EPA",
    title: "Mold Course, Chapter 2",
    url: "https://www.epa.gov/mold/mold-course-chapter-2",
    accessed: SOURCE_ACCESSED,
  },
  {
    id: "M3",
    publisher: "ENERGY STAR",
    title: "Guide to Closing and Conditioning Ventilated Crawlspaces",
    url: "https://www.energystar.gov/sites/default/files/asset/document/Guide%20to%20Closing%20and%20Conditioning%20Ventilated%20Crawlspaces.pdf",
    accessed: SOURCE_ACCESSED,
  },
  {
    id: "M4",
    publisher: "USDA Forest Products Laboratory",
    title: "Wood Handbook (FPL-GTR-282), Chapter 14 Biodeterioration of Wood",
    url: "https://www.fpl.fs.usda.gov/documnts/fplgtr/fplgtr282/chapter_14_fpl_gtr282.pdf",
    accessed: SOURCE_ACCESSED,
  },
  {
    id: "M5",
    publisher: "U.S. DOE Building America",
    title: "Unvented, Conditioned Crawlspaces",
    url: "https://www.energy.gov/cmei/buildings/articles/unvented-conditioned-crawlspaces-building-america-top-innovation",
    accessed: SOURCE_ACCESSED,
  },
];

const BY_ID = new Map(SOURCES.map((source) => [source.id, source]));

export function allSources(): readonly Source[] {
  return SOURCES;
}

export function getSource(id: string): Source | undefined {
  return BY_ID.get(id);
}
