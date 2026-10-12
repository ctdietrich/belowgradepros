import { WAVE1_HUB_SLUGS } from "./hubs";
import { publishedListingWhere } from "./listing-status";
import { prisma } from "./prisma";

function logStaticParamFailure(label: string, error: unknown) {
  const code =
    error && typeof error === "object" && "code" in error && typeof (error as { code: unknown }).code === "string"
      ? (error as { code: string }).code
      : error instanceof Error
        ? error.name
        : "unknown";
  console.error(`[static] ${label} generateStaticParams failed; rendering on demand:`, code);
}

/** Wave 1 hubs plus cities already stored. Empty when the database cannot be reached. */
export async function cityStaticParams(): Promise<{ slug: string }[]> {
  try {
    const cities = await prisma.city.findMany({ select: { slug: true } });
    const slugs = [...new Set<string>([...WAVE1_HUB_SLUGS, ...cities.map((city) => city.slug)])];
    return slugs.map((slug) => ({ slug }));
  } catch (error) {
    logStaticParamFailure("city", error);
    return [];
  }
}

/** Published listing slugs. Empty when the database cannot be reached. */
export async function listingStaticParams(): Promise<{ slug: string }[]> {
  try {
    const listings = await prisma.listing.findMany({
      where: publishedListingWhere,
      select: { slug: true },
    });
    return listings.map((listing) => ({ slug: listing.slug }));
  } catch (error) {
    logStaticParamFailure("listing", error);
    return [];
  }
}
