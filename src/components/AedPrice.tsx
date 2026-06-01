import { DirhemSign } from "./DirhemSign";

interface AedPriceProps {
  value: number | null | undefined;
  currency?: string;
  className?: string;
}

export function AedPrice({ value, currency = "AED", className }: AedPriceProps) {
  if (!value) return <span className={className}>Price on request</span>;
  const aed = value < 1_000 ? Math.round(value * 1_000_000) : Math.round(value);
  const formatted = aed.toLocaleString("en-AE");
  if (currency !== "AED") {
    return <span className={className}>{currency} {formatted}</span>;
  }
  return (
    <span className={className}>
      <DirhemSign className="inline-block h-[0.8em] w-auto mr-[0.2em] align-middle relative -top-px" />
      {formatted}
    </span>
  );
}

/** Same logic but raw number only — keeps the existing string function working for non-JSX contexts. */
export function formatAedNumber(value: number | null | undefined): string {
  if (!value) return "Price on request";
  const aed = value < 1_000 ? Math.round(value * 1_000_000) : Math.round(value);
  return `AED ${aed.toLocaleString("en-AE")}`;
}
