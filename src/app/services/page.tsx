import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { cityPath, site } from "@/lib/config";

export const metadata: Metadata = {
  title: "Services",
  description: "Browse foundation repair and encapsulation contractors on BelowGradePros.",
};

export default function ServicesPage() {
  return (
    <main>
      <PageHero
        kicker="Primary desk"
        title="Foundation, encapsulation, or both."
        lede="Primary service is foundation repair, encapsulation, or both. Waterproofing, pier-and-beam, and slab are additional badges — not v1 category URLs."
      />
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-5 md:grid-cols-2">
          {site.primaryServices
            .filter((service) => service.key !== "both")
            .map((service) => (
              <Link
                key={service.key}
                href={`/services/${service.key}`}
                className="rounded-2xl border border-slate/10 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="text-xs uppercase tracking-[0.16em] text-amber-deep">{service.query}</p>
                <h2 className="mt-2 font-display text-3xl text-slate">{service.label}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-soft">
                  Filter any Wave 1 hub with{" "}
                  <code className="text-slate">?service={service.query}</code>
                  {service.key === "foundation" ? (
                    <>
                      {" "}
                      — e.g.{" "}
                      <span className="text-slate">{cityPath("houston", service.query)}</span>
                    </>
                  ) : null}
                  .
                </p>
              </Link>
            ))}
        </div>
      </section>
    </main>
  );
}
