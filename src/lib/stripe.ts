/**
 * Founding / featured listing path ($199–299/mo).
 * Stub-safe: build and preview do not require live Stripe keys.
 */

export const FOUNDING_PRICE_LOW = 199;
export const FOUNDING_PRICE_HIGH = 299;

function trimEnv(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function foundingPaymentLink() {
  return (
    trimEnv(process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK) ??
    trimEnv(process.env.STRIPE_PAYMENT_LINK)
  );
}

export function stripePublishableKey() {
  return trimEnv(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
}

export function stripeSecretKey() {
  return trimEnv(process.env.STRIPE_SECRET_KEY);
}

export function stripeFoundingPriceId() {
  return trimEnv(process.env.STRIPE_FOUNDING_PRICE_ID);
}

/** True when a Payment Link (or future Checkout price) is configured. */
export function isStripeCheckoutReady() {
  return Boolean(foundingPaymentLink() || (stripeSecretKey() && stripeFoundingPriceId()));
}

export function foundingPriceLabel() {
  return `$${FOUNDING_PRICE_LOW}–${FOUNDING_PRICE_HIGH}/mo`;
}
