import { loginAdmin } from "@/app/actions";
import { ActionForm } from "@/components/FormStatus";
import { isAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";

export const metadata = { title: "Admin login" };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (await isAdmin()) redirect("/admin");
  const { next } = await searchParams;

  return (
    <main className="mx-auto max-w-md px-5 py-20">
      <p className="text-xs uppercase tracking-[0.2em] text-amber-deep">Desk</p>
      <h1 className="mt-2 font-display text-4xl text-slate">Admin</h1>
      <p className="mt-3 text-sm text-muted">
        Protected by <code>ADMIN_PASSWORD</code>.
      </p>
      <ActionForm action={loginAdmin} className="mt-8 space-y-4" submitLabel="Enter desk">
        <input type="hidden" name="next" value={next || "/admin"} />
        <label className="block text-sm">
          Password
          <input
            name="password"
            type="password"
            required
            className="mt-1 w-full rounded-lg border border-slate/15 bg-white px-3 py-2 outline-none focus:border-amber"
          />
        </label>
      </ActionForm>
    </main>
  );
}
