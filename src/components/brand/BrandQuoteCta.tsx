import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { BrandDef } from "@/data/brands";

interface Props {
  brand: BrandDef;
}

const BULLET_KEYS = [
  "quote_bullet_diagnose",
  "quote_bullet_warranty",
  "quote_bullet_pickup",
  "quote_bullet_walkin",
] as const;

/**
 * Variant rendered when the brand has no online price table. We don't want
 * a half-empty table for Xiaomi/Google/etc., so this drives the user to the
 * /buchen flow with the device pre-filled. Editorial split on the Full
 * grid — copy + CTAs left, the four facts right — same layout system as
 * every other list section.
 */
export function BrandQuoteCta({ brand }: Props) {
  const t = useTranslations("brand_page");

  return (
    <section className="bg-[var(--color-bg-secondary)] text-[var(--color-text-dark)]">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-8 md:py-28">
        <div className="grid grid-cols-1 gap-x-10 gap-y-12 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
              {t("quote_eyebrow")}
            </p>
            <h2 className="mt-4 t-h2">
              {t("quote_headline", { brand: brand.label })}
            </h2>
            <p className="mt-5 max-w-2xl text-[17px] leading-[1.55] text-[#525257]">
              {t("quote_sub", { brand: brand.label, count: brand.modelCount })}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              {/* service=walkin is a sensible default for brands without
               * online prices — it skips the service-picker step so the
               * user lands directly on the device/damage form with the
               * brand pre-filled. */}
              <Link
                href={{
                  pathname: "/buchen",
                  query: { device: brand.label, service: "walkin" },
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-text-dark)] px-7 py-4 text-[15px] font-medium text-white transition-transform hover:scale-[1.02]"
              >
                {t("quote_primary_cta")} <span aria-hidden>→</span>
              </Link>
              <Link
                href="/kontakt"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-black/15 bg-white px-7 py-4 text-[15px] font-medium text-[var(--color-text-dark)] transition-colors hover:bg-black/[0.04]"
              >
                {t("quote_secondary_cta")}
              </Link>
            </div>
          </div>

          <ul className="md:col-span-5 divide-y divide-black/[0.08] self-center">
            {BULLET_KEYS.map((k) => (
              <li
                key={k}
                className="flex items-start gap-3 py-4 text-[15px] leading-[1.5] text-[#525257]"
              >
                <span
                  aria-hidden
                  className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]"
                />
                {t(k)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
