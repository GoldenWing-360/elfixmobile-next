import { useTranslations } from "next-intl";
import type { BrandDef } from "@/data/brands";
import { FaqSplit } from "@/components/FaqSplit";

interface Props {
  brand: BrandDef;
}

const FAQ_KEYS = ["q_express", "q_warranty", "q_originalparts", "q_pickup"] as const;

export function BrandFAQ({ brand }: Props) {
  const t = useTranslations("brand_page.faq");
  return (
    <FaqSplit
      dark
      eyebrow={t("eyebrow")}
      headline={t("headline", { brand: brand.label })}
      items={FAQ_KEYS.map((k) => ({
        q: t(`${k}.q`, { brand: brand.label }),
        a: t(`${k}.a`, { brand: brand.label }),
      }))}
    />
  );
}
