import type { Metadata } from "next";
import { CityCard } from "@/components/CityCard";
import { PageHero } from "@/components/PageHero";
import { getCities } from "@/lib/listings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "City hubs",
  description:
    "Foundation repair and encapsulation contractors across Wave 1 metros: Houston, Dallas–Fort Worth, Atlanta, Tampa, Chicago, Charlotte, Austin, and St. Louis.",
};

export default async function CitiesPage() {
  const cities = await getCities();

  return (
    <main>
      <PageHero
        kicker="Wave 1"
        title="City hubs"
        lede="National directory, metros first. Publish order: Houston, Dallas–Fort Worth, Atlanta, Tampa, Chicago — then Charlotte, Austin, and St. Louis. Filter each hub with ?service=foundation-repair or ?service=encapsulation."
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
