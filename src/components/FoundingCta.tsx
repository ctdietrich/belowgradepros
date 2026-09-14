import Link from "next/link";
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
    <div className="rounded-2xl border border-amber/30 bg-amber/5 p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-amber-deep">Founding / featured</p>
      <p className="mt-2 font-display text-2xl text-slate">Stand out on the hub. {foundingPriceLabel()}.</p>
      <p className="mt-2 text-sm leading-6 text-slate-soft">
        Founding listings get featured placement on city hubs. Checkout is stubbed until Stripe
        keys land — the path is wired.
      </p>
      <Link
        href={href}
        className="mt-4 inline-block rounded-full bg-slate px-4 py-2 text-sm text-page hover:bg-slate-soft"
      >
        Founding listing path
      </Link>
    </div>
  );
}
