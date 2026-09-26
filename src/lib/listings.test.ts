import assert from "node:assert/strict";
import { test } from "node:test";
import { findListingByRef, missingPublishedClaimTarget, publicContactEmail } from "./listings";

test("publicContactEmail hides blank and @example.com placeholders", () => {
  assert.equal(publicContactEmail(""), null);
  assert.equal(publicContactEmail("   "), null);
  assert.equal(publicContactEmail(null), null);
  assert.equal(publicContactEmail(undefined), null);
  assert.equal(publicContactEmail("shop@example.com"), null);
  assert.equal(publicContactEmail("Shop@Example.COM"), null);
  assert.equal(publicContactEmail("ops@belowgradepros.com"), "ops@belowgradepros.com");
});

test("claim listing ref 404s only when it does not match a published listing", () => {
  const published = [
    {
      id: "jax-id",
      slug: "jacksonville-foundation-repair",
      name: "Jacksonville Foundation Repair",
    },
    {
      id: "piedmont-id",
      slug: "piedmont-foundation-repair",
      name: "Piedmont Foundation Repair",
    },
  ];

  assert.equal(missingPublishedClaimTarget(undefined, null), false);
  assert.equal(missingPublishedClaimTarget(null, null), false);
  assert.equal(missingPublishedClaimTarget("", null), false);
  assert.equal(missingPublishedClaimTarget("   ", null), false);

  const unknown = findListingByRef(published, "zz-made-up-slug-123");
  assert.equal(unknown, null);
  assert.equal(missingPublishedClaimTarget("zz-made-up-slug-123", unknown), true);

  const jacksonville = findListingByRef(published, "jacksonville-foundation-repair");
  assert.equal(jacksonville?.name, "Jacksonville Foundation Repair");
  assert.equal(missingPublishedClaimTarget("jacksonville-foundation-repair", jacksonville), false);

  const piedmontById = findListingByRef(published, "piedmont-id");
  assert.equal(piedmontById?.name, "Piedmont Foundation Repair");
  assert.equal(missingPublishedClaimTarget("piedmont-id", piedmontById), false);

  assert.equal(
    findListingByRef(published, "  jacksonville-foundation-repair  ")?.name,
    "Jacksonville Foundation Repair",
  );
  assert.equal(missingPublishedClaimTarget("  jacksonville-foundation-repair  ", jacksonville), false);
});
