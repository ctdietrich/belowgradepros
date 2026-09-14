"use client";

import { useActionState, type ReactNode } from "react";
import type { ActionState } from "@/app/actions";

type Action = (state: ActionState, formData: FormData) => Promise<ActionState>;

export function ActionForm({
  action,
  children,
  className,
  submitLabel = "Submit",
}: {
  action: Action;
  children: ReactNode;
  className?: string;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className={className}>
      {children}
      {state?.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
      {state?.ok && state.message ? <p className="text-sm text-slate-soft">{state.message}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-slate-deep px-5 py-2.5 text-sm text-paper hover:bg-slate disabled:opacity-60"
      >
        {pending ? "Sending…" : submitLabel}
      </button>
    </form>
  );
}
