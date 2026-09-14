import { site } from "@/lib/config";

type CityOption = { slug: string; name: string };

export function FilterBar({
  action,
  cities,
  current,
}: {
  action: string;
  cities: CityOption[];
  current: { q?: string; city?: string; service?: string };
}) {
  return (
    <form
      action={action}
      className="grid gap-3 rounded-2xl border border-slate/10 bg-white p-4 md:grid-cols-4"
    >
      <label className="text-sm">
        <span className="mb-1 block text-xs uppercase tracking-[0.16em] text-muted">Search</span>
        <input
          name="q"
          defaultValue={current.q}
          placeholder="Name or metro"
          className="w-full rounded-lg border border-slate/15 bg-page px-3 py-2 outline-none focus:border-amber"
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs uppercase tracking-[0.16em] text-muted">City hub</span>
        <select
          name="city"
          defaultValue={current.city ?? ""}
          className="w-full rounded-lg border border-slate/15 bg-page px-3 py-2 outline-none focus:border-amber"
        >
          <option value="">All metros</option>
          {cities.map((city) => (
            <option key={city.slug} value={city.slug}>
              {city.name}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs uppercase tracking-[0.16em] text-muted">Service</span>
        <select
          name="service"
          defaultValue={current.service ?? ""}
          className="w-full rounded-lg border border-slate/15 bg-page px-3 py-2 outline-none focus:border-amber"
        >
          <option value="">All services</option>
          {site.services.map((item) => (
            <option key={item.key} value={item.key}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-end">
        <button
          type="submit"
          className="w-full rounded-lg bg-slate px-4 py-2.5 text-sm text-page hover:bg-slate-soft"
        >
          Filter
        </button>
      </div>
    </form>
  );
}
