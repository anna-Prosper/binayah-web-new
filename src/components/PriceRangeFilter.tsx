"use client";

import { useEffect, useState } from "react";

interface Props {
  min: number;
  max: number;
  step?: number;
  /** Committed value `[low, high]`, both in absolute units. Use `null` for unset. */
  value: [number | null, number | null];
  onChange: (next: [number | null, number | null]) => void;
  currency?: string;
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

export default function PriceRangeFilter({ min, max, step = 50_000, value, onChange, currency = "AED" }: Props) {
  const [low, setLow] = useState<number>(value[0] ?? min);
  const [high, setHigh] = useState<number>(value[1] ?? max);

  // Keep internal state in sync when the parent resets values (e.g. clearFilters).
  useEffect(() => {
    setLow(value[0] ?? min);
    setHigh(value[1] ?? max);
  }, [value, min, max]);

  const commit = (nextLow: number, nextHigh: number) => {
    const lo = nextLow <= min ? null : nextLow;
    const hi = nextHigh >= max ? null : nextHigh;
    onChange([lo, hi]);
  };

  const onLowSlider = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = clamp(Number(event.target.value), min, high - step);
    setLow(next);
  };
  const onHighSlider = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = clamp(Number(event.target.value), low + step, max);
    setHigh(next);
  };

  const onLowInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value.replace(/[^0-9]/g, "");
    const parsed = raw === "" ? min : Number(raw);
    const next = clamp(parsed, min, high - step);
    setLow(next);
    commit(next, high);
  };
  const onHighInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value.replace(/[^0-9]/g, "");
    const parsed = raw === "" ? max : Number(raw);
    const next = clamp(parsed, low + step, max);
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
            value={low.toLocaleString()}
            onChange={onLowInput}
            aria-label="Minimum price (typed)"
            className="w-full bg-background border border-border rounded-lg pl-9 pr-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <span className="text-xs text-muted-foreground">—</span>
        <div className="flex-1 relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground pointer-events-none">{currency}</span>
          <input
            type="text"
            inputMode="numeric"
            value={high.toLocaleString()}
            onChange={onHighInput}
            aria-label="Maximum price (typed)"
            className="w-full bg-background border border-border rounded-lg pl-9 pr-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>
    </div>
  );
}
