import type { Metadata } from "next";
import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
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
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <BookingFlow />
    </Suspense>
  );
}
