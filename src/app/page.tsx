import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CityCard } from "@/components/CityCard";
import { EmptyListings } from "@/components/EmptyListings";
import { FoundingCta } from "@/components/FoundingCta";
import { JsonLd } from "@/components/JsonLd";
import { ListingCard } from "@/components/ListingCard";
import {
  HOMEPAGE_SERVICE_CHIPS,
  buildHomepageStrip,
  homepageCardChips,
  homepageCardCta,
  homepageCardHref,
  site,
} from "@/lib/config";
import { organizationJsonLd } from "@/lib/jsonld";
import { getCities, getPublishedListings } from "@/lib/listings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: `${site.name} — Foundation repair & crawl-space encapsulation contractors`,
  },
  description: site.description,
  openGraph: {
    title: site.name,
    description: site.description,
    url: "/",
  },
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [featured, cities] = await Promise.all([
    getPublishedListings({ featured: true }),
    getCities(),
  ]);
  const strip = buildHomepageStrip(cities);

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
        <div className="absolute inset-0 bg-gradient-to-b from-slate-deep/40 via-slate/55 to-slate-deep" />
        <div className="relative mx-auto max-w-6xl px-5 py-20 md:py-28">
          <p className="text-xs uppercase tracking-[0.28em] text-amber">{site.brandTagline}</p>
          <h1 className="mt-5 max-w-3xl font-display text-4xl leading-tight md:text-6xl">
            Foundation and crawl-space specialists, by metro.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-concrete/90">
            BelowGradePros is a specialty directory for foundation repair and crawl-space /
            basement encapsulation contractors. Browse a city, compare licensed operators, and
            inquire directly — no booking engine, no take-rate.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/cities"
              className="rounded-full bg-amber px-5 py-2.5 text-sm font-medium text-slate-deep hover:bg-amber/90"
            >
              Browse metros
            </Link>
            <Link
              href="/claim"
              className="rounded-full border border-page/40 px-5 py-2.5 text-sm text-page hover:bg-white/10"
            >
              Claim listing
            </Link>
            <Link
              href="/how-it-works"
              className="rounded-full px-5 py-2.5 text-sm text-amber hover:text-concrete"
            >
              For contractors
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-xs uppercase tracking-[0.18em] text-concrete/60">Specialty</span>
            {HOMEPAGE_SERVICE_CHIPS.map((chip) => (
              <Link
                key={chip.href}
                href={chip.href}
                className="rounded-full border border-concrete/35 px-3 py-1.5 text-sm text-page hover:bg-page hover:text-slate-deep"
              >
                {chip.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-amber-deep">Featured</p>
            <h2 className="mt-2 font-display text-4xl text-slate">Featured contractors</h2>
          </div>
          <Link href="/contractors" className="text-sm text-slate-soft hover:text-amber-deep">
            All contractors
          </Link>
        </div>
        {featured.length ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featured.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <EmptyListings
              title="Featured listings"
              message="Featured contractors appear here as they join the directory. Browse metros to see every published profile."
            />
          </div>
        )}
      </section>

      <section className="bg-concrete-light">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-deep">Coverage</p>
          <h2 className="mt-2 font-display text-4xl text-slate">Cities we cover</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-soft">
            Moisture-priority metros across Florida and the Southeast, plus clay and pier-and-beam
            work in Dallas–Fort Worth. Open a hub, then filter by foundation repair or
            encapsulation.
          </p>
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {strip.map((city) => (
              <CityCard
                key={city.slug}
                slug={city.slug}
                name={city.name}
                state={city.state}
                region={city.region}
                heroImage={city.heroImage}
                count={city.count}
                href={homepageCardHref(city.slug)}
                cta={homepageCardCta(city.slug)}
                chips={homepageCardChips(city.slug)}
              />
            ))}
          </div>
          <Link
            href="/cities"
            className="mt-8 inline-block text-sm font-medium text-slate hover:text-amber-deep"
          >
            See every city hub →
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-16 md:grid-cols-2 md:py-20">
        <div className="rounded-2xl bg-slate p-8 text-page md:p-10">
          <p className="text-xs uppercase tracking-[0.2em] text-amber">Homeowners</p>
          <h2 className="mt-3 font-display text-3xl">Find a specialist, then inquire directly</h2>
          <p className="mt-4 text-sm leading-7 text-concrete/80">
            Browse a metro, filter foundation repair or crawl-space / basement encapsulation, and
            reach the contractor on their terms. BelowGradePros does not book jobs or take a
            commission.
          </p>
          <Link href="/how-it-works" className="mt-6 inline-block text-sm text-concrete hover:text-white">
            How BelowGradePros works →
          </Link>
        </div>
        <div className="rounded-2xl border border-slate/10 bg-white p-8 shadow-sm md:p-10">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-deep">Contractors</p>
          <h2 className="mt-3 font-display text-3xl text-slate">Claim or add your profile</h2>
          <p className="mt-4 text-sm leading-7 text-slate-soft">
            Listings are editorial and free to submit or claim. Founding / featured placement is
            the paid upgrade for contractors who want to stand out on a city hub.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/submit" className="rounded-full bg-slate px-4 py-2 text-sm text-page hover:bg-slate-soft">
              Submit a listing
            </Link>
            <Link href="/claim" className="rounded-full border border-slate/20 px-4 py-2 text-sm hover:border-amber">
              Claim yours
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16 md:pb-20">
        <FoundingCta source="home" />
      </section>
    </main>
  );
}
