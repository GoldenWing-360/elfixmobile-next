// Minimal locale-wide loading fallback. Avoids the blank white flash on
// dynamic routes (e.g. /status/<id>) while the server handles the
// request.
export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div
        aria-hidden
        className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-white/55"
      />
      <span className="sr-only">Lädt…</span>
    </div>
  );
}
