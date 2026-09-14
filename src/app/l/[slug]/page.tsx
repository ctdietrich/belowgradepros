import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { ServicePills } from "@/components/ServicePills";
import { listingPath, metroPath } from "@/lib/config";
import { listingJsonLd } from "@/lib/jsonld";
import { getListingBySlug, listingServices } from "@/lib/listings";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) return { title: "Listing" };
  return {
    title: listing.name,
    description: listing.description.slice(0, 160),
    alternates: { canonical: listingPath(listing.slug) },
  };
}

export default async function ListingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) notFound();

  const services = listingServices(listing);

  return (
    <main>
      <JsonLd data={listingJsonLd(listing)} />
      <section className="bg-slate-deep text-paper">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-soft">
            {listing.city}, {listing.state}
            {listing.featured ? " · Featured" : ""}
          </p>
          <h1 className="mt-3 font-display text-4xl md:text-6xl">{listing.name}</h1>
          <div className="mt-6 flex flex-wrap gap-2 text-sm">
            <Link
              href={metroPath(listing.metroSlug)}
              className="rounded-full border border-white/15 px-3 py-1 text-paper/80 hover:bg-white/10"
            >
              {listing.metroHub.name}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-3">
        <article className="lg:col-span-2">
          <p className="text-base leading-8 text-slate-soft">{listing.description}</p>
          <div className="mt-8">
            <h2 className="text-xs uppercase tracking-[0.2em] text-muted">Services</h2>
            <div className="mt-3">
              <ServicePills services={services} />
            </div>
          </div>
        </article>
        <aside className="h-fit rounded-2xl border border-slate/10 bg-white p-6">
          <h2 className="font-display text-2xl text-slate-deep">Inquire directly</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            BelowGradePros is a directory. Reach the contractor on their terms — we do not book
            jobs or take a commission.
          </p>
          <dl className="mt-6 space-y-3 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-[0.16em] text-muted">Metro</dt>
              <dd>
                {listing.city}, {listing.state} · {listing.metro}
              </dd>
            </div>
            {listing.email ? (
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-muted">Email</dt>
                <dd>
                  <a className="text-amber hover:underline" href={`mailto:${listing.email}`}>
                    {listing.email}
                  </a>
                </dd>
              </div>
            ) : null}
            {listing.website ? (
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-muted">Website</dt>
                <dd>
                  <a
                    className="text-amber hover:underline"
                    href={listing.website}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {listing.website.replace(/^https?:\/\//, "")}
                  </a>
                </dd>
              </div>
            ) : null}
            {listing.phone ? (
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-muted">Phone</dt>
                <dd>
                  <a className="text-amber hover:underline" href={`tel:${listing.phone}`}>
                    {listing.phone}
                  </a>
                </dd>
              </div>
            ) : null}
            {listing.sourceUrl ? (
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-muted">Source</dt>
                <dd className="break-all text-muted">{listing.sourceUrl}</dd>
              </div>
            ) : null}
          </dl>
          {listing.claimable ? (
            <Link
              href={`/claim?listing=${listing.id}`}
              className="mt-6 inline-block text-sm text-slate-deep hover:text-amber"
            >
              Claim this listing →
            </Link>
          ) : (
            <p className="mt-6 text-xs uppercase tracking-[0.16em] text-amber">Claimed</p>
          )}
        </aside>
      </section>
    </main>
  );
}
