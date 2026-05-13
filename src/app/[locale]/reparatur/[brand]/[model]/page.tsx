import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { allBrandModelPairs, getModel } from "@/data/brands";
import { repairLabel, repairDurationBucket } from "@/data/repair-labels";
import { routing } from "@/i18n/routing";
import { SITE, alternateLanguagesFor } from "@/lib/seo";
import { PickupBanner } from "@/components/sections/PickupBanner";
import { FinalCTA } from "@/components/sections/FinalCTA";

type Params = { locale: string; brand: string; model: string };
type Locale = "de" | "en" | "ru" | "tr";

export function generateStaticParams() {
  // 219 (brand, model) pairs × 4 locales = 876 routes. Verified the build
  // completes in ~12 s and the bundled worker stays well under the CF
  // Workers 10 MB asset cap; ramping further would mean splitting into
  // ISR or trimming meta. For now: full static prerender.
  const out: Params[] = [];
  const pairs = allBrandModelPairs();
  for (const locale of routing.locales) {
    for (const { brandSlug, modelSlug } of pairs) {
      out.push({ locale, brand: brandSlug, model: modelSlug });
    }
  }
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, brand: brandSlug, model: modelSlug } = await params;
  const pair = getModel(brandSlug, modelSlug);
  if (!pair) return {};

  const t = await getTranslations({ locale, namespace: "model_page" });
  const title = t("meta_title", { model: pair.model.full_name });
  const description = t("meta_description", { model: pair.model.full_name });

  const canonical = `/${locale}/reparatur/${pair.brand.slug}/${pair.model.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: alternateLanguagesFor(
        `/reparatur/${pair.brand.slug}/${pair.model.slug}`,
      ),
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: `${SITE.url}${canonical}`,
      siteName: SITE.name,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

function buildJsonLd(
  pair: NonNullable<ReturnType<typeof getModel>>,
  locale: string,
  prices: { slug: string; price: number }[],
) {
  const url = `${SITE.url}/${locale}/reparatur/${pair.brand.slug}/${pair.model.slug}`;
  const priced = prices.filter((p) => typeof p.price === "number");
  const lo = priced.length ? Math.min(...priced.map((p) => p.price)) : null;
  const hi = priced.length ? Math.max(...priced.map((p) => p.price)) : null;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${url}#product`,
        name: pair.model.full_name,
        brand: { "@type": "Brand", name: pair.brand.label },
        category: "Smartphone",
      },
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: `${pair.model.full_name} Reparatur Wien`,
        provider: { "@id": `${SITE.url}/#localbusiness` },
        areaServed: { "@type": "City", name: "Wien" },
        serviceType: `${pair.brand.label} ${pair.model.name} repair`,
        url,
        ...(lo != null && hi != null
          ? {
              offers: {
                "@type": "AggregateOffer",
                priceCurrency: "EUR",
                lowPrice: lo,
                highPrice: hi,
                offerCount: priced.length,
              },
            }
          : {}),
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
            name: pair.brand.label,
            item: `${SITE.url}/${locale}/reparatur/${pair.brand.slug}`,
          },
          {
            "@type": "ListItem",
            position: 4,
            name: pair.model.full_name,
            item: url,
          },
        ],
      },
    ],
  };
}

