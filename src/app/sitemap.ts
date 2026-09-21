import type { MetadataRoute } from "next";
import { absoluteUrl, cityPath, listingPath } from "@/lib/config";
import { WAVE1_HUB_SLUGS } from "@/lib/hubs";
import { publishedListingWhere } from "@/lib/listing-status";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [listings, cities] = await Promise.all([
    prisma.listing.findMany({
      where: publishedListingWhere,
      select: { slug: true, updatedAt: true },
    }),
    prisma.city.findMany({ select: { slug: true } }),
  ]);

  const staticRoutes = [
    "",
    "/cities",
    "/contractors",
    "/services",
    "/services/foundation",
    "/services/encapsulation",
    "/submit",
    "/claim",
    "/founding",
    "/about",
    "/how-it-works",
    "/contact",
  ].map((path) => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
  }));

  const citySlugs = [...new Set([...WAVE1_HUB_SLUGS, ...cities.map((city) => city.slug)])];

  // Index the bare hub only. In-app `?service=` filters stay off the sitemap.
  const cityRoutes = citySlugs.map((slug) => ({
    url: absoluteUrl(cityPath(slug)),
    lastModified: new Date(),
  }));

  return [
    ...staticRoutes,
    ...cityRoutes,
    ...listings.map((listing) => ({
      url: absoluteUrl(listingPath(listing.slug)),
      lastModified: listing.updatedAt,
    })),
  ].filter((entry) => !entry.url.includes("?"));
}
