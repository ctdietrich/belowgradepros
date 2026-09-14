import Link from "next/link";
import { site } from "@/lib/config";

export function PricingCta({ compact = false }: { compact?: boolean }) {
  return (
    <aside className="rounded-2xl border border-amber/30 bg-amber-soft/40 p-6">
      <p className="text-xs uppercase tracking-[0.18em] text-amber">Founding listings</p>
      <h2 className="mt-2 font-display text-2xl text-slate-deep">{site.foundingPrice}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-soft">
        Inquiry-first for v1 — no checkout in this release. When paid placement opens, founding
        contractor listings will be {site.foundingPrice}. Submit or claim now to get in the queue.
      </p>
      {compact ? null : (
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/submit"
            className="rounded-full bg-slate-deep px-4 py-2 text-sm text-paper hover:bg-slate"
          >
            Submit a listing
          </Link>
          <Link
            href="/claim"
            className="rounded-full border border-slate/20 px-4 py-2 text-sm text-slate-deep hover:border-amber"
          >
            Claim an existing profile
          </Link>
        </div>
      )}
    </aside>
  );
}
