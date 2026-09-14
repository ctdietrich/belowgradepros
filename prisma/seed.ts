import { PrismaClient } from "@prisma/client";

// Destructive sample data. For curated hero CSVs use `npm run import:listings`
// (see docs/import-listings.md). Seed wipes listings; the importer upserts.

const prisma = new PrismaClient();

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`;

async function main() {
  await prisma.claimRequest.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.listingCity.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.city.deleteMany();

  const cities = await Promise.all(
    [
      {
        slug: "houston",
        name: "Houston",
        state: "TX",
        region: "Gulf Coast",
        description:
          "Greater Houston clay soils, pier-and-beam bungalows, and slab suburbs from the Energy Corridor to the Bay. Foundation movement and crawl-space moisture are the daily bread.",
        heroImage: img("photo-1531218150217-54595bc2b934"),
      },
      {
        slug: "dallas-fort-worth",
        name: "Dallas–Fort Worth",
        state: "TX",
        region: "North Texas",
        description:
          "Expansive North Texas clay from Plano to Fort Worth. Post-tension slabs, older pier-and-beam neighborhoods, and a dense bench of foundation specialists.",
        heroImage: img("photo-1541829070764-84a7d30dd3f3"),
      },
      {
        slug: "austin",
        name: "Austin",
        state: "TX",
        region: "Central Texas",
        description:
          "Hill Country limestone, Edwards clay, and a housing stock that splits between older east-side pier-and-beam and newer west-side slabs.",
        heroImage: img("photo-1531218150217-54595bc2b934"),
      },
      {
        slug: "san-antonio",
        name: "San Antonio",
        state: "TX",
        region: "South Texas",
        description:
          "South Texas caliche and clay, historic districts on pier-and-beam, and a fast-growing slab ring. Encapsulation and waterproofing follow the humidity.",
        heroImage: img("photo-1570129477492-45c003edd2be"),
      },
      {
        slug: "tampa-bay",
        name: "Tampa Bay",
        state: "FL",
        region: "Gulf Coast",
        description:
          "Tampa, St. Petersburg, and Clearwater — high water tables, block homes, and crawl spaces that want encapsulation as much as they want structural repair.",
        heroImage: img("photo-1506905925346-21bda4d32df4"),
      },
      {
        slug: "orlando",
        name: "Orlando",
        state: "FL",
        region: "Central Florida",
        description:
          "Central Florida sand and clay, a mix of slab ranch houses and older crawl-space stock. Waterproofing and encapsulation share the calendar with foundation repair.",
        heroImage: img("photo-1564013799919-ab600027ffc6"),
      },
      {
        slug: "jacksonville",
        name: "Jacksonville",
        state: "FL",
        region: "First Coast",
        description:
          "First Coast humidity, older Riverside pier-and-beam, and a wide suburban slab ring. Moisture control is half the job.",
        heroImage: img("photo-1600585154340-be6161a56a0c"),
      },
      {
        slug: "miami-fort-lauderdale",
        name: "Miami–Fort Lauderdale",
        state: "FL",
        region: "South Florida",
        description:
          "South Florida limestone, CBS construction, and below-grade waterproofing in a climate that does not forgive a leak. Slab and structural repair sit next to encapsulation.",
        heroImage: img("photo-1514214246283-d427a95c5ca6"),
      },
    ].map((d) => prisma.city.create({ data: d })),
  );

  const bySlug = Object.fromEntries(cities.map((d) => [d.slug, d.id]));

  type ServiceKey =
    | "foundation_repair"
    | "encapsulation"
    | "waterproofing"
    | "pier_beam"
    | "slab";

  type SeedListing = {
    slug: string;
    type: "contractor";
    name: string;
    tagline: string;
    bio: string;
    contactEmail: string;
    website: string;
    phone?: string;
    homeCity: string;
    homeState: string;
    licenseId?: string;
    photos: string[];
    services: ServiceKey[];
    featured: boolean;
    verified: boolean;
    status: "published" | "draft";
    sourceUrl: string;
    claimable: boolean;
    claimedAt?: Date;
    citySlugs: string[];
  };

  const listings: SeedListing[] = [
    {
      slug: "gulf-coast-foundation-repair",
      type: "contractor",
      name: "Gulf Coast Foundation Repair",
      tagline: "Houston clay, steel piers, and a one-crew shop.",
      bio: "A Houston-based foundation shop that has worked the Energy Corridor, Bellaire, and the Bay for two decades. Gulf Coast runs steel-pier and slab programs, plus pier-and-beam releveling on older bungalows. Crews stay small; the owner still walks the first inspection.",
      contactEmail: "elena@example.com",
      website: "https://example.com/gulf-coast-foundation",
      phone: "+1-713-555-0142",
      homeCity: "Houston",
      homeState: "TX",
      licenseId: "TX-FR-10422",
      photos: [img("photo-1504307651254-35680f356dfd"), img("photo-1541888946425-d81bb19240f5")],
      services: ["foundation_repair", "pier_beam", "slab"],
      featured: true,
      verified: true,
      status: "published",
      sourceUrl: "https://example.com/gulf-coast-foundation",
      claimable: false,
      claimedAt: new Date("2024-11-02"),
      citySlugs: ["houston"],
    },
    {
      slug: "bayou-encapsulation-co",
      type: "contractor",
      name: "Bayou Encapsulation Co.",
      tagline: "Crawl-space envelopes for Houston humidity.",
      bio: "Bayou Encapsulation seals crawl spaces from the Heights to Sugar Land. Vapor barriers, sealed vents, and dehumidification are the program. They partner with foundation shops when the joists need sistering first.",
      contactEmail: "bayou@example.com",
      website: "https://example.com/bayou-encapsulation",
      phone: "+1-281-555-0188",
      homeCity: "Houston",
      homeState: "TX",
      licenseId: "TX-EN-22190",
      photos: [img("photo-1590725175785-de025cc60835")],
      services: ["encapsulation", "waterproofing"],
      featured: false,
      verified: true,
      status: "published",
      sourceUrl: "https://example.com/bayou-encapsulation",
      claimable: true,
      citySlugs: ["houston"],
    },
    {
      slug: "cypress-pier-beam",
      type: "contractor",
      name: "Cypress Pier & Beam",
      tagline: "Northwest Houston pier-and-beam, unhurried.",
      bio: "A Cypress-based pair who specialize in pier-and-beam releveling and crawl-space carpentry. They will encapsulate when the moisture load demands it, but they will not sell a liner over a rotten beam.",
      contactEmail: "cypress@example.com",
      website: "https://example.com/cypress-pier-beam",
      homeCity: "Cypress",
      homeState: "TX",
      photos: [img("photo-1560518883-ce09059eeffa")],
      services: ["pier_beam", "foundation_repair", "encapsulation"],
      featured: false,
      verified: false,
      status: "published",
      sourceUrl: "https://example.com/cypress-pier-beam",
      claimable: true,
      citySlugs: ["houston"],
    },
    {
      slug: "north-texas-slab-pros",
      type: "contractor",
      name: "North Texas Slab Pros",
      tagline: "DFW post-tension and conventional slab repair.",
      bio: "North Texas Slab Pros works Plano, Frisco, and Fort Worth slabs — post-tension cable repair, void fill, and steel-pier lift programs. Featured for a clean inspection report and a desk that answers the phone.",
      contactEmail: "slab@example.com",
      website: "https://example.com/north-texas-slab",
      phone: "+1-214-555-0190",
      homeCity: "Plano",
      homeState: "TX",
      licenseId: "TX-FR-33011",
      photos: [img("photo-1541888946425-d81bb19240f5"), img("photo-1503387762-592deb58ef4e")],
      services: ["slab", "foundation_repair"],
      featured: true,
      verified: true,
      status: "published",
      sourceUrl: "https://example.com/north-texas-slab",
      claimable: false,
      claimedAt: new Date("2025-03-14"),
      citySlugs: ["dallas-fort-worth"],
    },
    {
      slug: "metroplex-waterproofing",
      type: "contractor",
      name: "Metroplex Waterproofing",
      tagline: "Interior drains and crawl-space liners across DFW.",
      bio: "A Fort Worth–based waterproofing shop that also encapsulates. Interior drain tile, sump packages, and sealed crawl spaces. They do not lift slabs; they keep water off them.",
      contactEmail: "metroplex@example.com",
      website: "https://example.com/metroplex-waterproofing",
      homeCity: "Fort Worth",
      homeState: "TX",
      photos: [img("photo-1582407947304-fd86f028f716")],
      services: ["waterproofing", "encapsulation"],
      featured: false,
      verified: true,
      status: "published",
      sourceUrl: "https://example.com/metroplex-waterproofing",
      claimable: true,
      citySlugs: ["dallas-fort-worth"],
    },
    {
      slug: "hill-country-foundation",
      type: "contractor",
      name: "Hill Country Foundation",
      tagline: "Austin limestone and clay — one inspection, one crew.",
      bio: "Hill Country Foundation covers Austin and the western suburbs. Slab repair on the newer stock, pier-and-beam on the east side, and an owner who still writes the proposal. Featured for a long local bench.",
      contactEmail: "austin@example.com",
      website: "https://example.com/hill-country-foundation",
      phone: "+1-512-555-0166",
      homeCity: "Austin",
      homeState: "TX",
      licenseId: "TX-FR-18804",
      photos: [img("photo-1600596542815-ffad4c1539a9"), img("photo-1504307651254-35680f356dfd")],
      services: ["foundation_repair", "slab", "pier_beam"],
      featured: true,
      verified: true,
      status: "published",
      sourceUrl: "https://example.com/hill-country-foundation",
      claimable: true,
      citySlugs: ["austin"],
    },
    {
      slug: "barton-creek-encapsulation",
      type: "contractor",
      name: "Barton Creek Encapsulation",
      tagline: "West Austin crawl spaces, sealed and quiet.",
      bio: "A two-crew encapsulation shop that works west and south Austin. They will waterproof a basement wall when the house has one; most of the book is crawl-space liners and dehumidifiers.",
      contactEmail: "barton@example.com",
      website: "https://example.com/barton-creek-encap",
      homeCity: "Austin",
      homeState: "TX",
      photos: [img("photo-1590725175785-de025cc60835")],
      services: ["encapsulation", "waterproofing"],
      featured: false,
      verified: false,
      status: "published",
      sourceUrl: "https://example.com/barton-creek-encap",
      claimable: true,
      citySlugs: ["austin"],
    },
    {
      slug: "alamo-foundation-works",
      type: "contractor",
      name: "Alamo Foundation Works",
      tagline: "San Antonio slabs, piers, and historic crawl spaces.",
      bio: "Alamo Foundation Works covers the city and the north hills. They lift slabs, relevel pier-and-beam cottages, and will not pretend every house needs the same pier count.",
      contactEmail: "alamo@example.com",
      website: "https://example.com/alamo-foundation",
      phone: "+1-210-555-0133",
      homeCity: "San Antonio",
      homeState: "TX",
      licenseId: "TX-FR-27501",
      photos: [img("photo-1570129477492-45c003edd2be")],
      services: ["foundation_repair", "pier_beam", "slab"],
      featured: false,
      verified: true,
      status: "published",
      sourceUrl: "https://example.com/alamo-foundation",
      claimable: true,
      citySlugs: ["san-antonio"],
    },
    {
      slug: "riverwalk-crawl-space",
      type: "contractor",
      name: "Riverwalk Crawl Space Co.",
      tagline: "Encapsulation and waterproofing south of 1604.",
      bio: "A San Antonio moisture shop. Encapsulation, interior waterproofing, and the occasional French drain. They send foundation movement to a structural partner rather than selling a liner over a failing pier.",
      contactEmail: "riverwalk@example.com",
      website: "https://example.com/riverwalk-crawl",
      homeCity: "San Antonio",
      homeState: "TX",
      photos: [img("photo-1560518883-ce09059eeffa")],
      services: ["encapsulation", "waterproofing"],
      featured: false,
      verified: false,
      status: "published",
      sourceUrl: "https://example.com/riverwalk-crawl",
      claimable: true,
      citySlugs: ["san-antonio"],
    },
    {
      slug: "tampa-bay-foundation-co",
      type: "contractor",
      name: "Tampa Bay Foundation Co.",
      tagline: "Structural repair from Tampa to Clearwater.",
      bio: "Tampa Bay Foundation Co. lifts and stabilizes block and slab homes across the bay. They also encapsulate when the crawl space is the moisture source. Featured for a clear service split and a licensed structural desk.",
      contactEmail: "tampa@example.com",
      website: "https://example.com/tampa-bay-foundation",
      phone: "+1-813-555-0177",
      homeCity: "Tampa",
      homeState: "FL",
      licenseId: "CBC-1258901",
      photos: [img("photo-1504307651254-35680f356dfd"), img("photo-1514214246283-d427a95c5ca6")],
      services: ["foundation_repair", "slab", "encapsulation"],
      featured: true,
      verified: true,
      status: "published",
      sourceUrl: "https://example.com/tampa-bay-foundation",
      claimable: false,
      claimedAt: new Date("2025-01-09"),
      citySlugs: ["tampa-bay"],
    },
    {
      slug: "gulfshore-encapsulation",
      type: "contractor",
      name: "Gulfshore Encapsulation",
      tagline: "St. Pete and Clearwater crawl-space envelopes.",
      bio: "Gulfshore seals crawl spaces on the Pinellas side. High water tables, sandy soils, and a preference for closed envelopes with mechanical dehumidification.",
      contactEmail: "gulfshore@example.com",
      website: "https://example.com/gulfshore-encap",
      homeCity: "St. Petersburg",
      homeState: "FL",
      photos: [img("photo-1590725175785-de025cc60835")],
      services: ["encapsulation", "waterproofing"],
      featured: false,
      verified: true,
      status: "published",
      sourceUrl: "https://example.com/gulfshore-encap",
      claimable: true,
      citySlugs: ["tampa-bay"],
    },
    {
      slug: "orange-blossom-foundation",
      type: "contractor",
      name: "Orange Blossom Foundation",
      tagline: "Orlando slab and block repair, one crew.",
      bio: "Orange Blossom works Orlando and the south suburbs. Conventional slab repair, steel piers where the soil allows, and an honest no when the house needs a different trade.",
      contactEmail: "orange@example.com",
      website: "https://example.com/orange-blossom-foundation",
      homeCity: "Orlando",
      homeState: "FL",
      licenseId: "CBC-1184420",
      photos: [img("photo-1564013799919-ab600027ffc6")],
      services: ["foundation_repair", "slab"],
      featured: false,
      verified: true,
      status: "published",
      sourceUrl: "https://example.com/orange-blossom-foundation",
      claimable: true,
      citySlugs: ["orlando"],
    },
    {
      slug: "central-florida-crawl-space",
      type: "contractor",
      name: "Central Florida Crawl Space",
      tagline: "Encapsulation for ranch houses and older stock.",
      bio: "A Winter Park–based encapsulation shop covering Orange and Seminole counties. They waterproof when the wall is the leak; they encapsulate when the floor system is the sponge.",
      contactEmail: "cfcs@example.com",
      website: "https://example.com/cf-crawl-space",
      homeCity: "Winter Park",
      homeState: "FL",
      photos: [img("photo-1600585154340-be6161a56a0c")],
      services: ["encapsulation", "waterproofing"],
      featured: false,
      verified: false,
      status: "published",
      sourceUrl: "https://example.com/cf-crawl-space",
      claimable: true,
      citySlugs: ["orlando"],
    },
    {
      slug: "first-coast-pier-beam",
      type: "contractor",
      name: "First Coast Pier & Beam",
      tagline: "Riverside and San Marco crawl-space carpentry.",
      bio: "First Coast Pier & Beam relevels older Jacksonville houses and will encapsulate after the structure is sound. A small shop, booked through the humid months.",
      contactEmail: "firstcoast@example.com",
      website: "https://example.com/first-coast-pier",
      phone: "+1-904-555-0121",
      homeCity: "Jacksonville",
      homeState: "FL",
      photos: [img("photo-1560518883-ce09059eeffa")],
      services: ["pier_beam", "foundation_repair", "encapsulation"],
      featured: false,
      verified: true,
      status: "published",
      sourceUrl: "https://example.com/first-coast-pier",
      claimable: true,
      citySlugs: ["jacksonville"],
    },
    {
      slug: "st-johns-waterproofing",
      type: "contractor",
      name: "St. Johns Waterproofing",
      tagline: "Interior drains from Jacksonville to St. Augustine.",
      bio: "St. Johns Waterproofing runs interior drain tile and crawl-space liners on the First Coast. They do not lift foundations; they keep water out of them.",
      contactEmail: "stjohns@example.com",
      website: "https://example.com/st-johns-waterproofing",
      homeCity: "Jacksonville",
      homeState: "FL",
      photos: [img("photo-1582407947304-fd86f028f716")],
      services: ["waterproofing", "encapsulation"],
      featured: false,
      verified: false,
      status: "published",
      sourceUrl: "https://example.com/st-johns-waterproofing",
      claimable: true,
      citySlugs: ["jacksonville"],
    },
    {
      slug: "south-florida-foundation-pros",
      type: "contractor",
      name: "South Florida Foundation Pros",
      tagline: "Miami–Fort Lauderdale slab and structural repair.",
      bio: "South Florida Foundation Pros works CBS and slab homes from Miami to Broward. Structural repair first, waterproofing when the wall is the leak. Featured for a licensed desk and a clean service flag set.",
      contactEmail: "sofla@example.com",
      website: "https://example.com/south-florida-foundation",
      phone: "+1-305-555-0144",
      homeCity: "Miami",
      homeState: "FL",
      licenseId: "CBC-1321108",
      photos: [img("photo-1514214246283-d427a95c5ca6"), img("photo-1541888946425-d81bb19240f5")],
      services: ["foundation_repair", "slab", "waterproofing"],
      featured: true,
      verified: true,
      status: "published",
      sourceUrl: "https://example.com/south-florida-foundation",
      claimable: true,
      citySlugs: ["miami-fort-lauderdale"],
    },
    {
      slug: "everglades-encapsulation",
      type: "contractor",
      name: "Everglades Encapsulation",
      tagline: "South Florida crawl-space and basement envelopes.",
      bio: "Everglades Encapsulation seals the rare South Florida crawl space and the more common below-grade room. Humidity control is the product; they will not sell a liner over an active leak.",
      contactEmail: "everglades@example.com",
      website: "https://example.com/everglades-encap",
      homeCity: "Fort Lauderdale",
      homeState: "FL",
      photos: [img("photo-1590725175785-de025cc60835")],
      services: ["encapsulation", "waterproofing"],
      featured: false,
      verified: true,
      status: "published",
      sourceUrl: "https://example.com/everglades-encap",
      claimable: true,
      citySlugs: ["miami-fort-lauderdale"],
    },
    {
      slug: "broward-slab-pier",
      type: "contractor",
      name: "Broward Slab & Pier",
      tagline: "Slab, pier, and foundation — one Broward shop.",
      bio: "A Pompano-based shop that lists slab, pier-and-beam, and foundation repair. Multi-select is the point: they will tell you which flag applies after the inspection.",
      contactEmail: "broward@example.com",
      website: "https://example.com/broward-slab-pier",
      homeCity: "Pompano Beach",
      homeState: "FL",
      licenseId: "CBC-1093344",
      photos: [img("photo-1503387762-592deb58ef4e")],
      services: ["slab", "pier_beam", "foundation_repair"],
      featured: false,
      verified: false,
      status: "published",
      sourceUrl: "https://example.com/broward-slab-pier",
      claimable: true,
      citySlugs: ["miami-fort-lauderdale"],
    },
    {
      slug: "lone-star-draft-works",
      type: "contractor",
      name: "Lone Star Draft Works",
      tagline: "Austin-side draft listing — awaiting photos and claim.",
      bio: "A placeholder contractor listing sourced from public materials. Awaiting operator claim, verified photos, and a current license id before it is featured.",
      contactEmail: "draft@example.com",
      website: "https://example.com/lone-star-draft",
      homeCity: "Austin",
      homeState: "TX",
      photos: [img("photo-1570129477492-45c003edd2be")],
      services: ["foundation_repair"],
      featured: false,
      verified: false,
      status: "draft",
      sourceUrl: "https://example.com/lone-star-draft",
      claimable: true,
      citySlugs: ["austin"],
    },
  ];

  for (const listing of listings) {
    const { citySlugs, ...data } = listing;
    await prisma.listing.create({
      data: {
        ...data,
        cities: {
          create: citySlugs.map((slug) => ({
            cityId: bySlug[slug],
          })),
        },
      },
    });
  }

  console.log(`Seeded ${cities.length} city hubs and ${listings.length} listings.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
