// Full guide-body/FAQ translations. English bodies live in pulse-guides.ts;
// this module supplies translated bodies + FAQs for the locales that have been
// fully translated, so those pages can be indexed with self-canonical + hreflang
// instead of noindex→EN.

export type GuideTranslation = { body: string; faq: { question: string; answer: string }[] };

/** Minimal guide shape these helpers need. Kept structural so callers can pass
 *  a full PulseGuide without a circular import. */
type TranslatableGuide = {
  slug: string;
  body: string;
  faq?: { question: string; answer: string }[];
  translations?: Record<
    string,
    { title?: string; description?: string; body?: string; faq?: { question: string; answer: string }[] }
  >;
};

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

// Which of the translated locales actually contain THIS guide. The detail page
// indexes a non-English locale only when the specific guide exists in that
// locale's JSON — so a newly-added English-only guide is noindex→EN in the
// other locales instead of being indexed with an English body under a
// translated URL (wrong-language duplicate). Existing guides that ARE fully
// translated behave exactly as before.
export async function translatedLocalesForGuide(slug: string): Promise<string[]> {
  const out: string[] = [];
  for (const l of TRANSLATED_GUIDE_LOCALES) {
    const loader = LOADERS[l];
    if (!loader) continue;
    try {
      const map = await loader();
      if (map[slug]) out.push(l);
    } catch {
      /* ignore a missing/broken locale file */
    }
  }
  return out;
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


/**
 * Body + FAQ for a locale, preferring the guide document's own `translations`
 * map over the bundled JSON.
 *
 * The 74 migrated guides carry their translations in lib/guide-i18n/*.json,
 * which is compiled into the bundle — so a guide added to Mongo could not be
 * translated without a deploy. A document-level map fixes that, and takes
 * priority because it is the more specific source: if someone has translated a
 * guide in the DB, that is the copy they want served.
 */
export async function resolveGuideBody(
  guide: TranslatableGuide,
  locale: string,
): Promise<{ body: string; faq: { question: string; answer: string }[] | undefined }> {
  if (locale === "en") return { body: guide.body, faq: guide.faq };

  const fromDb = guide.translations?.[locale];
  if (fromDb?.body?.trim()) {
    // faq falls back per-item so a partly translated FAQ never drops a question.
    const faq = fromDb.faq?.length
      ? (guide.faq ?? []).map((en, i) => fromDb.faq?.[i] ?? en)
      : guide.faq;
    return { body: fromDb.body, faq };
  }

  const bundled = await getGuideTranslation(locale, guide.slug);
  if (bundled?.body) {
    return { body: bundled.body, faq: bundled.faq?.length ? bundled.faq : guide.faq };
  }
  return { body: guide.body, faq: guide.faq };
}

/**
 * Which locales this guide is genuinely translated into, counting the document
 * map as well as the bundled JSON. Drives indexability and hreflang: a locale
 * only gets a self-canonical when its body is actually translated.
 */
export async function translatedLocalesForGuideDoc(guide: TranslatableGuide): Promise<string[]> {
  const fromDb = Object.entries(guide.translations ?? {})
    .filter(([l, t]) => TRANSLATED_GUIDE_LOCALES.includes(l) && t?.body?.trim())
    .map(([l]) => l);
  const fromBundle = await translatedLocalesForGuide(guide.slug);
  return [...new Set([...fromDb, ...fromBundle])];
}
