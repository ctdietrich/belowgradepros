import { site } from "@/lib/config";

type BrandLockupProps = {
  tone?: "light" | "dark";
  size?: "header" | "footer";
  showTagline?: boolean;
};

function Wordmark({
  compact,
  onDark,
  onPaper,
}: {
  compact: boolean;
  onDark: boolean;
  onPaper?: boolean;
}) {
  const base = compact ? "text-lg leading-none md:text-xl" : "text-2xl leading-none md:text-3xl";
  const grade = onPaper || !onDark ? "text-slate-deep" : "text-page";
  const pros = "text-amber";

  return (
    <span className={`font-display tracking-tight ${base}`}>
      <span className={`font-semibold ${grade}`}>BelowGrade</span>
      <span className={`font-extrabold ${pros}`}>Pros</span>
    </span>
  );
}

export function BrandLockup({
  tone = "light",
  size = "header",
  showTagline = true,
}: BrandLockupProps) {
  const onDark = tone === "dark";
  const compact = size === "header";

  const tagline = showTagline ? (
    <span
      className={`mt-1 text-[0.58rem] uppercase tracking-[0.16em] [word-spacing:0.24em] md:tracking-[0.2em] ${
        onDark ? "text-concrete/70" : "text-amber-deep"
      }`}
    >
      {site.brandTagline}
    </span>
  ) : null;

  if (compact) {
    return (
      <span className="flex min-w-0 flex-col">
        <Wordmark compact onDark={onDark} />
        {tagline}
      </span>
    );
  }

  return (
    <span className="flex min-w-0 flex-col">
      {onDark ? (
        <span className="inline-flex w-fit rounded-2xl bg-page px-3 py-2 md:px-4 md:py-3">
          <Wordmark compact={false} onDark onPaper />
        </span>
      ) : (
        <Wordmark compact={false} onDark={false} />
      )}
      {tagline}
    </span>
  );
}
