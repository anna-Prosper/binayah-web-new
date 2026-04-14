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
