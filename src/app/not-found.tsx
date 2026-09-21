import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-24 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-amber-deep">404</p>
      <h1 className="mt-3 font-display text-5xl text-slate">Page not found</h1>
      <p className="mt-4 text-slate-soft">That URL is not in the directory.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
        <Link href="/" className="text-amber-deep hover:underline">
          Home
        </Link>
        <Link href="/cities" className="text-amber-deep hover:underline">
          Cities
        </Link>
        <Link href="/contractors" className="text-amber-deep hover:underline">
          Contractors
        </Link>
      </div>
    </main>
  );
}
