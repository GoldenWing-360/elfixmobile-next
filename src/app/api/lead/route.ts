import { NextRequest } from "next/server";
import { z } from "zod";
import { getKv } from "@/lib/kv";
import { signLeadId } from "@/lib/lead-token";
import { notifyTelegram } from "@/lib/telegram";
import { SITE } from "@/lib/seo";

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

// Loose-ish AT phone validation: allows +43, 0, internationalised, with
// spaces/slashes/dashes — rejects raw alpha and overly-short strings.
const PHONE_REGEX = /^[+0][\d\s/().-]{5,38}$/;
const PhoneOptional = z
  .string()
  .max(40)
  .optional()
  .default("")
  .refine((v) => v === "" || PHONE_REGEX.test(v), {
    message: "invalid_phone_format",
  });

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
  // Cap the estimated price so a tampered client can't push a 9-digit
  // number into the email subject line.
  total: z.number().min(0).max(100_000).nullable().optional(),
  // AGB / Datenschutz consent. Required by AT consumer law for booking
  // forms (KSchG §5c, FAGG). Server-side enforcement, not just disabling
  // the submit button - bots and JS-disabled clients bypass that.
  agb: z.literal(true, { message: "agb_required" }),
  contact: z.object({
    name: z.string().min(2).max(120),
    email: z.string().email().max(200),
    phone: PhoneOptional,
    message: z.string().max(4000).optional().default(""),
  }),
});

const ContactSchema = z.object({
  type: z.literal("contact"),
  name: z.string().min(2).max(120),
  email: z.string().email().max(200),
  phone: PhoneOptional,
  message: z.string().min(5).max(4000),
  agb: z.literal(true, { message: "agb_required" }),
});

const Schema = z.discriminatedUnion("type", [BookingSchema, ContactSchema]);

const RECIPIENT = "elfixmobile@gmx.at";
// Production needs a verified-domain sender (Resend rejects the sandbox
// address for recipients outside the team): wrangler secret put RESEND_FROM
// with e.g. "EL Fix Mobile <termin@elfixmobile.at>".
const SENDER = process.env.RESEND_FROM ?? "EL Fix Mobile <onboarding@resend.dev>";

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
  to: string;
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
      to: [args.to],
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

/**
 * Customer-facing confirmation email. Always sent (also on dedup, so the
 * customer always gets feedback the request reached us). Subject is in
 * German because that's the primary audience; English/Russian/Turkish
 * locales fall back to the German body — translating transactional mail
 * is an explicit follow-up.
 */
