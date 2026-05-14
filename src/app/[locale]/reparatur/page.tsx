import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BRANDS } from "@/data/brands";
import { SERVICES } from "@/data/services";
import { SITE, alternateLanguagesFor } from "@/lib/seo";
import { ArrowRight } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const title = "Reparatur — alle Marken & Services | EL Fix Mobile Wien";
  const description =
    "Wir reparieren iPhone, Samsung, Xiaomi, Google Pixel und mehr in Wien 1220 Aspern. Festpreise, 12 Monate Garantie, Express in 30 Minuten.";
  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/reparatur`,
      languages: alternateLanguagesFor("/reparatur"),
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: `${SITE.url}/${locale}/reparatur`,
      siteName: SITE.name,
    },
  };
}

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

export default async function ReparaturHubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await getTranslations({ locale });

  return (
    <>
      <section className="bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
        <div className="mx-auto max-w-5xl px-6 py-24 md:px-8 md:py-32">
          <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
            REPARATUR
          </p>
          <h1 className="mt-5 text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[1.04] tracking-[-0.03em]">
            Wir reparieren alle.
          </h1>
          <p className="mt-7 max-w-2xl text-[18px] leading-[1.55] text-white/70">
            8 Marken mit Festpreisen, 219 Modelle, alle Reparatur-Arten. Wähle
            deine Marke unten oder direkt eine Reparatur-Art.
          </p>
        </div>
      </section>

      {/* Brands grid */}
      <section className="bg-[var(--color-bg-secondary)] text-[var(--color-text-dark)]">
        <div className="mx-auto max-w-5xl px-6 py-20 md:px-8 md:py-28">
          <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.02em]">
            Marke wählen
          </h2>
          <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {BRANDS.map((b) => (
              <li key={b.slug}>
                <Link
                  href={`/reparatur/${b.slug}`}
                  className="group flex flex-col items-center justify-center gap-4 rounded-2xl border border-black/[0.06] bg-white p-7 transition-colors hover:bg-black/[0.02]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/brands/${b.slug}.svg`}
                    alt=""
                    aria-hidden
                    className="h-10 w-10 opacity-80"
                  />
                  <div className="text-center">
                    <div className="text-[16px] font-semibold tracking-[-0.005em]">
                      {b.label}
                    </div>
                    <div className="mt-0.5 text-[12px] text-[#86868B]">
                      {b.modelCount} Modelle
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          <h2 className="mt-20 text-[clamp(1.75rem,4vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.02em]">
            Direkt zur Reparatur-Art
          </h2>
          <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/${s.slug}`}
                  className="group flex items-center justify-between rounded-2xl border border-black/[0.06] bg-white px-5 py-4 transition-colors hover:bg-black/[0.02]"
                >
                  <span className="text-[15px] font-medium">
                    {SERVICE_LABELS[s.key] ?? s.slug}
                  </span>
                  <ArrowRight className="h-4 w-4 text-[var(--color-accent)] transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
