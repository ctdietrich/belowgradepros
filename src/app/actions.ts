"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { ADMIN_COOKIE, adminToken, isValidAdminPassword, requireAdmin } from "@/lib/admin";
import { normalizeServiceKey } from "@/lib/config";
import {
  importListingsFromCsv,
  isCsvUpload,
  MAX_IMPORT_CSV_BYTES,
  summarizeImport,
} from "@/lib/import-listings";
import { prisma } from "@/lib/prisma";

export type ActionState = { ok: boolean; error?: string; message?: string } | null;

export type ImportActionState = {
  ok: boolean;
  error?: string;
  message?: string;
  created?: number;
  updated?: number;
  skipped?: number;
  errors?: string[];
  warnings?: string[];
  dryRun?: boolean;
} | null;

function readString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function selectedServices(formData: FormData) {
  const fromChecks = formData
    .getAll("services")
    .map(String)
    .map((value) => normalizeServiceKey(value))
    .filter((value): value is NonNullable<typeof value> => Boolean(value));
  if (fromChecks.length) return [...new Set(fromChecks)];

  return readString(formData, "servicesText")
    .split(",")
    .map((item) => normalizeServiceKey(item))
    .filter((value): value is NonNullable<typeof value> => Boolean(value));
}

export async function submitListing(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = readString(formData, "name");
  const email = readString(formData, "email").toLowerCase();
  const website = readString(formData, "website");
  const phone = readString(formData, "phone");
  const city = readString(formData, "city");
  const state = readString(formData, "state");
  const metro = readString(formData, "metro") || city;
  const description = readString(formData, "description");
  const services = selectedServices(formData);

  if (name.length < 2 || description.length < 20) {
    return { ok: false, error: "Add a company name and a short description (at least 20 characters)." };
  }
  if (!city || !state) {
    return { ok: false, error: "City and state are required." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Please enter a valid contact email." };
  }
  if (!services.length) {
    return { ok: false, error: "Choose at least one service." };
  }

  await prisma.submission.create({
    data: {
      name,
      email,
      website: website || null,
      phone: phone || null,
      city,
      state,
      metro,
      services: services.join(","),
      description,
    },
  });

  revalidatePath("/admin");
  return {
    ok: true,
    message:
      "Received. We review submissions before they appear in the directory. Founding listings are $199–299/mo when we open paid placement — this form is inquiry-only for now.",
  };
}

export async function submitClaim(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const listingId = readString(formData, "listingId");
  const name = readString(formData, "name");
  const email = readString(formData, "email").toLowerCase();
  const message = readString(formData, "message");

  if (!listingId || name.length < 2 || message.length < 10) {
    return { ok: false, error: "Choose a listing and tell us how you are connected." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Please enter a valid email." };
  }

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing || !listing.claimable) {
    return { ok: false, error: "That listing is not available to claim." };
  }

  await prisma.claimRequest.create({
    data: { listingId, name, email, message },
  });

  revalidatePath("/admin");
  return {
    ok: true,
    message: "Claim received. We will write back before anything is marked claimed.",
  };
}

export async function loginAdmin(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const password = readString(formData, "password");
  const next = readString(formData, "next") || "/admin";

  if (!isValidAdminPassword(password)) {
    return { ok: false, error: "That password is not correct." };
  }

  const jar = await cookies();
  jar.set(ADMIN_COOKIE, adminToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect(next.startsWith("/") ? next : "/admin");
}

export async function logoutAdmin() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

function listingPayload(formData: FormData) {
  const services = selectedServices(formData);
  return {
    name: readString(formData, "name"),
    slug: readString(formData, "slug"),
    city: readString(formData, "city"),
    state: readString(formData, "state"),
    metro: readString(formData, "metro"),
    metroSlug: readString(formData, "metroSlug"),
    phone: readString(formData, "phone") || null,
    website: readString(formData, "website") || null,
    email: readString(formData, "email") || null,
    services,
    description: readString(formData, "description"),
    sourceUrl: readString(formData, "sourceUrl") || null,
    published: formData.get("published") === "on",
    featured: formData.get("featured") === "on",
    claimable: formData.get("claimable") === "on",
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export async function importListingsCsv(
  _prev: ImportActionState,
  formData: FormData,
): Promise<ImportActionState> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose a CSV file." };
  }
  if (file.size > MAX_IMPORT_CSV_BYTES) {
    return { ok: false, error: "CSV is too large (2 MB max)." };
  }
  if (!isCsvUpload(file)) {
    return { ok: false, error: "Upload a .csv (or .tsv) file." };
  }

  const dryRun = formData.get("dryRun") === "on";
  const insertOnly = formData.get("insertOnly") === "on";

  let csvText: string;
  try {
    csvText = await file.text();
  } catch {
    return { ok: false, error: "Could not read that file." };
  }

  try {
    const result = await importListingsFromCsv(csvText, {
      dryRun,
      insertOnly,
      createMetros: true,
      prisma,
    });

    if (!dryRun) {
      revalidatePath("/");
      revalidatePath("/search");
      revalidatePath("/metros");
      revalidatePath("/admin");
    }

    return {
      ok: true,
      message: summarizeImport(result, dryRun),
      created: result.created.length,
      updated: result.updated.length,
      skipped: result.skipped.length,
      errors: result.errors,
      warnings: result.warnings,
      dryRun,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Import failed.",
    };
  }
}

export async function saveListing(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = readString(formData, "id");
  const payload = listingPayload(formData);

  if (payload.name.length < 2 || payload.description.length < 10) {
    return { ok: false, error: "Name and description are required." };
  }
  if (!payload.city || !payload.state || !payload.metroSlug) {
    return { ok: false, error: "City, state, and metro hub are required." };
  }
  if (!payload.services.length) {
    return { ok: false, error: "Choose at least one service." };
  }

  const metro = await prisma.metro.findUnique({ where: { slug: payload.metroSlug } });
  if (!metro) return { ok: false, error: "Unknown metro hub." };

  const slug = payload.slug || slugify(payload.name);
  if (!slug) return { ok: false, error: "A URL slug is required." };

  const data = {
    name: payload.name,
    slug,
    city: payload.city,
    state: payload.state,
    metro: payload.metro || metro.name,
    metroSlug: metro.slug,
    phone: payload.phone,
    website: payload.website,
    email: payload.email,
    services: payload.services,
    description: payload.description,
    sourceUrl: payload.sourceUrl,
    published: payload.published,
    featured: payload.featured,
    claimable: payload.claimable,
  };

  try {
    if (id) {
      await prisma.listing.update({ where: { id }, data });
    } else {
      await prisma.listing.create({ data });
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, error: "That slug is already in use." };
    }
    return { ok: false, error: "Could not save the listing." };
  }

  revalidatePath("/");
  revalidatePath("/search");
  revalidatePath("/metros");
  revalidatePath("/admin");
  revalidatePath(`/l/${slug}`);
  redirect("/admin");
}

export async function deleteListing(formData: FormData) {
  await requireAdmin();
  const id = readString(formData, "id");
  if (!id) return;
  await prisma.listing.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateInboxStatus(formData: FormData) {
  await requireAdmin();
  const kind = readString(formData, "kind");
  const id = readString(formData, "id");
  const status = readString(formData, "status") || "reviewed";

  if (kind === "submission") {
    await prisma.submission.update({ where: { id }, data: { status } });
  }
  if (kind === "claim") {
    await prisma.claimRequest.update({ where: { id }, data: { status } });
  }
  revalidatePath("/admin");
}
