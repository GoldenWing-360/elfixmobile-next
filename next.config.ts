import type { NextConfig } from "next";
import path from "node:path";
import createNextIntlPlugin from "next-intl/plugin";

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
      { source: "/", destination: "/de", permanent: false },
      ...TOP.map((p) => ({
        source: p,
        destination: `/de${p}`,
        permanent: false,
      })),
      // /reparatur/<brand>/<model> deep links
      { source: "/reparatur/:rest*", destination: "/de/reparatur/:rest*", permanent: false },
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
        "handy-reparatur-aspern-seestadt",
        "handy-reparatur-donaustadt",
        "handy-reparatur-floridsdorf",
        "handy-reparatur-gaenserndorf-niederoesterreich",
      ].map((s) => ({
        source: `/${s}`,
        destination: `/de/${s}`,
        permanent: false,
      })),
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
