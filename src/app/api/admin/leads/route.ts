import { NextRequest } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * /api/admin/leads — gated lead browser + status setter.
 *
 * Auth: Basic-Auth against ADMIN_USER + ADMIN_PASSWORD secrets on the
 * Worker. Both are required; missing either is a hard 503 (we don't want
 * to default to "anyone can read leads" on a misconfigured deploy).
 *
 * GET  /api/admin/leads               -> list all lead:* keys (paged)
 * POST /api/admin/leads { id, status } -> overwrite status field on a lead
 */

export const dynamic = "force-dynamic";

interface KvLike {
  get: (key: string) => Promise<string | null>;
  put: (key: string, value: string, options?: { expirationTtl?: number }) => Promise<void>;
  list: (opts?: { prefix?: string; cursor?: string; limit?: number }) => Promise<{
    keys: { name: string; expiration?: number }[];
    cursor?: string;
    list_complete: boolean;
  }>;
}

function getKv(): KvLike | null {
  try {
    const ctx = getCloudflareContext();
    return (ctx.env as unknown as { LEADS_KV?: KvLike }).LEADS_KV ?? null;
  } catch {
    return null;
  }
}

function checkAuth(req: NextRequest): { ok: true } | { ok: false; status: number; body?: string } {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASSWORD;
  if (!user || !pass) {
    return {
      ok: false,
      status: 503,
      body: "admin credentials not configured — set ADMIN_USER + ADMIN_PASSWORD secrets",
    };
  }
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Basic ")) {
    return { ok: false, status: 401 };
  }
  let decoded: string;
  try {
    decoded = atob(header.slice(6));
  } catch {
    return { ok: false, status: 401 };
  }
  const [u, p] = decoded.split(":");
  if (u !== user || p !== pass) {
    return { ok: false, status: 401 };
  }
  return { ok: true };
}

function unauthorized(body?: string): Response {
  return new Response(body ?? "auth required", {
    status: 401,
    headers: {
      "www-authenticate": 'Basic realm="elfix-admin"',
      "content-type": "text/plain",
    },
  });
}

export async function GET(req: NextRequest) {
  const auth = checkAuth(req);
  if (!auth.ok) {
    if (auth.status === 401) return unauthorized();
    return new Response(auth.body, { status: auth.status });
  }
  const kv = getKv();
  if (!kv) return Response.json({ ok: false, error: "no_kv" }, { status: 500 });

  const url = new URL(req.url);
  const cursor = url.searchParams.get("cursor") || undefined;
  const list = await kv.list({ prefix: "lead:", limit: 50, cursor });
  const leads = await Promise.all(
    list.keys.map(async (k) => {
      const raw = await kv.get(k.name);
      return raw ? JSON.parse(raw) : null;
    }),
  );
  return Response.json({
    ok: true,
    leads: leads.filter(Boolean),
    cursor: list.cursor,
    done: list.list_complete,
  });
}

export async function POST(req: NextRequest) {
  const auth = checkAuth(req);
  if (!auth.ok) {
    if (auth.status === 401) return unauthorized();
    return new Response(auth.body, { status: auth.status });
  }
  const kv = getKv();
  if (!kv) return Response.json({ ok: false, error: "no_kv" }, { status: 500 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body.id !== "string" || typeof body.status !== "string") {
    return Response.json({ ok: false, error: "bad_request" }, { status: 400 });
  }
  const allowed = ["received", "confirmed", "in_progress", "done"];
  if (!allowed.includes(body.status)) {
    return Response.json({ ok: false, error: "bad_status" }, { status: 400 });
  }
  const key = `lead:${body.id}`;
  const raw = await kv.get(key);
  if (!raw) return Response.json({ ok: false, error: "not_found" }, { status: 404 });
  const lead = JSON.parse(raw);
  lead.status = body.status;
  lead.status_updated_at = new Date().toISOString();
  await kv.put(key, JSON.stringify(lead), { expirationTtl: 60 * 60 * 24 * 90 });
  return Response.json({ ok: true });
}
