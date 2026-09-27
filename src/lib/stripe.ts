/**
 * Founding / featured listing path ($49/mo).
 * Stub-safe: build and preview do not require live Stripe keys.
 */

export const FOUNDING_PRICE_LOW = 49;

function trimEnv(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/**
 * Payment Link for founding checkout.
 *
 * `STRIPE_PAYMENT_LINK` is server-only and read when the request runs.
 * `NEXT_PUBLIC_STRIPE_PAYMENT_LINK` is inlined into the server bundle at
 * build time, so changing it does nothing until the next deploy. It is used
 * only when the server variable is empty.
 *
 * On Vercel, either variable is captured by the deployment: set the value,
 * then redeploy. No code change is required.
 */
export function foundingPaymentLink() {
  return (
    trimEnv(process.env.STRIPE_PAYMENT_LINK) ??
    trimEnv(process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK)
  );
}

/**
 * Stripe Payment Links accept `client_reference_id` and `prefilled_email`
 * as query params. Listing slugs are URL-safe; the URL API encodes the email.
 */
export function foundingCheckoutUrl(options?: {
  slug?: string | null;
  email?: string | null;
}): string | undefined {
  const base = foundingPaymentLink();
  if (!base) return undefined;

  const slug = options?.slug?.trim();
  const email = options?.email?.trim();
  if (!slug && !email) return base;

  try {
    const url = new URL(base);
    if (slug) url.searchParams.set("client_reference_id", slug);
    if (email) url.searchParams.set("prefilled_email", email);
    return url.toString();
  } catch {
    return base;
  }
}

/** Claim confirmation: pay now when a link is configured, otherwise the founding page. */
export function foundingNextStep(options: { slug: string; email?: string | null }): {
  href: string;
  label: string;
} {
  const slug = options.slug.trim();
  const checkout = foundingCheckoutUrl({ slug, email: options.email });
  if (checkout) {
    return { href: checkout, label: "Continue to payment" };
  }
  return {
    href: `/founding?listing=${encodeURIComponent(slug)}`,
    label: "Continue to founding placement",
  };
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
  return `$${FOUNDING_PRICE_LOW}/mo`;
}
