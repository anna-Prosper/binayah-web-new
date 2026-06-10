import { defineRouting } from "next-intl/routing";

// On binayah.ru, set NEXT_DEFAULT_LOCALE=ru so Russian is the default —
// no /ru/ prefix needed, binayah.ru/ serves Russian content directly.
const defaultLocale = (process.env.NEXT_DEFAULT_LOCALE as "en" | "ru" | "zh" | "ar" | "vi") || "en";

export const routing = defineRouting({
  locales: ["en", "ru", "zh", "ar", "vi"],
  defaultLocale,
  localePrefix: "as-needed", // default locale: /about — others: /ru/about etc.
  localeDetection: false,
});
