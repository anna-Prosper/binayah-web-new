/**
 * Community Info Scraper — BrightData Web Unlocker
 *
 * Required env vars (add to .env.local + Vercel):
 *   BRIGHTDATA_PROXY_URL
 *   BRIGHTDATA_USERNAME
 *   BRIGHTDATA_PASSWORD
 *
 * Three target sources, scraped in order. First match for primary fields;
 * subsequent sources fill any still-empty fields.
 *
 * Returns null if no usable name match found across all sources.
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
// BrightData fetch wrapper (10s timeout, proxy auth)
// ---------------------------------------------------------------------------

async function brightDataFetch(url: string): Promise<string | null> {
  const proxyUrl = process.env.BRIGHTDATA_PROXY_URL;
  const username = process.env.BRIGHTDATA_USERNAME;
  const password = process.env.BRIGHTDATA_PASSWORD;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);

  try {
    const headers: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    };

    // If BrightData credentials are configured, use proxy via x-brd-* headers
    // (Vercel serverless doesn't support HTTP_PROXY env; use BrightData's
    // header-based Web Unlocker instead when proxy URL is available)
    if (proxyUrl && username && password) {
      // Use BrightData Web Unlocker API endpoint directly
      // This sends the target URL through the unlocker service
      const unlockUrl = `https://api.brightdata.com/request`;
      const response = await fetch(unlockUrl, {
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
      if (response.ok) {
        return await response.text();
      }
    }

    // Fallback: direct fetch (works in dev without BrightData)
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
// Score: how well does an entry name match the query?
// ---------------------------------------------------------------------------

function scoreMatch(entryName: string, query: string): number {
  const entry = entryName.toLowerCase().trim();
  const q = query.toLowerCase().trim();
  if (entry === q) return 1.0;
  if (entry.includes(q) || q.includes(entry)) return 0.8;
  // Word overlap
  const eWords = new Set(entry.split(/\s+/));
  const qWords = q.split(/\s+/);
  const overlap = qWords.filter((w) => eWords.has(w)).length;
  return overlap / Math.max(qWords.length, 1);
}

// ---------------------------------------------------------------------------
// Source 1: keyone.com/dubai-communities
// ---------------------------------------------------------------------------

async function scrapeKeyOne(query: string): Promise<ScrapedCommunity | null> {
  const html = await brightDataFetch("https://www.keyone.com/dubai-communities");
  if (!html) return null;

  try {
    // Simple regex-based extraction (no cheerio — not in deps)
    // Look for community names in headings / links
    const entries: Array<{ name: string; desc?: string; img?: string; location?: string }> = [];

    // Extract community cards — keyone uses h2/h3 headings + paragraph text
    const headingPattern = /<h[23][^>]*>([^<]{3,80})<\/h[23]>/gi;
    let match;
    while ((match = headingPattern.exec(html)) !== null) {
      const name = match[1].replace(/&amp;/g, "&").replace(/&#\d+;/g, "").trim();
      if (name.length > 3 && name.length < 80) {
        entries.push({ name });
      }
    }

    // Find best match
    let best: { name: string; score: number; idx: number } | null = null;
    entries.forEach((entry, idx) => {
      const score = scoreMatch(entry.name, query);
      if (!best || score > best.score) {
        best = { name: entry.name, score, idx };
      }
    });

    if (!best || best.score < 0.5) return null;

    const matched = entries[best.idx];

    // Try to extract an image near this heading position in HTML
    const nameEscaped = matched.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const imgPattern = new RegExp(
      `${nameEscaped}[\\s\\S]{0,500}?<img[^>]+src=["']([^"']+)["']`,
      "i"
    );
    const imgMatch = imgPattern.exec(html);
    const heroImage = imgMatch?.[1]?.startsWith("http") ? imgMatch[1] : undefined;

    // Try to extract a description paragraph near the match
    const descPattern = new RegExp(
      `${nameEscaped}[\\s\\S]{0,300}?<p[^>]*>([^<]{30,500})<\/p>`,
      "i"
    );
    const descMatch = descPattern.exec(html);
    const description = descMatch?.[1]?.replace(/&[a-z]+;/g, " ").trim();

    return {
      name: matched.name,
      heroImage,
      description,
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Source 2: tanamiproperties.com/Communities
// ---------------------------------------------------------------------------

async function scrapeTanami(query: string): Promise<ScrapedCommunity | null> {
  const html = await brightDataFetch("https://www.tanamiproperties.com/Communities");
  if (!html) return null;

  try {
    const entries: Array<{ name: string }> = [];

    const headingPattern = /<h[234][^>]*>([^<]{3,80})<\/h[234]>/gi;
    let match;
    while ((match = headingPattern.exec(html)) !== null) {
      const name = match[1].replace(/&amp;/g, "&").replace(/&#\d+;/g, "").trim();
      if (name.length > 3 && name.length < 80) {
        entries.push({ name });
      }
    }

    let best: { name: string; score: number; idx: number } | null = null;
    entries.forEach((entry, idx) => {
      const score = scoreMatch(entry.name, query);
      if (!best || score > best.score) {
        best = { name: entry.name, score, idx };
      }
    });

    if (!best || best.score < 0.5) return null;

    const matched = entries[best.idx];

    const nameEscaped = matched.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const imgPattern = new RegExp(
      `${nameEscaped}[\\s\\S]{0,500}?<img[^>]+src=["']([^"']+)["']`,
      "i"
    );
    const imgMatch = imgPattern.exec(html);
    const heroImage = imgMatch?.[1]?.startsWith("http") ? imgMatch[1] : undefined;

    const descPattern = new RegExp(
      `${nameEscaped}[\\s\\S]{0,400}?<p[^>]*>([^<]{30,500})<\/p>`,
      "i"
    );
    const descMatch = descPattern.exec(html);
    const description = descMatch?.[1]?.replace(/&[a-z]+;/g, " ").trim();

    // Tanami often lists location (Dubai Marina, etc.) near headings
    const locationPattern = new RegExp(
      `${nameEscaped}[\\s\\S]{0,200}?(Dubai [A-Z][a-z]+(?: [A-Z][a-z]+)*|Abu Dhabi [A-Z][a-z]+|Sharjah [A-Z][a-z]+)`,
      "i"
    );
    const locationMatch = locationPattern.exec(html);
    const location = locationMatch?.[1];

    return {
      name: matched.name,
      heroImage,
      description,
      location,
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Source 3: stageproperties.com/areas-and-communities
// ---------------------------------------------------------------------------

async function scrapeStageProperties(query: string): Promise<ScrapedCommunity | null> {
  const html = await brightDataFetch("https://stageproperties.com/areas-and-communities");
  if (!html) return null;

  try {
    const entries: Array<{ name: string }> = [];

    const headingPattern = /<h[234][^>]*>([^<]{3,80})<\/h[234]>/gi;
    let match;
    while ((match = headingPattern.exec(html)) !== null) {
      const name = match[1].replace(/&amp;/g, "&").replace(/&#\d+;/g, "").trim();
      if (name.length > 3 && name.length < 80) {
        entries.push({ name });
      }
    }

    let best: { name: string; score: number; idx: number } | null = null;
    entries.forEach((entry, idx) => {
      const score = scoreMatch(entry.name, query);
      if (!best || score > best.score) {
        best = { name: entry.name, score, idx };
      }
    });

    if (!best || best.score < 0.5) return null;

    const matched = entries[best.idx];
    const nameEscaped = matched.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const imgPattern = new RegExp(
      `${nameEscaped}[\\s\\S]{0,600}?<img[^>]+src=["']([^"']+)["']`,
      "i"
    );
    const imgMatch = imgPattern.exec(html);
    const heroImage = imgMatch?.[1]?.startsWith("http") ? imgMatch[1] : undefined;

    const descPattern = new RegExp(
      `${nameEscaped}[\\s\\S]{0,400}?<p[^>]*>([^<]{30,600})<\/p>`,
      "i"
    );
    const descMatch = descPattern.exec(html);
    const description = descMatch?.[1]?.replace(/&[a-z]+;/g, " ").trim();

    // Stage properties often lists amenities as ul/li near the community
    const amenitiesPattern = new RegExp(
      `${nameEscaped}[\\s\\S]{0,600}?<ul[^>]*>([\\s\\S]{0,800}?)<\/ul>`,
      "i"
    );
    const amenitiesMatch = amenitiesPattern.exec(html);
    let amenities: string[] | undefined;
    if (amenitiesMatch?.[1]) {
      const liPattern = /<li[^>]*>([^<]{2,80})<\/li>/gi;
      const items: string[] = [];
      let liMatch;
      while ((liMatch = liPattern.exec(amenitiesMatch[1])) !== null) {
        const item = liMatch[1].trim();
        if (item.length > 1 && item.length < 80) items.push(item);
      }
      if (items.length > 0) amenities = items.slice(0, 12);
    }

    return {
      name: matched.name,
      heroImage,
      description,
      amenities,
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Main scrape function — merge results from all 3 sources
// ---------------------------------------------------------------------------

export async function scrapeCommunityInfo(query: string): Promise<CommunityInfoPage | null> {
  const sources: string[] = [];
  let merged: Partial<ScrapedCommunity> = {};

  // Run all three in parallel — each has internal 10s timeout
  const [r1, r2, r3] = await Promise.allSettled([
    scrapeKeyOne(query),
    scrapeTanami(query),
    scrapeStageProperties(query),
  ]);

  const results: Array<{ url: string; data: ScrapedCommunity | null }> = [
    { url: "https://www.keyone.com/dubai-communities", data: r1.status === "fulfilled" ? r1.value : null },
    { url: "https://www.tanamiproperties.com/Communities", data: r2.status === "fulfilled" ? r2.value : null },
    { url: "https://stageproperties.com/areas-and-communities", data: r3.status === "fulfilled" ? r3.value : null },
  ];

  for (const { url, data } of results) {
    if (!data) continue;

    sources.push(url);

    // First source with a name wins for primary fields; others fill gaps
    if (!merged.name) {
      merged = { ...data };
    } else {
      // Fill empty fields from subsequent sources
      if (!merged.location && data.location) merged.location = data.location;
      if (!merged.description && data.description) merged.description = data.description;
      if (!merged.developerName && data.developerName) merged.developerName = data.developerName;
      if (!merged.heroImage && data.heroImage) merged.heroImage = data.heroImage;
      if (!merged.amenities && data.amenities) merged.amenities = data.amenities;
      if (!merged.priceRange && data.priceRange) merged.priceRange = data.priceRange;
    }
  }

  // If no usable name found, return null
  if (!merged.name) return null;

  const slug = toSlug(merged.name);

  return {
    slug,
    name: merged.name,
    location: merged.location,
    description: merged.description,
    developerName: merged.developerName,
    heroImage: merged.heroImage,
    amenities: merged.amenities && merged.amenities.length > 0 ? merged.amenities : undefined,
    priceRange: merged.priceRange,
    sources,
    scrapedAt: new Date(),
  };
}
