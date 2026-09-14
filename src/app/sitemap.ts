import type { MetadataRoute } from "next";
import { absoluteUrl, cityPath, listingPath } from "@/lib/config";
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
  ].map((path) => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
  }));

  return [
    ...staticRoutes,
    ...cities.map((city) => ({
      url: absoluteUrl(cityPath(city.slug)),
      lastModified: new Date(),
    })),
    ...listings.map((listing) => ({
      url: absoluteUrl(listingPath(listing.slug)),
      lastModified: listing.updatedAt,
    })),
  ];
}
