import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";
import { getAllArticles, getArticle } from "@/lib/blog";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return getAllArticles().map((a) => ({ locale: "de", slug: a.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  return renderOg({
    eyebrow:
      article?.category === "glossar"
        ? "TECHNIK-GLOSSAR · EL FIX MOBILE WIEN"
        : "RATGEBER · EL FIX MOBILE WIEN",
    primary: article?.title ?? "Ratgeber",
  });
}
