import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { getBrand, BRANDS } from "@/data/brands";
import { routing } from "@/i18n/routing";

export const alt = "EL Fix Mobile — Brand-Reparatur";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

// Static prerender for the 32 (locale × brand) combinations so social
// scrapers get the per-brand image without the Worker doing on-demand
// Satori work on every share-event.
export function generateStaticParams() {
  const out: { locale: string; brand: string }[] = [];
  for (const locale of routing.locales) {
    for (const b of BRANDS) {
      out.push({ locale, brand: b.slug });
    }
  }
  return out;
}

export default async function BrandOg({
  params,
}: {
  params: Promise<{ locale: string; brand: string }>;
}) {
  const { brand: brandSlug } = await params;
  const brand = getBrand(brandSlug);
  if (!brand) {
    return renderOg({
      eyebrow: "HANDY REPARATUR WIEN",
      primary: "EL Fix Mobile.",
    });
  }
  return renderOg({
    eyebrow: `${brand.label.toUpperCase()} REPARATUR WIEN`,
    primary: `${brand.label}.`,
    secondary: "Wie neu, in 30 Min.",
  });
}
