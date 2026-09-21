import Link from "next/link";
import { BrandLockup } from "@/components/BrandLockup";
import { SiteNav } from "@/components/SiteNav";

export function SiteHeader({ tone = "light" }: { tone?: "light" | "dark" }) {
  const onDark = tone === "dark";

  return (
    <header
      className={`relative z-20 border-b ${
        onDark ? "border-white/10 text-page" : "border-slate/10 bg-page text-slate"
      }`}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-4">
        <Link href="/" aria-label="BelowGradePros home" className="min-w-0">
          <BrandLockup tone={tone} />
        </Link>
        <SiteNav tone={tone} />
      </div>
    </header>
  );
}
