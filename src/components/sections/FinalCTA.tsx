"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@/components/Button";

export function FinalCTA() {
  const t = useTranslations("final");

  return (
    <section id="final-cta" className="relative bg-black text-white">
      <div className="mx-auto max-w-5xl px-6 py-32 text-center md:px-8 md:py-56">
        <motion.h2
          initial={{ opacity: 0.999, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0, margin: "200px 0px 200px 0px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-[clamp(2.5rem,7vw,6rem)] font-semibold leading-[1.04] tracking-[-0.035em]"
        >
          {t("headline")}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0.999, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0, margin: "200px 0px 200px 0px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="mx-auto mt-6 max-w-xl text-[17px] leading-[1.55] text-white/65 md:text-[19px]"
        >
          {t("sub")}
        </motion.p>
        <motion.div
          initial={{ opacity: 0.999, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0, margin: "200px 0px 200px 0px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
        >
          <Button href="/preisrechner" variant="primary" size="lg" magnetic>
            {t("cta_primary")}
          </Button>
          <Button href="/buchen" variant="secondary" size="lg">
            {t("cta_secondary")}
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
