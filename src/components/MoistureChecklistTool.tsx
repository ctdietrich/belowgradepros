"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CitedText } from "@/components/CitedText";
import { QuoteCta } from "@/components/QuoteCta";
import {
  bandCopy,
  CHECK_ITEMS_AFTER_HUMIDITY,
  CHECK_ITEMS_BEFORE_HUMIDITY,
  checklistCityOptions,
  encapsulationResultHref,
  foundationResultHref,
  HUMIDITY_OPTIONS,
  MOISTURE_CHECKLIST,
  scoreMoistureChecklist,
  toolCitationNotes,
  type HumidityChoice,
} from "@/lib/moisture-checklist";

function CheckRow({
  id,
  label,
  points,
  helper,
  checked,
  onChange,
  notes,
}: {
  id: string;
  label: string;
  points: number;
  helper?: string;
  checked: boolean;
  onChange: (id: string, value: boolean) => void;
  notes: Record<string, number>;
}) {
  return (
    <li className="rounded-xl border border-slate/10 bg-white p-4">
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 accent-amber-deep"
          checked={checked}
          onChange={(event) => onChange(id, event.target.checked)}
        />
        <span className="text-sm leading-6 text-slate">
          <CitedText text={label} notes={notes} />
          <span className="ml-2 text-xs text-muted">+{points}</span>
        </span>
      </label>
      {helper ? (
        <p className="mt-2 pl-7 text-sm leading-6 text-slate-soft">
          <CitedText text={helper} notes={notes} />
        </p>
      ) : null}
    </li>
  );
}

export function MoistureChecklistTool({ initialCity = "" }: { initialCity?: string }) {
  const cities = checklistCityOptions();
  const notes = toolCitationNotes();
  const [citySlug, setCitySlug] = useState(initialCity);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [humidity, setHumidity] = useState<HumidityChoice | null>(null);

  const result = useMemo(
    () =>
      scoreMoistureChecklist({
        checkedIds: Object.entries(checked)
          .filter(([, on]) => on)
          .map(([id]) => id),
        humidity,
      }),
    [checked, humidity],
  );

  const city = cities.find((item) => item.slug === citySlug) ?? null;
  const copy = bandCopy(result.band);
  const button =
    result.band === "low"
      ? "Want a pro to look anyway?"
      : result.service === "both"
        ? city
          ? `Get foundation and encapsulation quotes in ${city.name}`
          : "Get foundation and encapsulation quotes"
        : city
          ? `Get encapsulation quotes in ${city.name}`
          : "Get encapsulation quotes";

  function toggle(id: string, value: boolean) {
    setChecked((current) => ({ ...current, [id]: value }));
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <form
        className="space-y-6"
        onSubmit={(event) => event.preventDefault()}
        aria-label="Crawl space moisture checklist"
      >
        <label className="block text-sm font-medium text-slate">
          Metro
          <select
            className="mt-2 w-full rounded-xl border border-slate/15 bg-white px-3 py-2 text-sm text-slate"
            value={citySlug}
            onChange={(event) => setCitySlug(event.target.value)}
          >
            <option value="">Select a metro (optional)</option>
            {cities.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}, {item.state}
              </option>
            ))}
          </select>
        </label>
        <ul className="space-y-3">
          {CHECK_ITEMS_BEFORE_HUMIDITY.map((item) => (
            <CheckRow
              key={item.id}
              {...item}
              checked={Boolean(checked[item.id])}
              onChange={toggle}
              notes={notes}
            />
          ))}
        </ul>
        <fieldset className="rounded-xl border border-slate/10 bg-white p-4">
          <legend className="px-1 text-sm font-medium text-slate">Humidity reading (pick one)</legend>
          <div className="mt-3 space-y-3">
            {HUMIDITY_OPTIONS.map((option) => (
              <label key={option.value} className="block">
                <span className="flex items-start gap-3 text-sm leading-6 text-slate">
                  <input
                    type="radio"
                    name="humidity"
                    className="mt-1 h-4 w-4 accent-amber-deep"
                    checked={humidity === option.value}
                    onChange={() => setHumidity(option.value)}
                  />
                  <span>
                    <CitedText text={option.label} notes={notes} />
                    <span className="ml-2 text-xs text-muted">+{option.points}</span>
                  </span>
                </span>
                {option.helper ? (
                  <span className="mt-1 block pl-7 text-sm leading-6 text-slate-soft">
                    <CitedText text={option.helper} notes={notes} />
                  </span>
                ) : null}
              </label>
            ))}
          </div>
        </fieldset>
        <ul className="space-y-3">
          {CHECK_ITEMS_AFTER_HUMIDITY.map((item) => (
            <CheckRow
              key={item.id}
              {...item}
              checked={Boolean(checked[item.id])}
              onChange={toggle}
              notes={notes}
            />
          ))}
        </ul>
      </form>
      <aside className="h-fit rounded-2xl border border-amber/40 bg-amber/5 p-5 lg:sticky lg:top-6" aria-live="polite">
        <p className="text-xs uppercase tracking-[0.18em] text-amber-deep">BelowGradePros heuristic</p>
        <p className="mt-2 font-display text-4xl text-slate">
          {result.score}
          <span className="text-lg text-muted"> / {result.maxScore}</span>
        </p>
        <p className="mt-1 text-sm font-medium capitalize text-slate">{result.band}</p>
        <p className="mt-3 text-sm leading-6 text-slate-soft">
          <CitedText text={copy} notes={notes} />
        </p>
        <div className="mt-4">
          <QuoteCta
            citySlug={citySlug}
            service={result.service}
            source={MOISTURE_CHECKLIST.path}
            label={button}
            appearance={result.band === "high" ? "prominent" : "on-light"}
          />
        </div>
        {city ? (
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href={encapsulationResultHref(city.slug)} className="text-amber-deep hover:underline">
                What does encapsulation cost in {city.name}?
              </Link>
            </li>
            {foundationResultHref(city.slug) ? (
              <li>
                <Link href={foundationResultHref(city.slug) ?? "/cities"} className="text-amber-deep hover:underline">
                  What does foundation repair cost in {city.name}?
                </Link>
              </li>
            ) : null}
          </ul>
        ) : null}
      </aside>
    </div>
  );
}
