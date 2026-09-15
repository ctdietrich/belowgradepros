import assert from "node:assert/strict";
import { test } from "node:test";
import { listingJsonLd } from "./jsonld";
import type { ListingWithCities } from "./listings";

function listing(email: string): ListingWithCities {
  return {
    id: "1",
    slug: "test-shop",
    type: "contractor",
    name: "Test Shop",
    tagline: null,
    bio: "A shop.",
    contactEmail: email,
    website: null,
    phone: null,
    homeCity: "Austin",
    homeState: "TX",
    licenseId: null,
    photos: [],
    primaryService: "foundation",
    services: [],
    featured: false,
    founding: false,
    verified: false,
    status: "published",
    sourceUrl: null,
    claimable: true,
    claimedAt: null,
    createdAt: new Date(0),
    updatedAt: new Date(0),
    cities: [],
  };
}

test("listing JSON-LD omits blank and @example.com emails", () => {
  assert.equal(listingJsonLd(listing("")).email, undefined);
  assert.equal(listingJsonLd(listing("desk@example.com")).email, undefined);
  assert.equal(listingJsonLd(listing("desk@realco.com")).email, "desk@realco.com");
});
