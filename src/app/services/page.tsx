import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { site } from "@/lib/config";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Browse foundation repair and crawl-space / basement encapsulation contractors on BelowGradePros.",
  alternates: { canonical: "/services" },
};

const blurbs: Record<string, string> = {
  foundation:
    "Settling, cracks, pier and beam, and slab work. Open a metro hub and filter to foundation repair.",
  encapsulation:
    "Crawl-space and basement encapsulation — liners, sealed vents, humidity control. Filter any hub to encapsulation.",
};

export default function ServicesPage() {
  return (
    <main>
      <PageHero
        kicker="Specialty"
        title="Foundation, encapsulation, or both."
        lede="Every contractor lists a primary trade. Waterproofing, pier-and-beam, and slab are additional badges on the profile — not separate marketplaces."
      />
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-5 md:grid-cols-2">
          {site.primaryServices
            .filter((service) => service.key !== "both")
            .map((service) => (
              <Link
                key={service.key}
                href={`/services/${service.key}`}
                className="rounded-2xl border border-slate/10 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="text-xs uppercase tracking-[0.16em] text-amber-deep">Primary service</p>
                <h2 className="mt-2 font-display text-3xl text-slate">{service.label}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-soft">{blurbs[service.key]}</p>
              </Link>
            ))}
        </div>
      </section>
    </main>
  );
}
