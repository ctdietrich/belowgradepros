"use client";

import { useActionState } from "react";
import { saveListing, type ActionState } from "@/app/actions";
import { SERVICES } from "@/lib/config";
import { listingServices } from "@/lib/listings";
import type { Listing, Metro } from "@prisma/client";

const field =
  "mt-1 w-full rounded-lg border border-slate/15 bg-white px-3 py-2 outline-none focus:border-amber";

export function ListingForm({
  listing,
  metros,
}: {
  listing?: Listing;
  metros: Metro[];
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveListing, null);
  const selected = new Set(listing ? listingServices(listing) : []);

  return (
    <form action={action} className="space-y-5">
      {listing ? <input type="hidden" name="id" value={listing.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm">
          Name
          <input name="name" required defaultValue={listing?.name} className={field} />
        </label>
        <label className="text-sm">
          Slug
          <input name="slug" defaultValue={listing?.slug} className={field} />
        </label>
        <label className="text-sm">
          City
          <input name="city" required defaultValue={listing?.city} className={field} />
        </label>
        <label className="text-sm">
          State
          <input name="state" required defaultValue={listing?.state} className={field} />
        </label>
        <label className="text-sm">
          Metro label
          <input name="metro" defaultValue={listing?.metro} className={field} />
        </label>
        <label className="text-sm">
          Metro hub
          <select name="metroSlug" required defaultValue={listing?.metroSlug} className={field}>
            <option value="">Select a hub</option>
            {metros.map((metro) => (
              <option key={metro.id} value={metro.slug}>
                {metro.name} ({metro.stateCode})
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Phone
          <input name="phone" defaultValue={listing?.phone ?? ""} className={field} />
        </label>
        <label className="text-sm">
          Website
          <input name="website" defaultValue={listing?.website ?? ""} className={field} />
        </label>
        <label className="text-sm">
          Email
          <input name="email" type="email" defaultValue={listing?.email ?? ""} className={field} />
        </label>
        <label className="text-sm">
          Source URL
          <input name="sourceUrl" defaultValue={listing?.sourceUrl ?? ""} className={field} />
        </label>
        <label className="text-sm md:col-span-2">
          Description
          <textarea
            name="description"
            required
            rows={6}
            defaultValue={listing?.description}
            className={field}
          />
        </label>
      </div>
      <fieldset>
        <legend className="text-xs uppercase tracking-[0.16em] text-muted">Services</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {SERVICES.map((service) => (
            <label key={service.key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="services"
                value={service.key}
                defaultChecked={selected.has(service.key)}
              />
              {service.label}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex flex-wrap gap-5 text-sm">
        <label className="flex items-center gap-2">
          <input name="published" type="checkbox" defaultChecked={listing?.published ?? false} />
          Published
        </label>
        <label className="flex items-center gap-2">
          <input name="featured" type="checkbox" defaultChecked={listing?.featured ?? false} />
          Featured
        </label>
        <label className="flex items-center gap-2">
          <input name="claimable" type="checkbox" defaultChecked={listing?.claimable ?? true} />
          Claimable
        </label>
      </div>
      {state?.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-slate-deep px-5 py-2.5 text-sm text-paper hover:bg-slate disabled:opacity-60"
      >
        {pending ? "Saving…" : listing ? "Save listing" : "Create listing"}
      </button>
    </form>
  );
}
