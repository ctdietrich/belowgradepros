import type { Metadata } from "next";
import { CityCard } from "@/components/CityCard";
import { PageHero } from "@/components/PageHero";
import { getCities } from "@/lib/listings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "City hubs",
  description:
    "Foundation repair and encapsulation contractors across Texas and Florida metro hubs.",
};

export default async function CitiesPage() {
  const cities = await getCities();

  return (
    <main>
      <PageHero
        kicker="Metros"
        title="City hubs"
        lede="National directory, metros first. Houston, Dallas–Fort Worth, Austin, San Antonio, Tampa Bay, Orlando, Jacksonville, and Miami–Fort Lauderdale. Each page collects the contractors we would actually send you to."
      />
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {cities.map((city) => (
            <CityCard
              key={city.id}
              slug={city.slug}
              name={city.name}
              state={city.state}
              region={city.region}
              heroImage={city.heroImage}
              count={city.listings.length}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
