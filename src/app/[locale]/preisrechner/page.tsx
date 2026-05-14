import type { Metadata } from "next";
import { Suspense } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Calculator } from "@/components/calc/Calculator";

export const metadata: Metadata = {
  title: "Preisrechner - Festpreis in 10 Sekunden",
  description:
    "Sofort-Preisrechner für Handy-, iPad- und Smartwatch-Reparatur in Wien. Marke und Modell wählen, Festpreis erhalten, gratis Abholung möglich.",
};

export default async function PreisrechnerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  // SSR header so the H1 ships in the static HTML for SEO. The
  // interactive calculator below is a client island.
  const t = await getTranslations({ locale, namespace: "calc_page" });
  return (
    <section className="relative bg-[var(--color-bg-secondary)] text-[var(--color-text-dark)]">
      <div className="mx-auto max-w-5xl px-6 pt-24 md:px-8 md:pt-32">
        <header className="text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
            {t("eyebrow")}
          </p>
          <h1 className="mt-3 text-[clamp(2.25rem,5.5vw,4.5rem)] font-semibold leading-[1.04] tracking-[-0.03em]">
            {t("headline")}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[17px] leading-[1.55] text-[#525257]">
            {t("sub")}
          </p>
        </header>
      </div>
      <Suspense fallback={<div className="min-h-[60vh]" />}>
        <Calculator />
      </Suspense>
    </section>
  );
}
