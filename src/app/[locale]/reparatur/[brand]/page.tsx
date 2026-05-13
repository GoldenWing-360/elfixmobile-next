import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { BRANDS, getBrand } from "@/data/brands";
import { routing } from "@/i18n/routing";
import { SITE, alternateLanguagesFor } from "@/lib/seo";
import { BrandHero } from "@/components/brand/BrandHero";
import { BrandModelsTable } from "@/components/brand/BrandModelsTable";
import { BrandQuoteCta } from "@/components/brand/BrandQuoteCta";
import { BrandFAQ } from "@/components/brand/BrandFAQ";
import { PickupBanner } from "@/components/sections/PickupBanner";
import { FinalCTA } from "@/components/sections/FinalCTA";

type Params = { locale: string; brand: string };

export function generateStaticParams() {
  // 8 brands × 4 locales = 32 routes. The crawler picks these up from the
  // returned tuples; do NOT inflate this list without auditing build output.
  const out: Params[] = [];
  for (const locale of routing.locales) {
    for (const b of BRANDS) {
      out.push({ locale, brand: b.slug });
    }
  }
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, brand: brandSlug } = await params;
  const brand = getBrand(brandSlug);
  if (!brand) return {};

  const t = await getTranslations({ locale, namespace: "brand_page.meta" });
  const title = t("title", { brand: brand.label });
  const description = t("description", {
    brand: brand.label,
    count: brand.modelCount,
  });

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/reparatur/${brand.slug}`,
      languages: alternateLanguagesFor(`/reparatur/${brand.slug}`),
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: `${SITE.url}/${locale}/reparatur/${brand.slug}`,
      siteName: SITE.name,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

function buildJsonLd(brand: ReturnType<typeof getBrand>, locale: string) {
  if (!brand) return null;
  const url = `${SITE.url}/${locale}/reparatur/${brand.slug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: `${brand.label} Reparatur Wien`,
        provider: { "@id": `${SITE.url}/#localbusiness` },
        areaServed: { "@type": "City", name: "Wien" },
        serviceType: `${brand.label} smartphone repair`,
        url,
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
            name: "Reparatur",
            item: `${SITE.url}/${locale}/reparatur`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: brand.label,
            item: url,
          },
        ],
      },
    ],
  };
}

export default async function BrandPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale, brand: brandSlug } = await params;
  setRequestLocale(locale);

  const brand = getBrand(brandSlug);
  if (!brand) notFound();

  const jsonLd = buildJsonLd(brand, locale);

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BrandHero brand={brand} />
      {brand.hasOnlinePrices ? (
        <BrandModelsTable brand={brand} />
      ) : (
        <BrandQuoteCta brand={brand} />
      )}
      <PickupBanner />
      <BrandFAQ brand={brand} />
      <FinalCTA />
    </>
  );
}
