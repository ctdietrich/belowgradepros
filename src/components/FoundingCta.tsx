import Link from "next/link";
import { site } from "@/lib/config";
import { foundingPriceLabel } from "@/lib/stripe";

export function FoundingCta({
  compact = false,
  source = "directory",
}: {
  compact?: boolean;
  source?: string;
}) {
  const href = `/founding?from=${encodeURIComponent(source)}`;

  if (compact) {
    return (
      <Link href={href} className="text-sm text-amber-deep hover:underline">
        Upgrade to a founding listing ({foundingPriceLabel()}) →
      </Link>
    );
  }

  return (
    <div className="rounded-2xl border border-amber/30 bg-amber/5 p-6 md:p-8">
      <p className="text-xs uppercase tracking-[0.18em] text-amber-deep">Founding / featured</p>
      <p className="mt-2 font-display text-2xl text-slate md:text-3xl">
        Featured placement on city hubs. {foundingPriceLabel()}.
      </p>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-soft">
        Directory profiles are free. Founding listings receive featured placement on metro hubs.
        Start with a claim or submission — we follow up from {site.email} to activate featured
        placement.
      </p>
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
