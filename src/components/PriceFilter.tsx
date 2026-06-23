"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatPrice, parsePrice } from "@/components/PriceRangeFilter";

interface Props {
  min: number;
  max: number;
  value: [number | null, number | null];
  onChange: (next: [number | null, number | null]) => void;
  currency?: string;
  /** "Price" trigger label */
  priceLabel: string;
  minLabel: string;
  maxLabel: string;
  resetLabel: string;
}

/**
 * Price filter styled as a bar dropdown: a compact trigger that shows the selected
 * range, opening a popover with Min / Max inputs (accepts 350k, 1.2M, 1,200,000).
 */
export default function PriceFilter({ min, max, value, onChange, currency = "AED", priceLabel, minLabel, maxLabel, resetLabel }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const [lo, hi] = value;
  const hasValue = lo != null || hi != null;
  const triggerLabel = !hasValue
    ? priceLabel
    : lo != null && hi != null
      ? `${formatPrice(lo)} - ${formatPrice(hi)}`
      : lo != null
        ? `${formatPrice(lo)}+`
        : `≤ ${formatPrice(hi as number)}`;

  const commitMin = (raw: string) => {
    const n = parsePrice(raw);
    const loVal = n == null ? null : Math.min(Math.max(n, min), max);
    const hiVal = hi != null && loVal != null && hi < loVal ? loVal : hi;
    onChange([loVal, hiVal]);
  };
  const commitMax = (raw: string) => {
    const n = parsePrice(raw);
    const hiVal = n == null ? null : Math.min(Math.max(n, min), max);
    const loVal = lo != null && hiVal != null && lo > hiVal ? hiVal : lo;
    onChange([loVal, hiVal]);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`flex items-center gap-1 pl-2 pr-1.5 py-2 text-sm whitespace-nowrap transition-colors ${hasValue ? "text-foreground font-medium" : "text-foreground hover:text-foreground/80"}`}
      >
        <span>{triggerLabel}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-[300px] bg-card border border-border rounded-2xl shadow-xl z-40 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-foreground">{priceLabel}</p>
            {hasValue && (
              <button type="button" onClick={() => onChange([null, null])} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                {resetLabel}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <PriceInput key={`min-${lo ?? ""}`} placeholder={minLabel} currency={currency} defaultText={lo != null ? formatPrice(lo) : ""} onCommit={commitMin} />
            <span className="text-muted-foreground shrink-0">-</span>
            <PriceInput key={`max-${hi ?? ""}`} placeholder={maxLabel} currency={currency} defaultText={hi != null ? formatPrice(hi) : ""} onCommit={commitMax} />
          </div>
        </div>
      )}
    </div>
  );
}

function PriceInput({ placeholder, currency, defaultText, onCommit }: { placeholder: string; currency: string; defaultText: string; onCommit: (raw: string) => void }) {
  return (
    <div className="flex-1 relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground pointer-events-none">{currency}</span>
      <input
        type="text"
        inputMode="numeric"
        defaultValue={defaultText}
        placeholder={placeholder}
        onBlur={(e) => onCommit(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
        className="w-full min-w-0 bg-background border border-border rounded-xl pl-10 pr-2.5 py-2.5 text-sm text-foreground tabular-nums placeholder:text-muted-foreground/70 placeholder:text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
      />
    </div>
  );
}
