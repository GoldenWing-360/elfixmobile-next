import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  BRANDS,
  getBrand,
  getModelsForBrand,
  type BrandModel,
} from "@/data/brands";
import { routing } from "@/i18n/routing";
import { SITE, alternateLanguagesFor } from "@/lib/seo";

type Params = { locale: string; brand: string };

export function generateStaticParams() {
  const out: Params[] = [];
  for (const locale of routing.locales) {
    for (const b of BRANDS) {
      if (!b.hasOnlinePrices) continue; // brands without prices have no models to list
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
  const t = await getTranslations({ locale, namespace: "brand_modelle" });
  const title = t("meta_title", { brand: brand.label });
  const description = t("meta_description", { brand: brand.label });
  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/reparatur/${brand.slug}/modelle`,
      languages: alternateLanguagesFor(`/reparatur/${brand.slug}/modelle`),
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: `${SITE.url}/${locale}/reparatur/${brand.slug}/modelle`,
      siteName: SITE.name,
    },
  };
}

function groupByYear(models: BrandModel[]): {
  year: number | "older";
  list: BrandModel[];
}[] {
  // Group models by year for a scannable index instead of one long flat list.
  // Models with no year fall into "older" - keeps the section count bounded
  // even when pricing.json doesn't carry year metadata.
  const buckets = new Map<number | "older", BrandModel[]>();
  for (const m of models) {
    const key = (m.year ?? "older") as number | "older";
    const bucket = buckets.get(key) ?? [];
    bucket.push(m);
    buckets.set(key, bucket);
  }
  return Array.from(buckets.entries())
    .sort((a, b) => {
      if (a[0] === "older") return 1;
      if (b[0] === "older") return -1;
      return (b[0] as number) - (a[0] as number);
    })
    .map(([year, list]) => ({ year, list }));
}

export default async function BrandModelsIndexPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale, brand: brandSlug } = await params;
  setRequestLocale(locale);
  const brand = getBrand(brandSlug);
  if (!brand) notFound();

  const models = getModelsForBrand(brand);
  const groups = groupByYear(models);
  const t = await getTranslations({ locale, namespace: "brand_modelle" });

  const pageUrl = `${SITE.url}/${locale}/reparatur/${brand.slug}/modelle`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}#page`,
        url: pageUrl,
        name: t("meta_title", { brand: brand.label }),
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: models.length,
          itemListElement: models.slice(0, 30).map((m, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: `${m.full_name} Reparatur`,
            url: `${SITE.url}/${locale}/reparatur/${brand.slug}/${m.slug}`,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE.url}/${locale}` },
          { "@type": "ListItem", position: 2, name: brand.label, item: `${SITE.url}/${locale}/reparatur/${brand.slug}` },
          { "@type": "ListItem", position: 3, name: t("headline", { brand: brand.label }), item: pageUrl },
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
      <section
        className={`relative overflow-hidden bg-gradient-to-br ${brand.gradient} text-white`}
      >
        <div className="mx-auto max-w-5xl px-6 py-20 md:px-8 md:py-28">
          <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-white/55">
            {brand.label.toUpperCase()} {t("eyebrow_suffix")}
          </p>
          <h1 className="mt-4 text-[clamp(2.25rem,6vw,4.5rem)] font-semibold leading-[1.04] tracking-[-0.03em]">
            {t("headline", { brand: brand.label })}
          </h1>
          <p className="mt-6 max-w-2xl text-[18px] leading-[1.55] text-white/75">
            {t("sub", { count: models.length })}
          </p>
        </div>
      </section>

      <section className="bg-[var(--color-bg-secondary)] text-[var(--color-text-dark)]">
        <div className="mx-auto max-w-5xl px-6 py-16 md:px-8 md:py-24">
          {groups.map((g) => (
            <div key={String(g.year)} className="mb-12">
              <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold tracking-[-0.02em]">
                {g.year === "older" ? t("older_group") : g.year}
              </h2>
              <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {g.list.map((m) => (
                  <li key={m.slug}>
                    <Link
                      href={`/reparatur/${brand.slug}/${m.slug}`}
                      className="group flex items-center justify-between rounded-2xl border border-black/[0.06] bg-white px-5 py-4 transition-colors hover:border-black/[0.12] hover:bg-black/[0.02]"
                    >
                      <span className="text-[15px] font-medium">{m.full_name}</span>
                      <span
                        aria-hidden
                        className="text-[var(--color-accent)] transition-transform group-hover:translate-x-0.5"
                      >
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <p className="mt-10 text-[14px] text-[#525257]">
            {t("footer_missing_prefix", { brand: brand.label })}
            <Link href="/kontakt" className="text-[var(--color-accent)] hover:underline">
              {t("footer_missing_link")}
            </Link>
            {t("footer_missing_middle")}
            <a href="tel:+436606071414" className="text-[var(--color-accent)] hover:underline">
              {t("footer_missing_call")}
            </a>
            {t("footer_missing_suffix")}
          </p>

          <p className="mt-10 text-[13px] text-[#86868B]">
            <Link
              href={`/reparatur/${brand.slug}`}
              className="text-[var(--color-accent)] hover:underline"
            >
              ← {t("back_overview", { brand: brand.label })}
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
