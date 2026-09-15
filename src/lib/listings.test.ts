import assert from "node:assert/strict";
import { test } from "node:test";
import { publicContactEmail } from "./listings";

test("publicContactEmail hides blank and @example.com placeholders", () => {
  assert.equal(publicContactEmail(""), null);
  assert.equal(publicContactEmail("   "), null);
  assert.equal(publicContactEmail(null), null);
  assert.equal(publicContactEmail(undefined), null);
  assert.equal(publicContactEmail("shop@example.com"), null);
  assert.equal(publicContactEmail("Shop@Example.COM"), null);
  assert.equal(publicContactEmail("ops@belowgradepros.com"), "ops@belowgradepros.com");
});
