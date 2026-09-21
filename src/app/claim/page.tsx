import type { Metadata } from "next";
import { submitClaim } from "@/app/actions";
import { ActionForm } from "@/components/FormStatus";
import { FoundingCta } from "@/components/FoundingCta";
import { PageHero } from "@/components/PageHero";
import { site } from "@/lib/config";
import { getClaimableListings, resolveClaimableListing } from "@/lib/listings";
import { foundingPriceLabel } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Claim a listing",
  description:
    "Claim your BelowGradePros contractor profile. Some listings were compiled from public sources so homeowners can find specialists — we transfer them to the company they describe.",
  alternates: { canonical: "/claim" },
};

const field =
  "mt-1 w-full rounded-lg border border-slate/15 bg-white px-3 py-2 outline-none focus:border-amber";

export default async function ClaimPage({
  searchParams,
}: {
  searchParams: Promise<{ listing?: string }>;
}) {
  const { listing: selected } = await searchParams;
  const listings = await getClaimableListings();
  // Growth/ops deep links use slug: /claim?listing={slug}. Cuid id still works.
  const preselected = await resolveClaimableListing(selected);

  return (
    <main>
      <PageHero
        kicker="Contractors"
        title="Claim your listing"
        lede="Some profiles were compiled from public materials so homeowners can find specialists in their metro. If this is your company, tell us who you are and we will transfer the listing to you."
      />
      <section className="mx-auto max-w-2xl space-y-8 px-5 py-12">
        <p className="text-sm leading-7 text-slate-soft">
          We review claim requests before changing a public profile. Questions in the meantime:{" "}
          <a className="text-amber-deep hover:underline" href={`mailto:${site.email}`}>
            {site.email}
          </a>
          .
        </p>
        <ActionForm action={submitClaim} className="space-y-5" submitLabel="Request claim">
          <label className="block text-sm">
            Listing
            <select name="listingId" required defaultValue={preselected?.id ?? ""} className={field}>
              <option value="">Select a claimable profile</option>
              {listings.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          {listings.length === 0 ? (
            <p className="text-sm text-slate-soft">
              There are no open claims right now.{" "}
              <a href="/submit" className="text-amber-deep hover:underline">
                Submit a new listing
              </a>{" "}
              instead.
            </p>
          ) : null}
          <label className="block text-sm">
            Your name
            <input name="name" required className={field} />
          </label>
          <label className="block text-sm">
            Email
            <input name="email" type="email" required className={field} />
          </label>
          <label className="block text-sm">
            How are you connected to this company?
            <textarea
              name="message"
              required
              rows={5}
              className={field}
              placeholder="Owner, manager, or authorized representative — a sentence is enough."
            />
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input name="founding" type="checkbox" className="mt-1" />
            <span>Also interested in founding / featured placement ({foundingPriceLabel()})</span>
          </label>
        </ActionForm>
        <FoundingCta source="claim" />
      </section>
    </main>
  );
}
