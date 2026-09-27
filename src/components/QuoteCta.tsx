import Link from "next/link";
import type { QuoteService } from "@/lib/cost-paths";

export type QuoteCtaProps = {
  citySlug: string;
  service: QuoteService;
  source?: string;
  label: string;
  microcopy?: string;
  appearance?: "on-dark" | "on-light" | "prominent";
};

function quoteHref({ citySlug, service, source }: Pick<QuoteCtaProps, "citySlug" | "service" | "source">) {
  const params = new URLSearchParams();
  params.set("service", service);
  if (citySlug) params.set("city", citySlug);
  if (source) params.set("source", source);
  return `/contact?${params.toString()}`;
}

/**
 * Placeholder until the Site Engineer homeowner quote form lands.
 * TODO: one-line swap —
 * return <QuoteForm citySlug={citySlug} service={service} source={source} />;
 */
export function QuoteCta({
  citySlug,
  service,
  source,
  label,
  microcopy,
  appearance = "on-light",
}: QuoteCtaProps) {
  const href = quoteHref({ citySlug, service, source });
  const prominent = appearance === "prominent";
  const onDark = appearance === "on-dark";
  const buttonClass = prominent
    ? "inline-flex rounded-full bg-amber px-5 py-3 text-base font-semibold text-slate-deep hover:bg-amber/90"
    : onDark
      ? "inline-flex rounded-full bg-amber px-4 py-2 text-sm font-medium text-slate-deep hover:bg-amber/90"
      : "inline-flex rounded-full bg-slate px-4 py-2 text-sm font-medium text-page hover:bg-slate-soft";

  return (
    <div>
      <Link href={href} className={buttonClass}>
        {label}
      </Link>
      {microcopy ? (
        <p className={`mt-2 text-sm ${onDark ? "text-concrete/80" : "text-muted"}`}>{microcopy}</p>
      ) : null}
    </div>
  );
}
