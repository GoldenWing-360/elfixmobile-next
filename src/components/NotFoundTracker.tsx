"use client";

import { useEffect } from "react";
import { track } from "@/lib/track";

/**
 * Fires a GA4 event whenever the 404 page renders, carrying the broken
 * path and the referrer — so dead links (internal, external backlinks,
 * old bookmarks) surface as a filterable report instead of hiding
 * inside anonymous page_views.
 */
export function NotFoundTracker() {
  useEffect(() => {
    track("page_not_found", {
      page_location: window.location.href,
      page_path: window.location.pathname,
      page_referrer: document.referrer || "(direct)",
    });
  }, []);
  return null;
}
