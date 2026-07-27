/**
 * Shared shapes for the Google-Reviews pipeline. The /api/reviews route
 * produces them, the Reviews section consumes them — one definition so
 * the two can't drift apart.
 */

export interface ReviewPublic {
  author: string;
  rating: number;
  relative: string;
  text: string;
  time: number; // unix seconds
}

export interface ReviewsPayload {
  rating: number | null;
  total: number | null;
  reviews: ReviewPublic[];
  fetched_at: string;
}

export type ReviewsResponse =
  | (ReviewsPayload & { source: "google" })
  | {
      rating: null;
      total: null;
      reviews: [];
      fetched_at: null;
      source: "unavailable";
    };
