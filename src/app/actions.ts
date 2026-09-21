"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import {
  ADMIN_COOKIE,
  adminToken,
  isValidAdminPassword,
  requireAdmin,
} from "@/lib/admin";
import {
  normalizeAdditionalService,
  normalizePrimaryService,
  site,
  type AdditionalServiceKey,
} from "@/lib/config";
import { foundingPaymentLink } from "@/lib/stripe";
import {
  importListingsFromCsv,
  isCsvUpload,
  MAX_IMPORT_CSV_BYTES,
  summarizeImport,
} from "@/lib/import-listings";
import { normalizeListingStatus } from "@/lib/listing-status";
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

function parseList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseBadges(value: string) {
  const keys = parseList(value)
    .map((item) => normalizeAdditionalService(item))
    .filter((item): item is AdditionalServiceKey => Boolean(item));
  return [...new Set(keys)];
}

export async function submitListing(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const type = readString(formData, "type") || "contractor";
  const name = readString(formData, "name");
  const email = readString(formData, "email").toLowerCase();
  const website = readString(formData, "website");
  const cities = readString(formData, "cities");
  const primaryService = normalizePrimaryService(readString(formData, "primaryService")) ?? "foundation";
  const services = formData
    .getAll("services")
    .map(String)
    .map((key) => normalizeAdditionalService(key))
    .filter((key): key is AdditionalServiceKey => Boolean(key))
    .join(", ");
  const bio = readString(formData, "bio");
  const founding = formData.get("founding") === "on";

  if (type !== "contractor") {
    return { ok: false, error: "This directory lists contractors only." };
  }
  if (name.length < 2 || bio.length < 20) {
    return { ok: false, error: "Add a name and a short bio (at least 20 characters)." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Please enter a valid contact email." };
  }

  await prisma.submission.create({
    data: {
      type,
      name,
      email,
      website: website || null,
      cities,
      primaryService,
      services: services || readString(formData, "services"),
      bio,
      founding,
    },
  });

  revalidatePath("/admin");
  return {
    ok: true,
    message: founding
      ? `Received. We will review the listing and follow up from ${site.email} about featured placement.`
      : "Received. We review submissions before they appear in the directory.",
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

  const founding = formData.get("founding") === "on";

  await prisma.claimRequest.create({
    data: { listingId, name, email, message, founding },
  });

  revalidatePath("/admin");
  return {
    ok: true,
    message: founding
      ? `Claim received. We will write back from ${site.email} about the profile and featured placement.`
      : `Claim received. We will write back from ${site.email}.`,
  };
}

export async function startFoundingCheckout(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = readString(formData, "email").toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Please enter a valid email so we can follow up." };
  }

  const link = foundingPaymentLink();
  if (link) {
    redirect(link);
  }

  await prisma.submission.create({
    data: {
      type: "contractor",
      name: "Founding listing request",
      email,
      cities: "",
      primaryService: "foundation",
      services: "",
      bio: "Request for founding / featured placement from the founding page.",
      founding: true,
    },
  });
  revalidatePath("/admin");

  return {
    ok: true,
    message: `Thanks — we will follow up from ${site.email} to activate featured placement.`,
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
  const type = readString(formData, "type") || "contractor";
  const status = readString(formData, "status");
  const photos = parseList(readString(formData, "photos"));
  const servicesFromBoxes = formData
    .getAll("serviceKeys")
    .map(String)
    .map((item) => normalizeAdditionalService(item))
    .filter((item): item is AdditionalServiceKey => Boolean(item));
  const servicesFromText = parseBadges(readString(formData, "services"));
  const services = [...new Set([...servicesFromBoxes, ...servicesFromText])];
  const cityIds = formData.getAll("cityIds").map(String).filter(Boolean);

  return {
    type: type === "contractor" ? "contractor" : "contractor",
    status: normalizeListingStatus(status, "draft"),
    name: readString(formData, "name"),
    slug: readString(formData, "slug"),
    tagline: readString(formData, "tagline") || null,
    bio: readString(formData, "bio"),
    contactEmail: readString(formData, "contactEmail"),
    website: readString(formData, "website") || null,
    phone: readString(formData, "phone") || null,
    homeCity: readString(formData, "homeCity") || null,
    homeState: readString(formData, "homeState") || null,
    licenseId: readString(formData, "licenseId") || null,
    photos,
    primaryService: normalizePrimaryService(readString(formData, "primaryService")) ?? "foundation",
    services,
    sourceUrl: readString(formData, "sourceUrl") || null,
    featured: formData.get("featured") === "on",
    founding: formData.get("founding") === "on",
    verified: formData.get("verified") === "on",
    claimable: formData.get("claimable") === "on",
    cityIds,
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function revalidatePublic() {
  revalidatePath("/");
  revalidatePath("/contractors");
  revalidatePath("/cities");
  revalidatePath("/services");
  revalidatePath("/admin");
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
      createCities: true,
      prisma,
    });

    if (!dryRun) {
      revalidatePublic();
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

  if (payload.name.length < 2 || payload.bio.length < 10) {
    return { ok: false, error: "Name and bio are required." };
  }

  const slug = payload.slug || slugify(payload.name);
  if (!slug) return { ok: false, error: "A URL slug is required." };

  const data = {
    type: payload.type,
    status: payload.status,
    name: payload.name,
    slug,
    tagline: payload.tagline,
    bio: payload.bio,
    contactEmail: payload.contactEmail,
    website: payload.website,
    phone: payload.phone,
    homeCity: payload.homeCity,
    homeState: payload.homeState,
    licenseId: payload.licenseId,
    photos: payload.photos,
    primaryService: payload.primaryService,
    services: payload.services,
    sourceUrl: payload.sourceUrl,
    featured: payload.featured,
    founding: payload.founding,
    verified: payload.verified,
    claimable: payload.claimable,
  };

  try {
    if (id) {
      await prisma.listing.update({
        where: { id },
        data: {
          ...data,
          cities: {
            deleteMany: {},
            create: payload.cityIds.map((cityId) => ({ cityId })),
          },
        },
      });
    } else {
      await prisma.listing.create({
        data: {
          ...data,
          cities: {
            create: payload.cityIds.map((cityId) => ({ cityId })),
          },
        },
      });
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, error: "That slug is already in use." };
    }
    return { ok: false, error: "Could not save the listing." };
  }

  revalidatePublic();
  revalidatePath(`/l/${slug}`);
  redirect("/admin");
}

export async function deleteListing(formData: FormData) {
  await requireAdmin();
  const id = readString(formData, "id");
  if (!id) return;
  await prisma.listing.delete({ where: { id } });
  revalidatePublic();
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
