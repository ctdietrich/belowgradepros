import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { site } from "@/lib/config";

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
          The interim mark is typographic — slate and deep slate, concrete, amber, and page
          cream. The product is the desk: curated metros, honest bios, service flags, and a
          direct inquire path.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-concrete-light p-6">
            <h2 className="font-display text-2xl text-slate">What we publish</h2>
            <p className="mt-3 text-sm leading-7">
              Contractors with city hubs, service flags (foundation repair, encapsulation,
              waterproofing, pier &amp; beam, slab), photos, and a way to reach them. Featured
              and verified flags are editorial. Drafts stay off the public site.
            </p>
          </div>
          <div className="rounded-2xl bg-concrete-light p-6">
            <h2 className="font-display text-2xl text-slate">What we do not do</h2>
            <p className="mt-3 text-sm leading-7">
              No Stripe. No booking engine. No newsletter product. No contractor login beyond a
              claim inbox. If a profile was sourced from public materials, the operator can
              claim it.
            </p>
          </div>
        </div>
        <p>
          Operators can{" "}
          <Link href="/submit" className="underline">
            submit
          </Link>{" "}
          or{" "}
          <Link href="/claim" className="underline">
            claim
          </Link>{" "}
          a profile. The public pages are the directory. The rest is a small admin for the people
          who keep the desk honest.
        </p>
      </section>
    </main>
  );
}
