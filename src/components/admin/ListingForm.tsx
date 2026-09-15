"use client";

import { useActionState } from "react";
import { saveListing, type ActionState } from "@/app/actions";
import { site } from "@/lib/config";
import { asStringArray } from "@/lib/listings";
import type { City, Listing } from "@prisma/client";

const field =
  "mt-1 w-full rounded-lg border border-slate/15 bg-white px-3 py-2 outline-none focus:border-amber";

type ListingWithIds = Listing & { cities: { cityId: string }[] };

export function ListingForm({
  listing,
  cities,
}: {
  listing?: ListingWithIds;
  cities: City[];
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveListing, null);
  const selected = new Set(listing?.cities.map((item) => item.cityId) ?? []);
  const selectedServices = new Set(asStringArray(listing?.services));

  return (
    <form action={action} className="space-y-5">
      {listing ? <input type="hidden" name="id" value={listing.id} /> : null}
      <input type="hidden" name="type" value="contractor" />
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
          Status
          <select name="status" defaultValue={listing?.status ?? "draft"} className={field}>
            <option value="draft">draft — hidden from the directory</option>
            <option value="published">published</option>
          </select>
        </label>
        <label className="text-sm">
          Primary service
          <select
            name="primaryService"
            defaultValue={listing?.primaryService ?? "foundation"}
            className={field}
          >
            {site.primaryServices.map((service) => (
              <option key={service.key} value={service.key}>
                {service.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          License ID
          <input name="licenseId" defaultValue={listing?.licenseId ?? ""} className={field} />
        </label>
        <label className="text-sm md:col-span-2">
          Tagline
          <input name="tagline" defaultValue={listing?.tagline ?? ""} className={field} />
        </label>
        <label className="text-sm md:col-span-2">
          Bio
          <textarea name="bio" required rows={6} defaultValue={listing?.bio} className={field} />
        </label>
        <label className="text-sm">
          Contact email
          <input
            name="contactEmail"
            type="email"
            defaultValue={listing?.contactEmail ?? ""}
            className={field}
          />
        </label>
        <label className="text-sm">
          Website
          <input name="website" defaultValue={listing?.website ?? ""} className={field} />
        </label>
        <label className="text-sm">
          Phone
          <input name="phone" defaultValue={listing?.phone ?? ""} className={field} />
        </label>
        <label className="text-sm">
          Source URL
          <input name="sourceUrl" defaultValue={listing?.sourceUrl ?? ""} className={field} />
        </label>
        <label className="text-sm">
          Home city
          <input name="homeCity" defaultValue={listing?.homeCity ?? ""} className={field} />
        </label>
        <label className="text-sm">
          Home state
          <input name="homeState" defaultValue={listing?.homeState ?? ""} className={field} />
        </label>
        <label className="text-sm md:col-span-2">
          Photos (comma-separated URLs)
          <textarea
            name="photos"
            rows={3}
            defaultValue={asStringArray(listing?.photos).join(", ")}
            className={field}
          />
        </label>
      </div>
      <fieldset>
        <legend className="text-sm">Additional badges</legend>
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          {site.additionalServices.map((service) => (
            <label key={service.key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="serviceKeys"
                value={service.key}
                defaultChecked={selectedServices.has(service.key)}
              />
              {service.label}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="text-sm">City hubs</legend>
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          {cities.map((city) => (
            <label key={city.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="cityIds"
                value={city.id}
                defaultChecked={selected.has(city.id)}
              />
              {city.name}, {city.state}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex flex-wrap gap-5 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="featured" defaultChecked={listing?.featured} />
          Featured
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="founding" defaultChecked={listing?.founding} />
          Founding
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="verified" defaultChecked={listing?.verified} />
          Verified
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="claimable" defaultChecked={listing?.claimable ?? true} />
          Claimable
        </label>
      </div>
      {state?.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-slate px-5 py-2.5 text-sm text-page disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save listing"}
      </button>
    </form>
  );
}
