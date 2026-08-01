import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { DistrictDef } from "@/data/districts";
import { SERVICES } from "@/data/services";
import { Phone, MapPin, Truck } from "lucide-react";
import { cn } from "@/lib/cn";

// Service labels are German-only here because the district pages target
// Vienna search queries and don't bother translating the chip text. The
// rest of the page is i18n'd; this is the deliberate inconsistency.
const SERVICE_LABELS: Record<string, string> = {
  display: "Display Reparatur",
  battery: "Akku Tausch",
  data_recovery: "Datenrettung",
  water_damage: "Wasserschaden",
  unlock: "Handy entsperren",
  wrap: "Handy Folierung",
  camera: "Kamera Reparatur",
  tablet: "Tablet Reparatur",
  notebook: "Notebook Reparatur",
};

interface Props {
  district: DistrictDef;
}

/**
 * Geo-landing page body. Hero + 3-card contact block + narrative + service
 * grid linking out to the actual /<service>-reparatur-wien pages so the
 * district page acts as a hub for everything we offer in that area.
 */
export function DistrictView({ district }: Props) {
  const t = useTranslations(`geo_page.${district.key}`);

  return (
    <>
      <section
        className={cn(
          "relative overflow-hidden bg-gradient-to-br text-white",
          district.gradient,
        )}
      >
        <div className="mx-auto max-w-7xl px-6 py-24 md:px-8 md:py-36">
          <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-white/55">
            Wien {district.postalCodes.join(", ")}
          </p>
          <h1 className="mt-5 t-h1">
            {t("h1")}
          </h1>
          <p className="mt-7 max-w-2xl text-[18px] leading-[1.55] text-white/75">
            {t("intro")}
          </p>
          <div className="mt-10 flex flex-wrap gap-x-10 gap-y-3 text-[14px]">
            <span className="flex items-center gap-2 text-white/85">
              <span aria-hidden className="text-white/55">·</span>
              {t("trust_walk")}
            </span>
            <span className="flex items-center gap-2 text-white/85">
              <span aria-hidden className="text-white/55">·</span>
              {t("trust_pickup")}
            </span>
            <span className="flex items-center gap-2 text-white/85">
              <span aria-hidden className="text-white/55">·</span>
              {t("trust_express")}
            </span>
            <span className="flex items-center gap-2 text-white/85">
              <span aria-hidden className="text-white/55">·</span>
              {t("trust_warranty")}
            </span>
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-bg-secondary)] text-[var(--color-text-dark)]">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-8 md:py-28">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <a
              href="tel:+436606071414"
              className="group rounded-3xl border border-black/[0.06] bg-white p-7 transition-colors hover:bg-black/[0.02]"
            >
              <Phone className="h-5 w-5 text-[var(--color-accent)]" />
              <div className="mt-5 text-[11px] font-medium uppercase tracking-[0.18em] text-[#6e6e73]">
                {t("card_call_title")}
              </div>
              <div className="mt-1 text-[18px] font-semibold tracking-[-0.005em]">
                {t("card_call_sub")}
              </div>
            </a>
            <Link
              href="/kontakt"
              className="group rounded-3xl border border-black/[0.06] bg-white p-7 transition-colors hover:bg-black/[0.02]"
            >
              <MapPin className="h-5 w-5 text-[var(--color-accent)]" />
              <div className="mt-5 text-[11px] font-medium uppercase tracking-[0.18em] text-[#6e6e73]">
                {t("card_visit_title")}
              </div>
              <div className="mt-1 text-[16px] font-semibold tracking-[-0.005em] leading-snug">
                {t("card_visit_sub")}
              </div>
            </Link>
            <Link
              href="/buchen?service=pickup"
              className="group rounded-3xl border border-black/[0.06] bg-white p-7 transition-colors hover:bg-black/[0.02]"
            >
              <Truck className="h-5 w-5 text-[var(--color-accent)]" />
              <div className="mt-5 text-[11px] font-medium uppercase tracking-[0.18em] text-[#6e6e73]">
                {t("card_pickup_title")}
              </div>
              <div className="mt-1 text-[16px] font-semibold tracking-[-0.005em] leading-snug">
                {t("card_pickup_sub")}
              </div>
            </Link>
          </div>

          <div className="mt-16 max-w-3xl">
            <h2 className="t-h3">
              {t("section_title")}
            </h2>
            <p className="mt-5 text-[17px] leading-[1.6] text-[#525257]">
              {t("section_body")}
            </p>
          </div>

          <div className="mt-14">
            <h3 className="text-[13px] font-medium uppercase tracking-[0.18em] text-[var(--color-accent)]">
              Beliebte Reparaturen
            </h3>
            {/* Render the first 6 services from the central registry —
             * keeps the district grid in sync if we ever add/remove
             * services without touching this component. */}
            <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICES.slice(0, 6).map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/${s.slug}`}
                    className="group flex items-center justify-between rounded-2xl bg-white px-5 py-4 ring-1 ring-black/[0.06] transition-colors hover:bg-black/[0.02]"
                  >
                    <span className="text-[15px] font-medium">
                      {SERVICE_LABELS[s.key] ?? s.slug}
                    </span>
                    <span aria-hidden className="text-[var(--color-accent)] transition-transform group-hover:translate-x-0.5">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
