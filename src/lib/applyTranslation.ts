/**
 * Merges locale-specific translations into a DB document.
 *
 * Convention: the base document has fields in English at the top level, and
 * `translations[locale]` holds non-en overrides (e.g. `translations.ar.name`).
 * Missing / empty / empty-array translation values fall back to English.
 *
 * Safe for strings, string arrays, and shallow nested objects (e.g. `seo`,
 * `faqs[]` of `{question, answer}`). Does NOT mutate the input.
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
