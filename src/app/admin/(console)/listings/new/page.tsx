import Link from "next/link";
import { ListingForm } from "@/components/admin/ListingForm";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "New listing" };

export default async function NewListingPage() {
  const cities = await prisma.city.findMany({ orderBy: [{ state: "asc" }, { name: "asc" }] });

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="font-display text-4xl text-slate">New listing</h1>
      <p className="mt-2 text-sm text-muted">
        Drafts stay off the public directory until published. Curated CSV imports use{" "}
        <Link href="/admin/import" className="text-amber-deep hover:underline">
          /admin/import
        </Link>{" "}
        or <code className="text-slate">npm run import:listings</code>. Ops{" "}
        <code className="text-slate">candidate</code> rows stay draft until you publish them here.
      </p>
      <div className="mt-8">
        <ListingForm cities={cities} />
      </div>
    </main>
  );
}
