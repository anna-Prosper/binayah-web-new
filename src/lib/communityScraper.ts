/**
 * Community Info Scraper — BrightData Web Unlocker
 *
 * Strategy: try direct per-slug pages on real-estate portals.
 * This handles both community names (Downtown Dubai) and building names (Burj Vista).
 *
 * Source priority:
 *   1. Bayut community page
 *   2. PropertyFinder community page
 *   3. Bayut listing search (fallback, extracts info from search results)
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

interface ScrapedCommunity {
  name: string;
  location?: string;
  description?: string;
  developerName?: string;
  heroImage?: string;
  amenities?: string[];
  priceRange?: { min: number; max: number; currency: string };
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
// BrightData fetch wrapper (15s timeout)
// ---------------------------------------------------------------------------

async function brightDataFetch(url: string): Promise<string | null> {
  const proxyUrl = process.env.BRIGHTDATA_PROXY_URL;
  const username = process.env.BRIGHTDATA_USERNAME;
  const password = process.env.BRIGHTDATA_PASSWORD;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);

  try {
    const headers: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    };

    if (proxyUrl && username && password) {
      const response = await fetch("https://api.brightdata.com/request", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${password}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          zone: username.replace("brd-customer-hl_2343de0d-zone-", ""),
          url,
          format: "raw",
          country: "ae",
        }),
        signal: controller.signal,
      });
      if (response.ok) return await response.text();
    }

    const response = await fetch(url, { headers, signal: controller.signal });
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Meta-tag extraction helpers (works across all SEO-optimised sites)
// ---------------------------------------------------------------------------

function extractMeta(html: string, attr: string, value: string): string | undefined {
  const pattern = new RegExp(
    `<meta[^>]+${attr}=["']${value}["'][^>]+content=["']([^"']{10,600})["']`,
    "i"
  );
  const m = pattern.exec(html);
  if (m) return m[1].trim();
  // Reversed attribute order
  const pattern2 = new RegExp(
    `<meta[^>]+content=["']([^"']{10,600})["'][^>]+${attr}=["']${value}["']`,
    "i"
  );
  return pattern2.exec(html)?.[1]?.trim();
}

function extractH1(html: string): string | undefined {
  return /<h1[^>]*>([^<]{3,120})<\/h1>/i.exec(html)?.[1]?.trim();
}

function extractOgImage(html: string): string | undefined {
  const img = extractMeta(html, "property", "og:image");
  return img?.startsWith("http") ? img : undefined;
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
// Source 1: Bayut community/building page
// URL: https://www.bayut.com/community/{slug}/
// ---------------------------------------------------------------------------

async function scrapeBayut(query: string): Promise<{ url: string; data: ScrapedCommunity } | null> {
  const slug = toSlug(query);
  const url = `https://www.bayut.com/community/${slug}/`;
  const html = await brightDataFetch(url);
  if (!html) return null;

  // Bail out on 404/error pages — Bayut renders an h1 with the community name on real pages
  const h1 = extractH1(html);
  if (!h1 || scoreMatch(h1, query) < 0.4) return null;

  const description =
    extractMeta(html, "name", "description") ??
    extractMeta(html, "property", "og:description");

  const heroImage = extractOgImage(html);

  // Developer name — Bayut often shows "by {Developer}" near the heading
  const devMatch = /by\s+([A-Z][a-zA-Z\s&]{2,50})/i.exec(html.slice(0, 5000));
  const developerName = devMatch?.[1]?.trim();

  // Location — look for "Dubai" suburb pattern in first 3000 chars
  const locMatch = /(Downtown Dubai|Dubai Marina|Business Bay|Palm Jumeirah|JBR|JVC|JVT|Dubai Hills|Creek Harbour|MBR City|DIFC|Jumeirah|Al Barsha|Deira|Bur Dubai|Motor City|Sports City|Arabian Ranches|Dubai South|Dubai Silicon Oasis|International City|Discovery Gardens|Al Furjan|Meydan|Sobha Hartland)/i.exec(
    html.slice(0, 8000)
  );
  const location = locMatch?.[1];

  return { url, data: { name: h1, description, heroImage, developerName, location } };
}

// ---------------------------------------------------------------------------
// Source 2: PropertyFinder community page
// URL: https://www.propertyfinder.ae/en/communities/{slug}.html
// ---------------------------------------------------------------------------

async function scrapePropertyFinder(query: string): Promise<{ url: string; data: ScrapedCommunity } | null> {
  const slug = toSlug(query);
  const url = `https://www.propertyfinder.ae/en/communities/${slug}.html`;
  const html = await brightDataFetch(url);
  if (!html) return null;

  const h1 = extractH1(html);
  if (!h1 || scoreMatch(h1, query) < 0.4) return null;

  const description =
    extractMeta(html, "name", "description") ??
    extractMeta(html, "property", "og:description");

  const heroImage = extractOgImage(html);

  return { url, data: { name: h1, description, heroImage } };
}

// ---------------------------------------------------------------------------
// Source 3: Bayut search results page (fallback)
// URL: https://www.bayut.com/to-buy/apartments-in-{slug}-dubai/
// Infers community name from page title / listings
// ---------------------------------------------------------------------------

async function scrapeBayutSearch(query: string): Promise<{ url: string; data: ScrapedCommunity } | null> {
  const slug = toSlug(query);
  const url = `https://www.bayut.com/to-buy/apartments-in-${slug}-dubai/`;
  const html = await brightDataFetch(url);
  if (!html) return null;

  const ogTitle = extractMeta(html, "property", "og:title");
  if (!ogTitle || scoreMatch(ogTitle, query) < 0.3) return null;

  // Extract the community name from the og:title — usually "Apartments for Sale in X, Dubai"
  const nameMatch = /(?:in|at)\s+([^,|]{3,80})/i.exec(ogTitle);
  const name = nameMatch?.[1]?.trim() ?? ogTitle;

  if (scoreMatch(name, query) < 0.3) return null;

  const description =
    extractMeta(html, "name", "description") ??
    extractMeta(html, "property", "og:description");

  const heroImage = extractOgImage(html);

  return { url, data: { name, description, heroImage } };
}

// ---------------------------------------------------------------------------
// Main scrape function — try sources in priority order, merge gaps
// ---------------------------------------------------------------------------

export async function scrapeCommunityInfo(query: string): Promise<CommunityInfoPage | null> {
  const sources: string[] = [];
  let merged: Partial<ScrapedCommunity> = {};

  const [r1, r2, r3] = await Promise.allSettled([
    scrapeBayut(query),
    scrapePropertyFinder(query),
    scrapeBayutSearch(query),
  ]);

  const results = [
    r1.status === "fulfilled" ? r1.value : null,
    r2.status === "fulfilled" ? r2.value : null,
    r3.status === "fulfilled" ? r3.value : null,
  ];

  for (const result of results) {
    if (!result) continue;

    sources.push(result.url);
    const data = result.data;

    if (!merged.name) {
      merged = { ...data };
    } else {
      if (!merged.location && data.location) merged.location = data.location;
      if (!merged.description && data.description) merged.description = data.description;
      if (!merged.developerName && data.developerName) merged.developerName = data.developerName;
      if (!merged.heroImage && data.heroImage) merged.heroImage = data.heroImage;
      if (!merged.amenities && data.amenities) merged.amenities = data.amenities;
      if (!merged.priceRange && data.priceRange) merged.priceRange = data.priceRange;
    }
  }

  if (!merged.name) return null;

  const slug = toSlug(merged.name);

  return {
    slug,
    name: merged.name,
    location: merged.location,
    description: merged.description,
    developerName: merged.developerName,
    heroImage: merged.heroImage,
    amenities: merged.amenities?.length ? merged.amenities : undefined,
    priceRange: merged.priceRange,
    sources,
    scrapedAt: new Date(),
  };
}
