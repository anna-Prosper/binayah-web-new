import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ru", "zh", "ar"],
  defaultLocale: "en",
  localePrefix: "as-needed", // English: /about — Others: /ru/about, /zh/about, /ar/about
});
