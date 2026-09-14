import { ImportForm } from "@/components/admin/ImportForm";

export const metadata = { title: "Import listings" };

export default function AdminImportPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="font-display text-4xl text-slate">Import listings</h1>
      <p className="mt-2 text-sm text-muted">
        Upload a hero CSV to upsert listings in this environment’s database. Same mapping as{" "}
        <code className="text-slate">npm run import:listings</code> — no need to copy{" "}
        <code className="text-slate">DATABASE_URL</code> off Vercel. This page is behind the{" "}
        <code className="text-slate">ADMIN_PASSWORD</code> session; there is no public import URL.
      </p>
      <p className="mt-2 text-xs text-muted">
        Only <code className="text-slate">publish</code> /{" "}
        <code className="text-slate">published</code> go live.{" "}
        <code className="text-slate">candidate</code>, <code className="text-slate">qa_pass</code>, and{" "}
        <code className="text-slate">ready</code> stay draft. Do not run{" "}
        <code className="text-slate">npm run seed</code> against production after an import.
      </p>
      <div className="mt-8">
        <ImportForm />
      </div>
    </main>
  );
}
