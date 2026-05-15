import type { Metadata } from "next";
import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { SimpleBookingForm } from "@/components/book/SimpleBookingForm";

export const metadata: Metadata = {
  title: "Reparatur anfragen - 30 Min Rückmeldung",
  description:
    "Ein Formular, ein Anruf zurück in 30 Minuten. Festpreis vor der Reparatur. Vorbeikommen, abholen lassen oder per Post schicken.",
};

export default async function BuchenPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <section className="relative bg-[var(--color-bg-secondary)] text-[var(--color-text-dark)]">
      <div className="mx-auto max-w-3xl px-6 pt-24 md:px-8 md:pt-32">
        <header className="text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
            REPARATUR ANFRAGEN
          </p>
          <h1 className="mt-3 text-[clamp(2.25rem,5.5vw,4.25rem)] font-semibold leading-[1.04] tracking-[-0.03em]">
            Sag uns was kaputt ist.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[17px] leading-[1.55] text-[#525257]">
            Wir melden uns binnen 30 Minuten mit Festpreis und Termin-Vorschlag.
            Kein Account, kein Login, kein Spam.
          </p>
        </header>
      </div>
      <Suspense fallback={<div className="min-h-[60vh]" />}>
        <SimpleBookingForm />
      </Suspense>
    </section>
  );
}
