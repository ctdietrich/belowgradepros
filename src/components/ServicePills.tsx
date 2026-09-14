import { serviceLabel } from "@/lib/config";

export function ServicePills({
  services,
  limit,
}: {
  services: string[];
  limit?: number;
}) {
  const items = limit ? services.slice(0, limit) : services;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full bg-paper-warm px-2.5 py-1 text-xs text-slate-soft"
        >
          {serviceLabel(item)}
        </span>
      ))}
    </div>
  );
}
