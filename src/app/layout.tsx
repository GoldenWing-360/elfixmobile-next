import type { Metadata } from "next";
import { SITE } from "@/lib/seo";

// Root layout is a pass-through so the locale layout owns <html lang> and <body>.
// metadataBase here resolves absolute URLs for the root-level opengraph-image.
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
