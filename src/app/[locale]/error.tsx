"use client";

import { useEffect } from "react";

// Per-locale unexpected-error boundary. error.tsx requires a Client
// component because it receives a reset() callback to retry the failing
// render. We log via console.error so OpenNext's Worker pipes the trace
// into Cloudflare logs.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[error.tsx]", error);
  }, [error]);

  return (
    <section className="bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <div className="mx-auto max-w-2xl px-6 py-32 md:px-8 md:py-40 text-center">
        <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
          Fehler
        </p>
        <h1 className="mt-5 text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[1.04] tracking-[-0.03em]">
          Da ist etwas schiefgelaufen.
        </h1>
        <p className="mt-7 text-[18px] leading-[1.55] text-white/70">
          Tut uns leid — wir konnten die Seite gerade nicht laden. Versuch es
          noch einmal, oder ruf direkt an.
        </p>
        {error.digest && (
          <p className="mt-3 text-[12px] font-mono text-white/40">
            Fehler-Code: {error.digest}
          </p>
        )}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-6 py-3 text-[15px] font-medium text-white"
          >
            Nochmal versuchen
          </button>
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
