"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import type { ReviewsResponse } from "@/lib/reviews-types";

type Review = { text: string; name: string; date: string };

export function Reviews() {
  const t = useTranslations("reviews");
  // Live-pulled reviews when the Google Places API is configured;
  // otherwise the static i18n fallback below stays in place. The state
  // flip happens once, on mount, after the API answers.
  const [live, setLive] = useState<ReviewsResponse | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/reviews", { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: ReviewsResponse | null) => {
        if (data?.source === "google" && data.reviews.length > 0) {
          setLive(data);
        }
      })
      .catch(() => {
        /* swallow — fallback already in place */
      });
    return () => controller.abort();
  }, []);

  const staticReviews: Review[] = [
    { text: t("review_1"), name: t("review_1_name"), date: "2026-03-12" },
    { text: t("review_2"), name: t("review_2_name"), date: "2026-02-28" },
    { text: t("review_3"), name: t("review_3_name"), date: "2026-02-14" },
    { text: t("review_4"), name: t("review_4_name"), date: "2026-01-30" },
    { text: t("review_5"), name: t("review_5_name"), date: "2026-01-19" },
    { text: t("review_6"), name: t("review_6_name"), date: "2026-01-04" },
    { text: t("review_7"), name: t("review_7_name"), date: "2025-12-21" },
    { text: t("review_8"), name: t("review_8_name"), date: "2025-12-08" },
  ];

  const reviews: Review[] =
    live && live.reviews.length > 0
      ? live.reviews.map((r) => ({
          text: r.text,
          name: r.author,
          // Google returns unix seconds; convert to YYYY-MM-DD for our
          // existing ReviewCard rendering.
          date: new Date(r.time * 1000).toISOString().slice(0, 10),
        }))
      : staticReviews;

  const row1 = reviews.slice(0, 4);
  const row2 = reviews.slice(4);

  return (
    <section id="reviews" className="relative bg-[var(--color-bg-secondary)] text-[var(--color-text-dark)]">
      <div className="mx-auto max-w-7xl px-6 pt-24 md:px-8 md:pt-36">
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
          <p className="mt-5 max-w-2xl text-[17px] leading-[1.55] text-[#525257]">
            {t("sub")}
          </p>
        </header>
      </div>

      <div className="relative mt-14 pb-24 md:mt-20 md:pb-36">
        {/* gradient masks left/right */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[var(--color-bg-secondary)] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[var(--color-bg-secondary)] to-transparent" />

        <Marquee direction="left" speed={70} items={row1} />
        <div className="h-5" />
        <Marquee direction="right" speed={85} items={row2} />
      </div>
    </section>
  );
}

function Marquee({
  items,
  direction,
  speed,
}: {
  items: Review[];
  direction: "left" | "right";
  speed: number;
}) {
  // Two copies: the loop translates by -50% (exactly one copy's width),
  // so a doubled row is the minimum for a seamless wrap.
  const double = [...items, ...items];
  return (
    <div className="overflow-hidden group/marquee">
      <motion.div
        className="flex gap-5 px-6 md:gap-6 md:px-8 group-hover/marquee:[animation-play-state:paused]"
        initial={{ x: direction === "left" ? 0 : "-50%" }}
        animate={{ x: direction === "left" ? "-50%" : 0 }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {double.map((r, i) => (
          <ReviewCard key={`${r.name}-${i}`} review={r} />
        ))}
      </motion.div>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="w-[320px] shrink-0 rounded-3xl bg-white p-7 ring-1 ring-black/[0.04] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.08)] md:w-[380px]">
      <div className="flex items-center gap-2">
        <div className="flex" role="img" aria-label="5 von 5 Sternen">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className="h-4 w-4 fill-current text-[#FFB400]"
              aria-hidden
            />
          ))}
        </div>
        <span className="flex items-center gap-1 text-[12px] text-[#6e6e73]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/partners/google-g.svg"
            alt=""
            aria-hidden
            className="h-3 w-3"
          />
          Google
        </span>
      </div>
      <p className="mt-4 text-[16px] leading-[1.55] text-[#1d1d1f]">{review.text}</p>
      <footer className="mt-5 flex items-center justify-between text-[12.5px] text-[#6e6e73]">
        <span className="font-medium text-[#1d1d1f]">{review.name}</span>
        <time dateTime={review.date}>
          {/* explicit en-US to avoid SSR/CSR locale mismatch */}
          {new Date(review.date).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })}
        </time>
      </footer>
    </article>
  );
}
