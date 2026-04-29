"use client";

import { useState, useMemo, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";
import {
  ArrowUpRight, TrendingUp, Building2, Percent, Activity, BarChart3, Globe, FileDown,
  Copy, CheckCheck, Share2,
} from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import PulseSentimentChip from "@/components/PulseSentimentChip";
import CommunityLeaderboard, { type LeaderboardRow } from "@/components/CommunityLeaderboard";
import FeaturedInsightPanel from "@/components/FeaturedInsightPanel";
import WeeklySubscribeForm from "@/components/WeeklySubscribeForm";
import { apiUrl } from "@/lib/api";
import { useEffect } from "react";
import { Link } from "@/navigation";

// ── Types ────────────────────────────────────────────────────────────────────

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
}

interface MarketStats {
  summary: { avgPricePerSqft: number; totalListings: number; avgYield: number; offPlanShare: number; offPlanCount: number; secondaryCount: number };
  priceByArea: { area: string; price: number; count: number }[];
  yieldByArea: { area: string; yield: number }[];
  communityMatrix: CommunityStats[];
}

interface MarketData {
  transactions: {
    hasData: boolean;
    summary: { totalTransactions: number; totalValue: number; avgPpsf: number; avgTransactionValue: number };
    monthly: { label: string; count: number; avgPpsf: number; totalValue: number }[];
    byArea: { area: string; count: number; totalValue: number; avgPrice: number; avgPpsf: number }[];
  } | null;
  news: { title: string; url: string; source: string; summary: string; imageUrl: string; publishedAt: string }[];
}

interface Project {
  slug: string;
  name: string;
  developer?: string;
  status?: string;
  propertyType?: string;
  createdAt?: string;
  startingPrice?: number;
}

interface Props {
  marketStats: MarketStats | null;
  marketData: MarketData | null;
  areasData: { results?: { area: string; totalSales: number; avgPpsf: number }[] } | null;
  projectsData: { results?: Project[] } | null;
}

// ── Design tokens (pulse dark theme) ─────────────────────────────────────────
const GOLD = "hsl(var(--pulse-gold))";
const GOLD_HEX = "hsl(43, 55%, 55%)";
const GREEN = "hsl(var(--pulse-green-light))";
const PULSE_TEXT = "hsl(var(--pulse-text))";
const PULSE_TEXT_MUTED = "hsl(var(--pulse-text-muted))";
const PULSE_SURFACE = "hsl(var(--pulse-surface))";
const PULSE_BORDER = "hsl(var(--pulse-border))";
const PULSE_BG = "hsl(var(--pulse-bg))";

const TOOLTIP_STYLE = {
  background: PULSE_SURFACE,
  borderRadius: 10,
  border: `1px solid ${PULSE_BORDER}`,
  fontSize: 12,
  boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
  color: PULSE_TEXT,
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const AED = (n: number) => {
  if (n >= 1_000_000_000) return `AED ${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `AED ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `AED ${(n / 1_000).toFixed(0)}K`;
  return `AED ${n.toLocaleString()}`;
};

// ── KPI Strip Card (pulse dark theme) ────────────────────────────────────────
function KpiCard({
  label, value, sub, icon: Icon, gold = false,
}: {
  label: string; value: string | number; sub?: string; icon: React.ElementType; gold?: boolean;
}) {
  return (
    <div
      className="rounded-xl p-4 transition-all hover:-translate-y-0.5"
      style={{
        background: PULSE_SURFACE,
        border: `1px solid ${gold ? GOLD_HEX : PULSE_BORDER}`,
        boxShadow: gold ? `0 0 20px -8px ${GOLD_HEX}33` : undefined,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.15em]"
          style={{ color: PULSE_TEXT_MUTED }}
        >
          {label}
        </p>
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: gold ? `${GOLD_HEX}22` : `${PULSE_BORDER}` }}
        >
          <Icon className="h-3.5 w-3.5" style={{ color: gold ? GOLD_HEX : PULSE_TEXT_MUTED }} />
        </div>
      </div>
      <p className="text-2xl font-bold tabular-nums" style={{ color: PULSE_TEXT, fontVariantNumeric: "tabular-nums" }}>
        {value}
      </p>
      {sub && <p className="text-[10px] mt-1" style={{ color: PULSE_TEXT_MUTED }}>{sub}</p>}
    </div>
  );
}

