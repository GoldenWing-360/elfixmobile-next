"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@/components/Button";

const cardEnter = {
  hidden: { opacity: 0.999, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.08 * i,
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
};

export function ServiceShowcase() {
  const t = useTranslations("services");

  // Cards link to the dedicated SEO service-pages — not /preisrechner
  // pre-filtered queries — so users (and Google) land on a full landing
  // with explainers, FAQ and JSON-LD before deciding to book.
  const cards = [
    {
      key: "display",
      href: "/display-reparatur-wien",
      title: t("display_title"),
      desc: t("display_desc"),
      price: t("display_price"),
      gradient:
        "from-[#0a0a0c] via-[#0a1a3a] to-[#001e4d]",
      image: "/media/service-display.webp",
    },
    {
      key: "battery",
      href: "/akku-tausch-wien",
      title: t("battery_title"),
      desc: t("battery_desc"),
      price: t("battery_price"),
      gradient:
        "from-[#0a0a0c] via-[#1a3a0a] to-[#073d22]",
      image: "/media/service-battery.webp",
    },
    {
      key: "water",
      href: "/wasserschaden-handy-reparatur-wien",
      title: t("water_title"),
      desc: t("water_desc"),
      price: t("water_price"),
      gradient:
        "from-[#0a0a0c] via-[#0a2a3a] to-[#003a4d]",
      image: "/media/service-water.webp",
    },
  ];

  return (
    <section
      id="services"
      className="relative bg-[var(--color-bg-secondary)] text-[var(--color-text-dark)]"
    >
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
            transition={{
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.05,
            }}
            className="mt-4 t-h1"
          >
            {t("headline")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0.999, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0, margin: "200px 0px 200px 0px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="mt-5 max-w-2xl text-[17px] leading-[1.55] text-[#525257]"
          >
            {t("sub")}
          </motion.p>
        </header>

        <div className="mt-14 grid grid-cols-1 gap-6 md:mt-20 md:grid-cols-3 md:gap-6">
          {cards.map((c, i) => (
            <motion.article
              key={c.key}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0, margin: "200px 0px 200px 0px" }}
              variants={cardEnter}
              className="group relative overflow-hidden rounded-3xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.04] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_2px_4px_rgba(0,0,0,0.05),0_24px_40px_-20px_rgba(0,0,0,0.2)]"
            >
              <div
                className={`relative aspect-[4/3] overflow-hidden bg-gradient-to-br ${c.gradient}`}
              >
                <Image
                  src={c.image}
                  alt={c.title}
                  fill
                  unoptimized
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
                />
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/40 to-transparent" />
                <span className="absolute right-4 top-4 inline-flex items-center rounded-full bg-white/95 px-3 py-1.5 text-[12px] font-semibold tracking-tight text-black shadow-sm backdrop-blur-md">
                  {c.price}
                </span>
              </div>
              <div className="px-7 py-7">
                <h3 className="text-[22px] font-semibold tracking-[-0.01em] text-black">
                  {c.title}
                </h3>
                <p className="mt-3 text-[15px] leading-[1.55] text-[#525257]">
                  {c.desc}
                </p>
                <div className="mt-6">
                  <Button
                    href={c.href}
                    variant="tertiary"
                    className="px-0"
                  >
                    {t("cta")}
                  </Button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
