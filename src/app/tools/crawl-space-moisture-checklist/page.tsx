import type { Metadata } from "next";
import Link from "next/link";
import { CitedText } from "@/components/CitedText";
import { JsonLd } from "@/components/JsonLd";
import { MoistureChecklistTool } from "@/components/MoistureChecklistTool";
import { SourceList } from "@/components/SourceList";
import { plainCited } from "@/lib/citations";
import {
  COST_METRO_SLUGS,
  encapsulationCostPath,
  foundationCostPath,
} from "@/lib/cost-paths";
import { getWave1Hub } from "@/lib/hubs";
import { breadcrumbListJsonLd, faqPageJsonLd, webApplicationJsonLd } from "@/lib/jsonld";
import {
  isChecklistCity,
  MOISTURE_CHECKLIST,
  MOISTURE_FAQS,
  toolCitationIds,
  toolCitationNotes,
} from "@/lib/moisture-checklist";
import { getSource } from "@/lib/sources";

export const metadata: Metadata = {
  title: MOISTURE_CHECKLIST.title,
  description: MOISTURE_CHECKLIST.description,
  alternates: { canonical: MOISTURE_CHECKLIST.path },
};

export default async function MoistureChecklistPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string }>;
}) {
  const { city } = await searchParams;
  const initialCity = city && isChecklistCity(city) ? city : "";
  const notes = toolCitationNotes();
  const sources = toolCitationIds().map((id) => {
    const source = getSource(id);
    if (!source) throw new Error(`Missing checklist source ${id}`);
    return source;
  });

  return (
    <main>
      <JsonLd
        data={webApplicationJsonLd({
          name: MOISTURE_CHECKLIST.h1,
          description: MOISTURE_CHECKLIST.description,
          path: MOISTURE_CHECKLIST.path,
        })}
      />
      <JsonLd
        data={faqPageJsonLd(
          MOISTURE_FAQS.map((faq) => ({
            question: faq.question,
            answer: plainCited(faq.answer, notes),
          })),
        )}
      />
      <JsonLd
        data={breadcrumbListJsonLd([
          { name: "Home", path: "/" },
          { name: "Crawl space moisture checklist", path: MOISTURE_CHECKLIST.path },
        ])}
      />
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
              <li className="text-page">Crawl space moisture checklist</li>
            </ol>
          </nav>
          <p className="mt-6 text-xs uppercase tracking-[0.22em] text-amber">Free tool</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight md:text-5xl">
            {MOISTURE_CHECKLIST.h1}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-concrete/85">
            <CitedText text={MOISTURE_CHECKLIST.intro} notes={notes} />
          </p>
        </div>
      </section>
      <article className="mx-auto max-w-6xl px-5 py-12">
        <MoistureChecklistTool initialCity={initialCity} />
        <p className="mt-8 max-w-3xl text-sm leading-6 text-muted">{MOISTURE_CHECKLIST.disclaimer}</p>
        <section className="mt-12 max-w-3xl">
          <h2 className="font-display text-2xl text-slate">FAQ</h2>
          <dl className="mt-4 space-y-6">
            {MOISTURE_FAQS.map((faq) => (
              <div key={faq.question}>
                <dt className="font-medium text-slate">{faq.question}</dt>
                <dd className="mt-2 text-base leading-7 text-slate-soft">
                  <CitedText text={faq.answer} notes={notes} />
                </dd>
              </div>
            ))}
          </dl>
        </section>
        <section className="mt-12">
          <h2 className="font-display text-2xl text-slate">Cost guides</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {COST_METRO_SLUGS.map((slug) => {
              const name = getWave1Hub(slug)?.name ?? slug;
              return (
                <li key={slug} className="rounded-2xl border border-slate/10 bg-white p-4 text-sm leading-6">
                  <Link href={`/cities/${slug}`} className="font-medium text-slate hover:text-amber-deep">
                    {name} contractors
                  </Link>
                  <p className="mt-1">
                    <Link href={encapsulationCostPath(slug)} className="text-amber-deep hover:underline">
                      What does encapsulation cost in {name}?
                    </Link>
                  </p>
                  <p>
                    <Link href={foundationCostPath(slug)} className="text-amber-deep hover:underline">
                      What does foundation repair cost in {name}?
                    </Link>
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
        <div className="max-w-3xl">
          <SourceList sources={sources} />
        </div>
      </article>
    </main>
  );
}
