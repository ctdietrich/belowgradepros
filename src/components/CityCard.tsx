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
}: {
  slug: string;
  name: string;
  state: string;
  region: string;
  heroImage?: string | null;
  count: number;
}) {
  return (
    <Link
      href={cityPath(slug)}
      className="group relative block min-h-56 overflow-hidden rounded-2xl bg-slate"
    >
      {heroImage ? (
        <Image
          src={heroImage}
          alt={name}
          fill
          className="object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-90"
          sizes="(min-width: 1024px) 25vw, 100vw"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-deep via-slate/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5 text-page">
        <p className="text-xs uppercase tracking-[0.18em] text-concrete/80">
          {region} · {state}
        </p>
        <h3 className="font-display text-3xl">{name}</h3>
        <p className="mt-1 text-sm text-concrete/80">
          {count} {count === 1 ? "contractor" : "contractors"}
        </p>
      </div>
    </Link>
  );
}
