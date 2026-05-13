import { NextRequest } from "next/server";
import { z } from "zod";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * /api/lead — unified lead intake for the booking flow and the contact form.
 *
 * Hardening layers (in order of when they fire):
 *   1. Honeypot field: any payload with a non-empty `_hp` field is treated
 *      as a bot submission. We pretend success (200 ok) so scrapers can't
 *      tell their attempts are being filtered; nothing is sent.
 *   2. Per-IP rate-limit: 5 requests per 10 minutes from one IP, keyed in
 *      LEADS_KV with TTL. Returns 429 when exceeded.
 *   3. Dedup: hash(email + first 30 chars of device/message) within 1 h is
 *      considered the same lead — answer 200 but skip Resend so the shop
 *      owner doesn't get five copies of an over-eager refresher.
 *   4. Persist: every accepted (non-bot, non-rate-limited) lead is stored
 *      in LEADS_KV under `lead:<uuid>` with 90-day TTL — so even if Resend
 *      ever fails silently we still have the queue.
 *   5. Send via Resend HTTP API. If RESEND_API_KEY isn't set (local dev),
 *      we log and return 200 so the form-success card stays reachable.
 */

export const dynamic = "force-dynamic";

const HoneypotShape = z.object({ _hp: z.string().optional() });

const BookingSchema = z.object({
  type: z.literal("booking"),
  service: z.enum(["walkin", "pickup", "send"]),
  device: z.string().min(1).max(200),
  damage: z.string().max(2000).optional().default(""),
  pickup: z
    .object({
      address: z.string().max(300).optional().default(""),
      floor: z.string().max(50).optional().default(""),
      when: z.enum(["morning", "afternoon", "evening"]).nullable().optional(),
    })
    .optional(),
  date: z.string().max(50).optional().default(""),
  total: z.number().nullable().optional(),
  contact: z.object({
    name: z.string().min(2).max(120),
    email: z.string().email().max(200),
    phone: z.string().max(40).optional().default(""),
    message: z.string().max(4000).optional().default(""),
  }),
});

const ContactSchema = z.object({
  type: z.literal("contact"),
  name: z.string().min(2).max(120),
  email: z.string().email().max(200),
  phone: z.string().max(40).optional().default(""),
  message: z.string().min(5).max(4000),
});

const Schema = z.discriminatedUnion("type", [BookingSchema, ContactSchema]);

const RECIPIENT = "elfixmobile@gmx.at";
const SENDER = "EL Fix Mobile <onboarding@resend.dev>";

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_SEC = 600; // 10 minutes
const DEDUP_TTL_SEC = 3600; // 1 hour
const PERSIST_TTL_SEC = 60 * 60 * 24 * 90; // 90 days

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function renderBookingEmail(payload: z.infer<typeof BookingSchema>): {
  subject: string;
  html: string;
  text: string;
} {
  const c = payload.contact;
  const lines = [
    `Service: ${payload.service}`,
    `Gerät: ${payload.device}`,
    payload.damage ? `Schaden: ${payload.damage}` : null,
    payload.total != null ? `Geschätzter Preis: € ${payload.total}` : null,
    payload.date ? `Wunschtermin: ${payload.date}` : null,
    payload.pickup?.address
      ? `Abholadresse: ${payload.pickup.address} (Stock: ${payload.pickup.floor || "-"}, Zeit: ${payload.pickup.when || "-"})`
      : null,
    "",
    `Name: ${c.name}`,
    `E-Mail: ${c.email}`,
    c.phone ? `Telefon: ${c.phone}` : null,
    c.message ? `Nachricht: ${c.message}` : null,
  ].filter(Boolean) as string[];
  const text = lines.join("\n");
  const html =
    `<h2>Neue Reparatur-Buchung</h2>` +
    `<table cellpadding="6" style="border-collapse:collapse">` +
    lines
      .map((l) =>
        l === ""
          ? `<tr><td colspan="2" style="height:8px"></td></tr>`
          : `<tr><td style="vertical-align:top;color:#666">${escapeHtml(l.split(": ")[0])}</td><td>${escapeHtml(l.split(": ").slice(1).join(": "))}</td></tr>`,
      )
      .join("") +
    `</table>`;
  return { subject: `Buchung: ${payload.device} - ${c.name}`, html, text };
}

