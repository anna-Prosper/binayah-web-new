"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import {
  TrendingUp, TrendingDown, BarChart3, Building2, Home,
  ArrowUpDown, ChevronUp, ChevronDown, DollarSign, Percent,
  Activity, Star,
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

interface MarketData {
  summary: {
    avgPricePerSqft: number;
    totalListings: number;
    avgYield: number;
    offPlanShare: number;
    offPlanCount: number;
    secondaryCount: number;
  };
  priceByArea: { area: string; price: number; count: number }[];
  yieldByArea: { area: string; yield: number; avgRent: number; avgSale: number }[];
  volumeByArea: { area: string; volume: number }[];
  segments: { name: string; value: number; count: number; color: string }[];
  communityMatrix: CommunityStats[];
  priceByBedroom: { beds: string; avgPrice: number; minPrice: number; maxPrice: number; count: number }[];
}

type SortKey = keyof Pick<CommunityStats, "area" | "avgPricePerSqft" | "rentalYield" | "totalListings" | "investmentScore" | "avgSalePrice">;
type ChartView = "price" | "yield" | "volume" | "bedroom";

// ── Helpers ────────────────────────────────────────────────────────────────

const AED = (n: number, compact = false) => {
  if (compact) {
    if (n >= 1_000_000) return `AED ${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `AED ${(n / 1_000).toFixed(0)}K`;
  }
  return `AED ${n.toLocaleString()}`;
};

const PCT = (n: number) => `${n}%`;

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 70 ? "bg-emerald-100 text-emerald-700" :
    score >= 45 ? "bg-amber-100 text-amber-700" :
    "bg-slate-100 text-slate-500";
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>
      <Star className="h-2.5 w-2.5" />{score}
    </span>
  );
}

function Kpi({ label, value, sub, icon: Icon, accent = false }: {
  label: string; value: string; sub?: string;
  icon: React.ElementType; accent?: boolean;
}) {
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

const CHART_COLORS = {
  primary: "hsl(168, 100%, 15%)",
  accent: "hsl(43, 60%, 55%)",
  light: "hsl(168, 60%, 45%)",
};

const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: "1px solid hsl(40,15%,88%)",
  fontSize: 12,
  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
};

// ── Main Component ─────────────────────────────────────────────────────────

export default function PulsePageClient({ data }: { data: MarketData | null }) {
  const [sortKey, setSortKey] = useState<SortKey>("totalListings");
  const [sortAsc, setSortAsc] = useState(false);
  const [chartView, setChartView] = useState<ChartView>("price");
  const [selectedArea, setSelectedArea] = useState<string | null>(null);

  const sorted = useMemo(() => {
    if (!data) return [];
    return [...data.communityMatrix].sort((a, b) => {
      const av = a[sortKey] as number | string;
      const bv = b[sortKey] as number | string;
      if (typeof av === "string") return sortAsc ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
      return sortAsc ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
  }, [data, sortKey, sortAsc]);

  const topInvestment = useMemo(() =>
    data ? [...data.communityMatrix].sort((a, b) => b.investmentScore - a.investmentScore).slice(0, 3) : [],
    [data]
  );

  const radarData = useMemo(() => {
    if (!selectedArea || !data) return null;
    const c = data.communityMatrix.find((x) => x.area === selectedArea);
    if (!c) return null;
    const maxPpsf = Math.max(...data.communityMatrix.map((x) => x.avgPricePerSqft));
    const maxVol = Math.max(...data.communityMatrix.map((x) => x.totalListings));
    const maxYield = Math.max(...data.communityMatrix.map((x) => x.rentalYield));
    return [
      { metric: "Yield", value: maxYield > 0 ? Math.round((c.rentalYield / maxYield) * 100) : 0 },
      { metric: "Activity", value: maxVol > 0 ? Math.round((c.totalListings / maxVol) * 100) : 0 },
      { metric: "Affordability", value: maxPpsf > 0 ? Math.round((1 - c.avgPricePerSqft / maxPpsf) * 100) : 0 },
      { metric: "Off-Plan Mix", value: c.totalListings > 0 ? Math.round((c.offPlanCount / c.totalListings) * 100) : 0 },
      { metric: "Score", value: c.investmentScore },
    ];
  }, [selectedArea, data]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k
      ? sortAsc ? <ChevronUp className="h-3 w-3 text-accent" /> : <ChevronDown className="h-3 w-3 text-accent" />
      : <ArrowUpDown className="h-3 w-3 text-muted-foreground/40" />;

  if (!data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">Market data unavailable. Check back shortly.</p>
        </div>
      </div>
    );
  }

  const chartTabs: { id: ChartView; label: string }[] = [
    { id: "price", label: "Price / sqft" },
    { id: "yield", label: "Rental Yield" },
    { id: "volume", label: "Volume" },
    { id: "bedroom", label: "By Bedrooms" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-10 sm:space-y-14">

      {/* ── KPIs ─────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Kpi label="Avg Price / sqft" value={AED(data.summary.avgPricePerSqft)} sub="Dubai market" icon={DollarSign} accent />
        <Kpi label="Active Listings" value={data.summary.totalListings.toLocaleString()} sub={`${data.summary.offPlanCount} off-plan · ${data.summary.secondaryCount} secondary`} icon={Building2} />
        <Kpi label="Avg Rental Yield" value={PCT(data.summary.avgYield)} sub="Gross, annualised" icon={Percent} />
        <Kpi label="Off-Plan Share" value={PCT(data.summary.offPlanShare)} sub="of total inventory" icon={TrendingUp} />
      </motion.div>

      {/* ── Top investment picks ──────────────────────────────────── */}
      {topInvestment.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-[2px] w-10 bg-accent" />
            <h2 className="text-sm font-semibold tracking-[0.3em] uppercase text-accent">Top Investment Areas</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
            {topInvestment.map((c, i) => (
              <button
                key={c.area}
                onClick={() => setSelectedArea(selectedArea === c.area ? null : c.area)}
                className={`text-left rounded-2xl border p-4 sm:p-5 transition-all hover:shadow-md ${selectedArea === c.area ? "border-accent bg-accent/5 shadow-md" : "border-border/50 bg-card hover:border-accent/40"}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </div>
                    <p className="font-semibold text-sm text-foreground">{c.area}</p>
                  </div>
                  <ScoreBadge score={c.investmentScore} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Yield</p>
                    <p className="font-bold text-emerald-600">{c.rentalYield > 0 ? `${c.rentalYield}%` : "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Price / sqft</p>
                    <p className="font-bold text-foreground">{c.avgPricePerSqft > 0 ? `AED ${c.avgPricePerSqft.toLocaleString()}` : "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Avg Sale</p>
                    <p className="font-semibold text-foreground">{c.avgSalePrice > 0 ? AED(c.avgSalePrice, true) : "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Avg Rent / yr</p>
                    <p className="font-semibold text-foreground">{c.avgRentPrice > 0 ? AED(c.avgRentPrice, true) : "—"}</p>
                  </div>
                </div>
                {selectedArea === c.area && (
                  <p className="text-[10px] text-accent font-medium mt-3">Showing radar below ↓</p>
                )}
              </button>
            ))}
          </div>
        </motion.section>
      )}

      {/* ── Radar for selected area ───────────────────────────────── */}
      {radarData && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
          className="bg-card border border-accent/20 rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-foreground">{selectedArea} — Investment Profile</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Relative scores vs. all tracked areas (100 = best)</p>
            </div>
            <button onClick={() => setSelectedArea(null)} className="text-xs text-muted-foreground hover:text-foreground">Close ✕</button>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid stroke="hsl(40,15%,88%)" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar dataKey="value" stroke={CHART_COLORS.primary} fill={CHART_COLORS.primary} fillOpacity={0.25} />
                <Tooltip formatter={(v: number) => [`${v}/100`]} contentStyle={TOOLTIP_STYLE} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* ── Charts + Segments grid ────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="grid lg:grid-cols-3 gap-4 sm:gap-6">

        {/* Main chart */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border/50 p-4 sm:p-6">
          <div className="flex flex-wrap gap-1.5 mb-5">
            {chartTabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setChartView(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  chartView === t.id
                    ? "text-white shadow-sm"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
                style={chartView === t.id ? { background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" } : undefined}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="h-[260px]">
            {chartView === "price" && (
              data.priceByArea.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.priceByArea} barSize={22}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(40,15%,92%)" vertical={false} />
                    <XAxis dataKey="area" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: number) => [`AED ${v.toLocaleString()}`, "Price/sqft"]} contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="price" radius={[6, 6, 0, 0]}>
                      {data.priceByArea.map((entry, i) => (
                        <Cell key={i} fill={i === 0 ? CHART_COLORS.accent : CHART_COLORS.primary} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <EmptyChart />
            )}

            {chartView === "yield" && (
              data.yieldByArea.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.yieldByArea} barSize={22} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(40,15%,92%)" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} domain={[0, "auto"]} />
                    <YAxis dataKey="area" type="category" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={90} />
                    <Tooltip
                      formatter={(v: number, name: string) =>
                        name === "yield" ? [`${v}%`, "Gross Yield"] : [`AED ${v.toLocaleString()}`, name === "avgRent" ? "Avg Rent/yr" : "Avg Sale"]
                      }
                      contentStyle={TOOLTIP_STYLE}
                    />
                    <Bar dataKey="yield" radius={[0, 6, 6, 0]}>
                      {data.yieldByArea.map((entry, i) => (
                        <Cell key={i} fill={entry.yield >= 7 ? CHART_COLORS.accent : entry.yield >= 5 ? CHART_COLORS.light : CHART_COLORS.primary} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <EmptyChart />
            )}

            {chartView === "volume" && (
              data.volumeByArea.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.volumeByArea} barSize={22}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(40,15%,92%)" vertical={false} />
                    <XAxis dataKey="area" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v: number) => [v.toLocaleString(), "Properties"]} contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="volume" radius={[6, 6, 0, 0]}>
                      {data.volumeByArea.map((_, i) => (
                        <Cell key={i} fill={i === 0 ? CHART_COLORS.primary : `hsl(168, ${60 - i * 5}%, ${25 + i * 5}%)`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <EmptyChart />
            )}

            {chartView === "bedroom" && (
              data.priceByBedroom.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.priceByBedroom} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(40,15%,92%)" vertical={false} />
                    <XAxis dataKey="beds" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} />
                    <Tooltip formatter={(v: number, name: string) => [AED(v, true), name === "avgPrice" ? "Avg Price" : name === "minPrice" ? "Min" : "Max"]} contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="avgPrice" fill={CHART_COLORS.primary} radius={[6, 6, 0, 0]} name="avgPrice" />
                  </BarChart>
                </ResponsiveContainer>
              ) : <EmptyChart />
            )}
          </div>

          {chartView === "bedroom" && data.priceByBedroom.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4 pt-4 border-t border-border/30">
              {data.priceByBedroom.map((b) => (
                <div key={b.beds} className="text-center">
                  <p className="text-xs font-semibold text-foreground">{b.beds}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{AED(b.avgPrice, true)}</p>
                  <p className="text-[9px] text-muted-foreground/60">{b.count} listings</p>
                </div>
              ))}
            </div>
          )}

          {chartView === "yield" && data.yieldByArea.length > 0 && (
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/30 text-[10px]">
              {[
                { color: CHART_COLORS.accent, label: "≥ 7% (Excellent)" },
                { color: CHART_COLORS.light, label: "5–7% (Good)" },
                { color: CHART_COLORS.primary, label: "< 5% (Average)" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5 text-muted-foreground">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: l.color }} />
                  {l.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Segments */}
        <div className="bg-card rounded-2xl border border-border/50 p-4 sm:p-6 flex flex-col">
          <h3 className="font-bold text-sm text-foreground mb-4">Property Mix</h3>
          <div className="flex h-4 rounded-full overflow-hidden mb-5">
            {data.segments.map((s) => (
              <div key={s.name} className="h-full transition-all" style={{ width: `${s.value}%`, background: s.color }} />
            ))}
          </div>
          <div className="space-y-3 flex-1">
            {data.segments.map((s) => (
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
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Off-Plan</p>
              <p className="text-xl font-bold text-foreground">{data.summary.offPlanCount.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Secondary</p>
              <p className="text-xl font-bold text-foreground">{data.summary.secondaryCount.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Community comparison table ────────────────────────────── */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-[2px] w-10 bg-accent" />
            <h2 className="text-sm font-semibold tracking-[0.3em] uppercase text-accent">Community Comparison</h2>
          </div>
          <p className="text-xs text-muted-foreground hidden sm:block">Click column headers to sort</p>
        </div>

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
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        {col.label}
                        <SortIcon k={col.key} />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((c, i) => (
                  <tr
                    key={c.area}
                    onClick={() => setSelectedArea(selectedArea === c.area ? null : c.area)}
                    className={`border-b border-border/30 last:border-0 cursor-pointer transition-colors ${
                      selectedArea === c.area ? "bg-accent/5" : "hover:bg-muted/30"
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                        {c.area}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {c.avgPricePerSqft > 0 ? (
                        <span className="font-semibold">{c.avgPricePerSqft.toLocaleString()}</span>
                      ) : <span className="text-muted-foreground/40">—</span>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.avgSalePrice > 0 ? AED(c.avgSalePrice, true) : <span className="text-muted-foreground/40">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {c.rentalYield > 0 ? (
                        <span className={`font-semibold ${c.rentalYield >= 7 ? "text-emerald-600" : c.rentalYield >= 5 ? "text-amber-600" : "text-foreground"}`}>
                          {c.rentalYield}%
                        </span>
                      ) : <span className="text-muted-foreground/40">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${Math.min((c.totalListings / (sorted[0]?.totalListings || 1)) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-muted-foreground text-xs">{c.totalListings}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <ScoreBadge score={c.investmentScore} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground mt-3 text-center">
          Investment Score is a composite of rental yield (60%), listing activity (20%), and relative affordability (20%).
          Data based on current active listings. Click any row to view area radar profile.{" "}
          <Link href="/contact" className="underline hover:text-foreground">Contact us</Link> for full due-diligence reports.
        </p>
      </motion.section>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="h-full flex items-center justify-center text-sm text-muted-foreground/60">
      Not enough data for this view
    </div>
  );
}
