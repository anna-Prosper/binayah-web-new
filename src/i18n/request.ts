import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import enMessages from "../../messages/en.json";

type Msgs = Record<string, unknown>;

// Deep-merge locale messages over the English base so any key missing from a
// locale file falls back to English instead of rendering the raw key path.
// Lets us add new keys to en.json without immediately translating all locales.
function deepMerge(base: Msgs, override: Msgs): Msgs {
  const out: Msgs = { ...base };
  for (const k of Object.keys(override)) {
    const b = out[k];
    const o = override[k];
    out[k] =
      b && o && typeof b === "object" && typeof o === "object" && !Array.isArray(b) && !Array.isArray(o)
        ? deepMerge(b as Msgs, o as Msgs)
        : o;
  }
  return out;
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
  const localeMessages = (await import(`../../messages/${locale}.json`)).default as Msgs;
  return {
    locale,
    messages: locale === "en" ? localeMessages : deepMerge(enMessages as Msgs, localeMessages),
  };
});
