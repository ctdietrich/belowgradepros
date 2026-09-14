import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-24 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-amber-deep">404</p>
      <h1 className="mt-3 font-display text-5xl text-slate">Below the map.</h1>
      <p className="mt-4 text-slate-soft">That page is not in the directory.</p>
      <Link href="/" className="mt-8 inline-block text-sm text-amber-deep hover:underline">
        Return home
      </Link>
    </main>
  );
}
