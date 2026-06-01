"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DirhemSign } from "@/components/DirhemSign";

const SUPPORTED = ["AED", "USD", "EUR", "GBP", "CNY", "RUB"] as const;
type Currency = (typeof SUPPORTED)[number];

const FALLBACK_RATES: Record<string, number> = {
  AED: 1, USD: 0.2723, EUR: 0.2512, GBP: 0.2155, CNY: 1.9788, RUB: 24.89,
};

const STORAGE_KEY = "binayah_currency";

interface CurrencyContextValue {
  currency: string;
  setCurrency: (c: string) => void;
  rates: Record<string, number>;
  /** Format an AED price for display in the selected currency.
   *  Pass isProject:true for prices that may be stored as decimal millions (e.g. 1.5 = AED 1.5M). */
  format: (aedPrice: number | null | undefined, opts?: { isProject?: boolean; fallback?: string }) => string;
  /** Same as format() but always returns in AED (for secondary "~" display). */
  formatAed: (aedPrice: number | null | undefined, opts?: { isProject?: boolean }) => string;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: "AED",
  setCurrency: () => {},
  rates: FALLBACK_RATES,
  format: () => "Price on request",
  formatAed: () => "",
});

function normalizeAed(price: number, isProject: boolean): number {
  // Some project prices are stored as decimal millions (1.5 = AED 1.5M)
  if (isProject && price < 1_000) return price * 1_000_000;
  return price;
}

function formatAmount(amount: number, symbol: string): string {
  const display = symbol === "AED" ? "AED" : symbol;
  if (amount >= 1_000_000) return `${display} ${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${display} ${Math.round(amount / 1_000).toLocaleString()}K`;
  return `${display} ${Math.round(amount).toLocaleString()}`;
}

/** JSX component — renders price with the SVG Dirham sign for AED, plain symbol for other currencies. */
export function CurrencyPrice({
  aedPrice,
  opts,
  className,
}: {
  aedPrice: number | null | undefined;
  opts?: { isProject?: boolean; fallback?: string };
  className?: string;
}) {
  const { currency, rates } = useCurrency();
  if (!aedPrice) return <span className={className}>{opts?.fallback ?? "Price on request"}</span>;
  const normalized = aedPrice < 1_000 && opts?.isProject ? aedPrice * 1_000_000 : aedPrice;
  const converted = normalized * (rates[currency] ?? 1);
  const num =
    converted >= 1_000_000
      ? `${(converted / 1_000_000).toFixed(1)}M`
      : converted >= 1_000
        ? `${Math.round(converted / 1_000).toLocaleString()}K`
        : Math.round(converted).toLocaleString();
  if (currency === "AED") {
    return (
      <span className={className}>
        <DirhemSign className="inline-block h-[0.8em] w-auto mr-[0.2em] align-middle relative -top-px" />
        {num}
      </span>
    );
  }
  return <span className={className}>{currency} {num}</span>;
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<string>("AED");
  const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);

  // Restore persisted selection
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && (SUPPORTED as readonly string[]).includes(saved)) setCurrencyState(saved);
    } catch {}
  }, []);

  // Fetch live rates once on mount (cached 1h server-side via Next.js revalidate)
  useEffect(() => {
    fetch("/api/currency-rates")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && typeof data === "object" && Object.keys(data).length > 0) {
          setRates({ AED: 1, ...data });
        }
      })
      .catch(() => {});
  }, []);

  const setCurrency = useCallback((c: string) => {
    if (!(SUPPORTED as readonly string[]).includes(c)) return;
    setCurrencyState(c);
    try { localStorage.setItem(STORAGE_KEY, c); } catch {}
  }, []);

  const value = useMemo<CurrencyContextValue>(() => {
    const format = (
      aedPrice: number | null | undefined,
      opts?: { isProject?: boolean; fallback?: string }
    ): string => {
      if (!aedPrice) return opts?.fallback ?? "Price on request";
      const normalized = normalizeAed(aedPrice, opts?.isProject ?? false);
      const rate = rates[currency] ?? 1;
      return formatAmount(normalized * rate, currency);
    };

    const formatAed = (
      aedPrice: number | null | undefined,
      opts?: { isProject?: boolean }
    ): string => {
      if (!aedPrice) return "";
      const normalized = normalizeAed(aedPrice, opts?.isProject ?? false);
      return formatAmount(normalized, "AED");
    };

    return { currency, setCurrency, rates, format, formatAed };
  }, [currency, setCurrency, rates]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  return useContext(CurrencyContext);
}

export { SUPPORTED as SUPPORTED_CURRENCIES };
