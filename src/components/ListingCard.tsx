import Image from "next/image";
import Link from "next/link";
import { listingPath, serviceLabel, typeLabel } from "@/lib/config";
import { listingCover, listingServices, type ListingWithCities } from "@/lib/listings";

export function ListingCard({ listing }: { listing: ListingWithCities }) {
  const cover = listingCover(listing);
  const cities = listing.cities.map((item) => item.city.name).join(" · ");
  const services = listingServices(listing).slice(0, 4);

  return (
    <Link
      href={listingPath(listing.slug)}
      className="group overflow-hidden rounded-2xl border border-slate/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[16/10] bg-slate-soft">
        {cover ? (
          <Image
            src={cover}
            alt={listing.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="(min-width: 1024px) 33vw, 100vw"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-slate/50 to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-page/95 px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-slate">
            {typeLabel(listing.type)}
          </span>
          {listing.featured ? (
            <span className="rounded-full bg-amber px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-deep">
              Featured
            </span>
          ) : null}
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-2xl leading-tight text-slate">{listing.name}</h3>
          {listing.verified ? (
            <span className="shrink-0 text-xs text-amber-deep">Verified</span>
          ) : null}
        </div>
        <p className="mt-1 text-sm text-muted">
          {cities || [listing.homeCity, listing.homeState].filter(Boolean).join(", ")}
        </p>
        {listing.tagline ? (
          <p className="mt-3 text-sm leading-6 text-slate-soft">{listing.tagline}</p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {services.map((item) => (
            <span
              key={item}
              className="rounded-full bg-concrete-light px-2.5 py-1 text-xs text-slate-soft"
            >
              {serviceLabel(item)}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
