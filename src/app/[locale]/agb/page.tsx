import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { alternateLanguagesFor } from "@/lib/seo";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { html as agbHtml } from "@/data/legal/agb";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
  title: "Allgemeine Geschäftsbedingungen (AGB)",
  description:
    "Allgemeine Geschäftsbedingungen von ElFixMobile e.U. für Reparatur- und Servicedienstleistungen.",
  robots: { index: true, follow: true },
    alternates: {
      canonical: `/${locale}/agb`,
      languages: alternateLanguagesFor("/agb"),
    },
  };
}

export default async function AGBPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <LegalLayout
      eyebrow="RECHTLICHES"
      title="Allgemeine Geschäftsbedingungen"
    >
      <div dangerouslySetInnerHTML={{ __html: agbHtml }} />
    </LegalLayout>
  );
}
