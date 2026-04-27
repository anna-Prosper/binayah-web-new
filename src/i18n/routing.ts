import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ru", "zh", "ar"],
  defaultLocale: "en",
  localePrefix: "as-needed", // English: /about — Others: /ru/about, /zh/about, /ar/about
  localeDetection: false, // Custom middleware owns cookie/geo detection; prevents Accept-Language from overriding the user's explicit choice (Arabic→English was being reverted)
});
