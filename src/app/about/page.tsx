import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { site } from "@/lib/config";
import { foundingPriceLabel } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "About",
  description:
    "BelowGradePros is a specialty directory for foundation repair and crawl-space / basement encapsulation contractors — not a booking marketplace.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main>
      <PageHero
        kicker={site.domain}
        title="A directory, not a booking engine."
        lede="BelowGradePros helps homeowners and property managers find licensed contractors who work below grade — foundation repair and crawl-space / basement encapsulation."
      />
      <section className="mx-auto max-w-3xl space-y-8 px-5 py-14 text-base leading-8 text-slate-soft">
        <p>
          The site is a curated catalog: metro hubs, honest bios, a primary service flag, and a
          direct inquire path. We do not take a booking fee. Contractors keep the relationship
          with the homeowner.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-concrete-light p-6">
            <h2 className="font-display text-2xl text-slate">What we publish</h2>
            <p className="mt-3 text-sm leading-7">
              Contractors with city coverage, a primary flag (foundation, encapsulation, or both),
              optional badges (waterproofing, pier &amp; beam, slab), and a way to reach them.
              Featured and founding flags mark paid hub placement. Drafts stay off the public
              site.
            </p>
          </div>
          <div className="rounded-2xl bg-concrete-light p-6">
            <h2 className="font-display text-2xl text-slate">What we do not do</h2>
            <p className="mt-3 text-sm leading-7">
              No booking engine. No lead auction. No contractor login beyond a claim request.
              Directory profiles are free; founding listings ({foundingPriceLabel()}) are an
              optional upgrade for featured placement.
            </p>
          </div>
        </div>
        <p>
          Operators can{" "}
          <Link href="/submit" className="text-amber-deep hover:underline">
            submit
          </Link>
          ,{" "}
          <Link href="/claim" className="text-amber-deep hover:underline">
            claim
          </Link>
          , or take the{" "}
          <Link href="/founding" className="text-amber-deep hover:underline">
            founding path
          </Link>
          . Questions:{" "}
          <a className="text-amber-deep hover:underline" href={`mailto:${site.email}`}>
            {site.email}
          </a>
          .
        </p>
      </section>
    </main>
  );
}
