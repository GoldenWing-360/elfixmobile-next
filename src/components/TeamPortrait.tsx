"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Animated studio portrait of the real shop team (Higgsfield adaptation
 * of the original photo — faces untouched, setting restyled to the
 * brand's black/blue world). Plays once when scrolled into view and
 * holds the final frame; replays on re-entry. Reduced motion gets the
 * still.
 */
export function TeamPortrait({ alt }: { alt: string }) {
  const prefersReduced = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.defaultMuted = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          v.currentTime = 0;
          v.play().catch(() => {});
        }
      },
      { threshold: 0.35 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [prefersReduced]);

  if (prefersReduced) {
    return (
      <Image
        src="/media/team-still.webp"
        alt={alt}
        width={1280}
        height={720}
        unoptimized
        className="w-full rounded-3xl ring-1 ring-white/10"
      />
    );
  }
  return (
    <video
      ref={videoRef}
      muted
      playsInline
      preload="none"
      poster="/media/team-poster.webp"
      aria-label={alt}
      className="w-full rounded-3xl ring-1 ring-white/10"
    >
      <source src="/media/team.mp4" type="video/mp4" />
    </video>
  );
}
