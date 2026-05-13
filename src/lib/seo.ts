import { routing } from "@/i18n/routing";

export const SITE = {
  name: "EL Fix Mobile",
  legalName: "EL Fix Mobile e.U.",
  // Inhaberin and registration ids ported from the live WP impressum
  // (https://www.elfixmobile.at/impressum/) so the JSON-LD + the rendered
  // impressum page agree. Source of truth lives here, not in MDX.
  owner: "Natalja Rahimova",
  vatId: "ATU74938026",
  commercialRegister: "Handelsgericht Wien",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://elfixmobile.at",
  phone: "+436606071414",
  phoneDisplay: "+43 660 6071414",
  email: "elfixmobile@gmx.at",
  // Separate Datenschutz contact per the WP /datenschutzerklaerung/ page.
  privacyEmail: "info@elfixmobile.at",
  address: {
    street: "Maria-Tusch-Strasse 17/1",
    locality: "Wien",
    region: "Wien",
    postalCode: "1220",
    country: "AT",
  },
  geo: {
    latitude: 48.2249349,
    longitude: 16.5015548,
  },
  rating: {
    value: 4.4,
    count: 294,
    best: 5,
  },
  hours: [
    { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "09:00", closes: "19:00" },
    { days: ["Sunday"], opens: "09:00", closes: "18:00" },
  ],
  social: {
    facebook: "https://www.facebook.com/ElFixMobile",
    instagram: "https://www.instagram.com/elfixmobile/",
    tiktok: "https://www.tiktok.com/@elfixmobile/",
  },
  priceRange: "$$",
} as const;

export function localBusinessJsonLd(locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "MobilePhoneStore",
    "@id": `${SITE.url}/#localbusiness`,
    name: SITE.legalName,
    alternateName: SITE.name,
    description:
      "Express Smartphone, Tablet und Notebook Reparatur in Wien 1220 Aspern. Original Refurbished Displays, 12 Monate Garantie, 7 Tage offen.",
    url: SITE.url,
    telephone: SITE.phone,
    email: SITE.email,
    image: `${SITE.url}/og.png`,
    logo: `${SITE.url}/logo.svg`,
    inLanguage: locale,
    priceRange: SITE.priceRange,
    vatID: SITE.vatId,
    founder: {
      "@type": "Person",
      name: SITE.owner,
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.locality,
      addressRegion: SITE.address.region,
      postalCode: SITE.address.postalCode,
      addressCountry: SITE.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SITE.geo.latitude,
      longitude: SITE.geo.longitude,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: SITE.rating.value,
      reviewCount: SITE.rating.count,
      bestRating: SITE.rating.best,
    },
    openingHoursSpecification: SITE.hours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    })),
    sameAs: Object.values(SITE.social),
    areaServed: [
      { "@type": "City", name: "Wien" },
      { "@type": "AdministrativeArea", name: "Niederösterreich" },
    ],
  };
}

export function alternateLanguagesFor(path: string): Record<string, string> {
  const trimmed = path.startsWith("/") ? path : `/${path}`;
  const cleanPath = trimmed === "/" ? "" : trimmed;
  const entries: Record<string, string> = {};
  for (const locale of routing.locales) {
    entries[locale] = `${SITE.url}/${locale}${cleanPath}`;
  }
  entries["x-default"] = `${SITE.url}/${routing.defaultLocale}${cleanPath}`;
  return entries;
}
