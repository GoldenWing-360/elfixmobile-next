"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

// Cards now route to the per-brand SEO landing pages (/reparatur/<slug>)
// rather than straight to /preisrechner or /buchen. The landing page owns
// the brand context and forwards onwards to the right CTA from there.
const BRANDS = [
  { id: "apple",   href: "/reparatur/apple",   label: "Apple",   count: 97,  hasOnlinePrices: true,  bg: "from-zinc-900 to-zinc-800" },
  { id: "samsung", href: "/reparatur/samsung", label: "Samsung", count: 122, hasOnlinePrices: true,  bg: "from-blue-950 to-blue-900" },
  { id: "xiaomi",  href: "/reparatur/xiaomi",  label: "Xiaomi",  count: 60,  hasOnlinePrices: false, bg: "from-orange-950 to-orange-900" },
  { id: "google",  href: "/reparatur/google",  label: "Google",  count: 24,  hasOnlinePrices: false, bg: "from-sky-950 to-sky-900" },
  { id: "huawei",  href: "/reparatur/huawei",  label: "Huawei",  count: 38,  hasOnlinePrices: false, bg: "from-red-950 to-red-900" },
  { id: "oneplus", href: "/reparatur/oneplus", label: "OnePlus", count: 28,  hasOnlinePrices: false, bg: "from-red-900 to-zinc-900" },
  { id: "sony",    href: "/reparatur/sony",    label: "Sony",    count: 18,  hasOnlinePrices: false, bg: "from-slate-900 to-zinc-900" },
  { id: "nokia",   href: "/reparatur/nokia",   label: "Nokia",   count: 22,  hasOnlinePrices: false, bg: "from-blue-900 to-zinc-900" },
] as const;

export function BrandGallery() {
  const t = useTranslations("brands");
  const tCta = useTranslations()("brand_card_cta");
  const trackRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section
      id="brands"
      className="relative bg-[var(--color-bg-secondary)] text-[var(--color-text-dark)]"
    >
      <div className="mx-auto max-w-7xl px-6 pt-24 md:px-8 md:pt-36">
        <header className="max-w-3xl">
          <motion.p
            initial={{ opacity: 0.999, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0, margin: "200px 0px 200px 0px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-[12px] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]"
          >
            {t("eyebrow")}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0.999, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0, margin: "200px 0px 200px 0px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 text-[clamp(2rem,5vw,4.25rem)] font-semibold leading-[1.06] tracking-[-0.025em]"
          >
            {t("headline")}
          </motion.h2>
          <p className="mt-5 max-w-2xl text-[17px] leading-[1.55] text-[#525257]">
            {t("sub")}
          </p>
        </header>
      </div>

      <div
        ref={trackRef}
        className="scrollbar-none mt-10 flex w-full snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-24 md:mt-14 md:gap-6 md:px-8 md:pb-32"
        onMouseLeave={() => setHovered(null)}
      >
        {BRANDS.map((b, i) => {
          const isDimmed = hovered !== null && hovered !== b.id;
          return (
            <motion.div
              key={b.id}
              initial={{ opacity: 0.999, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0, margin: "200px 0px 200px 0px" }}
              transition={{
                delay: i * 0.04,
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
              onMouseEnter={() => setHovered(b.id)}
              className={cn(
                "relative shrink-0 snap-start",
                "w-[260px] sm:w-[300px] md:w-[340px]",
                // Dim-siblings hover effect: previously combined opacity +
                // scale-[0.96] + blur-[1px]. The blur softened the card
                // edges into a fuzzy halo, the sub-1.0 scale put them on a
                // sub-pixel grid which compounded with the blur. Now: pure
                // opacity only — no transform, no filter, edges stay sharp.
                "transition-opacity duration-300 ease-out",
                isDimmed ? "opacity-60" : "opacity-100",
              )}
            >
              <Link
                href={b.href}
                className={cn(
                  "block aspect-[4/5] overflow-hidden rounded-3xl",
                  "bg-gradient-to-br text-white",
                  "ring-1 ring-black/[0.06]",
                  "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_10px_30px_-12px_rgba(0,0,0,0.15)]",
                  "transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                  "hover:-translate-y-1",
                  b.bg
                )}
              >
                <div className="relative flex h-full flex-col justify-between p-7">
                  <div className="text-[12px] uppercase tracking-[0.22em] text-white/55">
                    {t.rich("models_count", { count: b.count })}
                  </div>
                  <div>
                    <div className="text-[36px] font-semibold tracking-[-0.02em]">
                      {b.label}
                    </div>
                    <div className="mt-3 inline-flex items-center gap-2 text-[13px] text-white/70">
                      <span>{b.hasOnlinePrices ? tCta : "Anfrage"}</span>
                      <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </div>
                  </div>
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.06] via-transparent to-transparent"
                  />
                </div>
              </Link>
            </motion.div>
          );
        })}
        <div aria-hidden className="w-2 shrink-0" />
      </div>
    </section>
  );
}
