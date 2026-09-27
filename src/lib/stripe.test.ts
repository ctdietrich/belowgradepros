import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { foundingCheckoutUrl, foundingNextStep, foundingPaymentLink } from "./stripe";

const ENV_KEYS = ["STRIPE_PAYMENT_LINK", "NEXT_PUBLIC_STRIPE_PAYMENT_LINK"] as const;
const previous = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));

function setEnv(env: Partial<Record<(typeof ENV_KEYS)[number], string | undefined>>) {
  for (const key of ENV_KEYS) {
    const value = env[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

afterEach(() => {
  for (const key of ENV_KEYS) {
    const value = previous[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

test("server STRIPE_PAYMENT_LINK is read ahead of the public build-time var", () => {
  setEnv({
    STRIPE_PAYMENT_LINK: "https://buy.stripe.com/server_link",
    NEXT_PUBLIC_STRIPE_PAYMENT_LINK: "https://buy.stripe.com/inlined_link",
  });
  assert.equal(foundingPaymentLink(), "https://buy.stripe.com/server_link");
});

test("falls back to NEXT_PUBLIC_STRIPE_PAYMENT_LINK when the server var is empty", () => {
  setEnv({
    STRIPE_PAYMENT_LINK: "  ",
    NEXT_PUBLIC_STRIPE_PAYMENT_LINK: "https://buy.stripe.com/inlined_link",
  });
  assert.equal(foundingPaymentLink(), "https://buy.stripe.com/inlined_link");
});

test("foundingCheckoutUrl appends client_reference_id and prefilled_email", () => {
  setEnv({
    STRIPE_PAYMENT_LINK: "https://buy.stripe.com/test_abc?prefilled_promo_code=FOUNDING",
    NEXT_PUBLIC_STRIPE_PAYMENT_LINK: undefined,
  });

  const href = foundingCheckoutUrl({
    slug: "acme-foundation",
    email: "jane+ops@acme.example",
  });
  assert.ok(href);
  const url = new URL(href);
  assert.equal(url.searchParams.get("prefilled_promo_code"), "FOUNDING");
  assert.equal(url.searchParams.get("client_reference_id"), "acme-foundation");
  assert.equal(url.searchParams.get("prefilled_email"), "jane+ops@acme.example");
});

test("foundingCheckoutUrl leaves the link alone when slug and email are unknown", () => {
  setEnv({
    STRIPE_PAYMENT_LINK: "https://buy.stripe.com/test_abc",
    NEXT_PUBLIC_STRIPE_PAYMENT_LINK: undefined,
  });
  assert.equal(foundingCheckoutUrl({}), "https://buy.stripe.com/test_abc");
  assert.equal(foundingCheckoutUrl(), "https://buy.stripe.com/test_abc");
});

test("foundingCheckoutUrl is undefined when no payment link is configured", () => {
  setEnv({
    STRIPE_PAYMENT_LINK: undefined,
    NEXT_PUBLIC_STRIPE_PAYMENT_LINK: undefined,
  });
  assert.equal(foundingCheckoutUrl({ slug: "acme-foundation", email: "a@b.co" }), undefined);
});

test("foundingNextStep uses the payment link when configured, otherwise /founding", () => {
  setEnv({
    STRIPE_PAYMENT_LINK: "https://buy.stripe.com/test_abc",
    NEXT_PUBLIC_STRIPE_PAYMENT_LINK: undefined,
  });
  const paid = foundingNextStep({ slug: "acme-foundation", email: "jane@acme.example" });
  assert.equal(paid.label, "Continue to payment");
  const paidUrl = new URL(paid.href);
  assert.equal(paidUrl.searchParams.get("client_reference_id"), "acme-foundation");
  assert.equal(paidUrl.searchParams.get("prefilled_email"), "jane@acme.example");

  setEnv({ STRIPE_PAYMENT_LINK: undefined, NEXT_PUBLIC_STRIPE_PAYMENT_LINK: "" });
  const fallback = foundingNextStep({ slug: "acme foundation" });
  assert.equal(fallback.href, "/founding?listing=acme%20foundation");
  assert.equal(fallback.label, "Continue to founding placement");
});
