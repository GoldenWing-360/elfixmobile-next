"use client";

import { useEffect, useState } from "react";
import { usePathname } from "@/i18n/navigation";

/**
 * Single source of truth for "is this a chromeless route". Admin pages
 * strip the entire customer-facing chrome (nav, footer, whatsapp float,
 * cookie banner) — having a "Reparatur jetzt buchen" bar above the
 * leads-list is a hausverstand fail.
 *
 * Status routes do the same. They're personal-status pages, the cookie
 * banner + sticky CTA on top would clutter them.
 *
 * Implementation note: SSR renders the chrome (we can't easily get the
 * pathname server-side without bouncing through headers/middleware). On
 * mount the client checks the pathname and hides the chrome if it
 * matches. To prevent a flash of chrome on chromeless pages we use a
 * pre-hydration script in the body that toggles a data attribute, and
 * a CSS rule hides children of <ChromeGate> when that attribute is set.
 *
 * For a stricter approach (no SSR chrome at all on admin/status routes)
 * we'd need a separate route group or middleware. The flash on initial
 * paint is acceptable for /admin and /status which are gated/private.
 */
const NO_CHROME = ["/admin", "/status"] as const;

function shouldHide(pathname: string): boolean {
  return NO_CHROME.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Initialise from the pathname so SSR and the first client render agree.
  // Without this the SSR markup renders chrome on /admin too, and we get a
  // visible flash before the effect hides it.
  const [hide, setHide] = useState(() => shouldHide(pathname));

  useEffect(() => {
    setHide(shouldHide(pathname));
  }, [pathname]);

  if (hide) return null;
  return <>{children}</>;
}
