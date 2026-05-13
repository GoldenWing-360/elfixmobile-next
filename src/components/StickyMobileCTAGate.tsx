"use client";

import { usePathname } from "@/i18n/navigation";
import { StickyMobileCTA } from "./StickyMobileCTA";

/**
 * Renders the StickyMobileCTA on every page except the ones that ARE the
 * primary action (booking, calculator, contact form). On those pages the
 * bar would be redundant with the page content and would steal vertical
 * space from the form.
 */
const HIDE_ON = ["/buchen", "/preisrechner", "/kontakt"] as const;

export function StickyMobileCTAGate() {
  const pathname = usePathname();
  if (HIDE_ON.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return null;
  }
  return <StickyMobileCTA />;
}
