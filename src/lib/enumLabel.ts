// Maps raw DB enum values to translated labels via next-intl.
// Values in the DB are free-form strings (e.g. "Off-Plan", "Apartment",
// "All Nationalities"). We normalize to a camelCase key and look it up
// in the `enums` namespace; if not found, return the original value so
// unknown values still render readably.

export type EnumTranslator = (key: string, values?: Record<string, any>) => string;

function normalizeKey(raw: string | undefined | null): string {
  if (!raw) return "";
  return raw
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join("");
}

/**
 * Translate a DB enum value via `enums.{key}` messages.
 * `t` should be a next-intl translator bound to the "enums" namespace.
 */
export function tEnum(t: EnumTranslator, raw: string | undefined | null): string {
  if (!raw) return "";
  const key = normalizeKey(raw);
  if (!key) return raw;
  try {
    const out = t(key);
    // next-intl returns the key itself when a message is missing — fall back
    // to the original DB value in that case so we never show a key like "offPlan".
    return out && out !== key ? out : raw;
  } catch {
    return raw;
  }
}

/**
 * Translate a bedroom-count-style string like "1 Bedroom", "Studio",
 * "3 Bedrooms". The `enums.bedroomCount` message should accept ICU `{count}`
 * and `{plural}` placeholders.
 */
export function tBedroomLabel(t: EnumTranslator, raw: string | undefined | null): string {
  if (!raw) return "";
  const s = raw.trim();
  if (/^studio$/i.test(s)) return tEnum(t, "Studio");
  const m = s.match(/^(\d+)\s*(?:\+)?\s*(bedroom|br|bed)s?$/i);
  if (!m) return raw;
  const n = parseInt(m[1], 10);
  try {
    return t("bedroomCount", { count: n });
  } catch {
    return raw;
  }
}
