"use client";

import { useActionState, type ReactNode } from "react";
import type { ActionState } from "@/app/actions";

type Action = (state: ActionState, formData: FormData) => Promise<ActionState>;

export function ActionForm({
  action,
  children,
  className,
  submitLabel = "Submit",
  variant = "slate",
}: {
  action: Action;
  children: ReactNode;
  className?: string;
  submitLabel?: string;
  variant?: "slate" | "concrete";
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const buttonClass =
    variant === "concrete"
      ? "rounded-full bg-concrete px-5 py-2.5 text-sm text-slate-deep hover:bg-white disabled:opacity-60"
      : "rounded-full bg-slate px-5 py-2.5 text-sm text-page hover:bg-slate-soft disabled:opacity-60";

  return (
    <form action={formAction} className={className}>
      {children}
      {state?.error ? (
        <p className={variant === "concrete" ? "text-sm text-concrete" : "text-sm text-red-700"}>
          {state.error}
        </p>
      ) : null}
      {state?.ok && state.message ? (
        <p className={variant === "concrete" ? "text-sm text-amber" : "text-sm text-amber-deep"}>
          {state.message}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Sending…" : submitLabel}
      </button>
    </form>
  );
}
