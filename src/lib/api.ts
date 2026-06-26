import { cache } from "react";
import { unstable_cache } from "next/cache";

/**
 * Returns the full API URL for a given path.
 * In production, routes to the external Fastify API.
 * In dev, can fall back to local Next.js API routes.
 */
export function apiUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_API_URL || "";
  // If external API is configured, use it
  if (base) {
    // path comes as "/api/chat" — keep as-is since Render routes match
    return `${base}${path}`;
  }
  // Fallback to local Next.js API routes (dev mode)
  return path;
}

/**
 * Returns the full API URL for server-side fetches (page.tsx / generateMetadata).
 * Uses API_BASE_URL (private env var pointing to Render) when set.
 * Falls back to NEXT_PUBLIC_API_URL, then relative path for local dev.
 */
export function serverApiUrl(path: string): string {
  const base =
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "";
  return base ? `${base}${path}` : path;
}

/**
 * Returns a proxied URL for client-side calls to protected Render endpoints.
 * Routes through /api/proxy/... so the API key stays server-side.
 * Usage: proxyUrl("/api/dld/areas") → "/api/proxy/dld/areas"
 */
export function proxyUrl(path: string): string {
  return path.replace(/^\/api\//, "/api/proxy/");
}

/**
 * Fetch wrapper for server components — times out after `ms` milliseconds
 * so cold Render starts don't block the build for 60s+.
 * Falls back gracefully; callers should handle a non-ok response.
 */
export async function serverFetch(
  url: string,
  ms = 8000,
  headers?: Record<string, string>
): Promise<Response> {
  return fetch(url, { signal: AbortSignal.timeout(ms), headers });
}

// Cached /api/search for the default home grids (/buy, /rent, /off-plan). Those
// pages are force-dynamic (SearchPageClient reads useSearchParams, so the grid
// must render server-side per request) — but a per-request live fetch against
// the Render API means a cold start can time out and leave crawlers with an
// empty "Searching…" shell. Cache the response across requests (and use a
// cold-start-tolerant timeout) so the inventory grid is reliably in the SSR
// HTML. Throws on failure so a transient miss isn't cached as null.
const _searchUncached = async (query: string): Promise<unknown> => {
  const res = await fetch(serverApiUrl(`/api/search?${query}`), {
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`search ${res.status}`);
  return res.json();
};
const _searchCached = unstable_cache(_searchUncached, ["home-search-grid"], { revalidate: 600 });
export async function getCachedSearch<T = any>(query: string): Promise<T | null> {
  try {
    return (await _searchCached(query)) as T;
  } catch {
    return null;
  }
}

// Homepage data bundle (projects + sale/rent listings + news). The homepage
// SSRs on every request and previously awaited 4 live Render calls (~2.4s each
// when cold) via Promise.all — so the slowest dominated TTFB and capped mobile
// LCP at ~2.4s+. Cache the whole bundle across requests so the SSR reads warm
// data; the slow upstream is only paid in the background every `revalidate`.
const _homepageUncached = async (): Promise<{
  projects: unknown[] | null; sale: unknown[] | null; rental: unknown[] | null; articles: unknown[] | null;
}> => {
  const [p, s, r, a] = await Promise.all([
    serverFetch(serverApiUrl("/api/projects?limit=4&sort=smart"), 20_000),
    serverFetch(serverApiUrl("/api/listings?limit=6&listingType=Sale"), 20_000),
    serverFetch(serverApiUrl("/api/listings?limit=6&listingType=Rent"), 20_000),
    serverFetch(serverApiUrl("/api/news?limit=3"), 20_000),
  ]);
  const j = async (res: Response): Promise<unknown[] | null> => {
    try { return res.ok ? await res.json() : null; } catch { return null; }
  };
  const out = { projects: await j(p), sale: await j(s), rental: await j(r), articles: await j(a) };
  // Don't cache a total failure (cold Render) — let the next request retry.
  if (!out.projects && !out.sale && !out.rental && !out.articles) throw new Error("homepage data unavailable");
  return out;
};
const _homepageCached = unstable_cache(_homepageUncached, ["homepage-data"], { revalidate: 300 });
export async function getHomepageData() {
  try {
    return await _homepageCached();
  } catch {
    return { projects: null, sale: null, rental: null, articles: null };
  }
}

// ---------------------------------------------------------------------------
// React.cache() helpers — dedupe the generateMetadata + page double-fetch.
// Each helper is request-scoped: two callers in the same render tree get one
// upstream fetch. ISR revalidate on the route handles cross-request caching.
// ---------------------------------------------------------------------------

// Typed as `any` to match current call sites; tightening types is out of scope.
async function fetchJsonOr404<T = any>(path: string): Promise<T | null> {
  try {
    const res = await serverFetch(serverApiUrl(path));
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export const getProject = cache(async (slug: string) =>
  fetchJsonOr404(`/api/projects/${slug}`)
);
// Server-side "related projects" for internal-linking (same community, falling
// back to same developer). Rendered in the project page's SSR HTML so the
// project↔project links are crawlable and pass link equity — unlike a
// client-only fetch. Mirrors the params the client carousel already used.
export const getRelatedProjects = cache(
  async (community: string, developerName: string, excludeSlug: string, limit = 8): Promise<any[]> => {
    const params = new URLSearchParams();
    if (community) params.set("community", community);
    else if (developerName) params.set("q", developerName);
    if (excludeSlug) params.set("exclude", excludeSlug);
    params.set("limit", String(limit));
    const raw = await fetchJsonOr404<any[]>(`/api/projects?${params.toString()}`);
    const arr = Array.isArray(raw) ? raw : [];
    return arr.filter((p) => p?.slug && p.slug !== excludeSlug).slice(0, limit);
  }
);
export const getListing = cache(async (slug: string) =>
  fetchJsonOr404(`/api/listings/${slug}`)
);

// DLD building data (avg ppsf/price, sales/units, room mix, recent transactions).
// These endpoints require the API key, so fetch server-side with the x-api-key
// header (never exposed to the browser).
const DLD_HEADERS = (): Record<string, string> => ({ "x-api-key": process.env.API_KEY || "" });
export const getDldBuilding = cache(async (slug: string): Promise<any | null> => {
  try {
    const res = await serverFetch(serverApiUrl(`/api/dld/buildings/${encodeURIComponent(slug)}`), 8000, DLD_HEADERS());
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
});
export const getDldBuildings = cache(
  async (params: string): Promise<{ results: any[]; total: number; hasMore: boolean }> => {
    try {
      const res = await serverFetch(serverApiUrl(`/api/dld/buildings?${params}`), 10_000, DLD_HEADERS());
      if (!res.ok) return { results: [], total: 0, hasMore: false };
      const d = await res.json();
      return { results: Array.isArray(d?.results) ? d.results : [], total: d?.total ?? 0, hasMore: !!d?.hasMore };
    } catch {
      return { results: [], total: 0, hasMore: false };
    }
  }
);
export const getNewsArticle = cache(async (slug: string, lang = "en") =>
  fetchJsonOr404(`/api/news/${slug}?lang=${lang}`)
);
export const getRelatedNews = cache(
  async (currentSlug: string, category?: string, limit = 3, lang = "en"): Promise<any[]> => {
    try {
      const raw = await fetchJsonOr404<any>(`/api/news?limit=20&lang=${lang}`);
      const list: any[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.articles)
        ? raw.articles
        : Array.isArray(raw?.data)
        ? raw.data
        : [];
      if (list.length === 0) return [];
      const cat = (category || "").toString().toLowerCase();
      const filtered = list.filter((a) => a?.slug && a.slug !== currentSlug);
      const sameCategory = cat
        ? filtered.filter((a) => (a?.category || "").toString().toLowerCase() === cat)
        : [];
      const others = filtered.filter((a) => !sameCategory.includes(a));
      return [...sameCategory, ...others].slice(0, limit);
    } catch {
      return [];
    }
  }
);
export const getDeveloper = cache(async (slug: string) =>
  fetchJsonOr404(`/api/developers/${slug}`)
);
export const getCommunity = cache(async (slug: string) =>
  fetchJsonOr404(`/api/communities/${slug}`)
);
export const getConstructionUpdate = cache(async (slug: string) =>
  fetchJsonOr404(`/api/construction-updates/${slug}`)
);
