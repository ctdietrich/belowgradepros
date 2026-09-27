import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { costPageCitationIds, costPageTexts, getAllCostPages, getCostPage } from "./cost-pages";
import { COST_METRO_SLUGS, publicGuidePaths } from "./cost-paths";
import { toolCitedTexts, toolCitationIds } from "./moisture-checklist";
import { allSources, getSource, SOURCE_ACCESSED } from "./sources";

const HEADLINES: Record<string, { range: string; kind: "city" | "contractor" | "national" }> = {
  "encapsulation:tampa": { range: "$5,045–$15,135", kind: "city" },
  "encapsulation:houston": { range: "$4,930–$14,790", kind: "city" },
  "encapsulation:jacksonville": { range: "$1,500–$15,000", kind: "national" },
  "encapsulation:orlando": { range: "$5,070–$15,210", kind: "city" },
  "encapsulation:atlanta": { range: "$1,502–$20,020", kind: "city" },
  "encapsulation:charlotte": { range: "$4,865–$14,595", kind: "city" },
  "encapsulation:nashville": { range: "$5,000–$15,000", kind: "contractor" },
  "foundation:tampa": { range: "$2,732–$9,057", kind: "city" },
  "foundation:houston": { range: "$3,276–$6,729", kind: "city" },
  "foundation:jacksonville": { range: "$2,225–$8,133", kind: "national" },
  "foundation:orlando": { range: "$1,943–$10,263", kind: "city" },
  "foundation:atlanta": { range: "$2,253–$6,876", kind: "city" },
  "foundation:charlotte": { range: "$2,873–$12,299", kind: "city" },
  "foundation:nashville": { range: "$2,225–$8,133", kind: "national" },
};

/** Dollar amounts published in the 2026-09-27 source register. Pages may only use these. */
const ALLOWED_DOLLARS = new Set([
  "2", "3", "4", "7", "10", "35", "50", "75", "95", "100", "120", "150", "200", "205", "250", "300",
  "340", "400", "500", "600", "780", "790", "800", "810", "1000", "1200", "1300", "1500", "1502", "1800",
  "1943", "2000", "2224", "2225", "2253", "2500", "2732", "2800", "2873", "2960", "3000", "3030",
  "3040", "3050", "3276", "3300", "3800", "4000", "4500", "4544", "4865", "4930", "5000", "5003",
  "5045", "5070", "5174", "5179", "5352", "5423", "5500", "5506", "5509", "5550", "5577", "5894",
  "6000", "6500", "6729", "6800", "6876", "7000", "7500", "7586", "7650", "7854", "8095", "8133",
  "8134", "9057", "9100", "9196", "9605", "10000", "10263", "10763", "11000", "12000", "12299",
  "14000", "14595", "14790", "15000", "15135", "15210", "16000", "20000", "20020", "25000", "29500",
  "30000",
]);

function dollarAmounts(text: string): string[] {
  return [...text.matchAll(/\$(\d{1,3}(?:,\d{3})*|\d+)/g)].map((match) => match[1].replace(/,/g, ""));
}

test("source register ids are unique and each URL was accessed Sep 27, 2026", () => {
  const ids = allSources().map((source) => source.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const source of allSources()) {
    assert.match(source.url, /^https:\/\//, source.id);
    assert.equal(source.accessed, SOURCE_ACCESSED, source.id);
    assert.equal(getSource(source.id)?.url, source.url);
  }
});

test("every cost page has a price block and every cited source resolves", () => {
  const pages = getAllCostPages();
  assert.equal(pages.length, 14);
  assert.equal(new Set(pages.map((page) => page.path)).size, 14);

  for (const page of pages) {
    const key = `${page.service}:${page.slug}`;
    const expected = HEADLINES[key];
    assert.ok(expected, key);
    assert.equal(page.price.range, expected.range, key);
    assert.equal(page.price.labelKind, expected.kind, key);
    assert.equal(page.price.accessed, "Sep 27, 2026", key);
    assert.ok(page.price.sourceIds.length > 0, `${key} price source`);
    assert.ok(page.price.label.length > 0, key);
    if (page.price.labelKind === "national") {
      assert.match(page.price.label, /national/i, key);
    }

    const cited = costPageCitationIds(page);
    assert.ok(cited.length > 0, key);
    for (const id of page.price.sourceIds) {
      assert.ok(cited.includes(id), `${key} price source ${id} is cited`);
    }
    for (const id of cited) {
      const source = getSource(id);
      assert.ok(source, `${key} missing ${id}`);
      assert.match(source.url, /^https:\/\//);
      assert.equal(source.accessed, "Sep 27, 2026");
    }

    assert.equal(page.faqs.length, 5, key);
    assert.equal(page.h1.includes("BelowGradePros"), false);
    assert.equal(page.title.includes("BelowGradePros"), false);
    assert.ok(page.description.length <= 155, `${key} meta ${page.description.length}`);
    assert.ok(page.links.hub.href === `/cities/${page.slug}`);
    assert.match(page.links.tool.href, /^\/tools\/crawl-space-moisture-checklist/);
  }
});

test("unknown cost slugs are not published", () => {
  assert.equal(getCostPage("encapsulation", "miami"), null);
  assert.equal(getCostPage("foundation", "dallas-fort-worth"), null);
  assert.equal(getCostPage("encapsulation", "Tampa"), null);
});

test("public guide paths are the 15 sitemap URLs", () => {
  const paths = publicGuidePaths();
  assert.equal(paths.length, 15);
  for (const slug of COST_METRO_SLUGS) {
    assert.ok(paths.includes(`/cost/crawl-space-encapsulation/${slug}`));
    assert.ok(paths.includes(`/cost/foundation-repair/${slug}`));
  }
  assert.ok(paths.includes("/tools/crawl-space-moisture-checklist"));
  const sitemap = readFileSync(new URL("../app/sitemap.ts", import.meta.url), "utf8");
  assert.match(sitemap, /publicGuidePaths\(\)/);
});

test("cost and checklist copy only uses sourced dollar amounts", () => {
  const texts = [
    ...getAllCostPages().flatMap((page) => [
      page.description,
      page.price.range,
      page.price.sourceNote,
      ...costPageTexts(page),
    ]),
    ...toolCitedTexts(),
  ];
  const offenders: string[] = [];
  for (const text of texts) {
    for (const amount of dollarAmounts(text)) {
      if (!ALLOWED_DOLLARS.has(amount)) offenders.push(amount);
    }
  }
  assert.deepEqual(offenders, []);
});

test("checklist citations resolve to the source register", () => {
  for (const id of toolCitationIds()) {
    const source = getSource(id);
    assert.ok(source, id);
    assert.equal(source.accessed, "Sep 27, 2026");
    assert.match(source.url, /^https:\/\//);
  }
});
