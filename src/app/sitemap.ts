import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE } from "@/lib/seo";

const PATHS = [
  "",
  "/preisrechner",
  "/buchen",
  "/kontakt",
  "/impressum",
  "/datenschutz",
  "/agb",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const out: MetadataRoute.Sitemap = [];
  for (const path of PATHS) {
    for (const locale of routing.locales) {
      const prefix =
        locale === routing.defaultLocale && routing.localePrefix === "as-needed"
          ? ""
          : `/${locale}`;
      const url = `${SITE.url}${prefix}${path}` || `${SITE.url}/`;
      out.push({
        url,
        lastModified: now,
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority: path === "" ? 1 : 0.7,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => {
              const lp =
                l === routing.defaultLocale && routing.localePrefix === "as-needed"
                  ? ""
                  : `/${l}`;
              return [l, `${SITE.url}${lp}${path}` || `${SITE.url}/`];
            }),
          ),
        },
      });
    }
  }
  return out;
}
