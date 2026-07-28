import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { SERVICES, getService } from "@/data/services";
import { DISTRICTS, getDistrict } from "@/data/districts";
import { routing } from "@/i18n/routing";
import { SITE, alternateLanguagesFor } from "@/lib/seo";
import { ServiceHero } from "@/components/service/ServiceHero";
import { ServiceBody } from "@/components/service/ServiceBody";
import { DistrictView } from "@/components/district/DistrictView";
import { FinalCTA } from "@/components/sections/FinalCTA";

type Params = { locale: string; service: string };

export function generateStaticParams() {
  // Two registries share this top-level dynamic segment because Next.js
  // only allows one [param] folder per directory: SERVICES emits the
  // repair-type landings (display-reparatur-wien, …) and DISTRICTS emits
  // the geo-landings (handy-reparatur-aspern-seestadt, …). Static
  // segments under [locale] (reparatur, preisrechner, …) win over this
  // dynamic segment because Next.js prefers static routes.
  const out: Params[] = [];
  for (const locale of routing.locales) {
    for (const s of SERVICES) out.push({ locale, service: s.slug });
    for (const d of DISTRICTS) out.push({ locale, service: d.slug });
  }
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, service: slug } = await params;
  const service = getService(slug);
  const district = service ? null : getDistrict(slug);
  if (!service && !district) return {};

  const ns = service
    ? `services_page.${service.key}`
    : `geo_page.${district!.key}`;
  const t = await getTranslations({ locale, namespace: ns });
  const title = t("meta_title");
  const description = t("meta_description");
  const canonicalSlug = service?.slug ?? district!.slug;

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/${canonicalSlug}`,
      languages: alternateLanguagesFor(`/${canonicalSlug}`),
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: `${SITE.url}/${locale}/${canonicalSlug}`,
      siteName: SITE.name,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

async function buildJsonLd(
  service: ReturnType<typeof getService>,
  locale: string,
  title: string,
) {
  if (!service) return null;
  const url = `${SITE.url}/${locale}/${service.slug}`;
  const offers = service.priceRange
    ? {
        "@type": "AggregateOffer",
        priceCurrency: "EUR",
        lowPrice: service.priceRange.from,
        highPrice: service.priceRange.to,
      }
    : undefined;
  // ServiceBody renders 4 FAQ items (q_duration, q_warranty, q_data,
  // q_pickup) keyed under services_page.<service.key>.q_<key>.{q,a}.
  // Mirror them as FAQPage JSON-LD for rich-result eligibility.
  const t = await getTranslations({
    locale,
    namespace: `services_page.${service.key}`,
  });
  const faqKeys = ["q_duration", "q_warranty", "q_data", "q_pickup"];
  const faqEntities = faqKeys.map((k) => ({
    "@type": "Question",
    name: t(`${k}.q`),
    acceptedAnswer: { "@type": "Answer", text: t(`${k}.a`) },
  }));
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: title,
        provider: { "@id": `${SITE.url}/#localbusiness` },
        areaServed: { "@type": "City", name: "Wien" },
        url,
        ...(offers ? { offers } : {}),
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: faqEntities,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: `${SITE.url}/${locale}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: title,
            item: url,
          },
        ],
      },
    ],
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale, service: slug } = await params;
  setRequestLocale(locale);

  // Slug belongs to either SERVICES (repair-type landings) or DISTRICTS
  // (geo-landings). 404 if neither.
  const service = getService(slug);
  if (service) {
    const t = await getTranslations({
      locale,
      namespace: `services_page.${service.key}`,
    });
    const jsonLd = await buildJsonLd(service, locale, t("meta_title"));
    return (
      <>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ServiceHero service={service} />
        <ServiceBody service={service} />
        <FinalCTA />
      </>
    );
  }

  const district = getDistrict(slug);
  if (!district) notFound();

  // Geo-landing JSON-LD: the repair service scoped to the district's
  // area, so local queries ("handy reparatur donaustadt") get an
  // explicit areaServed match instead of no structured data at all.
  const tGeo = await getTranslations({
    locale,
    namespace: `geo_page.${district.key}`,
  });
  const districtUrl = `${SITE.url}/${locale}/${district.slug}`;
  const districtJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${districtUrl}#service`,
        name: tGeo("meta_title"),
        serviceType: "Smartphone repair",
        provider: { "@id": `${SITE.url}/#localbusiness` },
        areaServed: {
          "@type": "Place",
          name: tGeo("h1"),
          address: {
            "@type": "PostalAddress",
            addressLocality:
              district.key === "gaenserndorf" ? "Gänserndorf" : "Wien",
            postalCode: district.postalCodes[0],
            addressCountry: "AT",
          },
        },
        url: districtUrl,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE.url}/${locale}` },
          { "@type": "ListItem", position: 2, name: tGeo("h1"), item: districtUrl },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(districtJsonLd) }}
      />
      <DistrictView district={district} />
      <FinalCTA />
    </>
  );
}
