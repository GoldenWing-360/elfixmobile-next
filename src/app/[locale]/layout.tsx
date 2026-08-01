import "../globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { StickyMobileCTAGate } from "@/components/StickyMobileCTAGate";
import { CookieBanner } from "@/components/CookieBanner";
import { ChromeGate } from "@/components/ChromeGate";
import { Analytics } from "@/components/Analytics";
import { SITE, alternateLanguagesFor, localBusinessJsonLd } from "@/lib/seo";

// Routes that render WITHOUT the customer-facing chrome (admin panel +
// per-customer status page). Server-side detection via Next 16's request
// URL — falls back to client-side gate in <ChromeGate> if the URL isn't
// readable.
const NO_CHROME_PATTERNS = ["/admin", "/status/"];

async function isChromelessRoute(): Promise<boolean> {
  try {
    const h = await headers();
    // Look at every header that conventionally carries the request URL.
    // CF Workers + Next + OpenNext all populate different ones depending
    // on the runtime path, so we scan all of them.
    const candidates = [
      h.get("x-pathname"),
      h.get("x-matched-path"),
      h.get("x-invoke-path"),
      h.get("next-url"),
      h.get("x-forwarded-uri"),
      h.get("x-original-uri"),
      h.get("cf-worker-path"),
      // Last-resort: the next-router-state-tree header includes the
      // segment names for the current render in a JSON-ish blob.
      h.get("next-router-state-tree"),
    ];
    const joined = candidates.filter(Boolean).join(" ");
    return NO_CHROME_PATTERNS.some((p) => joined.includes(p));
  } catch {
    return false;
  }
}

const inter = Inter({
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const LOCALE_TITLES: Record<string, { title: string; desc: string; ogLocale: string }> = {
  de: {
    title: "Handy Reparatur Wien 1220 | iPhone und Samsung Express | EL Fix Mobile",
    desc: "Wiens schnellste Handy Reparatur in Aspern Seestadt. iPhone, Samsung, Xiaomi, iPad. Express in 30 Minuten. 12 Monate Garantie. Originalteile.",
    ogLocale: "de_AT",
  },
  en: {
    title: "Phone Repair Vienna 1220 | iPhone and Samsung Express | EL Fix Mobile",
    desc: "Vienna's fastest phone repair in Aspern Seestadt. iPhone, Samsung, Xiaomi, iPad. 30-minute express service. 12-month warranty. Original parts.",
    ogLocale: "en_US",
  },
  ru: {
    title: "Ремонт телефонов Вена 1220 | iPhone и Samsung экспресс | EL Fix Mobile",
    desc: "Самый быстрый ремонт телефонов в Вене 1220 Aspern Seestadt. iPhone, Samsung, Xiaomi, iPad. Экспресс за 30 минут. Гарантия 12 месяцев.",
    ogLocale: "ru_RU",
  },
  tr: {
    title: "Telefon tamiri Viyana 1220 | iPhone ve Samsung ekspres | EL Fix Mobile",
    desc: "Viyana 1220 Aspern Seestadt'ta en hızlı telefon tamiri. iPhone, Samsung, Xiaomi, iPad. 30 dakika ekspres. 12 ay garanti. Orijinal parça.",
    ogLocale: "tr_TR",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const t = LOCALE_TITLES[safeLocale];
  const alts = alternateLanguagesFor("/");

  return {
    metadataBase: new URL(SITE.url),
    title: {
      default: t.title,
      template: `%s | ${SITE.name}`,
    },
    description: t.desc,
    alternates: {
      canonical: `/${safeLocale}`,
      languages: alts,
    },
    openGraph: {
      images: [{ url: `${SITE.url}/opengraph-image`, width: 1200, height: 630 }],
      type: "website",
      locale: t.ogLocale,
      url: SITE.url,
      siteName: SITE.name,
      title: t.title,
      description: t.desc,
    },
    twitter: {
      card: "summary_large_image",
      title: t.title,
      description: t.desc,
    },
    // Test-domain (bersaev.com) gets noindex/nofollow so Google can't
    // accidentally pick it up while elfixmobile.at production is still
    // live. The check happens at request time (Worker reads SITE.url
    // from NEXT_PUBLIC_SITE_URL); flip the env var on cutover and the
    // robots flag becomes index: true automatically.
    robots: (() => {
      try {
        const host = new URL(SITE.url).host;
        if (host.endsWith("bersaev.com")) {
          return { index: false, follow: false };
        }
      } catch {
        // noop
      }
      return { index: true, follow: true };
    })(),
    other: {
      "geo.region": "AT-9",
      "geo.placename": "Wien",
      "geo.position": `${SITE.geo.latitude};${SITE.geo.longitude}`,
      ICBM: `${SITE.geo.latitude}, ${SITE.geo.longitude}`,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  const chromeless = await isChromelessRoute();

  return (
    <html
      lang={locale}
      className={`${inter.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] antialiased">
        {/* LocalBusiness JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessJsonLd(locale)),
          }}
        />
        {/* Cloudflare Web Analytics — cookie-free, privacy-first visitor
          * counter. The token is a public site-tag (not a secret), so
          * hardcoding it is fine. Dashboard:
          * https://dash.cloudflare.com/?to=/:account/analytics/web-analytics */}
        <script
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "b7957042348e4e50a40b14611f75def2"}'
        />
        <Analytics />
        <NextIntlClientProvider>
            {/* Two-layer chrome gate: server-side (via request headers)
             * keeps the SSR HTML clean, client-side ChromeGate is the
             * fallback for runtimes where the headers don't expose the
             * inbound pathname. Both gates target the same admin/status
             * route patterns. */}
            {!chromeless && (
              <ChromeGate>
                <Nav />
              </ChromeGate>
            )}
            <main className="relative" id="main-content">
              {children}
            </main>
            {!chromeless && (
              <ChromeGate>
                <Footer />
                <WhatsAppFloat />
                <StickyMobileCTAGate />
                <CookieBanner />
              </ChromeGate>
            )}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
