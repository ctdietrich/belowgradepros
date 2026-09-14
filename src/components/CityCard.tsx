import Image from "next/image";
import Link from "next/link";
import { cityPath } from "@/lib/config";

export function CityCard({
  slug,
  name,
  state,
  region,
  heroImage,
  count,
  href,
  cta,
  chips,
}: {
  slug: string;
  name: string;
  state: string;
  region: string;
  heroImage?: string | null;
  count: number;
  href?: string;
  cta?: string | null;
  chips?: { label: string; href: string }[];
}) {
  const mainHref = href ?? cityPath(slug);
  const label = cta ? `${name} — ${cta}` : name;

  return (
    <article className="group relative flex min-h-56 flex-col justify-end overflow-hidden rounded-2xl bg-slate">
      {heroImage ? (
        <Image
          src={heroImage}
          alt=""
          fill
          className="object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-90"
          sizes="(min-width: 1024px) 25vw, 100vw"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-deep via-slate/20 to-transparent" />
      <Link href={mainHref} className="absolute inset-0 z-0" aria-label={label} />
      <div className="relative z-10 p-5 text-page pointer-events-none">
        <p className="text-xs uppercase tracking-[0.18em] text-concrete/80">
          {region} · {state}
        </p>
        <h3 className="font-display text-3xl">{name}</h3>
        <p className="mt-1 text-sm text-concrete/80">
          {count} {count === 1 ? "contractor" : "contractors"}
        </p>
        {cta ? (
          <p className="mt-3 inline-flex rounded-full bg-amber px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-slate-deep">
            {cta}
          </p>
        ) : null}
        {chips?.length ? (
          <div className="mt-3 flex flex-wrap gap-2 pointer-events-auto">
            {chips.map((chip) => (
              <Link
                key={`${chip.label}-${chip.href}`}
                href={chip.href}
                className="rounded-full border border-page/35 bg-slate-deep/70 px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] text-page hover:bg-page hover:text-slate-deep"
              >
                {chip.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
