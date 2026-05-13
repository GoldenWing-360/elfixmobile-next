import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["de", "en", "ru", "tr"] as const,
  defaultLocale: "de",
  // "always" prefixes every locale (including /de). We dropped the next-intl
  // proxy because OpenNext for Cloudflare doesn't support Next 16 Node-only
  // middleware yet; without runtime URL rewriting the bare "/" needs a
  // redirect, configured in next.config.ts.
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
