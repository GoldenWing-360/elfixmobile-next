"use client";

import { useEffect } from "react";

/**
 * GA4 with Consent Mode v2, gated by the CookieBanner decision.
 *
 * - Inert unless NEXT_PUBLIC_GA4_ID is set (build-time env).
 * - Default consent: everything denied → gtag sends cookieless pings
 *   only (Google models the rest). DSGVO-fine without interaction.
 * - "Alle akzeptieren" (localStorage elfix-cookie-consent=accepted or
 *   the elfix-consent CustomEvent from the banner) upgrades
 *   analytics_storage to granted. Ad signals stay denied — we run no
 *   ads pixels.
 * - Conversion events: every tel:/wa.me click sitewide via one
 *   delegated listener; lead submits fire from the forms via track().
 */
const GA_ID = process.env.NEXT_PUBLIC_GA4_ID;
const STORAGE_KEY = "elfix-cookie-consent";

export function Analytics() {
  useEffect(() => {
    if (!GA_ID) return;

    window.dataLayer = window.dataLayer || [];
    function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    }
    window.gtag = gtag as typeof window.gtag;

    gtag("consent", "default", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
      wait_for_update: 500,
    });
    gtag("js", new Date());
    gtag("config", GA_ID, { anonymize_ip: true });

    const applyConsent = (value: string | null) => {
      if (value === "accepted") {
        gtag("consent", "update", { analytics_storage: "granted" });
      }
    };
    try {
      applyConsent(localStorage.getItem(STORAGE_KEY));
    } catch {
      /* private mode — stay denied */
    }
    const onConsent = (e: Event) =>
      applyConsent((e as CustomEvent<string>).detail);
    window.addEventListener("elfix-consent", onConsent);

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);

    // One delegated listener catches every phone / WhatsApp conversion
    // sitewide (nav, hero, FAQ CTAs, mobile dock, floating button).
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.("a[href]");
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      if (href.startsWith("tel:")) {
        window.gtag?.("event", "phone_call_click", { link_url: href });
      } else if (href.includes("wa.me")) {
        window.gtag?.("event", "whatsapp_click", { link_url: href });
      }
    };
    document.addEventListener("click", onClick, { capture: true });

    return () => {
      window.removeEventListener("elfix-consent", onConsent);
      document.removeEventListener("click", onClick, { capture: true });
    };
  }, []);

  return null;
}
