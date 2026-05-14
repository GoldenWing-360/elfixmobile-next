import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * /api/reviews — public read endpoint that returns recent Google
 * Reviews for the shop. Pulled live from Google's Places API, cached
 * in LEADS_KV for 24 hours so we don't hammer Google on every page
 * load.
 *
 * Setup (one-time):
 *   1. Get a Google Maps Platform API key with "Places API" enabled:
 *      https://console.cloud.google.com/google/maps-apis
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

const CACHE_TTL_SEC = 60 * 60 * 24; // 24 h

interface GoogleReview {
  author_name: string;
  author_url?: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number; // unix seconds
  language?: string;
}

interface PlaceDetailsResponse {
  result?: {
    name?: string;
    rating?: number;
    user_ratings_total?: number;
    reviews?: GoogleReview[];
  };
  status: string;
  error_message?: string;
}

interface CachedPayload {
  rating: number | null;
  total: number | null;
  reviews: ReviewPublic[];
  fetched_at: string;
}

interface ReviewPublic {
  author: string;
  rating: number;
  relative: string;
  text: string;
  time: number;
}

interface KvLike {
  get: (key: string, options?: { type?: "text" | "json" }) => Promise<string | null>;
  put: (
    key: string,
    value: string,
    options?: { expirationTtl?: number },
  ) => Promise<void>;
}

function getKv(): KvLike | null {
  try {
    const ctx = getCloudflareContext();
    return (ctx.env as unknown as { LEADS_KV?: KvLike }).LEADS_KV ?? null;
  } catch {
    return null;
  }
}

async function fetchGoogle(): Promise<CachedPayload | null> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!key || !placeId) return null;

  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", "name,rating,user_ratings_total,reviews");
  url.searchParams.set("language", "de");
  url.searchParams.set("key", key);

  const res = await fetch(url.toString());
  if (!res.ok) {
    console.error("[reviews] google fetch", res.status, await res.text());
    return null;
  }
  const data = (await res.json()) as PlaceDetailsResponse;
  if (data.status !== "OK" || !data.result) {
    console.error("[reviews] google status", data.status, data.error_message);
    return null;
  }
  const result = data.result;
  return {
    rating: result.rating ?? null,
    total: result.user_ratings_total ?? null,
    reviews:
      result.reviews?.map((r) => ({
        author: r.author_name,
        rating: r.rating,
        relative: r.relative_time_description,
        text: r.text,
        time: r.time,
      })) ?? [],
    fetched_at: new Date().toISOString(),
  };
}

export async function GET() {
  const kv = getKv();
  const cacheKey = "reviews:google:cache";

  // 1. Try KV cache first
  if (kv) {
    const cached = await kv.get(cacheKey);
    if (cached) {
      return new Response(cached, {
        headers: {
          "content-type": "application/json",
          "cache-control": "public, max-age=3600",
        },
      });
    }
  }

  // 2. Cache miss / no KV — try live fetch
  const fresh = await fetchGoogle();
  if (!fresh) {
    // Return a stable empty shape so the client component knows to use
    // the static fallback rather than failing.
    return Response.json({
      rating: null,
      total: null,
      reviews: [],
      fetched_at: null,
      source: "unavailable",
    });
  }

  // 3. Persist cache for 24 h
  if (kv) {
    await kv.put(cacheKey, JSON.stringify(fresh), {
      expirationTtl: CACHE_TTL_SEC,
    });
  }
  return Response.json({ ...fresh, source: "google" });
}
