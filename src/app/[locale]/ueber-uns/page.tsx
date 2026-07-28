import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { SITE, alternateLanguagesFor } from "@/lib/seo";
import { FinalCTA } from "@/components/sections/FinalCTA";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ueber_uns" });
  return {
    title: t("meta_title"),
    description: t("meta_description"),
    alternates: {
      canonical: `/${locale}/ueber-uns`,
      languages: alternateLanguagesFor("/ueber-uns"),
    },
    openGraph: {
      type: "website",
      title: t("meta_title"),
      description: t("meta_description"),
      url: `${SITE.url}/${locale}/ueber-uns`,
      siteName: SITE.name,
    },
  };
}

const VALUE_KEYS = ["1", "2", "3", "4"] as const;

export default async function UeberUnsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "ueber_uns" });

  const url = `${SITE.url}/${locale}/ueber-uns`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${url}#page`,
        url,
        name: t("meta_title"),
        about: { "@id": `${SITE.url}/#localbusiness` },
        inLanguage: locale,
      },
      {
        "@type": "Person",
        "@id": `${SITE.url}/#owner`,
        name: SITE.owner,
        jobTitle: "Inhaberin",
        worksFor: { "@id": `${SITE.url}/#localbusiness` },
        knowsAbout: ["Smartphone Reparatur", "Mikrolöten", "Datenrettung"],
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

  const creds = [
    { title: t("cred_1_title"), body: t("cred_1_body") },
    { title: t("cred_2_title"), body: t("cred_2_body") },
    { title: t("cred_3_title"), body: t("cred_3_body") },
  ];
  const stats = [
    { value: "2019", label: t("stat_founded") },
    { value: "4,4 / 5", label: t("stat_reviews") },
    { value: "219+", label: t("stat_models") },
    { value: "30 Min", label: t("stat_express") },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
        <div className="mx-auto max-w-4xl px-6 py-24 md:px-8 md:py-36">
          <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
            {t("eyebrow")}
          </p>
          <h1 className="mt-5 t-h1">
            {t("h1")}
          </h1>
          <p className="mt-7 max-w-2xl text-[18px] leading-[1.55] text-white/75">
            {t("intro")}
          </p>
        </div>
      </section>

      <section className="bg-[var(--color-bg-secondary)] text-[var(--color-text-dark)]">
        <div className="mx-auto max-w-4xl px-6 py-20 md:px-8 md:py-28">
          <div className="grid grid-cols-1 gap-14 md:grid-cols-2 md:gap-16">
            <div>
              <h2 className="t-h3">
                {t("section_story_title")}
              </h2>
              <p className="mt-5 text-[17px] leading-[1.6] text-[#525257]">
                {t("section_story_body")}
              </p>
            </div>
            <div>
              <h2 className="t-h3">
                {t("section_team_title")}
              </h2>
              <p className="mt-5 text-[17px] leading-[1.6] text-[#525257]">
                {t("section_team_body")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Inhaberin + Zertifizierungen — the E-E-A-T core of the page */}
      <section className="bg-white text-[var(--color-text-dark)]">
        <div className="mx-auto max-w-5xl px-6 py-20 md:px-8 md:py-28">
          <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-14">
            <div>
              <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
                {t("owner_eyebrow")}
              </p>
              <h2 className="mt-4 t-h3">
                {t("owner_title")}
              </h2>
              <p className="mt-5 text-[17px] leading-[1.6] text-[#525257]">
                {t("owner_body")}
              </p>
            </div>
            <Image
              src="/media/workshop-poster.webp"
              alt={t("workshop_image_alt")}
              width={1600}
              height={905}
              unoptimized
              className="w-full rounded-3xl ring-1 ring-black/[0.06]"
            />
          </div>

          <h2 className="mt-20 t-h3">
            {t("cred_section_title")}
          </h2>
          <ul className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {creds.map((c) => (
              <li
                key={c.title}
                className="rounded-3xl bg-[var(--color-bg-secondary)] p-7 ring-1 ring-black/[0.04]"
              >
                <h3 className="text-[17px] font-semibold tracking-[-0.01em]">
                  {c.title}
                </h3>
                <p className="mt-3 text-[15px] leading-[1.55] text-[#525257]">
                  {c.body}
                </p>
              </li>
            ))}
          </ul>

          <dl className="mt-14 grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <dd className="text-[30px] font-semibold tracking-[-0.02em]">
                  {s.value}
                </dd>
                <dt className="mt-1 text-[13px] uppercase tracking-[0.14em] text-[#6e6e73]">
                  {s.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
        <div className="mx-auto max-w-5xl px-6 py-20 md:px-8 md:py-28">
          <h2 className="t-h2">
            {t("section_values_title")}
          </h2>
          <ul className="mt-12 grid grid-cols-1 gap-7 sm:grid-cols-2">
            {VALUE_KEYS.map((k) => (
              <li
                key={k}
                className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-7"
              >
                <h3 className="text-[20px] font-semibold tracking-[-0.01em]">
                  {t(`values_${k}_title`)}
                </h3>
                <p className="mt-3 text-[16px] leading-[1.55] text-white/65">
                  {t(`values_${k}_body`)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}
