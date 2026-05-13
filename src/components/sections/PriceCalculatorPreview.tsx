"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@/components/Button";
import { ArrowRight, Check } from "lucide-react";
import pricing from "@/data/pricing.json";
import { cn } from "@/lib/cn";

const FEATURED = [
  { brand: "apple-iphone", model: "iPhone 16 Pro Max", repair: "display" as const, label_repair: "Display" },
  { brand: "samsung-galaxy", model: "Galaxy S25 Ultra", repair: "display" as const, label_repair: "Display" },
  { brand: "apple-ipad", model: "Pro 11 (2025)", repair: "battery" as const, label_repair: "Akku" },
] as const;

type PriceModel = { name: string; prices: Record<string, number> };
type PriceBrand = { models: PriceModel[] };

function findPrice(brandId: string, modelName: string, slug: string): number | null {
  const brands = pricing.brands as unknown as Record<string, PriceBrand>;
  const brand = brands[brandId];
  if (!brand) return null;
  const m = brand.models.find((x) => x.name === modelName);
  if (!m) return null;
  return m.prices[slug] ?? null;
}

export function PriceCalculatorPreview() {
  const t = useTranslations("calc");
  const tDisclaimer = useTranslations()("calc_preview_disclaimer");
  const [activeIdx, setActiveIdx] = useState(0);
  const active = FEATURED[activeIdx];
  const price = findPrice(active.brand, active.model, active.repair);

  return (
    <section
      id="calc"
      className="relative bg-[var(--color-bg-secondary)] text-[var(--color-text-dark)]"
    >
      <div className="mx-auto max-w-7xl px-6 py-24 md:px-8 md:py-36 lg:py-44">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-10">
          {/* Left: copy */}
          <header className="md:col-span-5">
            <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
              {t("eyebrow")}
            </p>
            <h2 className="mt-4 text-[clamp(2rem,5vw,4.25rem)] font-semibold leading-[1.06] tracking-[-0.025em]">
              {t("headline")}
            </h2>
            <p className="mt-5 max-w-md text-[17px] leading-[1.55] text-[#525257]">
              {t("sub")}
            </p>
            <div className="mt-8">
              <Button href="/preisrechner" variant="primary" size="lg" magnetic>
                {t("open_calc")}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </header>

          {/* Right: interactive preview */}
          <div className="md:col-span-7">
            <div className="overflow-hidden rounded-3xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_20px_50px_-20px_rgba(0,0,0,0.15)] ring-1 ring-black/[0.04]">
              {/* Steps progress strip */}
              <div className="flex items-center gap-1.5 bg-[#f5f5f7] px-6 py-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--color-accent)]">
                <Check className="h-3 w-3" /> {t("step_brand")}
                <span className="text-black/20">·</span>
                <Check className="h-3 w-3" /> {t("step_model")}
                <span className="text-black/20">·</span>
                <Check className="h-3 w-3" /> {t("step_repair")}
              </div>

              {/* Segmented control: container-tinted rail with elevated active
               * pill (Apple HIG idiom). Replaces the previous "lone black pill
               * floating in white" layout where inactive tabs had no visual
               * weight and the active one looked stuck-on. */}
              <div className="p-3 sm:p-4">
                <div className="flex gap-1 rounded-2xl bg-[#f0f0f3] p-1">
                  {FEATURED.map((f, i) => (
                    <button
                      key={f.model}
                      onClick={() => setActiveIdx(i)}
                      aria-pressed={i === activeIdx}
                      className={cn(
                        "flex-1 rounded-xl px-3 py-2.5 text-left transition-all duration-200",
                        i === activeIdx
                          ? "bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_-4px_rgba(0,0,0,0.12)]"
                          : "hover:bg-white/40"
                      )}
                    >
                      <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#6e6e73]">
                        {f.brand.split("-")[0]}
                      </div>
                      <div className="mt-0.5 truncate text-[13px] font-semibold tracking-[-0.005em] text-[#1d1d1f]">
                        {f.model}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Result body: price is the hero, features as a chip row below. */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIdx}
                  initial={{ opacity: 0.999, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0.999, y: -8 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="px-6 pb-7 pt-4 sm:px-7 sm:pb-8"
                >
                  <div className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-[#86868B]">
                    {active.label_repair} · {active.model}
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-[12px] font-medium uppercase tracking-[0.16em] text-[#6e6e73]">
                      {t("result_from")}
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-[clamp(3.25rem,8vw,5.5rem)] font-semibold leading-none tracking-[-0.045em] text-black tabular-nums">
                      {price ?? "—"}
                    </span>
                    <span className="text-[28px] font-medium leading-none text-[#86868B]">€</span>
                  </div>
                  <p className="mt-2.5 text-[12.5px] leading-snug text-[#86868B]">
                    {tDisclaimer}
                  </p>

                  {/* Feature chip row — horizontal, evenly weighted, separated
                   * by hairline dividers so it reads as one trust block, not a
                   * shopping list. */}
                  <ul className="mt-6 grid grid-cols-2 gap-2 border-t border-black/[0.06] pt-5 sm:grid-cols-4 sm:gap-0">
                    <Feature label="Originalteil" />
                    <Feature label="Gratis Diagnose" />
                    <Feature label="Express 30 Min" />
                    <Feature label="12 Mon. Garantie" />
                  </ul>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Feature({ label }: { label: string }) {
  return (
    <li className="flex items-start gap-2.5 text-[14px] leading-[1.45] text-[#3a3a3a]">
      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-success)]" />
      <span>{label}</span>
    </li>
  );
}
