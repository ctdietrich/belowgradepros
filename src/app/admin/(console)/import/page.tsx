import { ImportForm } from "@/components/admin/ImportForm";

export const metadata = { title: "Import listings" };

export default function AdminImportPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="font-display text-4xl text-slate-deep">Import listings</h1>
      <p className="mt-2 text-sm text-muted">
        Upload a CSV to upsert contractor listings. Same mapping as{" "}
        <code className="text-slate-deep">npm run import:listings</code> — no need to copy{" "}
        <code className="text-slate-deep">DATABASE_URL</code> off Vercel. This page is behind the{" "}
        <code className="text-slate-deep">ADMIN_PASSWORD</code> session.
      </p>
      <p className="mt-2 text-xs text-muted">
        Status values <code className="text-slate-deep">candidate</code> and{" "}
        <code className="text-slate-deep">ready</code> publish immediately. Do not run{" "}
        <code className="text-slate-deep">npm run seed</code> against production after an import.
      </p>
      <div className="mt-8">
        <ImportForm />
      </div>
    </main>
  );
}
