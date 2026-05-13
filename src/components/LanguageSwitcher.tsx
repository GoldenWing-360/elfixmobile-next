"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/cn";
import { Globe } from "lucide-react";

const FLAGS: Record<string, string> = {
  de: "🇦🇹",
  en: "🇬🇧",
  ru: "🇷🇺",
  tr: "🇹🇷",
};

export function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const locale = useLocale();
  const t = useTranslations("lang");
  const pathname = usePathname();
  const router = useRouter();

  const switchTo = (next: (typeof routing.locales)[number]) => {
    router.replace(pathname, { locale: next });
    setOpen(false);
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className={cn(
          "inline-flex items-center gap-2 rounded-full",
          "px-3.5 py-2 text-[13px] font-medium",
          "bg-white/5 border border-white/10 backdrop-blur-md",
          "hover:bg-white/10 transition-colors duration-200"
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Globe className="h-3.5 w-3.5 opacity-70" />
        <span className="uppercase tracking-wider">{locale}</span>
      </button>

      {open && (
        <div
          role="listbox"
          className={cn(
            "absolute right-0 top-full pt-2",
            "min-w-[180px]"
          )}
        >
          <div
            className={cn(
              "rounded-2xl overflow-hidden",
              "bg-black/80 backdrop-blur-xl border border-white/10",
              "shadow-2xl shadow-black/40"
            )}
          >
            {routing.locales.map((l) => (
              <button
                key={l}
                type="button"
                role="option"
                aria-selected={l === locale}
                onClick={() => switchTo(l)}
                className={cn(
                  "flex w-full items-center justify-between gap-3",
                  "px-4 py-2.5 text-[14px]",
                  "transition-colors duration-150",
                  l === locale
                    ? "text-white bg-white/5"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <span className="flex items-center gap-2.5">
                  <span aria-hidden className="text-base">
                    {FLAGS[l]}
                  </span>
                  <span>{t(l)}</span>
                </span>
                {l === locale && (
                  <span className="text-[var(--color-accent)] text-xs">●</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
