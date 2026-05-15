"use client";

import { forwardRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "tertiary";
type Size = "md" | "lg";

interface Common {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
  /**
   * @deprecated The magnetic cursor-follow effect was removed because it
   * combined badly with `hover:scale-[*]` (both write to `transform`) and
   * caused the button to jitter under the cursor — the bounding-rect
   * recomputed every frame fed a small displacement back into the spring,
   * creating a visible oscillation. Prop is kept for source compatibility
   * but is now a no-op.
   */
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
  "transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
  "select-none cursor-pointer",
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/40"
);

// Hover effects are background-only — no transform scale, no translate. That
// keeps the button anchored on hover (no jitter) and matches Apple's HIG
// where buttons indicate hover via brightness change, not size.
const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--color-accent)] text-white rounded-full hover:bg-[var(--color-accent-hover)] active:bg-[var(--color-accent-hover)]",
  secondary:
    "bg-white/10 text-white border border-white/20 backdrop-blur-md rounded-full hover:bg-white/[0.18] active:bg-white/[0.22]",
  tertiary:
    "text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] group",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-[15px]",
  lg: "h-14 px-7 text-[17px]",
};

export const Button = forwardRef<HTMLElement, Props>(function Button(
  props,
  ref,
) {
  // magnetic is intentionally pulled out and ignored — see prop JSDoc above.
  const {
    variant = "primary",
    size = "md",
    className,
    children,
    magnetic: _magnetic = false,
    ...rest
  } = props;
  void _magnetic;
  const isLink = "href" in rest && rest.href !== undefined;

  const cls = cn(
    base,
    variants[variant],
    variant !== "tertiary" && sizes[size],
    // Tertiary stays link-style (no border, no fill) but reserves a
    // 44 x 44 invisible tap area so the WCAG 2.5.5 minimum is met.
    // items-center on .base centers the text within the min-height.
    variant === "tertiary" && "min-h-[44px] text-[15px]",
    className,
  );

  const arrow =
    variant === "tertiary" ? (
      <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
        →
      </span>
    ) : null;

  const content = (
    <>
      {children}
      {arrow}
    </>
  );

  if (isLink) {
    const a = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
    const href = a.href ?? "";
    // Internal hrefs (start with "/") go through next-intl's Link so the
    // active locale prefix (/de, /en, ...) is injected automatically.
    // Externals (http://, tel:, mailto:, wa.me, etc.) stay as raw <a>.
    const isInternal = href.startsWith("/");
    if (isInternal) {
      return (
        <Link
          href={href}
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={cls}
          target={a.target}
          rel={a.rel}
          onClick={a.onClick}
          aria-label={a["aria-label"]}
        >
          {content}
        </Link>
      );
    }
    return (
      <a ref={ref as React.Ref<HTMLAnchorElement>} className={cls} {...a}>
        {content}
      </a>
    );
  }
  const b = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button ref={ref as React.Ref<HTMLButtonElement>} className={cls} {...b}>
      {content}
    </button>
  );
});
