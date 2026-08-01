import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { SITE, alternateLanguagesFor } from "@/lib/seo";
import { FinalCTA } from "@/components/sections/FinalCTA";

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
      <section className="bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
        <div className="mx-auto max-w-3xl px-6 py-24 md:px-8 md:py-36">
          <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
            {t("eyebrow")}
          </p>
          <h1 className="mt-5 t-h1">
            {t("h1")}
          </h1>
          <p className="mt-7 text-[18px] leading-[1.55] text-white/70">
            {t("intro")}
          </p>

          <dl className="mt-14 divide-y divide-white/10">
            {Q_KEYS.map((k) => (
              <div key={k} className="py-7">
                <dt className="text-[18px] font-semibold tracking-[-0.01em]">
                  {t(`q_${k}_q`)}
                </dt>
                <dd className="mt-3 text-[16px] leading-[1.6] text-white/70">
                  {t(`q_${k}_a`)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      <FinalCTA />
    </>
  );
}
