// ─────────────────────────────────────────────────────────────────────────────
// Guide loading: MongoDB (via binayah-api) with the hardcoded PULSE_GUIDES array
// in lib/pulse-guides.ts as the fallback.
//
// Same distinction as lib/offers-data.ts: a 404 from the API means the guide
// genuinely doesn't exist (return null so the page 404s), while any other
// failure (API down, timeout) falls back to the static file so a transient
// outage can't blank a live SEO page or bake a 404 into the ISR cache.
// ─────────────────────────────────────────────────────────────────────────────
import { cache } from "react";
import { serverApiUrl, serverFetch } from "@/lib/api";
import { PULSE_GUIDES, type PulseGuide } from "@/lib/pulse-guides";

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

/** Newest first.
 *
 *  The API returns guides in curated `order` ascending, and that order is also
 *  chronological — order 0 is the oldest guide. So the index led with the
 *  oldest content and every newly published guide landed at the bottom of a
 *  77-card grid, which is why a new guide looked like it had never posted.
 *
 *  `createdAt` is synthetic for the 74 guides migrated out of pulse-guides.ts
 *  (staggered six days per array index) but real for anything published since,
 *  so sorting on it puts genuinely new guides on top and leaves the migrated
 *  set in its curated sequence, just reversed. `order` breaks ties within the
 *  25 guides that share the migration timestamp. */
function newestFirst(a: PulseGuide, b: PulseGuide): number {
  const ts = (g: PulseGuide) => (g.createdAt ? new Date(g.createdAt).getTime() : 0);
  return ts(b) - ts(a) || (b.order ?? 0) - (a.order ?? 0);
}

/** Every published guide, newest first. Falls back to the bundled array if the
 *  API is down. */
export const loadGuides = cache(async (): Promise<PulseGuide[]> => {
  const r = await get<PulseGuide[]>("/api/guides");
  if (r.ok && Array.isArray(r.data) && r.data.length) return [...r.data].sort(newestFirst);
  return [...PULSE_GUIDES].sort(newestFirst);
});

/** One published guide, or null when it genuinely doesn't exist. */
export const loadGuide = cache(async (slug: string): Promise<PulseGuide | null> => {
  const r = await get<PulseGuide>(`/api/guides/${slug}`);
  if (r.ok) return r.data;
  if (r.missing) return null;
  return PULSE_GUIDES.find((g) => g.slug === slug) ?? null;
});
