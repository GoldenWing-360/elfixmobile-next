import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Link } from "@/i18n/navigation";
import { Check, Clock, Wrench, PackageCheck } from "lucide-react";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Status = "received" | "confirmed" | "in_progress" | "done";

interface StoredLead {
  id: string;
  status: Status;
  ts: string;
  payload:
    | { type: "booking"; service: string; device: string; total?: number | null; contact: { name: string; email: string; phone?: string } }
    | { type: "contact"; name: string; email: string; phone?: string; message: string };
}

interface KvLike {
  get: (key: string) => Promise<string | null>;
}

async function fetchLead(id: string): Promise<StoredLead | null> {
  try {
    const ctx = getCloudflareContext();
    const kv = (ctx.env as unknown as { LEADS_KV?: KvLike }).LEADS_KV;
    if (!kv) return null;
    // Guard against KV-injection: only allow UUID-shaped ids so a crafted
    // key like "rl:..." or "ddp:..." can't be fetched through this route.
    if (!/^[0-9a-f-]{32,40}$/i.test(id)) return null;
    const raw = await kv.get(`lead:${id}`);
    if (!raw) return null;
    return JSON.parse(raw) as StoredLead;
  } catch {
    return null;
  }
}

export const metadata: Metadata = {
  title: "Reparatur-Status",
  description: "Status deiner Reparatur bei EL Fix Mobile.",
  robots: { index: false, follow: false }, // contains personal data
};

const STEPS: { key: Status; label: string; icon: typeof Check }[] = [
  { key: "received", label: "Eingegangen", icon: Check },
  { key: "confirmed", label: "Bestätigt", icon: Clock },
  { key: "in_progress", label: "In Reparatur", icon: Wrench },
  { key: "done", label: "Fertig zur Abholung", icon: PackageCheck },
];

function statusIndex(s: Status): number {
  return STEPS.findIndex((step) => step.key === s);
}

export default async function StatusPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const lead = await fetchLead(id);
  if (!lead) notFound();

  const current = statusIndex(lead.status);
  const created = new Date(lead.ts);

  // Extract user-facing fields without leaking the raw IP / honeypot etc.
  let summaryLines: string[] = [];
  let customerName = "";
  if (lead.payload.type === "booking") {
    customerName = lead.payload.contact.name;
    summaryLines = [
      `Gerät: ${lead.payload.device}`,
      `Service: ${lead.payload.service}`,
      lead.payload.total != null ? `Geschätzter Preis: € ${lead.payload.total}` : "",
    ].filter(Boolean);
  } else {
    customerName = lead.payload.name;
    summaryLines = [`Nachricht: ${lead.payload.message.slice(0, 120)}${lead.payload.message.length > 120 ? "…" : ""}`];
  }

  return (
    <section className="bg-[var(--color-bg-secondary)] text-[var(--color-text-dark)]">
      <div className="mx-auto max-w-3xl px-6 py-24 md:px-8 md:py-32">
        <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
          Reparatur-Status
        </p>
        <h1 className="mt-4 text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.06] tracking-[-0.025em]">
          Hallo {customerName}.
        </h1>
        <p className="mt-5 text-[16px] text-[#525257]">
          Eingang: {created.toLocaleString("de-AT")}
          <br />
          Auftrags-ID: <span className="font-mono">{lead.id.slice(0, 8)}…</span>
        </p>

        <ol className="mt-12 grid gap-3">
          {STEPS.map((step, i) => {
            const done = i < current;
            const active = i === current;
            const Icon = step.icon;
            return (
              <li
                key={step.key}
                className={cn(
                  "flex items-center gap-4 rounded-2xl border px-5 py-4",
                  done && "border-[var(--color-success)]/30 bg-[var(--color-success)]/[0.05]",
                  active && "border-[var(--color-accent)]/40 bg-[var(--color-accent)]/[0.05]",
                  !done && !active && "border-black/[0.08] bg-white",
                )}
              >
                <span
                  className={cn(
                    "grid h-10 w-10 shrink-0 place-items-center rounded-full",
                    done && "bg-[var(--color-success)] text-white",
                    active && "bg-[var(--color-accent)] text-white",
                    !done && !active && "bg-black/[0.04] text-[#86868B]",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-[15px] font-medium tracking-[-0.005em]">
                    {step.label}
                  </div>
                  <div className="text-[12.5px] text-[#86868B]">
                    {done
                      ? "Erledigt"
                      : active
                        ? "Aktuell"
                        : "Folgt"}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-12 rounded-2xl bg-white p-6 ring-1 ring-black/[0.04]">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#86868B]">
            Deine Anfrage
          </div>
          <ul className="mt-3 space-y-1 text-[14.5px] text-[#1d1d1f]">
            {summaryLines.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        </div>

        <p className="mt-12 text-[13px] text-[#525257]">
          Frage zum Status? Ruf uns direkt an unter{" "}
          <a href="tel:+436606071414" className="text-[var(--color-accent)] hover:underline">
            +43 660 6071414
          </a>{" "}
          und nenne deine Auftrags-ID.
        </p>

        <p className="mt-3 text-[12px] text-[#86868B]">
          <Link href="/" className="hover:underline">
            ← Zur Startseite
          </Link>
        </p>
      </div>
    </section>
  );
}
