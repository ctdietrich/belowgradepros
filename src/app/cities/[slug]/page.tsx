import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CityCard } from "@/components/CityCard";
import { EmptyListings } from "@/components/EmptyListings";
import { HubDensifySection } from "@/components/HubDensifySection";
import { JsonLd } from "@/components/JsonLd";
import { ListingCard } from "@/components/ListingCard";
import { PageHero } from "@/components/PageHero";
import {
  cityPath,
  normalizeHubServiceQuery,
  site,
} from "@/lib/config";
import { getHubDensify } from "@/lib/hub-densify";
import {
  buildCityIndex,
  catalogCardChips,
  catalogCardCta,
  catalogCardHref,
  getWave1Hub,
  hubPageDescription,
  hubPageHeading,
  hubPageTitle,
} from "@/lib/hubs";
import { cityJsonLd, hubDensifyFaqJsonLd } from "@/lib/jsonld";
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
  if (!city) return { title: "City" };
  const filter = normalizeHubServiceQuery(service);
  const title = hubPageTitle(city.slug, filter);
  return {
    title,
    description: hubPageDescription(city.slug, city.description),
    alternates: { canonical: cityPath(city.slug) },
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
  const index = buildCityIndex(await getCities());
  const densify = getHubDensify(city.slug);
  const relatedFromDensify = densify
    ? densify.related
        .map((item) => {
          const row = index.find((cityRow) => cityRow.slug === item.slug);
          const hub = getWave1Hub(item.slug);
          if (!row && !hub) return null;
          return {
            id: row?.id ?? `related:${item.slug}`,
            slug: item.slug,
            name: hub?.name ?? row?.name ?? item.slug,
            state: row?.state ?? hub?.state ?? "",
            region: row?.region ?? hub?.region ?? "",
            heroImage: row?.heroImage ?? null,
            count: row?.count ?? 0,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
    : [];
  const others =
    relatedFromDensify.length > 0
      ? relatedFromDensify
      : index.filter((item) => item.slug !== city.slug).slice(0, 3);
  const heading = hubPageHeading(city.slug, serviceFilter);

  return (
    <main>
      <JsonLd data={cityJsonLd({ ...city, description: hubPageDescription(city.slug, city.description) })} />
      {densify ? <JsonLd data={hubDensifyFaqJsonLd(densify)} /> : null}
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
        {listings.length ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <EmptyListings
              message={
                serviceFilter
                  ? "No listings match — try another filter or browse every contractor in this metro."
                  : "No published contractors in this metro yet. Try another city or check back as profiles are added."
              }
            />
          </div>
        )}
        {densify ? <HubDensifySection densify={densify} /> : null}
        <h2 className="mt-16 font-display text-2xl text-slate">
          {densify ? "Related hubs" : "Other hubs"}
        </h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {others.map((item) => (
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
