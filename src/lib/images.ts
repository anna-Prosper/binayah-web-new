/**
 * Shared image constants.
 *
 * Single source of truth for the "Photo Coming Soon" placeholder shown wherever
 * a property/project/community image is missing. Point every fallback here — do
 * NOT hard-code the asset path — so the placeholder can be re-branded or
 * re-versioned in one place. Regenerate the asset with
 * `node scripts/gen-property-placeholder.mjs`.
 */
export const IMAGE_PLACEHOLDER = "/assets/property-placeholder.df014e8f.webp";

/**
 * Identity key for a gallery image: its filename, minus any query string and a
 * `_watermarked` suffix, lowercased. Two URLs that differ only by folder/path,
 * a watermark variant, or a `?` cache-buster resolve to the same key. Used to
 * de-duplicate galleries where the same photo was imported under different URLs
 * (e.g. a gallery appended twice, or featured = a watermarked copy of a slide).
 */
export function imageKey(url: string): string {
  const clean = (url || "").split("?")[0];
  const base = clean.split("/").pop() || clean;
  return base.replace(/_watermarked/i, "").toLowerCase();
}

/** De-duplicate a list of image URLs by imageKey(), keeping first occurrence. */
export function dedupeImages(urls: (string | null | undefined)[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of urls) {
    if (!u) continue;
    const k = imageKey(u);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(u);
  }
  return out;
}
