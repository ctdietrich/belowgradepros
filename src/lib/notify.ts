import { absoluteUrl, site } from "./config";

/** Bound outbound email so a slow provider cannot hang the isolate. */
export const LEAD_ALERT_TIMEOUT_MS = 5_000;

export const DEFAULT_LEAD_ALERT_FROM = "BelowGradePros <hello@belowgradepros.com>";

export const LEAD_ACTIONS = ["submitClaim", "submitListing", "startFoundingCheckout"] as const;
export type LeadAction = (typeof LEAD_ACTIONS)[number];

export type LeadAlertInput = {
  action: LeadAction;
  listingName?: string | null;
  listingSlug?: string | null;
  contactName?: string | null;
  email?: string | null;
  website?: string | null;
  note?: string | null;
  founding?: boolean;
  /** Site path (`/admin`) or an absolute URL. Omitted from the body when absent. */
  adminPath?: string | null;
  timestamp?: Date;
};

const EMPTY = "—";

function field(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : EMPTY;
}

export function leadAlertTo() {
  return process.env.LEAD_ALERT_TO?.trim() || site.email;
}

export function leadAlertFrom() {
  return process.env.LEAD_ALERT_FROM?.trim() || DEFAULT_LEAD_ALERT_FROM;
}

export function leadAlertProvider(): "resend" | "smtp" | "none" {
  if (process.env.RESEND_API_KEY?.trim()) return "resend";
  if (process.env.SMTP_USER?.trim() && process.env.SMTP_PASS?.trim()) return "smtp";
  return "none";
}

function adminLink(path?: string | null) {
  const value = path?.trim();
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/") && !value.startsWith("//")) return absoluteUrl(value);
  return undefined;
}

export function formatLeadAlert(input: LeadAlertInput): { subject: string; text: string } {
  const timestamp = (input.timestamp ?? new Date()).toISOString();
  const lines = [
    `Action: ${input.action}`,
    `Listing name: ${field(input.listingName)}`,
    `Listing slug: ${field(input.listingSlug)}`,
    `Contact name: ${field(input.contactName)}`,
    `Email: ${field(input.email)}`,
    `Website: ${field(input.website)}`,
    `Note: ${field(input.note)}`,
    `Founding: ${input.founding ? "yes" : "no"}`,
    `Timestamp: ${timestamp}`,
  ];
  const admin = adminLink(input.adminPath);
  if (admin) lines.push(`Admin: ${admin}`);

  const who = input.listingName?.trim() || input.contactName?.trim() || input.email?.trim() || "new lead";
  return {
    subject: `[BelowGradePros] ${input.action} — ${who}`,
    text: lines.join("\n"),
  };
}

function smtpPort() {
  const raw = process.env.SMTP_PORT?.trim();
  if (!raw) return 465;
  const port = Number(raw);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) return 465;
  return port;
}

async function sendViaResend(message: { subject: string; text: string }, to: string) {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) throw new Error("RESEND_API_KEY missing");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: leadAlertFrom(),
      to: [to],
      subject: message.subject,
      text: message.text,
    }),
    signal: AbortSignal.timeout(LEAD_ALERT_TIMEOUT_MS),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Resend responded ${response.status}${body ? `: ${body.slice(0, 180)}` : ""}`);
  }
}

async function sendViaSmtp(message: { subject: string; text: string }, to: string) {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  if (!user || !pass) throw new Error("SMTP credentials missing");

  const nodemailer = await import("nodemailer");
  const port = smtpPort();
  const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: LEAD_ALERT_TIMEOUT_MS,
    greetingTimeout: LEAD_ALERT_TIMEOUT_MS,
    socketTimeout: LEAD_ALERT_TIMEOUT_MS,
  });

  try {
    await transporter.sendMail({
      from: user,
      to,
      subject: message.subject,
      text: message.text,
    });
  } finally {
    transporter.close();
  }
}

/** Sends when a provider is configured. Returns "noop" (and warns) when none is. */
export async function deliverLeadAlert(input: LeadAlertInput): Promise<"resend" | "smtp" | "noop"> {
  const provider = leadAlertProvider();
  if (provider === "none") {
    console.warn(
      "[lead-alert] No email provider configured (set RESEND_API_KEY, or SMTP_USER and SMTP_PASS). Notification skipped.",
    );
    return "noop";
  }

  const message = formatLeadAlert(input);
  const to = leadAlertTo();
  if (provider === "resend") {
    await sendViaResend(message, to);
    return "resend";
  }
  await sendViaSmtp(message, to);
  return "smtp";
}

/**
 * Never throws. Callers should schedule this after the database write.
 * Completes or gives up within {@link LEAD_ALERT_TIMEOUT_MS}.
 */
export async function notifyLead(input: LeadAlertInput): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      deliverLeadAlert(input),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error(`lead alert timed out after ${LEAD_ALERT_TIMEOUT_MS}ms`));
        }, LEAD_ALERT_TIMEOUT_MS);
      }),
    ]);
  } catch (error) {
    console.error(
      "[lead-alert] notification failed:",
      error instanceof Error ? error.message : error,
    );
  } finally {
    if (timer) clearTimeout(timer);
  }
}
