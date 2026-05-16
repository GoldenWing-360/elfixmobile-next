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

  return (
    <>
      <section className="bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
        <div className="mx-auto max-w-4xl px-6 py-24 md:px-8 md:py-32">
          <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
            {t("eyebrow")}
          </p>
          <h1 className="mt-5 text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[1.04] tracking-[-0.03em]">
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
              <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.02em]">
                {t("section_story_title")}
              </h2>
              <p className="mt-5 text-[17px] leading-[1.6] text-[#525257]">
                {t("section_story_body")}
              </p>
            </div>
            <div>
              <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.02em]">
                {t("section_team_title")}
              </h2>
              <p className="mt-5 text-[17px] leading-[1.6] text-[#525257]">
                {t("section_team_body")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
        <div className="mx-auto max-w-5xl px-6 py-20 md:px-8 md:py-28">
          <h2 className="text-[clamp(1.875rem,4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.02em]">
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
                <p className="mt-3 text-[15.5px] leading-[1.55] text-white/65">
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
