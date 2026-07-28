import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Section({
  className,
  children,
  tone = "dark",
  full = false,
  ...rest
}: HTMLAttributes<HTMLElement> & {
  tone?: "dark" | "light" | "deep";
  full?: boolean;
}) {
  const toneCls =
    tone === "light"
      ? "bg-[var(--color-bg-secondary)] text-[var(--color-text-dark)]"
      : tone === "deep"
        ? "bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]"
        : "bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]";

  return (
    <section className={cn("relative w-full", toneCls, className)} {...rest}>
      <div
        className={cn(
          "mx-auto py-24 md:py-36",
          full ? "px-6 md:px-8" : "max-w-7xl px-6 md:px-8"
        )}
      >
        {children}
      </div>
    </section>
  );
}

export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-[12px] sm:text-[13px] uppercase tracking-[0.18em] font-medium",
        "text-[var(--color-accent)]",
        className
      )}
    >
      {children}
    </p>
  );
}

export function Headline({
  children,
  className,
  size = "section",
  as: Comp = "h2",
}: {
  children: React.ReactNode;
  className?: string;
  size?: "hero" | "section" | "sub";
  as?: "h1" | "h2" | "h3";
}) {
  const sizes = {
    hero:"t-display",
    section:"t-h1",
    sub:"t-h3",
  } as const;
  return (
    <Comp className={cn("font-semibold", sizes[size], className)}>{children}</Comp>
  );
}
