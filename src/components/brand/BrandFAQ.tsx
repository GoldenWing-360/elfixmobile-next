import { useTranslations } from "next-intl";
import type { BrandDef } from "@/data/brands";

interface Props {
  brand: BrandDef;
}

const FAQ_KEYS = ["q_express", "q_warranty", "q_originalparts", "q_pickup"] as const;

export function BrandFAQ({ brand }: Props) {
  const t = useTranslations("brand_page.faq");
  return (
    <section className="bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <div className="mx-auto max-w-3xl px-6 py-14 md:px-8 md:py-20">
        <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
          {t("eyebrow")}
        </p>
        <h2 className="mt-4 t-h2">
          {t("headline", { brand: brand.label })}
        </h2>

        <dl className="mt-12 divide-y divide-white/10">
          {FAQ_KEYS.map((k) => (
            <div key={k} className="py-7">
              <dt className="text-[18px] font-semibold tracking-[-0.01em]">
                {t(`${k}.q`, { brand: brand.label })}
              </dt>
              <dd className="mt-3 text-[16px] leading-[1.6] text-white/70">
                {t(`${k}.a`, { brand: brand.label })}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
