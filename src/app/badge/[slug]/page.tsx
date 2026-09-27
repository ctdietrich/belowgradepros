import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { foundingBadgeEmbedHtml, FOUNDING_BADGE_ALT, FOUNDING_BADGE_HEIGHT, FOUNDING_BADGE_WIDTH, isBadgeSlug } from "@/lib/badge";
import { getFoundingBadgeListing } from "@/lib/listings";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: "Founding Pro badge",
    description: `Embed the Founding Pro badge for ${slug}.`,
    robots: { index: false, follow: false },
  };
}

export default async function FoundingBadgePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isBadgeSlug(slug)) notFound();
  const listing = await getFoundingBadgeListing(slug);
  if (!listing) notFound();
  const snippet = foundingBadgeEmbedHtml(listing.slug);

  return (
    <main>
      <PageHero
        kicker="Founding Pro"
        title={`${listing.name} badge`}
        lede="Paste this on your site. It links back to your BelowGradePros listing."
      />
      <section className="mx-auto grid max-w-3xl gap-8 px-5 py-12">
        <div className="rounded-2xl border border-slate/10 bg-white p-6 shadow-sm">
          {/* SVG route, not a raster the image optimizer can serve. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/badge/${listing.slug}.svg`}
            alt={FOUNDING_BADGE_ALT}
            width={FOUNDING_BADGE_WIDTH}
            height={FOUNDING_BADGE_HEIGHT}
          />
        </div>
        <div className="rounded-2xl border border-slate/10 bg-white p-6 text-sm leading-7 text-slate-soft shadow-sm">
          <h2 className="font-display text-2xl text-slate">HTML snippet</h2>
          <pre className="mt-4 overflow-x-auto rounded-xl bg-slate p-4 text-xs leading-6 text-page">
            <code>{snippet}</code>
          </pre>
        </div>
      </section>
    </main>
  );
}
