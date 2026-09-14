import type { Metadata } from "next";
import { MetroCard } from "@/components/MetroCard";
import { PageHero } from "@/components/PageHero";
import { getMetros } from "@/lib/listings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "City hubs",
  description:
    "Foundation repair and encapsulation contractors by metro: Houston, Dallas–Fort Worth, Atlanta, Tampa Bay, and Chicago.",
};

export default async function MetrosPage() {
  const metros = await getMetros();

  return (
    <main>
      <PageHero
        kicker="Markets"
        title="City hubs"
        lede="The first metros are Houston, Dallas–Fort Worth, Atlanta, Tampa Bay, and Chicago. Each hub collects published contractors for that market — soil, humidity, and housing stock are not the same in every city."
      />
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {metros.map((metro) => (
            <MetroCard
              key={metro.id}
              slug={metro.slug}
              name={metro.name}
              state={`${metro.state} · ${metro.stateCode}`}
              description={metro.description}
              count={metro.listings.length}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
