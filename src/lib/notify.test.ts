import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { formatLeadAlert, leadAlertProvider, notifyLead } from "./notify";

const ENV_KEYS = [
  "RESEND_API_KEY",
  "SMTP_USER",
  "SMTP_PASS",
  "SMTP_HOST",
  "SMTP_PORT",
  "LEAD_ALERT_TO",
  "LEAD_ALERT_FROM",
  "NEXT_PUBLIC_SITE_URL",
  "VERCEL_URL",
  "VERCEL_ENV",
] as const;

const previous = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));

function clearProviders() {
  delete process.env.RESEND_API_KEY;
  delete process.env.SMTP_USER;
  delete process.env.SMTP_PASS;
  delete process.env.SMTP_HOST;
  delete process.env.SMTP_PORT;
}

afterEach(() => {
  for (const key of ENV_KEYS) {
    const value = previous[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

test("formatLeadAlert includes the lead fields and an absolute admin link", () => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://belowgradepros.com";
  delete process.env.VERCEL_URL;
  delete process.env.VERCEL_ENV;

  const { subject, text } = formatLeadAlert({
    action: "submitClaim",
    listingName: "Acme Foundation",
    listingSlug: "acme-foundation",
    contactName: "Jane Owner",
    email: "jane@acme.example",
    website: "https://acme.example",
    note: "I own this company.",
    founding: true,
    adminPath: "/admin/listings/listing_1",
    timestamp: new Date("2026-09-26T22:00:00.000Z"),
  });

  assert.equal(subject, "[BelowGradePros] submitClaim — Acme Foundation");
  assert.match(text, /^Action: submitClaim$/m);
  assert.match(text, /^Listing name: Acme Foundation$/m);
  assert.match(text, /^Listing slug: acme-foundation$/m);
  assert.match(text, /^Contact name: Jane Owner$/m);
  assert.match(text, /^Email: jane@acme.example$/m);
  assert.match(text, /^Website: https:\/\/acme\.example$/m);
  assert.match(text, /^Note: I own this company\.$/m);
  assert.match(text, /^Founding: yes$/m);
  assert.match(text, /^Timestamp: 2026-09-26T22:00:00.000Z$/m);
  assert.match(text, /^Admin: https:\/\/belowgradepros\.com\/admin\/listings\/listing_1$/m);
});

test("formatLeadAlert omits the admin line when no admin path exists", () => {
  const { text } = formatLeadAlert({
    action: "submitListing",
    contactName: "Sam",
    email: "sam@example.com",
    founding: false,
    timestamp: new Date("2026-09-26T22:00:00.000Z"),
  });

  assert.match(text, /^Listing name: —$/m);
  assert.match(text, /^Listing slug: —$/m);
  assert.match(text, /^Website: —$/m);
  assert.match(text, /^Founding: no$/m);
  assert.equal(text.includes("Admin:"), false);
});

test("no provider is a no-op and does not throw", async () => {
  clearProviders();
  assert.equal(leadAlertProvider(), "none");

  const warnings: string[] = [];
  const original = console.warn;
  console.warn = (...args: unknown[]) => {
    warnings.push(args.map(String).join(" "));
  };

  try {
    await notifyLead({
      action: "startFoundingCheckout",
      email: "owner@example.com",
      contactName: "Owner",
      founding: true,
      timestamp: new Date("2026-09-26T22:00:00.000Z"),
    });
  } finally {
    console.warn = original;
  }

  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /No email provider configured/);
  assert.match(warnings[0], /Notification skipped/);
});

test("Resend is preferred over SMTP when both are configured", () => {
  process.env.RESEND_API_KEY = "re_test";
  process.env.SMTP_USER = "hello@belowgradepros.com";
  process.env.SMTP_PASS = "secret";
  assert.equal(leadAlertProvider(), "resend");
  delete process.env.RESEND_API_KEY;
  assert.equal(leadAlertProvider(), "smtp");
});
