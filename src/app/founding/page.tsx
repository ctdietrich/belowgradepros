import type { Metadata } from "next";
import Link from "next/link";
import { startFoundingCheckout } from "@/app/actions";
import { ActionForm } from "@/components/FormStatus";
import { PageHero } from "@/components/PageHero";
import { site } from "@/lib/config";
import { foundingPaymentLink, foundingPriceLabel } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Founding listing",
  description: `Featured and founding contractor listings on BelowGradePros — ${foundingPriceLabel()}. Free directory profiles; paid placement on city hubs.`,
  alternates: { canonical: "/founding" },
};

const field =
  "mt-1 w-full rounded-lg border border-slate/15 bg-white px-3 py-2 outline-none focus:border-amber";

export default async function FoundingPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  await searchParams;
  const link = foundingPaymentLink();

  return (
    <main>
      <PageHero
        kicker="Founding / featured"
        title={`Stand out on the city hub. ${foundingPriceLabel()}.`}
        lede="Directory listings stay editorial and free to submit or claim. Founding contractors receive featured placement on metro hubs so homeowners see you first."
      />
      <section className="mx-auto grid max-w-3xl gap-8 px-5 py-12">
        <div className="rounded-2xl border border-slate/10 bg-white p-6 text-sm leading-7 text-slate-soft shadow-sm">
          <p>
            The paid path is an upgrade, not a pay-to-publish listing: founding / featured
            placement at {foundingPriceLabel()}. We follow up from {site.email} to activate it.
          </p>
          <p className="mt-3">
            Prefer to start from an existing profile?{" "}
            <Link href="/claim" className="text-amber-deep hover:underline">
              Claim a listing
            </Link>{" "}
            or{" "}
            <Link href="/submit" className="text-amber-deep hover:underline">
              submit a new one
            </Link>{" "}
            and check the founding option.
          </p>
        </div>
        {link ? (
          <a
            href={link}
            className="inline-block w-fit rounded-full bg-slate px-5 py-2.5 text-sm text-page hover:bg-slate-soft"
          >
            Continue to payment
          </a>
        ) : (
          <ActionForm
            action={startFoundingCheckout}
            className="space-y-4"
            submitLabel="Request featured placement"
          >
            <label className="block text-sm">
              Work email
              <input
                name="email"
                type="email"
                required
                className={field}
                placeholder={site.email}
              />
            </label>
            <p className="text-sm leading-6 text-slate-soft">
              We will write back from {site.email} to activate featured placement. You can also
              email us directly.
            </p>
          </ActionForm>
        )}
      </section>
    </main>
  );
}
