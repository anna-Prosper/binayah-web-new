/**
 * Formats a project starting price for display in full figures with thousand
 * separators (e.g. "AED 700,000" instead of "AED 0.7M").
 * DB stores prices inconsistently — some as raw AED (e.g. 1_500_000),
 * some as decimal millions (e.g. 1.5 meaning 1.5M AED).
 * Values < 1000 are treated as already in millions and expanded.
 */
export function formatProjectPrice(price: number | null | undefined, currency = "AED"): string {
  if (!price) return "Price on request";
  const aed = price < 1_000 ? Math.round(price * 1_000_000) : Math.round(price);
  return `${currency} ${aed.toLocaleString("en-AE")}`;
}
