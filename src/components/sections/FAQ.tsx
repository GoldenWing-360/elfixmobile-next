"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";

// Subset of the 8 Q/A pairs from the /faq namespace — order matches the
// dedicated /faq page so the home preview is a consistent teaser. Keys
// must exist in messages/<locale>.json under the faq.* namespace.
const KEYS = [
  "express",
  "warranty",
  "data",
  "price",
  "parts",
  "pickup",
  "pay",
  "hours",
] as const;

export function FAQ() {
  const t = useTranslations("faq");
  const [open, setOpen] = useState<number | null>(0);

  const items = KEYS.map((k) => ({
    q: t(`q_${k}_q` as "q_express_q"),
    a: t(`q_${k}_a` as "q_express_a"),
  }));

  return (
    <section
      id="faq"
      className="relative bg-[var(--color-bg-secondary)] text-[var(--color-text-dark)]"
    >
      {/* Full container so the header lines up with every other home
          section; the accordion itself stays a left-aligned reading
          block inside it. */}
      <div className="mx-auto max-w-7xl px-6 py-24 md:px-8 md:py-36">
        <header className="max-w-2xl">
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
            {t("h1")}
          </motion.h2>
        </header>

        <div className="mt-14 max-w-3xl divide-y divide-black/[0.08] md:mt-20">
          {items.map((it, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="group">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  className="flex w-full items-center justify-between gap-8 py-6 text-left md:py-8"
                >
                  <span className="text-[18px] font-semibold tracking-[-0.005em] text-[#1d1d1f]">
                    {it.q}
                  </span>
                  <motion.span
                    aria-hidden
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-black/[0.04] text-[#1d1d1f] transition-colors group-hover:bg-black/[0.08] md:h-10 md:w-10"
                  >
                    <Plus className="h-4 w-4" />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-panel-${i}`}
                      role="region"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        height: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
                        opacity: { duration: 0.25 },
                      }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 pr-14 text-[16px] leading-[1.6] text-[#525257] md:pb-8 md:pr-20 md:text-[17px]">
                        {it.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
