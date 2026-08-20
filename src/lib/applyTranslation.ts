/**
 * Merges locale-specific translations into a DB document.
 *
 * Convention: the base document has fields in English at the top level, and
 * `translations[locale]` holds non-en overrides (e.g. `translations.ar.name`).
 * Missing / empty / empty-array translation values fall back to English.
 *
 * Safe for strings, string arrays, shallow nested objects (e.g. `seo`,
 * `faqs[]` of `{question, answer}`) and tuple arrays (e.g. `[heading, body]`,
 * which stay arrays rather than collapsing to {0,1} objects). Does NOT mutate
 * the input.
 */
export function applyTranslation<T extends Record<string, any>>(
  doc: T | null | undefined,
  locale: string | undefined,
): T | null {
  if (!doc) return doc ?? null;
  if (!locale || locale === "en") return doc;
  const t = doc.translations?.[locale];
  if (!t || typeof t !== "object") return doc;

  const merged: any = { ...doc };

  for (const key of Object.keys(t)) {
    const tv = t[key];
    if (!hasContent(tv)) continue;

    if (Array.isArray(tv)) {
      // Array of objects (e.g. faqs): merge item-by-item against the base.
      const base = Array.isArray(merged[key]) ? merged[key] : [];
      if (tv.length && typeof tv[0] === "object" && tv[0] !== null) {
        merged[key] = tv.map((item: any, i: number) => {
          // Tuple-shaped entries — e.g. an offer's valueProps: [heading, body],
          // or worked.rows: [label, value] — must stay ARRAYS. Arrays are
          // typeof "object", so without this they fall into the spread below and
          // come back as {0: …, 1: …}; any `[a, b] = item` downstream then throws
          // "object is not iterable". Merge positionally instead, so a missing
          // element still falls back to English.
          if (Array.isArray(item)) {
            const barr: any[] = Array.isArray(base[i]) ? base[i] : [];
            const len = Math.max(barr.length, item.length);
            const merged: any[] = [];
            for (let j = 0; j < len; j++) merged.push(hasContent(item[j]) ? item[j] : barr[j]);
            return merged;
          }
          const bitem = base[i] && typeof base[i] === "object" ? base[i] : {};
          const out: any = { ...bitem };
          for (const k of Object.keys(item)) {
            if (hasContent(item[k])) out[k] = item[k];
          }
          return out;
        });
      } else {
        merged[key] = tv;
      }
    } else if (tv && typeof tv === "object") {
      // Shallow merge (e.g. seo): only overwrite non-empty fields.
      const base = merged[key] && typeof merged[key] === "object" ? merged[key] : {};
      const out: any = { ...base };
      for (const k of Object.keys(tv)) {
        if (hasContent(tv[k])) out[k] = tv[k];
      }
      merged[key] = out;
    } else {
      merged[key] = tv;
    }
  }

  return merged as T;
}

function hasContent(v: unknown): boolean {
  if (v == null) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (Array.isArray(v)) return v.some((x) => x != null && (typeof x !== "string" || x.trim().length > 0));
  return true;
}
