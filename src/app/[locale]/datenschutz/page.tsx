import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { alternateLanguagesFor } from "@/lib/seo";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { html as datenschutzHtml } from "@/data/legal/datenschutz";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
  title: "Datenschutzerklärung",
  description:
    "Datenschutzerklärung nach DSGVO und TKG 2003 für www.elfixmobile.at.",
  robots: { index: true, follow: true },
    alternates: {
      canonical: `/${locale}/datenschutz`,
      languages: alternateLanguagesFor("/datenschutz"),
    },
  };
}

export default async function DatenschutzPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <LegalLayout
      eyebrow="RECHTLICHES"
      title="Datenschutzerklärung"
      updated="13. Mai 2026"
    >
      <div dangerouslySetInnerHTML={{ __html: datenschutzHtml }} />
    </LegalLayout>
  );
}
