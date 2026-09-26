import type { City, Listing, Prisma } from "@prisma/client";
import { matchesPrimaryFilter, normalizeAdditionalService } from "./config";
import { catalogCityFallback, getWave1Hub } from "./hubs";
import { publishedListingWhere } from "./listing-status";
import { prisma } from "./prisma";

export type ListingWithCities = Listing & {
  cities: { city: City }[];
};

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

export function listingCover(listing: Pick<Listing, "photos">) {
  return asStringArray(listing.photos)[0] ?? null;
}

export function listingBadges(listing: Pick<Listing, "services">) {
  return asStringArray(listing.services);
}

export function listingServices(listing: Pick<Listing, "services">) {
  return listingBadges(listing);
}

/** Public mailto / JSON-LD email. Blank and @example.com placeholders stay hidden. */
export function publicContactEmail(email: string | null | undefined): string | null {
  const value = (email ?? "").trim();
  if (!value) return null;
  if (value.toLowerCase().endsWith("@example.com")) return null;
  return value;
}

const published = publishedListingWhere;

export async function getPublishedListings(filters?: {
  type?: string;
  citySlug?: string;
  service?: string;
  query?: string;
  featured?: boolean;
}) {
  const where: Prisma.ListingWhereInput = { ...published };

  if (filters?.type) where.type = filters.type;
  if (filters?.featured) where.featured = true;
  if (filters?.citySlug) {
    where.cities = {
      some: { city: { slug: filters.citySlug } },
    };
  }
  if (filters?.query) {
    where.OR = [
      { name: { contains: filters.query, mode: "insensitive" } },
      { tagline: { contains: filters.query, mode: "insensitive" } },
      { bio: { contains: filters.query, mode: "insensitive" } },
      { homeCity: { contains: filters.query, mode: "insensitive" } },
    ];
  }

  const listings = await prisma.listing.findMany({
    where,
    include: { cities: { include: { city: true } } },
    orderBy: [{ founding: "desc" }, { featured: "desc" }, { name: "asc" }],
  });

  if (!filters?.service) return listings;

  return listings.filter((listing) => {
    if (matchesPrimaryFilter(listing.primaryService, filters.service)) return true;
    const badge = normalizeAdditionalService(filters.service ?? "");
    if (!badge) return false;
    return listingBadges(listing).some((item) => normalizeAdditionalService(item) === badge);
  });
}

export async function getListingBySlug(slug: string, includeDraft = false) {
  return prisma.listing.findFirst({
    where: includeDraft ? { slug } : { slug, ...published },
    include: { cities: { include: { city: true } } },
  });
}

export async function getCities() {
  return prisma.city.findMany({
    include: {
      listings: {
        where: { listing: published },
        include: { listing: true },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function getCityBySlug(slug: string) {
  const city = await prisma.city.findUnique({
    where: { slug },
    include: {
      listings: {
        where: { listing: published },
        include: { listing: true },
      },
    },
  });
  const hub = getWave1Hub(slug);
  if (city) {
    if (!hub) return city;
    return { ...city, name: hub.name, description: hub.description };
  }
  return catalogCityFallback(slug);
}

export async function getClaimableListings() {
  return prisma.listing.findMany({
    where: { claimable: true, ...published },
    orderBy: { name: "asc" },
    select: { id: true, name: true, type: true, slug: true },
  });
}

/** Match a claim deep link (slug or Prisma id) against an already-loaded set. Blank refs match nothing. */
export function findListingByRef<T extends { id: string; slug: string }>(
  listings: readonly T[],
  ref?: string | null,
): T | null {
  const value = ref?.trim();
  if (!value) return null;
  return listings.find((item) => item.id === value || item.slug === value) ?? null;
}

/**
 * `/claim` with no listing ref stays the generic form.
 * A ref that does not match a published listing (slug or id) is a 404.
 */
export function missingPublishedClaimTarget(
  ref: string | null | undefined,
  publishedMatch: { id: string } | null | undefined,
): boolean {
  if (!ref?.trim()) return false;
  return publishedMatch == null;
}

/** Published listing addressed by public slug or Prisma id. Drafts never match. */
export async function getPublishedListingByRef(ref?: string | null) {
  const value = ref?.trim();
  if (!value) return null;
  return prisma.listing.findFirst({
    where: {
      ...published,
      OR: [{ id: value }, { slug: value }],
    },
    select: { id: true, slug: true, name: true, claimable: true },
  });
}

/** Public deep link: `/claim?listing={slug}` (preferred) or `/claim?listing={id}`. Drafts never match. */
export async function resolveClaimableListing(ref?: string | null) {
  if (!ref?.trim()) return null;
  return findListingByRef(await getClaimableListings(), ref);
}
