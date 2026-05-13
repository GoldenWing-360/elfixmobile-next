import { useTranslations } from "next-intl";
import type { BrandDef } from "@/data/brands";
import { cn } from "@/lib/cn";

interface Props {
  brand: BrandDef;
}

export function BrandHero({ brand }: Props) {
  const t = useTranslations("brand_page");

  return (
    <section
      className={cn(
        "relative overflow-hidden bg-gradient-to-br text-white",
        brand.gradient,
      )}
    >
      <div className="mx-auto max-w-6xl px-6 py-24 md:px-8 md:py-32">
        <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-white/55">
          {t("eyebrow")}
        </p>
        <h1 className="mt-5 text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[1.04] tracking-[-0.03em]">
          {t("title_prefix")} {brand.label}{" "}
          <span className="block text-white/70">{t("title_suffix")}</span>
        </h1>
        <p className="mt-7 max-w-2xl text-[18px] leading-[1.55] text-white/75">
          {t("sub", { brand: brand.label, search: brand.searchTerms })}
        </p>

        <div className="mt-10 flex flex-wrap gap-x-10 gap-y-4 text-[14px]">
          <div className="flex items-center gap-2 text-white/85">
            <span aria-hidden className="text-white/55">·</span>
            {t("trust_warranty")}
          </div>
          <div className="flex items-center gap-2 text-white/85">
            <span aria-hidden className="text-white/55">·</span>
            {t("trust_express")}
          </div>
          <div className="flex items-center gap-2 text-white/85">
            <span aria-hidden className="text-white/55">·</span>
            {t("trust_parts")}
          </div>
          <div className="flex items-center gap-2 text-white/85">
            <span aria-hidden className="text-white/55">·</span>
            {t("trust_rating")}
          </div>
        </div>
      </div>
    </section>
  );
}
