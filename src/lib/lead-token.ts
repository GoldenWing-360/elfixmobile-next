/**
 * HMAC-SHA256 token for protecting the public /status/<id> page from
 * direct UUID guessing. The token is bound to the lead id and a Worker
 * secret (STATUS_TOKEN_SECRET); without the secret nobody can mint a
 * valid token for an id they don't already have.
 *
 * Token is short (first 12 hex chars of the HMAC digest) — that's still
 * 48 bits of entropy, way beyond brute-force for a single lead, and
 * keeps the URL link-friendly.
 */

const TOKEN_LEN = 12;

function getSecret(): string {
  // Empty string is the only fallback. With an empty secret every lead
  // would share the same predictable HMAC, which is worse than no
  // protection at all — so we surface that loudly via the warning and
  // fall back to skipping the check (see verifyToken below).
  const s = process.env.STATUS_TOKEN_SECRET;
  if (!s) {
    console.warn(
      "[lead-token] STATUS_TOKEN_SECRET not set — status URLs are unsigned (dev mode)",
    );
    return "";
  }
  return s;
}

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message),
  );
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function signLeadId(id: string): Promise<string> {
  const secret = getSecret();
  if (!secret) return "";
  const full = await hmacHex(secret, id);
  return full.slice(0, TOKEN_LEN);
}

/**
 * Constant-time compare. Returns true if either:
 *   - the token matches, OR
 *   - no secret is configured AND the caller chose to allow unsigned
 *     access (set allowUnsigned=true). This lets local dev keep working
 *     without burning a secret, while production stays strict.
 */
export async function verifyLeadToken(
  id: string,
  presented: string | null | undefined,
  { allowUnsigned = false }: { allowUnsigned?: boolean } = {},
): Promise<boolean> {
  const secret = getSecret();
  if (!secret) return allowUnsigned;
  if (!presented) return false;
  const expected = await signLeadId(id);
  if (expected.length !== presented.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ presented.charCodeAt(i);
  }
  return diff === 0;
}
