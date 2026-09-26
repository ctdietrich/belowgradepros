import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FoundingCta } from "@/components/FoundingCta";
import { JsonLd } from "@/components/JsonLd";
import {
  additionalServiceLabel,
  cityPath,
  listingPath,
  primaryServiceLabel,
  typeLabel,
} from "@/lib/config";
import { listingJsonLd } from "@/lib/jsonld";
import { asStringArray, getListingBySlug, listingBadges, publicContactEmail } from "@/lib/listings";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) return { title: "Contractor" };
  return {
    title: listing.name,
    description: listing.tagline ?? listing.bio.slice(0, 160),
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

  const photos = asStringArray(listing.photos);
  const badges = listingBadges(listing);
  const cities = listing.cities.map((item) => item.city);
  const contactEmail = publicContactEmail(listing.contactEmail);

  return (
    <main>
      <JsonLd data={listingJsonLd(listing)} />
      <section className="bg-slate text-page">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <p className="text-xs uppercase tracking-[0.2em] text-amber">
            {typeLabel(listing.type)}
            {listing.verified ? " · Verified" : ""}
            {listing.founding ? " · Founding" : listing.featured ? " · Featured" : ""}
          </p>
          <h1 className="mt-3 font-display text-4xl md:text-6xl">{listing.name}</h1>
          {listing.tagline ? (
            <p className="mt-4 max-w-2xl text-lg text-concrete/80">{listing.tagline}</p>
          ) : null}
          <p className="mt-4 text-sm uppercase tracking-[0.16em] text-amber">
            {primaryServiceLabel(listing.primaryService)}
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-sm text-concrete/70">
            {cities.map((city) => (
              <Link
                key={city.id}
                href={cityPath(city.slug)}
                className="rounded-full border border-white/15 px-3 py-1 hover:bg-white/10"
              >
                {city.name}
              </Link>
            ))}
            {listing.homeCity ? (
              <span className="rounded-full border border-white/10 px-3 py-1">
                {[listing.homeCity, listing.homeState].filter(Boolean).join(", ")}
              </span>
            ) : null}
          </div>
        </div>
      </section>

      {photos[0] ? (
        <div className="relative mx-auto mt-8 max-w-6xl overflow-hidden rounded-2xl px-5">
          <div className="relative aspect-[16/7] overflow-hidden rounded-2xl bg-slate">
            <Image
              src={photos[0]}
              alt={listing.name}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          </div>
        </div>
      ) : null}

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-3">
        <article className="lg:col-span-2">
          <p className="text-base leading-8 text-slate-soft">{listing.bio}</p>
          {badges.length ? (
            <div className="mt-8">
              <h2 className="text-xs uppercase tracking-[0.2em] text-muted">Additional services</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {badges.map((item) => (
                  <span key={item} className="rounded-full bg-concrete-light px-3 py-1 text-sm">
                    {additionalServiceLabel(item)}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          {photos.length > 1 ? (
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {photos.slice(1).map((photo) => (
                <div key={photo} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate">
                  <Image src={photo} alt="" fill className="object-cover" sizes="50vw" />
                </div>
              ))}
            </div>
          ) : null}
        </article>
        <aside className="space-y-6">
          <div className="h-fit rounded-2xl border border-slate/10 bg-white p-6">
            <h2 className="font-display text-2xl text-slate">Inquire directly</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              BelowGradePros is a directory. Reach the contractor on their terms — we do not book or
              take a commission.
            </p>
            <dl className="mt-6 space-y-3 text-sm">
              {contactEmail ? (
                <div>
                  <dt className="text-xs uppercase tracking-[0.16em] text-muted">Email</dt>
                  <dd>
                    <a className="text-amber-deep hover:underline" href={`mailto:${contactEmail}`}>
                      {contactEmail}
                    </a>
                  </dd>
                </div>
              ) : null}
              {listing.website ? (
                <div>
                  <dt className="text-xs uppercase tracking-[0.16em] text-muted">Website</dt>
                  <dd>
                    <a
                      className="text-amber-deep hover:underline"
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
                  <dd>{listing.phone}</dd>
                </div>
              ) : null}
              {listing.licenseId ? (
                <div>
                  <dt className="text-xs uppercase tracking-[0.16em] text-muted">License</dt>
                  <dd>{listing.licenseId}</dd>
                </div>
              ) : null}
              {listing.sourceUrl ? (
                <div>
                  <dt className="text-xs uppercase tracking-[0.16em] text-muted">Source</dt>
                  <dd className="break-all text-muted">{listing.sourceUrl}</dd>
                </div>
              ) : null}
            </dl>
            {listing.claimedAt ? (
              <p className="mt-6 text-xs uppercase tracking-[0.16em] text-amber-deep">Claimed</p>
            ) : (
              <Link
                href={`/claim?listing=${listing.slug}`}
                className="mt-6 inline-block text-sm text-slate hover:text-amber-deep"
              >
                Claim this listing →
              </Link>
            )}
          </div>
          {listing.founding || listing.featured ? null : <FoundingCta compact source={`listing:${listing.slug}`} />}
        </aside>
      </section>
    </main>
  );
}
