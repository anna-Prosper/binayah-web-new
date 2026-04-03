"use client";

import { useState, useMemo } from "react";
import { TrendingUp } from "lucide-react";

const CURRENCY_RATES: Record<string, number> = { AED: 1, USD: 0.2723, EUR: 0.2512, GBP: 0.2155, CNY: 1.9788, RUB: 24.89 };
const CURRENCY_SYMBOLS: Record<string, string> = { AED: "AED", USD: "USD", EUR: "EUR", GBP: "GBP", CNY: "CNY", RUB: "RUB" };

const formatPrice = (price: number | null, baseCurrency = "AED", targetCurrency = "AED") => {
  if (!price) return "Price on Request";
  const rate = CURRENCY_RATES[targetCurrency] || 1;
  const converted = price * rate;
  const symbol = CURRENCY_SYMBOLS[targetCurrency] || targetCurrency;
  if (converted >= 1_000_000) return `${symbol} ${(converted / 1_000_000).toFixed(1)}M`;
  if (converted >= 1_000) return `${symbol} ${(converted / 1_000).toFixed(0)}K`;
  return `${symbol} ${converted.toLocaleString()}`;
};

interface PaymentCalculatorProps {
  unitTypes: string[];
  startingPrice: number;
  currency?: string;
  activeCurrency?: string;
}

