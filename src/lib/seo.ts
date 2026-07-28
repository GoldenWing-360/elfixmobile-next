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
  // Sonntag geschlossen (User-Ansage 2026-07-28) — nur Mo–Sa.
  hours: [
    { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "09:00", closes: "19:00" },
  ],
  foundingDate: "2019",
  credentials: [
    "Apple Authorized Service Provider",
    "Samsung zertifizierter Reparaturpartner",
  ],
  reparaturbonPartner: true,
  social: {
    facebook: "https://www.facebook.com/ElFixMobile",
    instagram: "https://www.instagram.com/elfixmobile/",
    tiktok: "https://www.tiktok.com/@elfixmobile/",
  },
  priceRange: "$$",
} as const;

const LOCAL_BUSINESS_DESCRIPTION: Record<string, string> = {
  de: "Express Smartphone, Tablet und Notebook Reparatur in Wien 1220 Aspern. Original Refurbished Displays, 12 Monate Garantie, Mo–Sa geöffnet.",
  en: "Express smartphone, tablet and laptop repair in Vienna 1220 Aspern. Original-refurbished displays, 12 months warranty, open Mon–Sat.",
  ru: "Экспресс-ремонт смартфонов, планшетов и ноутбуков в Вене 1220 Aspern. Оригинал-восстановленные дисплеи, 12 месяцев гарантии, работаем Пн–Сб.",
  tr: "Viyana 1220 Aspern'de ekspres akıllı telefon, tablet ve dizüstü tamiri. Orijinal yenilenmiş ekranlar, 12 ay garanti, Pzt–Cmt açık.",
};

export function localBusinessJsonLd(locale: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [websiteNode(locale), localBusinessNode(locale)],
  };
}

function websiteNode(locale: string) {
  return {
    "@type": "WebSite",
    "@id": `${SITE.url}/#website`,
    url: SITE.url,
    name: SITE.name,
    inLanguage: locale,
    publisher: { "@id": `${SITE.url}/#localbusiness` },
  };
}

function localBusinessNode(locale: string) {
  return {
    "@type": "MobilePhoneStore",
    "@id": `${SITE.url}/#localbusiness`,
    name: SITE.legalName,
    alternateName: SITE.name,
    description:
      LOCAL_BUSINESS_DESCRIPTION[locale] ?? LOCAL_BUSINESS_DESCRIPTION.de,
    url: SITE.url,
    telephone: SITE.phone,
    email: SITE.email,
    image: `${SITE.url}/opengraph-image`,
    logo: `${SITE.url}/logo-512.png`,
    inLanguage: locale,
    priceRange: SITE.priceRange,
    foundingDate: SITE.foundingDate,
    hasCredential: SITE.credentials.map((c) => ({
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "certification",
      name: c,
    })),
    knowsAbout: [
      "Smartphone Reparatur",
      "iPhone Display Tausch",
      "Akku Tausch",
      "Wasserschaden Behandlung",
      "Datenrettung",
      "Tablet Reparatur",
      "MacBook Reparatur",
    ],
    hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${SITE.name} ${SITE.address.street} ${SITE.address.postalCode} ${SITE.address.locality}`,
    )}`,
    paymentAccepted: "Cash, Credit Card, Debit Card",
    currenciesAccepted: "EUR",
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
  // x-default is the language-neutral URL Google falls back to when no
  // Accept-Language matches a locale entry. We point it at the bare
  // root path (no locale prefix) — next.config.ts redirects "/" to
  // "/de", so Google still lands on the default locale, but the
  // hreflang signal is correctly neutral instead of preferring de.
  entries["x-default"] = `${SITE.url}${cleanPath || "/"}`;
  return entries;
}
