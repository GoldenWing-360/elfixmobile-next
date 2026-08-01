import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SITE } from "@/lib/seo";
import { getAllArticles, getArticle, getGlossar, getRatgeber } from "@/lib/blog";

/**
 * Migrated WP article page. German-only content — prerendered for /de
 * exclusively, every other locale 404s (dynamicParams=false).
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllArticles().map((a) => ({ locale: "de", slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return {
    title: { absolute: article.metaTitle },
    description: article.metaDescription,
    alternates: {
      canonical: `${SITE.url}/de/blog/${article.slug}`,
    },
    openGraph: {
      type: "article",
      title: article.metaTitle,
      description: article.metaDescription,
      url: `${SITE.url}/de/blog/${article.slug}`,
      siteName: "EL Fix Mobile",
      publishedTime: article.date,
      modifiedTime: article.modified,
    },
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (locale !== "de") notFound();
  setRequestLocale(locale);

  const article = getArticle(slug);
  if (!article) notFound();

  const isGlossar = article.category === "glossar";
  // Topic-based related: rank same-category articles by word overlap in
  // title + focus keyword instead of taking the first four alphabetically.
  const tokenize = (s: string) =>
    new Set(
      s
        .toLowerCase()
        .replace(/[^a-zäöüß0-9 ]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 3),
    );
  const own = tokenize(`${article.title} ${article.focusKeyword}`);
  const related = (isGlossar ? getGlossar() : getRatgeber())
    .filter((a) => a.slug !== article.slug)
    .map((a) => {
      const words = tokenize(`${a.title} ${a.focusKeyword}`);
      let score = 0;
      for (const w of words) if (own.has(w)) score++;
      return { a, score };
    })
    .sort((x, y) => y.score - x.score)
    .slice(0, 4)
    .map((x) => x.a);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: article.title,
        description: article.metaDescription,
        datePublished: article.date,
        dateModified: article.modified,
        inLanguage: "de",
        mainEntityOfPage: `${SITE.url}/de/blog/${article.slug}`,
        image: `${SITE.url}/opengraph-image`,
        author: {
          "@type": "Person",
          name: SITE.owner,
          jobTitle: "Inhaberin",
          worksFor: { "@id": `${SITE.url}/#localbusiness` },
        },
        reviewedBy: { "@id": `${SITE.url}/#localbusiness` },
        publisher: {
          "@type": "Organization",
          name: SITE.legalName,
          logo: {
            "@type": "ImageObject",
            url: `${SITE.url}/logo-512.png`,
          },
        },
      },
      // Glossary entries double as DefinedTerm so answer engines can
      // treat them as term definitions, not just blog posts.
      ...(isGlossar
        ? [
            {
              "@type": "DefinedTerm",
              name: article.title.replace(/^Was ist (ein |eine |der |die |das )?/i, "").replace(/\?$/, ""),
              description: article.metaDescription,
              url: `${SITE.url}/de/blog/${article.slug}`,
              inDefinedTermSet: {
                "@type": "DefinedTermSet",
                name: "EL Fix Mobile Technik-Glossar",
                url: `${SITE.url}/de/blog`,
              },
            },
          ]
        : []),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "EL Fix Mobile", item: `${SITE.url}/de` },
          { "@type": "ListItem", position: 2, name: "Ratgeber", item: `${SITE.url}/de/blog` },
          { "@type": "ListItem", position: 3, name: article.title },
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
      <article className="mx-auto max-w-3xl px-6 pb-24 pt-32 md:px-8 md:pb-32 md:pt-44">
        <nav aria-label="Breadcrumb" className="text-[13px] text-[#6e6e73]">
          <Link href="/blog" className="hover:text-[var(--color-accent)]">
            Ratgeber
          </Link>
          <span aria-hidden> / </span>
          <span>{isGlossar ? "Glossar" : "Artikel"}</span>
        </nav>
        <h1 className="mt-4 t-h2">
          {article.title}
        </h1>
        <p className="mt-4 text-[14px] text-[#6e6e73]">
          <time dateTime={article.modified}>
            Aktualisiert am{" "}
            {new Date(article.modified).toLocaleDateString("de-AT", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </time>{" "}
          · EL Fix Mobile Wien
        </p>

        <div
          className="blog-prose mt-10"
          dangerouslySetInnerHTML={{ __html: article.html }}
        />

        {/* E-E-A-T author box: real workshop, real certifications */}
        <aside className="mt-12 flex items-start gap-4 rounded-2xl bg-white p-6 ring-1 ring-black/[0.05]">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-[15px] font-semibold text-white">
            EL
          </div>
          <div className="text-[14px] leading-[1.55] text-[#525257]">
            <p className="font-semibold text-black">
              Geprüft vom Werkstatt-Team von EL Fix Mobile
            </p>
            <p className="mt-1">
              Apple Authorized Service Provider · Samsung zertifizierter
              Reparaturpartner · Partnerbetrieb Wiener Reparaturbon. Seit 2019
              in der Seestadt Aspern, über 294 Google-Bewertungen.
            </p>
          </div>
        </aside>

        {/* Conversion block */}
        <aside className="mt-14 rounded-3xl bg-black p-8 text-white md:p-10">
          <h2 className="text-[22px] font-semibold tracking-[-0.01em] md:text-[26px]">
            Reparatur nötig? Wir sind in Wien 1220 für dich da.
          </h2>
          <p className="mt-3 max-w-2xl text-[16px] leading-[1.55] text-white/70">
            Kostenlose Diagnose, Festpreis vor der Reparatur, Express in 30
            Minuten. Mo–Sa 9–19 Uhr geöffnet.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/preisrechner"
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-6 py-3.5 text-[15px] font-medium text-white transition-transform hover:scale-[1.02]"
            >
              Preis berechnen
            </Link>
            <Link
              href="/buchen"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-white/10"
            >
              Termin buchen
            </Link>
          </div>
        </aside>

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="text-[20px] font-semibold tracking-[-0.01em]">
              {isGlossar ? "Weitere Begriffe" : "Weitere Artikel"}
            </h2>
            <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {related.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/blog/${a.slug}`}
                    className="block rounded-2xl bg-white px-5 py-4 text-[15px] font-medium text-black ring-1 ring-black/[0.05] transition-colors hover:bg-[var(--color-accent)] hover:text-white"
                  >
                    {a.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </div>
  );
}
