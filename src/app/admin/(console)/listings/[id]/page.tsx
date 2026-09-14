import { notFound } from "next/navigation";
import { deleteListing } from "@/app/actions";
import { ListingForm } from "@/components/admin/ListingForm";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Edit listing" };

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [listing, metros] = await Promise.all([
    prisma.listing.findUnique({ where: { id } }),
    prisma.metro.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!listing) notFound();

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="font-display text-4xl text-slate-deep">Edit listing</h1>
      <p className="mt-2 text-sm text-muted">{listing.slug}</p>
      <div className="mt-8">
        <ListingForm listing={listing} metros={metros} />
      </div>
      <form action={deleteListing} className="mt-10 border-t border-slate/10 pt-6">
        <input type="hidden" name="id" value={listing.id} />
        <button type="submit" className="text-sm text-red-700 hover:underline">
          Delete listing
        </button>
      </form>
    </main>
  );
}
