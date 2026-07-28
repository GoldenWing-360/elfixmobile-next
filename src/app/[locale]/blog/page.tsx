import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SITE } from "@/lib/seo";
import { getGlossar, getRatgeber } from "@/lib/blog";

/**
 * Blog hub — German-only (the migrated WP content has no translations),
 * so we only prerender /de/blog and 404 every other locale.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ locale: "de" }];
}

export const metadata: Metadata = {
  title: "Ratgeber & Glossar: Handy Reparatur Wissen",
  description:
    "Praktische Anleitungen, Preis-Guides und Technik-Glossar rund um Smartphone-Reparatur von den Profis bei EL Fix Mobile Wien.",
  alternates: {
    canonical: `${SITE.url}/de/blog`,
  },
};

export default async function BlogHubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "de") notFound();
  setRequestLocale(locale);

  const ratgeber = getRatgeber();
  const glossar = getGlossar();

  const hubUrl = `${SITE.url}/de/blog`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        "@id": `${hubUrl}#blog`,
        url: hubUrl,
        name: "EL Fix Mobile Ratgeber & Glossar",
        inLanguage: "de",
        publisher: { "@id": `${SITE.url}/#localbusiness` },
        blogPost: ratgeber.slice(0, 10).map((a) => ({
          "@type": "BlogPosting",
          headline: a.title,
          url: `${hubUrl}/${a.slug}`,
          datePublished: a.date,
        })),
      },
      {
        "@type": "DefinedTermSet",
        "@id": `${hubUrl}#glossar`,
        name: "EL Fix Mobile Technik-Glossar",
        url: hubUrl,
        hasDefinedTerm: glossar.map((a) => ({
          "@type": "DefinedTerm",
          name: a.title.replace(/^Was ist (ein |eine |der |die |das )?/i, "").replace(/\?$/, ""),
          url: `${hubUrl}/${a.slug}`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "EL Fix Mobile", item: `${SITE.url}/de` },
          { "@type": "ListItem", position: 2, name: "Ratgeber", item: hubUrl },
        ],
      },
    ],
  };

  return (
    <div className="bg-[var(--color-bg-secondary)] text-[var(--color-text-dark)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-7xl px-6 pb-24 pt-32 md:px-8 md:pb-36 md:pt-44">
        <header className="max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
            Ratgeber
          </p>
          <h1 className="mt-4 text-[clamp(2rem,5vw,4.25rem)] font-semibold leading-[1.06] tracking-[-0.025em]">
            Wissen, das dein Handy länger leben lässt.
          </h1>
          <p className="mt-5 max-w-2xl text-[17px] leading-[1.55] text-[#525257]">
            Anleitungen, Preis-Guides und ehrliche Antworten aus unserer
            Werkstatt in Wien Aspern.
          </p>
        </header>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ratgeber.map((a) => (
            <Link
              key={a.slug}
              href={`/blog/${a.slug}`}
              className="group flex flex-col rounded-3xl bg-white p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.04] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_2px_4px_rgba(0,0,0,0.05),0_24px_40px_-20px_rgba(0,0,0,0.2)]"
            >
              <h2 className="text-[19px] font-semibold leading-[1.3] tracking-[-0.01em] text-black group-hover:text-[var(--color-accent)]">
                {a.title}
              </h2>
              <p className="mt-3 flex-1 text-[14.5px] leading-[1.55] text-[#525257]">
                {a.excerpt}
              </p>
              <span className="mt-5 text-[14px] font-medium text-[var(--color-accent)]">
                Weiterlesen →
              </span>
            </Link>
          ))}
        </div>

        <section className="mt-24" aria-labelledby="glossar-heading">
          <h2
            id="glossar-heading"
            className="text-[clamp(1.6rem,3.5vw,2.5rem)] font-semibold tracking-[-0.02em]"
          >
            Technik-Glossar
          </h2>
          <p className="mt-3 max-w-2xl text-[16px] leading-[1.55] text-[#525257]">
            Die wichtigsten Begriffe rund um Smartphones und Reparatur, kurz
            erklärt.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {glossar.map((a) => (
              <Link
                key={a.slug}
                href={`/blog/${a.slug}`}
                className="rounded-2xl bg-white px-5 py-4 text-[14.5px] font-medium text-black ring-1 ring-black/[0.05] transition-colors hover:bg-[var(--color-accent)] hover:text-white"
              >
                {a.title.replace(/^Was ist (ein |eine |der |die |das )?/i, "").replace(/\?$/, "")}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
