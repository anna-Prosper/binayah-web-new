"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Calculator, TrendingUp, DollarSign, Percent,
  Share2, Copy, MessageCircle, Mail, Check,
} from "lucide-react";
import Link from "next/link";

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
type Rating = "strong" | "moderate" | "weak";

// ── Helpers ────────────────────────────────────────────────────────────────

const AED = (n: number) => {
  if (n >= 1_000_000) return `AED ${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `AED ${(n / 1_000).toFixed(0)}K`;
  return `AED ${n.toLocaleString()}`;
};

const pct = (n: number, decimals = 1) => `${n.toFixed(decimals)}%`;

function getRating(yield_pct: number): Rating {
  if (yield_pct >= 7) return "strong";
  if (yield_pct >= 5) return "moderate";
  return "weak";
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function CalculatorClient({
  marketStats,
  marketData,
}: {
  marketStats: MarketStats | null;
  marketData: MarketData | null;
}) {
  const t = useTranslations("pulseCalculator");

  const yieldByArea = marketStats?.yieldByArea ?? [];
  const monthly = marketData?.transactions?.monthly ?? [];

  // ── Inputs ──────────────────────────────────────────────────────────────
  const [community, setCommunity] = useState(yieldByArea[0]?.area ?? "");
  const [budget, setBudget] = useState(1_500_000);
  const [propType, setPropType] = useState<PropertyType>("apartment");
  const [purpose, setPurpose] = useState<Purpose>("rent");
  const [financing, setFinancing] = useState<Financing>("cash");
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [copied, setCopied] = useState(false);

  // ── Derived data ─────────────────────────────────────────────────────────
  const selectedArea = yieldByArea.find((a) => a.area === community);
  const grossYield = selectedArea?.yield ?? 0;
  const avgPpsf = marketStats?.priceByArea?.find((p) => p.area === community)?.price ?? 0;

  // Growth rate: from first vs last monthly avgPpsf, annualised
  const growthRate = useMemo(() => {
    const validMonthly = monthly.filter((m) => m.avgPpsf > 0);
    if (validMonthly.length < 2) return 0.04;
    const first = validMonthly[0].avgPpsf;
    const last = validMonthly[validMonthly.length - 1].avgPpsf;
    if (first <= 0) return 0.04;
    const totalGrowth = (last - first) / first;
    const numYears = validMonthly.length / 12;
    const annualised = totalGrowth / Math.max(numYears, 1 / 12);
    return Math.max(0.04, annualised);
  }, [monthly]);

  // ── Outputs ──────────────────────────────────────────────────────────────
  const outputs = useMemo(() => {
    const estimatedSqft = avgPpsf > 0 ? Math.round(budget / avgPpsf) : 0;
    const annualRental = grossYield > 0 ? budget * (grossYield / 100) : 0;
    const netYield = grossYield * 0.85;
    const value3yr = budget * Math.pow(1 + growthRate, 3);
    const value5yr = budget * Math.pow(1 + growthRate, 5);
    const roi5yr = ((value5yr - budget) / budget) * 100;
    const savingsRoi = (Math.pow(1.03, 5) - 1) * 100; // 3% APY savings
    const sp500Roi = (Math.pow(1.08, 5) - 1) * 100;   // 8% APY S&P estimate
    const rating = getRating(grossYield);

    // If mortgage, effective invested capital is just the down payment
    const investedCapital = financing === "mortgage"
      ? budget * (downPaymentPct / 100)
      : budget;

    return {
      estimatedSqft,
      annualRental,
      grossYield,
      netYield,
      value3yr,
      value5yr,
      roi5yr,
      savingsRoi,
      sp500Roi,
      rating,
      investedCapital,
    };
  }, [budget, grossYield, growthRate, avgPpsf, financing, downPaymentPct]);

  const hasData = yieldByArea.length > 0;

  // ── Share ─────────────────────────────────────────────────────────────────
  const shareText = `Dubai Property Investment Calculator\nCommunity: ${community}\nBudget: ${AED(budget)}\nGross Yield: ${pct(outputs.grossYield)}\n5-Year Value: ${AED(outputs.value5yr)}\nvia Binayah Properties`;
  const currentUrl = typeof window !== "undefined" ? window.location.href : "https://staging.binayahhub.com/pulse/calculator";

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const ratingColor = {
    strong: "bg-emerald-100 text-emerald-700 border-emerald-200",
    moderate: "bg-amber-100 text-amber-700 border-amber-200",
    weak: "bg-slate-100 text-slate-500 border-slate-200",
  }[outputs.rating];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* ── Hero ───────────────────────────────────────────────────── */}
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
          {/* ── Left: Inputs ─────────────────────────────────────────── */}
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
                          ? "text-white shadow-sm"
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
                          ? "text-white shadow-sm"
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
                          ? "text-white shadow-sm"
                          : "border border-border/60 bg-card text-muted-foreground hover:border-accent/40 hover:text-foreground"
                      }`}
                      style={financing === f ? { background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" } : undefined}
                    >
                      {t(`financing_${f}` as "financing_cash" | "financing_mortgage")}
                    </button>
                  ))}
                </div>
                {financing === "mortgage" && (
                  <div className="mt-4">
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
                )}
              </div>
            </div>
          </motion.div>

          {/* ── Right: Outputs ──────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="space-y-4"
          >
            {/* Rating badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold ${ratingColor}`}>
              <TrendingUp className="h-3.5 w-3.5" />
              {t(`rating_${outputs.rating}` as "rating_strong" | "rating_moderate" | "rating_weak")}
              {" — "}{t("investmentRating")}
            </div>

            {/* Main metrics */}
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                icon={DollarSign}
                label={t("estSize")}
                value={outputs.estimatedSqft > 0 ? `${outputs.estimatedSqft.toLocaleString()} sqft` : "—"}
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
                label={t("annualRental")}
                value={outputs.annualRental > 0 ? AED(outputs.annualRental) : "—"}
                sub={t("annualRentalSub")}
              />
              <MetricCard
                icon={Percent}
                label={t("netYield")}
                value={outputs.netYield > 0 ? pct(outputs.netYield) : "—"}
                sub={t("netYieldSub")}
              />
            </div>

            {/* Projected values */}
            <div className="bg-card border border-border/50 rounded-2xl p-5">
              <h3 className="font-bold text-sm text-foreground mb-4">{t("projectedValue")}</h3>
              <div className="space-y-3">
                <ProjectionRow label={t("year3")} value={AED(outputs.value3yr)} baseline={AED(budget)} />
                <ProjectionRow label={t("year5")} value={AED(outputs.value5yr)} baseline={AED(budget)} highlight />
              </div>
            </div>

            {/* Comparison strip */}
            <div className="bg-card border border-border/50 rounded-2xl p-5">
              <h3 className="font-bold text-sm text-foreground mb-4">{t("fiveYearComparison")}</h3>
              <div className="space-y-2">
                <CompareRow
                  label={t("realEstate5yr")}
                  value={pct(outputs.roi5yr)}
                  color="emerald"
                  best={outputs.roi5yr >= outputs.sp500Roi}
                />
                <CompareRow
                  label={t("savings5yr")}
                  value={pct(outputs.savingsRoi)}
                  color="blue"
                />
                <CompareRow
                  label={t("sp5005yr")}
                  value={pct(outputs.sp500Roi)}
                  color="purple"
                  best={outputs.sp500Roi > outputs.roi5yr}
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
                  href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100 transition-colors border border-green-200"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  {t("shareWhatsApp")}
                </a>
                <a
                  href={`mailto:?subject=${encodeURIComponent(t("emailSubject"))}&body=${encodeURIComponent(shareText)}`}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {t("shareEmail")}
                </a>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-muted text-foreground hover:bg-muted/70 transition-colors border border-border"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? t("copied") : t("copyLink")}
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
    </div>
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
