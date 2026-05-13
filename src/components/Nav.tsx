"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Menu, X } from "lucide-react";

export function Nav() {
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const links = [
    { href: "/preisrechner", label: t("pricing") },
    { href: "/buchen", label: t("booking") },
    { href: "/kontakt", label: t("contact") },
  ] as const;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled || mobileOpen
            ? "glass-nav"
            : "bg-transparent border-b border-transparent"
        )}
      >
        <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 md:h-16 md:px-8">
          <Link href="/" className="flex items-center" aria-label="EL Fix Mobile - Startseite">
            <Image
              src="/logo-light.svg"
              alt="EL Fix Mobile"
              width={140}
              height={42}
              priority
              className="h-8 w-auto md:h-9"
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

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? t("close") : t("menu")}
              aria-expanded={mobileOpen}
              className="grid h-9 w-9 place-items-center rounded-full md:hidden bg-white/5 border border-white/10"
            >
              {mobileOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl md:hidden"
          >
            <ul className="mx-auto flex h-full max-w-7xl flex-col items-start justify-center gap-6 px-8 pt-16">
              {links.map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ opacity: 0.999, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={l.href}
                    className="text-[40px] leading-none font-semibold tracking-tight"
                    onClick={() => setMobileOpen(false)}
                  >
                    {l.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
