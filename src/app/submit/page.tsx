import type { Metadata } from "next";
import { submitListing } from "@/app/actions";
import { ActionForm } from "@/components/FormStatus";
import { PageHero } from "@/components/PageHero";
import { PricingCta } from "@/components/PricingCta";
import { SERVICES } from "@/lib/config";

export const metadata: Metadata = {
  title: "Submit a listing",
  description:
    "Propose a foundation repair or encapsulation company for the BelowGradePros directory.",
};

const field =
  "mt-1 w-full rounded-lg border border-slate/15 bg-white px-3 py-2 outline-none focus:border-amber";

export default function SubmitPage() {
  return (
    <main>
      <PageHero
        kicker="Contractors"
        title="Submit a listing"
        lede="Tell us who you are and where you work. We review submissions before they appear. Founding placement will be $199–299/mo — this form is inquiry-only until checkout ships."
      />
      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[2fr_1fr]">
        <ActionForm action={submitListing} className="space-y-5" submitLabel="Send for review">
          <label className="block text-sm">
            Company name
            <input name="name" required className={field} />
          </label>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block text-sm">
              Contact email
              <input name="email" type="email" required className={field} />
            </label>
            <label className="block text-sm">
              Phone
              <input name="phone" className={field} />
            </label>
          </div>
          <label className="block text-sm">
            Website
            <input name="website" type="url" className={field} />
          </label>
          <div className="grid gap-5 md:grid-cols-3">
            <label className="block text-sm">
              City
              <input name="city" required className={field} />
            </label>
            <label className="block text-sm">
              State
              <input name="state" required placeholder="TX" className={field} />
            </label>
            <label className="block text-sm">
              Metro
              <input name="metro" placeholder="Houston" className={field} />
            </label>
          </div>
          <fieldset>
            <legend className="text-sm">Services</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {SERVICES.map((service) => (
                <label key={service.key} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="services" value={service.key} />
                  {service.label}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="block text-sm">
            Description
            <textarea name="description" required rows={6} className={field} />
          </label>
        </ActionForm>
        <PricingCta compact />
      </section>
    </main>
  );
}
