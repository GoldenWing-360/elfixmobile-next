"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@/components/Button";

export function FinalCTA() {
  const t = useTranslations("final");

  return (
    <section id="final-cta" className="relative overflow-hidden bg-black text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-x-8 px-6 pt-24 md:grid-cols-12 md:px-8 md:py-40">
        <div className="text-center md:col-span-7 md:text-left">
          <motion.h2
            initial={{ opacity: 0.999, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="t-display"
          >
            {t("headline")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0.999, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="mx-auto mt-6 max-w-xl text-[17px] leading-[1.55] text-white/65 md:mx-0 md:text-[18px]"
          >
            {t("sub")}
          </motion.p>
          <motion.div
            initial={{ opacity: 0.999, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 md:justify-start"
          >
            <Button href="/preisrechner" variant="primary" size="lg" magnetic>
              {t("cta_primary")}
            </Button>
            <Button href="/buchen" variant="secondary" size="lg">
              {t("cta_secondary")}
            </Button>
          </motion.div>
        </div>

        {/* Brand ambassador — dark adaptation of the shop's long-time
            stock model, pointing toward the CTAs. Decorative. */}
        <motion.div
          initial={{ opacity: 0.999, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="mt-12 flex justify-center md:col-span-5 md:mt-0 md:justify-end"
          aria-hidden
        >
          <Image
            src="/media/ambassador.webp"
            alt=""
            width={939}
            height={1400}
            unoptimized
            className="pointer-events-none h-[420px] w-auto select-none md:h-[560px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_45%,black_55%,transparent_92%)]"
          />
        </motion.div>
      </div>
    </section>
  );
}
