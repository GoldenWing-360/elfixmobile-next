/**
 * Telegram-Bot Notifier for new leads. Pushes a formatted message to a
 * configured chat ID the moment a customer submits /api/lead, so Natalja
 * sees the lead within seconds rather than whenever she next checks the
 * GMX inbox.
 *
 * Setup:
 *   1. Talk to @BotFather on Telegram, /newbot, get the bot token.
 *   2. Start the bot in a private chat (send /start). Look at
 *      https://api.telegram.org/bot<TOKEN>/getUpdates to find the
 *      chat.id of that conversation.
 *   3. Set both as Worker secrets:
 *        wrangler secret put TELEGRAM_BOT_TOKEN
 *        wrangler secret put TELEGRAM_CHAT_ID
 *
 * If either secret is missing the helper is a soft no-op (logs a
 * warning and returns ok). Telegram outage doesn't fail the lead.
 */

interface LeadNotificationArgs {
  /** The Lead UUID — shown as a short reference ID in the message. */
  leadId: string;
  /** Fully-built public status URL (with token) — caller owns the shape. */
  statusUrl: string;
  /** Channel: "Buchung" or "Kontakt" — shapes the message header. */
  type: "booking" | "contact";
  /** Plain-text summary block already formatted by /api/lead. */
  summary: string;
  /** Customer name shown in the header. */
  customerName: string;
  /** Customer phone — first thing Natalja needs. */
  customerPhone?: string;
  /** Customer email — fallback channel. */
  customerEmail?: string;
}

function escapeMarkdownV2(s: string): string {
  // Telegram MarkdownV2 needs these escaped: _ * [ ] ( ) ~ ` > # + - = | { } . !
  return s.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, "\\$1");
}

// Inside MarkdownV2 link URLs, only ) and \ require escaping. Running
// the full punctuation escape over a URL would mangle the path (each
// "." and "-" becomes "\." / "\-" which some clients don't unwrap,
// producing a broken link).
function escapeMarkdownV2Url(s: string): string {
  return s.replace(/([)\\])/g, "\\$1");
}

// Inside a MarkdownV2 code-fence, only backticks and backslashes need
// escaping. A raw backtick in the customer summary would close the
// fence and let the rest inject markdown - Telegram returns 400
// "can't parse entities" and the notification never delivers.
function escapeMarkdownV2Code(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/`/g, "\\`");
}

export async function notifyTelegram(
  args: LeadNotificationArgs,
): Promise<{ ok: boolean; skipped?: boolean }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.warn(
      "[telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set — skipping notification",
    );
    return { ok: true, skipped: true };
  }

  const headerEmoji = args.type === "booking" ? "🔧" : "✉️";
  const headerLabel = args.type === "booking" ? "Neue Buchung" : "Kontakt-Anfrage";

  const lines = [
    `${headerEmoji} *${escapeMarkdownV2(headerLabel)}*`,
    "",
    `👤 ${escapeMarkdownV2(args.customerName)}`,
    args.customerPhone
      ? `📞 [${escapeMarkdownV2(args.customerPhone)}](tel:${args.customerPhone.replace(/[^0-9+]/g, "")})`
      : null,
    args.customerEmail
      ? `📧 ${escapeMarkdownV2(args.customerEmail)}`
      : null,
    "",
    `\`\`\`\n${escapeMarkdownV2Code(args.summary.slice(0, 800))}\n\`\`\``,
    "",
    `🔗 [Status\\-Seite öffnen](${escapeMarkdownV2Url(args.statusUrl)})`,
    `🆔 \`${escapeMarkdownV2Code(args.leadId.slice(0, 8))}\``,
  ]
    .filter(Boolean)
    .join("\n");

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // 5 s ceiling: workerd fetch has no default timeout, and a slow
    // Telegram response would otherwise tie up the entire /api/lead
    // POST until the Worker CPU limit fires.
    signal: AbortSignal.timeout(5000),
    body: JSON.stringify({
      chat_id: chatId,
      text: lines,
      parse_mode: "MarkdownV2",
      disable_web_page_preview: true,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error("[telegram] sendMessage failed", res.status, body);
    return { ok: false };
  }
  return { ok: true };
}
