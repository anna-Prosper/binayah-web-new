"use client";

import { useState, useMemo, useEffect, useCallback, Suspense } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calculator, TrendingUp, DollarSign, Percent,
  Share2, Copy, MessageCircle, Mail, Check,
  Info, FileDown,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine, Legend,
} from "recharts";
import Link from "next/link";
import CalculatorVerdict from "@/components/pulse/CalculatorVerdict";
import { BENCHMARKS, benchmarkRoi5yr } from "@/lib/calculatorBenchmarks";
import dynamic from "next/dynamic";
import type { CalcSnapshot } from "@/components/pulse/CalculatorEmailModal";

const CalculatorEmailModal = dynamic(
  () => import("@/components/pulse/CalculatorEmailModal"),
  { ssr: false }
);

// ── Types ──────────────────────────────────────────────────────────────────

interface YieldArea { area: string; yield: number; avgRent: number; avgSale: number }
interface MonthlyEntry { label: string; count: number; totalValue: number; avgPrice: number; avgPpsf: number }

interface MarketStats {
  yieldByArea: YieldArea[];
  priceByArea: { area: string; price: number; count: number }[];
}

interface MarketData {
  transactions: {
    hasData: boolean;
    monthly: MonthlyEntry[];
  } | null;
}

type PropertyType = "apartment" | "villa" | "townhouse" | "studio";
type Purpose = "rent" | "resell" | "live";
type Financing = "cash" | "mortgage";

// ── Helpers ────────────────────────────────────────────────────────────────

