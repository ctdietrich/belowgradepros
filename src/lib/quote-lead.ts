export const QUOTE_SERVICES = [
  { key: "foundation", label: "Foundation repair" },
  { key: "encapsulation", label: "Encapsulation" },
  { key: "waterproofing", label: "Waterproofing" },
  { key: "other", label: "Other" },
] as const;

export type QuoteServiceKey = (typeof QUOTE_SERVICES)[number]["key"];

/** Max quote requests for one listing from the same phone or email in the window. */
export const QUOTE_RATE_LIMIT = 3;
export const QUOTE_RATE_WINDOW_MS = 15 * 60 * 1000;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ZIP = /^\d{5}(?:-\d{4})?$/;

export type QuoteLeadInput = {
  name: string;
  email: string;
  phone: string;
  zip: string;
  service: string;
  message: string;
  honeypot: string;
};

export type ValidQuoteLead = {
  name: string;
  email: string | null;
  phone: string | null;
  zip: string;
  service: QuoteServiceKey;
  message: string;
};

export type QuoteLeadValidation =
  | { ok: true; ignored: true }
  | { ok: true; ignored: false; value: ValidQuoteLead }
  | { ok: false; error: string };

export function quoteServiceLabel(key: string) {
  return QUOTE_SERVICES.find((item) => item.key === key)?.label ?? key;
}

export function isQuoteService(value: string): value is QuoteServiceKey {
  return QUOTE_SERVICES.some((item) => item.key === value);
}

/** Honeypot hits look successful and must not be stored. */
export function validateQuoteLead(input: QuoteLeadInput): QuoteLeadValidation {
  if (input.honeypot.trim()) return { ok: true, ignored: true };

  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const phone = input.phone.trim();
  const phoneDigits = phone.replace(/\D/g, "");
  const zip = input.zip.trim();
  const service = input.service.trim();
  const message = input.message.trim();

  if (name.length < 2 || name.length > 120) return { ok: false, error: "Please enter your name." };
  if (!email && !phone) {
    return { ok: false, error: "Enter a phone number or an email so the contractor can reply." };
  }
  if (email && (email.length > 200 || !EMAIL.test(email))) {
    return { ok: false, error: "Please enter a valid email." };
  }
  if (phone && (phone.length > 40 || phoneDigits.length < 7)) {
    return { ok: false, error: "Please enter a valid phone number." };
  }
  if (!ZIP.test(zip)) return { ok: false, error: "Enter a 5-digit ZIP code." };
  if (!isQuoteService(service)) return { ok: false, error: "Choose the kind of work." };
  if (message.length < 10 || message.length > 2000) {
    return { ok: false, error: "Add a short description of the job." };
  }

  return {
    ok: true,
    ignored: false,
    value: {
      name,
      email: email || null,
      phone: phone || null,
      zip,
      service,
      message,
    },
  };
}

export function quoteSubmissionRateLimited(recentCount: number) {
  return recentCount >= QUOTE_RATE_LIMIT;
}

const chicagoTimestamp = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Chicago",
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZoneName: "short",
});

/** Admin lead table clock. January is CST; daylight time is CDT. */
export function formatLeadTimestampChicago(date: Date) {
  return chicagoTimestamp.format(date);
}

/**
 * Persist the quote, then email only when a provider is configured.
 * A missing provider skips notify. A notify throw is logged and swallowed.
 */
export async function saveQuoteThenNotify<T>(options: {
  save: () => Promise<T>;
  provider: "resend" | "smtp" | "none";
  notify: () => Promise<unknown>;
  onNotifyError?: (error: unknown) => void;
}): Promise<T> {
  const saved = await options.save();
  if (options.provider === "none") return saved;
  try {
    await options.notify();
  } catch (error) {
    if (options.onNotifyError) {
      options.onNotifyError(error);
    } else {
      console.error(
        "[quote] lead saved; notification failed:",
        error instanceof Error ? error.message : error,
      );
    }
  }
  return saved;
}
