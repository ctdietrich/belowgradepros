import type { Metadata } from "next";
import { EmptyListings } from "@/components/EmptyListings";
import { FilterBar } from "@/components/FilterBar";
import { ListingCard } from "@/components/ListingCard";
import { PageHero } from "@/components/PageHero";
import { getCities, getPublishedListings } from "@/lib/listings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contractors",
  description:
    "Browse foundation repair and crawl-space / basement encapsulation contractors by metro on BelowGradePros.",
  alternates: { canonical: "/contractors" },
};

export default async function ContractorsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; city?: string; service?: string }>;
}) {
  const filters = await searchParams;
  const [listings, cities] = await Promise.all([
    getPublishedListings({
      type: "contractor",
      query: filters.q,
      citySlug: filters.city,
      service: filters.service,
    }),
    getCities(),
  ]);
  const filtered = Boolean(filters.q || filters.city || filters.service);

  return (
    <main>
      <PageHero
        kicker="Directory"
        title="Contractors"
        lede="Primary service is foundation repair, encapsulation, or both. Waterproofing, pier-and-beam, and slab show as badges. Inquire directly — BelowGradePros does not take a booking fee."
      />
      <section className="mx-auto max-w-6xl px-5 py-12">
        <FilterBar action="/contractors" cities={cities} current={filters} />
        <p className="mt-6 text-sm text-muted">
          {listings.length} {listings.length === 1 ? "contractor" : "contractors"}
        </p>
        {listings.length ? (
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <EmptyListings
              message={
                filtered
                  ? "No listings match — try another filter or metro."
                  : "No contractors match this view. Browse a city hub or clear filters."
              }
            />
          </div>
        )}
      </section>
    </main>
  );
}
