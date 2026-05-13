/**
 * Service registry powering the per-service SEO landing pages at
 * /[locale]/<slug>/. Slugs intentionally match the WordPress incumbent
 * (display-reparatur-wien, akku-tausch-wien, …) so external backlinks
 * keep working when we eventually flip the canonical domain.
 *
 * The same slug is used for every locale — they target German queries
 * primarily (Vienna market), and the locale prefix + meta + content
 * carries the language signal. Splitting slugs per locale would require
 * next-intl `pathnames` config and isn't worth the complexity yet.
 */

export type ServiceSlug =
  | "display-reparatur-wien"
  | "akku-tausch-wien"
  | "datenrettung-handy-wien"
  | "wasserschaden-handy-reparatur-wien"
  | "handy-entsperren-wien"
  | "handy-folierung-wien";

export interface PriceRange {
  from: number;
  to: number;
}

export interface ServiceDef {
  slug: ServiceSlug;
  /** Concise English/Latin label for code/i18n keys (not shown to users) */
  key: string;
  /** Tailwind gradient for the hero background */
  gradient: string;
  /** Optional price range in EUR; omitted for services we don't price online */
  priceRange?: PriceRange;
  /** ~minutes for an in-shop express repair (used in copy) */
  durationMinutes?: number;
  /** True when the service flows into /preisrechner (i.e. displayed price);
   * false when only /buchen makes sense (custom diagnostic, e.g. data
   * recovery). */
  hasOnlineQuote: boolean;
}

export const SERVICES: ReadonlyArray<ServiceDef> = [
  {
    slug: "display-reparatur-wien",
    key: "display",
    gradient: "from-zinc-900 to-zinc-800",
    priceRange: { from: 30, to: 600 },
    durationMinutes: 30,
    hasOnlineQuote: true,
  },
  {
    slug: "akku-tausch-wien",
    key: "battery",
    gradient: "from-emerald-950 to-emerald-900",
    priceRange: { from: 20, to: 180 },
    durationMinutes: 30,
    hasOnlineQuote: true,
  },
  {
    slug: "datenrettung-handy-wien",
    key: "data_recovery",
    gradient: "from-indigo-950 to-indigo-900",
    // Data recovery is highly variable; we quote case-by-case rather than
    // promise a price band that could mislead users with severe damage.
    hasOnlineQuote: false,
  },
  {
    slug: "wasserschaden-handy-reparatur-wien",
    key: "water_damage",
    gradient: "from-sky-950 to-sky-900",
    hasOnlineQuote: false,
  },
  {
    slug: "handy-entsperren-wien",
    key: "unlock",
    gradient: "from-amber-950 to-amber-900",
    hasOnlineQuote: false,
  },
  {
    slug: "handy-folierung-wien",
    key: "wrap",
    gradient: "from-fuchsia-950 to-fuchsia-900",
    hasOnlineQuote: false,
  },
] as const;

export function getService(slug: string): ServiceDef | undefined {
  return SERVICES.find((s) => s.slug === slug);
}
