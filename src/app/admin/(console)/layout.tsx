import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logoutAdmin } from "@/app/actions";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminConsoleLayout({
  children,
}: {
  children: ReactNode;
}) {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }

  return (
    <div className="border-b border-concrete bg-concrete-light">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm">
        <div className="flex gap-4">
          <Link href="/admin" className="font-medium text-slate">
            Admin desk
          </Link>
          <Link href="/admin/listings/new" className="text-slate-soft hover:text-slate">
            New listing
          </Link>
          <Link href="/admin/import" className="text-slate-soft hover:text-slate">
            Import CSV
          </Link>
        </div>
        <form action={logoutAdmin}>
          <button type="submit" className="text-muted hover:text-slate">
            Sign out
          </button>
        </form>
      </div>
      {children}
    </div>
  );
}
