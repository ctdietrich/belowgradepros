import Link from "next/link";

const links = [
  { href: "/search", label: "Browse" },
  { href: "/metros", label: "Metros" },
  { href: "/for-contractors", label: "Contractors" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  return (
    <header className="relative z-20 border-b border-slate/10 bg-paper text-slate-deep">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="flex items-center gap-2.5" aria-label="BelowGradePros home">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-deep text-[13px] font-semibold tracking-tight text-amber-soft">
            BG
          </span>
          <span className="font-display text-xl tracking-tight text-slate-deep">
            BelowGradePros
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] uppercase tracking-[0.18em]">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-slate-soft hover:text-amber">
              {link.label}
            </Link>
          ))}
          <Link
            href="/submit"
            className="rounded-full bg-slate-deep px-3 py-1.5 tracking-[0.14em] text-paper hover:bg-slate"
          >
            List your company
          </Link>
        </nav>
      </div>
    </header>
  );
}
