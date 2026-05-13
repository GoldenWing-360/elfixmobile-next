import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { SERVICES, getService } from "@/data/services";
import { routing } from "@/i18n/routing";
import { SITE, alternateLanguagesFor } from "@/lib/seo";
import { ServiceHero } from "@/components/service/ServiceHero";
import { ServiceBody } from "@/components/service/ServiceBody";
import { PickupBanner } from "@/components/sections/PickupBanner";
import { FinalCTA } from "@/components/sections/FinalCTA";

type Params = { locale: string; service: string };

export function generateStaticParams() {
  // Service slugs are deliberately German-only (e.g., "display-reparatur-wien")
  // because the WP incumbent ranks for these exact strings. We emit the cross
  // product with locales: 6 services × 4 locales = 24 routes. Other static
  // segments under [locale] (reparatur, preisrechner, …) win over this
  // dynamic segment because Next.js prefers static routes.
  const out: Params[] = [];
  for (const locale of routing.locales) {
    for (const s of SERVICES) {
      out.push({ locale, service: s.slug });
    }
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
  if (!service) return {};

  const t = await getTranslations({
    locale,
    namespace: `services_page.${service.key}`,
  });
  const title = t("meta_title");
  const description = t("meta_description");

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/${service.slug}`,
      languages: alternateLanguagesFor(`/${service.slug}`),
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: `${SITE.url}/${locale}/${service.slug}`,
      siteName: SITE.name,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

function buildJsonLd(service: ReturnType<typeof getService>, locale: string, title: string) {
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

  const service = getService(slug);
  if (!service) notFound();

  const t = await getTranslations({
    locale,
    namespace: `services_page.${service.key}`,
  });
  const jsonLd = buildJsonLd(service, locale, t("meta_title"));

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ServiceHero service={service} />
      <ServiceBody service={service} />
      <PickupBanner />
      <FinalCTA />
    </>
  );
}
