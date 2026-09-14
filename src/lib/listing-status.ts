/** Listing publication statuses written to Prisma, plus CSV / admin aliases. */

export const LISTING_STATUSES = ["draft", "published"] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];

/** Ops / desk values that may appear on the public directory. */
const PUBLISHED_ALIASES = new Set([
  "published",
  "publish",
  "live",
  "public",
  "approved",
  "active",
  "hero",
]);

/**
 * Ops pipeline values that stay off the public site until an admin publishes.
 * BGP: `candidate` and `ready` are NOT published (FTF mapped them live).
 */
const DRAFT_ALIASES = new Set([
  "draft",
  "candidate",
  "qa_pass",
  "qa-pass",
  "ready",
  "review",
  "pending",
  "unpublished",
  "hidden",
  "wip",
  "hold",
  "qa_fail",
  "qa-fail",
  "reject",
  "rejected",
]);

const REJECT_ALIASES = new Set(["qa_fail", "qa-fail", "reject", "rejected"]);

/** Stored statuses that appear on the public directory. */
export const PUBLIC_LISTING_STATUSES = ["published"] as const;

export const publishedListingWhere = {
  status: { in: [...PUBLIC_LISTING_STATUSES] },
};

export function isPublicListingStatus(status: string | null | undefined): boolean {
  return normalizeListingStatus(status, "draft") === "published";
}

export function isRejectListingStatus(raw?: string | null): boolean {
  return REJECT_ALIASES.has((raw ?? "").trim().toLowerCase().replace(/\s+/g, "_"));
}

/**
 * Map CSV / form values onto the two statuses the admin form stores.
 * Empty import values default to `draft` — do not auto-publish.
 */
export function normalizeListingStatus(
  raw?: string | null,
  empty: ListingStatus = "draft",
): ListingStatus {
  const value = (raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  if (!value) return empty;
  if (PUBLISHED_ALIASES.has(value)) return "published";
  if (DRAFT_ALIASES.has(value)) return "draft";
  return empty;
}
