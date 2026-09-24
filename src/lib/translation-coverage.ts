// Which non-English locales a document is GENUINELY translated into, for
// deciding indexability/hreflang via `localizedSeo()` in @/lib/site.
//
// `Object.keys(doc.translations)` is not a safe proxy for "translated": a
// project can carry `translations.fr = { name: "" }` with every field empty
// (falls back to English everywhere via applyTranslation), or a translations
// entry that only overrides a title while the body stays English. Either way
// the rendered page is an English-body duplicate under a /fr/ URL. This
// checks that at least one of the fields a reader actually reads — the body
// copy, not metadata — has real content.

const NON_EN_LOCALES = ["ru", "ar", "zh", "vi", "he", "fr"] as const;

function hasText(v: unknown): boolean {
  return typeof v === "string" && v.trim().length > 0;
}

/**
 * @param doc a document with an optional `translations: Record<locale, Record<field, unknown>>` map
 * @param bodyFields the field name(s) that hold actual body copy for this
 *   content type (e.g. `["fullDescription", "shortOverview"]` for a project,
 *   `["body"]` for an article) — a locale counts as translated only if at
 *   least one of these is non-empty for it.
 */
export function translatedLocalesOf(
  doc: { translations?: Record<string, Record<string, unknown>> } | null | undefined,
  bodyFields: readonly string[],
): string[] {
  if (!doc?.translations) return [];
  return NON_EN_LOCALES.filter((l) => {
    const t = doc.translations?.[l];
    if (!t) return false;
    return bodyFields.some((f) => hasText(t[f]));
  });
}
