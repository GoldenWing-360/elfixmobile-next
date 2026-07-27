import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Minimal structural type for the LEADS_KV binding — shared by the lead
 * and reviews routes so neither carries its own copy.
 */
export interface KvLike {
  get: (key: string) => Promise<string | null>;
  put: (
    key: string,
    value: string,
    options?: { expirationTtl?: number },
  ) => Promise<void>;
}

export function getKv(): KvLike | null {
  try {
    const ctx = getCloudflareContext();
    return (ctx.env as unknown as { LEADS_KV?: KvLike }).LEADS_KV ?? null;
  } catch {
    // Build-time evaluation or local dev without bindings — soft no-op.
    return null;
  }
}

/**
 * The Worker's waitUntil, for work that must outlive the response
 * (background cache refresh). Null outside the Workers runtime.
 */
export function getWaitUntil(): ((p: Promise<unknown>) => void) | null {
  try {
    const { ctx } = getCloudflareContext();
    return ctx?.waitUntil ? ctx.waitUntil.bind(ctx) : null;
  } catch {
    return null;
  }
}
