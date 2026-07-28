"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Menu, X, Truck } from "lucide-react";

export function Nav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while menu is open + close on ESC. The previous version
  // only handled the scroll lock; tapping the OS back button or hitting Esc
  // on an external keyboard left the menu open.
  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  // Auto-close on route change. Without this, tapping a primary link
  // navigates to the new page but the next-intl Link doesn't unmount the
  // overlay, leaving it sitting on top of the destination page.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // "Reparatur" is the new entry — funnels users into the 8-brand hub
  // (/reparatur/apple, ...) that previously was only discoverable via the
  // home gallery or footer. Crucially also a strong SEO internal-link.
  const links = [
    { href: "/reparatur", label: t("repair") },
    { href: "/preisrechner", label: t("pricing") },
    { href: "/buchen", label: t("booking") },
    { href: "/kontakt", label: t("contact") },
  ] as const;

  // Mobile-only secondary links. Real routes for /bewertungen, /faq and
  // /ueber-uns (they exist now). "Services" + "Standort" still scroll to
  // home anchors because they're sections, not pages.
  const isHome = pathname === "/";
  const mobileExtras: ReadonlyArray<{ href: string; label: string; isRoute?: boolean }> = [
    { href: "/ueber-uns", label: "Über uns", isRoute: true },
    { href: "/bewertungen", label: "Bewertungen", isRoute: true },
    { href: "/faq", label: "FAQ", isRoute: true },
    { href: isHome ? "#services" : "/#services", label: t("services") },
    { href: isHome ? "#location" : "/#location", label: "Standort" },
  ];

  return (
    <>
      {/* Nav uses glass-nav unconditionally. The previous transparent state
       * relied on a dark hero behind it and went invisible on light pages
       * (white logo + white text on the near-white --color-bg-secondary).
       * The dark backdrop blur reads on both dark and light backgrounds. */}
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300 glass-nav",
          scrolled && "shadow-[0_4px_30px_rgba(0,0,0,0.15)]",
        )}
      >
        <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 md:h-20 md:px-8">
          <Link
            href="/"
            className="flex items-center"
            aria-label="EL Fix Mobile - Startseite"
            onClick={() => setMobileOpen(false)}
          >
            <Image
              src="/logo-light.svg"
              alt="EL Fix Mobile"
              width={200}
              height={60}
              priority
              // Mobile logo dropped from h-11 to h-9 — at h-11 it ate ~70%
              // of a 64px header and pushed the language switcher + burger
              // tight against the screen edge on 360-375px viewports.
              className="h-9 w-auto md:h-14"
            />
          </Link>

          <ul className="hidden items-center gap-7 md:flex">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-[14px] text-white/75 hover:text-white transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1.5 md:gap-3">
            {/* Pickup CTA replaces the standalone PickupBanner section -
             * always visible in the header so the gratis-Abholung offer
             * follows the user across the whole site. Green accent so it
             * pops on the dark glass nav without competing with the
             * primary CTAs in the hero. Desktop-only; mobile gets it in
             * the menu sheet instead. */}
            <Link
              href={{ pathname: "/buchen", query: { service: "pickup" } }}
              className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-[var(--color-success)] px-4 py-2 text-[13px] font-medium text-black transition-all hover:brightness-95"
            >
              <Truck className="h-3.5 w-3.5" strokeWidth={2} />
              {t("pickup_cta")}
            </Link>
            <LanguageSwitcher />
            {/* Mobile menu button — bumped to 44x44 (Apple HIG touch
             * target). The previous 36x36 was below the recommended
             * minimum and missed taps on the corners. */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? t("close") : t("menu")}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 transition-colors hover:bg-white/10 md:hidden"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label={t("menu")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            // z-40 keeps the overlay UNDER the fixed header (z-50) so the
            // close-X button stays reachable. pt aligns content under the
            // mobile header height (h-14 = 56px).
            className="fixed inset-0 z-40 overflow-y-auto bg-black/95 backdrop-blur-xl md:hidden"
          >
            <div className="mx-auto flex min-h-full max-w-7xl flex-col gap-8 px-6 pb-12 pt-20">
              <ul className="flex flex-col items-start gap-4">
                {links.map((l, i) => (
                  <motion.li
                    key={l.href}
                    initial={{ opacity: 0.999, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.05 * i,
                      duration: 0.4,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <Link
                      href={l.href}
                      className="t-h2 leading-tight tracking-tight"
                      onClick={() => setMobileOpen(false)}
                    >
                      {l.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <ul className="flex flex-col items-start gap-3 border-t border-white/10 pt-7">
                {mobileExtras.map((l, i) => {
                  const linkClass =
                    "block py-1.5 text-[18px] font-medium tracking-tight text-white/70 hover:text-white";
                  return (
                    <motion.li
                      key={l.href}
                      initial={{ opacity: 0.999, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.05 * (i + links.length),
                        duration: 0.4,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      {l.isRoute ? (
                        <Link
                          href={l.href}
                          className={linkClass}
                          onClick={() => setMobileOpen(false)}
                        >
                          {l.label}
                        </Link>
                      ) : (
                        <a
                          href={l.href}
                          className={linkClass}
                          onClick={() => setMobileOpen(false)}
                        >
                          {l.label}
                        </a>
                      )}
                    </motion.li>
                  );
                })}
              </ul>
              {/* Contact shortcut row: pickup CTA + tap-to-call + WhatsApp
               * at the bottom of the menu so the primary action is always
               * one tap away even on long brand-list pages. */}
              <div className="mt-auto flex flex-wrap gap-3 pt-6 text-[14px]">
                <Link
                  href={{ pathname: "/buchen", query: { service: "pickup" } }}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--color-success)] px-5 py-3 font-medium text-black"
                  onClick={() => setMobileOpen(false)}
                >
                  <Truck className="h-4 w-4" strokeWidth={2} />
                  {t("pickup_cta")}
                </Link>
                <a
                  href="tel:+436606071414"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-medium text-black"
                  onClick={() => setMobileOpen(false)}
                >
                  +43 660 6071414
                </a>
                <a
                  href="https://wa.me/436606071414"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 font-medium text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
