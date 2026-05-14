import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Truck, ArrowRight } from "lucide-react";

export function PickupBanner() {
  const t = useTranslations("pickup");
  return (
    <section className="relative bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-8 md:px-8 md:py-12">
        {/* next-intl Link injects the locale prefix automatically; a raw
         * <a href="/buchen"> would 404 on localePrefix:"always". */}
        <Link
          href={{ pathname: "/buchen", query: { service: "pickup" } }}
          className="group relative flex flex-col items-start gap-5 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0f1117] via-[#0b1424] to-[#001a3a] p-7 transition-colors duration-300 hover:border-white/20 md:flex-row md:items-center md:justify-between md:gap-10 md:p-10"
        >
          {/* glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "radial-gradient(circle at 80% 50%, rgba(48,209,88,0.25), transparent 55%), radial-gradient(circle at 10% 80%, rgba(0,113,227,0.18), transparent 55%)",
            }}
          />
          <div className="relative flex items-center gap-5">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[var(--color-success)]/[0.15] text-[var(--color-success)] ring-1 ring-[var(--color-success)]/30">
              <Truck className="h-6 w-6" />
            </span>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white/85">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success)]" />
                {t("pill")}
              </div>
              <h2 className="mt-3 text-[22px] font-semibold tracking-[-0.015em] md:text-[28px]">
                {t("title")}
              </h2>
              <p className="mt-1 max-w-md text-[14.5px] leading-[1.5] text-white/65">
                {t("sub")}
              </p>
            </div>
          </div>
          {/* Single pill, no white-pill-with-bolted-on-black-circle chimera.
           * Arrow lives inside the same rounded button so it reads as one
           * CTA, not two stuck-together shapes. */}
          <span className="relative inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3.5 text-[14.5px] font-medium text-black transition-colors duration-200 group-hover:bg-white/90">
            Abholung anfragen
            <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      </div>
    </section>
  );
}
