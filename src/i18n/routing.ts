import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ru", "kz", "in"],
  defaultLocale: "en",
  localePrefix: "as-needed", // English: /about — Others: /ru/about, /kz/about, /in/about
});
