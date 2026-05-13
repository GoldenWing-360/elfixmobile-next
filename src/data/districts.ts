/**
 * Geo-landing registry for Vienna districts and neighbouring municipalities.
 * Same URL convention as services (top-level slug at /[locale]/<slug>/) — the
 * [service] dynamic route enumerates both registries in generateStaticParams
 * and dispatches by slug.
 *
 * The slugs deliberately match the WP incumbent (handy-reparatur-...-wien
 * pattern) so external backlinks survive when the canonical flips.
 */

export type DistrictSlug =
  | "handy-reparatur-aspern-seestadt"
  | "handy-reparatur-donaustadt"
  | "handy-reparatur-floridsdorf"
  | "handy-reparatur-gaenserndorf-niederoesterreich";

export interface DistrictDef {
  slug: DistrictSlug;
  /** Short key used for i18n namespace lookup (geo_page.<key>) */
  key: "aspern_seestadt" | "donaustadt" | "floridsdorf" | "gaenserndorf";
  /** Hero gradient — same Tailwind classes idiom as services */
  gradient: string;
  /** Vienna postal codes covered by this district (used in copy) */
  postalCodes: ReadonlyArray<string>;
  /** Approximate distance from the shop in km; informs the pickup-cost line */
  distanceKm: number;
  /** Pickup classification: "free" means inside our zero-cost zone,
   * "surcharge" means we still come but add a small fee, "external" means
   * we recommend ship-by-post. */
  pickup: "free" | "surcharge" | "external";
}

export const DISTRICTS: ReadonlyArray<DistrictDef> = [
  {
    slug: "handy-reparatur-aspern-seestadt",
    key: "aspern_seestadt",
    gradient: "from-sky-950 to-indigo-950",
    postalCodes: ["1220"],
    distanceKm: 1,
    pickup: "free",
  },
  {
    slug: "handy-reparatur-donaustadt",
    key: "donaustadt",
    gradient: "from-blue-950 to-cyan-950",
    postalCodes: ["1220"],
    distanceKm: 5,
    pickup: "free",
  },
  {
    slug: "handy-reparatur-floridsdorf",
    key: "floridsdorf",
    gradient: "from-emerald-950 to-teal-950",
    postalCodes: ["1210"],
    distanceKm: 8,
    pickup: "free",
  },
  {
    slug: "handy-reparatur-gaenserndorf-niederoesterreich",
    key: "gaenserndorf",
    gradient: "from-stone-900 to-amber-950",
    postalCodes: ["2230", "2231"],
    distanceKm: 25,
    pickup: "surcharge",
  },
] as const;

export function getDistrict(slug: string): DistrictDef | undefined {
  return DISTRICTS.find((d) => d.slug === slug);
}
