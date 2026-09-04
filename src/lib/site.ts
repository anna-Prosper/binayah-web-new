export const AE_URL = "https://www.binayah.ae";
export const RU_URL = "https://binayah.ru";
// Set NEXT_PUBLIC_SITE_URL=https://binayah.ru in .env.local on the Beget server
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || AE_URL;

/**
 * Is the binayah.ru host serving?
 *
 * It went dark (no response on 443/80/22, confirmed from outside the network),
 * and because Russian canonicals and the `ru` hreflang both pointed at it, the
 * working /ru/* pages on binayah.ae were declaring their canonical on a dead
 * host. Google was being told the real page lived somewhere unreachable, which
 * suppresses the whole Russian tree even though it renders fine here.
 *
 * While this is false, `ru` self-canonicalises on binayah.ae exactly like every
 * other locale and the `ru` hreflang points here too. When the host is back,
 * flip this to true — nothing else needs to change.
 */
export const RU_DOMAIN_LIVE = false;

/** Where the Russian tree canonically lives right now. */
export const RU_BASE = RU_DOMAIN_LIVE ? `${RU_URL}/ru` : `${AE_URL}/ru`;

// Authoritative canonical URL for a given locale and path (e.g. path = "/about")
export function canonical(locale: string, path: string): string {
  if (locale === "ru") return `${RU_BASE}${path}`;
  if (locale === "en") return `${AE_URL}${path}`;
  return `${AE_URL}/${locale}${path}`;
}

// og:locale per locale
export const OG_LOCALE: Record<string, string> = {
  en: "en_AE", ru: "ru_RU", ar: "ar_AE", zh: "zh_CN", vi: "vi_VN", he: "he_IL", fr: "fr_FR",
};

// Default OG image (absolute URL)
export const DEFAULT_OG_IMAGE = `${AE_URL}/assets/og-image.webp`;

// Cross-domain hreflang alternates. Russian points at binayah.ru only while
// RU_DOMAIN_LIVE is true; advertising an hreflang that times out is worse than
// not advertising one, so it falls back to the .ae tree.
// `exclude` drops locales a given route doesn't actually render (e.g. SEO
// templates that aren't built for Hebrew), so we never advertise an hreflang
// that 404s or serves an English-fallback page.
const ALT_LOCALES = ["en", "ru", "ar", "zh", "vi", "he", "fr"] as const;
export function altLangs(path: string, exclude: readonly string[] = []): Record<string, string> {
  const out: Record<string, string> = {};
  for (const l of ALT_LOCALES) {
    if (exclude.includes(l)) continue;
    out[l] = l === "ru" ? `${RU_BASE}${path}` : l === "en" ? `${AE_URL}${path}` : `${AE_URL}/${l}${path}`;
  }
  out["x-default"] = `${AE_URL}${path}`;
  return out;
}
