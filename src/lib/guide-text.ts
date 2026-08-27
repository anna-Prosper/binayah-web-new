import type { PulseGuide } from "@/lib/pulse-guides";

/** Minimal shape shared by the server (`getTranslations`) and client
 *  (`useTranslations`) translators. Both expose `has()` in next-intl 4. */
type Translator = {
  (key: string): string;
  has: (key: string) => boolean;
};

/** Slug → readable title, for a guide with neither a message key nor a stored
 *  title. A last resort so the page never shows a slug or a raw key path. */
function fromSlug(slug: string): string {
  const words = slug.replace(/-/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * Resolve a guide's title.
 *
 * Order matters. The message catalogue wins when it has the key, because the
 * 74 migrated guides are translated that way and a stored title would be
 * English on every locale. A guide added straight to Mongo has no key, so it
 * falls through to its own `title` — English until translations land, which is
 * the same trade the guide body already makes.
 */
export function guideTitle(
  guide: Pick<PulseGuide, "slug" | "titleKey" | "title" | "translations">,
  t: Translator,
  locale?: string,
): string {
  // The document's own per-locale copy is the most specific source, and the
  // only one reachable without a deploy, so it wins.
  const fromDb = locale && locale !== "en" ? guide.translations?.[locale]?.title : undefined;
  if (fromDb?.trim()) return fromDb.trim();
  if (guide.titleKey && t.has(guide.titleKey)) return t(guide.titleKey);
  if (guide.title?.trim()) return guide.title.trim();
  return fromSlug(guide.slug);
}

/** As guideTitle, for the description. Returns "" rather than a slug: an empty
 *  meta description is better than a mangled one. */
export function guideDescription(
  guide: Pick<PulseGuide, "descriptionKey" | "description" | "translations">,
  t: Translator,
  locale?: string,
): string {
  const fromDb = locale && locale !== "en" ? guide.translations?.[locale]?.description : undefined;
  if (fromDb?.trim()) return fromDb.trim();
  if (guide.descriptionKey && t.has(guide.descriptionKey)) return t(guide.descriptionKey);
  return guide.description?.trim() ?? "";
}
