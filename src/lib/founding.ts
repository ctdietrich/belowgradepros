import { publishedListingWhere } from "./listing-status";
import { prisma } from "./prisma";
import { foundingPriceLabel } from "./stripe";

/** Published founding listings allowed in one metro. */
export const FOUNDING_SPOTS_PER_CITY = 3;

export type FoundingCityRef = { slug: string; name: string };

/**
 * Full offer line for /founding, /claim, and listing CTAs.
 * `foundingPriceLabel()` is only the rate after the first real homeowner lead.
 * Metadata and buttons may shorten this, but must not contradict it.
 */
export function foundingOfferCopy() {
  return `Free until we send you your first real homeowner lead, then ${foundingPriceLabel()} locked. Cancel anytime. Exclusive leads, never shared or resold, no per-lead fees. Only 3 founding spots per city.`;
}

/** Spots remaining from a count of published founding listings in one city. */
export function foundingSpotsRemaining(publishedFoundingCount: number) {
  const count = Number.isFinite(publishedFoundingCount) ? Math.max(0, Math.floor(publishedFoundingCount)) : 0;
  return Math.max(0, FOUNDING_SPOTS_PER_CITY - count);
}

export function foundingSpotsLabel(spotsLeft: number) {
  return `${spotsLeft} of ${FOUNDING_SPOTS_PER_CITY} founding spots left`;
}

export function foundingSpotsFullMessage(cityName: string) {
  return `Founding spots in ${cityName} are full`;
}

/** Published listings with founding=true linked to this city slug. */
export async function foundingSpotsLeft(citySlug: string) {
  const slug = citySlug.trim();
  if (!slug) return FOUNDING_SPOTS_PER_CITY;
  const count = await prisma.listing.count({
    where: {
      founding: true,
      ...publishedListingWhere,
      cities: { some: { city: { slug } } },
    },
  });
  return foundingSpotsRemaining(count);
}

export async function foundingAvailability(cities: readonly FoundingCityRef[]) {
  const checks = await Promise.all(
    cities.map(async (city) => ({
      slug: city.slug,
      name: city.name,
      spotsLeft: await foundingSpotsLeft(city.slug),
    })),
  );
  const full = checks.find((city) => city.spotsLeft === 0);
  return {
    spotsOpen: !full,
    fullCityName: full?.name ?? null,
    checks,
  };
}
