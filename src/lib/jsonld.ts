import type { Metro } from "@prisma/client";
import { absoluteUrl, listingPath, metroPath, serviceLabel, site } from "./config";
import { listingServices, type ListingWithMetro } from "./listings";

export function listingJsonLd(listing: ListingWithMetro) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: listing.name,
    description: listing.description,
    url: absoluteUrl(listingPath(listing.slug)),
    email: listing.email ?? undefined,
    telephone: listing.phone ?? undefined,
    sameAs: listing.website ? [listing.website] : undefined,
    areaServed: [listing.city, listing.metro, listing.state],
    address: {
      "@type": "PostalAddress",
      addressLocality: listing.city,
      addressRegion: listing.state,
      addressCountry: "US",
    },
    knowsAbout: listingServices(listing).map(serviceLabel),
    identifier: listing.slug,
  };
}

export function metroJsonLd(metro: Metro) {
  return {
    "@context": "https://schema.org",
    "@type": "Place",
    name: metro.name,
    description: metro.description,
    url: absoluteUrl(metroPath(metro.slug)),
    containedInPlace: {
      "@type": "AdministrativeArea",
      name: `${metro.state}, United States`,
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
    slogan: site.tagline,
  };
}
