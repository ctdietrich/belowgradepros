import type { Metadata } from "next";
import { submitClaim } from "@/app/actions";
import { ActionForm } from "@/components/FormStatus";
import { PageHero } from "@/components/PageHero";
import { getClaimableListings } from "@/lib/listings";

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
        lede="Some profiles were sourced from public materials and remain claimable. Tell us who you are. Founding listings will be $199–299/mo when paid placement opens — claiming is free inquiry for now."
      />
      <section className="mx-auto max-w-2xl px-5 py-12">
        <ActionForm action={submitClaim} className="space-y-5" submitLabel="Request claim">
          <label className="block text-sm">
            Listing
            <select name="listingId" required defaultValue={selected ?? ""} className={field}>
              <option value="">Select a claimable profile</option>
              {listings.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} — {item.city}, {item.state}
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
        </ActionForm>
      </section>
    </main>
  );
}
