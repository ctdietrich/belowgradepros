import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { site } from "@/lib/config";
import { foundingPriceLabel } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "About",
  description: site.description,
};

export default function AboutPage() {
  return (
    <main>
      <PageHero
        kicker={site.domain}
        title="A directory, not a booking engine."
        lede="BelowGradePros is a specialty directory for foundation repair and crawl-space / basement encapsulation contractors. Demand is homeowners and property desks. Supply is licensed operators who work below grade."
      />
      <section className="mx-auto max-w-3xl space-y-8 px-5 py-14 text-base leading-8 text-slate-soft">
        <p>
          The interim mark is typographic — <span className="font-semibold text-slate">BelowGrade</span>
          <span className="font-extrabold text-amber">Pros</span> in slate and amber, concrete and
          page cream, and the line {site.brandTagline}. The product is the desk: Wave 1 metros,
          honest bios, a primary service flag, and a direct inquire path.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-concrete-light p-6">
            <h2 className="font-display text-2xl text-slate">What we publish</h2>
            <p className="mt-3 text-sm leading-7">
              Contractors with city hubs, a primary flag (foundation, encapsulation, or both),
              optional badges (waterproofing, pier &amp; beam, slab), and a way to reach them.
              Featured and founding flags are editorial / paid. Drafts stay off the public site.
            </p>
          </div>
          <div className="rounded-2xl bg-concrete-light p-6">
            <h2 className="font-display text-2xl text-slate">What we do not do</h2>
            <p className="mt-3 text-sm leading-7">
              No booking engine. No newsletter product. No contractor login beyond a claim inbox.
              Founding listings ({foundingPriceLabel()}) use a Stripe stub until keys exist — preview
              builds do not need them.
            </p>
          </div>
        </div>
        <p>
          Operators can{" "}
          <Link href="/submit" className="underline">
            submit
          </Link>
          ,{" "}
          <Link href="/claim" className="underline">
            claim
          </Link>
          , or take the{" "}
          <Link href="/founding" className="underline">
            founding path
          </Link>
          . The public pages are the directory. The rest is a small admin for the people who keep
          the desk honest.
        </p>
      </section>
    </main>
  );
}
