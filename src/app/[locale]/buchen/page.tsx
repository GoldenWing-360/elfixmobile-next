import type { Metadata } from "next";
import { Suspense } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { BookingFlow } from "@/components/book/BookingFlow";

export const metadata: Metadata = {
  title: "Termin buchen - Express, Abholung oder Versand",
  description:
    "Reparatur in 60 Sekunden buchen. Vorbeikommen in Wien Aspern, gratis Abholung in Wien oder österreichweit per Post. 12 Monate Garantie.",
};

export default async function BuchenPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  // Header rendered server-side so the H1 + intro land in the static HTML
  // for SEO. The interactive booking widget is a client island below.
  const t = await getTranslations({ locale, namespace: "book" });
  return (
    <section className="relative bg-[var(--color-bg-secondary)] text-[var(--color-text-dark)]">
      <div className="mx-auto max-w-4xl px-6 pb-0 pt-24 md:px-8 md:pt-32">
        <header className="text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
            {t("eyebrow")}
          </p>
          <h1 className="mt-3 text-[clamp(2.25rem,5.5vw,4.25rem)] font-semibold leading-[1.04] tracking-[-0.03em]">
            {t("headline")}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[17px] leading-[1.55] text-[#525257]">
            {t("sub")}
          </p>
        </header>
      </div>
      <Suspense fallback={<div className="min-h-[60vh]" />}>
        <BookingFlow />
      </Suspense>
    </section>
  );
}
