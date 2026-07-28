"use client";

import { useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Star, Shield, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/Button";

const wordReveal: Variants = {
  hidden: { y: "110%" },
  visible: (i: number) => ({
    y: 0,
    transition: {
      delay: 0.05 * i,
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
};

function MaskedLine({ text, baseIndex = 0 }: { text: string; baseIndex?: number }) {
  const words = text.split(" ");
  return (
    <span className="flex flex-wrap gap-x-[0.25em]">
      {words.map((w, i) => (
        <span key={`${w}-${i}`} className="inline-block overflow-hidden pb-[0.05em]">
          <motion.span
            className="inline-block"
            custom={baseIndex + i}
            initial="hidden"
            animate="visible"
            variants={wordReveal}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export function Hero() {
  const t = useTranslations("hero");
  const ref = useRef<HTMLDivElement>(null);
  // Respect the OS-level prefers-reduced-motion setting: no scroll
  // parallax, and the healing clip is swapped for its final still.
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const deviceY = useTransform(scrollYProgress, [0, 1], prefersReduced ? [0, 0] : [0, -50]);
  const headlineY = useTransform(scrollYProgress, [0, 1], prefersReduced ? [0, 0] : [0, -24]);

  return (
    <section
      ref={ref}
      className="relative isolate overflow-hidden bg-black"
    >
      {/* Background radial */}
      <div className="pointer-events-none absolute inset-0 hero-radial" aria-hidden />
      {/* Top gradient fade so content under nav stays legible */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black to-transparent" aria-hidden />

      <div className="relative mx-auto grid min-h-[100svh] max-w-7xl grid-cols-1 items-center gap-x-10 gap-y-8 px-6 pb-16 pt-28 md:grid-cols-12 md:px-8 md:pb-20 md:pt-32">
        {/* Copy + conversion block */}
        <motion.div style={{ y: headlineY }} className="md:col-span-7">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 text-[11px] uppercase tracking-[0.28em] text-white/55 sm:text-[12px]"
          >
            {t("eyebrow")}
          </motion.p>

          <h1 className="font-semibold tracking-[-0.04em] text-[clamp(2.6rem,6.5vw,5.5rem)] leading-[1.02]">
            <span className="block">
              <MaskedLine text={t("headline_1")} baseIndex={0} />
            </span>
            <span className="block bg-gradient-to-b from-white via-white to-white/50 bg-clip-text text-transparent">
              <MaskedLine text={t("headline_2")} baseIndex={3} />
            </span>
            <span className="block text-white/70">
              <MaskedLine text={t("headline_3")} baseIndex={6} />
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 max-w-xl text-[17px] leading-[1.5] text-white/70 md:text-[19px]"
          >
            {t("subline")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-3"
          >
            <Button variant="primary" size="lg" href="/preisrechner" magnetic>
              {t("cta_primary")}
            </Button>
            <Button variant="tertiary" size="lg" href="/buchen">
              {t("cta_secondary")}
            </Button>
          </motion.div>

          {/* Trust row */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 grid max-w-2xl grid-cols-2 gap-3 md:mt-12"
          >
            <TrustPill icon={<Star className="h-3.5 w-3.5 fill-current" />}>
              <span className="font-semibold text-white">{t("trust_rating")}</span>
              <span className="text-white/55"> · {t("trust_reviews")}</span>
            </TrustPill>
            <TrustPill icon={<Clock className="h-3.5 w-3.5" />}>
              {t("trust_express")}
            </TrustPill>
            <TrustPill icon={<Shield className="h-3.5 w-3.5" />}>
              {t("trust_warranty")}
            </TrustPill>
            <TrustPill icon={<Calendar className="h-3.5 w-3.5" />}>
              {t("trust_open")}
            </TrustPill>
          </motion.div>
        </motion.div>

        {/* Healing shot: our ambassador holds a shattered display that
            repairs itself in her hand, then holds the pristine frame —
            the promise ("Wie neu.") shown, not told. */}
        <motion.div
          style={{ y: deviceY }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center md:col-span-5 md:justify-end"
          aria-hidden
        >
          <div className="[mask-image:radial-gradient(ellipse_72%_62%_at_50%_46%,black_58%,transparent_92%)]">
            {prefersReduced ? (
              <Image
                src="/media/hero-girl-still.webp"
                alt=""
                width={540}
                height={720}
                priority
                unoptimized
                className="pointer-events-none h-[440px] w-auto select-none md:h-[560px]"
              />
            ) : (
              <video
                autoPlay
                muted
                playsInline
                preload="auto"
                poster="/media/hero-girl-poster.webp"
                className="pointer-events-none h-[440px] w-auto select-none md:h-[560px]"
              >
                <source src="/media/hero-girl.mp4" type="video/mp4" />
              </video>
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom fade into next section */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-black" aria-hidden />
    </section>
  );
}

function TrustPill({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[12px] text-white/70 md:text-[13px]">
      <span className="text-[var(--color-accent)]">{icon}</span>
      <span className="truncate">{children}</span>
    </div>
  );
}
