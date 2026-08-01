"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";

/**
 * Minimal DSGVO cookie-consent banner. Three states:
 *   - default: banner shown
 *   - accepted: localStorage `elfix-cookie-consent` = "accepted"
 *   - declined: localStorage = "declined"
 *
 * The site currently sets no marketing cookies. The banner exists so we
 * have an explicit consent path before plugging in GA/Plausible/Meta
 * Pixel later; the `accepted` flag becomes the gate for those scripts.
 *
 * Decision is persisted in localStorage rather than a cookie so it
 * survives across visits without itself becoming a tracking surface.
 */
const STORAGE_KEY = "elfix-cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only render the banner client-side after we've confirmed no prior
    // decision exists. Avoids SSR mismatch + a flash of "Akzeptieren" for
    // returning visitors who already decided.
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== "accepted" && stored !== "declined") {
        setVisible(true);
      }
    } catch {
      // localStorage blocked (Safari private mode) — show banner anyway.
      setVisible(true);
    }
  }, []);

  const decide = (value: "accepted" | "declined") => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // ignore — user can re-decide on next visit
    }
    // Notify the Analytics component so consent applies without reload.
    window.dispatchEvent(new CustomEvent("elfix-consent", { detail: value }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Cookie-Einstellungen"
      // Mobile: pin to the TOP so it doesn't cover the StickyMobileCTA
      // bar (which is the primary action surface). Desktop: bottom-pinned
      // as before — there's no competing element down there.
      className="fixed inset-x-3 top-[calc(env(safe-area-inset-top)+4rem)] z-[60] mx-auto max-w-3xl rounded-3xl border border-white/10 bg-black/95 p-5 text-white shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl md:inset-x-auto md:bottom-4 md:left-1/2 md:top-auto md:-translate-x-1/2"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
        <div className="flex-1 text-[14px] leading-[1.5] text-white/80">
          Wir nutzen ausschließlich technisch notwendige Cookies. Optionale
          Statistik-Cookies erst nach deiner Zustimmung. Details in der{" "}
          <Link href="/datenschutz" className="underline hover:text-white">
            Datenschutzerklärung
          </Link>
          .
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => decide("declined")}
            className="rounded-full border border-white/20 px-5 py-2 text-[14px] font-medium hover:bg-white/10"
          >
            Nur notwendige
          </button>
          <button
            type="button"
            onClick={() => decide("accepted")}
            className="rounded-full bg-white px-5 py-2 text-[14px] font-medium text-black hover:bg-white/90"
          >
            Alle akzeptieren
          </button>
        </div>
      </div>
    </div>
  );
}
