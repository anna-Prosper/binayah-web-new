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

/** Every published guide. Falls back to the bundled array if the API is down. */
export const loadGuides = cache(async (): Promise<PulseGuide[]> => {
  const r = await get<PulseGuide[]>("/api/guides");
  if (r.ok && Array.isArray(r.data) && r.data.length) return r.data;
  return PULSE_GUIDES;
});

/** One published guide, or null when it genuinely doesn't exist. */
export const loadGuide = cache(async (slug: string): Promise<PulseGuide | null> => {
  const r = await get<PulseGuide>(`/api/guides/${slug}`);
  if (r.ok) return r.data;
  if (r.missing) return null;
  return PULSE_GUIDES.find((g) => g.slug === slug) ?? null;
});