function renderContactEmail(payload: z.infer<typeof ContactSchema>): {
  subject: string;
  html: string;
  text: string;
} {
  const text = [
    `Name: ${payload.name}`,
    `E-Mail: ${payload.email}`,
    payload.phone ? `Telefon: ${payload.phone}` : null,
    "",
    payload.message,
  ]
    .filter(Boolean)
    .join("\n");
  const html =
    `<h2>Neue Kontakt-Anfrage</h2>` +
    `<p><strong>Name:</strong> ${escapeHtml(payload.name)}<br>` +
    `<strong>E-Mail:</strong> ${escapeHtml(payload.email)}` +
    (payload.phone ? `<br><strong>Telefon:</strong> ${escapeHtml(payload.phone)}` : "") +
    `</p>` +
    `<p style="white-space:pre-wrap">${escapeHtml(payload.message)}</p>`;
  return { subject: `Kontakt: ${payload.name}`, html, text };
}

async function sendViaResend(args: {
  subject: string;
  html: string;
  text: string;
  replyTo: string;
}): Promise<{ ok: true } | { ok: false; status: number; body: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[api/lead] RESEND_API_KEY not set — skipping send", args.subject);
    return { ok: true };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: SENDER,
      to: [RECIPIENT],
      reply_to: args.replyTo,
      subject: args.subject,
      html: args.html,
      text: args.text,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    return { ok: false, status: res.status, body };
  }
  return { ok: true };
}

interface KvLike {
  get: (key: string) => Promise<string | null>;
  put: (
    key: string,
    value: string,
    options?: { expirationTtl?: number },
  ) => Promise<void>;
}

function getKv(): KvLike | null {
  try {
    const ctx = getCloudflareContext();
    const kv = (ctx.env as unknown as { LEADS_KV?: KvLike }).LEADS_KV;
    return kv ?? null;
  } catch {
    // Build-time evaluation or local dev without bindings — soft no-op.
    return null;
  }
}

export async function POST(req: NextRequest) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return Response.json(
      { ok: false, error: "invalid_json" },
      { status: 400 },
    );
  }

  // Honeypot first — if filled, pretend success without spending any
  // further budget on validation or KV calls.
  const hp = HoneypotShape.safeParse(raw);
  if (hp.success && hp.data._hp && hp.data._hp.trim().length > 0) {
    console.warn("[api/lead] honeypot tripped");
    return Response.json({ ok: true });
  }

  const parsed = Schema.safeParse(raw);
  if (!parsed.success) {
    return Response.json(
      { ok: false, error: "invalid_payload", detail: parsed.error.toString() },
      { status: 400 },
    );
  }
  const payload = parsed.data;

  const kv = getKv();

  // Per-IP rate-limit — cheap, KV-backed counter with TTL window.
  const ip =
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "0.0.0.0";
  if (kv) {
    const rlKey = `rl:${ip}`;
    const cur = Number((await kv.get(rlKey)) ?? 0);
    if (cur >= RATE_LIMIT_MAX) {
      return Response.json(
        { ok: false, error: "rate_limited" },
        { status: 429 },
      );
    }
    await kv.put(rlKey, String(cur + 1), {
      expirationTtl: RATE_LIMIT_WINDOW_SEC,
    });
  }

  // Dedup — same email + same primary subject within 1 h is the same lead.
  const dedupBasis =
    payload.type === "booking"
      ? `${payload.contact.email}|${payload.device.slice(0, 30)}`
      : `${payload.email}|${payload.message.slice(0, 30)}`;
  const dedupKey = `ddp:${await sha256Hex(dedupBasis)}`;
  let alreadySeen = false;
  if (kv) {
    if (await kv.get(dedupKey)) alreadySeen = true;
    await kv.put(dedupKey, "1", { expirationTtl: DEDUP_TTL_SEC });
  }

  // Persist before sending so a Resend outage doesn't lose the lead.
  const leadId = crypto.randomUUID();
  if (kv) {
    await kv.put(
      `lead:${leadId}`,
      JSON.stringify({
        id: leadId,
        ts: new Date().toISOString(),
        ip: await sha256Hex(ip), // hash, not raw — DSGVO-friendlier
        payload,
      }),
      { expirationTtl: PERSIST_TTL_SEC },
    );
  }

  if (alreadySeen) {
    // Suppress the duplicate email but still return ok so the form's
    // success card renders for the user.
    return Response.json({ ok: true, id: leadId, deduped: true });
  }

  const rendered =
    payload.type === "booking"
      ? renderBookingEmail(payload)
      : renderContactEmail(payload);
  const replyTo =
    payload.type === "booking" ? payload.contact.email : payload.email;
  const result = await sendViaResend({ ...rendered, replyTo });
  if (!result.ok) {
    console.error("[api/lead] resend failed", result.status, result.body);
    // We still persisted the lead in KV above, so the data isn't lost —
    // surface 502 to the client so it can retry / show a fallback.
    return Response.json(
      { ok: false, error: "send_failed", id: leadId },
      { status: 502 },
    );
  }

  return Response.json({ ok: true, id: leadId });
}
