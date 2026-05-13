// Root layout is intentionally a pass-through so the locale layout below
// owns <html lang> and <body>. Next.js 16 still requires a root layout.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
