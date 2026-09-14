import Image from "next/image";
import Link from "next/link";
import { CityCard } from "@/components/CityCard";
import { JsonLd } from "@/components/JsonLd";
import { ListingCard } from "@/components/ListingCard";
import { site } from "@/lib/config";
import { organizationJsonLd } from "@/lib/jsonld";
import { getCities, getPublishedListings } from "@/lib/listings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, cities] = await Promise.all([
    getPublishedListings({ featured: true }),
    getCities(),
  ]);

  return (
    <main>
      <JsonLd data={organizationJsonLd()} />
      <section className="relative overflow-hidden bg-slate text-page">
        <Image
          src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=2000&q=80"
          alt="Foundation and structural work on a residential site"
          fill
          priority
          className="object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-deep/40 via-slate/50 to-slate-deep" />
        <div className="relative mx-auto max-w-6xl px-5 py-24 md:py-32">
          <p className="text-xs uppercase tracking-[0.28em] text-amber">{site.brandTagline}</p>
          <h1 className="mt-5 max-w-xl font-display text-5xl leading-none text-page md:text-6xl">
            {site.name}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-concrete/85">{site.tagline}</p>
          <p className="mt-3 max-w-2xl text-base leading-7 text-concrete/70">
            Foundation repair, crawl-space and basement encapsulation, waterproofing, pier-and-beam,
            and slab work — starting with Texas and Florida metros.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/cities"
              className="rounded-full bg-concrete px-5 py-2.5 text-sm text-slate-deep hover:bg-white"
            >
              Browse city hubs
            </Link>
            <Link
              href="/contractors"
              className="rounded-full border border-concrete/40 px-5 py-2.5 text-sm text-page hover:bg-white/10"
            >
              Find a contractor
            </Link>
            <Link href="/services" className="rounded-full px-5 py-2.5 text-sm text-amber hover:text-concrete">
              Browse services →
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-amber-deep">Featured</p>
            <h2 className="mt-2 font-display text-4xl text-slate">The desk this season</h2>
          </div>
          <Link href="/cities" className="text-sm text-slate-soft hover:text-amber-deep">
            All city hubs
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featured.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      <section className="bg-concrete-light">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-deep">Metros</p>
          <h2 className="mt-2 font-display text-4xl text-slate">Where we start</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {cities.map((city) => (
              <CityCard
                key={city.id}
                slug={city.slug}
                name={city.name}
                state={city.state}
                region={city.region}
                heroImage={city.heroImage}
                count={city.listings.length}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-16 md:grid-cols-2">
        <div className="rounded-2xl bg-slate p-8 text-page">
          <p className="text-xs uppercase tracking-[0.2em] text-amber">Demand</p>
          <h2 className="mt-3 font-display text-3xl">For homeowners and property desks</h2>
          <p className="mt-4 text-sm leading-7 text-concrete/80">
            Browse verified metros, compare contractors by service flag, then inquire directly.
            No marketplace take-rate. No booking engine. Just the right desk for a serious job
            below grade.
          </p>
          <Link href="/about" className="mt-6 inline-block text-sm text-concrete hover:text-white">
            How BelowGradePros works →
          </Link>
        </div>
        <div className="rounded-2xl border border-slate/10 bg-white p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-deep">Supply</p>
          <h2 className="mt-3 font-display text-3xl text-slate">Contractors</h2>
          <p className="mt-4 text-sm leading-7 text-slate-soft">
            Claim an existing profile or submit a new one. Listings stay editorial — we publish
            what we would send a homeowner to.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/submit" className="rounded-full bg-slate px-4 py-2 text-sm text-page">
              Submit a listing
            </Link>
            <Link href="/claim" className="rounded-full border border-slate/20 px-4 py-2 text-sm">
              Claim yours
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
