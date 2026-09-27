import Link from "next/link";
import { CitedText } from "@/components/CitedText";
import { JsonLd } from "@/components/JsonLd";
import { QuoteCta } from "@/components/QuoteCta";
import { SourceList } from "@/components/SourceList";
import { plainCited } from "@/lib/citations";
import {
  costPageCitationNotes,
  costPageSources,
  type CostPage,
} from "@/lib/cost-pages";
import type { QuoteService } from "@/lib/cost-paths";
import { breadcrumbListJsonLd, faqPageJsonLd } from "@/lib/jsonld";

function quoteService(page: CostPage): QuoteService {
  return page.service === "encapsulation" ? "encapsulation" : "foundation";
}

export function CostGuide({ page }: { page: CostPage }) {
  const notes = costPageCitationNotes(page);
  const sources = costPageSources(page);
  const service = quoteService(page);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: page.cityName, path: `/cities/${page.slug}` },
    { name: "Cost", path: page.path },
  ];

  return (
    <main>
      <JsonLd data={faqPageJsonLd(page.faqs.map((faq) => ({
        question: faq.question,
        answer: plainCited(faq.answer, notes),
      })))} />
      <JsonLd data={breadcrumbListJsonLd(crumbs)} />
      <section className="bg-slate text-page">
        <div className="mx-auto max-w-6xl px-5 py-10 md:py-14">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-concrete/80">
              <li>
                <Link href="/" className="hover:text-page">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href={`/cities/${page.slug}`} className="hover:text-page">
                  {page.cityName}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-page">Cost</li>
            </ol>
          </nav>
          <p className="mt-6 text-xs uppercase tracking-[0.22em] text-amber">
            {page.cityName}, {page.state}
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight md:text-5xl">{page.h1}</h1>
          <div
            className="mt-6 max-w-xl rounded-2xl bg-page p-5 text-slate shadow-sm md:p-6"
            data-price-block
            data-price-label={page.price.labelKind}
          >
            <p className="text-sm font-medium text-amber-deep">{page.price.label}</p>
            <p className="mt-1 font-display text-4xl leading-tight">{page.price.range}</p>
            <p className="mt-3 text-sm leading-6 text-slate-soft">
              Source: <CitedText text={page.price.sourceNote} notes={notes} />
              {page.price.sourceNote.trim().endsWith(".") ? " " : ". "}
              Accessed {page.price.accessed}.
            </p>
          </div>
          <p className="mt-6 max-w-2xl text-base leading-7 text-concrete/85">{page.lede}</p>
          <div className="mt-6">
            <QuoteCta
              citySlug={page.slug}
              service={service}
              source={page.path}
              label={page.ctaLabel}
              appearance="on-dark"
            />
          </div>
        </div>
      </section>
      <article className="mx-auto max-w-3xl px-5 py-12">
        {page.sections.map((section) => (
          <section key={section.heading} className="mt-10 first:mt-0">
            <h2 className="font-display text-2xl text-slate md:text-3xl">{section.heading}</h2>
            <ul className="mt-4 list-disc space-y-3 pl-5 text-base leading-7 text-slate-soft">
              {section.bullets.map((bullet) => (
                <li key={bullet}>
                  <CitedText text={bullet} notes={notes} />
                </li>
              ))}
            </ul>
          </section>
        ))}
        <section className="mt-10">
          <h2 className="font-display text-2xl text-slate md:text-3xl">Signs you should get an inspection now</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-base leading-7 text-slate-soft">
            {page.signs.map((sign) => (
              <li key={sign}>
                <CitedText text={sign} notes={notes} />
              </li>
            ))}
          </ul>
          {page.signsCta ? (
            <p className="mt-4 text-sm">
              <Link href={page.signsCta.href} className="text-amber-deep hover:underline">
                {page.signsCta.label}
              </Link>
            </p>
          ) : null}
        </section>
        <section className="mt-10">
          <h2 className="font-display text-2xl text-slate md:text-3xl">FAQ</h2>
          <dl className="mt-4 space-y-6">
            {page.faqs.map((faq) => (
              <div key={faq.question}>
                <dt className="font-medium text-slate">{faq.question}</dt>
                <dd className="mt-2 text-base leading-7 text-slate-soft">
                  <CitedText text={faq.answer} notes={notes} />
                </dd>
              </div>
            ))}
          </dl>
        </section>
        <div className="mt-8">
          <QuoteCta
            citySlug={page.slug}
            service={service}
            source={page.path}
            label={page.ctaLabel}
          />
        </div>
        <nav className="mt-10" aria-label="Related pages">
          <h2 className="font-display text-2xl text-slate">Related pages</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {[page.links.hub, page.links.sibling, page.links.tool, page.links.related].map((link) => (
              <li key={link.href + link.label}>
                <Link href={link.href} className="text-amber-deep hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <SourceList sources={sources} />
      </article>
    </main>
  );
}
