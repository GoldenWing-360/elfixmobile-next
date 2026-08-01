import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { BrandDef } from "@/data/brands";

interface Props {
  brand: BrandDef;
}

/**
 * Variant rendered when the brand has no online price table. We don't want
 * a half-empty table for Xiaomi/Google/etc., so this drives the user to the
 * /buchen flow with the device pre-filled.
 */
export function BrandQuoteCta({ brand }: Props) {
  const t = useTranslations("brand_page");

  return (
    <section className="bg-[var(--color-bg-secondary)] text-[var(--color-text-dark)]">
      <div className="mx-auto max-w-3xl px-6 py-20 md:px-8 md:py-28 text-center">
        <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
          {t("quote_eyebrow")}
        </p>
        <h2 className="mt-4 t-h2">
          {t("quote_headline", { brand: brand.label })}
        </h2>
        <p className="mt-5 mx-auto max-w-2xl text-[17px] leading-[1.55] text-[#525257]">
          {t("quote_sub", { brand: brand.label, count: brand.modelCount })}
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          {/* service=walkin is a sensible default for brands without
           * online prices — it skips the service-picker step so the user
           * lands directly on the device/damage form with the brand
           * pre-filled. They can still switch to pickup/send inside the
           * flow. */}
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

        <ul className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-3 text-left text-[14px] text-[#525257] sm:grid-cols-2">
          <li>{t("quote_bullet_diagnose")}</li>
          <li>{t("quote_bullet_warranty")}</li>
          <li>{t("quote_bullet_pickup")}</li>
          <li>{t("quote_bullet_walkin")}</li>
        </ul>
      </div>
    </section>
  );
}
