/**
 * Community Info Scraper
 *
 * Three sources, tried in order:
 *   1. Wikipedia REST API  — direct title lookup (covers famous towers + communities)
 *   2. Wikipedia search API — fallback for partial/alternate names
 *   3. Nominatim → Wikidata → Wikipedia — bridges abbreviations (JVC, JBR, DIFC)
 *      and places whose name doesn't map directly to a Wikipedia title
 *
 * All three are free, require no auth, and work in Vercel serverless.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CommunityInfoPage {
  slug: string;
  name: string;
  location?: string;
  description?: string;
  developerName?: string;
  heroImage?: string;
  amenities?: string[];
  priceRange?: { min: number; max: number; currency: string };
  sources: string[];
  scrapedAt: Date;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function scoreMatch(entryName: string, query: string): number {
  const entry = entryName.toLowerCase().trim();
  const q = query.toLowerCase().trim();
  if (entry === q) return 1.0;
  if (entry.includes(q) || q.includes(entry)) return 0.8;
  const eWords = new Set(entry.split(/\s+/));
  const qWords = q.split(/\s+/);
  const overlap = qWords.filter((w) => eWords.has(w)).length;
  return overlap / Math.max(qWords.length, 1);
}

const UA = "binayah-properties/1.0 (https://binayah.com)";

// ---------------------------------------------------------------------------
// Source 1 + 2: Wikipedia REST API
// ---------------------------------------------------------------------------

interface WikiSummary {
  title: string;
  description?: string;
  extract?: string;
  thumbnail?: { source: string };
  content_urls?: { desktop?: { page?: string } };
}

async function wikiSummary(titleSlug: string): Promise<WikiSummary | null> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(titleSlug)}`,
      { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(12_000) }
    );
    if (!res.ok) return null;
    return (await res.json()) as WikiSummary;
  } catch {
    return null;
  }
}

async function wikiSearch(query: string): Promise<WikiSummary | null> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query + " Dubai")}&format=json&srlimit=3&origin=*`,
      { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(12_000) }
    );
    if (!res.ok) return null;
    const hits: Array<{ title: string }> = (await res.json())?.query?.search ?? [];
    for (const hit of hits) {
      if (scoreMatch(hit.title, query) < 0.3) continue;
      const summary = await wikiSummary(hit.title.replace(/ /g, "_"));
      if (summary) return summary;
    }
    return null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Source 3: Nominatim → Wikidata → Wikipedia
// Handles abbreviations (JVC → Jumeirah Village Circle) and places with
// non-English Wikipedia links.
// ---------------------------------------------------------------------------

async function nominatimBridge(query: string): Promise<WikiSummary | null> {
  try {
    // Step 1: Nominatim search — get OSM result with extratags
    const nomRes = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + " Dubai")}&format=json&limit=1&extratags=1&namedetails=1`,
      { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(10_000) }
    );
    if (!nomRes.ok) return null;
    const nomData = await nomRes.json();
    const hit = nomData?.[0];
    if (!hit) return null;

    const tags = hit.extratags ?? {};
    let wikiTitle: string | null = null;

    // Step 2a: direct English Wikipedia tag
    if (tags.wikipedia?.startsWith("en:")) {
      wikiTitle = tags.wikipedia.slice(3).replace(/ /g, "_");
    }
    // Step 2b: Wikidata ID → resolve to enwiki title
    else if (tags.wikidata) {
      try {
        const wdRes = await fetch(
          `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${tags.wikidata}&props=sitelinks&sitefilter=enwiki&format=json`,
          { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(8_000) }
        );
        if (wdRes.ok) {
          const wdData = await wdRes.json();
          const enwiki = wdData?.entities?.[tags.wikidata]?.sitelinks?.enwiki?.title;
          if (enwiki) wikiTitle = enwiki.replace(/ /g, "_");
        }
      } catch {
        // non-fatal
      }
    }
    // Step 2c: use the English name from Nominatim as a Wikipedia title guess
    else {
      const enName =
        hit.namedetails?.["name:en"] || hit.namedetails?.name;
      if (enName && scoreMatch(enName, query) >= 0.4) {
        wikiTitle = enName.replace(/ /g, "_");
      }
    }

    if (!wikiTitle) return null;

    const summary = await wikiSummary(wikiTitle);
    if (!summary || scoreMatch(summary.title, query) < 0.25) return null;
    return summary;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export async function scrapeCommunityInfo(query: string): Promise<CommunityInfoPage | null> {
  // Source 1: direct Wikipedia title
  const titleSlug = query
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\s+/g, "_");

  let summary = await wikiSummary(titleSlug);

  // Source 2: Wikipedia search
  if (!summary || scoreMatch(summary.title, query) < 0.3) {
    summary = await wikiSearch(query);
  }

  // Source 3: Nominatim → Wikidata → Wikipedia
  if (!summary || scoreMatch(summary.title, query) < 0.3) {
    summary = await nominatimBridge(query);
  }

  if (!summary?.title || scoreMatch(summary.title, query) < 0.25) return null;

  const isDubai =
    summary.description?.toLowerCase().includes("dubai") ||
    summary.extract?.toLowerCase().includes("dubai");

  if (!isDubai) return null;

  const slug = toSlug(summary.title);
  const wikiUrl =
    summary.content_urls?.desktop?.page ??
    `https://en.wikipedia.org/wiki/${encodeURIComponent(summary.title.replace(/ /g, "_"))}`;

  return {
    slug,
    name: summary.title,
    location: "Dubai, UAE",
    description: summary.extract?.slice(0, 600) ?? undefined,
    heroImage: summary.thumbnail?.source,
    sources: [wikiUrl],
    scrapedAt: new Date(),
  };
}
