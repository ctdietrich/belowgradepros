"use client";

import Link from "next/link";
import { useState } from "react";

export const NAV_LINKS = [
  { href: "/cities", label: "Cities" },
  { href: "/contractors", label: "Contractors" },
  { href: "/services", label: "Services" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About" },
] as const;

export function SiteNav({ tone = "light" }: { tone?: "light" | "dark" }) {
  const [open, setOpen] = useState(false);
  const onDark = tone === "dark";
  const linkClass = onDark
    ? "text-page/90 hover:text-concrete"
    : "text-slate-soft hover:text-amber-deep";
  const ctaClass = onDark
    ? "bg-amber text-slate-deep hover:bg-amber/90"
    : "bg-slate-deep text-page hover:bg-slate";

  return (
    <>
      <button
        type="button"
        className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-sm md:hidden ${
          onDark ? "border-white/20 text-page" : "border-slate/15 text-slate"
        }`}
        aria-expanded={open}
        aria-controls="site-nav"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "Close" : "Menu"}
      </button>
      <nav
        id="site-nav"
        className={`${open ? "flex" : "hidden"} w-full flex-col gap-3 text-sm md:flex md:w-auto md:flex-row md:items-center md:gap-x-6`}
      >
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className={linkClass} onClick={() => setOpen(false)}>
            {link.label}
          </Link>
        ))}
        <Link href="/claim" className={linkClass} onClick={() => setOpen(false)}>
          Claim listing
        </Link>
        <Link
          href="/submit"
          className={`inline-flex w-fit rounded-full px-4 py-2 text-sm font-medium ${ctaClass}`}
          onClick={() => setOpen(false)}
        >
          List with us
        </Link>
      </nav>
    </>
  );
}
