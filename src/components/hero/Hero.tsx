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

// Repair brands + carrier partners (A1, Magenta, Drei — real partners of
// the shop). SVGs render white via brightness-0+invert; brands without a
// usable mono mark are typeset wordmarks. Every entry carries a tuned
// height so all marks sit at the same OPTICAL size — simple-icons boxes
// have wildly different ink coverage (wordmarks vs. square icons).
const BRAND_STRIP: ReadonlyArray<
  { src: string; label: string; h: string } | { text: string; label: string }
> = [
  { src: "/brands/apple.svg", label: "Apple", h: "h-7" },
  { src: "/brands/samsung.svg", label: "Samsung", h: "h-12" },
  { text: "A1", label: "A1 Telekom" },
  { src: "/brands/tmobile.svg", label: "Magenta T-Mobile", h: "h-6" },
  { text: "Drei", label: "Drei Österreich" },
  { src: "/brands/xiaomi.svg", label: "Xiaomi", h: "h-7" },
  { src: "/brands/huawei.svg", label: "Huawei", h: "h-7" },
  { text: "ZTE", label: "ZTE" },
  { src: "/brands/google.svg", label: "Google Pixel", h: "h-7" },
];

function BrandMark({ b }: { b: (typeof BRAND_STRIP)[number] }) {
  return "src" in b ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={b.src}
      alt={b.label}
      title={b.label}
      className={`${b.h} w-auto shrink-0 brightness-0 invert opacity-40`}
    />
  ) : (
    <span
      title={b.label}
      className="shrink-0 text-[20px] font-bold tracking-tight text-white/40"
    >
      {b.text}
    </span>
  );
}

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

      {/* Column layout keeps the whole hero at exactly 100svh: the grid
          takes the free space, the brand slider fills the formerly empty
          bottom band instead of extending the section. */}
      <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col px-6 md:px-8">
      <div className="grid flex-1 grid-cols-1 items-center gap-x-10 gap-y-8 pb-8 pt-28 md:grid-cols-12 md:pb-10 md:pt-32">
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

          <h1 className=" t-display">
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
            className="mt-6 max-w-2xl text-[17px] leading-[1.5] text-white/70 md:text-[18px]"
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

      {/* Brand & partner slider — monochrome marquee, same pattern as the
          Reviews section. Reduced-motion users get a static wrapped row. */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative pb-8"
      >
        <div className="border-t border-white/10 pt-8">
          {prefersReduced ? (
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
              {BRAND_STRIP.map((b) => (
                <BrandMark key={b.label} b={b} />
              ))}
            </div>
          ) : (
            <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
              <motion.div
                className="flex w-max"
                initial={{ x: 0 }}
                animate={{ x: "-50%" }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              >
                {/* Two identical copies incl. trailing gap → -50% lands
                    exactly on the copy boundary, seamless loop. */}
                {[0, 1].map((copy) => (
                  <div
                    key={copy}
                    aria-hidden={copy === 1}
                    className="flex items-center gap-16 pr-16"
                  >
                    {BRAND_STRIP.map((b) => (
                      <BrandMark key={`${copy}-${b.label}`} b={b} />
                    ))}
                  </div>
                ))}
              </motion.div>
            </div>
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
