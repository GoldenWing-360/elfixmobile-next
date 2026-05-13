import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { setRequestLocale } from "next-intl/server";
import { LegalLayout } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description:
    "Datenschutzerklärung nach DSGVO und TKG 2003 für www.elfixmobile.at.",
  robots: { index: true, follow: true },
};

export default async function DatenschutzPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const html = await readFile(
    path.join(process.cwd(), "src/data/legal/datenschutz.html"),
    "utf8",
  );
  return (
    <LegalLayout
      eyebrow="RECHTLICHES"
      title="Datenschutzerklärung"
      updated="13. Mai 2026"
    >
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </LegalLayout>
  );
}
