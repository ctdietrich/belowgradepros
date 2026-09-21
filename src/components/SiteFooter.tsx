import Link from "next/link";
import { BrandLockup } from "@/components/BrandLockup";
import { site } from "@/lib/config";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate/10 bg-slate-deep text-page">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 md:grid-cols-4">
        <div className="sm:col-span-2">
          <Link href="/" aria-label="BelowGradePros home">
            <BrandLockup tone="dark" size="footer" />
          </Link>
          <p className="mt-4 max-w-md text-sm leading-6 text-concrete/80">{site.description}</p>
          <p className="mt-4 text-sm">
            <a className="text-amber hover:text-concrete" href={`mailto:${site.email}`}>
              {site.email}
            </a>
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-amber">Explore</p>
          <ul className="mt-3 space-y-2 text-sm text-page/90">
            <li>
              <Link href="/cities" className="hover:text-amber">
                Cities
              </Link>
            </li>
            <li>
              <Link href="/contractors" className="hover:text-amber">
                Contractors
              </Link>
            </li>
            <li>
              <Link href="/services" className="hover:text-amber">
                Services
              </Link>
            </li>
            <li>
              <Link href="/how-it-works" className="hover:text-amber">
                How it works
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-amber">
                About
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-amber">Contractors</p>
          <ul className="mt-3 space-y-2 text-sm text-page/90">
            <li>
              <Link href="/claim" className="hover:text-amber">
                Claim a listing
              </Link>
            </li>
            <li>
              <Link href="/submit" className="hover:text-amber">
                Submit a listing
              </Link>
            </li>
            <li>
              <Link href="/founding" className="hover:text-amber">
                Founding listing
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-amber">
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-4 text-xs text-concrete/60 sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {year} {site.name}
          </span>
          <span>{site.tagline}</span>
        </div>
      </div>
    </footer>
  );
}
