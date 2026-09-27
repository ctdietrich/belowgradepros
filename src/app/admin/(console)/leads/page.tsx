import Link from "next/link";
import { listingPath } from "@/lib/config";
import { formatLeadTimestampChicago, quoteServiceLabel } from "@/lib/quote-lead";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = { title: "Leads" };

function cell(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "—";
}

export default async function AdminLeadsPage() {
  const leads = await prisma.lead.findMany({
    include: { listing: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-5 py-10">
      <header>
        <h1 className="font-display text-4xl text-slate">Quote requests</h1>
        <p className="mt-2 text-sm text-muted">
          {leads.length} leads, newest first. Times are America/Chicago. Each row belongs to one
          listing.
        </p>
      </header>
      <div className="overflow-x-auto rounded-2xl border border-slate/10 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-concrete-light text-xs uppercase tracking-[0.12em] text-muted">
            <tr>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Listing</th>
              <th className="px-4 py-3">Contractor</th>
              <th className="px-4 py-3">Homeowner</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">ZIP</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Message</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-t border-slate/10 align-top">
                <td className="whitespace-nowrap px-4 py-3 text-xs text-muted">
                  {formatLeadTimestampChicago(lead.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <Link href={listingPath(lead.listingSlug)} className="text-amber-deep hover:underline">
                    {lead.listingSlug}
                  </Link>
                </td>
                <td className="px-4 py-3">{lead.listing.name}</td>
                <td className="px-4 py-3">{lead.name}</td>
                <td className="px-4 py-3">{cell(lead.phone)}</td>
                <td className="px-4 py-3">{cell(lead.email)}</td>
                <td className="px-4 py-3">{lead.zip}</td>
                <td className="px-4 py-3">{quoteServiceLabel(lead.service)}</td>
                <td className="max-w-sm px-4 py-3 leading-6 text-slate-soft">{lead.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!leads.length ? <p className="px-4 py-6 text-sm text-muted">No quote requests.</p> : null}
      </div>
    </main>
  );
}
