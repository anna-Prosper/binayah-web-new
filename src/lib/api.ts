import { cache } from "react";

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
