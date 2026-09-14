import type { Metadata } from "next";
import { FilterBar } from "@/components/FilterBar";
import { ListingCard } from "@/components/ListingCard";
import { PageHero } from "@/components/PageHero";
import { getMetros, getPublishedListings, getStates } from "@/lib/listings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse contractors",
  description:
    "Search foundation repair and crawl-space/basement encapsulation contractors by service, metro, and state.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; metro?: string; state?: string; service?: string }>;
}) {
  const filters = await searchParams;
  const [listings, metros, states] = await Promise.all([
    getPublishedListings({
      query: filters.q,
      metroSlug: filters.metro,
      state: filters.state,
      service: filters.service,
    }),
    getMetros(),
    getStates(),
  ]);

  return (
    <main>
      <PageHero
        kicker="Directory"
        title="Browse listings"
        lede="Filter by foundation repair, encapsulation, waterproofing, pier-and-beam, or slab — then by metro or state. Sample data is labeled so you can tell seed rows from live operators later."
      />
      <section className="mx-auto max-w-6xl px-5 py-12">
        <FilterBar
          action="/search"
          metros={metros}
          states={states}
          current={filters}
        />
        <p className="mt-6 text-sm text-muted">{listings.length} published listings</p>
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
        {!listings.length ? (
          <p className="mt-6 text-muted">No published listings match those filters.</p>
        ) : null}
      </section>
    </main>
  );
}
