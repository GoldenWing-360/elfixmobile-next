import type { ReactNode } from "react";

interface FaqItem {
  q: string;
  a: string;
}

interface Props {
  eyebrow: string;
  headline: string;
  items: FaqItem[];
  /** Dark sections (brand/model pages) vs. light (service pages). */
  dark?: boolean;
  /** Escape hatch under the sticky header ("Frage nicht dabei? …"). */
  note?: ReactNode;
  /** Extra blocks rendered below the list (Reparaturbon, related links). */
  children?: ReactNode;
}

/**
 * The one FAQ layout of the site: editorial split on the Full grid —
 * sticky header left, answers right. Mirrors the ProcessSteps pattern
 * so every long-list section reads the same way.
 */
export function FaqSplit({ eyebrow, headline, items, dark = false, note, children }: Props) {
  return (
    <section
      className={
        dark
          ? "bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]"
          : "bg-[var(--color-bg-secondary)] text-[var(--color-text-dark)]"
      }
    >
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-8 md:py-28">
        <div className="grid grid-cols-1 gap-x-10 gap-y-12 md:grid-cols-12">
          <header className="md:col-span-5">
            <div className="md:sticky md:top-28">
              <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
                {eyebrow}
              </p>
              <h2 className="mt-4 t-h2">{headline}</h2>
              {note && (
                <p
                  className={`mt-6 max-w-2xl text-[15px] leading-[1.55] ${
                    dark ? "text-white/60" : "text-[#6e6e73]"
                  }`}
                >
                  {note}
                </p>
              )}
            </div>
          </header>

          <div className="md:col-span-7">
            <dl className={`divide-y ${dark ? "divide-white/10" : "divide-black/10"}`}>
              {items.map((it) => (
                <div key={it.q} className="py-7 first:pt-0">
                  <dt className="text-[18px] font-semibold tracking-[-0.01em]">
                    {it.q}
                  </dt>
                  <dd
                    className={`mt-3 text-[16px] leading-[1.6] ${
                      dark ? "text-white/70" : "text-[#525257]"
                    }`}
                  >
                    {it.a}
                  </dd>
                </div>
              ))}
            </dl>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
