import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { site } from "@/lib/config";

export const metadata: Metadata = {
  title: "Contact",
  description: `Reach BelowGradePros at ${site.email} for claims, listing questions, and founding placement.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main>
      <PageHero
        kicker="Contact"
        title="We read every note."
        lede="Claims, new listings, founding placement, and directory questions all go to the same inbox."
      />
      <section className="mx-auto max-w-2xl space-y-8 px-5 py-14">
        <div className="rounded-2xl border border-slate/10 bg-white p-8 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-deep">Email</p>
          <a
            href={`mailto:${site.email}`}
            className="mt-3 block font-display text-3xl text-slate hover:text-amber-deep"
          >
            {site.email}
          </a>
          <p className="mt-4 text-sm leading-7 text-slate-soft">
            For a sourced profile, use the{" "}
            <Link href="/claim" className="text-amber-deep hover:underline">
              claim form
            </Link>
            . To propose a company that is not listed yet,{" "}
            <Link href="/submit" className="text-amber-deep hover:underline">
              submit a listing
            </Link>
            .
          </p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          <li className="rounded-2xl bg-concrete-light p-5">
            <Link href="/claim" className="font-display text-xl text-slate hover:text-amber-deep">
              Claim a listing
            </Link>
            <p className="mt-2 text-sm leading-6 text-slate-soft">
              Transfer a public profile to your company.
            </p>
          </li>
          <li className="rounded-2xl bg-concrete-light p-5">
            <Link href="/founding" className="font-display text-xl text-slate hover:text-amber-deep">
              Founding placement
            </Link>
            <p className="mt-2 text-sm leading-6 text-slate-soft">
              Featured on city hubs — we follow up to activate it.
            </p>
          </li>
        </ul>
      </section>
    </main>
  );
}
