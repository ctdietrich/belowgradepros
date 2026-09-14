import type { MetadataRoute } from "next";
import { absoluteUrl, listingPath, metroPath } from "@/lib/config";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [listings, metros] = await Promise.all([
    prisma.listing.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.metro.findMany({ select: { slug: true } }),
  ]);

  const staticRoutes = ["", "/search", "/metros", "/submit", "/claim", "/for-contractors", "/about"].map(
    (path) => ({
      url: absoluteUrl(path),
      lastModified: new Date(),
    }),
  );

  return [
    ...staticRoutes,
    ...metros.map((metro) => ({
      url: absoluteUrl(metroPath(metro.slug)),
      lastModified: new Date(),
    })),
    ...listings.map((listing) => ({
      url: absoluteUrl(listingPath(listing.slug)),
      lastModified: listing.updatedAt,
    })),
  ];
}
