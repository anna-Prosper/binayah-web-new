export const AE_URL = "https://www.binayah.ae";
export const RU_URL = "https://binayah.ru";
// Set NEXT_PUBLIC_SITE_URL=https://binayah.ru in .env.local on the Beget server
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || AE_URL;

// Authoritative canonical URL for a given locale and path (e.g. path = "/about")
export function canonical(locale: string, path: string): string {
  if (locale === "ru") return `${RU_URL}/ru${path}`;
  if (locale === "en") return `${AE_URL}${path}`;
  return `${AE_URL}/${locale}${path}`;
}

// og:locale per locale
export const OG_LOCALE: Record<string, string> = {
  en: "en_AE", ru: "ru_RU", ar: "ar_AE", zh: "zh_CN", vi: "vi_VN", he: "he_IL",
};

// Default OG image (absolute URL)
export const DEFAULT_OG_IMAGE = `${AE_URL}/assets/og-image.webp`;

// Cross-domain hreflang alternates — Russian always points to binayah.ru.
// `exclude` drops locales a given route doesn't actually render (e.g. SEO
// templates that aren't built for Hebrew), so we never advertise an hreflang
// that 404s or serves an English-fallback page.
const ALT_LOCALES = ["en", "ru", "ar", "zh", "vi", "he"] as const;
export function altLangs(path: string, exclude: readonly string[] = []): Record<string, string> {
  const out: Record<string, string> = {};
  for (const l of ALT_LOCALES) {
    if (exclude.includes(l)) continue;
    out[l] = l === "ru" ? `${RU_URL}/ru${path}` : l === "en" ? `${AE_URL}${path}` : `${AE_URL}/${l}${path}`;
  }
  out["x-default"] = `${AE_URL}${path}`;
  return out;
}
