"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import { MessageSquare, Search, Wrench, ShieldCheck } from "lucide-react";

export function ProcessSteps() {
  const t = useTranslations("process");
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const steps = [
    { Icon: MessageSquare, title: t("step_1_title"), desc: t("step_1_desc") },
    { Icon: Search, title: t("step_2_title"), desc: t("step_2_desc") },
    { Icon: Wrench, title: t("step_3_title"), desc: t("step_3_desc") },
    { Icon: ShieldCheck, title: t("step_4_title"), desc: t("step_4_desc") },
  ];

  // progress thread (left of the steps column)
  const lineHeight = useTransform(scrollYProgress, [0.05, 0.6], ["0%", "100%"]);

  return (
    <section
      ref={ref}
      id="process"
      className="relative bg-black text-white"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-24 md:grid-cols-12 md:gap-10 md:px-8 md:py-40">
        {/* Sticky left column */}
        <header className="md:col-span-5">
          <div className="md:sticky md:top-28 md:pt-6">
            <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
              {t("eyebrow")}
            </p>
            <h2 className="mt-4 t-h1">
              {t("headline")}
            </h2>
            <p className="mt-6 max-w-2xl text-[17px] leading-[1.55] text-white/65">
              {t("sub")}
            </p>
          </div>
        </header>

        {/* Right column: steps */}
        <ol className="relative md:col-span-7">
          {/* progress track */}
          <span
            aria-hidden
            className="absolute left-[27px] top-2 hidden h-[calc(100%-3rem)] w-px bg-white/10 md:block"
          />
          <motion.span
            aria-hidden
            style={{ height: lineHeight }}
            className="absolute left-[27px] top-2 hidden w-px bg-gradient-to-b from-[var(--color-accent)] to-[var(--color-accent-hover)] md:block"
          />

          {steps.map((s, i) => (
            <motion.li
              key={s.title}
              initial={{ opacity: 0.999, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0, margin: "200px 0px 200px 0px" }}
              transition={{
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.05,
              }}
              className="relative flex items-start gap-6 pb-16 last:pb-0 md:gap-8"
            >
              <span className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-full border border-white/15 bg-black text-[15px] font-semibold tabular-nums shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
                <span className="absolute inset-1 rounded-full bg-gradient-to-br from-white/[0.08] to-transparent" />
                <span className="relative z-10 flex items-center gap-1.5">
                  <s.Icon className="h-4 w-4 text-[var(--color-accent)]" />
                  <span className="text-white/80">{i + 1}</span>
                </span>
              </span>
              <div className="pt-2">
                <h3 className="text-[22px] font-semibold tracking-[-0.01em]">
                  {s.title}
                </h3>
                <p className="mt-2 max-w-2xl text-[16px] leading-[1.6] text-white/65">
                  {s.desc}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
