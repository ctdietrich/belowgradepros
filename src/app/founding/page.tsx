import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { site } from "@/lib/config";
import { foundingAvailability, foundingOfferCopy, foundingSpotsFullMessage } from "@/lib/founding";
import { getPublishedListingByRef, missingPublishedClaimTarget } from "@/lib/listings";

const offer = foundingOfferCopy();

export const metadata: Metadata = {
  title: "Founding listing",
  description: offer,
  openGraph: {
    title: "Founding listing",
    description: offer,
  },
  alternates: { canonical: "/founding" },
};

export const dynamic = "force-dynamic";

export default async function FoundingPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; listing?: string }>;
}) {
  const { listing: listingRef } = await searchParams;
  // Deep links use slug: /founding?listing={slug}. Cuid id still works.
  // A ref that is not a published listing is a real 404; bare /founding stays generic.
  const listing = listingRef?.trim() ? await getPublishedListingByRef(listingRef) : null;
  if (missingPublishedClaimTarget(listingRef, listing)) notFound();
  const availability = listing
    ? await foundingAvailability(listing.cities.map((item) => item.city))
    : null;
  const claimHref = listing ? `/claim?listing=${encodeURIComponent(listing.slug)}` : "/claim";

  return (
    <main>
      <PageHero
        kicker="Founding contractors"
        title="Free until your first real homeowner lead."
        lede={offer}
      />
      <section className="mx-auto grid max-w-3xl gap-8 px-5 py-12">
        <div className="rounded-2xl border border-slate/10 bg-white p-6 text-sm leading-7 text-slate-soft shadow-sm">
          <p>{offer}</p>
          <p className="mt-3">
            Founding placement is requested with a claim. We review it before the listing is marked
            founding. Questions:{" "}
            <a className="text-amber-deep hover:underline" href={`mailto:${site.email}`}>
              {site.email}
            </a>
            .
          </p>
        </div>
        {listing ? (
          <div className="rounded-2xl border border-amber/40 bg-white px-5 py-4 text-sm leading-6 text-slate">
            <p>
              This offer is for <span className="font-medium">{listing.name}</span>
              <span className="text-slate-soft"> · {listing.slug}</span>.
            </p>
            {availability && !availability.spotsOpen && availability.fullCityName ? (
              <p className="mt-3">{foundingSpotsFullMessage(availability.fullCityName)}</p>
            ) : null}
            <p className="mt-3">
              <Link href={claimHref} className="text-amber-deep hover:underline">
                {availability && !availability.spotsOpen
                  ? "Continue with a standard claim"
                  : "Claim this listing"}
              </Link>
            </p>
          </div>
        ) : (
          <p>
            <Link
              href="/claim"
              className="inline-block rounded-full bg-slate px-5 py-2.5 text-sm text-page hover:bg-slate-soft"
            >
              Claim a listing
            </Link>
          </p>
        )}
      </section>
    </main>
  );
}
