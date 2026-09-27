import type { Source } from "@/lib/sources";

export function SourceList({ sources }: { sources: readonly Source[] }) {
  return (
    <section className="mt-14 border-t border-slate/10 pt-8" aria-labelledby="sources-heading">
      <h2 id="sources-heading" className="font-display text-2xl text-slate">
        Sources
      </h2>
      <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-6 text-slate-soft">
        {sources.map((source) => (
          <li key={source.id} id={`source-${source.id}`}>
            <span className="font-medium text-slate">{source.publisher}</span>
            {": "}
            {source.title}
            {". "}
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-amber-deep hover:underline"
            >
              {source.url}
            </a>
            {". Accessed "}
            {source.accessed}
            {"."}
          </li>
        ))}
      </ol>
    </section>
  );
}
