import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

function secretMatches(provided: string, expected: string) {
  const left = Buffer.from(provided);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function POST(request: Request) {
  const expected = process.env.REVALIDATE_SECRET?.trim() ?? "";
  const provided = request.headers.get("revalidate_secret") ?? "";
  if (!expected || !secretMatches(provided, expected)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const raw = body && typeof body === "object" && "paths" in body ? body.paths : null;
  const paths = Array.isArray(raw)
    ? [...new Set(raw.filter((path): path is string => typeof path === "string" && path.startsWith("/")))]
    : [];
  if (!paths.length) {
    return NextResponse.json({ ok: false, error: "paths required" }, { status: 400 });
  }

  try {
    for (const path of paths) revalidatePath(path);
  } catch (error) {
    console.error(
      "[revalidate] failed:",
      error instanceof Error ? error.name : "unknown",
    );
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true, revalidated: paths });
}