export default async function ModelPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale, brand: brandSlug, model: modelSlug } = await params;
  setRequestLocale(locale);
  const safeLocale = (["de", "en", "ru", "tr"].includes(locale) ? locale : "de") as Locale;

  const pair = getModel(brandSlug, modelSlug);
  if (!pair) notFound();

  const t = await getTranslations({ locale, namespace: "model_page" });

  // Sort repair rows by price (cheapest first), missing prices last.
  const repairs = Object.entries(pair.model.prices)
    .map(([slug, price]) => ({ slug, price: typeof price === "number" ? price : null }))
    .sort((a, b) => {
      if (a.price == null && b.price == null) return 0;
      if (a.price == null) return 1;
      if (b.price == null) return -1;
      return a.price - b.price;
    });

  const jsonLd = buildJsonLd(
    pair,
    locale,
    repairs
      .filter((r): r is { slug: string; price: number } => r.price != null)
      .map((r) => ({ slug: r.slug, price: r.price })),
  );

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section
        className={`relative overflow-hidden bg-gradient-to-br ${pair.brand.gradient} text-white`}
      >
        <div className="mx-auto max-w-5xl px-6 py-24 md:px-8 md:py-32">
          <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-white/55">
            {t("eyebrow", { brand: pair.brand.label, model: pair.model.name })}
          </p>
          <h1 className="mt-5 text-[clamp(2.25rem,6vw,4.5rem)] font-semibold leading-[1.04] tracking-[-0.03em]">
            {t("title_prefix")}{" "}
            <span className="block text-white">{pair.model.full_name}</span>
            <span className="block text-white/70">{t("title_suffix")}</span>
          </h1>
          <p className="mt-7 max-w-2xl text-[18px] leading-[1.55] text-white/75">
            {t("intro", { model: pair.model.full_name })}
          </p>

          <div className="mt-10 flex flex-wrap gap-x-10 gap-y-3 text-[14px]">
            <span className="flex items-center gap-2 text-white/85">
              <span aria-hidden className="text-white/55">·</span>
              {t("trust_warranty")}
            </span>
            <span className="flex items-center gap-2 text-white/85">
              <span aria-hidden className="text-white/55">·</span>
              {t("trust_express")}
            </span>
            <span className="flex items-center gap-2 text-white/85">
              <span aria-hidden className="text-white/55">·</span>
              {t("trust_walkin")}
            </span>
            <span className="flex items-center gap-2 text-white/85">
              <span aria-hidden className="text-white/55">·</span>
              {t("trust_rating")}
            </span>
          </div>
        </div>
      </section>

      {/* Prices */}
      <section className="bg-[var(--color-bg-secondary)] text-[var(--color-text-dark)]">
        <div className="mx-auto max-w-5xl px-6 py-20 md:px-8 md:py-28">
          <header className="max-w-2xl">
            <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
              {t("prices_eyebrow", { model: pair.model.full_name })}
            </p>
            <h2 className="mt-4 text-[clamp(1.875rem,4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.02em]">
              {t("prices_headline", { model: pair.model.full_name })}
            </h2>
            <p className="mt-4 text-[16px] text-[#525257]">
              {t("prices_sub", { repair_count: repairs.length })}
            </p>
          </header>

          <div className="mt-10 overflow-x-auto rounded-2xl border border-black/[0.08] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <table className="min-w-full text-left text-[14px]">
              <thead className="bg-black/[0.02] text-[12px] uppercase tracking-[0.12em] text-[#525257]">
                <tr>
                  <th className="px-5 py-4 font-medium">{t("col_repair")}</th>
                  <th className="px-5 py-4 font-medium">{t("col_duration")}</th>
                  <th className="px-5 py-4 text-right font-medium">{t("col_price")}</th>
                </tr>
              </thead>
              <tbody>
                {repairs.map((r, i) => {
                  const bucket = repairDurationBucket(r.slug);
                  const durationKey =
                    bucket === "express"
                      ? "duration_express"
                      : bucket === "complex"
                        ? "duration_complex"
                        : "duration_standard";
                  return (
                    <tr
                      key={r.slug}
                      className={i % 2 === 0 ? "bg-white" : "bg-black/[0.015]"}
                    >
                      <td className="px-5 py-3.5 font-medium text-[var(--color-text-dark)]">
                        {repairLabel(r.slug, safeLocale)}
                      </td>
                      <td className="px-5 py-3.5 text-[#525257]">{t(durationKey)}</td>
                      <td className="px-5 py-3.5 text-right tabular-nums font-medium">
                        {r.price != null ? `${r.price} €` : (
                          <span className="text-[#86868B]">{t("no_price")}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              href={{ pathname: "/buchen", query: { model: pair.model.full_name } }}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-text-dark)] px-6 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-black"
            >
              {t("cta_primary")} <span aria-hidden>→</span>
            </Link>
            <Link
              href={`/reparatur/${pair.brand.slug}`}
              className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-6 py-3.5 text-[15px] font-medium text-[var(--color-text-dark)] transition-colors hover:bg-black/[0.04]"
            >
              {t("cta_secondary")}
            </Link>
          </div>

          <p className="mt-10 text-[13px] text-[#86868B]">
            <Link
              href={`/reparatur/${pair.brand.slug}`}
              className="text-[var(--color-accent)] hover:underline"
            >
              ← {t("back_to_brand", { brand: pair.brand.label })}
            </Link>
          </p>
        </div>
      </section>

      <PickupBanner />

      {/* FAQ */}
      <section className="bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
        <div className="mx-auto max-w-4xl px-6 py-20 md:px-8 md:py-28">
          <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
            {t("faq_eyebrow")}
          </p>
          <h2 className="mt-4 text-[clamp(1.875rem,4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.02em]">
            {t("faq_headline", { model: pair.model.full_name })}
          </h2>
          <dl className="mt-12 divide-y divide-white/10">
            {(["q_what_if_not_listed", "q_genuine_parts", "q_data_safe", "q_pickup"] as const).map(
              (k) => (
                <div key={k} className="py-7">
                  <dt className="text-[18px] font-semibold tracking-[-0.01em]">
                    {t(`${k}.q`, { model: pair.model.full_name })}
                  </dt>
                  <dd className="mt-3 text-[16px] leading-[1.6] text-white/70">
                    {t(`${k}.a`, { model: pair.model.full_name, brand: pair.brand.label })}
                  </dd>
                </div>
              ),
            )}
          </dl>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}
