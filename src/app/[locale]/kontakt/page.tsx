import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { SITE, alternateLanguagesFor } from "@/lib/seo";
import { ContactView } from "@/components/contact/ContactView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return {
    title: t("meta_title"),
    description: t("meta_description"),
    alternates: {
      canonical: `/${locale}/kontakt`,
      languages: alternateLanguagesFor("/kontakt"),
    },
    openGraph: {
      type: "website",
      title: t("meta_title"),
      description: t("meta_description"),
      url: `${SITE.url}/${locale}/kontakt`,
      siteName: SITE.name,
    },
  };
}

export default async function KontaktPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "contact" });

  const url = `${SITE.url}/${locale}/kontakt`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        "@id": `${url}#page`,
        url,
        name: t("meta_title"),
        about: { "@id": `${SITE.url}/#localbusiness` },
        inLanguage: locale,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "EL Fix Mobile", item: `${SITE.url}/${locale}` },
          { "@type": "ListItem", position: 2, name: t("meta_title") },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ContactView />
    </>
  );
}
