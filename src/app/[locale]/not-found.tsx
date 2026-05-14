import { Link } from "@/i18n/navigation";

// Per-locale 404. Picked up by Next 16's `not-found.tsx` convention
// whenever notFound() is called from a route in this segment.
export default function NotFound() {
  return (
    <section className="bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <div className="mx-auto max-w-2xl px-6 py-32 md:px-8 md:py-40 text-center">
        <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
          404
        </p>
        <h1 className="mt-5 text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[1.04] tracking-[-0.03em]">
          Diese Seite gibt es nicht.
        </h1>
        <p className="mt-7 text-[18px] leading-[1.55] text-white/70">
          Vielleicht ist die Adresse veraltet, oder wir haben sie umbenannt.
          Geh zur Startseite oder ruf uns kurz an.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-6 py-3 text-[15px] font-medium text-white"
          >
            Zur Startseite →
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
