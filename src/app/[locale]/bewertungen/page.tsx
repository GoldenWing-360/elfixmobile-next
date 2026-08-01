import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { SITE, alternateLanguagesFor } from "@/lib/seo";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Star } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "bewertungen" });
  return {
    title: t("meta_title"),
    description: t("meta_description"),
    alternates: {
      canonical: `/${locale}/bewertungen`,
      languages: alternateLanguagesFor("/bewertungen"),
    },
    openGraph: {
      images: [{ url: `${SITE.url}/opengraph-image`, width: 1200, height: 630 }],
      type: "website",
      title: t("meta_title"),
      description: t("meta_description"),
      url: `${SITE.url}/${locale}/bewertungen`,
      siteName: SITE.name,
    },
  };
}

const REVIEW_KEYS = ["1", "2", "3", "4", "5", "6"] as const;

export default async function BewertungenPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "bewertungen" });

  // No per-review Schema here: the testimonials are paraphrased Google
  // reviews without real author names, and Google's review-snippet
  // policy forbids marking up reviews that aren't verifiably attributed
  // ("Kunde 1" placeholder authors risk a manual action). The verified
  // AggregateRating (4.4/294 from the Google Business Profile) is the
  // honest machine-readable signal and references the LocalBusiness.
  const url = `${SITE.url}/${locale}/bewertungen`;
  const reviewsJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#page`,
        url,
        name: t("meta_title"),
        about: { "@id": `${SITE.url}/#localbusiness` },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: `${SITE.url}/opengraph-image`,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "EL Fix Mobile", item: `${SITE.url}/${locale}` },
          { "@type": "ListItem", position: 2, name: t("h1") },
        ],
      },
    ],
  };

  return (
    <section className="bg-[var(--color-bg-secondary)] text-[var(--color-text-dark)]">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewsJsonLd) }}
      />
      <div className="mx-auto max-w-7xl px-6 py-24 md:px-8 md:py-36">
        <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
          {t("eyebrow")}
        </p>
        <h1 className="mt-5 t-h1">
          {t("h1")}
        </h1>

        <div className="mt-10 flex items-center gap-4 rounded-3xl border border-black/[0.06] bg-white p-7">
          <div className="flex shrink-0 items-baseline gap-2">
            <span className="t-h1 leading-none">
              {t("rating_value")}
            </span>
            <span className="text-[18px] text-[#86868B]">/ 5</span>
          </div>
          <div className="flex flex-col">
            <div className="flex gap-0.5 text-[var(--color-success)]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-5 w-5" fill="currentColor" />
              ))}
            </div>
            <div className="mt-1 text-[14px] text-[#525257]">
              {t("rating_count")}
            </div>
          </div>
        </div>

        <p className="mt-10 max-w-2xl text-[17px] leading-[1.55] text-[#525257]">
          {t("intro")}
        </p>

        <ul className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2">
          {REVIEW_KEYS.map((k) => (
            <li
              key={k}
              className="rounded-3xl border border-black/[0.06] bg-white p-7"
            >
              <div className="flex gap-0.5 text-[var(--color-success)]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5" fill="currentColor" />
                ))}
              </div>
              <p className="mt-4 text-[16px] leading-[1.55] text-[#1d1d1f]">
                &ldquo;{t(`review_${k}`)}&rdquo;
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-12">
          <a
            href="https://www.google.com/maps/place/?q=Maria-Tusch-Stra%C3%9Fe+17%2F1+1220+Wien"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--color-text-dark)] px-6 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-black"
          >
            {t("google_cta")} <span aria-hidden>↗</span>
          </a>
        </div>
      </div>
      <FinalCTA />
    </section>
  );
}
