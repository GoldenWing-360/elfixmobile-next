"use client";

import { Phone, MessageCircle, Calendar } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

interface Props {
  /**
   * URL passed to the "Buchen" tap. Brand pages forward brand context,
   * model pages forward model context — keeps the booking flow honest
   * about where the user came from.
   */
  bookHref?: string | { pathname: string; query?: Record<string, string> };
  /** Optional class on the outer wrapper for safe-area padding tweaks */
  className?: string;
}

/**
 * Fixed bottom-pinned action bar shown on mobile only. Pinned ABOVE the
 * iOS home-indicator via safe-area-inset-bottom. Sits between mobile nav
 * and the page, never on the homepage hero where it'd compete with the
 * primary call-to-action.
 *
 * Three actions: tap-to-call, WhatsApp, book. Phone numbers are hardcoded
 * because there's no scenario where they'd differ per page — single shop.
 */
export function StickyMobileCTA({ bookHref = "/buchen", className }: Props) {
  return (
    <div
      role="region"
      aria-label="Schnellkontakt"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 md:hidden",
        "bg-black/90 backdrop-blur-xl border-t border-white/10",
        "pb-[max(0.5rem,env(safe-area-inset-bottom))]",
        className,
      )}
    >
      <div className="mx-auto flex max-w-7xl items-stretch gap-1.5 px-3 pt-2">
        <a
          href="tel:+436606071414"
          className="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl bg-white/[0.04] py-2.5 text-white transition-colors hover:bg-white/[0.08]"
          aria-label="Anrufen +43 660 6071414"
        >
          <Phone className="h-5 w-5" />
          <span className="text-[11px] font-medium tracking-tight">Anrufen</span>
        </a>
        <a
          href="https://wa.me/436606071414"
          className="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl bg-[#25D366]/[0.12] py-2.5 text-[#25D366] transition-colors hover:bg-[#25D366]/[0.18]"
          aria-label="WhatsApp"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="text-[11px] font-medium tracking-tight">WhatsApp</span>
        </a>
        <Link
          href={bookHref}
          className="flex flex-[1.4] flex-col items-center justify-center gap-0.5 rounded-2xl bg-[var(--color-accent)] py-2.5 text-white transition-colors hover:bg-[var(--color-accent-hover)]"
          aria-label="Reparatur buchen"
        >
          <Calendar className="h-5 w-5" />
          <span className="text-[11px] font-semibold tracking-tight">
            Reparatur buchen
          </span>
        </Link>
      </div>
    </div>
  );
}
