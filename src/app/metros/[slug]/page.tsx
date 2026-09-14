import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { ListingCard } from "@/components/ListingCard";
import { MetroCard } from "@/components/MetroCard";
import { PageHero } from "@/components/PageHero";
import { metroPath } from "@/lib/config";
import { metroJsonLd } from "@/lib/jsonld";
import { getMetroBySlug, getMetros, getPublishedListings } from "@/lib/listings";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const metro = await getMetroBySlug(slug);
  if (!metro) return { title: "Metro" };
  return {
    title: `${metro.name} contractors`,
    description: metro.description,
    alternates: { canonical: metroPath(metro.slug) },
  };
}

export default async function MetroDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const metro = await getMetroBySlug(slug);
  if (!metro) notFound();

  const listings = await getPublishedListings({ metroSlug: metro.slug });
  const others = (await getMetros()).filter((item) => item.id !== metro.id);

  return (
    <main>
      <JsonLd data={metroJsonLd(metro)} />
      <PageHero
        kicker={`${metro.state} · ${metro.stateCode}`}
        title={metro.name}
        lede={metro.description}
      />
      <section className="mx-auto max-w-6xl px-5 py-12">
        <h2 className="font-display text-3xl text-slate-deep">Contractors in this metro</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
        {!listings.length ? (
          <p className="mt-6 text-muted">No published listings in this metro yet.</p>
        ) : null}
        <h3 className="mt-16 font-display text-2xl text-slate-deep">Other hubs</h3>
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {others.map((item) => (
            <MetroCard
              key={item.id}
              slug={item.slug}
              name={item.name}
              state={item.stateCode}
              count={item.listings.length}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
