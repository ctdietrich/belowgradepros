import Link from "next/link";
import { cityPath } from "@/lib/config";
import type { HubDensify } from "@/lib/hub-densify";
import { getWave1Hub } from "@/lib/hubs";

export function HubDensifySection({ densify }: { densify: HubDensify }) {
  const hub = getWave1Hub(densify.slug);
  const displayName = hub?.name ?? densify.slug;

  return (
    <section className="mt-16 space-y-12 border-t border-slate/10 pt-12" aria-label={`${displayName} moisture SEO`}>
      <div className="rounded-2xl border border-amber/35 bg-amber/5 p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.18em] text-amber-deep">Crawl space encapsulation</p>
        <h2 className="mt-2 font-display text-2xl text-slate md:text-3xl">
          Encapsulation contractors in {displayName}
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-soft md:text-base">{densify.encapCta}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={cityPath(densify.slug, "encapsulation")}
            className="inline-flex rounded-full bg-slate px-4 py-2 text-sm font-medium text-page hover:bg-slate-soft"
          >
            Browse encapsulation
          </Link>
          <Link
            href={cityPath(densify.slug, "foundation-repair")}
            className="inline-flex rounded-full border border-slate/20 px-4 py-2 text-sm text-slate-soft hover:border-slate/40"
          >
            Foundation repair
          </Link>
          <Link href="/claim" className="inline-flex items-center text-sm text-amber-deep hover:underline">
            Claim your listing
          </Link>
          <Link href="/submit" className="inline-flex items-center text-sm text-amber-deep hover:underline">
            List your company
          </Link>
        </div>
      </div>

      <div>
        <h2 className="font-display text-2xl text-slate md:text-3xl">
          {displayName} crawl space FAQ
        </h2>
        <dl className="mt-6 space-y-6">
          {densify.faqs.map((item) => (
            <div key={item.question}>
              <dt className="font-medium text-slate">{item.question}</dt>
              <dd className="mt-2 max-w-3xl text-sm leading-7 text-slate-soft">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div>
        <h2 className="font-display text-2xl text-slate">Related cities</h2>
        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-3 text-sm">
          {densify.related.map((item) => (
            <li key={item.slug}>
              <Link
                href={cityPath(item.slug, "encapsulation")}
                className="text-amber-deep hover:underline"
              >
                {item.anchor}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
