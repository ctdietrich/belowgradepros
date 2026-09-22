import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getHubDensify,
  HUB_DENSIFY,
  HUB_DENSIFY_SLUGS,
  isHubDensifySlug,
} from "./hub-densify";
import { HOMEPAGE_STRIP_SLUGS, WAVE1_HUB_SLUGS, getWave1Hub, hubPageHeading, hubPageTitle } from "./hubs";
import { hubDensifyFaqJsonLd } from "./jsonld";

test("densify covers exactly the eight moisture deepen hubs", () => {
  assert.deepEqual([...HUB_DENSIFY_SLUGS].sort(), [
    "charleston-sc",
    "daytona-beach",
    "fort-lauderdale",
    "fort-myers",
    "pensacola",
    "sarasota",
    "tallahassee",
    "west-palm-beach",
  ]);
  assert.equal(isHubDensifySlug("miami"), false);
  assert.equal(getHubDensify("miami"), null);
  assert.equal(getHubDensify("tampa"), null);
});

test("each densify hub has encap CTA, exactly three FAQs, and two related cities", () => {
  for (const slug of HUB_DENSIFY_SLUGS) {
    const densify = HUB_DENSIFY[slug];
    assert.ok(densify.encapCta.length > 40, slug);
    assert.equal(densify.faqs.length, 3, slug);
    assert.equal(densify.related.length, 2, slug);
    for (const faq of densify.faqs) {
      assert.ok(faq.question.length > 8, `${slug} FAQ q`);
      assert.ok(faq.answer.length > 20, `${slug} FAQ a`);
    }
    for (const related of densify.related) {
      assert.ok((WAVE1_HUB_SLUGS as readonly string[]).includes(related.slug), `${slug}→${related.slug}`);
      assert.match(related.anchor, /crawl space encapsulation/i);
      assert.ok(!related.anchor.toLowerCase().includes("mold"));
      assert.ok(!related.anchor.toLowerCase().includes("waterproofing"));
    }
  }
});

test("densify does not change locked titles, meta, or H1s", () => {
  for (const slug of HUB_DENSIFY_SLUGS) {
    const hub = getWave1Hub(slug);
    assert.ok(hub, slug);
    assert.equal(hubPageTitle(slug), hub.title);
    assert.equal(hubPageHeading(slug), "h1" in hub && hub.h1 ? hub.h1 : hub.title);
    assert.ok(hub.description.length > 20);
  }
});

test("densify hubs stay off the homepage moisture strip", () => {
  for (const slug of HUB_DENSIFY_SLUGS) {
    assert.ok(!(HOMEPAGE_STRIP_SLUGS as readonly string[]).includes(slug), slug);
  }
});

test("Fort Lauderdale related set never points at Miami", () => {
  const densify = getHubDensify("fort-lauderdale");
  assert.ok(densify);
  assert.ok(!densify.related.some((item) => item.slug === "miami"));
  assert.ok(densify.faqs.some((item) => /miami/i.test(item.question) || /miami/i.test(item.answer)));
});

test("FAQ JSON-LD emits three Question entities", () => {
  const densify = getHubDensify("fort-myers");
  assert.ok(densify);
  const json = hubDensifyFaqJsonLd(densify);
  assert.equal(json["@type"], "FAQPage");
  assert.equal(json.mainEntity.length, 3);
  assert.equal(json.mainEntity[0]["@type"], "Question");
});

test("Charleston densify always frames Charleston, SC", () => {
  const densify = getHubDensify("charleston-sc");
  assert.ok(densify);
  assert.match(densify.encapCta, /Charleston, SC/);
  assert.ok(densify.faqs.some((item) => item.answer.includes("charleston-sc")));
});
