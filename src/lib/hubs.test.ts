import assert from "node:assert/strict";
import { test } from "node:test";
import {
  HOMEPAGE_STRIP_SLUGS,
  WAVE1_HUB_SLUGS,
  buildCityIndex,
  getWave1Hub,
  hubPageDescription,
  hubPageHeading,
  hubPageTitle,
  hubPlaceLabel,
} from "./hubs";

const RICHMOND = { name: "Richmond", state: "VA" };
const COLUMBIA = { name: "Columbia", state: "SC" };
const KANSAS_CITY = { name: "Kansas City", state: "MO" };

test("DB-only hubs use the city name, and a slug state suffix", () => {
  assert.equal(
    hubPageTitle("richmond-va", null, RICHMOND),
    "Richmond, VA Foundation Repair & Crawl Encapsulation",
  );
  assert.equal(hubPageHeading("richmond-va", null, RICHMOND), hubPageTitle("richmond-va", null, RICHMOND));
  assert.equal(
    hubPageTitle("richmond-va", "foundation", RICHMOND),
    "Richmond, VA Foundation Repair Contractors",
  );
  assert.equal(
    hubPageHeading("richmond-va", "foundation", RICHMOND),
    "Richmond, VA Foundation Repair Contractors",
  );
  assert.equal(
    hubPageTitle("richmond-va", "encapsulation", RICHMOND),
    "Richmond, VA Crawl Space Encapsulation Contractors",
  );
  assert.equal(
    hubPageHeading("richmond-va", "encapsulation", RICHMOND),
    "Richmond, VA Crawl Space Encapsulation Contractors",
  );

  assert.equal(
    hubPageTitle("columbia-sc", null, COLUMBIA),
    "Columbia, SC Foundation Repair & Crawl Encapsulation",
  );
  assert.equal(
    hubPageTitle("columbia-sc", "foundation", COLUMBIA),
    "Columbia, SC Foundation Repair Contractors",
  );
  assert.equal(
    hubPageTitle("columbia-sc", "encapsulation", COLUMBIA),
    "Columbia, SC Crawl Space Encapsulation Contractors",
  );

  assert.equal(
    hubPageTitle("kansas-city", null, KANSAS_CITY),
    "Kansas City Foundation Repair & Crawl Encapsulation",
  );
  assert.equal(
    hubPageTitle("kansas-city", "foundation", KANSAS_CITY),
    "Kansas City Foundation Repair Contractors",
  );
  assert.equal(
    hubPageTitle("kansas-city", "encapsulation", KANSAS_CITY),
    "Kansas City Crawl Space Encapsulation Contractors",
  );
  assert.equal(hubPageDescription("richmond-va", "Richmond foundation and crawl specialists."), "Richmond foundation and crawl specialists.");
});

test("legacy slug names keep a slug fallback with an uppercase state suffix", () => {
  assert.equal(hubPlaceLabel("columbia-sc", { name: "columbia-sc", state: "SC" }), "Columbia, SC");
  assert.equal(hubPlaceLabel("richmond-va", { name: "Richmond Va", state: "VA" }), "Richmond, VA");
  assert.equal(
    hubPageTitle("columbia-sc", null, { name: "columbia-sc", state: "SC" }),
    "Columbia, SC Foundation Repair & Crawl Encapsulation",
  );
  assert.equal(hubPageTitle("kansas-city"), "Kansas City Foundation Repair & Crawl Encapsulation");
  assert.equal(hubPageTitle("virginia-beach"), "Virginia Beach Foundation Repair & Crawl Encapsulation");
  assert.equal(hubPageTitle("new-orleans"), "New Orleans Foundation Repair & Crawl Encapsulation");
  assert.equal(hubPlaceLabel("st-louis", { name: "St. Louis", state: "MO" }), "St. Louis");
});

test("Wave 1 hubs keep locked titles when a DB place is passed", () => {
  const houston = getWave1Hub("houston");
  const charleston = getWave1Hub("charleston-sc");
  assert.ok(houston);
  assert.ok(charleston);
  assert.equal(hubPageTitle("houston", null, { name: "houston", state: "TX" }), houston.title);
  assert.equal(hubPageHeading("houston", null, { name: "houston", state: "TX" }), houston.title);
  assert.equal(hubPageTitle("houston", "foundation"), houston.foundationTitle);
  assert.equal(hubPageTitle("houston", "encapsulation"), houston.encapsulationTitle);
  assert.equal(hubPageDescription("houston", "ignore"), houston.description);
  assert.equal(
    hubPageTitle("charleston-sc", null, { name: "charleston-sc", state: "SC" }),
    "Charleston SC Crawl Space Encapsulation & Foundation",
  );
  assert.equal(
    hubPageHeading("charleston-sc", null, { name: "Charleston", state: "SC" }),
    "Charleston, SC crawl space encapsulation and foundation contractors",
  );
  assert.equal(hubPageDescription("charleston-sc", "ignore"), charleston.description);
  assert.equal(charleston.title, "Charleston SC Crawl Space Encapsulation & Foundation");
});

test("city index cards label DB-only hubs and leave Wave 1 names alone", () => {
  for (const slug of ["richmond-va", "columbia-sc", "kansas-city"]) {
    assert.equal((WAVE1_HUB_SLUGS as readonly string[]).includes(slug), false);
    assert.equal((HOMEPAGE_STRIP_SLUGS as readonly string[]).includes(slug), false);
  }
  const index = buildCityIndex([
    { slug: "houston", name: "houston", state: "TX", region: "Gulf Coast", listings: [] },
    { slug: "charleston-sc", name: "charleston-sc", state: "SC", region: "Lowcountry", listings: [] },
    { slug: "richmond-va", name: "Richmond", state: "VA", region: "Virginia", listings: [] },
    { slug: "kansas-city", name: "Kansas City", state: "MO", region: "Midwest", listings: [] },
    { slug: "columbia-sc", name: "columbia-sc", state: "SC", region: "Carolinas", listings: [] },
  ]);
  assert.equal(index.find((city) => city.slug === "houston")?.name, "Houston");
  assert.equal(index.find((city) => city.slug === "charleston-sc")?.name, "Charleston, SC");
  assert.equal(index.find((city) => city.slug === "richmond-va")?.name, "Richmond, VA");
  assert.equal(index.find((city) => city.slug === "kansas-city")?.name, "Kansas City");
  assert.equal(index.find((city) => city.slug === "columbia-sc")?.name, "Columbia, SC");
});
