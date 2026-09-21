export function EmptyListings({
  title = "No listings match",
  message = "Try another filter, service, or metro. Profiles are added as contractors join the directory.",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate/10 bg-white px-6 py-12 text-center">
      <p className="font-display text-2xl text-slate">{title}</p>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-soft">{message}</p>
    </div>
  );
}