const AED = (n: number) => {
  if (n >= 1_000_000) return `AED ${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `AED ${(n / 1_000).toFixed(0)}K`;
  return `AED ${n.toLocaleString()}`;
};

const pct = (n: number, decimals = 1) => `${n.toFixed(decimals)}%`;

// ── Inner component (needs useSearchParams) ────────────────────────────────

function CalculatorInner({
  marketStats,
  marketData,
}: {
  marketStats: MarketStats | null;
  marketData: MarketData | null;
}) {
  const t = useTranslations("pulseCalculator");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const yieldByArea = marketStats?.yieldByArea ?? [];
  const monthly = marketData?.transactions?.monthly ?? [];

  // ── Initialise from URL params ─────────────────────────────────────────
  const defaultCommunity = searchParams.get("community") ?? (yieldByArea[0]?.area ?? "");
  const defaultBudget = Number(searchParams.get("price") ?? 1_500_000);
  const defaultDown = Number(searchParams.get("downpct") ?? 20);

  const [community, setCommunity] = useState(defaultCommunity);
  const [budget, setBudget] = useState(defaultBudget);
  const [propType, setPropType] = useState<PropertyType>("apartment");
  const [purpose, setPurpose] = useState<Purpose>("rent");
  const [financing, setFinancing] = useState<Financing>("cash");
  const [downPaymentPct, setDownPaymentPct] = useState(defaultDown);
  const [mortgageRate, setMortgageRate] = useState(5.5); // %
  const [mortgageTerm, setMortgageTerm] = useState(20); // years
  const [serviceChargePerSqft, setServiceChargePerSqft] = useState(15); // AED/sqft/yr
  const [copied, setCopied] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  // ── Sync URL state on input changes ───────────────────────────────────
  const syncUrl = useCallback((
    comm: string, budg: number, down: number
  ) => {
    const params = new URLSearchParams({
      community: comm,
      price: String(budg),
      downpct: String(down),
    });
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router]);

  useEffect(() => {
    syncUrl(community, budget, downPaymentPct);
  }, [community, budget, downPaymentPct, syncUrl]);

  // ── Derived data ───────────────────────────────────────────────────────
  const selectedArea = yieldByArea.find((a) => a.area === community);
  const grossYield = selectedArea?.yield ?? 0;
  const avgPpsf = marketStats?.priceByArea?.find((p) => p.area === community)?.price ?? 0;

  const growthRate = useMemo(() => {
    const validMonthly = monthly.filter((m) => m.avgPpsf > 0);
    if (validMonthly.length < 2) return BENCHMARKS.dubaiProperty.annualRate;
    const first = validMonthly[0].avgPpsf;
    const last = validMonthly[validMonthly.length - 1].avgPpsf;
    if (first <= 0) return BENCHMARKS.dubaiProperty.annualRate;
    const totalGrowth = (last - first) / first;
    const numYears = validMonthly.length / 12;
    const annualised = totalGrowth / Math.max(numYears, 1 / 12);
    return Math.max(0.03, annualised);
  }, [monthly]);

  const hasLimitedData = monthly.filter((m) => m.avgPpsf > 0).length < 12;

  // ── Outputs ────────────────────────────────────────────────────────────
  const outputs = useMemo(() => {
    const estimatedSqft = avgPpsf > 0 ? Math.round(budget / avgPpsf) : 0;
    const annualRental = grossYield > 0 ? budget * (grossYield / 100) : 0;
    const value3yr = budget * Math.pow(1 + growthRate, 3);
    const value5yr = budget * Math.pow(1 + growthRate, 5);
    const roi5yr = ((value5yr - budget) / budget) * 100;

    // Entry costs
    const dldFee = budget * 0.04;
    const registrationFee = 4200; // AED standard fee
    const agentFee = budget * 0.02;
    const totalEntryCost = budget + dldFee + registrationFee + agentFee;

    // Service charge & net income
    const annualServiceCharge = estimatedSqft > 0
      ? estimatedSqft * serviceChargePerSqft
      : budget * 0.005;
    const annualMgmtFee = annualRental > 0 ? annualRental * 0.10 : 0;
    const netAnnualIncome = Math.max(0, annualRental - annualServiceCharge - annualMgmtFee);
    const netYield = budget > 0 && netAnnualIncome > 0
      ? (netAnnualIncome / budget) * 100
      : grossYield * 0.85;

    // Mortgage
    const loanAmount = financing === "mortgage" ? budget * (1 - downPaymentPct / 100) : 0;
    const mRate = mortgageRate / 100 / 12;
    const nPay = mortgageTerm * 12;
    const monthlyPayment = financing === "mortgage" && loanAmount > 0 && mRate > 0
      ? loanAmount * (mRate * Math.pow(1 + mRate, nPay)) / (Math.pow(1 + mRate, nPay) - 1)
      : 0;
    const totalInterestPaid = monthlyPayment > 0 ? monthlyPayment * nPay - loanAmount : 0;
    const annualMortgageCost = monthlyPayment * 12;

    // Capital deployed
    const investedCapital = financing === "mortgage"
      ? budget * (downPaymentPct / 100) + dldFee + registrationFee + agentFee
      : totalEntryCost;

    // Net cashflow & cash-on-cash
    const netCashflow = netAnnualIncome - (financing === "mortgage" ? annualMortgageCost : 0);
    const cashOnCash = investedCapital > 0 ? (netCashflow / investedCapital) * 100 : 0;

    // Benchmarks
    const savingsRoi5yr = benchmarkRoi5yr(BENCHMARKS.uaeSavings.annualRate);
    const sp500Roi5yr = benchmarkRoi5yr(BENCHMARKS.sp500.annualRate);
    const dubaiPropRoi5yr = benchmarkRoi5yr(
      hasLimitedData ? BENCHMARKS.dubaiProperty.annualRate : growthRate
    );

    return {
      estimatedSqft, annualRental, grossYield, netYield,
      value3yr, value5yr, roi5yr,
      annualServiceCharge, annualMgmtFee, netAnnualIncome,
      dldFee, registrationFee, agentFee, totalEntryCost,
      loanAmount, monthlyPayment, totalInterestPaid, annualMortgageCost,
      investedCapital, netCashflow, cashOnCash,
      savingsRoi5yr, sp500Roi5yr, dubaiPropRoi5yr,
    };
  }, [budget, grossYield, growthRate, avgPpsf, financing, downPaymentPct, mortgageRate, mortgageTerm, serviceChargePerSqft, hasLimitedData]);

  const hasData = yieldByArea.length > 0;

  // ── Projection chart data ─────────────────────────────────────────────
  const projectionData = useMemo(() => {
    const years = [0, 1, 2, 3, 4, 5, 7, 10];
    return years.map((yr) => ({
      year: `Yr ${yr}`,
      property: Math.round(budget * Math.pow(1 + growthRate, yr)),
      sp500: Math.round(budget * Math.pow(1 + BENCHMARKS.sp500.annualRate, yr)),
      uaeSavings: Math.round(budget * Math.pow(1 + BENCHMARKS.uaeSavings.annualRate, yr)),
      dubaiAvg: Math.round(budget * Math.pow(1 + BENCHMARKS.dubaiProperty.annualRate, yr)),
    }));
  }, [budget, growthRate]);

  // ── Share helpers ──────────────────────────────────────────────────────
  // Defer window-derived baseUrl to post-mount so SSR + first client render
  // produce the same DOM (no hydration mismatch). The fallback shape matches
  // what staging would emit for SSR.
  const [baseUrl, setBaseUrl] = useState(`https://staging.binayahhub.com${pathname}`);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(`${window.location.origin}${pathname}`);
    }
  }, [pathname]);

  const shareUrl = `${baseUrl}?community=${encodeURIComponent(community)}&price=${budget}&downpct=${downPaymentPct}&utm_source=whatsapp&utm_medium=share&utm_campaign=pulse-calculator`;
  const copyUrl  = `${baseUrl}?community=${encodeURIComponent(community)}&price=${budget}&downpct=${downPaymentPct}&utm_source=copy&utm_medium=share&utm_campaign=pulse-calculator`;

  const whatsAppText = [
    `Looking at AED ${(budget / 1_000_000).toFixed(1)}M in ${community}.`,
    `Calc says ${grossYield.toFixed(1)}% yield, +${outputs.roi5yr.toFixed(0)}% 5-yr appreciation.`,
    shareUrl,
  ].join("\n");

  const handleCopy = () => {
    navigator.clipboard.writeText(copyUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ── Email snapshot ─────────────────────────────────────────────────────
  const calcSnapshot: CalcSnapshot = {
    community,
    budget,
    propType,
    purpose,
    financing,
    downPaymentPct,
    grossYield: outputs.grossYield,
    netYield: outputs.netYield,
    annualRental: outputs.annualRental,
    value5yr: outputs.value5yr,
    roi5yr: outputs.roi5yr,
  };

  // ── Legend chip (with tooltip) ─────────────────────────────────────────
  function BenchmarkLegend({
    label, color, source, dashed,
  }: { label: string; color: string; source: string; dashed?: boolean }) {
    return (
      <div className="flex items-center gap-1.5 group relative cursor-default">
        <div
          className="w-7 h-0.5 flex-shrink-0"
          style={{
            background: color,
            borderStyle: dashed ? "dashed" : "solid",
            borderWidth: dashed ? "1px 0 0 0" : "2px 0 0 0",
            borderColor: color,
          }}
        />
        <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
        <div title={source} className="flex-shrink-0">
          <Info className="h-3 w-3 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-10"
      >
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="h-5 w-5 text-accent" />
          <p className="text-accent font-semibold tracking-[0.3em] uppercase text-xs">{t("label")}</p>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
          {t("title")} <span className="italic font-light">{t("titleItalic")}</span>
        </h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </motion.div>

      {!hasData ? (
        <div className="bg-muted/30 border border-border/30 rounded-2xl p-10 text-center">
          <Calculator className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-base font-semibold text-muted-foreground">{t("noDataTitle")}</p>
          <p className="text-sm text-muted-foreground/60 mt-1">{t("noDataSub")}</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* ── Left: Inputs ──────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-6"
          >
            <div className="bg-card border border-border/50 rounded-2xl p-5 sm:p-6 space-y-6">
              {/* Community */}
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">{t("community")}</label>
                <select
                  value={community}
                  onChange={(e) => setCommunity(e.target.value)}
                  className="w-full px-3 py-3 rounded-xl bg-background border border-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {yieldByArea.map((a) => (
                    <option key={a.area} value={a.area}>
                      {`${a.area} · ${a.yield.toFixed(1)}%`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Budget */}
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  {t("budget")} <span className="font-normal text-muted-foreground text-xs ml-1">AED</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">AED</span>
                  <input
                    type="number"
                    min={100_000}
                    max={100_000_000}
                    step={50_000}
                    value={budget}
                    onChange={(e) => setBudget(Math.max(100_000, Math.min(100_000_000, Number(e.target.value))))}
                    className="w-full pl-14 pr-4 py-3 rounded-xl bg-background border border-input text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <input
                  type="range"
                  min={100_000}
                  max={20_000_000}
                  step={50_000}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full mt-2 accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                  <span>{t("budgetMin")}</span>
                  <span className="font-semibold text-accent">{AED(budget)}</span>
                  <span>{t("budgetMax")}</span>
                </div>
              </div>

              {/* Property Type */}
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">{t("propertyType")}</label>
                <div className="flex flex-wrap gap-2">
                  {(["apartment", "villa", "townhouse", "studio"] as PropertyType[]).map((pt) => (
                    <button
                      key={pt}
                      onClick={() => setPropType(pt)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        propType === pt
                          ? "text-white shadow-sm hover:brightness-110 hover:shadow-md"
                          : "border border-border/60 bg-card text-muted-foreground hover:border-accent/40 hover:text-foreground"
                      }`}
                      style={propType === pt ? { background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" } : undefined}
                    >
                      {t(`type_${pt}` as "type_apartment" | "type_villa" | "type_townhouse" | "type_studio")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">{t("purpose")}</label>
                <div className="flex flex-wrap gap-2">
                  {(["rent", "resell", "live"] as Purpose[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPurpose(p)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        purpose === p
                          ? "text-white shadow-sm hover:brightness-110 hover:shadow-md"
                          : "border border-border/60 bg-card text-muted-foreground hover:border-accent/40 hover:text-foreground"
                      }`}
                      style={purpose === p ? { background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" } : undefined}
                    >
                      {t(`purpose_${p}` as "purpose_rent" | "purpose_resell" | "purpose_live")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Financing */}
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">{t("financing")}</label>
                <div className="flex gap-2">
                  {(["cash", "mortgage"] as Financing[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFinancing(f)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        financing === f
                          ? "text-white shadow-sm hover:brightness-110 hover:shadow-md"
                          : "border border-border/60 bg-card text-muted-foreground hover:border-accent/40 hover:text-foreground"
                      }`}
                      style={financing === f ? { background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" } : undefined}
                    >
                      {t(`financing_${f}` as "financing_cash" | "financing_mortgage")}
                    </button>
                  ))}
                </div>
                {financing === "mortgage" && (
                  <div className="mt-4 space-y-0">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">
                        {t("downPayment")}: <span className="font-bold text-foreground">{downPaymentPct}%</span>
                      </label>
                      <input
                        type="range"
                        min={5}
                        max={80}
                        step={5}
                        value={downPaymentPct}
                        onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                        className="w-full accent-primary"
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                        <span>5%</span>
                        <span className="font-semibold text-accent">{AED(budget * downPaymentPct / 100)}</span>
                        <span>80%</span>
                      </div>
                    </div>

                    {/* Mortgage rate */}
                    <div className="mt-3">
                      <label className="text-xs text-muted-foreground mb-1.5 block">
                        {t("mortgageRate")}: <span className="font-bold text-foreground">{mortgageRate.toFixed(1)}%</span>
                      </label>
                      <input type="range" min={2} max={9} step={0.25} value={mortgageRate}
                        onChange={e => setMortgageRate(Number(e.target.value))}
                        className="w-full accent-primary" />
                      <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                        <span>2%</span><span>9%</span>
                      </div>
                    </div>

                    {/* Mortgage term */}
                    <div className="mt-3">
                      <label className="text-xs text-muted-foreground mb-1.5 block">{t("mortgageTerm")}</label>
                      <div className="flex gap-2">
                        {[5, 10, 15, 20, 25].map(yr => (
                          <button key={yr} onClick={() => setMortgageTerm(yr)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${mortgageTerm === yr ? "text-white" : "border border-border/60 bg-card text-muted-foreground hover:border-accent/40"}`}
                            style={mortgageTerm === yr ? { background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" } : undefined}>
                            {`${yr}yr`}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* Service Charge */}
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  {t("serviceCharge")} <span className="font-normal text-muted-foreground text-xs ml-1">{"AED/sqft/yr"}</span>
                </label>
                <input type="range" min={5} max={40} step={1} value={serviceChargePerSqft}
                  onChange={e => setServiceChargePerSqft(Number(e.target.value))}
                  className="w-full accent-primary" />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                  <span>{"AED 5"}</span>
                  <span className="font-semibold text-accent">{`AED ${serviceChargePerSqft}/sqft`}</span>
                  <span>{"AED 40"}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{t("serviceChargeSub")}</p>
              </div>
            </div>
          </motion.div>

          {/* ── Right: Outputs ────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="space-y-4"
          >
            {/* Entry costs */}
            <div className="bg-card border border-border/50 rounded-2xl p-5">
              <h3 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-accent" />
                {t("entryCostsTitle")}
              </h3>
              <div className="space-y-2">
                <EntryCostRow label={t("propertyPrice")} value={AED(budget)} />
                <EntryCostRow label={`${t("dldFee")} (4%)`} value={AED(outputs.dldFee)} sub />
                <EntryCostRow label={`${t("agentFee")} (2%)`} value={AED(outputs.agentFee)} sub />
                <EntryCostRow label={t("registrationFee")} value={`AED ${outputs.registrationFee.toLocaleString()}`} sub />
                <div className="flex items-center justify-between pt-2 border-t border-border/30">
                  <span className="text-sm font-bold text-foreground">{t("totalEntryCost")}</span>
                  <span className="text-sm font-bold text-foreground">{AED(outputs.totalEntryCost)}</span>
                </div>
              </div>
            </div>

            {/* Main metrics */}
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                icon={DollarSign}
                label={t("estSize")}
                value={outputs.estimatedSqft > 0 ? `${outputs.estimatedSqft.toLocaleString()} ${t("sqftUnit")}` : "—"}
                sub={t("estSizeSub")}
                accent
              />
              <MetricCard
                icon={Percent}
                label={t("grossYield")}
                value={outputs.grossYield > 0 ? pct(outputs.grossYield) : "—"}
                sub={t("grossYieldSub")}
              />
              <MetricCard
                icon={TrendingUp}
                label={t("netAnnualIncome")}
                value={outputs.netAnnualIncome > 0 ? AED(outputs.netAnnualIncome) : "—"}
                sub={t("netAnnualIncomeSub")}
              />
              <MetricCard
                icon={Percent}
                label={t("netYield")}
                value={outputs.netYield > 0 ? pct(outputs.netYield) : "—"}
                sub={t("netYieldSub")}
              />
            </div>

            {/* Verdict explainer */}
            <CalculatorVerdict
              rentalYield={outputs.grossYield}
              fiveYrForecast={outputs.roi5yr}
              sp500Roi={outputs.sp500Roi5yr}
            />

            {/* Projected values */}
            <div className="bg-card border border-border/50 rounded-2xl p-5">
              <h3 className="font-bold text-sm text-foreground mb-4">{t("projectedValue")}</h3>
              <div className="space-y-3">
                <ProjectionRow label={t("year3")} value={AED(outputs.value3yr)} baseline={AED(budget)} />
                <ProjectionRow label={t("year5")} value={AED(outputs.value5yr)} baseline={AED(budget)} highlight />
              </div>
            </div>

            {/* Mortgage details card */}
            {financing === "mortgage" && outputs.monthlyPayment > 0 && (
              <div className="bg-card border border-border/50 rounded-2xl p-5">
                <h3 className="font-bold text-sm text-foreground mb-3">{t("mortgageDetailsTitle")}</h3>
                <div className="space-y-2">
                  <EntryCostRow label={t("loanAmount")} value={AED(outputs.loanAmount)} />
                  <EntryCostRow label={t("monthlyPayment")} value={AED(outputs.monthlyPayment)} sub />
                  <EntryCostRow label={t("totalInterest")} value={AED(outputs.totalInterestPaid)} sub />
                  <div className="flex items-center justify-between pt-2 border-t border-border/30">
                    <span className="text-sm text-muted-foreground">{t("annualMortgageCost")}</span>
                    <span className="text-sm font-semibold text-foreground">{AED(outputs.annualMortgageCost)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Benchmark comparison chart */}
            <div className="bg-card border border-border/50 rounded-2xl p-5">
              <h3 className="font-bold text-sm text-foreground mb-3">{t("benchmarkChartTitle")}</h3>

              {/* Legend */}
              <div className="flex flex-wrap gap-3 mb-4">
                <BenchmarkLegend
                  label={t("benchmarkProperty")}
                  color="#10B981"
                  source={hasLimitedData ? t("benchmarkPropertyLimitedSrc") : t("benchmarkPropertySrc")}
                  dashed={false}
                />
                <BenchmarkLegend
                  label={BENCHMARKS.dubaiProperty.label}
                  color={BENCHMARKS.dubaiProperty.color}
                  source={BENCHMARKS.dubaiProperty.source}
                  dashed={false}
                />
                <BenchmarkLegend
                  label={BENCHMARKS.sp500.label}
                  color={BENCHMARKS.sp500.color}
                  source={BENCHMARKS.sp500.source}
                  dashed
                />
                <BenchmarkLegend
                  label={BENCHMARKS.uaeSavings.label}
                  color={BENCHMARKS.uaeSavings.color}
                  source={BENCHMARKS.uaeSavings.source}
                  dashed
                />
              </div>

              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={projectionData} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis dataKey="year" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis
                    tickFormatter={(v: number) => `${(v / 1_000_000).toFixed(1)}M`}
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    width={48}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [AED(value), name]}
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 11,
                    }}
                  />
                  {/* Your property */}
                  <Line
                    type="monotone"
                    dataKey="property"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    dot={false}
                    name={t("benchmarkProperty")}
                  />
                  {/* Dubai property avg benchmark */}
                  <Line
                    type="monotone"
                    dataKey="dubaiAvg"
                    stroke={BENCHMARKS.dubaiProperty.color}
                    strokeWidth={1.5}
                    dot={false}
                    name={BENCHMARKS.dubaiProperty.label}
                  />
                  {/* S&P 500 benchmark — dashed */}
                  <Line
                    type="monotone"
                    dataKey="sp500"
                    stroke={BENCHMARKS.sp500.color}
                    strokeWidth={1.5}
                    strokeDasharray="8 4"
                    dot={false}
                    name={BENCHMARKS.sp500.label}
                  />
                  {/* UAE Savings benchmark — dotted */}
                  <Line
                    type="monotone"
                    dataKey="uaeSavings"
                    stroke={BENCHMARKS.uaeSavings.color}
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    dot={false}
                    name={BENCHMARKS.uaeSavings.label}
                  />
                  {/* 3-yr and 5-yr projection markers */}
                  <ReferenceLine
                    x="Yr 3"
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="4 4"
                    strokeOpacity={0.5}
                    label={{ value: t("refLine3yr"), position: "top", fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <ReferenceLine
                    x="Yr 5"
                    stroke="#C9A84C"
                    strokeDasharray="4 4"
                    strokeOpacity={0.7}
                    label={{ value: t("refLine5yr"), position: "top", fontSize: 9, fill: "#C9A84C" }}
                  />
                </LineChart>
              </ResponsiveContainer>

              {hasLimitedData && (
                <p className="text-[10px] text-amber-600 mt-2 flex items-center gap-1">
                  <Info className="h-3 w-3 flex-shrink-0" />
                  {t("limitedDataNote")}
                </p>
              )}
              <p className="text-[10px] text-muted-foreground mt-1">{t("projectionDisclaimer")}</p>
            </div>

            {/* 5-yr comparison strip */}
            <div className="bg-card border border-border/50 rounded-2xl p-5">
              <h3 className="font-bold text-sm text-foreground mb-4">{t("fiveYearComparison")}</h3>
              <div className="space-y-2">
                <CompareRow
                  label={t("realEstate5yr")}
                  value={pct(outputs.roi5yr)}
                  color="emerald"
                  best={outputs.roi5yr >= outputs.sp500Roi5yr}
                />
                <CompareRow
                  label={`${BENCHMARKS.uaeSavings.label} (5yr)`}
                  value={pct(outputs.savingsRoi5yr)}
                  color="blue"
                />
                <CompareRow
                  label={`${BENCHMARKS.sp500.label} (5yr)`}
                  value={pct(outputs.sp500Roi5yr)}
                  color="purple"
                  best={outputs.sp500Roi5yr > outputs.roi5yr}
                />
                <CompareRow
                  label={t("cashOnCash")}
                  value={outputs.cashOnCash > 0 ? pct(outputs.cashOnCash) : "—"}
                  color="emerald"
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-3">{t("comparisonDisclaimer")}</p>
            </div>

            {/* Share */}
            <div className="bg-card border border-border/50 rounded-2xl p-5">
              <h3 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
                <Share2 className="h-4 w-4 text-accent" />
                {t("shareResult")}
              </h3>
              <div className="flex flex-wrap gap-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(whatsAppText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100 transition-colors border border-green-200"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  {t("shareWhatsApp")}
                </a>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-muted text-foreground hover:bg-muted/70 transition-colors border border-border"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? t("copied") : t("copyLink")}
                </button>
                <a
                  href="/api/pdf/pulse"
                  download
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-muted text-foreground hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 transition-colors border border-border"
                >
                  <FileDown className="h-3.5 w-3.5" />
                  {t("savePdf")}
                </a>
                <button
                  onClick={() => setShowEmailModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {t("emailMeReport")}
                </button>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all"
                style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
              >
                {t("talkToAgent")}
              </Link>
            </div>
          </motion.div>
        </div>
      )}

      {/* Email modal */}
      {showEmailModal && (
        <CalculatorEmailModal
          calcSnapshot={calcSnapshot}
          onClose={() => setShowEmailModal(false)}
        />
      )}
    </div>
  );
}

// ── Exported wrapper (Suspense boundary for useSearchParams) ───────────────

export default function CalculatorClient({
  marketStats,
  marketData,
}: {
  marketStats: MarketStats | null;
  marketData: MarketData | null;
}) {
  return (
    <Suspense fallback={null}>
      <CalculatorInner marketStats={marketStats} marketData={marketData} />
    </Suspense>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function MetricCard({
  icon: Icon, label, value, sub, accent = false,
}: {
  icon: React.ElementType; label: string; value: string; sub: string; accent?: boolean;
}) {
  return (
    <div className={`rounded-2xl p-4 border ${accent ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border/50"}`}>
      <div className="flex items-start justify-between mb-2">
        <p className={`text-xs font-medium ${accent ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{label}</p>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${accent ? "bg-white/15" : "bg-accent/10"}`}>
          <Icon className={`h-3.5 w-3.5 ${accent ? "text-white" : "text-accent"}`} />
        </div>
      </div>
      <p className={`text-xl font-bold ${accent ? "text-white" : "text-foreground"}`}>{value}</p>
      {sub && <p className={`text-[10px] mt-0.5 ${accent ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{sub}</p>}
    </div>
  );
}

function ProjectionRow({ label, value, baseline, highlight = false }: {
  label: string; value: string; baseline: string; highlight?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between py-2 rounded-lg px-3 ${highlight ? "bg-primary/5 border border-primary/10" : "bg-muted/30"}`}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="text-right">
        <span className={`text-sm font-bold ${highlight ? "text-primary" : "text-foreground"}`}>{value}</span>
        <span className="text-[10px] text-muted-foreground ml-2">{baseline}</span>
      </div>
    </div>
  );
}

function EntryCostRow({ label, value, sub = false }: { label: string; value: string; sub?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${sub ? "text-muted-foreground" : "text-foreground"}`}>{label}</span>
      <span className={`text-sm font-semibold ${sub ? "text-muted-foreground" : "text-foreground"}`}>{value}</span>
    </div>
  );
}

function CompareRow({ label, value, color, best = false }: {
  label: string; value: string; color: "emerald" | "blue" | "purple"; best?: boolean;
}) {
  const cls = {
    emerald: "text-emerald-700 bg-emerald-50",
    blue: "text-blue-700 bg-blue-50",
    purple: "text-purple-700 bg-purple-50",
  }[color];
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground flex-1">{label}</span>
      <span className={`text-sm font-bold px-2.5 py-0.5 rounded-full ${cls} ${best ? "ring-1 ring-offset-0" : ""}`}>
        {value}
      </span>
    </div>
  );
}
