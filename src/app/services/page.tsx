import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { servicePath, site } from "@/lib/config";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Browse foundation repair, encapsulation, waterproofing, pier-and-beam, and slab contractors.",
};

const copy: Record<string, string> = {
  foundation_repair:
    "Structural repair crews who stabilize, lift, and rebuild failing foundations.",
  encapsulation:
    "Crawl-space and basement encapsulation — vapor barriers, dehumidification, sealed envelopes.",
  waterproofing:
    "Interior and exterior waterproofing for basements, crawl spaces, and below-grade walls.",
  pier_beam:
    "Pier-and-beam specialists: releveling, sistering, and crawl-space structural work.",
  slab:
    "Post-tension and conventional slab repair, void fill, and concrete foundation work.",
};

export default function ServicesPage() {
  return (
    <main>
      <PageHero
        kicker="Trade flags"
        title="Services"
        lede="Listings carry one or more service flags. Multi-select is the point — a pier-and-beam shop that also encapsulates is not a data error."
      />
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-5 md:grid-cols-2">
          {site.services.map((service) => (
            <Link
              key={service.key}
              href={servicePath(service.key)}
              className="rounded-2xl border border-slate/10 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-xs uppercase tracking-[0.16em] text-amber-deep">{service.key}</p>
              <h2 className="mt-2 font-display text-3xl text-slate">{service.label}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-soft">{copy[service.key]}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
