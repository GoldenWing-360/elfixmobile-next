import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ContactView } from "@/components/contact/ContactView";

export const metadata: Metadata = {
  title: "Kontakt - Telefon, WhatsApp und Werkstatt-Adresse Wien",
  description:
    "EL Fix Mobile in Wien 1220 Aspern Seestadt. Maria-Tusch-Strasse 17/1. Telefon 0660 6071414, WhatsApp, E-Mail. Antwort meist in 30 Minuten.",
};

export default async function KontaktPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ContactView />;
}
