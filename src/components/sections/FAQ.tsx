"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";

export function FAQ() {
  const t = useTranslations("faq");
  const [open, setOpen] = useState<number | null>(0);

  const items = Array.from({ length: 8 }).map((_, i) => ({
    q: t(`q${i + 1}` as "q1"),
    a: t(`a${i + 1}` as "a1"),
  }));

  return (
    <section
      id="faq"
      className="relative bg-[var(--color-bg-secondary)] text-[var(--color-text-dark)]"
    >
      <div className="mx-auto max-w-5xl px-6 py-24 md:px-8 md:py-40">
        <header className="text-center">
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
        </header>

        <div className="mt-14 divide-y divide-black/[0.08] md:mt-20">
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
                  <span className="text-[18px] font-semibold tracking-[-0.005em] text-[#1d1d1f] md:text-[22px]">
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
