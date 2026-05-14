import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { BrandDef, BrandModel } from "@/data/brands";
import { getModelsForBrand } from "@/data/brands";
import { RepairDisclaimer } from "@/components/RepairDisclaimer";
import pricing from "@/data/pricing.json";

interface Props {
  brand: BrandDef;
  limit?: number;
}

// Local label dict for the brand-card table. Kept in sync with the
// canonical labels in @/data/repair-labels.ts — `display` is the full
// module, `display_orig` is glass-only (different repairs, not
// "premium vs OEM" of the same repair).
const REPAIR_LABELS: Record<string, { de: string; en: string; ru: string; tr: string }> = {
  display: {
    de: "Display Komplett",
    en: "Display (full)",
    ru: "Дисплей (модуль)",
    tr: "Ekran (modül)",
  },
  display_orig: {
    de: "Displayglas",
    en: "Display glass",
    ru: "Стекло дисплея",
    tr: "Ekran camı",
  },
  battery: { de: "Akku", en: "Battery", ru: "Аккумулятор", tr: "Pil" },
  charging_port: {
    de: "Ladebuchse",
    en: "Charging Port",
    ru: "Разъём зарядки",
    tr: "Şarj Soketi",
  },
  back_cover: {
    de: "Backcover",
    en: "Back Cover",
    ru: "Задняя крышка",
    tr: "Arka Kapak",
  },
};

const PRIMARY_REPAIRS = ["display", "display_orig", "battery", "charging_port", "back_cover"];

export function BrandModelsTable({ brand, limit = 20 }: Props) {
  const t = useTranslations("brand_page");
  const locale = useLocale() as "de" | "en" | "ru" | "tr";
  const models = getModelsForBrand(brand);
  const visible = models.slice(0, limit);
  const remaining = models.length - visible.length;

  // Compute which repair columns to render (only those with prices in any model).
  const activeCols = PRIMARY_REPAIRS.filter((rk) =>
    visible.some((m) => typeof m.prices[rk] === "number"),
  );

  return (
    <section className="bg-[var(--color-bg-secondary)] text-[var(--color-text-dark)]">
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-8 md:py-28">
        <header className="max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
            {t("table_eyebrow")}
          </p>
          <h2 className="mt-4 text-[clamp(1.875rem,4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.02em]">
            {t("table_headline", { brand: brand.label })}
          </h2>
          <p className="mt-4 text-[16px] text-[#525257]">
            {t("table_sub", { count: models.length, currency: pricing.meta.currency })}
          </p>
        </header>

        <div className="mt-8">
          <RepairDisclaimer />
        </div>

        <div className="mt-8 overflow-x-auto rounded-2xl border border-black/[0.08] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <table className="min-w-full text-left text-[14px]">
            <thead className="bg-black/[0.02] text-[12px] uppercase tracking-[0.12em] text-[#525257]">
              <tr>
                <th className="px-5 py-4 font-medium">{t("table_col_model")}</th>
                {activeCols.map((rk) => (
                  <th key={rk} className="px-5 py-4 font-medium">
                    {REPAIR_LABELS[rk]?.[locale] ?? rk}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Model names are deep-links into the per-model landing
               * (/reparatur/<brand>/<model>). Without these, the brand
               * table was a dead-end for SEO — Google indexed 219 model
               * pages but the brand page didn't actually link to them. */}
              {visible.map((m: BrandModel, i) => (
                <tr
                  key={m.slug}
                  className={
                    i % 2 === 0
                      ? "bg-white hover:bg-[var(--color-accent)]/[0.04]"
                      : "bg-black/[0.015] hover:bg-[var(--color-accent)]/[0.04]"
                  }
                >
                  <td className="p-0">
                    <Link
                      href={`/reparatur/${brand.slug}/${m.slug}`}
                      className="block w-full px-5 py-3.5 font-medium text-[var(--color-text-dark)]"
                    >
                      {m.full_name}
                    </Link>
                  </td>
                  {activeCols.map((rk) => {
                    const price = m.prices[rk];
                    return (
                      <td key={rk} className="px-5 py-3.5 tabular-nums text-[#525257]">
                        {typeof price === "number" ? `${price} €` : "—"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {remaining > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-[14px] text-[#525257]">
              {t("table_more", { count: remaining })}
            </p>
            {/* Link to the dedicated modelle-index page where Google can
             * crawl every model under this brand, instead of bouncing to
             * /preisrechner which is a JS-heavy client island. */}
            <Link
              href={`/reparatur/${brand.slug}/modelle`}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-text-dark)] px-6 py-3 text-[14px] font-medium text-white transition-transform hover:scale-[1.02]"
            >
              {t("table_cta_all")} <span aria-hidden>→</span>
            </Link>
          </div>
        )}

        <p className="mt-6 text-[12px] text-[#86868B]">{pricing.meta.note_de}</p>
      </div>
    </section>
  );
}
