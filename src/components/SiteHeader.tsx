import Link from "next/link";
import { BrandLockup } from "@/components/BrandLockup";

const links = [
  { href: "/cities", label: "Cities" },
  { href: "/contractors", label: "Contractors" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
];

export function SiteHeader({ tone = "light" }: { tone?: "light" | "dark" }) {
  const onDark = tone === "dark";

  return (
    <header
      className={`relative z-20 border-b ${
        onDark ? "border-white/10 text-page" : "border-slate/10 bg-page text-slate"
      }`}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
        <Link href="/" aria-label="BelowGradePros home">
          <BrandLockup tone={tone} />
        </Link>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] uppercase tracking-[0.22em]">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={onDark ? "hover:text-concrete" : "text-slate-soft hover:text-amber-deep"}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/founding"
            className={onDark ? "hover:text-concrete" : "text-slate-soft hover:text-amber-deep"}
          >
            Founding
          </Link>
          <Link
            href="/submit"
            className={`rounded-full px-3 py-1.5 tracking-[0.16em] ${
              onDark
                ? "bg-concrete text-slate-deep hover:bg-white"
                : "bg-slate-deep text-page hover:bg-slate"
            }`}
          >
            List with us
          </Link>
        </nav>
      </div>
    </header>
  );
}
