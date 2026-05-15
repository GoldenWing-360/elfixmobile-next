import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Link } from "@/i18n/navigation";
import { Check, Clock, Wrench, PackageCheck } from "lucide-react";
import { cn } from "@/lib/cn";
import { verifyLeadToken } from "@/lib/lead-token";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "status_page" });
  return {
    title: t("meta_title"),
    description: t("meta_description"),
    robots: { index: false, follow: false }, // contains personal data
  };
}

function statusIndex(s: Status, keys: readonly Status[]): number {
  return keys.findIndex((k) => k === s);
}

// Map locale → BCP-47 for date formatting; falls back to en-GB to avoid
// US m/d/y on unknown locales.
const DATE_LOCALES: Record<string, string> = {
  de: "de-AT",
  en: "en-GB",
  ru: "ru-RU",
  tr: "tr-TR",
};

export default async function StatusPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { locale, id } = await params;
  const { t: token } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("status_page");

  // HMAC gate: in production STATUS_TOKEN_SECRET is set, so a valid token
  // is required. Locally (no secret), we fall back to the previous
  // unsigned-UUID behaviour so dev keeps working.
  const tokenOk = await verifyLeadToken(id, token, { allowUnsigned: true });
  if (!tokenOk) notFound();

  const lead = await fetchLead(id);
  if (!lead) notFound();

  const stepKeys: Status[] = ["received", "confirmed", "in_progress", "done"];
  const stepIcons: Record<Status, typeof Check> = {
    received: Check,
    confirmed: Clock,
    in_progress: Wrench,
    done: PackageCheck,
  };
  const stepLabels: Record<Status, string> = {
    received: t("step_received"),
    confirmed: t("step_confirmed"),
    in_progress: t("step_in_progress"),
    done: t("step_done"),
  };

  const current = statusIndex(lead.status, stepKeys);
  const created = new Date(lead.ts);

  // Extract user-facing fields without leaking the raw IP / honeypot etc.
  let summaryLines: string[] = [];
  let customerName = "";
  if (lead.payload.type === "booking") {
    customerName = lead.payload.contact.name;
    summaryLines = [
      `${t("summary_device")}: ${lead.payload.device}`,
      `${t("summary_service")}: ${lead.payload.service}`,
      lead.payload.total != null
        ? `${t("summary_price")}: € ${lead.payload.total}`
        : "",
    ].filter(Boolean);
  } else {
    customerName = lead.payload.name;
    summaryLines = [
      `${t("summary_message")}: ${lead.payload.message.slice(0, 120)}${lead.payload.message.length > 120 ? "…" : ""}`,
    ];
  }

  const dateLocale = DATE_LOCALES[locale] ?? "en-GB";

  return (
    <section className="bg-[var(--color-bg-secondary)] text-[var(--color-text-dark)]">
      <div className="mx-auto max-w-3xl px-6 py-24 md:px-8 md:py-32">
        <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
          {t("eyebrow")}
        </p>
        <h1 className="mt-4 text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.06] tracking-[-0.025em]">
          {t("hello", { name: customerName })}
        </h1>
        <p className="mt-5 text-[16px] text-[#525257]">
          {t("received_at")}: {created.toLocaleString(dateLocale)}
          <br />
          {t("order_id")}: <span className="font-mono">{lead.id.slice(0, 8)}…</span>
        </p>

        <ol className="mt-12 grid gap-3">
          {stepKeys.map((stepKey, i) => {
            const done = i < current;
            const active = i === current;
            const Icon = stepIcons[stepKey];
            return (
              <li
                key={stepKey}
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
                    {stepLabels[stepKey]}
                  </div>
                  <div className="text-[12.5px] text-[#86868B]">
                    {done
                      ? t("step_state_done")
                      : active
                        ? t("step_state_current")
                        : t("step_state_upcoming")}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-12 rounded-2xl bg-white p-6 ring-1 ring-black/[0.04]">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#86868B]">
            {t("summary_label")}
          </div>
          <ul className="mt-3 space-y-1 text-[14.5px] text-[#1d1d1f]">
            {summaryLines.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        </div>

        <p className="mt-12 text-[13px] text-[#525257]">
          {t("footer_question")}{" "}
          <a href="tel:+436606071414" className="text-[var(--color-accent)] hover:underline">
            +43 660 6071414
          </a>{" "}
          {t("footer_id_note")}
        </p>

        <p className="mt-3 text-[12px] text-[#86868B]">
          <Link href="/" className="hover:underline">
            ← {t("back_home")}
          </Link>
        </p>
      </div>
    </section>
  );
}