function renderCustomerConfirmation(
  payload: z.infer<typeof Schema>,
  statusUrl: string,
): { to: string; subject: string; html: string; text: string } {
  const isContactForm = payload.type === "contact";
  const to = isContactForm ? payload.email : payload.contact.email;
  const name = isContactForm ? payload.name : payload.contact.name;

  const subject = isContactForm
    ? "Wir haben deine Nachricht — EL Fix Mobile"
    : "Buchung eingegangen — EL Fix Mobile";

  const headline = isContactForm
    ? "Wir melden uns innerhalb 30 Minuten."
    : "Buchung eingegangen.";

  const body = isContactForm
    ? "Vielen Dank für deine Nachricht. Wir antworten meist innerhalb von 30 Minuten während der Geschäftszeiten (Mo–Sa 9–19). Bei dringenden Anliegen ruf gerne direkt an: +43 660 6071414."
    : "Vielen Dank für deine Reparatur-Buchung. Wir prüfen die Angaben und melden uns innerhalb von 30 Minuten zur Bestätigung. Bei Fragen ruf direkt an: +43 660 6071414.";

  const text = [
    `Hallo ${name},`,
    "",
    headline,
    "",
    body,
    "",
    `Status verfolgen: ${statusUrl}`,
    "",
    "EL Fix Mobile e.U.",
    "Maria-Tusch-Straße 17/1, 1220 Wien",
    "+43 660 6071414 · elfixmobile@gmx.at",
  ].join("\n");

  const html = `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1d1d1f;max-width:560px;margin:0 auto;padding:24px">
  <p style="margin:0 0 24px;font-size:15px;color:#525257">Hallo ${escapeHtml(name)},</p>
  <h1 style="margin:0 0 16px;font-size:24px;font-weight:600;letter-spacing:-0.01em">${escapeHtml(headline)}</h1>
  <p style="margin:0 0 24px;font-size:15.5px;line-height:1.55;color:#525257">${escapeHtml(body)}</p>
  ${
    !isContactForm
      ? `<p style="margin:0 0 24px"><a href="${statusUrl}" style="display:inline-block;background:#0071e3;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-size:14.5px;font-weight:500">Status verfolgen →</a></p>`
      : ""
  }
  <div style="border-top:1px solid #e5e5e7;margin-top:32px;padding-top:20px;font-size:13px;color:#86868B;line-height:1.55">
    EL Fix Mobile e.U.<br>
    Maria-Tusch-Straße 17/1, 1220 Wien<br>
    <a href="tel:+436606071414" style="color:#0071e3;text-decoration:none">+43 660 6071414</a> ·
    <a href="mailto:elfixmobile@gmx.at" style="color:#0071e3;text-decoration:none">elfixmobile@gmx.at</a>
  </div>
</div>`.trim();

  return { to, subject, html, text };
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
    // Don't leak the full Zod error tree to public callers - it
    // fingerprints the schema (field paths, regex names, validator
    // labels). Detail stays in the Worker log; client gets a stable
    // generic error code.
    console.warn("[api/lead] schema rejection", parsed.error.toString().slice(0, 500));
    return Response.json(
      { ok: false, error: "invalid_payload" },
      { status: 400 },
    );
  }
  const payload = parsed.data;

  const kv = getKv();

  // Per-IP rate-limit — cheap, KV-backed counter with TTL window.
  // Known limitation (accepted): the read-modify-write on KV is not
  // atomic, so a coordinated burst can slip a few requests past the
  // limit before the counters converge. This is soft throttling against
  // sloppy scrapers and refresh-mashers; the honeypot + dedup layers
  // catch what slips through. A Durable Object counter is the upgrade
  // path if abuse ever shows up in the logs.
  //
  // Only cf-connecting-ip is trusted: the Worker sits behind Cloudflare
  // exclusively, and an x-forwarded-for fallback would let direct hits
  // rotate fake IPs to bypass the limit.
  const ip = req.headers.get("cf-connecting-ip") ?? "unknown";
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
  // Lead lifecycle (status field): received -> confirmed -> in_progress -> done.
  // Initial value is "received"; the shop owner moves it manually via KV
  // or a future admin UI. The /status/<id> public page renders this.
  const leadId = crypto.randomUUID();
  if (kv) {
    await kv.put(
      `lead:${leadId}`,
      JSON.stringify({
        id: leadId,
        status: "received",
        ts: new Date().toISOString(),
        ip: await sha256Hex(ip), // hash, not raw — DSGVO-friendlier
        payload,
      }),
      { expirationTtl: PERSIST_TTL_SEC },
    );
  }

  // HMAC token for the public /status/<id>?t=<token> URL.
  const token = await signLeadId(leadId);
  const statusUrl = token
    ? `${SITE.url}/de/status/${leadId}?t=${token}`
    : `${SITE.url}/de/status/${leadId}`;

  // The customer confirmation always goes out — also when dedup matched.
  // The shop-owner email is suppressed on dedup so the inbox doesn't get
  // five copies of the same lead.
  const customerEmail = renderCustomerConfirmation(payload, statusUrl);
  const customerSend = await sendViaResend({
    ...customerEmail,
    replyTo: RECIPIENT,
  });
  if (!customerSend.ok) {
    // Log but don't fail — the owner-side mail and KV persist are what
    // matter for ops; customer can still see the success card + status
    // URL on screen.
    console.error(
      "[api/lead] customer email failed",
      customerSend.status,
      customerSend.body,
    );
  }

  if (alreadySeen) {
    return Response.json({
      ok: true,
      id: leadId,
      token,
      deduped: true,
    });
  }

  const rendered =
    payload.type === "booking"
      ? renderBookingEmail(payload)
      : renderContactEmail(payload);
  const replyTo =
    payload.type === "booking" ? payload.contact.email : payload.email;
  const ownerSend = await sendViaResend({
    ...rendered,
    to: RECIPIENT,
    replyTo,
  });

  // Telegram push — fires regardless of email outcome so Natalja sees
  // the lead within seconds even if Resend is down. notifyTelegram is
  // a no-op when bot secrets aren't set.
  const tgName =
    payload.type === "booking" ? payload.contact.name : payload.name;
  const tgPhone =
    payload.type === "booking" ? payload.contact.phone : payload.phone;
  const tgEmail =
    payload.type === "booking" ? payload.contact.email : payload.email;
  await notifyTelegram({
    leadId,
    statusUrl,
    type: payload.type,
    summary: rendered.text,
    customerName: tgName,
    customerPhone: tgPhone,
    customerEmail: tgEmail,
  }).catch((err) => {
    console.error("[api/lead] telegram notify threw", err);
  });

  if (!ownerSend.ok) {
    // The lead is durable in KV and Telegram has already fired - the
    // owner-side email is the slowest layer, not the source of truth.
    // A 502 here misrepresents the state: customer thinks the form
    // failed and retries (dedup catches it but they see no feedback).
    // Return 200 with a warning instead so the success card still
    // renders; ops sees the failure in the Worker log + Telegram diff.
    console.error("[api/lead] owner email failed", ownerSend.status, ownerSend.body);
    return Response.json({
      ok: true,
      id: leadId,
      token,
      warning: "owner_email_delayed",
    });
  }

  return Response.json({ ok: true, id: leadId, token });
}
