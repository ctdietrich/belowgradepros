export function PageHero({
  kicker,
  title,
  lede,
}: {
  kicker?: string;
  title: string;
  lede?: string;
}) {
  return (
    <section className="bg-slate text-page">
      <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
        {kicker ? (
          <p className="text-xs uppercase tracking-[0.22em] text-amber">{kicker}</p>
        ) : null}
        <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight md:text-6xl">
          {title}
        </h1>
        {lede ? <p className="mt-5 max-w-2xl text-base leading-7 text-concrete/80">{lede}</p> : null}
      </div>
    </section>
  );
}
