import type { Metadata } from "next";
import { submitClaim } from "@/app/actions";
import { ActionForm } from "@/components/FormStatus";
import { FoundingCta } from "@/components/FoundingCta";
import { PageHero } from "@/components/PageHero";
import { getClaimableListings } from "@/lib/listings";
import { foundingPriceLabel } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Claim a listing",
  description: "Claim an existing BelowGradePros contractor profile.",
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

  return (
    <main>
      <PageHero
        kicker="Operators"
        title="Claim a listing"
        lede="Some profiles were sourced from public materials and remain claimable. Tell us who you are and we will move the listing under your desk."
      />
      <section className="mx-auto max-w-2xl space-y-8 px-5 py-12">
        <ActionForm action={submitClaim} className="space-y-5" submitLabel="Request claim">
          <label className="block text-sm">
            Listing
            <select name="listingId" required defaultValue={selected ?? ""} className={field}>
              <option value="">Select a claimable profile</option>
              {listings.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Your name
            <input name="name" required className={field} />
          </label>
          <label className="block text-sm">
            Email
            <input name="email" type="email" required className={field} />
          </label>
          <label className="block text-sm">
            How are you connected?
            <textarea name="message" required rows={5} className={field} />
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input name="founding" type="checkbox" className="mt-1" />
            <span>Also interested in a founding / featured upgrade ({foundingPriceLabel()})</span>
          </label>
        </ActionForm>
        <FoundingCta source="claim" />
      </section>
    </main>
  );
}
