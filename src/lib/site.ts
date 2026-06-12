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

// Cross-domain hreflang alternates — Russian always points to binayah.ru
export function altLangs(path: string): Record<string, string> {
  return {
    en: `${AE_URL}${path}`,
    ru: `${RU_URL}/ru${path}`,
    ar: `${AE_URL}/ar${path}`,
    zh: `${AE_URL}/zh${path}`,
    vi: `${AE_URL}/vi${path}`,
    he: `${AE_URL}/he${path}`,
    "x-default": `${AE_URL}${path}`,
  };
}
