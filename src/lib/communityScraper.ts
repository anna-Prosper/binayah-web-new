/**
 * Community Info Scraper — Wikipedia REST API
 *
 * Primary: Wikipedia page/summary API (free, no auth, no CAPTCHA, covers Dubai
 * communities AND buildings like Burj Vista).
 * Fallback: Wikipedia search API if direct title lookup misses.
 *
 * No BrightData required — the datacenter proxy zone we have doesn't bypass
 * CAPTCHA on Bayut/PropertyFinder anyway.
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
// Slug helper
// ---------------------------------------------------------------------------

export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ---------------------------------------------------------------------------
// Score: how well does a name match the query?
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Wikipedia REST API helpers
// ---------------------------------------------------------------------------

const WIKI_UA = "binayah-properties/1.0 (https://binayah.com)";

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
      { headers: { "User-Agent": WIKI_UA }, signal: AbortSignal.timeout(12_000) }
    );
    if (!res.ok) return null;
    return (await res.json()) as WikiSummary;
  } catch {
    return null;
  }
}

async function wikiSearch(query: string): Promise<WikiSummary | null> {
  try {
    const searchRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query + " Dubai")}&format=json&srlimit=3&origin=*`,
      { headers: { "User-Agent": WIKI_UA }, signal: AbortSignal.timeout(12_000) }
    );
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();
    const hits: Array<{ title: string }> = searchData?.query?.search ?? [];

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
// Main scrape function
// ---------------------------------------------------------------------------

export async function scrapeCommunityInfo(query: string): Promise<CommunityInfoPage | null> {
  // 1. Direct title lookup — convert "burj vista" → "Burj_Vista"
  const titleSlug = query
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\s+/g, "_");

  let summary = await wikiSummary(titleSlug);

  // 2. If direct miss or poor match, try search
  if (!summary || scoreMatch(summary.title, query) < 0.3) {
    summary = await wikiSearch(query);
  }

  if (!summary || !summary.title || scoreMatch(summary.title, query) < 0.3) {
    return null;
  }

  const isDubai =
    summary.description?.toLowerCase().includes("dubai") ||
    summary.extract?.toLowerCase().includes("dubai");

  // Only surface pages that are actually about Dubai
  if (!isDubai) return null;

  const slug = toSlug(summary.title);
  const wikiUrl =
    summary.content_urls?.desktop?.page ??
    `https://en.wikipedia.org/wiki/${encodeURIComponent(summary.title.replace(/ /g, "_"))}`;

  return {
    slug,
    name: summary.title,
    location: isDubai ? "Dubai, UAE" : undefined,
    description: summary.extract?.slice(0, 600) ?? undefined,
    heroImage: summary.thumbnail?.source,
    sources: [wikiUrl],
    scrapedAt: new Date(),
  };
}