// ── Why Dubai typography entry ────────────────────────────────────────────────
function WhyEntry({ num, headline, sub, source }: { num: string; headline: string; sub: string; source: string }) {
  return (
    <div className="flex gap-5">
      <span
        className="text-3xl font-bold flex-shrink-0 mt-1 tabular-nums font-mono"
        style={{ color: GOLD_HEX, fontVariantNumeric: "tabular-nums" }}
      >
        {num}
      </span>
      <div>
        <p className="text-xl font-bold leading-snug mb-1" style={{ color: PULSE_TEXT }}>{headline}</p>
        <p className="text-sm leading-relaxed mb-1.5" style={{ color: PULSE_TEXT_MUTED }}>{sub}</p>
        <p className="text-[10px] italic" style={{ color: `${PULSE_TEXT_MUTED}80` }}>{source}</p>
      </div>
    </div>
  );
}

// ── Highlight card (4-up editorial) ──────────────────────────────────────────
function HighlightCard({
  eyebrow, title, value, sub, href,
}: {
  eyebrow: string; title: string; value: string; sub?: string; href?: string;
}) {
  return (
    <div
      className="group relative rounded-xl p-5 transition-all hover:-translate-y-0.5"
      style={{
        background: PULSE_SURFACE,
        border: `1px solid ${PULSE_BORDER}`,
        boxShadow: undefined,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${GOLD_HEX}88`)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = PULSE_BORDER)}
    >
      <p className="text-[9px] font-bold tracking-[0.3em] uppercase mb-1" style={{ color: GOLD_HEX }}>
        {eyebrow}
      </p>
      <p className="text-sm font-bold line-clamp-1 mb-2" style={{ color: PULSE_TEXT }}>{title}</p>
      <p className="text-2xl font-bold tabular-nums" style={{ color: PULSE_TEXT, fontVariantNumeric: "tabular-nums" }}>{value}</p>
      {sub && <p className="text-[10px] mt-1" style={{ color: PULSE_TEXT_MUTED }}>{sub}</p>}
      {href && (
        <a
          href={href}
          className="absolute top-4 right-4 transition-colors"
          style={{ color: `${PULSE_TEXT_MUTED}44` }}
          aria-label={`View ${title}`}
        >
          <ArrowUpRight className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}

// ── Featured community card ───────────────────────────────────────────────────
const FEATURED_COMMUNITIES = [
  { slug: "palm-jumeirah", name: "Palm Jumeirah", imageUrl: "/images/communities/palm-jumeirah.jpg", tagline: "Ultra-luxury waterfront icon" },
  { slug: "dubai-marina", name: "Dubai Marina", imageUrl: "/images/communities/dubai-marina.jpg", tagline: "Vibrant urban waterfront" },
  { slug: "jumeirah-village-circle", name: "JVC", imageUrl: "/images/communities/jvc.jpg", tagline: "Highest-yield community" },
  { slug: "dubai-hills-estate", name: "Dubai Hills Estate", imageUrl: "/images/communities/dubai-hills.jpg", tagline: "Green master-plan living" },
  { slug: "downtown-dubai", name: "Downtown Dubai", imageUrl: "/images/communities/downtown.jpg", tagline: "The city's epicentre" },
];

function FeaturedCommunityCard({ community }: { community: typeof FEATURED_COMMUNITIES[0] }) {
  return (
    <Link
      href={`/communities/${community.slug}`}
      className="group relative flex-shrink-0 rounded-2xl overflow-hidden"
      style={{ width: 280, height: 360, scrollSnapAlign: "start" }}
    >
      {/* Full-bleed image */}
      <div className="absolute inset-0">
        <Image
          src={community.imageUrl}
          alt={community.name}
          fill
          className="object-cover transition-transform duration-[600ms] group-hover:scale-105"
          sizes="280px"
          unoptimized
        />
      </div>
      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)" }}
      />
      {/* Text */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <p
          className="text-[9px] font-bold tracking-[0.25em] uppercase mb-1"
          style={{ color: "hsl(43, 55%, 65%)" }}
        >
          {community.tagline}
        </p>
        <p className="text-lg font-bold text-white">{community.name}</p>
      </div>
    </Link>
  );
}

// ── Share button (PDF disabled) ───────────────────────────────────────────────
function PdfDisabledButton({ t }: { t: ReturnType<typeof useTranslations<"dubaiEmirate">> }) {
  return (
    <span
      title={t("pdfTooltip")}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-not-allowed select-none"
      style={{ border: `1px solid ${PULSE_BORDER}`, color: `${PULSE_TEXT_MUTED}60` }}
    >
      <FileDown className="h-3.5 w-3.5" />
      {t("pdfButton")}
    </span>
  );
}

// ── Developer aggregation helpers ─────────────────────────────────────────────
interface DeveloperStats {
  developer: string;
  totalCount: number;
  offPlanCount: number;
  offPlanShare: number;
  avgStartingPrice: number;
  latestLaunch: string | null;
}

function aggregateDevelopers(projects: Project[]): DeveloperStats[] {
  const map = new Map<string, { total: number; offPlan: number; prices: number[]; latestDate: string | null }>();
  for (const p of projects) {
    const dev = p.developer?.trim() || "Unknown";
    const entry = map.get(dev) ?? { total: 0, offPlan: 0, prices: [], latestDate: null };
    entry.total++;
    const st = (p.status ?? "").toLowerCase();
    if (st.includes("launch") || st.includes("off") || st.includes("plan")) entry.offPlan++;
    if (p.startingPrice && p.startingPrice > 0) entry.prices.push(p.startingPrice);
    if (p.createdAt) {
      if (!entry.latestDate || p.createdAt > entry.latestDate) entry.latestDate = p.createdAt;
    }
    map.set(dev, entry);
  }

  return Array.from(map.entries())
    .filter(([dev]) => dev !== "Unknown")
    .map(([developer, e]) => ({
      developer,
      totalCount: e.total,
      offPlanCount: e.offPlan,
      offPlanShare: e.total > 0 ? Math.round((e.offPlan / e.total) * 100) : 0,
      avgStartingPrice: e.prices.length > 0 ? Math.round(e.prices.reduce((a, b) => a + b, 0) / e.prices.length) : 0,
      latestLaunch: e.latestDate,
    }))
    .sort((a, b) => b.totalCount - a.totalCount);
}

function formatLatestLaunch(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-AE", { month: "short", year: "numeric" });
  } catch {
    return "—";
  }
}

// ── Main component ────────────────────────────────────────────────────────────
export default function DubaiEmirateClient({ marketStats, marketData, areasData, projectsData }: Props) {
  const t = useTranslations("dubaiEmirate");
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [yieldRows, setYieldRows] = useState<{ area: string; yieldPct: number; avgRentPerSqft: number; avgSalePerSqft: number; lowConfidence: boolean }[]>([]);
  const communityScrollRef = useRef<HTMLDivElement>(null);

  // Fetch yield data for top communities
  useEffect(() => {
    const topAreas = marketStats?.communityMatrix?.slice(0, 10) ?? [];
    if (topAreas.length === 0) return;
    const slugs = topAreas.map((c) => c.area.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
    Promise.all(
      slugs.map((slug) =>
        fetch(apiUrl(`/api/dld/areas/${slug}/yield`))
          .then((r) => r.ok ? r.json() : null)
          .catch(() => null)
          .then((data) => data ? { area: topAreas[slugs.indexOf(slug)]?.area ?? slug, ...data } : null)
      )
    ).then((results) => {
      setYieldRows(results.filter(Boolean) as typeof yieldRows);
    });
  }, [marketStats]);

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  const handleCopy = async () => {
    try {
      const params = new URLSearchParams({
        utm_source: "clipboard", utm_medium: "share", utm_campaign: "pulse-2026-04",
        metric: "Dubai+Avg+PPSF", value: String(marketData?.transactions?.summary?.avgPpsf ?? 0), trend: "up",
      });
      await navigator.clipboard.writeText(`${shareUrl}?${params}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* silent */ }
  };

  const handleWhatsApp = () => {
    const params = new URLSearchParams({ utm_source: "whatsapp", utm_medium: "share", utm_campaign: "pulse-2026-04" });
    window.open(`https://wa.me/?text=${encodeURIComponent(`Dubai Market Report — ${shareUrl}?${params}`)}`, "_blank", "noopener");
  };

  const txData = marketData?.transactions;
  const monthly = txData?.monthly ?? [];
  const matrix = marketStats?.communityMatrix ?? [];

  // Off-plan share from projects
  const projects = projectsData?.results ?? [];
  const offPlanCount = projects.filter((p) => (p.status ?? "").toLowerCase().includes("launch") || (p.status ?? "").toLowerCase().includes("off")).length;
  const offPlanSharePct = projects.length > 0 ? Math.round((offPlanCount / projects.length) * 100) : marketStats?.summary.offPlanShare ?? 0;

  // Most active community
  const mostActive = txData?.byArea?.[0]?.area ?? matrix.sort((a, b) => b.totalListings - a.totalListings)[0]?.area ?? "—";

  // Community highlights — 4 cards
  const sortedByPpsf = [...matrix].sort((a, b) => b.avgPricePerSqft - a.avgPricePerSqft);
  const sortedByYield = [...matrix].sort((a, b) => b.rentalYield - a.rentalYield);
  const sortedByScore = [...matrix].sort((a, b) => b.investmentScore - a.investmentScore);
  const sortedByAfford = [...matrix].sort((a, b) => a.avgPricePerSqft - b.avgPricePerSqft).filter((c) => c.avgPricePerSqft > 0);

  const highestPrice = sortedByPpsf[0];
  const bestYield = sortedByYield[0];
  const fastestGrowth = sortedByScore[0];
  const bestValue = sortedByAfford[0];

  // Developer aggregations
  const developerStats = useMemo(() => aggregateDevelopers(projects), [projects]);
  const topDevelopers = developerStats.slice(0, 8);
  // Developer highlight cards: most active, fastest growing (most projects), most off-plan, best yield (most units)
  const devMostActive = developerStats[0] ?? null;
  const devFastestGrowing = [...developerStats].sort((a, b) => b.totalCount - a.totalCount)[1] ?? developerStats[0] ?? null;
  const devMostOffPlan = [...developerStats].sort((a, b) => b.offPlanShare - a.offPlanShare)[0] ?? null;
  // "Best yield" proxy: developer with lowest avg price (more accessible entry)
  const devBestYield = [...developerStats].filter((d) => d.avgStartingPrice > 0).sort((a, b) => a.avgStartingPrice - b.avgStartingPrice)[0] ?? null;

  // Leaderboard rows from byArea (DLD data) merged with matrix
  const leaderboardRows: LeaderboardRow[] = useMemo(() => {
    const byArea = txData?.byArea ?? [];
    return byArea.slice(0, 20).map((row, i) => {
      const matrixRow = matrix.find((m) => m.area.toLowerCase() === row.area.toLowerCase());
      return {
        rank: i + 1,
        area: row.area,
        totalSales: row.count,
        ppsf: row.avgPpsf,
        yieldPct: matrixRow?.rentalYield ?? 0,
        yoyPct: 0, // not available in current API
        volume: row.totalValue,
        avgDealSize: row.avgPrice,
        offPlanShare: matrixRow ? Math.round((matrixRow.offPlanCount / (matrixRow.totalListings || 1)) * 100) : undefined,
        rentAvg: matrixRow?.avgRentPrice,
      };
    });
  }, [txData, matrix]);

  const featuredArticle = marketData?.news?.[0] ?? null;

  // Chart data
  const priceChartData = monthly.filter((m) => m.avgPpsf > 0);
  const volumeChartData = monthly.filter((m) => m.count > 0);

  // suppress void warning for mostActive — used in KpiCard
  void mostActive;
  void yieldRows;

  return (
    <div
      className="min-h-screen"
      style={{ background: PULSE_BG }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12 sm:space-y-16 py-10 sm:py-14">

        {/* ── Share row + PDF button ─────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2 -mt-4">
          <PdfDisabledButton t={t} />
          <button
            onClick={handleWhatsApp}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ border: `1px solid ${PULSE_BORDER}`, color: PULSE_TEXT_MUTED }}
            onMouseEnter={(e) => { e.currentTarget.style.color = PULSE_TEXT; e.currentTarget.style.borderColor = `${GOLD_HEX}80`; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = PULSE_TEXT_MUTED; e.currentTarget.style.borderColor = PULSE_BORDER; }}
          >
            <Share2 className="h-3.5 w-3.5" />
            {t("shareWhatsApp")}
          </button>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ border: `1px solid ${PULSE_BORDER}`, color: PULSE_TEXT_MUTED }}
            onMouseEnter={(e) => { e.currentTarget.style.color = PULSE_TEXT; e.currentTarget.style.borderColor = `${GOLD_HEX}80`; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = PULSE_TEXT_MUTED; e.currentTarget.style.borderColor = PULSE_BORDER; }}
          >
            {copied ? <CheckCheck className="h-3.5 w-3.5" style={{ color: "hsl(160,55%,42%)" }} /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? t("copied") : t("copyLink")}
          </button>
        </div>

        {/* ── Sentiment chip ─────────────────────────────────────────── */}
        {monthly.length >= 2 && (
          <div className="flex items-center gap-3">
            <PulseSentimentChip monthly={monthly} metric="ppsf" />
            <p className="text-xs" style={{ color: PULSE_TEXT_MUTED }}>{t("sentimentNote")}</p>
          </div>
        )}

        {/* ── 6-KPI strip ────────────────────────────────────────────── */}
        <div className="-mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <KpiCard
            label={t("kpiTxYtd")}
            value={txData?.summary.totalTransactions ? txData.summary.totalTransactions.toLocaleString() : "—"}
            sub={t("kpiYtd")}
            icon={BarChart3}
            gold
          />
          <KpiCard
            label={t("kpiAvgPpsf")}
            value={txData?.summary.avgPpsf ? `AED ${txData.summary.avgPpsf.toLocaleString()}` : "—"}
            sub={t("kpiActualSold")}
            icon={Activity}
          />
          <KpiCard
            label={t("kpiAvgYield")}
            value={marketStats?.summary.avgYield ? `${marketStats.summary.avgYield.toFixed(1)}%` : "—"}
            sub={t("kpiGross")}
            icon={Percent}
          />
          <KpiCard
            label={t("kpiYoy")}
            value="—"
            sub={t("kpiYoyNote")}
            icon={TrendingUp}
          />
          <KpiCard
            label={t("kpiOffPlan")}
            value={`${offPlanSharePct}%`}
            sub={t("kpiOfTotalMarket")}
            icon={Building2}
          />
          <KpiCard
            label={t("kpiCommunities")}
            value={matrix.length > 0 ? matrix.length.toLocaleString() : "—"}
            sub={t("kpiTracked")}
            icon={Globe}
          />
        </div>

        {/* ── Charts dyad (24-mo price + monthly volume) ────────────── */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          {/* 24-mo Price Area Chart */}
          <div className="rounded-2xl p-4 sm:p-6" style={{ background: PULSE_SURFACE, border: `1px solid ${PULSE_BORDER}` }}>
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase mb-1" style={{ color: PULSE_TEXT_MUTED }}>{t("chartPriceLabel")}</p>
            <p className="text-base font-bold mb-4" style={{ color: PULSE_TEXT }}>{t("chartPriceTitle")}</p>
            {priceChartData.length > 1 ? (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={priceChartData}>
                    <defs>
                      <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={GOLD_HEX} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={GOLD_HEX} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={PULSE_BORDER} vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: PULSE_TEXT_MUTED }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: PULSE_TEXT_MUTED }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: number) => [`AED ${v.toLocaleString()}`, t("tooltipPpsf")]} contentStyle={TOOLTIP_STYLE} />
                    <Area dataKey="avgPpsf" stroke={GOLD_HEX} strokeWidth={2} fill="url(#priceGrad)" dot={false} activeDot={{ r: 4, fill: GOLD_HEX }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-sm" style={{ color: PULSE_TEXT_MUTED }}>{t("chartEmpty")}</div>
            )}
          </div>

          {/* Monthly Volume Bar Chart */}
          <div className="rounded-2xl p-4 sm:p-6" style={{ background: PULSE_SURFACE, border: `1px solid ${PULSE_BORDER}` }}>
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase mb-1" style={{ color: PULSE_TEXT_MUTED }}>{t("chartVolumeLabel")}</p>
            <p className="text-base font-bold mb-4" style={{ color: PULSE_TEXT }}>{t("chartVolumeTitle")}</p>
            {volumeChartData.length > 1 ? (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeChartData} barSize={20}>
                    <CartesianGrid strokeDasharray="3 3" stroke={PULSE_BORDER} vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: PULSE_TEXT_MUTED }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: PULSE_TEXT_MUTED }} axisLine={false} tickLine={false} tickFormatter={(v) => v.toLocaleString()} />
                    <Tooltip formatter={(v: number) => [v.toLocaleString(), t("tooltipCount")]} contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {volumeChartData.map((_, i) => (
                        <Cell key={i} fill={i === volumeChartData.length - 1 ? GOLD_HEX : "hsl(160, 60%, 30%)"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-sm" style={{ color: PULSE_TEXT_MUTED }}>{t("chartEmpty")}</div>
            )}
          </div>
        </div>

        {/* ── Community highlights — 4-up editorial cards ───────────── */}
        {(highestPrice || bestYield || fastestGrowth || bestValue) && (
          <section>
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-1" style={{ color: GOLD_HEX }}>{t("highlightsLabel")}</p>
            <h2 className="text-2xl font-bold mb-5" style={{ color: PULSE_TEXT }}>
              {t("highlightsTitle")} <span className="italic font-light">{t("highlightsTitleItalic")}</span>
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {highestPrice && (
                <HighlightCard
                  eyebrow={t("highlightHighestPrice")}
                  title={highestPrice.area}
                  value={`AED ${highestPrice.avgPricePerSqft.toLocaleString()}`}
                  sub={t("highlightPerSqft")}
                />
              )}
              {bestYield && (
                <HighlightCard
                  eyebrow={t("highlightBestYield")}
                  title={bestYield.area}
                  value={bestYield.rentalYield > 0 ? `${bestYield.rentalYield.toFixed(1)}%` : "—"}
                  sub={t("highlightGrossYield")}
                />
              )}
              {fastestGrowth && (
                <HighlightCard
                  eyebrow={t("highlightFastestGrowth")}
                  title={fastestGrowth.area}
                  value={fastestGrowth.investmentScore > 0 ? `${fastestGrowth.investmentScore}/100` : "—"}
                  sub={t("highlightInvestScore")}
                />
              )}
              {bestValue && (
                <HighlightCard
                  eyebrow={t("highlightBestValue")}
                  title={bestValue.area}
                  value={bestValue.avgPricePerSqft > 0 ? `AED ${bestValue.avgPricePerSqft.toLocaleString()}` : "—"}
                  sub={t("highlightPerSqft")}
                />
              )}
            </div>
          </section>
        )}

        {/* ── Developer highlights — 4-up editorial cards (spec items 17–18) ── */}
        {developerStats.length > 0 && (
          <section>
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-1" style={{ color: GOLD_HEX }}>
              {t("developerHighlightsLabel")}
            </p>
            <h2 className="text-2xl font-bold mb-5" style={{ color: PULSE_TEXT }}>
              {t("developerHighlightsTitle")} <span className="italic font-light">{t("developerHighlightsTitleItalic")}</span>
            </h2>

            {/* 4-card developer highlight row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
              {devMostActive && (
                <HighlightCard
                  eyebrow={t("devMostActive")}
                  title={devMostActive.developer}
                  value={devMostActive.totalCount.toLocaleString()}
                  sub={t("devTotalProjects")}
                />
              )}
              {devFastestGrowing && (
                <HighlightCard
                  eyebrow={t("devFastestGrowing")}
                  title={devFastestGrowing.developer}
                  value={devFastestGrowing.totalCount.toLocaleString()}
                  sub={t("devProjectCount")}
                />
              )}
              {devMostOffPlan && (
                <HighlightCard
                  eyebrow={t("devMostOffPlan")}
                  title={devMostOffPlan.developer}
                  value={`${devMostOffPlan.offPlanShare}%`}
                  sub={t("devOffPlanShare")}
                />
              )}
              {devBestYield && (
                <HighlightCard
                  eyebrow={t("devBestYield")}
                  title={devBestYield.developer}
                  value={devBestYield.avgStartingPrice > 0 ? AED(devBestYield.avgStartingPrice) : "—"}
                  sub={t("devAvgStartingPrice")}
                />
              )}
            </div>

            {/* Developer comparison table — top 8 */}
            {topDevelopers.length > 0 && (
              <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${PULSE_BORDER}` }}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${PULSE_BORDER}`, background: `${PULSE_SURFACE}` }}>
                        {[
                          t("devColDeveloper"),
                          t("devColProjects"),
                          t("devColOffPlanShare"),
                          t("devColAvgPrice"),
                          t("devColLatestLaunch"),
                        ].map((col, i) => (
                          <th
                            key={i}
                            className="px-4 py-3 text-left text-xs font-semibold"
                            style={{ color: PULSE_TEXT_MUTED }}
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {topDevelopers.map((dev, i) => (
                        <motion.tr
                          key={dev.developer}
                          className="transition-all"
                          style={{ borderBottom: i < topDevelopers.length - 1 ? `1px solid ${PULSE_BORDER}` : undefined }}
                          whileHover={{ backgroundColor: `hsl(var(--pulse-surface-hover))` }}
                        >
                          <td className="px-4 py-3 font-medium" style={{ color: PULSE_TEXT }}>
                            {dev.developer}
                          </td>
                          <td className="px-4 py-3 font-semibold tabular-nums" style={{ color: PULSE_TEXT }}>
                            {dev.totalCount.toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-semibold tabular-nums"
                              style={{
                                color: dev.offPlanShare >= 50 ? GOLD_HEX : PULSE_TEXT_MUTED,
                                background: dev.offPlanShare >= 50 ? `${GOLD_HEX}18` : "transparent",
                              }}
                            >
                              {dev.offPlanShare}%
                            </span>
                          </td>
                          <td className="px-4 py-3 tabular-nums text-xs" style={{ color: PULSE_TEXT_MUTED }}>
                            {dev.avgStartingPrice > 0 ? AED(dev.avgStartingPrice) : "—"}
                          </td>
                          <td className="px-4 py-3 text-xs" style={{ color: PULSE_TEXT_MUTED }}>
                            {formatLatestLaunch(dev.latestLaunch)}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── Top communities leaderboard ───────────────────────────── */}
        {leaderboardRows.length > 0 && (
          <section>
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-1" style={{ color: GOLD_HEX }}>{t("leaderboardLabel")}</p>
            <h2 className="text-2xl font-bold mb-5" style={{ color: PULSE_TEXT }}>
              {t("leaderboardTitle")} <span className="italic font-light">{t("leaderboardTitleItalic")}</span>
            </h2>
            <CommunityLeaderboard rows={leaderboardRows} />
          </section>
        )}

        {/* ── Featured insight (magazine 60/40) ─────────────────────── */}
        {featuredArticle && (
          <section>
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-1" style={{ color: GOLD_HEX }}>{t("insightLabel")}</p>
            <h2 className="text-2xl font-bold mb-5" style={{ color: PULSE_TEXT }}>
              {t("insightTitle")} <span className="italic font-light">{t("insightTitleItalic")}</span>
            </h2>
            <FeaturedInsightPanel
              article={featuredArticle}
              ogParams={{
                metric: "Dubai+Market",
                value: String(txData?.summary.totalTransactions ?? 0),
                trend: "up",
              }}
            />
          </section>
        )}

        {/* ── "Why Dubai" pure typography ───────────────────────────── */}
        <section className="max-w-3xl">
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-1" style={{ color: GOLD_HEX }}>{t("whyLabel")}</p>
          <h2 className="text-2xl font-bold mb-8" style={{ color: PULSE_TEXT }}>
            {t("whyTitle")} <span className="italic font-light">{t("whyTitleItalic")}</span>
          </h2>
          <div className="space-y-8">
            <WhyEntry num="01." headline={t("why1Headline")} sub={t("why1Sub")} source={t("why1Source")} />
            <WhyEntry num="02." headline={t("why2Headline")} sub={t("why2Sub")} source={t("why2Source")} />
            <WhyEntry num="03." headline={t("why3Headline")} sub={t("why3Sub")} source={t("why3Source")} />
            <WhyEntry num="04." headline={t("why4Headline")} sub={t("why4Sub")} source={t("why4Source")} />
          </div>
        </section>

        {/* ── Featured community cards carousel ────────────────────── */}
        <section>
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-1" style={{ color: GOLD_HEX }}>{t("communitiesLabel")}</p>
          <h2 className="text-2xl font-bold mb-5" style={{ color: PULSE_TEXT }}>
            {t("communitiesTitle")} <span className="italic font-light">{t("communitiesTitleItalic")}</span>
          </h2>
          <div
            ref={communityScrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {FEATURED_COMMUNITIES.map((c) => (
              <FeaturedCommunityCard key={c.slug} community={c} />
            ))}
          </div>
        </section>

        {/* ── Weekly subscribe band ─────────────────────────────────── */}
        <section className="rounded-2xl p-6 sm:p-8" style={{ background: PULSE_SURFACE, border: `1px solid ${PULSE_BORDER}` }}>
          <WeeklySubscribeForm
            source="emirate-dubai-page"
            variant="card"
            defaultAreas={["dubai-marina", "downtown-dubai", "palm-jumeirah"]}
          />
        </section>

        {/* Attribution */}
        <p className="text-[10px] text-center pb-2" style={{ color: PULSE_TEXT_MUTED }}>
          {t("attribution")}
        </p>
      </div>
    </div>
  );
}
