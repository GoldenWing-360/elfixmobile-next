import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { html as impressumHtml } from "@/data/legal/impressum";

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
  return (
    <LegalLayout eyebrow="RECHTLICHES" title="Impressum">
      <div dangerouslySetInnerHTML={{ __html: impressumHtml }} />
    </LegalLayout>
  );
}
