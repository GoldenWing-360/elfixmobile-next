"use client";

import { forwardRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "tertiary";
type Size = "md" | "lg";

interface Common {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
  magnetic?: boolean;
}

interface ButtonProps
  extends Common,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  href?: undefined;
}
interface AnchorProps
  extends Common,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> {
  href: string;
}

type Props = ButtonProps | AnchorProps;

const base = cn(
  "inline-flex items-center justify-center gap-2 font-medium",
  "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
  "select-none cursor-pointer will-change-transform",
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/40"
);

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--color-accent)] text-white rounded-full hover:bg-[var(--color-accent-hover)] hover:scale-[1.02] active:scale-[0.98]",
  secondary:
    "bg-white/10 text-white border border-white/20 backdrop-blur-md rounded-full hover:bg-white/15 hover:scale-[1.02] active:scale-[0.98]",
  tertiary:
    "text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] group",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-[15px]",
  lg: "h-14 px-7 text-[17px]",
};

export const Button = forwardRef<HTMLElement, Props>(function Button(
  props,
  ref
) {
  const { variant = "primary", size = "md", className, children, magnetic = false, ...rest } = props;
  const isLink = "href" in rest && rest.href !== undefined;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 20 });
  const sy = useSpring(y, { stiffness: 200, damping: 20 });
  const tx = useTransform(sx, (v) => v * 0.18);
  const ty = useTransform(sy, (v) => v * 0.18);

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!magnetic) return;
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    x.set(e.clientX - (r.left + r.width / 2));
    y.set(e.clientY - (r.top + r.height / 2));
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  const cls = cn(
    base,
    variants[variant],
    variant !== "tertiary" && sizes[size],
    variant === "tertiary" && "text-[15px]",
    className
  );

  const arrow =
    variant === "tertiary" ? (
      <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
        →
      </span>
    ) : null;

  const content = (
    <>
      {children}
      {arrow}
    </>
  );

  const motionStyle = magnetic ? { x: tx, y: ty } : undefined;

  // framer-motion v12 narrows drag handlers; cast spread to any to merge
  // standard HTML props without fighting the generic.
  if (isLink) {
    const a = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
    const AMotion = motion.a as unknown as React.FC<Record<string, unknown>>;
    return (
      <AMotion
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={cls}
        style={motionStyle}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        {...a}
      >
        {content}
      </AMotion>
    );
  }
  const b = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  const BMotion = motion.button as unknown as React.FC<Record<string, unknown>>;
  return (
    <BMotion
      ref={ref as React.Ref<HTMLButtonElement>}
      className={cls}
      style={motionStyle}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      {...b}
    >
      {content}
    </BMotion>
  );
});
