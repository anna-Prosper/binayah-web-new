"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, LineChart, Line, Area, AreaChart,
} from "recharts";
import {
  TrendingUp, BarChart3, Building2, ArrowUpDown, ChevronUp,
  ChevronDown, DollarSign, Percent, Activity, Star, Newspaper,
  Globe, RefreshCw, ExternalLink,
} from "lucide-react";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────

interface CommunityStats {
  area: string;
  avgPricePerSqft: number;
  avgSalePrice: number;
  avgRentPrice: number;
  rentalYield: number;
  totalListings: number;
  offPlanCount: number;
  secondaryCount: number;
  investmentScore: number;
  sampleSize: number;
}

interface MarketStats {
  summary: { avgPricePerSqft: number; totalListings: number; avgYield: number; offPlanShare: number; offPlanCount: number; secondaryCount: number };
  priceByArea: { area: string; price: number; count: number }[];
  yieldByArea: { area: string; yield: number; avgRent: number; avgSale: number }[];
  volumeByArea: { area: string; volume: number }[];
  segments: { name: string; value: number; count: number; color: string }[];
  communityMatrix: CommunityStats[];
  priceByBedroom: { beds: string; avgPrice: number; minPrice: number; maxPrice: number; count: number }[];
}

interface MarketData {
  rates: Record<string, number> | null;
  indicators: Record<string, { value: number; year: number; unit: string }>;
  news: { title: string; url: string; source: string; summary: string; imageUrl: string; publishedAt: string }[];
  transactions: {
    hasData: boolean;
    summary: { totalTransactions: number; totalValue: number; avgTransactionValue: number; avgPpsf: number };
    monthly: { label: string; count: number; totalValue: number; avgPrice: number; avgPpsf: number }[];
    byArea: { area: string; count: number; totalValue: number; avgPrice: number; avgPpsf: number }[];
    byType: { type: string; count: number; totalValue: number }[];
  } | null;
}

type SortKey = keyof Pick<CommunityStats, "area" | "avgPricePerSqft" | "rentalYield" | "totalListings" | "investmentScore" | "avgSalePrice">;
type ChartView = "price" | "yield" | "volume" | "bedroom";

// ── Helpers ────────────────────────────────────────────────────────────────

const AED = (n: number, compact = false) => {
  if (compact) {
    if (n >= 1_000_000_000) return `AED ${(n / 1_000_000_000).toFixed(1)}B`;
    if (n >= 1_000_000) return `AED ${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `AED ${(n / 1_000).toFixed(0)}K`;
  }
  return `AED ${n.toLocaleString()}`;
};

const TOOLTIP_STYLE = { borderRadius: 12, border: "1px solid hsl(40,15%,88%)", fontSize: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" };
const C = { primary: "hsl(168, 100%, 15%)", accent: "hsl(43, 60%, 55%)", light: "hsl(168, 60%, 45%)" };

const CURRENCIES = [
  { code: "USD", flag: "🇺🇸", label: "US Dollar" },
  { code: "EUR", flag: "🇪🇺", label: "Euro" },
  { code: "GBP", flag: "🇬🇧", label: "Brit. Pound" },
  { code: "RUB", flag: "🇷🇺", label: "Russian Ruble" },
  { code: "INR", flag: "🇮🇳", label: "Indian Rupee" },
  { code: "KZT", flag: "🇰🇿", label: "Kazakhstani Tenge" },
  { code: "CNY", flag: "🇨🇳", label: "Chinese Yuan" },
];

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 70 ? "bg-emerald-100 text-emerald-700" : score >= 45 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500";
  return <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${color}`}><Star className="h-2.5 w-2.5" />{score}</span>;
}

