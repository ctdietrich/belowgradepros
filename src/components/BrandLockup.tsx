import { site } from "@/lib/config";

type BrandLockupProps = {
  tone?: "light" | "dark";
  size?: "header" | "footer";
  showTagline?: boolean;
};

function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <rect x="3" y="4" width="26" height="10" rx="1.5" fill="#C9B8A6" />
      <rect x="6" y="16" width="20" height="12" rx="1" fill="#1E293B" />
      <rect x="6" y="26" width="20" height="3" fill="#D97706" />
    </svg>
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

  const wordmark = (
    <span
      className={`font-display font-semibold tracking-tight ${
        compact ? "text-lg leading-none md:text-xl" : "text-2xl md:text-3xl"
      } ${onDark && !compact ? "text-slate-deep" : onDark ? "text-page" : "text-slate-deep"}`}
    >
      BelowGradePros
    </span>
  );

  if (compact) {
    return (
      <span className="flex items-center gap-2.5">
        <Mark className="h-9 w-9 shrink-0 md:h-10 md:w-10" />
        <span className="flex min-w-0 flex-col">
          {wordmark}
          {tagline}
        </span>
      </span>
    );
  }

  return (
    <span className="flex min-w-0 flex-col">
      {onDark ? (
        <span className="inline-flex w-fit items-center gap-3 rounded-2xl bg-page px-3 py-2 md:px-4 md:py-3">
          <Mark className="h-10 w-10" />
          {wordmark}
        </span>
      ) : (
        <span className="inline-flex items-center gap-3">
          <Mark className="h-12 w-12" />
          {wordmark}
        </span>
      )}
      {tagline}
    </span>
  );
}
