"use client";

import { usePathname } from "@/i18n/navigation";
import { StickyMobileCTA } from "./StickyMobileCTA";

/**
 * Renders the StickyMobileCTA on every page except the ones that ARE the
 * primary action (booking, calculator, contact form) or admin routes
 * (where the customer-facing CTA would be nonsensical above the admin
 * panel).
 */
const HIDE_ON = ["/buchen", "/preisrechner", "/kontakt", "/admin", "/status"] as const;

export function StickyMobileCTAGate() {
  const pathname = usePathname();
  if (HIDE_ON.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return null;
  }
  return <StickyMobileCTA />;
}
