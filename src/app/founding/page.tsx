import type { Metadata } from "next";
import { startFoundingCheckout } from "@/app/actions";
import { ActionForm } from "@/components/FormStatus";
import { PageHero } from "@/components/PageHero";
import { foundingPaymentLink, foundingPriceLabel, isStripeCheckoutReady } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Founding listing",
  description: `Featured / founding contractor listings on BelowGradePros — ${foundingPriceLabel()}.`,
};

const field =
  "mt-1 w-full rounded-lg border border-slate/15 bg-white px-3 py-2 outline-none focus:border-amber";

export default async function FoundingPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  await searchParams;
  const ready = isStripeCheckoutReady();
  const link = foundingPaymentLink();

  return (
    <main>
      <PageHero
        kicker="Founding / featured"
        title={`A hub listing that earns its keep. ${foundingPriceLabel()}.`}
        lede="Founding contractors get featured placement on Wave 1 city hubs. Checkout uses a Stripe Payment Link or Checkout session when keys exist — preview builds do not need them."
      />
      <section className="mx-auto grid max-w-3xl gap-8 px-5 py-12">
        <div className="rounded-2xl border border-slate/10 bg-white p-6 text-sm leading-7 text-slate-soft">
          <p>
            Directory listings stay editorial and free to submit or claim. The paid path is an
            upgrade: founding / featured placement at {foundingPriceLabel()}.
          </p>
          <p className="mt-3">
            Stripe status:{" "}
            <strong className="text-slate">{ready ? "Payment Link configured" : "stub — no live keys"}</strong>
            . Set <code>NEXT_PUBLIC_STRIPE_PAYMENT_LINK</code> (or{" "}
            <code>STRIPE_SECRET_KEY</code> + <code>STRIPE_FOUNDING_PRICE_ID</code> later) on Vercel
            when you are ready.
          </p>
        </div>
        {link ? (
          <a
            href={link}
            className="inline-block w-fit rounded-full bg-slate px-5 py-2.5 text-sm text-page hover:bg-slate-soft"
          >
            Continue to Stripe
          </a>
        ) : (
          <ActionForm
            action={startFoundingCheckout}
            className="space-y-4"
            submitLabel="Notify me when checkout is live"
          >
            <label className="block text-sm">
              Email
              <input name="email" type="email" className={field} placeholder="you@example.com" />
            </label>
          </ActionForm>
        )}
      </section>
    </main>
  );
}
