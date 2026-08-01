import type { NextConfig } from "next";
import path from "node:path";
import createNextIntlPlugin from "next-intl/plugin";
import blogRedirects from "./src/data/blog/redirects.json";
import wpPageRedirects from "./src/data/blog/wp-page-redirects.json";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Pin Turbopack root to this project so the multi-lockfile inference warning goes away.
  turbopack: {
    root: path.resolve(import.meta.dirname),
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "www.elfixmobile.at" },
    ],
  },
  async redirects() {
    // Without the next-intl proxy (incompatible with OpenNext CF), any
    // unprefixed path 404s. Components now render locale-prefixed URLs,
    // but direct-typed URLs ("Mr.X copy-pastes /buchen from a sticker")
    // still need to land somewhere. We catch every top-level static
    // route + the dynamic-route prefixes and forward to /de.
    //
    // Brand and service dynamic slugs are too broad to list, so the
    // catch-all at the bottom handles them. Catch-all uses the
    // "missing locale" regex pattern: any path that doesn't start with
    // one of the supported locale codes gets redirected to /de/<path>.
    const TOP = [
      "/preisrechner",
      "/buchen",
      "/kontakt",
      "/ueber-uns",
      "/bewertungen",
      "/faq",
      "/impressum",
      "/datenschutz",
      "/agb",
    ];
    return [
      // Host canonicalization: apex + the old test domains all 308 to
      // the canonical www host. Runs inside the Worker (the API token
      // lacks permission for CF Redirect Rules, and legacy Page Rules
      // never fire on Workers custom domains).
      // NOTE: has.value is an UNANCHORED regex — "elfixmobile.at" would
      // also match "www.elfixmobile.at" and loop the whole site. Anchor
      // and escape every host explicitly.
      ...[
        "^elfixmobile\\.at$",
        "^bersaev\\.com$",
        "^www\\.bersaev\\.com$",
        "^elfixmobile-next\\.deni-4b0\\.workers\\.dev$",
      ].map((host) => ({
        source: "/:path*",
        has: [{ type: "host" as const, value: host }],
        destination: "https://www.elfixmobile.at/:path*",
        permanent: true,
      })),
      // Old WP sitemap URLs Google still requests — point them at the
      // single Next sitemap so Search Console doesn't error out.
      { source: "/sitemap_index.xml", destination: "/sitemap.xml", permanent: true },
      { source: "/post-sitemap.xml", destination: "/sitemap.xml", permanent: true },
      { source: "/page-sitemap.xml", destination: "/sitemap.xml", permanent: true },
      { source: "/", destination: "/de", permanent: false /* locale pick, keep 302 */ },
      ...TOP.map((p) => ({
        source: p,
        destination: `/de${p}`,
        permanent: true,
      })),
      // /reparatur/<brand>/<model> deep links. The bare path needs its
      // own rule — Next interpolates a literal ":rest*" into the
      // destination when the catch-all matches zero segments.
      { source: "/reparatur", destination: "/de/reparatur", permanent: true },
      { source: "/reparatur/:rest+", destination: "/de/reparatur/:rest+", permanent: true },
      // /status/<id>?t=<token> share links
      { source: "/status/:rest*", destination: "/de/status/:rest*", permanent: false },
      // Service- and district-slugs are leaf URLs (no sub-segments),
      // each rendered into one redirect entry below.
      ...[
        "display-reparatur-wien",
        "akku-tausch-wien",
        "datenrettung-handy-wien",
        "wasserschaden-handy-reparatur-wien",
        "handy-entsperren-wien",
        "handy-folierung-wien",
        "kamera-reparatur-handy-wien",
        "tablet-reparatur-wien",
        "notebook-reparatur-wien",
        "macbook-reparatur-wien",
        "ipad-reparatur-wien",
        "ladebuchse-reparatur-wien",
        "handy-reparatur-aspern-seestadt",
        "handy-reparatur-donaustadt",
        "handy-reparatur-floridsdorf",
        "handy-reparatur-gaenserndorf-niederoesterreich",
      ].map((s) => ({
        source: `/${s}`,
        destination: `/de/${s}`,
        permanent: true,
      })),
      // Migrated WP blog posts + glossary lived at root level on the old
      // site — forward the exact slugs so a domain cutover keeps their
      // rankings. The 4 old iphone-13-* device posts point at the richer
      // model pages instead of the blog.
      ...Object.entries(blogRedirects as Record<string, string>).map(
        ([slug, destination]) => ({
          source: `/${slug}`,
          destination,
          permanent: true,
        }),
      ),
      // Remaining WP page slugs (brand hubs, old service/landing pages)
      // mapped to their closest Next equivalent for the domain cutover.
      ...Object.entries(wpPageRedirects as Record<string, string>).map(
        ([slug, destination]) => ({
          source: `/${slug}`,
          destination,
          permanent: true,
        }),
      ),
    ];
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@phosphor-icons/react",
      "framer-motion",
    ],
  },
};

export default withNextIntl(nextConfig);
