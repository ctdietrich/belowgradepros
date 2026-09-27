import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  FOUNDING_SPOTS_PER_CITY,
  foundingOfferCopy,
  foundingSpotsFullMessage,
  foundingSpotsLabel,
  foundingSpotsRemaining,
} from "./founding";
import { foundingPriceLabel } from "./stripe";

test("foundingPriceLabel is only the post-first-lead rate", () => {
  assert.equal(foundingPriceLabel(), "$49/mo");
});

test("founding offer copy is free until the first real homeowner lead, then $49/mo", () => {
  const copy = foundingOfferCopy();
  assert.equal(
    copy,
    "Free until we send you your first real homeowner lead, then $49/mo locked. Cancel anytime. Exclusive leads, never shared or resold, no per-lead fees. Only 3 founding spots per city.",
  );
  assert.equal(copy.includes(foundingPriceLabel()), true);
  assert.equal(copy.includes("199"), false);
  assert.equal(copy.includes("first 10"), false);
  assert.equal(copy.includes("per metro"), false);
});

test("founding page says what counts as a real lead", () => {
  const page = readFileSync(new URL("../app/founding/page.tsx", import.meta.url), "utf8");
  assert.match(page, /What counts as a real lead/);
  assert.match(page, /verified phone number/);
  assert.match(page, /Inside your service area/);
  assert.match(page, /For a service you offer/);
  assert.match(page, /Not a duplicate/);
  assert.match(page, /Bad leads get credited\./);
});

test("foundingSpotsLeft is 3 minus published founding listings in the city", () => {
  assert.equal(FOUNDING_SPOTS_PER_CITY, 3);
  assert.equal(foundingSpotsRemaining(0), 3);
  assert.equal(foundingSpotsRemaining(1), 2);
  assert.equal(foundingSpotsRemaining(3), 0);
  assert.equal(foundingSpotsRemaining(4), 0);
  assert.equal(foundingSpotsRemaining(-2), 3);
  assert.equal(foundingSpotsLabel(2), "2 of 3 founding spots left");
  assert.equal(foundingSpotsFullMessage("Tampa"), "Founding spots in Tampa are full");
});
