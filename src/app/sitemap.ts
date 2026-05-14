import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE } from "@/lib/seo";
import { BRANDS, allBrandModelPairs } from "@/data/brands";
import { SERVICES } from "@/data/services";
import { DISTRICTS } from "@/data/districts";

/**
 * Single-file sitemap. At 1000 URLs we're well under Google's 50k-per-file
 * limit, and the canonical /sitemap.xml URL is what external crawlers +
 * Search Console expect to find from robots.txt. We previously tried a
 * sitemap-index split via generateSitemaps but Next 16 doesn't auto-serve
 * the index at /sitemap.xml — the index pattern adds complexity without
 * a benefit at this scale. Revisit when we cross ~10k URLs.
 */

const STATIC_PATHS = [
  "",
  "/preisrechner",
  "/buchen",
  "/kontakt",
  "/ueber-uns",
  "/bewertungen",
  "/faq",
  "/impressum",
  "/datenschutz",
  "/agb",
] as const;

const BRAND_PATHS = BRANDS.map((b) => `/reparatur/${b.slug}` as const);
const BRAND_MODELS_INDEX_PATHS = BRANDS.filter((b) => b.hasOnlinePrices).map(
  (b) => `/reparatur/${b.slug}/modelle` as const,
);
const SERVICE_PATHS = SERVICES.map((s) => `/${s.slug}` as const);
const DISTRICT_PATHS = DISTRICTS.map((d) => `/${d.slug}` as const);
const MODEL_PATHS = allBrandModelPairs().map(
  (p) => `/reparatur/${p.brandSlug}/${p.modelSlug}` as const,
);

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
  // Brand/service hubs are SEO-critical (high-volume "X Reparatur Wien"
  // queries) so they sit one tier below the homepage. Districts a notch
  // below those, then model long-tail at 0.6.
  for (const p of BRAND_PATHS) emit(p, 0.9);
  for (const p of BRAND_MODELS_INDEX_PATHS) emit(p, 0.7);
  for (const p of SERVICE_PATHS) emit(p, 0.9);
  for (const p of DISTRICT_PATHS) emit(p, 0.85);
  for (const p of MODEL_PATHS) emit(p, 0.6);

  return out;
}
