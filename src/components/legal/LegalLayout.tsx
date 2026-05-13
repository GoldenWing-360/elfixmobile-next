import type { ReactNode } from "react";

export function LegalLayout({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <section className="relative bg-[var(--color-bg-secondary)] text-[var(--color-text-dark)]">
      <div className="mx-auto max-w-2xl px-6 py-24 md:px-8 md:py-32">
        <header className="border-b border-black/[0.08] pb-10">
          <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-[clamp(2.25rem,5vw,3.75rem)] font-semibold leading-[1.06] tracking-[-0.025em]">
            {title}
          </h1>
          {updated && (
            <p className="mt-3 text-[13px] text-[#6e6e73]">
              Stand: {updated}
            </p>
          )}
        </header>
        <article className="legal-prose mt-10 text-[15.5px] leading-[1.65] text-[#3a3a3a] md:text-[16px]">
          {children}
        </article>
      </div>
    </section>
  );
}
