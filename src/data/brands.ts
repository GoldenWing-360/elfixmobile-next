/**
 * Brand registry powering the per-brand SEO landing pages at
 * /[locale]/reparatur/[brand]/. The slugs here drive the route segment, so
 * keep them URL-safe (lowercase, hyphenated) and stable — they appear in
 * sitemap entries and Google's index.
 *
 * pricingBuckets lists keys in src/data/pricing.json whose models belong to
 * this brand. Empty array = no online prices, the page renders the on-request
 * variant with a /buchen CTA instead of a price table.
 */
import pricing from "./pricing.json";

export type BrandSlug =
  | "apple"
  | "samsung"
  | "xiaomi"
  | "google"
  | "huawei"
  | "oneplus"
  | "sony"
  | "nokia";

export interface BrandModel {
  slug: string;
  name: string;
  full_name: string;
  year: number | null;
  prices: Record<string, number>;
}

export interface BrandDef {
  slug: BrandSlug;
  label: string;
  searchTerms: string;
  pricingBuckets: ReadonlyArray<keyof typeof pricing.brands>;
  hasOnlinePrices: boolean;
  /** modelCount is the visible "X models" label, may be a marketing-round
   * number for brands without pricing data. */
  modelCount: number;
  /** Tailwind gradient classes mirror the BrandGallery cards so brand pages
   * keep a visual thread to the home grid. */
  gradient: string;
  accent: string;
}

export const BRANDS: ReadonlyArray<BrandDef> = [
  {
    slug: "apple",
    label: "Apple",
    searchTerms: "iPhone, iPad, Apple Watch, MacBook",
    pricingBuckets: ["apple-iphone", "apple-ipad", "apple-watch"],
    hasOnlinePrices: true,
    modelCount: 97,
    gradient: "from-zinc-900 to-zinc-800",
    accent: "#A1A1A6",
  },
  {
    slug: "samsung",
    label: "Samsung",
    searchTerms: "Galaxy S, Galaxy A, Galaxy Z Fold, Galaxy Z Flip, Galaxy Note",
    pricingBuckets: ["samsung-galaxy", "samsung-a"],
    hasOnlinePrices: true,
    modelCount: 122,
    gradient: "from-blue-950 to-blue-900",
    accent: "#1428A0",
  },
  {
    slug: "xiaomi",
    label: "Xiaomi",
    searchTerms: "Mi, Redmi, POCO",
    pricingBuckets: [],
    hasOnlinePrices: false,
    modelCount: 60,
    gradient: "from-orange-950 to-orange-900",
    accent: "#FF6900",
  },
  {
    slug: "google",
    label: "Google Pixel",
    searchTerms: "Pixel, Pixel Pro, Pixel Fold",
    pricingBuckets: [],
    hasOnlinePrices: false,
    modelCount: 24,
    gradient: "from-sky-950 to-sky-900",
    accent: "#4285F4",
  },
  {
    slug: "huawei",
    label: "Huawei",
    searchTerms: "P-Serie, Mate, Nova",
    pricingBuckets: [],
    hasOnlinePrices: false,
    modelCount: 38,
    gradient: "from-red-950 to-red-900",
    accent: "#C7000B",
  },
  {
    slug: "oneplus",
    label: "OnePlus",
    searchTerms: "OnePlus Pro, Nord",
    pricingBuckets: [],
    hasOnlinePrices: false,
    modelCount: 28,
    gradient: "from-red-900 to-zinc-900",
    accent: "#EB0029",
  },
  {
    slug: "sony",
    label: "Sony",
    searchTerms: "Xperia",
    pricingBuckets: [],
    hasOnlinePrices: false,
    modelCount: 18,
    gradient: "from-slate-900 to-zinc-900",
    accent: "#000000",
  },
  {
    slug: "nokia",
    label: "Nokia",
    searchTerms: "Nokia Smartphones",
    pricingBuckets: [],
    hasOnlinePrices: false,
    modelCount: 22,
    gradient: "from-blue-900 to-zinc-900",
    accent: "#124191",
  },
] as const;

export function getBrand(slug: string): BrandDef | undefined {
  return BRANDS.find((b) => b.slug === slug);
}

export function getModelsForBrand(brand: BrandDef): BrandModel[] {
  const models: BrandModel[] = [];
  for (const bucket of brand.pricingBuckets) {
    const list = pricing.brands[bucket]?.models ?? [];
    for (const m of list as BrandModel[]) {
      models.push(m);
    }
  }
  return models;
}

export function getModel(
  brandSlug: string,
  modelSlug: string,
): { brand: BrandDef; model: BrandModel } | undefined {
  const brand = getBrand(brandSlug);
  if (!brand) return undefined;
  const model = getModelsForBrand(brand).find((m) => m.slug === modelSlug);
  if (!model) return undefined;
  return { brand, model };
}

/** Enumerate every (brand, model) pair across the price-tabled brands. Used
 * by the model-page generateStaticParams; cardinality is 219 today. */
export function allBrandModelPairs(): { brandSlug: BrandSlug; modelSlug: string }[] {
  const pairs: { brandSlug: BrandSlug; modelSlug: string }[] = [];
  for (const brand of BRANDS) {
    if (!brand.hasOnlinePrices) continue;
    for (const m of getModelsForBrand(brand)) {
      pairs.push({ brandSlug: brand.slug, modelSlug: m.slug });
    }
  }
  return pairs;
}
