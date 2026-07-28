"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

// All cards share the same dark background — the brand mark IS the
// differentiator. Previous design used 8 different gradient pairs
// (zinc, blue-950, orange-950, ...) which felt noisy and amateur.
// Apple's BrandShowcase idiom uses one consistent surface, brand
// identity comes from the logo alone.
const CARD_BG = "from-zinc-900 to-[#0a0a0c]";
const BRANDS = [
  { id: "apple",   href: "/reparatur/apple",   label: "Apple",   count: 97,  hasOnlinePrices: true  },
  { id: "samsung", href: "/reparatur/samsung", label: "Samsung", count: 122, hasOnlinePrices: true  },
  { id: "xiaomi",  href: "/reparatur/xiaomi",  label: "Xiaomi",  count: 60,  hasOnlinePrices: false },
  { id: "google",  href: "/reparatur/google",  label: "Google",  count: 24,  hasOnlinePrices: false },
  { id: "huawei",  href: "/reparatur/huawei",  label: "Huawei",  count: 38,  hasOnlinePrices: false },
  { id: "oneplus", href: "/reparatur/oneplus", label: "OnePlus", count: 28,  hasOnlinePrices: false },
  { id: "sony",    href: "/reparatur/sony",    label: "Sony",    count: 18,  hasOnlinePrices: false },
  { id: "nokia",   href: "/reparatur/nokia",   label: "Nokia",   count: 22,  hasOnlinePrices: false },
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
            className="mt-4 t-h1"
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
        className="scrollbar-none mt-10 flex w-full snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-24 pt-3 md:mt-14 md:gap-6 md:px-8 md:pb-32 md:pt-4"
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
                  "ring-1 ring-white/[0.06]",
                  "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_10px_30px_-12px_rgba(0,0,0,0.15)]",
                  "transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                  "hover:-translate-y-1",
                  CARD_BG,
                )}
              >
                <div className="relative flex h-full flex-col justify-between p-7">
                  <div className="text-[12px] uppercase tracking-[0.22em] text-white/55">
                    {t.rich("models_count", { count: b.count })}
                  </div>

                  {/* Brand mark — simple-icons SVG inverted to white via
                   * CSS filter. Centered in the card vertically between
                   * the count and the label. opacity-90 prevents the
                   * mark from competing too hard with the H3 label. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/brands/${b.id}.svg`}
                    alt=""
                    aria-hidden
                    className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 opacity-90 [filter:brightness(0)_invert(1)] md:h-20 md:w-20"
                  />

                  <div className="relative">
                    <div className="text-[28px] font-semibold tracking-[-0.02em] md:text-[32px]">
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
