import Link from "next/link";
import { listingPath } from "@/lib/config";
import { listingServices, type ListingWithMetro } from "@/lib/listings";
import { ServicePills } from "./ServicePills";

export function ListingCard({ listing }: { listing: ListingWithMetro }) {
  const services = listingServices(listing);

  return (
    <Link
      href={listingPath(listing.slug)}
      className="group flex flex-col rounded-2xl border border-slate/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-amber/40 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.16em] text-amber">
          {listing.city}, {listing.state}
        </p>
        {listing.featured ? (
          <span className="rounded-full bg-amber-soft px-2 py-0.5 text-[11px] uppercase tracking-[0.14em] text-slate-deep">
            Featured
          </span>
        ) : null}
      </div>
      <h3 className="mt-2 font-display text-2xl leading-tight text-slate-deep group-hover:text-slate">
        {listing.name}
      </h3>
      <p className="mt-1 text-sm text-muted">{listing.metroHub.name} metro</p>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-soft">{listing.description}</p>
      <div className="mt-4">
        <ServicePills services={services} limit={4} />
      </div>
    </Link>
  );
}