export default function PaymentCalculator({ unitTypes, startingPrice, currency = "AED", activeCurrency = "AED" }: PaymentCalculatorProps) {
  const [activeUnitTab, setActiveUnitTab] = useState(0);
  const [calcDownPct, setCalcDownPct] = useState(20);
  const [calcTerm, setCalcTerm] = useState(3);

  const priceMultiplier = 1 + activeUnitTab * 0.35;
  const totalPrice = Math.round(startingPrice * priceMultiplier);
  const downPayment = Math.round(totalPrice * calcDownPct / 100);
  const constructionPct = Math.max(0, Math.min(60, 100 - calcDownPct - 20));
  const handoverPct = 100 - calcDownPct - constructionPct;
  const constructionAmount = Math.round(totalPrice * constructionPct / 100);
  const handoverAmount = Math.round(totalPrice * handoverPct / 100);
  const monthlyPayment = calcTerm > 0 ? Math.round(handoverAmount / (calcTerm * 12)) : 0;
  const sliderPct = ((calcDownPct - 5) / (50 - 5)) * 100;

  const breakdown = [
    { label: "Down Payment", pct: calcDownPct, amount: downPayment, color: "#D4A847" },
    ...(constructionPct > 0 ? [{ label: "Construction", pct: constructionPct, amount: constructionAmount, color: "#1A7A5A" }] : []),
    ...(handoverPct > 0 ? [{ label: "Post-Handover", pct: handoverPct, amount: handoverAmount, color: "#0B3D2E" }] : []),
  ];

  return (
    <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
      <div className="p-4 sm:p-6 flex items-center gap-2.5" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 flex items-center justify-center">
          <TrendingUp className="h-4 w-4 text-white" />
        </div>
        <div>
          <h2 className="text-base sm:text-xl font-bold text-white">Payment Calculator</h2>
          <p className="text-[10px] sm:text-xs text-white/60">Estimate your payment breakdown</p>
        </div>
      </div>
      <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] text-muted-foreground uppercase mb-2 block">Unit Type</label>
            <select value={activeUnitTab} onChange={(e) => setActiveUnitTab(Number(e.target.value))}
              className="w-full h-11 rounded-xl bg-muted/50 border border-border/50 px-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none">
              {unitTypes.map((ut, i) => (<option key={i} value={i}>{ut}</option>))}
            </select>
          </div>
          <div>
            <label className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] text-muted-foreground uppercase mb-2 block">Total Price</label>
            <div className="h-11 rounded-xl bg-muted/50 border border-border/50 px-4 flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">{formatPrice(totalPrice, "AED", activeCurrency)}</span>
              {activeCurrency === "AED" && <span className="text-[10px] text-muted-foreground">~{formatPrice(totalPrice, "AED", "USD")}</span>}
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Down Payment</label>
            <span className="text-xs sm:text-sm font-bold" style={{ color: "#D4A847" }}>{calcDownPct}% · {formatPrice(downPayment, "AED", activeCurrency)}</span>
          </div>
          <div className="relative h-5 flex items-center">
            <div className="absolute inset-x-0 h-1.5 rounded-full bg-border" />
            <div className="absolute left-0 h-1.5 rounded-full transition-all duration-150" style={{ width: `${sliderPct}%`, background: "linear-gradient(90deg, #D4A847, #B8922F)" }} />
            <input type="range" min={5} max={50} step={5} value={calcDownPct} onChange={(e) => setCalcDownPct(Number(e.target.value))} className="absolute inset-0 w-full opacity-0 cursor-pointer h-full" />
            <div className="absolute w-5 h-5 rounded-full border-2 border-white shadow-md pointer-events-none transition-all duration-150" style={{ left: `calc(${sliderPct}% - 10px)`, background: "linear-gradient(135deg, #D4A847, #B8922F)" }} />
          </div>
          <div className="flex justify-between text-[9px] text-muted-foreground mt-1.5"><span>5%</span><span>25%</span><span>50%</span></div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Post-Handover Term</label>
            <span className="text-xs sm:text-sm font-bold text-foreground">{calcTerm} {calcTerm === 1 ? "Year" : "Years"}</span>
          </div>
          <div className="flex gap-1.5 sm:gap-2">
            {[1, 2, 3, 4, 5].map((yr) => (
              <button key={yr} onClick={() => setCalcTerm(yr)}
                className={`flex-1 h-9 sm:h-10 rounded-xl text-xs font-bold transition-all ${calcTerm === yr ? "text-white shadow-md" : "bg-muted/50 text-muted-foreground hover:bg-muted border border-border/50"}`}
                style={calcTerm === yr ? { background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" } : undefined}>
                {yr}Y
              </button>
            ))}
          </div>
        </div>
        <div className="flex rounded-full overflow-hidden h-3 sm:h-4 bg-muted/50">
          {breakdown.map((item, i) => (
            <div key={i} className="relative transition-all duration-500" style={{ width: `${item.pct}%`, backgroundColor: item.color }}>
              {i < breakdown.length - 1 && <div className="absolute right-0 top-0 bottom-0 w-px bg-background" />}
              {item.pct >= 15 && <span className="absolute inset-0 flex items-center justify-center text-[8px] sm:text-[9px] font-bold text-white">{item.pct}%</span>}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
          {breakdown.map((item, i) => (
            <div key={i} className="rounded-xl border border-border/50 p-2.5 sm:p-4 bg-muted/20">
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-[9px] sm:text-[11px] font-semibold text-muted-foreground truncate">{item.label}</span>
              </div>
              <p className="text-sm sm:text-lg font-bold text-foreground">{formatPrice(item.amount, "AED", activeCurrency)}</p>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground">{item.pct}% of total</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl p-3.5 sm:p-5 flex items-center justify-between border" style={{ borderColor: "rgba(11,61,46,0.15)", background: "linear-gradient(135deg, rgba(11,61,46,0.04), rgba(26,122,90,0.06))" }}>
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground">Est. Monthly Post-Handover</p>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground">{calcTerm} years · {calcTerm * 12} payments</p>
          </div>
          <div className="text-right">
            <p className="text-xl sm:text-2xl font-bold text-primary">{formatPrice(monthlyPayment, "AED", activeCurrency)}</p>
            {activeCurrency === "AED" && <p className="text-[9px] sm:text-[10px] text-muted-foreground">~{formatPrice(monthlyPayment, "AED", "USD")}/mo</p>}
          </div>
        </div>
      </div>
    </div>
  );
}