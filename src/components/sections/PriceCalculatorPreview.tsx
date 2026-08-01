import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Smartphone, Battery, Droplets } from "lucide-react";

/**
 * Replaces the previous "fake calculator preview with clickable tabs"
 * section. That design was visually schizophrenic: the right card
 * looked like a functional calculator while the left CTA said
 * "Vollständigen Preisrechner öffnen" — so the visitor was uncertain
 * whether the card on the right was real or sample.
 *
 * New design: three real price tiles for the three most-asked repairs
 * (iPhone display, Samsung display, iPad battery). Each tile deep-links
 * into /preisrechner with brand+model+repair pre-filled, so a tap goes
 * straight to a result page instead of starting from step 1.
 *
 * The prices are real values from pricing.json (260/200/150 EUR), not
 * placeholders. Showing real numbers is the cleanest "in 10 Sekunden
 * zum Festpreis" demonstration — readers see actual prices and trust
 * the rest.
 */

const TILES = [
  {
    icon: Smartphone,
    brand_label: "Apple",
    model_label: "iPhone 16 Pro Max",
    repair_label: "Display",
    price: 260,
    query: {
      brand: "apple-iphone",
      model: "iPhone 16 Pro Max",
      repairs: "display",
    },
    accent: "from-zinc-900 to-zinc-800",
  },
  {
    icon: Smartphone,
    brand_label: "Samsung",
    model_label: "Galaxy S25 Ultra",
    repair_label: "Display",
    price: 230,
    query: {
      brand: "samsung-galaxy",
      model: "Samsung S25 Ultra",
      repairs: "display",
    },
    accent: "from-blue-950 to-blue-900",
  },
  {
    icon: Battery,
    brand_label: "Apple",
    model_label: "iPad Pro 11 (2025)",
    repair_label: "Akku",
    price: 150,
    query: {
      brand: "apple-ipad",
      model: "iPad Pro 11 (2025)",
      repairs: "battery",
    },
    accent: "from-emerald-950 to-emerald-900",
  },
] as const;

export function PriceCalculatorPreview() {
  const t = useTranslations("calc");
  return (
    <section
      id="calc"
      className="relative bg-[var(--color-bg-secondary)] text-[var(--color-text-dark)]"
    >
      <div className="mx-auto max-w-7xl px-6 py-24 md:px-8 md:py-36">
        <header className="max-w-2xl">
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

        {/* Real-price tiles. Each tile is a single fully-clickable
         * surface that deep-links to /preisrechner pre-filled — tap →
         * land on the result screen, no walk-through. */}
        <div className="mt-14 grid grid-cols-1 gap-5 md:mt-20 md:grid-cols-3">
          {TILES.map((tile) => {
            const Icon = tile.icon;
            return (
              <Link
                key={`${tile.brand_label}-${tile.model_label}-${tile.repair_label}`}
                href={{ pathname: "/preisrechner", query: tile.query }}
                className="group relative overflow-hidden rounded-3xl bg-white p-7 ring-1 ring-black/[0.06] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.10)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(0,0,0,0.05),0_20px_40px_-20px_rgba(0,0,0,0.18)]"
              >
                <div
                  aria-hidden
                  className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tile.accent}`}
                />
                <div className="flex items-start justify-between">
                  <Icon className="h-6 w-6 text-[var(--color-text-dark)]" strokeWidth={1.5} />
                  <div className="rounded-full bg-black/[0.04] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[#6e6e73]">
                    {tile.repair_label}
                  </div>
                </div>

                <div className="mt-10">
                  <div className="text-[12px] font-medium uppercase tracking-[0.18em] text-[#86868B]">
                    {tile.brand_label} · {tile.model_label}
                  </div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-[12px] uppercase tracking-[0.16em] text-[#6e6e73]">
                      ab
                    </span>
                    <span className="t-h1 leading-none tabular-nums">
                      {tile.price}
                    </span>
                    <span className="text-[24px] font-medium text-[#86868B]">€</span>
                  </div>
                  <p className="mt-2 text-[12.5px] text-[#86868B]">
                    inkl. Ersatzteil, Einbau, 12 Monate Garantie
                  </p>
                </div>

                <div className="mt-7 flex items-center gap-1.5 text-[14px] font-medium text-[var(--color-accent)]">
                  Diese Reparatur buchen
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Single CTA to the full calculator for everything else. */}
        <div className="mt-12 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[15px] text-[#525257]">
            Anderes Modell oder Reparatur? Komplett-Rechner deckt 219 Modelle ab.
          </p>
          <Link
            href="/preisrechner"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--color-text-dark)] px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-black"
          >
            <Droplets className="h-4 w-4" aria-hidden style={{ display: "none" }} />
            {t("open_calc")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
