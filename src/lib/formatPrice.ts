/**
 * Formats a project starting price for display.
 * DB stores prices inconsistently — some as raw AED (e.g. 1_500_000),
 * some as decimal millions (e.g. 1.5 meaning 1.5M AED).
 * Values < 1000 are treated as already in millions.
 */
export function formatProjectPrice(price: number | null | undefined, currency = "AED"): string {
  if (!price) return "Price on request";
  const millions = price < 1_000 ? price : price / 1_000_000;
  if (millions >= 0.1) return `${currency} ${millions.toFixed(1)}M`;
  const thousands = price < 1_000 ? price * 1_000 : price / 1_000;
  return `${currency} ${Math.round(thousands).toLocaleString("en-AE")}K`;
}
