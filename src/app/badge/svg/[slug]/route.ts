import { notFound } from "next/navigation";
import { foundingBadgeSvg, isBadgeSlug } from "@/lib/badge";
import { getFoundingBadgeListing } from "@/lib/listings";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  if (!isBadgeSlug(slug)) notFound();
  const listing = await getFoundingBadgeListing(slug);
  if (!listing) notFound();

  return new Response(foundingBadgeSvg(listing.name), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
