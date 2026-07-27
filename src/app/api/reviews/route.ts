import { getKv, getWaitUntil, type KvLike } from "@/lib/kv";
import type { ReviewsPayload } from "@/lib/reviews-types";

/**
 * /api/reviews — public read endpoint that returns recent Google
 * Reviews for the shop. Pulled from the Places API (New, v1), cached
 * in LEADS_KV with stale-while-revalidate so we don't hammer Google on
 * every page load and never burst the quota on cache expiry.
 *
 * Setup (one-time):
 *   1. Get a Google Maps Platform API key with "Places API (New)"
 *      enabled: https://console.cloud.google.com/google/maps-apis
 *   2. Find the Place ID for "EL Fix Mobile Wien Maria-Tusch":
 *      https://developers.google.com/maps/documentation/places/web-service/place-id
 *      Output: a ChIJ... string.
 *   3. Set both as Worker secrets:
 *        wrangler secret put GOOGLE_PLACES_API_KEY
 *        wrangler secret put GOOGLE_PLACE_ID
 *
 * When the secrets are missing, the endpoint returns a stable empty
 * payload so the Reviews component falls back to the static i18n
 * testimonials.
 */

export const dynamic = "force-dynamic";

// Freshness window: within it the cache is served as-is. Past it the
// stale copy is still served (no user-visible latency) while one
// background fetch refreshes the KV entry via waitUntil.
const FRESH_TTL_SEC = 60 * 60 * 24; // 24 h
// Hard KV eviction — after this even stale data is gone and the next
// request blocks on Google again.
const HARD_TTL_SEC = 60 * 60 * 24 * 7; // 7 d
// Best-effort refresh lock: bounds a cold-stale herd to the handful of
// requests that race the lock write, instead of every request.
const REFRESH_LOCK_TTL_SEC = 120;

const CACHE_KEY = "reviews:google:cache";
const LOCK_KEY = "reviews:google:refreshing";

interface PlaceV1Review {
  rating?: number;
  relativePublishTimeDescription?: string;
  publishTime?: string; // RFC 3339
  text?: { text?: string };
  originalText?: { text?: string };
  authorAttribution?: { displayName?: string };
}

interface PlaceV1Response {
  rating?: number;
  userRatingCount?: number;
  reviews?: PlaceV1Review[];
  error?: { code?: number; status?: string; message?: string };
}

async function fetchGoogle(): Promise<ReviewsPayload | null> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!key || !placeId) return null;

  const res = await fetch(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=de`,
    {
      headers: {
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "rating,userRatingCount,reviews",
      },
    },
  );
  if (!res.ok) {
    console.error("[reviews] google fetch", res.status, await res.text());
    return null;
  }
  const data = (await res.json()) as PlaceV1Response;
  if (data.error) {
    console.error("[reviews] google status", data.error.status, data.error.message);
    return null;
  }
  return {
    rating: data.rating ?? null,
    total: data.userRatingCount ?? null,
    reviews: (data.reviews ?? [])
      .map((r) => ({
        author: r.authorAttribution?.displayName ?? "Google Nutzer",
        rating: r.rating ?? 5,
        relative: r.relativePublishTimeDescription ?? "",
        text: r.text?.text ?? r.originalText?.text ?? "",
        time: r.publishTime ? Math.floor(Date.parse(r.publishTime) / 1000) : 0,
      }))
      .filter((r) => r.text.length > 0),
    fetched_at: new Date().toISOString(),
  };
}

async function refreshCache(kv: KvLike): Promise<void> {
  if (await kv.get(LOCK_KEY)) return;
  await kv.put(LOCK_KEY, "1", { expirationTtl: REFRESH_LOCK_TTL_SEC });
  const fresh = await fetchGoogle();
  if (fresh) {
    await kv.put(CACHE_KEY, JSON.stringify(fresh), {
      expirationTtl: HARD_TTL_SEC,
    });
  }
}

export async function GET() {
  const kv = getKv();

  // 1. KV cache — fresh: serve. Stale: serve anyway, refresh behind the
  //    response so exactly one caller pays the Google round-trip.
  if (kv) {
    const cachedRaw = await kv.get(CACHE_KEY);
    if (cachedRaw) {
      let cached: ReviewsPayload | null = null;
      try {
        cached = JSON.parse(cachedRaw) as ReviewsPayload;
      } catch {
        // Corrupted entry — fall through to a blocking refetch.
      }
      if (cached) {
        const ageSec = (Date.now() - Date.parse(cached.fetched_at)) / 1000;
        if (ageSec > FRESH_TTL_SEC) {
          const waitUntil = getWaitUntil();
          if (waitUntil) waitUntil(refreshCache(kv));
        }
        return Response.json(
          { ...cached, source: "google" },
          { headers: { "cache-control": "public, max-age=3600" } },
        );
      }
    }
  }

  // 2. Cold miss / no KV — one blocking live fetch.
  const fresh = await fetchGoogle();
  if (!fresh) {
    // Stable empty shape so the client component knows to use the
    // static fallback rather than failing.
    return Response.json({
      rating: null,
      total: null,
      reviews: [],
      fetched_at: null,
      source: "unavailable",
    });
  }

  if (kv) {
    await kv.put(CACHE_KEY, JSON.stringify(fresh), {
      expirationTtl: HARD_TTL_SEC,
    });
  }
  return Response.json({ ...fresh, source: "google" });
}
