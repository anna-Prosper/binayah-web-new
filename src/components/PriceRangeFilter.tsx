"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  min: number;
  max: number;
  step?: number;
  value: [number | null, number | null];
  onChange: (next: [number | null, number | null]) => void;
  currency?: string;
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

// Compact display so large prices fit the narrow input: 36,000,000 -> "36M", 350,000 -> "350K".
export function formatPrice(n: number): string {
  return Math.round(n).toLocaleString();
}

// Parse user input back to a number, understanding "36m" / "350k" / "1.2M" / "1,200,000".
export function parsePrice(raw: string): number | null {
  const s = raw.trim().toLowerCase().replace(/[,\s]/g, "");
  if (s === "") return null;
  const m = s.match(/^([0-9]*\.?[0-9]+)([mk])?$/);
  if (!m) {
    const digits = raw.replace(/[^0-9]/g, "");
    return digits === "" ? null : Number(digits);
  }
  let v = parseFloat(m[1]);
  if (m[2] === "m") v *= 1_000_000;
  else if (m[2] === "k") v *= 1_000;
  return Math.round(v);
}

// Use numeric comparison rather than referential equality to avoid
// the sync effect firing on every parent re-render when value is an
// inline array literal.
function valuesEqual(
  a: [number | null, number | null],
  b: [number | null, number | null]
) {
  return a[0] === b[0] && a[1] === b[1];
}

export default function PriceRangeFilter({ min, max, step = 50_000, value, onChange, currency = "AED" }: Props) {
  const [low, setLow] = useState<number>(value[0] ?? min);
  const [high, setHigh] = useState<number>(value[1] ?? max);

  // Track the last committed external value to avoid snapping the slider
  // back during mid-drag if the parent re-renders for unrelated reasons.
  const lastCommittedRef = useRef<[number | null, number | null]>(value);

  useEffect(() => {
    if (!valuesEqual(value, lastCommittedRef.current)) {
      lastCommittedRef.current = value;
      setLow(value[0] ?? min);
      setHigh(value[1] ?? max);
    }
  }, [value, min, max]);

  const commit = (nextLow: number, nextHigh: number) => {
    const lo = nextLow <= min ? null : nextLow;
    const hi = nextHigh >= max ? null : nextHigh;
    const next: [number | null, number | null] = [lo, hi];
    lastCommittedRef.current = next;
    onChange(next);
  };

  const onLowSlider = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLow(clamp(Number(event.target.value), min, high - step));
  };
  const onHighSlider = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHigh(clamp(Number(event.target.value), low + step, max));
  };

  // Text inputs commit on blur or Enter, not on every keystroke, to avoid
  // spamming the search API with a request per digit typed.
  const onLowInputCommit = (raw: string) => {
    const parsed = parsePrice(raw);
    const n = parsed === null ? min : parsed;
    const next = clamp(n, min, high - step);
    setLow(next);
    commit(next, high);
  };
  const onHighInputCommit = (raw: string) => {
    const parsed = parsePrice(raw);
    const n = parsed === null ? max : parsed;
    const next = clamp(n, low + step, max);
    setHigh(next);
    commit(low, next);
  };

  const lowPct = ((low - min) / (max - min)) * 100;
  const highPct = ((high - min) / (max - min)) * 100;

  return (
    <div className="w-full">
      <div className="relative h-6">
        <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 bg-muted rounded-full" />
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1 rounded-full bg-primary"
          style={{ left: `${lowPct}%`, width: `${highPct - lowPct}%` }}
        />
        <input
          type="range"
          aria-label="Minimum price"
          min={min}
          max={max}
          step={step}
          value={low}
          onChange={onLowSlider}
          onMouseUp={() => commit(low, high)}
          onTouchEnd={() => commit(low, high)}
          className="price-range-thumb absolute inset-0 w-full appearance-none bg-transparent pointer-events-none"
        />
        <input
          type="range"
          aria-label="Maximum price"
          min={min}
          max={max}
          step={step}
          value={high}
          onChange={onHighSlider}
          onMouseUp={() => commit(low, high)}
          onTouchEnd={() => commit(low, high)}
          className="price-range-thumb absolute inset-0 w-full appearance-none bg-transparent pointer-events-none"
        />
      </div>
      <div className="flex items-center gap-2 mt-2">
        <div className="flex-1 relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground pointer-events-none">{currency}</span>
          <input
            type="text"
            inputMode="numeric"
            defaultValue={low.toLocaleString()}
            key={`low-${low}`}
            onBlur={(event) => onLowInputCommit(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && onLowInputCommit(event.currentTarget.value)}
            aria-label="Minimum price (typed)"
            className="w-full min-w-0 bg-background border border-border rounded-lg pl-9 pr-2 py-1.5 text-[11px] text-foreground tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <span className="text-xs text-muted-foreground">—</span>
        <div className="flex-1 relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground pointer-events-none">{currency}</span>
          <input
            type="text"
            inputMode="numeric"
            defaultValue={high.toLocaleString()}
            key={`high-${high}`}
            onBlur={(event) => onHighInputCommit(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && onHighInputCommit(event.currentTarget.value)}
            aria-label="Maximum price (typed)"
            className="w-full min-w-0 bg-background border border-border rounded-lg pl-9 pr-2 py-1.5 text-[11px] text-foreground tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>
    </div>
  );
}
