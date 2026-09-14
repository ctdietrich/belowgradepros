import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "bgp_admin";

export function adminToken() {
  const secret = process.env.ADMIN_PASSWORD ?? "";
  return createHmac("sha256", secret).update("belowgradepros-admin").digest("hex");
}

export function isValidAdminPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected || !password) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function isValidAdminToken(token: string | undefined) {
  if (!token || !process.env.ADMIN_PASSWORD) return false;
  const expected = Buffer.from(adminToken());
  const received = Buffer.from(token);
  if (expected.length !== received.length) return false;
  return timingSafeEqual(expected, received);
}

export async function isAdmin() {
  const jar = await cookies();
  return isValidAdminToken(jar.get(ADMIN_COOKIE)?.value);
}

export async function requireAdmin() {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }
}
