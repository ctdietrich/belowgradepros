import { PrismaClient } from "@prisma/client";

// Destructive sample data. For curated CSVs use `npm run import:listings`.
// Seed wipes listings, metros, claims, and submissions.

const prisma = new PrismaClient();

async function main() {
  await prisma.claimRequest.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.metro.deleteMany();

  const metros = await Promise.all(
    [
      {
        slug: "houston",
        name: "Houston",
        state: "Texas",
        stateCode: "TX",
        description:
          "Expansive clay, high water tables, and a lot of slab and pier-and-beam housing. Houston homeowners usually need foundation movement diagnosed before they talk about finish work.",
      },
      {
        slug: "dallas",
        name: "Dallas–Fort Worth",
        state: "Texas",
        stateCode: "TX",
        description:
          "Blackland clay and long dry-wet cycles keep foundation repair busy across Dallas, Fort Worth, and the northern suburbs. Slab work and drainage sit next to crawl-space encapsulation.",
      },
      {
        slug: "atlanta",
        name: "Atlanta",
        state: "Georgia",
        stateCode: "GA",
        description:
          "Older crawl-space stock, humidity, and clay soils. Atlanta is an encapsulation market first — vapor barriers, sealed vents, and dehumidifier packages — with foundation repair close behind.",
      },
      {
        slug: "tampa",
        name: "Tampa Bay",
        state: "Florida",
        stateCode: "FL",
        description:
          "Groundwater, humidity, and coastal construction. Tampa Bay listings lean encapsulation and waterproofing, with slab and settlement work after storms and seasonal saturation.",
      },
      {
        slug: "chicago",
        name: "Chicago",
        state: "Illinois",
        stateCode: "IL",
        description:
          "Basements, frost, and older masonry. Chicago is a waterproofing and foundation-repair market — drain tile, wall anchors, and encapsulation when a basement is being finished.",
      },
    ].map((metro) => prisma.metro.create({ data: metro })),
  );

  const bySlug = Object.fromEntries(metros.map((metro) => [metro.slug, metro]));

  type SeedListing = {
    slug: string;
    name: string;
    city: string;
    state: string;
    metroSlug: string;
    phone?: string;
    website?: string;
    email: string;
    services: string[];
    description: string;
    sourceUrl?: string;
    published: boolean;
    featured: boolean;
    claimable: boolean;
  };

  const listings: SeedListing[] = [
    {
      slug: "bayou-grade-foundation-co",
      name: "Bayou Grade Foundation Co. (Sample)",
      city: "Houston",
      state: "TX",
      metroSlug: "houston",
      phone: "+1-713-555-0140",
      website: "https://example.com/bayou-grade",
      email: "desk@example.com",
      services: ["foundation_repair", "slab", "pier_and_beam"],
      description:
        "SAMPLE LISTING — not a real contractor. Houston clay-soil foundation repair desk covering slab settlement and pier-and-beam releveling inside the Loop and west toward Katy.",
      sourceUrl: "https://example.com/source/bayou-grade",
      published: true,
      featured: true,
      claimable: true,
    },
    {
      slug: "cypress-pier-beam-works",
      name: "Cypress Pier & Beam Works (Sample)",
      city: "Cypress",
      state: "TX",
      metroSlug: "houston",
      phone: "+1-281-555-0162",
      website: "https://example.com/cypress-pier",
      email: "pier@example.com",
      services: ["pier_and_beam", "foundation_repair"],
      description:
        "SAMPLE LISTING — not a real contractor. Northwest Houston pier-and-beam shop. Typical jobs are beam sistering, supplemental piers, and crawl-space access repairs on 1960s ranch houses.",
      published: true,
      featured: false,
      claimable: true,
    },
    {
      slug: "katy-encapsulation-lab",
      name: "Katy Encapsulation Lab (Sample)",
      city: "Katy",
      state: "TX",
      metroSlug: "houston",
      phone: "+1-281-555-0194",
      website: "https://example.com/katy-encap",
      email: "seal@example.com",
      services: ["encapsulation", "waterproofing"],
      description:
        "SAMPLE LISTING — not a real contractor. West Houston crawl-space encapsulation with vapor barrier, sealed vents, and a dehumidifier package. Waterproofing is offered when the soil line is the real problem.",
      published: true,
      featured: true,
      claimable: true,
    },
    {
      slug: "pearland-slab-specialists",
      name: "Pearland Slab Specialists (Sample)",
      city: "Pearland",
      state: "TX",
      metroSlug: "houston",
      phone: "+1-713-555-0118",
      website: "https://example.com/pearland-slab",
      email: "slab@example.com",
      services: ["slab", "foundation_repair"],
      description:
        "SAMPLE LISTING — not a real contractor. South Houston slab and post-tension repair. Used to show a slab-flagged listing in the Houston hub.",
      published: true,
      featured: false,
      claimable: true,
    },
    {
      slug: "heights-below-grade-repair",
      name: "Heights Below-Grade Repair (Sample)",
      city: "Houston",
      state: "TX",
      metroSlug: "houston",
      phone: "+1-713-555-0177",
      email: "heights@example.com",
      services: ["foundation_repair", "waterproofing"],
      description:
        "SAMPLE LISTING — not a real contractor. Inner-Loop foundation and below-grade waterproofing. Claimable sourced profile with no public website on file.",
      sourceUrl: "https://example.com/source/heights",
      published: true,
      featured: false,
      claimable: true,
    },
    {
      slug: "blackland-clay-foundations",
      name: "Blackland Clay Foundations (Sample)",
      city: "Dallas",
      state: "TX",
      metroSlug: "dallas",
      phone: "+1-214-555-0133",
      website: "https://example.com/blackland",
      email: "clay@example.com",
      services: ["foundation_repair", "slab"],
      description:
        "SAMPLE LISTING — not a real contractor. Dallas proper foundation repair for blackland clay. Featured so the DFW hub is not empty at the top of the page.",
      published: true,
      featured: true,
      claimable: true,
    },
    {
      slug: "trinity-pier-systems",
      name: "Trinity Pier Systems (Sample)",
      city: "Fort Worth",
      state: "TX",
      metroSlug: "dallas",
      phone: "+1-817-555-0109",
      website: "https://example.com/trinity-pier",
      email: "trinity@example.com",
      services: ["pier_and_beam", "foundation_repair"],
      description:
        "SAMPLE LISTING — not a real contractor. Fort Worth pier-and-beam and steel-pier work. Sample row for the Dallas–Fort Worth metro filter.",
      published: true,
      featured: false,
      claimable: true,
    },
    {
      slug: "plano-crawlspace-seal",
      name: "Plano CrawlSpace Seal (Sample)",
      city: "Plano",
      state: "TX",
      metroSlug: "dallas",
      phone: "+1-972-555-0188",
      website: "https://example.com/plano-seal",
      email: "plano@example.com",
      services: ["encapsulation", "waterproofing"],
      description:
        "SAMPLE LISTING — not a real contractor. Collin County encapsulation and interior drain work. Demonstrates an encapsulation-first DFW listing.",
      published: true,
      featured: false,
      claimable: true,
    },
    {
      slug: "fort-worth-grade-line",
      name: "Fort Worth Grade Line (Sample)",
      city: "Fort Worth",
      state: "TX",
      metroSlug: "dallas",
      phone: "+1-817-555-0155",
      website: "https://example.com/fw-grade",
      email: "grade@example.com",
      services: ["foundation_repair", "waterproofing", "slab"],
      description:
        "SAMPLE LISTING — not a real contractor. Mixed foundation, slab, and waterproofing desk used to test multi-service filters.",
      published: true,
      featured: false,
      claimable: true,
    },
    {
      slug: "piedmont-encapsulation-co",
      name: "Piedmont Encapsulation Co. (Sample)",
      city: "Atlanta",
      state: "GA",
      metroSlug: "atlanta",
      phone: "+1-404-555-0121",
      website: "https://example.com/piedmont-encap",
      email: "piedmont@example.com",
      services: ["encapsulation", "waterproofing"],
      description:
        "SAMPLE LISTING — not a real contractor. Intown Atlanta crawl-space encapsulation: 20-mil liner, sealed vents, and a sized dehumidifier. Featured Atlanta hub listing.",
      published: true,
      featured: true,
      claimable: true,
    },
    {
      slug: "decatur-crawl-and-pier",
      name: "Decatur Crawl & Pier (Sample)",
      city: "Decatur",
      state: "GA",
      metroSlug: "atlanta",
      phone: "+1-404-555-0166",
      website: "https://example.com/decatur-crawl",
      email: "decatur@example.com",
      services: ["pier_and_beam", "encapsulation"],
      description:
        "SAMPLE LISTING — not a real contractor. East Atlanta pier-and-beam repair plus encapsulation when the crawl is the moisture source.",
      published: true,
      featured: false,
      claimable: true,
    },
    {
      slug: "marietta-foundation-desk",
      name: "Marietta Foundation Desk (Sample)",
      city: "Marietta",
      state: "GA",
      metroSlug: "atlanta",
      phone: "+1-770-555-0144",
      website: "https://example.com/marietta-desk",
      email: "marietta@example.com",
      services: ["foundation_repair", "slab"],
      description:
        "SAMPLE LISTING — not a real contractor. Cobb County foundation and slab repair. Sample data only — addresses are example.com.",
      published: true,
      featured: false,
      claimable: true,
    },
    {
      slug: "east-point-moisture-barrier",
      name: "East Point Moisture Barrier (Sample)",
      city: "East Point",
      state: "GA",
      metroSlug: "atlanta",
      phone: "+1-404-555-0190",
      email: "eastpoint@example.com",
      services: ["encapsulation", "waterproofing"],
      description:
        "SAMPLE LISTING — not a real contractor. Southside Atlanta vapor-barrier and interior waterproofing crew. Claimable sourced profile.",
      sourceUrl: "https://example.com/source/east-point",
      published: true,
      featured: false,
      claimable: true,
    },
    {
      slug: "gulf-humidity-barriers",
      name: "Gulf Humidity Barriers (Sample)",
      city: "Tampa",
      state: "FL",
      metroSlug: "tampa",
      phone: "+1-813-555-0102",
      website: "https://example.com/gulf-humidity",
      email: "gulf@example.com",
      services: ["encapsulation", "waterproofing"],
      description:
        "SAMPLE LISTING — not a real contractor. Tampa crawl-space encapsulation for Gulf humidity. Featured so the Tampa Bay hub has a lead listing.",
      published: true,
      featured: true,
      claimable: true,
    },
    {
      slug: "st-pete-foundation-works",
      name: "St. Pete Foundation Works (Sample)",
      city: "St. Petersburg",
      state: "FL",
      metroSlug: "tampa",
      phone: "+1-727-555-0173",
      website: "https://example.com/stpete-foundation",
      email: "stpete@example.com",
      services: ["foundation_repair", "slab"],
      description:
        "SAMPLE LISTING — not a real contractor. Pinellas slab and settlement work after seasonal saturation. Sample directory row only.",
      published: true,
      featured: false,
      claimable: true,
    },
    {
      slug: "brandon-crawl-seal",
      name: "Brandon Crawl Seal (Sample)",
      city: "Brandon",
      state: "FL",
      metroSlug: "tampa",
      phone: "+1-813-555-0181",
      website: "https://example.com/brandon-seal",
      email: "brandon@example.com",
      services: ["encapsulation"],
      description:
        "SAMPLE LISTING — not a real contractor. Hillsborough encapsulation-only shop: liner, sealed vents, and dehumidifier packages. Useful for the encapsulation filter.",
      published: true,
      featured: false,
      claimable: true,
    },
    {
      slug: "clearwater-waterproofing-desk",
      name: "Clearwater Waterproofing Desk (Sample)",
      city: "Clearwater",
      state: "FL",
      metroSlug: "tampa",
      phone: "+1-727-555-0128",
      website: "https://example.com/clearwater-wp",
      email: "clearwater@example.com",
      services: ["waterproofing", "foundation_repair"],
      description:
        "SAMPLE LISTING — not a real contractor. Coastal waterproofing with foundation adjacency when walls have already moved.",
      published: true,
      featured: false,
      claimable: true,
    },
    {
      slug: "lakefront-basement-seal",
      name: "Lakefront Basement Seal (Sample)",
      city: "Chicago",
      state: "IL",
      metroSlug: "chicago",
      phone: "+1-312-555-0147",
      website: "https://example.com/lakefront-seal",
      email: "lakefront@example.com",
      services: ["waterproofing", "foundation_repair"],
      description:
        "SAMPLE LISTING — not a real contractor. North Side basement waterproofing and foundation repair. Featured Chicago listing for the hub page.",
      published: true,
      featured: true,
      claimable: true,
    },
    {
      slug: "oak-park-below-grade-co",
      name: "Oak Park Below-Grade Co. (Sample)",
      city: "Oak Park",
      state: "IL",
      metroSlug: "chicago",
      phone: "+1-708-555-0111",
      website: "https://example.com/oak-park-bg",
      email: "oakpark@example.com",
      services: ["waterproofing", "encapsulation"],
      description:
        "SAMPLE LISTING — not a real contractor. Near-west suburbs: interior drain tile, wall encapsulation, and finished-basement moisture control.",
      published: true,
      featured: false,
      claimable: true,
    },
    {
      slug: "naperville-foundation-repair",
      name: "Naperville Foundation Repair (Sample)",
      city: "Naperville",
      state: "IL",
      metroSlug: "chicago",
      phone: "+1-630-555-0199",
      website: "https://example.com/naperville-fr",
      email: "naperville@example.com",
      services: ["foundation_repair", "slab"],
      description:
        "SAMPLE LISTING — not a real contractor. DuPage County foundation and slab repair. Sample data for the Chicago metro and Illinois state filter.",
      published: true,
      featured: false,
      claimable: true,
    },
    {
      slug: "evanston-pier-and-drain",
      name: "Evanston Pier & Drain (Sample)",
      city: "Evanston",
      state: "IL",
      metroSlug: "chicago",
      phone: "+1-847-555-0136",
      website: "https://example.com/evanston-pier",
      email: "evanston@example.com",
      services: ["pier_and_beam", "waterproofing"],
      description:
        "SAMPLE LISTING — not a real contractor. North Shore pier work and basement drain systems. Shows a pier-and-beam flag outside Texas.",
      published: true,
      featured: false,
      claimable: true,
    },
    {
      slug: "bridgeport-grade-specialists",
      name: "Bridgeport Grade Specialists (Sample)",
      city: "Chicago",
      state: "IL",
      metroSlug: "chicago",
      email: "bridgeport@example.com",
      services: ["foundation_repair", "waterproofing"],
      description:
        "SAMPLE LISTING — not a real contractor. South Side sourced profile awaiting a claim. Unpublished draft used to keep one row off the public directory.",
      sourceUrl: "https://example.com/source/bridgeport",
      published: false,
      featured: false,
      claimable: true,
    },
  ];

  for (const listing of listings) {
    const metro = bySlug[listing.metroSlug];
    await prisma.listing.create({
      data: {
        slug: listing.slug,
        name: listing.name,
        city: listing.city,
        state: listing.state,
        metro: metro.name,
        metroSlug: metro.slug,
        phone: listing.phone,
        website: listing.website,
        email: listing.email,
        services: listing.services,
        description: listing.description,
        sourceUrl: listing.sourceUrl,
        published: listing.published,
        featured: listing.featured,
        claimable: listing.claimable,
      },
    });
  }

  console.log(`Seeded ${metros.length} metros and ${listings.length} sample listings.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
