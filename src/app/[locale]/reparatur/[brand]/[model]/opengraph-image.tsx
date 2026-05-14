import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { getModel, allBrandModelPairs } from "@/data/brands";
import { routing } from "@/i18n/routing";

export const alt = "EL Fix Mobile — Modell-Reparatur";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

// 876 (locale × brand × model) prerenders. Same caveat as the brand OG:
// keeps the runtime work out of the Worker's request path.
export function generateStaticParams() {
  const out: { locale: string; brand: string; model: string }[] = [];
  for (const locale of routing.locales) {
    for (const { brandSlug, modelSlug } of allBrandModelPairs()) {
      out.push({ locale, brand: brandSlug, model: modelSlug });
    }
  }
  return out;
}

export default async function ModelOg({
  params,
}: {
  params: Promise<{ locale: string; brand: string; model: string }>;
}) {
  const { brand: brandSlug, model: modelSlug } = await params;
  const pair = getModel(brandSlug, modelSlug);
  if (!pair) {
    return renderOg({
      eyebrow: "HANDY REPARATUR WIEN",
      primary: "EL Fix Mobile.",
    });
  }
  return renderOg({
    eyebrow: `${pair.brand.label.toUpperCase()} REPARATUR WIEN`,
    primary: pair.model.full_name,
    secondary: "Festpreis. 12 Mon. Garantie.",
  });
}
