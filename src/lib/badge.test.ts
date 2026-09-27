import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  FOUNDING_BADGE_ALT,
  foundingBadgeEmbedHtml,
  foundingBadgeSvg,
  isBadgeSlug,
} from "./badge";

test("founding badge embed uses the production listing and svg urls", () => {
  assert.equal(
    foundingBadgeEmbedHtml("acme-foundation"),
    `<a href="https://belowgradepros.com/l/acme-foundation"><img src="https://belowgradepros.com/badge/acme-foundation.svg" alt="${FOUNDING_BADGE_ALT}" width="240" height="64"></a>`,
  );
});

test("founding badge svg names the pro and escapes text", () => {
  const svg = foundingBadgeSvg("Acme & Sons <script>");
  assert.match(svg, /^<\?xml/);
  assert.match(svg, /<svg /);
  assert.match(svg, /Founding Pro/);
  assert.match(svg, /Acme &amp; Sons &lt;script&gt;/);
  assert.equal(svg.includes("<script>"), false);
});

test("badge slugs are public listing slugs only", () => {
  assert.equal(isBadgeSlug("acme-foundation"), true);
  assert.equal(isBadgeSlug("a"), true);
  assert.equal(isBadgeSlug("Acme"), false);
  assert.equal(isBadgeSlug("acme.svg"), false);
  assert.equal(isBadgeSlug("../etc"), false);
  assert.equal(isBadgeSlug("acme foundation"), false);
});

test("badge routes 404 unless the listing is a published founding pro", () => {
  const page = readFileSync(new URL("../app/badge/[slug]/page.tsx", import.meta.url), "utf8");
  const route = readFileSync(new URL("../app/badge/svg/[slug]/route.ts", import.meta.url), "utf8");
  for (const source of [page, route]) {
    assert.match(source, /getFoundingBadgeListing/);
    assert.match(source, /notFound\(\)/);
  }
  const gate = readFileSync(new URL("./listings.ts", import.meta.url), "utf8");
  assert.match(gate, /export async function getFoundingBadgeListing/);
  assert.match(gate, /founding: true/);
});
