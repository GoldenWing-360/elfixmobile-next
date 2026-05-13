import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { setRequestLocale } from "next-intl/server";
import { LegalLayout } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Allgemeine Geschäftsbedingungen (AGB)",
  description:
    "Allgemeine Geschäftsbedingungen von ElFixMobile e.U. für Reparatur- und Servicedienstleistungen.",
  robots: { index: true, follow: true },
};

export default async function AGBPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const html = await readFile(
    path.join(process.cwd(), "src/data/legal/agb.html"),
    "utf8",
  );
  return (
    <LegalLayout
      eyebrow="RECHTLICHES"
      title="Allgemeine Geschäftsbedingungen"
    >
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </LegalLayout>
  );
}
