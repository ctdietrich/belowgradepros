import { PRODUCTION_SITE_URL } from "./config";

export const FOUNDING_BADGE_WIDTH = 240;
export const FOUNDING_BADGE_HEIGHT = 64;
export const FOUNDING_BADGE_ALT = "Founding Pro on BelowGradePros";

/** Public listing slugs from `slugify`. Rejects dots, slashes, and quotes. */
export function isBadgeSlug(slug: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

export function foundingBadgeEmbedHtml(slug: string) {
  const origin = PRODUCTION_SITE_URL.replace(/\/$/, "");
  return `<a href="${origin}/l/${slug}"><img src="${origin}/badge/${slug}.svg" alt="${FOUNDING_BADGE_ALT}" width="${FOUNDING_BADGE_WIDTH}" height="${FOUNDING_BADGE_HEIGHT}"></a>`;
}

function xmlEscape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function badgeName(name: string) {
  const trimmed = name.replace(/\s+/g, " ").trim();
  if (trimmed.length <= 28) return trimmed;
  return `${trimmed.slice(0, 27).trimEnd()}…`;
}

/** Embeddable Founding Pro mark. Listing name is escaped for SVG text. */
export function foundingBadgeSvg(listingName: string) {
  const name = xmlEscape(badgeName(listingName) || "Founding Pro");
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${FOUNDING_BADGE_WIDTH}" height="${FOUNDING_BADGE_HEIGHT}" viewBox="0 0 ${FOUNDING_BADGE_WIDTH} ${FOUNDING_BADGE_HEIGHT}" role="img" aria-label="${FOUNDING_BADGE_ALT}">
  <title>${FOUNDING_BADGE_ALT}</title>
  <rect width="${FOUNDING_BADGE_WIDTH}" height="${FOUNDING_BADGE_HEIGHT}" rx="8" fill="#1E293B"/>
  <rect width="6" height="${FOUNDING_BADGE_HEIGHT}" fill="#D97706"/>
  <text x="18" y="26" fill="#F7F4F0" font-family="Georgia, 'Times New Roman', serif" font-size="15">Founding Pro</text>
  <text x="18" y="46" fill="#C9B8A6" font-family="system-ui, sans-serif" font-size="12">${name}</text>
</svg>`;
}
