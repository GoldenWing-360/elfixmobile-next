import { useTranslations } from "next-intl";
import type { ServiceDef } from "@/data/services";
import { cn } from "@/lib/cn";

interface Props {
  service: ServiceDef;
}

export function ServiceHero({ service }: Props) {
  const t = useTranslations(`services_page.${service.key}`);
  const tCommon = useTranslations("services_page.common");

  return (
    <section
      className={cn(
        "relative overflow-hidden bg-gradient-to-br text-white",
        service.gradient,
      )}
    >
      <div className="mx-auto max-w-6xl px-6 py-24 md:px-8 md:py-32">
        <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-white/55">
          {tCommon("eyebrow")}
        </p>
        <h1 className="mt-5 text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[1.04] tracking-[-0.03em]">
          {t("h1")}
        </h1>
        <p className="mt-7 max-w-2xl text-[18px] leading-[1.55] text-white/75">
          {t("intro")}
        </p>

        <div className="mt-10 flex flex-wrap gap-x-10 gap-y-4 text-[14px]">
          {service.durationMinutes && (
            <div className="flex items-center gap-2 text-white/85">
              <span aria-hidden className="text-white/55">·</span>
              {tCommon("trust_express", { minutes: service.durationMinutes })}
            </div>
          )}
          <div className="flex items-center gap-2 text-white/85">
            <span aria-hidden className="text-white/55">·</span>
            {tCommon("trust_warranty")}
          </div>
          <div className="flex items-center gap-2 text-white/85">
            <span aria-hidden className="text-white/55">·</span>
            {tCommon("trust_rating")}
          </div>
          {service.priceRange && (
            <div className="flex items-center gap-2 text-white/85">
              <span aria-hidden className="text-white/55">·</span>
              {tCommon("trust_price", {
                from: service.priceRange.from,
                to: service.priceRange.to,
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
