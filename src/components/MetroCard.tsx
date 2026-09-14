import Link from "next/link";
import { metroPath } from "@/lib/config";

export function MetroCard({
  slug,
  name,
  state,
  description,
  count,
}: {
  slug: string;
  name: string;
  state: string;
  description?: string;
  count: number;
}) {
  return (
    <Link
      href={metroPath(slug)}
      className="group flex min-h-44 flex-col justify-between rounded-2xl bg-slate-deep p-5 text-paper transition hover:bg-slate"
    >
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-amber-soft">{state}</p>
        <h3 className="mt-2 font-display text-3xl">{name}</h3>
        {description ? (
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-paper/70">{description}</p>
        ) : null}
      </div>
      <p className="mt-4 text-sm text-amber-soft">
        {count} {count === 1 ? "listing" : "listings"}
      </p>
    </Link>
  );
}
