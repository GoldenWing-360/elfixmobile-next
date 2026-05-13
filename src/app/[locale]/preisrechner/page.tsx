import type { Metadata } from "next";
import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
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
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <Calculator />
    </Suspense>
  );
}
