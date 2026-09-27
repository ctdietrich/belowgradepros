import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CostGuide } from "@/components/CostGuide";
import { COST_METRO_SLUGS } from "@/lib/cost-paths";
import { getCostPage } from "@/lib/cost-pages";

export const dynamicParams = false;

export function generateStaticParams() {
  return COST_METRO_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getCostPage("encapsulation", slug);
  if (!page) return { title: "Crawl space encapsulation cost" };
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: page.path },
  };
}

export default async function EncapsulationCostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getCostPage("encapsulation", slug);
  if (!page) notFound();
  return <CostGuide page={page} />;
}
