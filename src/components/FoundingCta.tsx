import Link from "next/link";
import { site } from "@/lib/config";
import { foundingOfferCopy } from "@/lib/founding";

export function FoundingCta({
  compact = false,
  source = "directory",
  listingSlug,
}: {
  compact?: boolean;
  source?: string;
  listingSlug?: string;
}) {
  const href = listingSlug
    ? `/founding?listing=${encodeURIComponent(listingSlug)}`
    : `/founding?from=${encodeURIComponent(source)}`;

  if (compact) {
    return (
      <div className="text-sm leading-6">
        <p className="text-slate-soft">{foundingOfferCopy()}</p>
        <Link href={href} className="mt-2 inline-block text-amber-deep hover:underline">
          See founding spots →
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber/30 bg-amber/5 p-6 md:p-8">
      <p className="text-xs uppercase tracking-[0.18em] text-amber-deep">Founding</p>
      <p className="mt-2 font-display text-2xl text-slate md:text-3xl">Free until your first lead.</p>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-soft">{foundingOfferCopy()}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href={href}
          className="inline-block rounded-full bg-slate px-4 py-2 text-sm text-page hover:bg-slate-soft"
        >
          Get featured placement
        </Link>
        <a href={`mailto:${site.email}`} className="inline-flex items-center text-sm text-amber-deep hover:underline">
          Email {site.email}
        </a>
      </div>
    </div>
  );
}
