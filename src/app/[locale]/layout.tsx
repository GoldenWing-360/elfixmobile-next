import "../globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { LenisProvider } from "@/components/LenisProvider";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { SITE, alternateLanguagesFor, localBusinessJsonLd } from "@/lib/seo";

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
      canonical: safeLocale === routing.defaultLocale ? "/" : `/${safeLocale}`,
      languages: alts,
    },
    openGraph: {
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
    robots: { index: true, follow: true },
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
        <NextIntlClientProvider>
          <LenisProvider>
            <Nav />
            <main className="relative" id="main-content">
              {children}
            </main>
            <Footer />
            <WhatsAppFloat />
          </LenisProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
