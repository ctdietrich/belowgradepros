import type { Listing } from "@prisma/client";
import { matchesPrimaryFilter, normalizeAdditionalService } from "./config";

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

export function listingBadges(listing: { services: unknown }) {
  return asStringArray(listing.services);
}

export function listingServices(listing: Pick<Listing, "services">) {
  return listingBadges(listing);
}

/** Same rule as the public listing query: primary desk, then additional-service badges. */
export function listingMatchesServiceFilter(
  listing: { primaryService: string; services: unknown },
  service?: string | null,
): boolean {
  if (!service) return true;
  if (matchesPrimaryFilter(listing.primaryService, service)) return true;
  const badge = normalizeAdditionalService(service);
  if (!badge) return false;
  return listingBadges(listing).some((item) => normalizeAdditionalService(item) === badge);
}
