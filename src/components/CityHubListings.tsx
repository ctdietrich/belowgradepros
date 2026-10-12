"use client";

import { useEffect, type ComponentProps, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { EmptyListings } from "@/components/EmptyListings";
import { ListingCard } from "@/components/ListingCard";
import { PageHero } from "@/components/PageHero";
import {
  cityPath,
  getWave1Hub,
  hubPageHeading,
  hubPageTitle,
  normalizeHubServiceQuery,
  site,
} from "@/lib/config";
import { hubPageDescription } from "@/lib/hubs";
import { encapsulationCostPath, foundationCostPath, isCostMetro } from "@/lib/cost-paths";
import { listingMatchesServiceFilter } from "@/lib/listing-fields";
import type { ListingWithCities } from "@/lib/listings";

type CityView = {
  slug: string;
  name: string;
  state: string;
  region: string;
  description: string | null;
};

type ServiceFilter = "foundation" | "encapsulation" | null;

export function CityHubListings({
  city,
  listings,
  spotsLabel,
  serviceFilter,
  children,
}: {
  city: CityView;
  listings: ListingWithCities[];
  spotsLabel: string;
  serviceFilter: ServiceFilter;
  children?: ReactNode;
}) {
  const heading = hubPageHeading(city.slug, serviceFilter, city);
  const visible = serviceFilter
    ? listings.filter((listing) => listingMatchesServiceFilter(listing, serviceFilter))
    : listings;
  const hubName = getWave1Hub(city.slug)?.name ?? city.name;

  return (
    <>
      <PageHero
        kicker={`${city.region} · ${city.state}`}
        title={heading}
        lede={hubPageDescription(city.slug, city.description)}
      />
      <section className="mx-auto max-w-6xl px-5 py-12">
        <p className="mb-6 text-sm">
          <Link href="/founding" className="font-medium text-amber-deep hover:underline">
            {spotsLabel}
          </Link>
        </p>
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
        {isCostMetro(city.slug) ? (
          <p className="mt-6 text-sm text-slate-soft">
            <span className="font-medium text-slate">What does it cost in {hubName}?</span>{" "}
            <Link href={encapsulationCostPath(city.slug)} className="text-amber-deep hover:underline">
              Crawl space encapsulation
            </Link>
            <span aria-hidden="true"> · </span>
            <Link href={foundationCostPath(city.slug)} className="text-amber-deep hover:underline">
              Foundation repair
            </Link>
          </p>
        ) : null}
        <h2 className="mt-8 font-display text-3xl text-slate">Contractors</h2>
        {visible.length ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((listing) => (
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
        {children}
      </section>
    </>
  );
}

export function CityHubListingsFromQuery(
  props: Omit<ComponentProps<typeof CityHubListings>, "serviceFilter">,
) {
  const searchParams = useSearchParams();
  const serviceFilter = normalizeHubServiceQuery(searchParams.get("service"));
  const { slug, name, state } = props.city;

  useEffect(() => {
    const title = hubPageTitle(slug, serviceFilter, { name, state });
    document.title = `${title} · ${site.name}`;
  }, [slug, name, state, serviceFilter]);

  return <CityHubListings {...props} serviceFilter={serviceFilter} />;
}
