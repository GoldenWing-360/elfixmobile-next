import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE } from "@/lib/seo";
import { BRANDS } from "@/data/brands";

const STATIC_PATHS = [
  "",
  "/preisrechner",
  "/buchen",
  "/kontakt",
  "/impressum",
  "/datenschutz",
  "/agb",
] as const;

const BRAND_PATHS = BRANDS.map((b) => `/reparatur/${b.slug}` as const);

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const out: MetadataRoute.Sitemap = [];

  const emit = (path: string, priority: number) => {
    for (const locale of routing.locales) {
      out.push({
        url: `${SITE.url}/${locale}${path}`,
        lastModified: now,
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => [l, `${SITE.url}/${l}${path}`]),
          ),
        },
      });
    }
  };

  for (const p of STATIC_PATHS) emit(p, p === "" ? 1 : 0.7);
  // Brand landing pages are SEO-critical (high-volume "iPhone Reparatur Wien"
  // style queries) so they sit one priority tier below the homepage.
  for (const p of BRAND_PATHS) emit(p, 0.9);

  return out;
}
