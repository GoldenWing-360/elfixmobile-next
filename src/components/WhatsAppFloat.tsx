"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/cn";

const WA_HREF =
  "https://wa.me/436606071414?text=" +
  encodeURIComponent(
    "Hi! Ich brauche eine Reparatur für mein Handy, bitte um Rückruf.",
  );

export function WhatsAppFloat() {
  const [visible, setVisible] = useState(false);

  // Show after 600ms so it doesn't compete with hero entrance
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <aside aria-label="Quick contact">
      <a
        href={WA_HREF}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp Chat mit EL Fix Mobile"
        className={cn(
          // Mobile uses the StickyMobileCTA bar at the bottom for WA + call;
          // the floating bubble is desktop-only to avoid stacking two
          // bottom-pinned elements on top of each other on small screens.
          "fixed bottom-5 right-5 z-50 hidden md:inline-flex",
          "h-14 w-14 items-center justify-center",
          "rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_-6px_rgba(37,211,102,0.5)]",
          "ring-1 ring-black/[0.08]",
          "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          "hover:scale-110 hover:shadow-[0_12px_32px_-6px_rgba(37,211,102,0.6)]",
          "md:bottom-7 md:right-7",
          visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
        )}
      >
        <MessageCircle className="h-6 w-6" strokeWidth={2} />
        <span
          aria-hidden
          className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366] opacity-30"
          style={{ animationDuration: "2.4s" }}
        />
      </a>
    </aside>
  );
}
