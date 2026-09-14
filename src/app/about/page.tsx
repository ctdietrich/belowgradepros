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
        title="A specialty directory, not a general contractor board."
        lede="BelowGradePros exists for one job category: foundation repair and crawl-space/basement encapsulation — including vapor barriers, dehumidifier packages, and adjacent waterproofing."
      />
      <section className="mx-auto max-w-3xl space-y-8 px-5 py-14 text-base leading-8 text-slate-soft">
        <p>
          Homeowners looking for this work usually already know the problem is under the house.
          They do not need a marketplace that also sells roofing and kitchen remodels. They need
          a short, honest list of shops that actually do below-grade work.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-paper-warm p-6">
            <h2 className="font-display text-2xl text-slate-deep">What we publish</h2>
            <p className="mt-3 text-sm leading-7">
              Contractor name, city, metro, services (foundation repair, encapsulation,
              waterproofing, pier-and-beam, slab), and a way to reach them. Featured flags are
              editorial. Unpublished rows stay off the public site.
            </p>
          </div>
          <div className="rounded-2xl bg-paper-warm p-6">
            <h2 className="font-display text-2xl text-slate-deep">What we do not do</h2>
            <p className="mt-3 text-sm leading-7">
              No payment integration in this release. No booking engine. No lead auction. Operators
              inquire to submit or claim; homeowners call the shop.
            </p>
          </div>
        </div>
        <p>
          Contractors can{" "}
          <Link href="/submit" className="underline">
            submit
          </Link>{" "}
          or{" "}
          <Link href="/claim" className="underline">
            claim
          </Link>{" "}
          a profile. Founding listing price is stubbed at {site.foundingPrice}. The public pages
          are the directory. A small admin desk imports CSVs and reviews the inbox.
        </p>
      </section>
    </main>
  );
}
