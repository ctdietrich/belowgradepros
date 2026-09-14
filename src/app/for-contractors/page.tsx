import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { PricingCta } from "@/components/PricingCta";
import { site } from "@/lib/config";

export const metadata: Metadata = {
  title: "For contractors",
  description:
    "List a foundation repair or encapsulation company on BelowGradePros. Founding placement $199–299/mo — inquiry-first in v1.",
};

export default function ForContractorsPage() {
  return (
    <main>
      <PageHero
        kicker="Supply side"
        title="Get found for below-grade work."
        lede="Homeowners who land here already know they need foundation repair or crawl-space/basement encapsulation. Your listing is a specialist profile, not a generic home-services ad."
      />
      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-14 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-8 text-base leading-8 text-slate-soft">
          <p>
            v1 is inquiry-first. There is no Stripe checkout in this release. Submit a new company
            or claim a sourced profile. When paid placement opens, founding listings will be{" "}
            {site.foundingPrice}.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate/10 bg-white p-6">
              <h2 className="font-display text-2xl text-slate-deep">New companies</h2>
              <p className="mt-3 text-sm leading-7">
                Send name, metro, services, and a short description. We review before anything is
                published.
              </p>
              <Link href="/submit" className="mt-4 inline-block text-sm text-amber hover:underline">
                Submit a listing →
              </Link>
            </div>
            <div className="rounded-2xl border border-slate/10 bg-white p-6">
              <h2 className="font-display text-2xl text-slate-deep">Sourced profiles</h2>
              <p className="mt-3 text-sm leading-7">
                Some rows start from public materials and stay claimable until the operator
                confirms the desk.
              </p>
              <Link href="/claim" className="mt-4 inline-block text-sm text-amber hover:underline">
                Claim a listing →
              </Link>
            </div>
          </div>
        </div>
        <PricingCta />
      </section>
    </main>
  );
}
