"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import Image from "next/image";
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
    <span className="flex flex-wrap justify-center gap-x-[0.25em]">
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
  // Respect the OS-level prefers-reduced-motion setting and disable
  // scroll-driven parallax for users who opted out (accessibility) or
  // are on low-power mobile devices.
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  // Tone-down magnitudes: parallax was -120 / -60 / -10°. Cut to ~half
  // so it reads as gentle depth instead of jarring scroll-jack on phones.
  const deviceY = useTransform(scrollYProgress, [0, 1], prefersReduced ? [0, 0] : [0, -60]);
  const deviceRotate = useTransform(scrollYProgress, [0, 1], prefersReduced ? [0, 0] : [-3, -7]);
  const deviceScale = useTransform(scrollYProgress, [0, 1], prefersReduced ? [1, 1] : [1, 0.95]);
  const headlineY = useTransform(scrollYProgress, [0, 1], prefersReduced ? [0, 0] : [0, -30]);
  const trustOpacity = useTransform(
    scrollYProgress,
    [0, 0.6, 1],
    prefersReduced ? [1, 1, 1] : [1, 0.6, 0.2],
  );

  return (
    <section
      ref={ref}
      className="relative isolate min-h-[100svh] overflow-hidden bg-black"
    >
      {/* Background radial */}
      <div className="pointer-events-none absolute inset-0 hero-radial" aria-hidden />
      {/* Top gradient fade so content under nav stays legible */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black to-transparent" aria-hidden />

      <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col items-center justify-center px-6 pt-28 pb-20 md:px-8 md:pt-32">
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-[11px] sm:text-[12px] uppercase tracking-[0.28em] text-white/55 mb-6"
        >
          {t("eyebrow")}
        </motion.p>

        {/* Headline with text-mask reveal */}
        <motion.h1
          style={{ y: headlineY }}
          className="text-center font-semibold tracking-[-0.04em] text-[clamp(2.75rem,8vw,6.5rem)] leading-[1.02]"
        >
          <span className="block">
            <MaskedLine text={t("headline_1")} baseIndex={0} />
          </span>
          <span className="block bg-gradient-to-b from-white via-white to-white/50 bg-clip-text text-transparent">
            <MaskedLine text={t("headline_2")} baseIndex={3} />
          </span>
          <span className="block text-white/70">
            <MaskedLine text={t("headline_3")} baseIndex={6} />
          </span>
        </motion.h1>

        {/* Subline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-7 max-w-xl text-center text-[17px] md:text-[19px] leading-[1.5] text-white/70"
        >
          {t("subline")}
        </motion.p>

        {/* Device shot — real render on black, blends into the hero bg */}
        <motion.div
          style={{
            y: deviceY,
            rotate: deviceRotate,
            scale: deviceScale,
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="my-4 md:my-6"
          aria-hidden
        >
          <Image
            src="/media/hero-phone.webp"
            alt=""
            width={956}
            height={1440}
            priority
            unoptimized
            // Radial mask feathers the render's near-black backdrop into
            // the true-black hero so no rectangular edge shows.
            className="pointer-events-none h-[440px] w-auto select-none md:h-[540px] [mask-image:radial-gradient(ellipse_60%_52%_at_50%_48%,black_58%,transparent_82%)]"
          />
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-4 sm:flex-row sm:gap-3"
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
          style={{ opacity: trustOpacity }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 grid w-full max-w-3xl grid-cols-2 gap-4 md:mt-16 md:grid-cols-4 md:gap-3"
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
    <div className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[12px] md:text-[13px] text-white/70">
      <span className="text-[var(--color-accent)]">{icon}</span>
      <span className="truncate">{children}</span>
    </div>
  );
}
