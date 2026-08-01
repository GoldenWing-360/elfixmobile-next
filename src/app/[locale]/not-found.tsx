import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

// Per-locale 404. Picked up by Next 16's `not-found.tsx` convention
// whenever notFound() is called from a route in this segment.
export default async function NotFound() {
  const t = await getTranslations("not_found");
  return (
    <section className="bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <div className="mx-auto max-w-3xl px-6 py-24 md:px-8 md:py-36 text-center">
        <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
          {t("eyebrow")}
        </p>
        <h1 className="mt-5 t-h1">
          {t("headline")}
        </h1>
        <p className="mt-7 text-[18px] leading-[1.55] text-white/70">
          {t("body")}
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-6 py-3 text-[15px] font-medium text-white"
          >
            {t("cta_home")} →
          </Link>
          <a
            href="tel:+436606071414"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-[15px] font-medium"
          >
            +43 660 6071414
          </a>
        </div>
      </div>
    </section>
  );
}
