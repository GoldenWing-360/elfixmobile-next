import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { setRequestLocale } from "next-intl/server";
import { LegalLayout } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Impressum",
  description:
    "ElFixMobile e.U., Maria-Tusch-Strasse 17/1, 1220 Wien. Firmenangaben nach UGB und ECG.",
  robots: { index: true, follow: true },
};

export default async function ImpressumPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const html = await readFile(
    path.join(process.cwd(), "src/data/legal/impressum.html"),
    "utf8",
  );
  return (
    <LegalLayout eyebrow="RECHTLICHES" title="Impressum">
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </LegalLayout>
  );
}
