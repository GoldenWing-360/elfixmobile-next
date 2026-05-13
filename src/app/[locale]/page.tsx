import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/hero/Hero";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      {/* Sektionen 2-9 kommen nach Hero-Approval */}
      <section className="h-[60vh] bg-[var(--color-bg-secondary)] text-[var(--color-text-dark)]">
        <div className="mx-auto flex h-full max-w-7xl items-center px-8">
          <p className="text-sm text-[var(--color-text-muted)]">
            Sektion 2 - 9 kommen nach deinem OK auf den Hero.
          </p>
        </div>
      </section>
    </>
  );
}
