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
              {/* steps progress */}
              <div className="flex items-center gap-1 border-b border-black/[0.05] bg-[#f7f7f8] px-7 py-3 text-[11px] font-medium uppercase tracking-[0.18em] text-[#6e6e73]">
                <span className="text-[var(--color-accent)]">
                  <Check className="inline h-3 w-3" /> {t("step_brand")}
                </span>
                <span className="opacity-30">·</span>
                <span className="text-[var(--color-accent)]">
                  <Check className="inline h-3 w-3" /> {t("step_model")}
                </span>
                <span className="opacity-30">·</span>
                <span className="text-[var(--color-accent)]">
                  <Check className="inline h-3 w-3" /> {t("step_repair")}
                </span>
              </div>

              {/* tabs */}
              <div className="flex gap-1 border-b border-black/[0.05] p-1.5">
                {FEATURED.map((f, i) => (
                  <button
                    key={f.model}
                    onClick={() => setActiveIdx(i)}
                    aria-pressed={i === activeIdx}
                    className={cn(
                      "flex-1 rounded-2xl px-4 py-3 text-left text-[13px] font-medium transition-colors duration-300",
                      i === activeIdx
                        ? "bg-black text-white"
                        : "bg-transparent text-[#1d1d1f] hover:bg-black/[0.04]"
                    )}
                  >
                    <div className="text-[10.5px] uppercase tracking-[0.18em] opacity-60">
                      {f.brand.split("-")[0]}
                    </div>
                    <div className="truncate">{f.model}</div>
                  </button>
                ))}
              </div>

              {/* result */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIdx}
                  initial={{ opacity: 0.999, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0.999, y: -12 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="grid grid-cols-1 gap-6 px-7 py-10 sm:grid-cols-2 sm:items-end"
                >
                  <div>
                    <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#6e6e73]">
                      {active.label_repair} - {active.model}
                    </div>
                    <div className="mt-3 text-[11px] uppercase tracking-[0.22em] text-[#6e6e73]">
                      {t("result_from")}
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-[clamp(3rem,7vw,5rem)] font-semibold leading-none tracking-[-0.04em] text-black">
                        {price ?? "—"}
                      </span>
                      <span className="text-[28px] font-medium text-[#6e6e73]">€</span>
                    </div>
                    <p className="mt-3 max-w-xs text-[13px] text-[#6e6e73]">
                      {tDisclaimer}
                    </p>
                  </div>

                  <div className="space-y-3 sm:text-right">
                    <Feature label="Originalteil oder Premium-Refurbished" />
                    <Feature label="Kostenlose Diagnose" />
                    <Feature label="Express in 30 Min möglich" />
                    <Feature label="12 Monate Garantie" />
                  </div>
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
    <div className="flex items-center justify-end gap-2 text-[14px] text-[#3a3a3a]">
      <Check className="h-4 w-4 text-[var(--color-success)]" />
      <span>{label}</span>
    </div>
  );
}
