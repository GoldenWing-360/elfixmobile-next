import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { SITE, alternateLanguagesFor } from "@/lib/seo";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { FaqSplit } from "@/components/FaqSplit";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faq" });
  return {
    title: t("meta_title"),
    description: t("meta_description"),
    alternates: {
      canonical: `/${locale}/faq`,
      languages: alternateLanguagesFor("/faq"),
    },
    openGraph: {
      images: [{ url: `${SITE.url}/opengraph-image`, width: 1200, height: 630 }],
      type: "website",
      title: t("meta_title"),
      description: t("meta_description"),
      url: `${SITE.url}/${locale}/faq`,
      siteName: SITE.name,
    },
  };
}

const Q_KEYS = [
  "express",
  "warranty",
  "data",
  "price",
  "parts",
  "pickup",
  "pay",
  "hours",
] as const;

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "faq" });

  // Schema.org FAQPage so Google can lift answers into rich-result cards.
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: Q_KEYS.map((k) => ({
      "@type": "Question",
      name: t(`q_${k}_q`),
      acceptedAnswer: {
        "@type": "Answer",
        text: t(`q_${k}_a`),
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <FaqSplit
        dark
        titleAs="h1"
        eyebrow={t("eyebrow")}
        headline={t("h1")}
        sub={t("intro")}
        items={Q_KEYS.map((k) => ({ q: t(`q_${k}_q`), a: t(`q_${k}_a`) }))}
      />
      <FinalCTA />
    </>
  );
}
