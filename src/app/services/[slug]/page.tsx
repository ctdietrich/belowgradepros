import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FilterBar } from "@/components/FilterBar";
import { ListingCard } from "@/components/ListingCard";
import { PageHero } from "@/components/PageHero";
import { SERVICE_KEYS, serviceLabel, servicePath } from "@/lib/config";
import { getCities, getPublishedListings } from "@/lib/listings";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!SERVICE_KEYS.includes(slug as (typeof SERVICE_KEYS)[number])) {
    return { title: "Service" };
  }
  return {
    title: serviceLabel(slug),
    description: `${serviceLabel(slug)} contractors in the BelowGradePros directory.`,
    alternates: { canonical: servicePath(slug) },
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
  if (!SERVICE_KEYS.includes(slug as (typeof SERVICE_KEYS)[number])) notFound();

  const filters = await searchParams;
  const [listings, cities] = await Promise.all([
    getPublishedListings({
      service: slug,
      query: filters.q,
      citySlug: filters.city,
    }),
    getCities(),
  ]);

  return (
    <main>
      <PageHero
        kicker="Service"
        title={serviceLabel(slug)}
        lede="Contractors who list this flag. Many shops do more than one — check the listing for the full set."
      />
      <section className="mx-auto max-w-6xl px-5 py-12">
        <FilterBar
          action={servicePath(slug)}
          cities={cities}
          current={{ ...filters, service: slug }}
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
