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

const inter = Inter({
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.elfixmobile.at"),
  title: {
    default: "Handy Reparatur Wien 1220 | iPhone & Samsung Express | EL Fix Mobile",
    template: "%s | EL Fix Mobile",
  },
  description:
    "Wiens schnellste Handy Reparatur. iPhone, Samsung, Xiaomi. Express in 30 Min. 12 Monate Garantie. Originalteile. Aspern Seestadt.",
  openGraph: {
    type: "website",
    locale: "de_AT",
  },
};

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
        <NextIntlClientProvider>
          <LenisProvider>
            <Nav />
            <main className="relative">{children}</main>
            <Footer />
          </LenisProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
