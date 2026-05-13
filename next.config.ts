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
    return [
      // Root → default locale. We use localePrefix: "always" and dropped the
      // next-intl proxy (Next 16 Node-middleware is incompatible with OpenNext
      // for Cloudflare), so "/" has no page; redirect it here.
      { source: "/", destination: "/de", permanent: false },
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
