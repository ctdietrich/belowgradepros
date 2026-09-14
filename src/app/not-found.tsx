import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-24 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-amber">404</p>
      <h1 className="mt-3 font-display text-5xl text-slate-deep">Not in the directory.</h1>
      <p className="mt-4 text-slate-soft">That page is not published here.</p>
      <Link href="/" className="mt-8 inline-block text-sm text-amber hover:underline">
        Return home
      </Link>
    </main>
  );
}
