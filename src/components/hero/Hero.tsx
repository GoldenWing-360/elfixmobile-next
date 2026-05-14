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

        {/* Device mock (CSS-only iPhone) */}
        <motion.div
          style={{
            y: deviceY,
            rotate: deviceRotate,
            scale: deviceScale,
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="my-10 md:my-14"
          aria-hidden
        >
          <DeviceMock />
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

/** Pure-CSS iPhone-ish frame so we don't ship a placeholder JPG */
function DeviceMock() {
  return (
    <div className="relative">
      <div
        className="relative h-[400px] w-[200px] rounded-[44px] border border-white/10 bg-gradient-to-b from-[#1a1a1c] to-[#0a0a0b] shadow-[0_30px_120px_-20px_rgba(0,113,227,0.45),_0_0_0_1px_rgba(255,255,255,0.04)] md:h-[480px] md:w-[240px]"
        style={{
          boxShadow:
            "0 30px 120px -20px rgba(0,113,227,0.45), 0 0 0 1px rgba(255,255,255,0.05), inset 0 0 0 2px rgba(255,255,255,0.04)",
        }}
      >
        {/* Notch / Dynamic Island */}
        <div className="absolute left-1/2 top-3 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-black md:h-7 md:w-28" />
        {/* Screen */}
        <div className="absolute inset-2 overflow-hidden rounded-[36px] bg-gradient-to-br from-[#001a4d] via-[#000814] to-black">
          <div
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 20%, rgba(0,113,227,0.4) 0px, transparent 50%), radial-gradient(circle at 70% 80%, rgba(48,209,88,0.15) 0px, transparent 50%)",
            }}
          />
          {/* faux time */}
          <div className="absolute left-6 top-3 text-[10px] font-semibold text-white/85">
            09:41
          </div>
          <div className="absolute right-6 top-3 flex items-center gap-1 text-white/85">
            <span className="h-1.5 w-1 rounded-sm bg-white/85" />
            <span className="h-2 w-1 rounded-sm bg-white/85" />
            <span className="h-2.5 w-1 rounded-sm bg-white/85" />
          </div>
        </div>
        {/* Side button */}
        <span className="absolute -right-[1px] top-24 h-12 w-[2px] rounded-r bg-white/10" />
        <span className="absolute -left-[1px] top-20 h-8 w-[2px] rounded-l bg-white/10" />
        <span className="absolute -left-[1px] top-32 h-12 w-[2px] rounded-l bg-white/10" />
      </div>
    </div>
  );
}
