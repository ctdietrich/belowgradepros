import Link from "next/link";
import { site } from "@/lib/config";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-slate/10 bg-slate-deep text-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link href="/" className="flex items-center gap-2.5" aria-label="BelowGradePros home">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-amber text-[13px] font-semibold text-slate-deep">
              BG
            </span>
            <span className="font-display text-xl text-paper">BelowGradePros</span>
          </Link>
          <p className="mt-4 max-w-md text-sm leading-6 text-paper/75">
            A specialty directory for foundation repair and crawl-space/basement encapsulation.
            Homeowners find a below-grade specialist. Contractors get found by people who already
            know the job is under the house.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-amber-soft">Explore</p>
          <ul className="mt-3 space-y-2 text-sm text-paper/85">
            <li>
              <Link href="/search">Browse listings</Link>
            </li>
            <li>
              <Link href="/metros">City hubs</Link>
            </li>
            <li>
              <Link href="/about">About</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-amber-soft">Contractors</p>
          <ul className="mt-3 space-y-2 text-sm text-paper/85">
            <li>
              <Link href="/submit">Submit a listing</Link>
            </li>
            <li>
              <Link href="/claim">Claim a listing</Link>
            </li>
            <li>
              <Link href="/for-contractors">Founding pricing</Link>
            </li>
            <li>
              <Link href="/admin">Admin</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl justify-between px-5 py-4 text-xs text-paper/50">
          <span>{site.domain}</span>
          <span>Directory — not a booking marketplace.</span>
        </div>
      </div>
    </footer>
  );
}
