import Link from "next/link";
import { BrandLockup } from "@/components/BrandLockup";
import { site } from "@/lib/config";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-slate/10 bg-slate-deep text-page">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link href="/" aria-label="BelowGradePros home">
            <BrandLockup tone="dark" size="footer" />
          </Link>
          <p className="mt-4 max-w-md text-sm leading-6 text-concrete/80">
            A specialty directory for foundation repair and crawl-space / basement
            encapsulation contractors. Built for homeowners, property managers, and
            operators who work below grade.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-amber">Explore</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/cities">City hubs</Link>
            </li>
            <li>
              <Link href="/contractors">Contractors</Link>
            </li>
            <li>
              <Link href="/services">Services</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-amber">Operators</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/founding">Founding listing</Link>
            </li>
            <li>
              <Link href="/submit">Submit a listing</Link>
            </li>
            <li>
              <Link href="/claim">Claim a listing</Link>
            </li>
            <li>
              <Link href="/about">About</Link>
            </li>
            <li>
              <Link href="/admin">Admin</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl justify-between px-5 py-4 text-xs text-concrete/60">
          <span>{site.domain}</span>
          <span>Directory — not a booking engine.</span>
        </div>
      </div>
    </footer>
  );
}
