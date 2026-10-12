import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CityCard } from "@/components/CityCard";
import { CityHubListings, CityHubListingsFromQuery } from "@/components/CityHubListings";
import { HubDensifySection } from "@/components/HubDensifySection";
import { JsonLd } from "@/components/JsonLd";
import { cityPath } from "@/lib/config";
import { foundingSpotsLabel, foundingSpotsLeft } from "@/lib/founding";
import { getHubDensify, type HubDensify } from "@/lib/hub-densify";
import {
  buildCityIndex,
  catalogCardChips,
  catalogCardCta,
  catalogCardHref,
  getWave1Hub,
  hubPageDescription,
  hubPageTitle,
  hubPlaceLabel,
} from "@/lib/hubs";
import { cityJsonLd, hubDensifyFaqJsonLd } from "@/lib/jsonld";
import { getCityBySlug, getCitySummaries, getPublishedListings } from "@/lib/listings";
import { withOnDemandFallback } from "@/lib/on-demand";
import { cityStaticParams } from "@/lib/static-params";

type RelatedCity = {
  id: string;
  slug: string;
  name: string;
  state: string;
  region: string;
  heroImage: string | null;
  count: number;
};

function RelatedHubs({
  densify,
  others,
}: {
  densify: HubDensify | null;
  others: RelatedCity[];
}) {
  return (
    <>
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
    </>
  );
}

export const revalidate = 86400;
export const dynamicParams = true;

export async function generateStaticParams() {
  return cityStaticParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const city = await withOnDemandFallback(() => getCityBySlug(slug));
  if (!city) return { title: "City" };
  return {
    title: hubPageTitle(city.slug, null, city),
    description: hubPageDescription(city.slug, city.description),
    alternates: { canonical: cityPath(city.slug) },
  };
}

export default async function CityDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const city = await withOnDemandFallback(() => getCityBySlug(slug));
  if (!city) notFound();

  const [listings, summaries, spotsLeft] = await withOnDemandFallback(() =>
    Promise.all([
      getPublishedListings({ citySlug: city.slug }),
      getCitySummaries(),
      foundingSpotsLeft(city.slug),
    ]),
  );
  const index = buildCityIndex(summaries);
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
            name: hub?.name ?? row?.name ?? hubPlaceLabel(item.slug),
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

  const view = {
    slug: city.slug,
    name: city.name,
    state: city.state,
    region: city.region,
    description: city.description,
  };
  const spotsLabel = foundingSpotsLabel(spotsLeft);

  return (
    <main>
      <JsonLd data={cityJsonLd({ ...city, description: hubPageDescription(city.slug, city.description) })} />
      {densify ? <JsonLd data={hubDensifyFaqJsonLd(densify)} /> : null}
      <Suspense
        fallback={
          <CityHubListings city={view} listings={listings} spotsLabel={spotsLabel} serviceFilter={null}>
            <RelatedHubs densify={densify} others={others} />
          </CityHubListings>
        }
      >
        <CityHubListingsFromQuery city={view} listings={listings} spotsLabel={spotsLabel}>
          <RelatedHubs densify={densify} others={others} />
        </CityHubListingsFromQuery>
      </Suspense>
    </main>
  );
}
