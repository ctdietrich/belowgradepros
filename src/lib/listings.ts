import type { Listing, Metro, Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { normalizeServiceKey } from "./config";

export type ListingWithMetro = Listing & { metroHub: Metro };

export function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === "string");
      }
    } catch {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }
  return [];
}

export function listingServices(listing: Pick<Listing, "services">) {
  return asStringArray(listing.services);
}

const published: Prisma.ListingWhereInput = { published: true };

export async function getPublishedListings(filters?: {
  metroSlug?: string;
  state?: string;
  service?: string;
  query?: string;
  featured?: boolean;
}) {
  const where: Prisma.ListingWhereInput = { ...published };

  if (filters?.metroSlug) where.metroSlug = filters.metroSlug;
  if (filters?.state) {
    where.OR = [
      { state: { equals: filters.state, mode: "insensitive" } },
      { metroHub: { stateCode: { equals: filters.state, mode: "insensitive" } } },
    ];
  }
  if (filters?.featured) where.featured = true;
  if (filters?.query) {
    const queryFilter: Prisma.ListingWhereInput = {
      OR: [
        { name: { contains: filters.query, mode: "insensitive" } },
        { city: { contains: filters.query, mode: "insensitive" } },
        { metro: { contains: filters.query, mode: "insensitive" } },
        { description: { contains: filters.query, mode: "insensitive" } },
      ],
    };
    where.AND = [queryFilter];
  }

  const listings = await prisma.listing.findMany({
    where,
    include: { metroHub: true },
    orderBy: [{ featured: "desc" }, { name: "asc" }],
  });

  if (!filters?.service) return listings;

  const needle = normalizeServiceKey(filters.service) ?? filters.service.toLowerCase();
  return listings.filter((listing) =>
    listingServices(listing).some((item) => {
      const key = normalizeServiceKey(item) ?? item.toLowerCase();
      return key === needle;
    }),
  );
}

export async function getListingBySlug(slug: string, includeUnpublished = false) {
  return prisma.listing.findFirst({
    where: includeUnpublished ? { slug } : { slug, ...published },
    include: { metroHub: true },
  });
}

export async function getMetros() {
  return prisma.metro.findMany({
    include: {
      listings: { where: published },
    },
    orderBy: { name: "asc" },
  });
}

export async function getMetroBySlug(slug: string) {
  return prisma.metro.findUnique({
    where: { slug },
    include: {
      listings: { where: published },
    },
  });
}

export async function getStates() {
  const metros = await prisma.metro.findMany({
    select: { state: true, stateCode: true },
    orderBy: { state: "asc" },
  });
  const seen = new Set<string>();
  return metros.filter((metro) => {
    if (seen.has(metro.stateCode)) return false;
    seen.add(metro.stateCode);
    return true;
  });
}

export async function getClaimableListings() {
  return prisma.listing.findMany({
    where: { claimable: true, ...published },
    orderBy: { name: "asc" },
    select: { id: true, name: true, city: true, state: true, slug: true },
  });
}
