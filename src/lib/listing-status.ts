/** Listing publication statuses written to Prisma, plus CSV / admin aliases. */

export const LISTING_STATUSES = ["draft", "published"] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];

const PUBLISHED_ALIASES = new Set([
  "published",
  "publish",
  "live",
  "public",
  "ready",
  "candidate",
  "approved",
  "active",
  "hero",
]);

const DRAFT_ALIASES = new Set([
  "draft",
  "pending",
  "unpublished",
  "hidden",
  "review",
  "wip",
  "hold",
]);

/** Status values that should appear on the public directory. */
export const PUBLIC_LISTING_STATUSES = [
  "published",
  "candidate",
  "ready",
  "live",
  "approved",
  "active",
  "hero",
] as const;

export const publishedListingWhere = {
  status: { in: [...PUBLIC_LISTING_STATUSES] },
};

export function isPublicListingStatus(status: string | null | undefined): boolean {
  return PUBLISHED_ALIASES.has((status ?? "").trim().toLowerCase());
}

/**
 * Map CSV / form values onto the two statuses the admin form stores.
 * `candidate` and `ready` (hero-ops language) become `published`.
 * Empty import values default to `published`; pass `empty` to override.
 */
export function normalizeListingStatus(
  raw?: string | null,
  empty: ListingStatus = "draft",
): ListingStatus {
  const value = (raw ?? "").trim().toLowerCase();
  if (!value) return empty;
  if (PUBLISHED_ALIASES.has(value)) return "published";
  if (DRAFT_ALIASES.has(value)) return "draft";
  return empty;
}
