"use client";

import { useId, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { MessageCircle, Phone, Plus } from "lucide-react";

interface FaqItem {
  q: string;
  a: string;
}

interface Props {
  eyebrow: string;
  headline: string;
  /** Optional intro line under the headline (used on /faq). */
  sub?: string;
  items: FaqItem[];
  /** Dark sections (brand/model/faq pages) vs. light (home/services). */
  dark?: boolean;
  /** Render the headline as h1 (standalone /faq page) instead of h2. */
  titleAs?: "h1" | "h2";
  /** Anchor id for in-page links (home uses #faq). */
  id?: string;
  /** Extra blocks below the accordion (Reparaturbon, related links). */
  children?: ReactNode;
}

const PHONE_TEL = "tel:+436606071414";
const PHONE_LABEL = "+43 660 6071414";
const WHATSAPP = "https://wa.me/436606071414";

/**
 * The one FAQ pattern of the site: editorial split on the Full grid —
 * sticky header + contact CTAs left, collapsible answers right.
 * Mirrors the ProcessSteps split so long-list sections read the same
 * everywhere (home, services, brands, models, /faq).
 */
export function FaqSplit({
  eyebrow,
  headline,
  sub,
  items,
  dark = false,
  titleAs = "h2",
  id,
  children,
}: Props) {
  const tFaq = useTranslations("faq");
  const [open, setOpen] = useState<number | null>(0);
  const uid = useId();
  const Title = titleAs;

  return (
    <section
      id={id}
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
              <Title className={`mt-4 ${titleAs === "h1" ? "t-h1" : "t-h2"}`}>
                {headline}
              </Title>
              {sub && (
                <p
                  className={`mt-5 max-w-2xl text-[17px] leading-[1.55] ${
                    dark ? "text-white/70" : "text-[#525257]"
                  }`}
                >
                  {sub}
                </p>
              )}

              {/* Escape hatch: question not answered → direct contact */}
              <p
                className={`mt-8 text-[15px] ${
                  dark ? "text-white/60" : "text-[#6e6e73]"
                }`}
              >
                {tFaq("escape_q")}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href={PHONE_TEL}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-5 py-3 text-[15px] font-medium text-white transition-transform hover:scale-[1.02]"
                >
                  <Phone className="h-4 w-4" aria-hidden />
                  {PHONE_LABEL}
                </a>
                <a
                  href={WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 rounded-full border px-5 py-3 text-[15px] font-medium transition-colors ${
                    dark
                      ? "border-white/15 text-white hover:bg-white/10"
                      : "border-black/15 bg-white text-[var(--color-text-dark)] hover:bg-black/[0.04]"
                  }`}
                >
                  <MessageCircle className="h-4 w-4 text-[#25D366]" aria-hidden />
                  WhatsApp
                </a>
              </div>
            </div>
          </header>

          <div className="md:col-span-7">
            <div
              className={`divide-y ${
                dark ? "divide-white/10" : "divide-black/[0.08]"
              }`}
            >
              {items.map((it, i) => {
                const isOpen = open === i;
                const panelId = `${uid}-faq-${i}`;
                return (
                  <div key={it.q} className="group">
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      className="flex w-full items-center justify-between gap-8 py-6 text-left"
                    >
                      <span className="text-[18px] font-semibold tracking-[-0.005em]">
                        {it.q}
                      </span>
                      <motion.span
                        aria-hidden
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors ${
                          dark
                            ? "bg-white/[0.06] text-white group-hover:bg-white/[0.12]"
                            : "bg-black/[0.04] text-[#1d1d1f] group-hover:bg-black/[0.08]"
                        }`}
                      >
                        <Plus className="h-4 w-4" />
                      </motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          id={panelId}
                          role="region"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{
                            height: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
                            opacity: { duration: 0.25 },
                          }}
                          className="overflow-hidden"
                        >
                          <p
                            className={`pb-6 pr-14 text-[16px] leading-[1.6] ${
                              dark ? "text-white/70" : "text-[#525257]"
                            }`}
                          >
                            {it.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
