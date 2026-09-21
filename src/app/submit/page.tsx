import type { Metadata } from "next";
import Link from "next/link";
import { submitListing } from "@/app/actions";
import { ActionForm } from "@/components/FormStatus";
import { FoundingCta } from "@/components/FoundingCta";
import { PageHero } from "@/components/PageHero";
import { site } from "@/lib/config";
import { foundingPriceLabel } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Submit a listing",
  description: "Propose a foundation or encapsulation contractor for the BelowGradePros directory.",
  alternates: { canonical: "/submit" },
};

const field =
  "mt-1 w-full rounded-lg border border-slate/15 bg-white px-3 py-2 outline-none focus:border-amber";

export default function SubmitPage() {
  return (
    <main>
      <PageHero
        kicker="Contractors"
        title="Submit a listing"
        lede="Propose a profile for review. Listings are editorial — we publish for fit, not paid placement. Founding / featured is an optional upgrade."
      />
      <section className="mx-auto max-w-2xl space-y-8 px-5 py-12">
        <p className="text-sm leading-7 text-slate-soft">
          Already listed?{" "}
          <Link href="/claim" className="text-amber-deep hover:underline">
            Claim the existing profile
          </Link>{" "}
          instead. Questions:{" "}
          <a className="text-amber-deep hover:underline" href={`mailto:${site.email}`}>
            {site.email}
          </a>
          .
        </p>
        <ActionForm action={submitListing} className="space-y-5" submitLabel="Send for review">
          <input type="hidden" name="type" value="contractor" />
          <label className="block text-sm">
            Company name
            <input name="name" required className={field} />
          </label>
          <label className="block text-sm">
            Contact email
            <input name="email" type="email" required className={field} />
          </label>
          <label className="block text-sm">
            Website
            <input name="website" type="url" className={field} />
          </label>
          <label className="block text-sm">
            City hubs
            <input
              name="cities"
              placeholder="Houston, Dallas–Fort Worth, Atlanta…"
              className={field}
            />
          </label>
          <label className="block text-sm">
            Primary service
            <select name="primaryService" required defaultValue="foundation" className={field}>
              {site.primaryServices.map((service) => (
                <option key={service.key} value={service.key}>
                  {service.label}
                </option>
              ))}
            </select>
          </label>
          <fieldset>
            <legend className="text-sm">Additional badges</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {site.additionalServices.map((service) => (
                <label key={service.key} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="services" value={service.key} />
                  {service.label}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="flex items-start gap-2 text-sm">
            <input name="founding" type="checkbox" className="mt-1" />
            <span>I want a founding / featured listing ({foundingPriceLabel()})</span>
          </label>
          <label className="block text-sm">
            Bio
            <textarea name="bio" required rows={6} className={field} />
          </label>
        </ActionForm>
        <FoundingCta source="submit" />
      </section>
    </main>
  );
}
