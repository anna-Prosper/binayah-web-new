// Translated community enrichment content. The API serves a single English
// `enrichment` object (overview, tagline, highlights, faqs, sectionHeadings,
// amenityCategories, connectivity, keyFacts, lifestyle, subCommunities,
// targetBuyer, investmentNote). This module supplies native-language versions of
// the translatable fields for the locales that have been fully translated, so
// non-EN community pages carry localized body copy (self-canonical + hreflang)
// instead of English. Merged field-by-field over the English enrichment, so any
// field missing from a translation falls back to English.

// A partial enrichment — same shape as the API's enrichment, all fields optional.
export type EnrichmentTranslation = Record<string, unknown>;

// Locales with complete community-enrichment translations.
export const TRANSLATED_COMMUNITY_LOCALES: string[] = ["ru", "fr", "ar", "zh", "vi", "he"];

// Lazy per-locale loaders — only the requested locale's JSON is loaded (server
// component merges + passes the enrichment down as a prop, off the client bundle).
const LOADERS: Record<string, () => Promise<Record<string, EnrichmentTranslation>>> = {
  ru: () => import("./ru.json").then((m) => m.default as unknown as Record<string, EnrichmentTranslation>),
  fr: () => import("./fr.json").then((m) => m.default as unknown as Record<string, EnrichmentTranslation>),
  ar: () => import("./ar.json").then((m) => m.default as unknown as Record<string, EnrichmentTranslation>),
  zh: () => import("./zh.json").then((m) => m.default as unknown as Record<string, EnrichmentTranslation>),
  vi: () => import("./vi.json").then((m) => m.default as unknown as Record<string, EnrichmentTranslation>),
  he: () => import("./he.json").then((m) => m.default as unknown as Record<string, EnrichmentTranslation>),
};

export function isCommunityLocaleTranslated(locale: string): boolean {
  return TRANSLATED_COMMUNITY_LOCALES.includes(locale);
}

export async function getCommunityEnrichmentTranslation(
  locale: string,
  slug: string,
): Promise<EnrichmentTranslation | null> {
  const loader = LOADERS[locale];
  if (!loader) return null;
  try {
    const map = await loader();
    return map[slug] ?? null;
  } catch {
    return null;
  }
}

// Overlay a translated enrichment on top of the English one, field-by-field.
// Translated fields win; anything the translation omits keeps its English value.
// Returns the English enrichment unchanged when there's no translation.
export function mergeEnrichment(
  englishEnrichment: Record<string, unknown> | null | undefined,
  translation: EnrichmentTranslation | null,
): Record<string, unknown> | null | undefined {
  if (!translation) return englishEnrichment;
  return { ...(englishEnrichment || {}), ...translation };
}
