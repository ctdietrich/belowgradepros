"use client";

import { useActionState } from "react";
import { importListingsCsv, type ImportActionState } from "@/app/actions";

const field =
  "mt-1 w-full rounded-lg border border-slate/15 bg-white px-3 py-2 outline-none focus:border-amber";

export function ImportForm() {
  const [state, action, pending] = useActionState<ImportActionState, FormData>(
    importListingsCsv,
    null,
  );

  return (
    <form action={action} className="space-y-5">
      <label className="block text-sm">
        CSV file
        <input
          name="file"
          type="file"
          accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values"
          required
          className={field}
        />
      </label>
      <label className="flex items-start gap-2 text-sm">
        <input name="dryRun" type="checkbox" className="mt-1 rounded border-slate/20" />
        <span>Dry run — parse and count without writing</span>
      </label>
      <label className="flex items-start gap-2 text-sm">
        <input name="insertOnly" type="checkbox" className="mt-1 rounded border-slate/20" />
        <span>Insert only — skip names or slugs that already exist</span>
      </label>
      {state?.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
      {state?.ok ? <ImportResult state={state} /> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-slate px-5 py-2.5 text-sm text-page hover:bg-slate-soft disabled:opacity-60"
      >
        {pending ? "Importing…" : "Import CSV"}
      </button>
    </form>
  );
}

function ImportResult({ state }: { state: NonNullable<ImportActionState> }) {
  return (
    <div className="rounded-2xl border border-slate/10 bg-white p-4 text-sm">
      <p className="font-medium text-slate">{state.message}</p>
      <dl className="mt-4 grid grid-cols-3 gap-3">
        <Count label="Created" value={state.created ?? 0} />
        <Count label="Updated" value={state.updated ?? 0} />
        <Count label="Skipped" value={state.skipped ?? 0} />
      </dl>
      {state.errors?.length ? (
        <div className="mt-4">
          <p className="text-xs uppercase tracking-[0.12em] text-red-700">Errors</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-red-700">
            {state.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {state.warnings?.length ? (
        <div className="mt-4">
          <p className="text-xs uppercase tracking-[0.12em] text-muted">Warnings</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
            {state.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function Count({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.12em] text-muted">{label}</dt>
      <dd className="font-display text-3xl text-slate">{value}</dd>
    </div>
  );
}
