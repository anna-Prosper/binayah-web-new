// Full guide-body/FAQ translations. English bodies live in pulse-guides.ts;
// this module supplies translated bodies + FAQs for the locales that have been
// fully translated, so those pages can be indexed with self-canonical + hreflang
// instead of noindex→EN.

export type GuideTranslation = { body: string; faq: { question: string; answer: string }[] };

// Locales with complete guide-body translations (indexable, self-canonical).
export const TRANSLATED_GUIDE_LOCALES: string[] = ["ru", "fr", "ar", "zh", "vi", "he"];

// Lazy per-locale loaders — only the requested locale's JSON is loaded, keeping
// it off the client bundle (the page is a server component and passes the
// translated body/faq down as props).
const LOADERS: Record<string, () => Promise<Record<string, GuideTranslation>>> = {
  ru: () => import("./ru.json").then((m) => m.default as unknown as Record<string, GuideTranslation>),
  fr: () => import("./fr.json").then((m) => m.default as unknown as Record<string, GuideTranslation>),
  ar: () => import("./ar.json").then((m) => m.default as unknown as Record<string, GuideTranslation>),
  zh: () => import("./zh.json").then((m) => m.default as unknown as Record<string, GuideTranslation>),
  vi: () => import("./vi.json").then((m) => m.default as unknown as Record<string, GuideTranslation>),
  he: () => import("./he.json").then((m) => m.default as unknown as Record<string, GuideTranslation>),
};

export function isGuideLocaleTranslated(locale: string): boolean {
  return TRANSLATED_GUIDE_LOCALES.includes(locale);
}

export async function getGuideTranslation(
  locale: string,
  slug: string
): Promise<GuideTranslation | null> {
  const loader = LOADERS[locale];
  if (!loader) return null;
  try {
    const map = await loader();
    return map[slug] ?? null;
  } catch {
    return null;
  }
}
