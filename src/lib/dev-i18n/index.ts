// Translated developer "About" descriptions. The API serves a single English
// `description`; this module supplies native-language bodies for the locales that
// have been fully translated, so non-EN developer pages carry localized body copy
// (self-canonical + hreflang) instead of showing English text.
//
// Only developers that HAD an English description are present here — developers
// with no description fall back to the locale-aware buildDeveloperSummary().

// Locales with complete developer-description translations.
export const TRANSLATED_DEV_LOCALES: string[] = ["ru", "fr", "ar", "zh", "vi", "he"];

// Lazy per-locale loaders — only the requested locale's JSON is loaded (server
// component passes the translated string down as a prop, so it stays off the
// client bundle).
const LOADERS: Record<string, () => Promise<Record<string, string>>> = {
  ru: () => import("./ru.json").then((m) => m.default as unknown as Record<string, string>),
  fr: () => import("./fr.json").then((m) => m.default as unknown as Record<string, string>),
  ar: () => import("./ar.json").then((m) => m.default as unknown as Record<string, string>),
  zh: () => import("./zh.json").then((m) => m.default as unknown as Record<string, string>),
  vi: () => import("./vi.json").then((m) => m.default as unknown as Record<string, string>),
  he: () => import("./he.json").then((m) => m.default as unknown as Record<string, string>),
};

export function isDevLocaleTranslated(locale: string): boolean {
  return TRANSLATED_DEV_LOCALES.includes(locale);
}

export async function getDeveloperTranslation(
  locale: string,
  slug: string,
): Promise<string | null> {
  const loader = LOADERS[locale];
  if (!loader) return null;
  try {
    const map = await loader();
    const v = map[slug];
    return v && v.trim() ? v : null;
  } catch {
    return null;
  }
}
