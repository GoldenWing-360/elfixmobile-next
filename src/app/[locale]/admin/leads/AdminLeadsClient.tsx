"use client";

import { useEffect, useState } from "react";

type LeadStatus = "received" | "confirmed" | "in_progress" | "done";

interface Lead {
  id: string;
  status: LeadStatus;
  ts: string;
  status_updated_at?: string;
  payload:
    | {
        type: "booking";
        service: string;
        device: string;
        damage?: string;
        total?: number | null;
        contact: { name: string; email: string; phone?: string; message?: string };
      }
    | {
        type: "contact";
        name: string;
        email: string;
        phone?: string;
        message: string;
      };
}

const STATUSES: LeadStatus[] = ["received", "confirmed", "in_progress", "done"];

export function AdminLeadsClient() {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<LeadStatus | "all">("all");

  async function load() {
    setError(null);
    try {
      const res = await fetch("/api/admin/leads", { credentials: "include" });
      if (res.status === 401) {
        // Basic-Auth prompt fires automatically when www-authenticate
        // header lands. After the user enters credentials the browser
        // retries this request with the Authorization header attached;
        // we don't need to manage state here.
        setError("Bitte einloggen (Basic-Auth-Dialog)");
        return;
      }
      if (!res.ok) {
        setError(`Fehler ${res.status}`);
        return;
      }
      const data = (await res.json()) as { leads: Lead[] };
      data.leads.sort((a, b) => (a.ts < b.ts ? 1 : -1));
      setLeads(data.leads);
    } catch (e) {
      setError(String(e));
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function setStatus(id: string, status: LeadStatus) {
    const res = await fetch("/api/admin/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id, status }),
    });
    if (!res.ok) {
      alert(`update failed (${res.status})`);
      return;
    }
    await load();
  }

  const filtered = leads?.filter((l) => filter === "all" || l.status === filter) ?? [];

  return (
    <section className="bg-[var(--color-bg-secondary)] text-[var(--color-text-dark)]">
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-8 md:py-28">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
              ADMIN
            </p>
            <h1 className="mt-3 t-h2">
              Leads ({leads?.length ?? "—"})
            </h1>
          </div>
          <button
            type="button"
            onClick={load}
            className="rounded-full bg-black px-5 py-2.5 text-[14px] font-medium text-white"
          >
            Refresh
          </button>
        </div>

        <div className="mt-7 flex flex-wrap gap-2">
          {(["all", ...STATUSES] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={`rounded-full px-4 py-2 text-[13px] font-medium transition-colors ${
                filter === s
                  ? "bg-black text-white"
                  : "bg-black/[0.04] text-[#1d1d1f] hover:bg-black/[0.08]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {error && (
          <p className="mt-8 rounded-2xl border border-amber-500/40 bg-amber-500/[0.06] p-4 text-[14px] text-amber-900">
            {error}
          </p>
        )}

        <ul className="mt-8 space-y-3">
          {filtered.map((lead) => {
            // Narrow once via the discriminated union so subsequent
            // accesses don't need cast-spaghetti.
            const p = lead.payload;
            const name = p.type === "booking" ? p.contact.name : p.name;
            const email = p.type === "booking" ? p.contact.email : p.email;
            const summary =
              p.type === "booking"
                ? `${p.device} · ${p.service}${
                    p.total ? ` · € ${p.total}` : ""
                  }`
                : p.message.slice(0, 90);

            return (
              <li
                key={lead.id}
                className="rounded-3xl border border-black/[0.06] bg-white p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-[10.5px] font-mono uppercase tracking-[0.16em] text-[#86868B]">
                      {lead.id.slice(0, 8)} · {new Date(lead.ts).toLocaleString("de-AT")}
                    </div>
                    <div className="mt-1 text-[16px] font-semibold tracking-[-0.005em]">
                      {name}{" "}
                      <span className="text-[#86868B] font-normal">— {email}</span>
                    </div>
                    <div className="mt-1 text-[15px] text-[#525257]">{summary}</div>
                  </div>
                  <div className="flex gap-1">
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatus(lead.id, s)}
                        className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${
                          lead.status === s
                            ? "bg-[var(--color-accent)] text-white"
                            : "bg-black/[0.04] text-[#1d1d1f] hover:bg-black/[0.08]"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <details className="mt-3">
                  <summary className="cursor-pointer text-[12px] text-[#86868B]">
                    raw payload
                  </summary>
                  <pre className="mt-2 max-h-60 overflow-auto rounded-xl bg-black/[0.04] p-3 text-[11px] leading-tight font-mono">
                    {JSON.stringify(lead.payload, null, 2)}
                  </pre>
                </details>
              </li>
            );
          })}
          {leads && filtered.length === 0 && (
            <li className="rounded-3xl border border-black/[0.06] bg-white p-7 text-[14px] text-[#86868B]">
              Keine Leads in diesem Filter.
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}
