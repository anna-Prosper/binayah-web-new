/**
 * Turn whatever the feed stored in `author` into something displayable.
 *
 * 762 of 1,264 articles carry an INTEGER here — a WordPress user id, usually
 * 1 — and the other 502 carry a name. That difference took every one of those
 * 762 pages down with a 500:
 *
 *   const authorName = article.author || 'Binayah Editorial';
 *   authorName.split(' ')            // TypeError: b.split is not a function
 *
 * An integer is truthy, so `||` never reached the fallback. The same shape of
 * mistake as the `category` field next door: a value typed as string that the
 * data has never consistently been.
 *
 * Returns null rather than a fallback when there is no real name, so callers
 * can still choose to hide a byline entirely instead of inventing one — three
 * of the six call sites want exactly that, and were previously rendering the
 * raw user id as the author's name.
 */
export function newsAuthorName(author: unknown): string | null {
  if (typeof author === "string") {
    const t = author.trim();
    return t ? t : null;
  }
  // Numbers, objects and anything else are ids or junk, never a display name.
  return null;
}

/** For places that must print something: a byline, or JSON-LD's required author. */
export function newsAuthorOrDefault(author: unknown): string {
  return newsAuthorName(author) ?? "Binayah Editorial";
}
