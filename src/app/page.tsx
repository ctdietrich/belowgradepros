import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { ListingCard } from "@/components/ListingCard";
import { MetroCard } from "@/components/MetroCard";
import { PricingCta } from "@/components/PricingCta";
import { SERVICES, site } from "@/lib/config";
import { organizationJsonLd } from "@/lib/jsonld";
import { getMetros, getPublishedListings } from "@/lib/listings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, metros] = await Promise.all([
    getPublishedListings({ featured: true }),
    getMetros(),
  ]);

  return (
    <main>
      <JsonLd data={organizationJsonLd()} />
      <section className="bg-slate-deep text-paper">
        <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
          <p className="text-xs uppercase tracking-[0.28em] text-amber-soft">{site.brandTagline}</p>
          <h1 className="mt-5 max-w-3xl font-display text-4xl leading-tight md:text-6xl">
            Find a contractor who works below grade.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-paper/75">
            BelowGradePros is a US specialty directory for foundation repair and
            crawl-space/basement encapsulation — vapor barriers, dehumidifier packages, and the
            waterproofing that sits next to that work.
          </p>
          <form
            action="/search"
            className="mt-10 grid max-w-3xl gap-3 rounded-2xl bg-white p-3 text-slate-deep md:grid-cols-[1fr_1fr_auto]"
          >
            <label className="sr-only" htmlFor="home-q">
              Search
            </label>
            <input
              id="home-q"
              name="q"
              placeholder="City or company"
              className="rounded-lg border border-slate/10 px-3 py-2.5 outline-none focus:border-amber"
            />
            <label className="sr-only" htmlFor="home-service">
              Service
            </label>
            <select
              id="home-service"
              name="service"
              className="rounded-lg border border-slate/10 px-3 py-2.5 outline-none focus:border-amber"
            >
              <option value="">All services</option>
              {SERVICES.map((service) => (
                <option key={service.key} value={service.key}>
                  {service.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-lg bg-amber px-5 py-2.5 text-sm font-medium text-slate-deep hover:bg-amber-bright"
            >
              Search
            </button>
          </form>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <Link href="/search" className="text-amber-soft hover:text-paper">
              Browse all listings →
            </Link>
            <Link href="/metros" className="text-paper/70 hover:text-paper">
              City hubs
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-16 md:grid-cols-2">
        <div className="rounded-2xl bg-slate-deep p-8 text-paper">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-soft">For homeowners</p>
          <h2 className="mt-3 font-display text-3xl">The job is under the house.</h2>
          <p className="mt-4 text-sm leading-7 text-paper/75">
            Cracks, bouncing floors, wet crawl spaces, and musty basements are not generic
            remodeling. Filter by foundation repair, encapsulation, waterproofing, pier-and-beam,
            or slab — then call the shop directly.
          </p>
          <Link href="/search" className="mt-6 inline-block text-sm text-amber-soft hover:text-paper">
            Find a specialist →
          </Link>
        </div>
        <div className="rounded-2xl border border-slate/10 bg-white p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-amber">For contractors</p>
          <h2 className="mt-3 font-display text-3xl text-slate-deep">Get found for the work you actually do.</h2>
          <p className="mt-4 text-sm leading-7 text-slate-soft">
            This is a directory, not a lead mill with a booking engine. Submit a profile or claim
            a sourced listing. Founding placement will be {site.foundingPrice} — inquiry only in
            this release.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/submit" className="rounded-full bg-slate-deep px-4 py-2 text-sm text-paper">
              Submit a listing
            </Link>
            <Link href="/claim" className="rounded-full border border-slate/20 px-4 py-2 text-sm">
              Claim yours
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-amber">Featured</p>
            <h2 className="mt-2 font-display text-4xl text-slate-deep">Sample desks in the first metros</h2>
          </div>
          <Link href="/search" className="text-sm text-slate-soft hover:text-amber">
            All listings
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featured.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      <section className="bg-paper-warm">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <p className="text-xs uppercase tracking-[0.2em] text-amber">City hubs</p>
          <h2 className="mt-2 font-display text-4xl text-slate-deep">Houston, Dallas, Atlanta, Tampa, Chicago</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {metros.map((metro) => (
              <MetroCard
                key={metro.id}
                slug={metro.slug}
                name={metro.name}
                state={`${metro.state} · ${metro.stateCode}`}
                description={metro.description}
                count={metro.listings.length}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-16 lg:grid-cols-[2fr_1fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-amber">How it works</p>
          <h2 className="mt-2 font-display text-4xl text-slate-deep">A directory, not a marketplace.</h2>
          <ol className="mt-6 space-y-4 text-sm leading-7 text-slate-soft">
            <li>
              <strong className="text-slate-deep">1. Browse.</strong> Filter by service and metro.
              Every public listing is a contractor profile with city, services, and a way to reach them.
            </li>
            <li>
              <strong className="text-slate-deep">2. Inquire directly.</strong> Call or visit the
              website. BelowGradePros does not book jobs or take a commission.
            </li>
            <li>
              <strong className="text-slate-deep">3. Contractors submit or claim.</strong> We review
              before anything is published. Sample rows in v1 are labeled as sample data.
            </li>
          </ol>
        </div>
        <PricingCta />
      </section>
    </main>
  );
}
