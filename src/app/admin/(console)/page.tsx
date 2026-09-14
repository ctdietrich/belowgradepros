import Link from "next/link";
import { updateInboxStatus } from "@/app/actions";
import { listingPath, serviceLabel } from "@/lib/config";
import { listingServices } from "@/lib/listings";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const [listings, submissions, claims] = await Promise.all([
    prisma.listing.findMany({
      include: { metroHub: true },
      orderBy: [{ published: "desc" }, { name: "asc" }],
    }),
    prisma.submission.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.claimRequest.findMany({
      include: { listing: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <main className="mx-auto max-w-6xl space-y-14 px-5 py-10">
      <header>
        <h1 className="font-display text-4xl text-slate-deep">Directory desk</h1>
        <p className="mt-2 text-sm text-muted">
          {listings.length} listings · {submissions.length} submissions · {claims.length} claims
        </p>
        <p className="mt-2 text-xs text-muted">
          Bulk CSV:{" "}
          <Link href="/admin/import" className="text-amber hover:underline">
            /admin/import
          </Link>{" "}
          (same mapping as <code>npm run import:listings</code>).
        </p>
      </header>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-slate-deep">Listings</h2>
          <div className="flex gap-4 text-sm">
            <Link href="/admin/import" className="text-amber hover:underline">
              Import CSV
            </Link>
            <Link href="/admin/listings/new" className="text-amber hover:underline">
              New listing
            </Link>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate/10 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-paper-warm text-xs uppercase tracking-[0.12em] text-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Metro</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Services</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <tr key={listing.id} className="border-t border-slate/10">
                  <td className="px-4 py-3">
                    <Link href={listingPath(listing.slug)} className="font-medium text-slate-deep">
                      {listing.name}
                    </Link>
                    <div className="text-xs text-muted">
                      {listing.city}, {listing.state}
                    </div>
                  </td>
                  <td className="px-4 py-3">{listing.metroHub.name}</td>
                  <td className="px-4 py-3">
                    {listing.published ? "published" : "draft"}
                    {listing.featured ? " · featured" : ""}
                    {listing.claimable ? " · claimable" : ""}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {listingServices(listing).map(serviceLabel).join(" · ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/listings/${listing.id}`}
                      className="text-amber hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <Inbox
          title="Submissions"
          empty="No listing submissions."
          rows={submissions.map((item) => ({
            id: item.id,
            kind: "submission" as const,
            title: `${item.name} · ${item.city}, ${item.state}`,
            detail: item.email,
            status: item.status,
            body: item.description,
          }))}
        />
        <Inbox
          title="Claims"
          empty="No claim requests."
          rows={claims.map((item) => ({
            id: item.id,
            kind: "claim" as const,
            title: item.listing.name,
            detail: `${item.name} · ${item.email}`,
            status: item.status,
            body: item.message,
          }))}
        />
      </section>
    </main>
  );
}

function Inbox({
  title,
  empty,
  rows,
}: {
  title: string;
  empty: string;
  rows: {
    id: string;
    kind: "submission" | "claim";
    title: string;
    detail: string;
    status: string;
    body: string;
  }[];
}) {
  return (
    <div>
      <h2 className="font-display text-2xl text-slate-deep">{title}</h2>
      <ul className="mt-4 space-y-3">
        {rows.map((row) => (
          <li key={row.id} className="rounded-2xl border border-slate/10 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-slate-deep">{row.title}</p>
                <p className="text-xs text-muted">{row.detail}</p>
              </div>
              <span className="text-xs uppercase tracking-[0.14em] text-amber">{row.status}</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-soft">{row.body}</p>
            <form action={updateInboxStatus} className="mt-3">
              <input type="hidden" name="kind" value={row.kind} />
              <input type="hidden" name="id" value={row.id} />
              <input type="hidden" name="status" value="reviewed" />
              <button type="submit" className="text-sm text-amber hover:underline">
                Mark reviewed
              </button>
            </form>
          </li>
        ))}
        {!rows.length ? <li className="text-sm text-muted">{empty}</li> : null}
      </ul>
    </div>
  );
}
