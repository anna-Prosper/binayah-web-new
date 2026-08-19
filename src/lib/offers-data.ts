// ─────────────────────────────────────────────────────────────────────────────
// Offer loading: MongoDB (via binayah-api) with the hardcoded OFFERS array in
// lib/offers.ts as the fallback.
//
// The distinction that matters here is "the API said no such offer" versus "the
// API did not answer". fetchJsonOr404 collapses both to null, which is wrong for
// this route:
//
//   • 404      → the offer genuinely isn't published. Return null so the page
//                404s. Falling back to the file here would resurrect an offer
//                somebody had just unpublished.
//   • error    → API down, timeout, bad gateway. Fall back to the file so a
//                transient outage can't blank a live marketing page or, worse,
//                bake a 404 into the ISR cache.
//
// Everything is served from the same shape as lib/offers.ts, so the page
// components don't care which source answered.
// ─────────────────────────────────────────────────────────────────────────────
import { cache } from "react";
import { serverApiUrl, serverFetch } from "@/lib/api";
import { OFFERS, type Offer } from "@/lib/offers";

type Fetched<T> = { ok: true; data: T } | { ok: false; missing: boolean };

async function get<T>(path: string): Promise<Fetched<T>> {
  try {
    const res = await serverFetch(serverApiUrl(path));
    if (res.status === 404) return { ok: false, missing: true };
    if (!res.ok) return { ok: false, missing: false };
    return { ok: true, data: (await res.json()) as T };
  } catch {
    return { ok: false, missing: false };
  }
}

/** Every published offer. Falls back to the bundled array if the API is down. */
export const loadOffers = cache(async (): Promise<Offer[]> => {
  const r = await get<Offer[]>("/api/offers");
  // An empty array is a legitimate answer (nothing running) — only an outright
  // failure falls back.
  if (r.ok && Array.isArray(r.data)) return r.data;
  return OFFERS;
});

/** One published offer, or null when it genuinely doesn't exist. */
export const loadOffer = cache(async (slug: string): Promise<Offer | null> => {
  const r = await get<Offer>(`/api/offers/${slug}`);
  if (r.ok) return r.data;
  if (r.missing) return null;
  return OFFERS.find((o) => o.slug === slug) ?? null;
});
