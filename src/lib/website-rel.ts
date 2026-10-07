/** Historical listing-page rel for a contractor website. */
export const DEFAULT_WEBSITE_LINK_REL = "noreferrer" as const;

/**
 * Rel for a contractor website we do not endorse.
 * `ugc` is omitted: that hint is for links inside visitor-written content.
 */
export const NOFOLLOW_WEBSITE_LINK_REL = "nofollow noopener noreferrer" as const;

/**
 * Listing slugs whose Website `<a>` is nofollowed. No database flag.
 * Champion Waterproofing's own site was compromised (casino spam in the footer).
 */
export const NOFOLLOW_WEBSITE_SLUGS = [
  "champion-waterproofing-foundation-repair-lexington-ky",
] as const;

const NOFOLLOW_WEBSITE_SLUG_SET: ReadonlySet<string> = new Set(NOFOLLOW_WEBSITE_SLUGS);

export function websiteLinkRel(
  slug: string,
): typeof DEFAULT_WEBSITE_LINK_REL | typeof NOFOLLOW_WEBSITE_LINK_REL {
  return NOFOLLOW_WEBSITE_SLUG_SET.has(slug) ? NOFOLLOW_WEBSITE_LINK_REL : DEFAULT_WEBSITE_LINK_REL;
}
