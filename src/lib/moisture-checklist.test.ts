import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CHECK_ITEMS,
  CRACKED_PIERS_ID,
  encapsulationResultHref,
  foundationResultHref,
  maxChecklistScore,
  SAGGING_FLOORS_ID,
  scoreMoistureChecklist,
  STANDING_WATER_ID,
} from "./moisture-checklist";

test("checklist max score is 34", () => {
  assert.equal(maxChecklistScore(), 34);
  const all = scoreMoistureChecklist({
    checkedIds: CHECK_ITEMS.map((item) => item.id),
    humidity: "above-60",
  });
  assert.equal(all.score, 34);
  assert.equal(all.band, "high");
});

test("scoring bands and routing follow the checklist rule", () => {
  const none = scoreMoistureChecklist({ checkedIds: [], humidity: null });
  assert.deepEqual(
    { score: none.score, band: none.band, service: none.service },
    { score: 0, band: "low", service: "encapsulation" },
  );

  const low = scoreMoistureChecklist({ checkedIds: ["musty", "damp-air"], humidity: null });
  assert.equal(low.score, 3);
  assert.equal(low.band, "low");
  assert.equal(low.service, "encapsulation");

  const moderate = scoreMoistureChecklist({
    checkedIds: ["condensation", "wood-moisture", "pests", "damp-air"],
    humidity: null,
  });
  assert.equal(moderate.score, 9);
  assert.equal(moderate.band, "moderate");
  assert.equal(moderate.service, "encapsulation");

  const ten = scoreMoistureChecklist({
    checkedIds: ["discoloration", "condensation", "wood-moisture", "damp-air"],
    humidity: null,
  });
  assert.equal(ten.score, 10);
  assert.equal(ten.band, "high");
  assert.equal(ten.service, "encapsulation");

  const standing = scoreMoistureChecklist({ checkedIds: [STANDING_WATER_ID], humidity: null });
  assert.equal(standing.score, 4);
  assert.equal(standing.band, "high");
  assert.equal(standing.service, "encapsulation");

  const standingPlus = scoreMoistureChecklist({
    checkedIds: [STANDING_WATER_ID, "musty"],
    humidity: null,
  });
  assert.equal(standingPlus.score, 6);
  assert.equal(standingPlus.band, "high");

  const sagging = scoreMoistureChecklist({ checkedIds: [SAGGING_FLOORS_ID], humidity: null });
  assert.equal(sagging.score, 4);
  assert.equal(sagging.band, "high");
  assert.equal(sagging.service, "both");

  const cracked = scoreMoistureChecklist({ checkedIds: [CRACKED_PIERS_ID], humidity: null });
  assert.equal(cracked.score, 3);
  assert.equal(cracked.band, "low");
  assert.equal(cracked.service, "both");

  const humid = scoreMoistureChecklist({ checkedIds: [], humidity: "above-60" });
  assert.equal(humid.score, 3);
  assert.equal(humid.band, "low");
  assert.equal(scoreMoistureChecklist({ checkedIds: [], humidity: "50-60" }).score, 1);
  assert.equal(scoreMoistureChecklist({ checkedIds: [], humidity: "below-50-or-none" }).score, 0);
});

test("duplicate and unknown answers do not inflate the score", () => {
  const doubled = scoreMoistureChecklist({
    checkedIds: [STANDING_WATER_ID, STANDING_WATER_ID, "not-a-real-item"],
    humidity: null,
  });
  assert.equal(doubled.score, 4);
  assert.equal(doubled.band, "high");
});

test("result links use cost pages for the seven metros and hubs otherwise", () => {
  assert.equal(encapsulationResultHref("tampa"), "/cost/crawl-space-encapsulation/tampa");
  assert.equal(foundationResultHref("tampa"), "/cost/foundation-repair/tampa");
  assert.equal(encapsulationResultHref("dallas-fort-worth"), "/cities/dallas-fort-worth");
  assert.equal(foundationResultHref("dallas-fort-worth"), null);
});
