import type { Metadata } from "next";
import { CityCard } from "@/components/CityCard";
import { PageHero } from "@/components/PageHero";
import { getCities } from "@/lib/listings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "City hubs",
  description:
    "Foundation repair and encapsulation contractors across Wave 1 metros, including Tampa, Houston, Atlanta, Charlotte, Jacksonville, Orlando, Nashville, and Dallas–Fort Worth.",
};

export default async function CitiesPage() {
  const cities = await getCities();

  return (
    <main>
      <PageHero
        kicker="Wave 1"
        title="City hubs"
        lede="National directory, metros first. The homepage strip is Tampa, Houston, Atlanta, Charlotte, Jacksonville, Orlando, Nashville, then Dallas–Fort Worth. Chicago, Austin, and St. Louis stay on this index. Filter each hub with ?service=foundation-repair or ?service=encapsulation."
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
