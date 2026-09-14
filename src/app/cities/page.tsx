import type { Metadata } from "next";
import { CityCard } from "@/components/CityCard";
import { PageHero } from "@/components/PageHero";
import { buildCityIndex, catalogCardChips, catalogCardCta, catalogCardHref } from "@/lib/hubs";
import { getCities } from "@/lib/listings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "City hubs",
  description:
    "Foundation repair and encapsulation contractors across Wave 1 metros — homepage strip plus catalog hubs including Memphis, Birmingham, Oklahoma City, Greenville SC, Raleigh, Tulsa, Charleston SC, and Florida encapsulation desks.",
};

export default async function CitiesPage() {
  const cities = buildCityIndex(await getCities());

  return (
    <main>
      <PageHero
        kicker="Wave 1"
        title="City hubs"
        lede="National directory, metros first. The homepage strip is Tampa, Houston, Atlanta, Charlotte, Jacksonville, Orlando, Nashville, then Dallas–Fort Worth. Later Wave 1 adds — including Florida encapsulation desks — stay on this index. Filter each hub with ?service=foundation-repair or ?service=encapsulation."
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
              count={city.count}
              href={catalogCardHref(city.slug)}
              cta={catalogCardCta(city.slug)}
              chips={catalogCardChips(city.slug)}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
