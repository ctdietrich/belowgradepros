import { SERVICES } from "@/lib/config";

type MetroOption = { slug: string; name: string };
type StateOption = { state: string; stateCode: string };

export function FilterBar({
  action,
  metros,
  states,
  current,
}: {
  action: string;
  metros: MetroOption[];
  states: StateOption[];
  current: { q?: string; metro?: string; state?: string; service?: string };
}) {
  return (
    <form
      action={action}
      className="grid gap-3 rounded-2xl border border-slate/10 bg-white p-4 md:grid-cols-5"
    >
      <label className="text-sm">
        <span className="mb-1 block text-xs uppercase tracking-[0.16em] text-muted">Search</span>
        <input
          name="q"
          defaultValue={current.q}
          placeholder="Company or city"
          className="w-full rounded-lg border border-slate/15 bg-paper px-3 py-2 outline-none focus:border-amber"
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs uppercase tracking-[0.16em] text-muted">Metro</span>
        <select
          name="metro"
          defaultValue={current.metro ?? ""}
          className="w-full rounded-lg border border-slate/15 bg-paper px-3 py-2 outline-none focus:border-amber"
        >
          <option value="">All metros</option>
          {metros.map((metro) => (
            <option key={metro.slug} value={metro.slug}>
              {metro.name}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs uppercase tracking-[0.16em] text-muted">State</span>
        <select
          name="state"
          defaultValue={current.state ?? ""}
          className="w-full rounded-lg border border-slate/15 bg-paper px-3 py-2 outline-none focus:border-amber"
        >
          <option value="">All states</option>
          {states.map((item) => (
            <option key={item.stateCode} value={item.stateCode}>
              {item.state} ({item.stateCode})
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs uppercase tracking-[0.16em] text-muted">Service</span>
        <select
          name="service"
          defaultValue={current.service ?? ""}
          className="w-full rounded-lg border border-slate/15 bg-paper px-3 py-2 outline-none focus:border-amber"
        >
          <option value="">All services</option>
          {SERVICES.map((service) => (
            <option key={service.key} value={service.key}>
              {service.label}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-end">
        <button
          type="submit"
          className="w-full rounded-lg bg-slate-deep px-4 py-2.5 text-sm text-paper hover:bg-slate"
        >
          Filter
        </button>
      </div>
    </form>
  );
}
