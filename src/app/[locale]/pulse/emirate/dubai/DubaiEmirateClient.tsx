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
}

interface Props {
  marketStats: MarketStats | null;
  marketData: MarketData | null;
  areasData: { results?: { area: string; totalSales: number; avgPpsf: number }[] } | null;
  projectsData: { results?: Project[] } | null;
}

// ── Design tokens ─────────────────────────────────────────────────────────────
const GOLD = "hsl(43, 55%, 55%)";
const GREEN = "hsl(160, 55%, 42%)";
const TOOLTIP_STYLE = {
  borderRadius: 10,
  border: "1px solid hsl(40,15%,88%)",
  fontSize: 12,
  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const AED = (n: number) => {
  if (n >= 1_000_000_000) return `AED ${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `AED ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `AED ${(n / 1_000).toFixed(0)}K`;
  return `AED ${n.toLocaleString()}`;
};

// ── KPI Strip Card ────────────────────────────────────────────────────────────
function KpiCard({
  label, value, sub, icon: Icon, gold = false,
}: {
  label: string; value: string | number; sub?: string; icon: React.ElementType; gold?: boolean;
}) {
  return (
    <div
      className="rounded-xl border p-4 bg-card"
      style={{ borderColor: gold ? GOLD : undefined }}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">{label}</p>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${gold ? "bg-amber-50" : "bg-muted/50"}`}>
          <Icon className="h-3.5 w-3.5" style={{ color: gold ? GOLD : "hsl(var(--muted-foreground))" }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-foreground tabular-nums" style={{ fontVariantNumeric: "tabular-nums" }}>
        {value}
      </p>
      {sub && <p className="text-[10px] text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

// ── Why Dubai typography entry ────────────────────────────────────────────────
function WhyEntry({ num, headline, sub, source }: { num: string; headline: string; sub: string; source: string }) {
  return (
    <div className="flex gap-5">
      <span
        className="text-3xl font-bold flex-shrink-0 mt-1 tabular-nums font-mono"
        style={{ color: GOLD, fontVariantNumeric: "tabular-nums" }}
      >
        {num}
      </span>
      <div>
        <p className="text-xl font-bold text-foreground leading-snug mb-1">{headline}</p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-1.5">{sub}</p>
        <p className="text-[10px] text-muted-foreground/50 italic">{source}</p>
      </div>
    </div>
  );
}

// ── Highlight card (4-up) ─────────────────────────────────────────────────────
function HighlightCard({
  eyebrow, title, value, sub, href,
}: {
  eyebrow: string; title: string; value: string; sub?: string; href?: string;
}) {
  return (
    <div className="group relative bg-card border border-border/50 rounded-xl p-5 hover:border-accent/60 hover:-translate-y-0.5 hover:shadow-md transition-all">
      <p
        className="text-[9px] font-bold tracking-[0.3em] uppercase mb-1"
        style={{ color: GOLD }}
      >
        {eyebrow}
      </p>
      <p className="text-sm font-bold text-foreground line-clamp-1 mb-2">{title}</p>
      <p className="text-2xl font-bold text-foreground tabular-nums" style={{ fontVariantNumeric: "tabular-nums" }}>{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-1">{sub}</p>}
      {href && (
        <a
          href={href}
          className="absolute top-4 right-4 text-muted-foreground/30 group-hover:text-accent transition-colors"
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
    <a
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
    </a>
  );
}

// ── Share button (PDF disabled) ───────────────────────────────────────────────
function PdfDisabledButton({ t }: { t: ReturnType<typeof useTranslations<"dubaiEmirate">> }) {
  return (
    <span
      title={t("pdfTooltip")}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/30 text-xs font-medium text-muted-foreground/40 cursor-not-allowed select-none"
    >
      <FileDown className="h-3.5 w-3.5" />
      {t("pdfButton")}
    </span>
  );
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

  // Quick ticker movers from monthly data
  const movers = useMemo(() => {
    if (monthly.length < 2) return [];
    const prev = monthly[monthly.length - 2];
    const curr = monthly[monthly.length - 1];
    if (!prev || !curr) return [];
    // Use byArea as proxy — top 3 movers by volume
    const byArea = txData?.byArea ?? [];
    return byArea.slice(0, 3).map((row) => ({
      area: row.area,
      ppsf: row.avgPpsf,
      momPct: prev.avgPpsf > 0 ? ((curr.avgPpsf - prev.avgPpsf) / prev.avgPpsf) * 100 : 0,
      sparkline: monthly.slice(-5).map((m) => m.avgPpsf > 0 ? m.avgPpsf : 0).map((v, _, arr) => {
        const max = Math.max(...arr) || 1;
        const min = Math.min(...arr);
        return max === min ? 0.5 : (v - min) / (max - min);
      }),
    }));
  }, [txData, monthly]);

  const featuredArticle = marketData?.news?.[0] ?? null;

  // 24-mo price area chart data — from monthly (may be less than 24 months, graceful)
  const priceChartData = monthly.filter((m) => m.avgPpsf > 0);
  const volumeChartData = monthly.filter((m) => m.count > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12 sm:space-y-16 py-10 sm:py-14">

      {/* ── Share row + PDF button ─────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 -mt-4">
        <PdfDisabledButton t={t} />
        <button
          onClick={handleWhatsApp}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/50 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-accent/40 transition-all"
        >
          <Share2 className="h-3.5 w-3.5" />
          {t("shareWhatsApp")}
        </button>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/50 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-accent/40 transition-all"
        >
          {copied ? <CheckCheck className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? t("copied") : t("copyLink")}
        </button>
      </div>

      {/* ── Sentiment chip ─────────────────────────────────────────── */}
      {monthly.length >= 2 && (
        <div className="flex items-center gap-3">
          <PulseSentimentChip monthly={monthly} metric="ppsf" />
          <p className="text-xs text-muted-foreground">{t("sentimentNote")}</p>
        </div>
      )}

      {/* ── 6-KPI strip (overlaps hero with -mt-8) ────────────────── */}
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
        <div className="bg-card border border-border/50 rounded-2xl p-4 sm:p-6">
          <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-muted-foreground mb-1">{t("chartPriceLabel")}</p>
          <p className="text-base font-bold text-foreground mb-4">{t("chartPriceTitle")}</p>
          {priceChartData.length > 1 ? (
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={priceChartData}>
                  <defs>
                    <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={GOLD} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={GOLD} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(40,15%,92%)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => [`AED ${v.toLocaleString()}`, t("tooltipPpsf")]} contentStyle={TOOLTIP_STYLE} />
                  <Area dataKey="avgPpsf" stroke={GOLD} strokeWidth={2} fill="url(#priceGrad)" dot={false} activeDot={{ r: 4, fill: GOLD }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground/60">{t("chartEmpty")}</div>
          )}
        </div>

        {/* Monthly Volume Bar Chart */}
        <div className="bg-card border border-border/50 rounded-2xl p-4 sm:p-6">
          <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-muted-foreground mb-1">{t("chartVolumeLabel")}</p>
          <p className="text-base font-bold text-foreground mb-4">{t("chartVolumeTitle")}</p>
          {volumeChartData.length > 1 ? (
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeChartData} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(40,15%,92%)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => v.toLocaleString()} />
                  <Tooltip formatter={(v: number) => [v.toLocaleString(), t("tooltipCount")]} contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {volumeChartData.map((_, i) => (
                      <Cell key={i} fill={i === volumeChartData.length - 1 ? GOLD : GREEN} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground/60">{t("chartEmpty")}</div>
          )}
        </div>
      </div>

      {/* ── Community highlights — 4-up editorial cards ───────────── */}
      {(highestPrice || bestYield || fastestGrowth || bestValue) && (
        <section>
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-1" style={{ color: GOLD }}>{t("highlightsLabel")}</p>
          <h2 className="text-2xl font-bold text-foreground mb-5">{t("highlightsTitle")} <span className="italic font-light">{t("highlightsTitleItalic")}</span></h2>
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

      {/* ── Top communities leaderboard ───────────────────────────── */}
      {leaderboardRows.length > 0 && (
        <section>
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-1" style={{ color: GOLD }}>{t("leaderboardLabel")}</p>
          <h2 className="text-2xl font-bold text-foreground mb-5">{t("leaderboardTitle")} <span className="italic font-light">{t("leaderboardTitleItalic")}</span></h2>
          <CommunityLeaderboard rows={leaderboardRows} />
        </section>
      )}

      {/* ── Featured insight (magazine 60/40) ─────────────────────── */}
      {featuredArticle && (
        <section>
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-1" style={{ color: GOLD }}>{t("insightLabel")}</p>
          <h2 className="text-2xl font-bold text-foreground mb-5">{t("insightTitle")} <span className="italic font-light">{t("insightTitleItalic")}</span></h2>
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
        <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-1" style={{ color: GOLD }}>{t("whyLabel")}</p>
        <h2 className="text-2xl font-bold text-foreground mb-8">{t("whyTitle")} <span className="italic font-light">{t("whyTitleItalic")}</span></h2>
        <div className="space-y-8">
          <WhyEntry num="01." headline={t("why1Headline")} sub={t("why1Sub")} source={t("why1Source")} />
          <WhyEntry num="02." headline={t("why2Headline")} sub={t("why2Sub")} source={t("why2Source")} />
          <WhyEntry num="03." headline={t("why3Headline")} sub={t("why3Sub")} source={t("why3Source")} />
          <WhyEntry num="04." headline={t("why4Headline")} sub={t("why4Sub")} source={t("why4Source")} />
        </div>
      </section>

      {/* ── Featured community cards carousel ────────────────────── */}
      <section>
        <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-1" style={{ color: GOLD }}>{t("communitiesLabel")}</p>
        <h2 className="text-2xl font-bold text-foreground mb-5">{t("communitiesTitle")} <span className="italic font-light">{t("communitiesTitleItalic")}</span></h2>
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
      <section className="bg-card border border-border/50 rounded-2xl p-6 sm:p-8">
        <WeeklySubscribeForm
          source="emirate-dubai-page"
          variant="card"
          defaultAreas={["dubai-marina", "downtown-dubai", "palm-jumeirah"]}
        />
      </section>

      {/* Attribution */}
      <p className="text-[10px] text-muted-foreground text-center pb-2">
        {t("attribution")}
      </p>
    </div>
  );
}
