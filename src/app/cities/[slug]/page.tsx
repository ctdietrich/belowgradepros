import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CityCard } from "@/components/CityCard";
import { JsonLd } from "@/components/JsonLd";
import { ListingCard } from "@/components/ListingCard";
import { PageHero } from "@/components/PageHero";
import {
  cityPath,
  hubServiceQueryParam,
  normalizeHubServiceQuery,
  site,
} from "@/lib/config";
import { buildCityIndex, catalogCardChips, catalogCardCta, catalogCardHref, hubPageDescription, hubPageTitle } from "@/lib/hubs";
import { cityJsonLd } from "@/lib/jsonld";
import { getCities, getCityBySlug, getPublishedListings } from "@/lib/listings";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ service?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { service } = await searchParams;
  const city = await getCityBySlug(slug);
  if (!city) return { title: "City hub" };
  const filter = normalizeHubServiceQuery(service);
  const query = hubServiceQueryParam(filter);
  const title = hubPageTitle(city.slug, filter);
  return {
    title,
    description: hubPageDescription(city.slug, city.description),
    alternates: { canonical: cityPath(city.slug, query ?? undefined) },
  };
}

export default async function CityDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ service?: string }>;
}) {
  const { slug } = await params;
  const { service } = await searchParams;
  const city = await getCityBySlug(slug);
  if (!city) notFound();

  const serviceFilter = normalizeHubServiceQuery(service);
  const listings = await getPublishedListings({
    citySlug: city.slug,
    service: serviceFilter ?? undefined,
  });
  const others = buildCityIndex(await getCities()).filter((item) => item.slug !== city.slug);
  const heading = hubPageTitle(city.slug, serviceFilter);

  return (
    <main>
      <JsonLd data={cityJsonLd({ ...city, description: hubPageDescription(city.slug, city.description) })} />
      <PageHero
        kicker={`${city.region} · ${city.state}`}
        title={heading}
        lede={hubPageDescription(city.slug, city.description)}
      />
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={cityPath(city.slug)}
            className={`rounded-full px-3 py-1.5 text-sm ${
              !serviceFilter ? "bg-slate text-page" : "border border-slate/15 text-slate-soft"
            }`}
          >
            All
          </Link>
          {site.primaryServices
            .filter((item) => item.key !== "both")
            .map((item) => (
              <Link
                key={item.query}
                href={cityPath(city.slug, item.query)}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  serviceFilter === item.key
                    ? "bg-slate text-page"
                    : "border border-slate/15 text-slate-soft"
                }`}
              >
                {item.label}
              </Link>
            ))}
        </div>
        <h2 className="mt-8 font-display text-3xl text-slate">Contractors</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
        {!listings.length ? (
          <p className="mt-6 text-muted">No published contractors in this metro yet.</p>
        ) : null}
        <h3 className="mt-16 font-display text-2xl text-slate">Other hubs</h3>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {others.slice(0, 3).map((item) => (
            <CityCard
              key={item.id}
              slug={item.slug}
              name={item.name}
              state={item.state}
              region={item.region}
              heroImage={item.heroImage}
              count={item.count}
              href={catalogCardHref(item.slug)}
              cta={catalogCardCta(item.slug)}
              chips={catalogCardChips(item.slug)}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
