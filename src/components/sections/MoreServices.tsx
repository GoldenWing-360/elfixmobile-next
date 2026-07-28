import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Smartphone, Banknote, Repeat, Headphones } from "lucide-react";

/**
 * "Mehr als nur Reparatur" — picks up four service lines from the WP
 * incumbent that the rebuild had dropped:
 *
 *   1. Tarif-Beratung (A1, Magenta, Drei): authorized reseller for all
 *      three Austrian carriers — customer can sign a contract on the spot.
 *   2. Handy-Kauf mit 0% Finanzierung (Santander): the shop also sells
 *      new devices and offers Santander instalment financing on the
 *      purchase (NOT on repairs).
 *   3. An- und Verkauf: used-device buy + sell.
 *   4. Zubehör: accessories (cases, cables, screen protectors) walk-in.
 *
 * Layout: single 4-tile grid on light bg. Partner logos as colored
 * text-pills (brand colours) until real SVGs land in public/partners/.
 *
 * No deep-link routes for these services yet — taps go to /kontakt with
 * a topic query string so Natalja sees what the customer is asking
 * about. Building dedicated pages is a future step if these convert.
 */

type Tile = {
  icon: typeof Smartphone;
  titleKey: string;
  bodyKey: string;
  /** Optional partner-pill row rendered between title and CTA */
  partners?: { label: string; color: string }[];
  ctaKey: string;
  href: { pathname: string; query: Record<string, string> };
};

const TILES: Tile[] = [
  {
    icon: Smartphone,
    titleKey: "tarif_title",
    bodyKey: "tarif_body",
    partners: [
      { label: "A1", color: "#E40521" },
      { label: "Magenta", color: "#E20074" },
      { label: "Drei", color: "#FF6900" },
    ],
    ctaKey: "tarif_cta",
    href: { pathname: "/kontakt", query: { topic: "tarif" } },
  },
  {
    icon: Banknote,
    titleKey: "finance_title",
    bodyKey: "finance_body",
    partners: [{ label: "Santander 0%", color: "#EC0000" }],
    ctaKey: "finance_cta",
    href: { pathname: "/kontakt", query: { topic: "kauf-finanzierung" } },
  },
  {
    icon: Repeat,
    titleKey: "trade_title",
    bodyKey: "trade_body",
    ctaKey: "trade_cta",
    href: { pathname: "/kontakt", query: { topic: "an-und-verkauf" } },
  },
  {
    icon: Headphones,
    titleKey: "accessories_title",
    bodyKey: "accessories_body",
    ctaKey: "accessories_cta",
    href: { pathname: "/kontakt", query: { topic: "zubehoer" } },
  },
];

export function MoreServices() {
  const t = useTranslations("more_services");
  return (
    <section className="relative bg-[var(--color-bg-secondary)] text-[var(--color-text-dark)]">
      <div className="mx-auto max-w-7xl px-6 py-24 md:px-8 md:py-36">
        <header className="max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
            {t("eyebrow")}
          </p>
          <h2 className="mt-4 t-h1">
            {t("headline")}
          </h2>
          <p className="mt-5 max-w-2xl text-[17px] leading-[1.55] text-[#525257]">
            {t("sub")}
          </p>
        </header>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 md:mt-20 lg:grid-cols-4">
          {TILES.map((tile) => {
            const Icon = tile.icon;
            return (
              <Link
                key={tile.titleKey}
                href={tile.href}
                className="group flex flex-col rounded-3xl bg-white p-7 ring-1 ring-black/[0.06] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(0,0,0,0.05),0_20px_40px_-20px_rgba(0,0,0,0.18)]"
              >
                <Icon className="h-6 w-6 text-[var(--color-text-dark)]" strokeWidth={1.5} />
                <h3 className="mt-7 text-[20px] font-semibold tracking-[-0.01em]">
                  {t(tile.titleKey)}
                </h3>
                <p className="mt-3 text-[15px] leading-[1.55] text-[#525257]">
                  {t(tile.bodyKey)}
                </p>

                {tile.partners && (
                  <ul className="mt-5 flex flex-wrap gap-1.5">
                    {tile.partners.map((p) => (
                      <li
                        key={p.label}
                        className="rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white"
                        style={{ backgroundColor: p.color }}
                      >
                        {p.label}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-auto flex items-center gap-1.5 pt-7 text-[14px] font-medium text-[var(--color-accent)]">
                  {t(tile.ctaKey)}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
