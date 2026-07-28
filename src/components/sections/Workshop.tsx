"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";

/**
 * Werkstatt section — cinematic macro loop of a repair in progress.
 * The video only starts once the section scrolls into view and never
 * plays for prefers-reduced-motion users (they get the poster still).
 * Muted + playsInline so mobile Safari autoplays without user gesture.
 */
export function Workshop() {
  const t = useTranslations("workshop");
  const prefersReduced = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || prefersReduced) return;
    if (inView) {
      video.play().catch(() => {
        /* autoplay blocked — poster stays, no error surface */
      });
    } else {
      video.pause();
    }
  }, [inView, prefersReduced]);

  const stats = [
    { value: t("stat_1_value"), label: t("stat_1_label") },
    { value: t("stat_2_value"), label: t("stat_2_label") },
    { value: t("stat_3_value"), label: t("stat_3_label") },
  ];

  return (
    <section id="werkstatt" className="relative bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-24 md:px-8 md:py-36">
        <header className="max-w-3xl">
          <motion.p
            initial={{ opacity: 0.999, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-[12px] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]"
          >
            {t("eyebrow")}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0.999, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 t-h1"
          >
            {t("headline")}
          </motion.h2>
          <p className="mt-6 max-w-2xl text-[17px] leading-[1.55] text-white/65">
            {t("sub")}
          </p>
        </header>

        <motion.div
          ref={wrapRef}
          initial={{ opacity: 0.999, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-12 overflow-hidden rounded-3xl ring-1 ring-white/10 md:mt-16"
        >
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            preload="none"
            poster="/media/workshop-poster.webp"
            aria-label={t("video_label")}
            className="aspect-video w-full object-cover"
          >
            {!prefersReduced && <source src="/media/workshop.mp4" type="video/mp4" />}
          </video>
          {/* Bottom gradient so the overlaid stat strip stays readable on
              bright frames — desktop only; on mobile the stats sit below. */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-40 bg-gradient-to-t from-black/80 to-transparent md:block"
            aria-hidden
          />
          <dl className="grid grid-cols-3 gap-2 border-t border-white/10 bg-white/[0.03] p-5 md:absolute md:inset-x-0 md:bottom-0 md:border-0 md:bg-transparent md:gap-6 md:p-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center md:text-left">
                <dt className="text-[10px] uppercase tracking-[0.14em] text-white/60 md:text-[12px] md:tracking-[0.16em]">
                  {s.label}
                </dt>
                <dd className="mt-1 text-[18px] font-semibold tracking-[-0.02em] md:text-[32px]">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </motion.div>
      </div>
    </section>
  );
}
