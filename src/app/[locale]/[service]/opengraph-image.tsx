import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { getService, SERVICES } from "@/data/services";
import { getDistrict, DISTRICTS } from "@/data/districts";
import { routing } from "@/i18n/routing";

export const alt = "EL Fix Mobile — Reparatur in Wien";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const SERVICE_TITLES: Record<string, string> = {
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

const DISTRICT_TITLES: Record<string, string> = {
  aspern_seestadt: "Aspern Seestadt",
  donaustadt: "Donaustadt",
  floridsdorf: "Floridsdorf",
  gaenserndorf: "Gänserndorf & NÖ",
};

export function generateStaticParams() {
  // Two registries share the [service] slot — service slugs and district
  // slugs. The matching component dispatches at request time; the OG
  // prerender does the same up front.
  const out: { locale: string; service: string }[] = [];
  for (const locale of routing.locales) {
    for (const s of SERVICES) out.push({ locale, service: s.slug });
    for (const d of DISTRICTS) out.push({ locale, service: d.slug });
  }
  return out;
}

export default async function ServiceOrDistrictOg({
  params,
}: {
  params: Promise<{ locale: string; service: string }>;
}) {
  const { service: slug } = await params;
  const service = getService(slug);
  if (service) {
    return renderOg({
      eyebrow: "REPARATUR WIEN",
      primary: SERVICE_TITLES[service.key] ?? service.slug,
      secondary: service.priceRange
        ? `ab € ${service.priceRange.from}.`
        : "Festpreis nach Diagnose.",
    });
  }
  const district = getDistrict(slug);
  if (district) {
    return renderOg({
      eyebrow: "HANDY REPARATUR",
      primary: DISTRICT_TITLES[district.key] ?? district.slug,
      secondary: "Express, Walk-in oder Abholung.",
    });
  }
  return renderOg({
    eyebrow: "HANDY REPARATUR WIEN",
    primary: "EL Fix Mobile.",
  });
}
