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
 * Fetch wrapper for server components — times out after `ms` milliseconds
 * so cold Render starts don't block the build for 60s+.
 * Falls back gracefully; callers should handle a non-ok response.
 */
export async function serverFetch(
  url: string,
  ms = 8000
): Promise<Response> {
  return fetch(url, { signal: AbortSignal.timeout(ms) });
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
export const getListing = cache(async (slug: string) =>
  fetchJsonOr404(`/api/listings/${slug}`)
);
export const getNewsArticle = cache(async (slug: string) =>
  fetchJsonOr404(`/api/news/${slug}`)
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
