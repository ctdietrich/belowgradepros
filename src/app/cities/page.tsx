import type { Metadata } from "next";
import { CityCard } from "@/components/CityCard";
import { PageHero } from "@/components/PageHero";
import { buildCityIndex, catalogCardChips, catalogCardCta, catalogCardHref } from "@/lib/hubs";
import { getCities } from "@/lib/listings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cities we cover",
  description:
    "Browse BelowGradePros metro hubs for foundation repair and crawl-space / basement encapsulation contractors — Tampa, Houston, Atlanta, Charlotte, Jacksonville, Orlando, Nashville, Dallas–Fort Worth, and more.",
  alternates: { canonical: "/cities" },
};

export default async function CitiesPage() {
  const cities = buildCityIndex(await getCities());

  return (
    <main>
      <PageHero
        kicker="Coverage"
        title="Cities we cover"
        lede="National directory, metros first. Filter any hub by foundation repair or encapsulation. Additional markets — including Florida encapsulation coverage — stay on this index."
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
