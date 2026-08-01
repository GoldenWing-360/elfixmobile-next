/**
 * Thin GA4 event helper. No-ops when gtag isn't loaded (GA4 id unset,
 * script blocked, SSR) so call sites never need to guard.
 */
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function track(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", event, params);
}
