"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

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
  if (amount >= 1_000_000) return `${symbol} ${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${symbol} ${Math.round(amount / 1_000).toLocaleString()}K`;
  return `${symbol} ${Math.round(amount).toLocaleString()}`;
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
