import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FilterBar } from "@/components/FilterBar";
import { ListingCard } from "@/components/ListingCard";
import { PageHero } from "@/components/PageHero";
import {
  normalizeHubServiceQuery,
  primaryServiceLabel,
  servicePath,
} from "@/lib/config";
import { getCities, getPublishedListings } from "@/lib/listings";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = normalizeHubServiceQuery(slug);
  if (!service) return { title: "Service" };
  return {
    title: primaryServiceLabel(service),
    description: `${primaryServiceLabel(service)} contractors in the BelowGradePros directory.`,
    alternates: { canonical: servicePath(service) },
  };
}

export default async function ServiceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string; city?: string }>;
}) {
  const { slug } = await params;
  const service = normalizeHubServiceQuery(slug);
  if (!service) notFound();

  const filters = await searchParams;
  const [listings, cities] = await Promise.all([
    getPublishedListings({
      service,
      query: filters.q,
      citySlug: filters.city,
    }),
    getCities(),
  ]);

  return (
    <main>
      <PageHero
        kicker="Primary service"
        title={primaryServiceLabel(service)}
        lede="Includes contractors whose primary flag is this trade, plus shops marked both."
      />
      <section className="mx-auto max-w-6xl px-5 py-12">
        <FilterBar
          action={servicePath(service)}
          cities={cities}
          current={{ ...filters, service }}
        />
        <p className="mt-6 text-sm text-muted">{listings.length} published contractors</p>
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>
    </main>
  );
}
