import { SITE } from "@/lib/seo";
import { SERVICES } from "@/data/services";
import { BRANDS } from "@/data/brands";
import { DISTRICTS } from "@/data/districts";
import { getGlossar, getRatgeber } from "@/lib/blog";
import de from "@/messages/de.json";
import pricing from "@/data/pricing.json";

/**
 * llms.txt — structured business summary for AI crawlers and answer
 * engines (ChatGPT, Claude, Perplexity, Google AI Overviews). Generated
 * at build time from the same data the pages render, so it can't drift.
 * Convention: https://llmstxt.org
 */

export const dynamic = "force-static";

const serviceLabels = de.service_labels as Record<string, string>;

export function GET() {
  const services = SERVICES.map((s) => {
    const label = serviceLabels[s.key] ?? s.key;
    const price = s.priceRange ? ` (ab € ${s.priceRange.from})` : " (Preis auf Anfrage)";
    return `- [${label}](${SITE.url}/de/${s.slug})${price}`;
  }).join("\n");

  const brands = BRANDS.map(
    (b) => `- [${b.label} Reparatur](${SITE.url}/de/reparatur/${b.slug}) — ${b.modelCount}+ Modelle`,
  ).join("\n");

  const districts = DISTRICTS.map(
    (d) => `- ${SITE.url}/de/${d.slug}`,
  ).join("\n");

  const guides = getRatgeber()
    .map((a) => `- [${a.title}](${SITE.url}/de/blog/${a.slug})`)
    .join("\n");

  const glossary = getGlossar()
    .map((a) => `- [${a.title}](${SITE.url}/de/blog/${a.slug})`)
    .join("\n");

  const iphones = pricing.brands["apple-iphone"].models as unknown as {
    slug: string;
    full_name: string;
    prices: Record<string, number | undefined>;
  }[];
  const priceExamples = ["iphone-16", "iphone-15", "iphone-14", "iphone-13", "iphone-12"]
    .map((slug) => iphones.find((m) => m.slug === slug))
    .filter((m): m is NonNullable<typeof m> => Boolean(m))
    .map((m) => {
      const parts = [
        m.prices.display != null ? `Display € ${m.prices.display}` : null,
        m.prices.battery != null ? `Akku € ${m.prices.battery}` : null,
      ].filter(Boolean);
      return `- [${m.full_name}](${SITE.url}/de/reparatur/apple/${m.slug}): ${parts.join(", ")}`;
    })
    .join("\n");

  const body = `# EL Fix Mobile — Handy Reparatur Wien 1220 (Seestadt Aspern)

> Express-Werkstatt für Smartphone-, Tablet- und Notebook-Reparaturen in Wien-Donaustadt. Festpreis vor der Reparatur, kostenlose Diagnose, die meisten Reparaturen in 30 Minuten. 12 Monate Garantie auf Ersatzteil und Einbau.

## Fakten

- Firma: ${SITE.legalName} (Inhaberin: ${SITE.owner}, gegründet ${SITE.foundingDate})
- Adresse: ${SITE.address.street}, ${SITE.address.postalCode} ${SITE.address.locality}, Österreich
- Telefon: ${SITE.phoneDisplay} · E-Mail: ${SITE.email}
- Öffnungszeiten: Montag–Samstag 09:00–19:00 Uhr, Sonntag geschlossen
- Google-Bewertung: ${SITE.rating.value} von 5 (${SITE.rating.count} Bewertungen)
- Zertifizierungen: ${SITE.credentials.join(", ")}
- Anfahrt: U2 Aspern Nord / Seestadt, Bus 97A, Parkplätze vorhanden
- Gratis Abholservice in Wien ab € 70 Reparaturwert

## Kurzantworten

- Was kostet eine Handy-Reparatur in Wien? Festpreis pro Modell und Reparatur, vorab im Preisrechner sichtbar. Display ab € 30, Akku ab € 20 (günstigste Modelle), alle Preise inkl. MwSt.
- Wie lange dauert eine Reparatur? Die meisten Reparaturen dauern ${pricing.meta.express_minutes} Minuten, die Diagnose ist kostenlos.
- Welche Garantie gibt es? ${pricing.meta.warranty_months} Monate Garantie auf Ersatzteil und Einbau.
- Wann ist geöffnet? Montag bis Samstag 09:00 bis 19:00 Uhr, Sonntag geschlossen. Walk-in ohne Termin.
- Wo ist die Werkstatt? ${SITE.address.street}, ${SITE.address.postalCode} ${SITE.address.locality}.

## Preisbeispiele (Festpreis inkl. MwSt., Stand ${pricing.meta.updated})

${priceExamples}

## Services

${services}

## Marken

${brands}

## Bezirks-Seiten

${districts}

## Ratgeber

${guides}

## Glossar

${glossary}

## Weitere Seiten

- [Preisrechner](${SITE.url}/de/preisrechner) — Festpreis in 10 Sekunden
- [Termin buchen](${SITE.url}/de/buchen)
- [Kontakt](${SITE.url}/de/kontakt)
- [Über uns](${SITE.url}/de/ueber-uns)
- [FAQ](${SITE.url}/de/faq)
- [Bewertungen](${SITE.url}/de/bewertungen)
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=86400",
    },
  });
}
