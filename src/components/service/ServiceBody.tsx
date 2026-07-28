import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { ServiceDef } from "@/data/services";
import { getArticle } from "@/lib/blog";

interface Props {
  service: ServiceDef;
}

const PROCESS_KEYS = ["step_1", "step_2", "step_3"] as const;
const FAQ_KEYS = ["q_duration", "q_warranty", "q_data", "q_pickup"] as const;

// Contextual guide/glossary links per service — internal linking between
// the money pages and the migrated blog content (German-only, so the
// block renders only for the de locale).
const RELATED_ARTICLES: Record<string, string[]> = {
  display: [
    "handy-display-kaputt-reparieren-oder-neu-kaufen",
    "handy-reparatur-kosten-wien-preisliste",
    "panzerfolie-vs-panzerglas-vs-liquid-schutz",
  ],
  battery: ["iphone-akku-tauschen-kosten", "smartphone-akku-sparen-tipps", "glossar-akkuzyklus"],
  water_damage: ["handy-ins-wasser-gefallen-was-tun", "glossar-ip68-wasserdicht"],
  data_recovery: ["handy-backup-daten-sichern-anleitung", "handy-daten-uebertragen-alt-auf-neu"],
  unlock: ["glossar-simlock", "glossar-esim"],
  camera: ["glossar-ois-bildstabilisierung", "haeufigste-handy-schaeden-vermeiden"],
  wrap: ["panzerfolie-vs-panzerglas-vs-liquid-schutz", "handy-huelle-test-vergleich-2026"],
  tablet: ["ipad-air-pro-reparatur-wien", "handy-reparatur-vs-applecare-vergleich"],
  notebook: ["e-waste-vermeiden-reparieren-statt-wegwerfen", "handy-reparatur-kosten-wien-preisliste"],
  macbook: ["e-waste-vermeiden-reparieren-statt-wegwerfen", "handy-reparatur-kosten-wien-preisliste"],
  ipad: ["ipad-air-pro-reparatur-wien", "handy-reparatur-vs-applecare-vergleich"],
  charging_port: ["glossar-usb-c", "glossar-schnellladen-handy", "glossar-wireless-charging"],
};

export function ServiceBody({ service }: Props) {
  const t = useTranslations(`services_page.${service.key}`);
  const tCommon = useTranslations("services_page.common");
  const locale = useLocale();
  const related =
    locale === "de"
      ? (RELATED_ARTICLES[service.key] ?? [])
          .map((slug) => getArticle(slug))
          .filter((a): a is NonNullable<typeof a> => Boolean(a))
      : [];

  return (
    <>
      {/* What's included */}
      <section className="bg-[var(--color-bg-secondary)] text-[var(--color-text-dark)]">
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-8 md:py-28">
          <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
            {tCommon("included_eyebrow")}
          </p>
          <h2 className="mt-4 text-[clamp(1.875rem,4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.02em]">
            {t("included_headline")}
          </h2>
          <p className="mt-4 max-w-2xl text-[16px] text-[#525257]">
            {t("included_sub")}
          </p>

          <ul className="mt-10 grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            {(["bullet_1", "bullet_2", "bullet_3", "bullet_4", "bullet_5", "bullet_6"] as const).map(
              (k) => (
                <li
                  key={k}
                  className="flex items-start gap-3 text-[15px] leading-[1.5] text-[#525257]"
                >
                  <span
                    aria-hidden
                    className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]"
                  />
                  <span>{t(k)}</span>
                </li>
              ),
            )}
          </ul>
        </div>
      </section>

      {/* 3-step process */}
      <section className="bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-8 md:py-28">
          <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
            {tCommon("process_eyebrow")}
          </p>
          <h2 className="mt-4 text-[clamp(1.875rem,4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.02em]">
            {tCommon("process_headline")}
          </h2>

          <ol className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
            {PROCESS_KEYS.map((k, i) => (
              <li key={k} className="relative">
                <div className="text-[14px] font-semibold text-[var(--color-accent)]">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="mt-3 text-[20px] font-semibold tracking-[-0.01em]">
                  {t(`${k}.title`)}
                </h3>
                <p className="mt-3 text-[15px] leading-[1.55] text-white/65">
                  {t(`${k}.body`)}
                </p>
              </li>
            ))}
          </ol>

          <div className="mt-14 flex flex-wrap gap-3">
            <Link
              href={service.hasOnlineQuote ? "/preisrechner" : "/buchen"}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-accent)] px-7 py-4 text-[15px] font-medium text-white transition-transform hover:scale-[1.02]"
            >
              {service.hasOnlineQuote
                ? tCommon("cta_primary_quote")
                : tCommon("cta_primary_book")}
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/kontakt"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-4 text-[15px] font-medium text-white transition-colors hover:bg-white/10"
            >
              {tCommon("cta_secondary")}
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[var(--color-bg-secondary)] text-[var(--color-text-dark)]">
        <div className="mx-auto max-w-4xl px-6 py-20 md:px-8 md:py-28">
          <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
            {tCommon("faq_eyebrow")}
          </p>
          <h2 className="mt-4 text-[clamp(1.875rem,4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.02em]">
            {tCommon("faq_headline")}
          </h2>
          <dl className="mt-12 divide-y divide-black/10">
            {FAQ_KEYS.map((k) => (
              <div key={k} className="py-7">
                <dt className="text-[18px] font-semibold tracking-[-0.01em]">
                  {t(`${k}.q`)}
                </dt>
                <dd className="mt-3 text-[16px] leading-[1.6] text-[#525257]">
                  {t(`${k}.a`)}
                </dd>
              </div>
            ))}
          </dl>

          {/* Wiener Reparaturbon — real partner business, strong local
              conversion + trust signal on every service page */}
          <aside className="mt-12 rounded-3xl bg-white p-7 ring-1 ring-black/[0.05]">
            <h3 className="text-[17px] font-semibold tracking-[-0.01em]">
              {tCommon("reparaturbon_title")}
            </h3>
            <p className="mt-2 text-[15px] leading-[1.55] text-[#525257]">
              {tCommon("reparaturbon_body")}
              {locale === "de" && (
                <>
                  {" "}
                  <Link
                    href="/blog/wiener-reparaturbon-handy-reparatur"
                    className="font-medium text-[var(--color-accent)] underline underline-offset-2"
                  >
                    {tCommon("reparaturbon_link")}
                  </Link>
                </>
              )}
            </p>
          </aside>

          {related.length > 0 && (
            <div className="mt-12">
              <h3 className="text-[17px] font-semibold tracking-[-0.01em]">
                {tCommon("related_headline")}
              </h3>
              <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {related.map((a) => (
                  <li key={a.slug}>
                    <Link
                      href={`/blog/${a.slug}`}
                      className="block rounded-2xl bg-white px-5 py-4 text-[14.5px] font-medium text-black ring-1 ring-black/[0.05] transition-colors hover:bg-[var(--color-accent)] hover:text-white"
                    >
                      {a.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
