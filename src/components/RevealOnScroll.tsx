"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/cn";

const variants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

export function RevealOnScroll({
  children,
  className,
  delay = 0,
  amount = 0.2,
  as: Comp = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  amount?: number;
  as?: "div" | "section" | "article" | "header" | "footer";
}) {
  const MotionComp = motion[Comp] as typeof motion.div;
  return (
    <MotionComp
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={variants}
      transition={{ delay }}
    >
      {children}
    </MotionComp>
  );
}
