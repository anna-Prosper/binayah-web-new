// Strips WordPress cache-plugin boilerplate that was scraped into project
// descriptions (e.g. "Note: None of these options will be applied if this post
// has been excluded from cache in the global cache settings.") — present in
// ~2,200 projects' fullDescription. Used server-side so the junk never reaches
// the client (not rendered, not in the serialized RSC payload, not in SEO).
export function stripCacheJunk(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .replace(/Note:\s*None of these options[^.]*\.?/gi, "")
    .replace(/^.*\b(?:excluded from cache|global cache settings|none of these options will be applied)\b.*$/gim, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Sanitize the free-text description fields on a project/listing object in place-ish (returns a new object). */
export function sanitizeDescriptions<T extends Record<string, unknown>>(obj: T): T {
  if (!obj || typeof obj !== "object") return obj;
  const FIELDS = ["fullDescription", "rawDescription", "shortOverview", "overview", "cleanDescription", "description", "locationDescription"];
  const out: Record<string, unknown> = { ...obj };
  for (const f of FIELDS) {
    if (typeof out[f] === "string") out[f] = stripCacheJunk(out[f] as string);
  }
  return out as T;
}