function Kpi({ label, value, sub, icon: Icon, accent = false }: { label: string; value: string; sub?: string; icon: React.ElementType; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 sm:p-5 border ${accent ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border/50"}`}>
      <div className="flex items-start justify-between mb-3">
        <p className={`text-xs font-medium ${accent ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent ? "bg-white/15" : "bg-accent/10"}`}>
          <Icon className={`h-4 w-4 ${accent ? "text-white" : "text-accent"}`} />
        </div>
      </div>
      <p className={`text-2xl sm:text-3xl font-bold ${accent ? "text-white" : "text-foreground"}`}>{value}</p>
      {sub && <p className={`text-xs mt-1 ${accent ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{sub}</p>}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function PulsePageClient({ marketStats, marketData }: { marketStats: MarketStats | null; marketData: MarketData | null }) {
  const [sortKey, setSortKey] = useState<SortKey>("totalListings");
  const [sortAsc, setSortAsc] = useState(false);
  const [chartView, setChartView] = useState<ChartView>("price");
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [aedAmount, setAedAmount] = useState("1000000");

  const matrix = marketStats?.communityMatrix ?? [];

  const sorted = useMemo(() => [...matrix].sort((a, b) => {
    const av = a[sortKey] as number | string;
    const bv = b[sortKey] as number | string;
    if (typeof av === "string") return sortAsc ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
    return sortAsc ? (av as number) - (bv as number) : (bv as number) - (av as number);
  }), [matrix, sortKey, sortAsc]);

  const topInvestment = useMemo(() => [...matrix].sort((a, b) => b.investmentScore - a.investmentScore).slice(0, 3), [matrix]);

  const radarData = useMemo(() => {
    if (!selectedArea || !matrix.length) return null;
    const c = matrix.find((x) => x.area === selectedArea);
    if (!c) return null;
    const maxPpsf = Math.max(...matrix.map((x) => x.avgPricePerSqft));
    const maxVol = Math.max(...matrix.map((x) => x.totalListings));
    const maxYield = Math.max(...matrix.map((x) => x.rentalYield));
    return [
      { metric: "Yield", value: maxYield > 0 ? Math.round((c.rentalYield / maxYield) * 100) : 0 },
      { metric: "Activity", value: maxVol > 0 ? Math.round((c.totalListings / maxVol) * 100) : 0 },
      { metric: "Affordability", value: maxPpsf > 0 ? Math.round((1 - c.avgPricePerSqft / maxPpsf) * 100) : 0 },
      { metric: "Off-Plan Mix", value: c.totalListings > 0 ? Math.round((c.offPlanCount / c.totalListings) * 100) : 0 },
      { metric: "Score", value: c.investmentScore },
    ];
  }, [selectedArea, matrix]);

  const handleSort = (key: SortKey) => { if (sortKey === key) setSortAsc(!sortAsc); else { setSortKey(key); setSortAsc(false); } };
  const SortIcon = ({ k }: { k: SortKey }) => sortKey === k
    ? sortAsc ? <ChevronUp className="h-3 w-3 text-accent" /> : <ChevronDown className="h-3 w-3 text-accent" />
    : <ArrowUpDown className="h-3 w-3 text-muted-foreground/40" />;

  const txData = marketData?.transactions;
  const rates = marketData?.rates;
  const indicators = marketData?.indicators ?? {};
  const news = marketData?.news ?? [];

  const aedNum = parseFloat(aedAmount.replace(/,/g, "")) || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-12 sm:space-y-16">

      {/* ── KPIs ─────────────────────────────────────────────────── */}
      {marketStats && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Kpi label="Avg Price / sqft" value={AED(marketStats.summary.avgPricePerSqft)} sub="Live listings" icon={DollarSign} accent />
          <Kpi label="Active Listings" value={marketStats.summary.totalListings.toLocaleString()} sub={`${marketStats.summary.offPlanCount} off-plan · ${marketStats.summary.secondaryCount} secondary`} icon={Building2} />
          <Kpi label="Avg Rental Yield" value={`${marketStats.summary.avgYield}%`} sub="Gross, annualised" icon={Percent} />
          <Kpi label="Off-Plan Share" value={`${marketStats.summary.offPlanShare}%`} sub="of total inventory" icon={TrendingUp} />
        </motion.div>
      )}

      {/* ── DLD Transaction Analytics ────────────────────────────── */}
      {txData?.hasData ? (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <SectionHeader label="DLD Transactions" title="Official Transaction" titleItalic="Data" />

          <div className="grid sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {[
              { label: "Total Transactions", value: txData.summary.totalTransactions.toLocaleString(), sub: "last 12 months" },
              { label: "Total Value", value: AED(txData.summary.totalValue, true), sub: "sales volume" },
              { label: "Avg Transaction", value: AED(txData.summary.avgTransactionValue, true), sub: "per sale" },
              { label: "Avg Sold Price/sqft", value: txData.summary.avgPpsf > 0 ? `AED ${txData.summary.avgPpsf.toLocaleString()}` : "—", sub: "actual sold" },
            ].map((s) => (
              <div key={s.label} className="bg-card border border-border/50 rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Monthly volume */}
            {txData.monthly.length > 0 && (
              <div className="bg-card border border-border/50 rounded-2xl p-4 sm:p-6">
                <h4 className="font-semibold text-sm text-foreground mb-4">Monthly Transaction Volume</h4>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={txData.monthly}>
                      <defs>
                        <linearGradient id="txGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={C.primary} stopOpacity={0.15} />
                          <stop offset="95%" stopColor={C.primary} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(40,15%,92%)" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(v: number) => [v.toLocaleString(), "Transactions"]} contentStyle={TOOLTIP_STYLE} />
                      <Area dataKey="count" stroke={C.primary} strokeWidth={2} fill="url(#txGrad)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Avg sold price trend */}
            {txData.monthly.filter((m) => m.avgPpsf > 0).length > 0 && (
              <div className="bg-card border border-border/50 rounded-2xl p-4 sm:p-6">
                <h4 className="font-semibold text-sm text-foreground mb-4">Avg Sold Price / sqft Trend</h4>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={txData.monthly.filter((m) => m.avgPpsf > 0)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(40,15%,92%)" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                      <Tooltip formatter={(v: number) => [`AED ${v.toLocaleString()}`, "Avg Price/sqft"]} contentStyle={TOOLTIP_STYLE} />
                      <Line dataKey="avgPpsf" stroke={C.accent} strokeWidth={2.5} dot={{ fill: C.accent, r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Top areas by transactions */}
          {txData.byArea.length > 0 && (
            <div className="mt-4 bg-card border border-border/50 rounded-2xl p-4 sm:p-6">
              <h4 className="font-semibold text-sm text-foreground mb-4">Top Areas by Transaction Volume</h4>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={txData.byArea.slice(0, 8)} barSize={22}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(40,15%,92%)" vertical={false} />
                    <XAxis dataKey="area" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v: number, name: string) => [name === "count" ? v.toLocaleString() : AED(v, true), name === "count" ? "Transactions" : "Avg Price"]} contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {txData.byArea.slice(0, 8).map((_, i) => (
                        <Cell key={i} fill={i === 0 ? C.accent : C.primary} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </motion.section>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-muted/30 border border-border/30 rounded-2xl p-6 text-center">
          <RefreshCw className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm font-medium text-muted-foreground">DLD transaction data is being fetched</p>
          <p className="text-xs text-muted-foreground/60 mt-1">The system automatically downloads from Dubai Data Portal on startup. Check back shortly.</p>
        </motion.div>
      )}

      {/* ── Top investment picks + charts ────────────────────────── */}
      {marketStats && (
        <>
          {topInvestment.length > 0 && (
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <SectionHeader label="Investment" title="Top Investment" titleItalic="Areas" />
              <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
                {topInvestment.map((c, i) => (
                  <button key={c.area} onClick={() => setSelectedArea(selectedArea === c.area ? null : c.area)}
                    className={`text-left rounded-2xl border p-4 sm:p-5 transition-all hover:shadow-md ${selectedArea === c.area ? "border-accent bg-accent/5 shadow-md" : "border-border/50 bg-card hover:border-accent/40"}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center">{i + 1}</div>
                        <p className="font-semibold text-sm text-foreground">{c.area}</p>
                      </div>
                      <ScoreBadge score={c.investmentScore} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><p className="text-muted-foreground">Yield</p><p className="font-bold text-emerald-600">{c.rentalYield > 0 ? `${c.rentalYield}%` : "—"}</p></div>
                      <div><p className="text-muted-foreground">Price/sqft</p><p className="font-bold text-foreground">{c.avgPricePerSqft > 0 ? `AED ${c.avgPricePerSqft.toLocaleString()}` : "—"}</p></div>
                      <div><p className="text-muted-foreground">Avg Sale</p><p className="font-semibold text-foreground">{c.avgSalePrice > 0 ? AED(c.avgSalePrice, true) : "—"}</p></div>
                      <div><p className="text-muted-foreground">Avg Rent/yr</p><p className="font-semibold text-foreground">{c.avgRentPrice > 0 ? AED(c.avgRentPrice, true) : "—"}</p></div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.section>
          )}

          {radarData && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-card border border-accent/20 rounded-2xl p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-foreground">{selectedArea} — Investment Profile</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Relative scores vs. all tracked areas (100 = best)</p>
                </div>
                <button onClick={() => setSelectedArea(null)} className="text-xs text-muted-foreground hover:text-foreground">Close ✕</button>
              </div>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                    <PolarGrid stroke="hsl(40,15%,88%)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar dataKey="value" stroke={C.primary} fill={C.primary} fillOpacity={0.25} />
                    <Tooltip formatter={(v: number) => [`${v}/100`]} contentStyle={TOOLTIP_STYLE} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Charts + Segments */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="grid lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2 bg-card rounded-2xl border border-border/50 p-4 sm:p-6">
              <div className="flex flex-wrap gap-1.5 mb-5">
                {([
                  { id: "price" as ChartView, label: "Price / sqft" },
                  { id: "yield" as ChartView, label: "Rental Yield" },
                  { id: "volume" as ChartView, label: "Volume" },
                  { id: "bedroom" as ChartView, label: "By Bedrooms" },
                ]).map((t) => (
                  <button key={t.id} onClick={() => setChartView(t.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${chartView === t.id ? "text-white shadow-sm" : "text-muted-foreground hover:bg-secondary"}`}
                    style={chartView === t.id ? { background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" } : undefined}>
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="h-[250px]">
                {chartView === "price" && (marketStats.priceByArea.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={marketStats.priceByArea} barSize={22}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(40,15%,92%)" vertical={false} />
                      <XAxis dataKey="area" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                      <Tooltip formatter={(v: number) => [`AED ${v.toLocaleString()}`, "Price/sqft"]} contentStyle={TOOLTIP_STYLE} />
                      <Bar dataKey="price" radius={[6, 6, 0, 0]}>{marketStats.priceByArea.map((_, i) => <Cell key={i} fill={i === 0 ? C.accent : C.primary} />)}</Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <EmptyChart />)}
                {chartView === "yield" && (marketStats.yieldByArea.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={marketStats.yieldByArea} barSize={22} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(40,15%,92%)" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} domain={[0, "auto"]} />
                      <YAxis dataKey="area" type="category" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={90} />
                      <Tooltip formatter={(v: number) => [`${v}%`, "Gross Yield"]} contentStyle={TOOLTIP_STYLE} />
                      <Bar dataKey="yield" radius={[0, 6, 6, 0]}>{marketStats.yieldByArea.map((e, i) => <Cell key={i} fill={e.yield >= 7 ? C.accent : e.yield >= 5 ? C.light : C.primary} />)}</Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <EmptyChart />)}
                {chartView === "volume" && (marketStats.volumeByArea.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={marketStats.volumeByArea} barSize={22}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(40,15%,92%)" vertical={false} />
                      <XAxis dataKey="area" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(v: number) => [v.toLocaleString(), "Properties"]} contentStyle={TOOLTIP_STYLE} />
                      <Bar dataKey="volume" radius={[6, 6, 0, 0]}>{marketStats.volumeByArea.map((_, i) => <Cell key={i} fill={`hsl(168, ${80 - i * 6}%, ${20 + i * 5}%)`} />)}</Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <EmptyChart />)}
                {chartView === "bedroom" && (marketStats.priceByBedroom.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={marketStats.priceByBedroom} barSize={28}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(40,15%,92%)" vertical={false} />
                      <XAxis dataKey="beds" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} />
                      <Tooltip formatter={(v: number) => [AED(v, true), "Avg Price"]} contentStyle={TOOLTIP_STYLE} />
                      <Bar dataKey="avgPrice" fill={C.primary} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <EmptyChart />)}
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border/50 p-4 sm:p-6 flex flex-col">
              <h3 className="font-bold text-sm text-foreground mb-4">Property Mix</h3>
              <div className="flex h-4 rounded-full overflow-hidden mb-5">
                {marketStats.segments.map((s) => <div key={s.name} className="h-full" style={{ width: `${s.value}%`, background: s.color }} />)}
              </div>
              <div className="space-y-3 flex-1">
                {marketStats.segments.map((s) => (
                  <div key={s.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                      <span className="text-muted-foreground">{s.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-foreground">{s.value}%</span>
                      <span className="text-[10px] text-muted-foreground ml-1">({s.count})</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-border/30 grid grid-cols-2 gap-3">
                <div className="text-center"><p className="text-xs text-muted-foreground mb-1">Off-Plan</p><p className="text-xl font-bold text-foreground">{marketStats.summary.offPlanCount.toLocaleString()}</p></div>
                <div className="text-center"><p className="text-xs text-muted-foreground mb-1">Secondary</p><p className="text-xl font-bold text-foreground">{marketStats.summary.secondaryCount.toLocaleString()}</p></div>
              </div>
            </div>
          </motion.div>

          {/* Community table */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <SectionHeader label="Comparison" title="Community" titleItalic="Comparison" />
            <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/30">
                      {([
                        { key: "area" as SortKey, label: "Community" },
                        { key: "avgPricePerSqft" as SortKey, label: "AED/sqft" },
                        { key: "avgSalePrice" as SortKey, label: "Avg Sale" },
                        { key: "rentalYield" as SortKey, label: "Yield" },
                        { key: "totalListings" as SortKey, label: "Listings" },
                        { key: "investmentScore" as SortKey, label: "Score" },
                      ]).map((col) => (
                        <th key={col.key} onClick={() => handleSort(col.key)}
                          className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none">
                          <div className="flex items-center gap-1.5">{col.label}<SortIcon k={col.key} /></div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((c, i) => (
                      <tr key={c.area} onClick={() => setSelectedArea(selectedArea === c.area ? null : c.area)}
                        className={`border-b border-border/30 last:border-0 cursor-pointer transition-colors ${selectedArea === c.area ? "bg-accent/5" : "hover:bg-muted/30"}`}>
                        <td className="px-4 py-3 font-medium text-foreground">
                          <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground w-4">{i + 1}</span>{c.area}</div>
                        </td>
                        <td className="px-4 py-3">{c.avgPricePerSqft > 0 ? <span className="font-semibold text-foreground">{c.avgPricePerSqft.toLocaleString()}</span> : <span className="text-muted-foreground/40">—</span>}</td>
                        <td className="px-4 py-3 text-muted-foreground">{c.avgSalePrice > 0 ? AED(c.avgSalePrice, true) : <span className="text-muted-foreground/40">—</span>}</td>
                        <td className="px-4 py-3">{c.rentalYield > 0 ? <span className={`font-semibold ${c.rentalYield >= 7 ? "text-emerald-600" : c.rentalYield >= 5 ? "text-amber-600" : "text-foreground"}`}>{c.rentalYield}%</span> : <span className="text-muted-foreground/40">—</span>}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.min((c.totalListings / (sorted[0]?.totalListings || 1)) * 100, 100)}%` }} /></div>
                            <span className="text-muted-foreground text-xs">{c.totalListings}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3"><ScoreBadge score={c.investmentScore} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.section>
        </>
      )}

      {/* ── Currency Converter ───────────────────────────────────── */}
      {rates && Object.keys(rates).length > 0 && (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <SectionHeader label="Exchange Rates" title="Currency" titleItalic="Converter" />
          <div className="bg-card border border-border/50 rounded-2xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Amount in AED</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">AED</span>
                  <input
                    type="number"
                    value={aedAmount}
                    onChange={(e) => setAedAmount(e.target.value)}
                    className="w-full pl-14 pr-4 py-3 rounded-xl bg-background border border-border text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              <div className="sm:w-48 flex items-end">
                <p className="text-xs text-muted-foreground pb-1">Rates from European Central Bank via Frankfurter.app · updated every 6h</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {CURRENCIES.filter((c) => rates[c.code]).map((c) => {
                const converted = aedNum * rates[c.code];
                const formattedConverted = converted >= 1_000_000
                  ? `${c.code} ${(converted / 1_000_000).toFixed(2)}M`
                  : converted >= 1_000
                  ? `${c.code} ${(converted / 1_000).toFixed(1)}K`
                  : `${c.code} ${converted.toFixed(2)}`;
                return (
                  <div key={c.code} className="bg-muted/30 rounded-xl p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{c.flag}</span>
                      <div>
                        <p className="text-xs font-bold text-foreground">{c.code}</p>
                        <p className="text-[10px] text-muted-foreground">{c.label}</p>
                      </div>
                    </div>
                    <p className="text-base sm:text-lg font-bold text-foreground">{formattedConverted}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">1 AED = {rates[c.code].toFixed(4)} {c.code}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.section>
      )}

      {/* ── Economic Indicators ──────────────────────────────────── */}
      {Object.keys(indicators).length > 0 && (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <SectionHeader label="World Bank Data" title="UAE Economic" titleItalic="Indicators" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(indicators).map(([label, data]) => {
              const isLarge = data.value >= 1_000_000_000;
              const displayVal = isLarge
                ? `$${(data.value / 1_000_000_000).toFixed(0)}B`
                : data.unit === "percent"
                ? `${data.value.toFixed(1)}%`
                : data.unit === "people"
                ? `${(data.value / 1_000_000).toFixed(1)}M`
                : data.value.toLocaleString();
              return (
                <div key={label} className="bg-card border border-border/50 rounded-xl p-3 sm:p-4">
                  <p className="text-[10px] text-muted-foreground mb-1 leading-tight">{label}</p>
                  <p className="text-lg sm:text-xl font-bold text-foreground">{displayVal}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">{data.year}</p>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
            <Globe className="h-3 w-3" /> Source: World Bank Open Data · updated weekly
          </p>
        </motion.section>
      )}

      {/* ── News Feed ────────────────────────────────────────────── */}
      {news.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <SectionHeader label="Market News" title="Real Estate" titleItalic="News" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {news.slice(0, 9).map((item) => (
              <a key={item.url} href={item.url} target="_blank" rel="noopener noreferrer"
                className="group bg-card border border-border/50 rounded-xl p-4 hover:border-accent/40 hover:shadow-md transition-all flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full">{item.source}</span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-accent transition-colors" />
                </div>
                <p className="text-sm font-semibold text-foreground leading-snug line-clamp-3 group-hover:text-accent transition-colors">{item.title}</p>
                {item.summary && <p className="text-xs text-muted-foreground line-clamp-2">{item.summary}</p>}
                <p className="text-[10px] text-muted-foreground/60 mt-auto">
                  {new Date(item.publishedAt).toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </a>
            ))}
          </div>
        </motion.section>
      )}

      <p className="text-[10px] text-muted-foreground text-center pb-4">
        Listing data from Binayah database · Transaction data from Dubai Land Department via Dubai Data Portal ·
        Exchange rates via Frankfurter/ECB · Economic data via World Bank Open Data ·{" "}
        <Link href="/contact" className="underline hover:text-foreground">Contact us</Link> for full reports.
      </p>
    </div>
  );
}

// ── Shared Sub-components ──────────────────────────────────────────────────

function SectionHeader({ label, title, titleItalic }: { label: string; title: string; titleItalic: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="h-[2px] w-10 bg-accent flex-shrink-0" />
      <div>
        <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-accent">{label}</p>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">
          {title} <span className="italic font-light">{titleItalic}</span>
        </h2>
      </div>
    </div>
  );
}

function EmptyChart() {
  return <div className="h-full flex items-center justify-center text-sm text-muted-foreground/60">Not enough data for this view</div>;
}
