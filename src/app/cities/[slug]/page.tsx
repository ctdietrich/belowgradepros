import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CityCard } from "@/components/CityCard";
import { JsonLd } from "@/components/JsonLd";
import { ListingCard } from "@/components/ListingCard";
import { PageHero } from "@/components/PageHero";
import { cityPath } from "@/lib/config";
import { cityJsonLd } from "@/lib/jsonld";
import { getCities, getCityBySlug, getPublishedListings } from "@/lib/listings";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const city = await getCityBySlug(slug);
  if (!city) return { title: "City hub" };
  return {
    title: city.name,
    description: city.description,
    alternates: { canonical: cityPath(city.slug) },
  };
}

export default async function CityDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const city = await getCityBySlug(slug);
  if (!city) notFound();

  const listings = await getPublishedListings({ citySlug: city.slug });
  const others = (await getCities()).filter((item) => item.id !== city.id);

  return (
    <main>
      <JsonLd data={cityJsonLd(city)} />
      <PageHero
        kicker={`${city.region} · ${city.state}`}
        title={city.name}
        lede={city.description}
      />
      <section className="mx-auto max-w-6xl px-5 py-12">
        <h2 className="font-display text-3xl text-slate">Contractors</h2>
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
              count={item.listings.length}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
