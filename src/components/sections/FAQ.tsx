"use client";

import { useTranslations } from "next-intl";
import { FaqSplit } from "@/components/FaqSplit";

// Same 8 Q/A pairs as the dedicated /faq page — the home section is a
// consistent teaser rendered through the sitewide FaqSplit pattern.
const KEYS = [
  "express",
  "warranty",
  "data",
  "price",
  "parts",
  "pickup",
  "pay",
  "hours",
] as const;

export function FAQ() {
  const t = useTranslations("faq");
  return (
    <FaqSplit
      id="faq"
      eyebrow={t("eyebrow")}
      headline={t("h1")}
      items={KEYS.map((k) => ({
        q: t(`q_${k}_q` as "q_express_q"),
        a: t(`q_${k}_a` as "q_express_a"),
      }))}
    />
  );
}
