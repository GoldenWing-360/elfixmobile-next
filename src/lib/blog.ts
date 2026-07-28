import articlesJson from "@/data/blog/articles.json";

/**
 * Blog content migrated from the WP site (elfixmobile.at) on 2026-07-28.
 * German-only — the articles render exclusively under /de/blog. The JSON
 * is bundled at build time and only touched during SSG, so its size never
 * reaches the client.
 */

export interface BlogArticle {
  slug: string;
  title: string;
  category: "ratgeber" | "glossar";
  date: string;
  modified: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  excerpt: string;
  html: string;
}

const articles = articlesJson as BlogArticle[];

export function getAllArticles(): BlogArticle[] {
  return articles;
}

export function getArticle(slug: string): BlogArticle | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getRatgeber(): BlogArticle[] {
  return articles
    .filter((a) => a.category === "ratgeber")
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getGlossar(): BlogArticle[] {
  return articles
    .filter((a) => a.category === "glossar")
    .sort((a, b) => a.title.localeCompare(b.title, "de"));
}
