import { NextRequest } from "next/server";
import { z } from "zod";

/**
 * /api/lead — unified lead intake for the booking flow and the contact form.
 *
 * Runs on the OpenNext / Cloudflare Worker runtime, so we use the Resend
 * HTTP API directly (no SDK) and read `RESEND_API_KEY` from env. If the key
 * is missing (local dev without secrets), the route still validates and
 * returns 200 but only logs the payload — useful for iterating on the form
 * UX before wiring email.
 *
 * Email destinations:
 *   - elfixmobile@gmx.at (the shop owner, hardcoded; verified WP-side
 *     contact)
 *   - reply-to is set to the customer's email so the team can reply in one
 *     click without copying the address.
 */

export const dynamic = "force-dynamic";

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
// Resend's hosted onboarding sender works without domain verification.
// Once elfixmobile.at is verified in Resend, swap to noreply@elfixmobile.at.
const SENDER = "EL Fix Mobile <onboarding@resend.dev>";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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
  return {
    subject: `Buchung: ${payload.device} - ${c.name}`,
    html,
    text,
  };
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
  return {
    subject: `Kontakt: ${payload.name}`,
    html,
    text,
  };
}

async function sendViaResend(args: {
  subject: string;
  html: string;
  text: string;
  replyTo: string;
}): Promise<{ ok: true } | { ok: false; status: number; body: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    // Soft-no-op for local dev: just log to console; the route still
    // returns 200 so the form-success state can be tested end-to-end
    // without the secret being set.
    console.warn("[api/lead] RESEND_API_KEY not set — skipping send", args.subject);
    return { ok: true };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
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

export async function POST(req: NextRequest) {
  let parsed: z.infer<typeof Schema>;
  try {
    const body = await req.json();
    parsed = Schema.parse(body);
  } catch (e) {
    return Response.json(
      { ok: false, error: "invalid_payload", detail: String(e) },
      { status: 400 },
    );
  }

  const rendered =
    parsed.type === "booking"
      ? renderBookingEmail(parsed)
      : renderContactEmail(parsed);
  const replyTo =
    parsed.type === "booking" ? parsed.contact.email : parsed.email;

  const result = await sendViaResend({ ...rendered, replyTo });
  if (!result.ok) {
    console.error("[api/lead] resend failed", result.status, result.body);
    return Response.json(
      { ok: false, error: "send_failed" },
      { status: 502 },
    );
  }

  return Response.json({ ok: true });
}
