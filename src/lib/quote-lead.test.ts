import assert from "node:assert/strict";
import { test } from "node:test";
import {
  QUOTE_RATE_LIMIT,
  quoteSubmissionRateLimited,
  validateQuoteLead,
} from "./quote-lead";

const valid = {
  name: "Alex Homeowner",
  email: "alex@home.example",
  phone: "",
  zip: "33602",
  service: "foundation",
  message: "Crack along the garage slab.",
  honeypot: "",
};

test("quote lead accepts email without a phone", () => {
  const result = validateQuoteLead(valid);
  assert.equal(result.ok, true);
  if (!result.ok || result.ignored) return;
  assert.equal(result.value.email, "alex@home.example");
  assert.equal(result.value.phone, null);
  assert.equal(result.value.service, "foundation");
});

test("quote lead accepts phone without an email", () => {
  const result = validateQuoteLead({ ...valid, email: "  ", phone: "(813) 555-0100" });
  assert.equal(result.ok, true);
  if (!result.ok || result.ignored) return;
  assert.equal(result.value.email, null);
  assert.equal(result.value.phone, "(813) 555-0100");
});

test("quote lead requires a phone or an email", () => {
  const result = validateQuoteLead({ ...valid, email: "", phone: "" });
  assert.deepEqual(result, {
    ok: false,
    error: "Enter a phone number or an email so the contractor can reply.",
  });
});

test("quote lead rejects a bad email, zip, or service", () => {
  assert.equal(validateQuoteLead({ ...valid, email: "not-an-email" }).ok, false);
  assert.equal(validateQuoteLead({ ...valid, zip: "336" }).ok, false);
  assert.equal(validateQuoteLead({ ...valid, service: "roofing" }).ok, false);
  assert.equal(validateQuoteLead({ ...valid, message: "too short" }).ok, false);
});

test("honeypot submissions are ignored and not stored", () => {
  const result = validateQuoteLead({ ...valid, honeypot: "https://spam.example" });
  assert.deepEqual(result, { ok: true, ignored: true });
});

test("quote rate limit trips at three recent requests", () => {
  assert.equal(QUOTE_RATE_LIMIT, 3);
  assert.equal(quoteSubmissionRateLimited(0), false);
  assert.equal(quoteSubmissionRateLimited(2), false);
  assert.equal(quoteSubmissionRateLimited(3), true);
});
