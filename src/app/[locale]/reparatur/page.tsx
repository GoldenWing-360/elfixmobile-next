import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BRANDS } from "@/data/brands";
import { SERVICES } from "@/data/services";
import { SITE, alternateLanguagesFor } from "@/lib/seo";
import { ArrowRight } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "reparatur_hub" });
  const title = t("meta_title");
  const description = t("meta_description");
  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/reparatur`,
      languages: alternateLanguagesFor("/reparatur"),
    },
    openGraph: {
      images: [{ url: `${SITE.url}/opengraph-image`, width: 1200, height: 630 }],
      type: "website",
      title,
      description,
      url: `${SITE.url}/${locale}/reparatur`,
      siteName: SITE.name,
    },
  };
}

export default async function ReparaturHubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "reparatur_hub" });
  const tl = await getTranslations({ locale, namespace: "service_labels" });

  const hubUrl = `${SITE.url}/${locale}/reparatur`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${hubUrl}#page`,
        url: hubUrl,
        name: t("meta_title"),
        about: { "@id": `${SITE.url}/#localbusiness` },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: BRANDS.map((b, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: `${b.label} Reparatur Wien`,
            url: `${SITE.url}/${locale}/reparatur/${b.slug}`,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE.url}/${locale}` },
          { "@type": "ListItem", position: 2, name: t("headline"), item: hubUrl },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
        <div className="mx-auto max-w-7xl px-6 py-24 md:px-8 md:py-36">
          <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
            {t("eyebrow")}
          </p>
          <h1 className="mt-5 t-h1">
            {t("headline")}
          </h1>
          <p className="mt-7 max-w-2xl text-[18px] leading-[1.55] text-white/70">
            {t("sub")}
          </p>
        </div>
      </section>

      {/* Brands grid */}
      <section className="bg-[var(--color-bg-secondary)] text-[var(--color-text-dark)]">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-8 md:py-28">
          <h2 className="t-h3">
            {t("h2_brand")}
          </h2>
          <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {BRANDS.map((b) => (
              <li key={b.slug}>
                <Link
                  href={`/reparatur/${b.slug}`}
                  className="group flex flex-col items-center justify-center gap-4 rounded-2xl border border-black/[0.06] bg-white p-7 transition-colors hover:bg-black/[0.02]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/brands/${b.slug}.svg`}
                    alt=""
                    aria-hidden
                    className="h-10 w-10 opacity-80"
                  />
                  <div className="text-center">
                    <div className="text-[16px] font-semibold tracking-[-0.005em]">
                      {b.label}
                    </div>
                    <div className="mt-0.5 text-[12px] text-[#86868B]">
                      {t("model_count", { count: b.modelCount })}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          <h2 className="mt-20 t-h3">
            {t("h2_service")}
          </h2>
          <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/${s.slug}`}
                  className="group flex items-center justify-between rounded-2xl border border-black/[0.06] bg-white px-5 py-4 transition-colors hover:bg-black/[0.02]"
                >
                  <span className="text-[15px] font-medium">
                    {/* tl is the per-service-label namespace; falls back to slug */}
                    {(() => {
                      try {
                        return tl(s.key as "display" | "battery" | "data_recovery" | "water_damage" | "unlock" | "wrap" | "camera" | "tablet" | "notebook");
                      } catch {
                        return s.slug;
                      }
                    })()}
                  </span>
                  <ArrowRight className="h-4 w-4 text-[var(--color-accent)] transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
