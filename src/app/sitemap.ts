import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE } from "@/lib/seo";
import { BRANDS } from "@/data/brands";
import { SERVICES } from "@/data/services";

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
const SERVICE_PATHS = SERVICES.map((s) => `/${s.slug}` as const);

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
  // Brand landing pages target high-volume "iPhone Reparatur Wien" style
  // queries; service-routes target "Display Reparatur Wien" style queries.
  // Both sit one tier below the homepage.
  for (const p of BRAND_PATHS) emit(p, 0.9);
  for (const p of SERVICE_PATHS) emit(p, 0.9);

  return out;
}
