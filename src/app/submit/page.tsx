import type { Metadata } from "next";
import { submitListing } from "@/app/actions";
import { ActionForm } from "@/components/FormStatus";
import { PageHero } from "@/components/PageHero";
import { site } from "@/lib/config";

export const metadata: Metadata = {
  title: "Submit a listing",
  description: "Propose a foundation or encapsulation contractor for the BelowGradePros directory.",
};

const field =
  "mt-1 w-full rounded-lg border border-slate/15 bg-white px-3 py-2 outline-none focus:border-amber";

export default function SubmitPage() {
  return (
    <main>
      <PageHero
        kicker="Supply side"
        title="Submit a listing"
        lede="Contractors can propose a profile. We review for fit — editorial, not paid placement — before anything is published."
      />
      <section className="mx-auto max-w-2xl px-5 py-12">
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
              placeholder="Houston, Dallas–Fort Worth…"
              className={field}
            />
          </label>
          <fieldset>
            <legend className="text-sm">Services</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {site.services.map((service) => (
                <label key={service.key} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="services" value={service.key} />
                  {service.label}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="block text-sm">
            Bio
            <textarea name="bio" required rows={6} className={field} />
          </label>
        </ActionForm>
      </section>
    </main>
  );
}
