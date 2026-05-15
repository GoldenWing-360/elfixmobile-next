import type { Metadata } from "next";
import { Suspense } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { SimpleBookingForm } from "@/components/book/SimpleBookingForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "buchen_page" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function BuchenPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("buchen_page");
  return (
    <section className="relative bg-[var(--color-bg-secondary)] text-[var(--color-text-dark)]">
      <div className="mx-auto max-w-3xl px-6 pt-24 md:px-8 md:pt-32">
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
        <SimpleBookingForm />
      </Suspense>
    </section>
  );
}
