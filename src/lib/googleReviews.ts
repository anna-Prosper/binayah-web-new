import "server-only";

export interface GoogleReview {
  author: string;
  text: string;
  ratingValue: number;
  profilePhoto?: string;
  authorUrl?: string;
  relativeTime?: string;
}

export interface GoogleReviewsData {
  rating: number;
  total: number;
  reviews: GoogleReview[];
  placeUrl?: string;
}

/**
 * Fetches real Google reviews for the Binayah business via the Places API (New),
 * cached for a day. Returns null when not configured (no key / no GOOGLE_PLACE_ID),
 * when the API is disabled, or on any error — callers must render an honest
 * fallback rather than fabricated content. Never throws.
 *
 * Setup: enable "Places API (New)" on the Maps project and set GOOGLE_PLACE_ID
 * to Binayah's Google Business place ID.
 */
export async function getGoogleReviews(): Promise<GoogleReviewsData | null> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!key || !placeId) return null;

  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
      headers: {
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "rating,userRatingCount,googleMapsUri,reviews",
      },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const d = await res.json();

    const mapped: GoogleReview[] = (Array.isArray(d.reviews) ? d.reviews : [])
      .map((r: any) => ({
        author: r?.authorAttribution?.displayName || "Google user",
        text: String(r?.text?.text || r?.originalText?.text || "").trim(),
        ratingValue: Number(r?.rating) || 0,
        profilePhoto: r?.authorAttribution?.photoUri || undefined,
        authorUrl: r?.authorAttribution?.uri || undefined,
        relativeTime: r?.relativePublishTimeDescription || undefined,
      }))
      .filter((r: GoogleReview) => r.text.length > 0 && r.ratingValue >= 4)
      .slice(0, 6);

    if (mapped.length === 0) return null;

    return {
      rating: Number(d.rating) || 0,
      total: Number(d.userRatingCount) || 0,
      reviews: mapped,
      placeUrl: d.googleMapsUri || undefined,
    };
  } catch {
    return null;
  }
}
