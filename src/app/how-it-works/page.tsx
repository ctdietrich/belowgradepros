import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { site } from "@/lib/config";
import { foundingPriceLabel } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "How homeowners browse BelowGradePros metro hubs, and how contractors claim, submit, or upgrade a listing.",
  alternates: { canonical: "/how-it-works" },
};

export default function HowItWorksPage() {
  return (
    <main>
      <PageHero
        kicker="How it works"
        title="Homeowners browse. Contractors claim. Everyone inquires directly."
        lede="BelowGradePros is a specialty directory — not a marketplace. We publish profiles; you handle the job."
      />
      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-14 md:grid-cols-2">
        <article className="rounded-2xl border border-slate/10 bg-white p-8 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-deep">Homeowners</p>
          <h2 className="mt-3 font-display text-3xl text-slate">Find a specialist</h2>
          <ol className="mt-6 space-y-4 text-sm leading-7 text-slate-soft">
            <li>
              <strong className="text-slate">1. Open a metro.</strong> Start from{" "}
              <Link href="/cities" className="text-amber-deep hover:underline">
                cities we cover
              </Link>{" "}
              — Tampa, Houston, Atlanta, Charlotte, Jacksonville, Orlando, Nashville, Dallas–Fort
              Worth, and additional hubs nationwide.
            </li>
            <li>
              <strong className="text-slate">2. Filter the trade.</strong> Foundation repair,
              crawl-space / basement encapsulation, or both. Extra badges (waterproofing, pier
              &amp; beam, slab) stay on the profile.
            </li>
            <li>
              <strong className="text-slate">3. Inquire on their terms.</strong> Email, phone, or
              website — we do not book the job or take a commission.
            </li>
          </ol>
        </article>
        <article className="rounded-2xl border border-slate/10 bg-white p-8 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-deep">Contractors</p>
          <h2 className="mt-3 font-display text-3xl text-slate">Get on the directory</h2>
          <ol className="mt-6 space-y-4 text-sm leading-7 text-slate-soft">
            <li>
              <strong className="text-slate">1. Claim or submit.</strong>{" "}
              <Link href="/claim" className="text-amber-deep hover:underline">
                Claim a sourced profile
              </Link>{" "}
              or{" "}
              <Link href="/submit" className="text-amber-deep hover:underline">
                propose a new listing
              </Link>
              . We review for fit before anything goes live.
            </li>
            <li>
              <strong className="text-slate">2. Keep the profile honest.</strong> Primary service,
              metros you actually cover, license where it applies. Free listings stay editorial.
            </li>
            <li>
              <strong className="text-slate">3. Optional: founding placement.</strong> Featured
              hub placement is {foundingPriceLabel()}. Request it on the claim/submit form or{" "}
              <Link href="/founding" className="text-amber-deep hover:underline">
                start here
              </Link>
              .
            </li>
          </ol>
        </article>
      </section>
      <section className="mx-auto max-w-6xl px-5 pb-16">
        <p className="text-sm text-slate-soft">
          Questions:{" "}
          <a className="text-amber-deep hover:underline" href={`mailto:${site.email}`}>
            {site.email}
          </a>
          .
        </p>
      </section>
    </main>
  );
}
