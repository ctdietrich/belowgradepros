import type { City } from "@prisma/client";
import { absoluteUrl, cityPath, listingPath, serviceLabel, site, typeLabel } from "./config";
import { asStringArray, listingServices, type ListingWithCities } from "./listings";

export function listingJsonLd(listing: ListingWithCities) {
  const cities = listing.cities.map((item) => item.city.name);
  const photos = asStringArray(listing.photos);
  const services = listingServices(listing).map(serviceLabel);

  return {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: listing.name,
    description: listing.tagline ?? listing.bio,
    url: absoluteUrl(listingPath(listing.slug)),
    email: listing.contactEmail,
    image: photos,
    telephone: listing.phone ?? undefined,
    sameAs: listing.website ? [listing.website] : undefined,
    areaServed: cities,
    additionalType: typeLabel(listing.type),
    identifier: listing.slug,
    knowsAbout: services,
    address: listing.homeCity
      ? {
          "@type": "PostalAddress",
          addressLocality: listing.homeCity,
          addressRegion: listing.homeState ?? undefined,
          addressCountry: "US",
        }
      : undefined,
  };
}

export function cityJsonLd(city: City) {
  return {
    "@context": "https://schema.org",
    "@type": "City",
    name: city.name,
    description: city.description,
    url: absoluteUrl(cityPath(city.slug)),
    image: city.heroImage ?? undefined,
    containedInPlace: {
      "@type": "AdministrativeArea",
      name: `${city.region}, ${city.state}`,
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    description: site.description,
    slogan: site.brandTagline,
  };
}
