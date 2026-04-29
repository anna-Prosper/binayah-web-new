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

// ── Framer Motion variants ────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
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
        boxShadow: gold ? `0 0 24px -8px ${GOLD_HEX}44` : undefined,
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
      <p className="text-2xl font-bold tabular-nums" style={{ color: gold ? GOLD_HEX : PULSE_TEXT, fontVariantNumeric: "tabular-nums" }}>
        {value}
      </p>
      {sub && <p className="text-[10px] mt-1" style={{ color: PULSE_TEXT_MUTED }}>{sub}</p>}
    </div>
  );
}

// ── Section heading helper ────────────────────────────────────────────────────
function SectionHeading({
  eyebrow, title, italic,
}: { eyebrow: string; title: string; italic?: string }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-5 h-px" style={{ background: GOLD_HEX }} />
        <p className="text-[10px] font-bold tracking-[0.3em] uppercase" style={{ color: GOLD_HEX }}>
          {eyebrow}
        </p>
      </div>
      <h2 className="text-2xl font-bold" style={{ color: PULSE_TEXT }}>
        {title}{italic && <span className="italic font-light"> {italic}</span>}
      </h2>
    </div>
  );
}

// ── Lead CTA strip ────────────────────────────────────────────────────────────
function LeadCTAStrip({ t }: { t: ReturnType<typeof useTranslations<"dubaiEmirate">> }) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6"
      style={{
        background: "linear-gradient(135deg, #0B3D2E 0%, #1A5A3E 100%)",
        border: "1px solid rgba(212, 168, 71, 0.35)",
      }}
    >
      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, #D4A847 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="relative">
        <p
          className="text-[10px] font-bold tracking-[0.4em] uppercase mb-2"
          style={{ color: "#D4A847" }}
        >
          {t("ctaEyebrow")}
        </p>
        <p className="text-2xl sm:text-3xl font-bold text-white leading-tight">
          {t("ctaTitle")}
        </p>
        <p className="text-white/65 text-sm mt-2 max-w-sm">
          {t("ctaLede")}
        </p>
      </div>
      <div className="relative flex flex-col sm:flex-row gap-3 flex-shrink-0">
        <Link
          href="/buy"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
          style={{ background: "#D4A847", color: "#0B3D2E" }}
        >
          {t("ctaBrowse")} <ArrowUpRight className="h-4 w-4" />
        </Link>
        <Link
          href="/off-plan"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:bg-white/10 border"
          style={{ borderColor: "rgba(212, 168, 71, 0.4)", color: "rgba(255,255,255,0.85)" }}
        >
          {t("ctaOffPlan")}
        </Link>
      </div>
    </div>
  );
}

// ── Why Dubai typography entry ────────────────────────────────────────────────
function WhyEntry({ num, headline, sub, source }: { num: string; headline: string; sub: string; source: string }) {
  return (
    <div
      className="flex gap-5 pl-5"
      style={{ borderLeft: `2px solid ${GOLD_HEX}33` }}
    >
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
const FEATURED_HERO = "/assets/dubai-hero.webp";
const FEATURED_COMMUNITIES = [
  { slug: "palm-jumeirah", name: "Palm Jumeirah", imageUrl: FEATURED_HERO, tagline: "Ultra-luxury waterfront icon", tint: "rgba(10, 30, 80, 0.45)" },
  { slug: "dubai-marina", name: "Dubai Marina", imageUrl: FEATURED_HERO, tagline: "Vibrant urban waterfront", tint: "rgba(11, 50, 40, 0.35)" },
  { slug: "jumeirah-village-circle", name: "JVC", imageUrl: FEATURED_HERO, tagline: "Highest-yield community", tint: "rgba(80, 40, 10, 0.45)" },
  { slug: "dubai-hills-estate", name: "Dubai Hills Estate", imageUrl: FEATURED_HERO, tagline: "Green master-plan living", tint: "rgba(10, 60, 20, 0.45)" },
  { slug: "downtown-dubai", name: "Downtown Dubai", imageUrl: FEATURED_HERO, tagline: "The city's epicentre", tint: "rgba(60, 20, 80, 0.45)" },
];

function FeaturedCommunityCard({ community, t }: { community: typeof FEATURED_COMMUNITIES[0]; t: ReturnType<typeof useTranslations<"dubaiEmirate">> }) {
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
      {/* Community color tint (differentiates cards visually) */}
      <div
        className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-60"
        style={{ background: community.tint }}
      />
      {/* Dark gradient overlay for legible text */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)" }}
      />
      {/* Gold top rule that appears on hover */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: "#D4A847" }}
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
        <p className="text-xs text-white/50 mt-0.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {t("communityViewLabel")} <ArrowUpRight className="h-3 w-3" />
        </p>
      </div>
    </Link>
  );
}

// ── Save as PDF button ────────────────────────────────────────────────────────
function PdfButton({ t }: { t: ReturnType<typeof useTranslations<"dubaiEmirate">> }) {
  return (
    <a
      href="/api/pdf/pulse"
      download
      title={t("pdfTooltip")}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
      style={{ border: `1px solid ${PULSE_BORDER}`, color: PULSE_TEXT_MUTED }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "hsl(43, 55%, 55%)";
        e.currentTarget.style.borderColor = "hsl(43, 55%, 55%, 0.5)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = PULSE_TEXT_MUTED;
        e.currentTarget.style.borderColor = PULSE_BORDER;
      }}
    >
      <FileDown className="h-3.5 w-3.5" />
      {t("pdfButton")}
    </a>
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

  useEffect(() => {
    const ALIAS: Record<string, string | null> = {
      "JBR": "jumeirah-beach-residence",
      "JVC": "jumeirah-village-circle",
      "JVT": "jumeirah-village-triangle",
      "JLT": "jumeirah-lakes-towers",
      "Downtown": null,
      "Downtown Dubai": null,
      "Creek Harbour": "dubai-creek-harbour",
      "MBR City": null,
    };
    function deriveSlug(area: string): string | null {
      if (area in ALIAS) return ALIAS[area];
      return area.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    }

    const topAreas = marketStats?.communityMatrix?.slice(0, 10) ?? [];
    if (topAreas.length === 0) return;

    const queries = topAreas
      .map((c) => ({ area: c.area, slug: deriveSlug(c.area) }))
      .filter((q): q is { area: string; slug: string } => !!q.slug);

    Promise.all(
      queries.map(({ area, slug }) =>
        fetch(apiUrl(`/api/dld/areas/${slug}/yield`))
          .then((r) => r.ok ? r.json() : null)
          .catch(() => null)
          .then((data) => data ? { area, ...data } : null)
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
        utm_source: "clipboard", utm_medium: "share", utm_campaign: "pulse-emirate-dubai",
        metric: "Dubai+Avg+PPSF", value: String(marketData?.transactions?.summary?.avgPpsf ?? 0), trend: "up",
      });
      await navigator.clipboard.writeText(`${shareUrl}?${params}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* silent */ }
  };

  const handleWhatsApp = () => {
    const params = new URLSearchParams({ utm_source: "whatsapp", utm_medium: "share", utm_campaign: "pulse-emirate-dubai" });
    window.open(`https://wa.me/?text=${encodeURIComponent(`Dubai Market Report — ${shareUrl}?${params}`)}`, "_blank", "noopener");
  };

  const txData = marketData?.transactions;
  const monthly = txData?.monthly ?? [];
  const matrix = marketStats?.communityMatrix ?? [];

  const projects = projectsData?.results ?? [];
  const offPlanCount = projects.filter((p) => (p.status ?? "").toLowerCase().includes("launch") || (p.status ?? "").toLowerCase().includes("off")).length;
  const offPlanSharePct = projects.length > 0 ? Math.round((offPlanCount / projects.length) * 100) : marketStats?.summary.offPlanShare ?? 0;

  const mostActive = txData?.byArea?.[0]?.area ?? matrix.sort((a, b) => b.totalListings - a.totalListings)[0]?.area ?? "—";

  const sortedByPpsf = [...matrix].sort((a, b) => b.avgPricePerSqft - a.avgPricePerSqft);
  const sortedByYield = [...matrix].sort((a, b) => b.rentalYield - a.rentalYield);
  const sortedByScore = [...matrix].sort((a, b) => b.investmentScore - a.investmentScore);
  const sortedByAfford = [...matrix].sort((a, b) => a.avgPricePerSqft - b.avgPricePerSqft).filter((c) => c.avgPricePerSqft > 0);

  const highestPrice = sortedByPpsf[0];
  const bestYield = sortedByYield[0];
  const fastestGrowth = sortedByScore[0];
  const bestValue = sortedByAfford[0];

  const developerStats = useMemo(() => aggregateDevelopers(projects), [projects]);
  const topDevelopers = developerStats.slice(0, 8);
  const devMostActive = developerStats[0] ?? null;
  const devFastestGrowing = [...developerStats].sort((a, b) => b.totalCount - a.totalCount)[1] ?? developerStats[0] ?? null;
  const devMostOffPlan = [...developerStats].sort((a, b) => b.offPlanShare - a.offPlanShare)[0] ?? null;
  const devBestYield = [...developerStats].filter((d) => d.avgStartingPrice > 0).sort((a, b) => a.avgStartingPrice - b.avgStartingPrice)[0] ?? null;

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
        yoyPct: 0,
        volume: row.totalValue,
        avgDealSize: row.avgPrice,
        offPlanShare: matrixRow ? Math.round((matrixRow.offPlanCount / (matrixRow.totalListings || 1)) * 100) : undefined,
        rentAvg: matrixRow?.avgRentPrice,
      };
    });
  }, [txData, matrix]);

  const featuredArticle = marketData?.news?.[0] ?? null;

  const priceChartData = monthly.filter((m) => m.avgPpsf > 0);
  const volumeChartData = monthly.filter((m) => m.count > 0);

  void mostActive;
  void yieldRows;

  return (
    <div className="min-h-screen" style={{ background: PULSE_BG }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12 sm:space-y-16 py-10 sm:py-14">

        {/* ── Share row + PDF button ─────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2 -mt-4">
          <PdfButton t={t} />
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

        {/* ── 6-KPI strip (staggered entrance) ───────────────────────── */}
        <motion.div
          className="-mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
        >
          <motion.div variants={fadeUp}>
            <KpiCard
              label={t("kpiTxYtd")}
              value={txData?.summary.totalTransactions ? txData.summary.totalTransactions.toLocaleString() : "—"}
              sub={t("kpiYtd")}
              icon={BarChart3}
              gold
            />
          </motion.div>
          <motion.div variants={fadeUp}>
            <KpiCard
              label={t("kpiAvgPpsf")}
              value={txData?.summary.avgPpsf ? `AED ${txData.summary.avgPpsf.toLocaleString()}` : "—"}
              sub={t("kpiActualSold")}
              icon={Activity}
            />
          </motion.div>
          <motion.div variants={fadeUp}>
            <KpiCard
              label={t("kpiAvgYield")}
              value={marketStats?.summary.avgYield ? `${marketStats.summary.avgYield.toFixed(1)}%` : "—"}
              sub={t("kpiGross")}
              icon={Percent}
            />
          </motion.div>
          <motion.div variants={fadeUp}>
            <KpiCard
              label={t("kpiYoy")}
              value="—"
              sub={t("kpiYoyNote")}
              icon={TrendingUp}
            />
          </motion.div>
          <motion.div variants={fadeUp}>
            <KpiCard
              label={t("kpiOffPlan")}
              value={`${offPlanSharePct}%`}
              sub={t("kpiOfTotalMarket")}
              icon={Building2}
            />
          </motion.div>
          <motion.div variants={fadeUp}>
            <KpiCard
              label={t("kpiCommunities")}
              value={matrix.length > 0 ? matrix.length.toLocaleString() : "—"}
              sub={t("kpiTracked")}
              icon={Globe}
            />
          </motion.div>
        </motion.div>

        {/* ── Charts dyad (24-mo price + monthly volume) ────────────── */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          {/* 24-mo Price Area Chart */}
          <div className="rounded-2xl p-4 sm:p-6" style={{ background: PULSE_SURFACE, border: `1px solid ${PULSE_BORDER}` }}>
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase mb-1" style={{ color: PULSE_TEXT_MUTED }}>{t("chartPriceLabel")}</p>
            <p className="text-base font-bold mb-4" style={{ color: PULSE_TEXT }}>{t("chartPriceTitle")}</p>
            {priceChartData.length > 1 ? (
              <div className="h-[240px]">
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
              <div className="h-[240px] flex items-center justify-center text-sm" style={{ color: PULSE_TEXT_MUTED }}>{t("chartEmpty")}</div>
            )}
          </div>

          {/* Monthly Volume Bar Chart */}
          <div className="rounded-2xl p-4 sm:p-6" style={{ background: PULSE_SURFACE, border: `1px solid ${PULSE_BORDER}` }}>
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase mb-1" style={{ color: PULSE_TEXT_MUTED }}>{t("chartVolumeLabel")}</p>
            <p className="text-base font-bold mb-4" style={{ color: PULSE_TEXT }}>{t("chartVolumeTitle")}</p>
            {volumeChartData.length > 1 ? (
              <div className="h-[240px]">
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
              <div className="h-[240px] flex items-center justify-center text-sm" style={{ color: PULSE_TEXT_MUTED }}>{t("chartEmpty")}</div>
            )}
          </div>
        </div>

        {/* ── Lead CTA — connects market intel to Binayah listings ─── */}
        <LeadCTAStrip t={t} />

        {/* ── Community highlights — 4-up editorial cards ───────────── */}
        {(highestPrice || bestYield || fastestGrowth || bestValue) && (
          <section>
            <SectionHeading
              eyebrow={t("highlightsLabel")}
              title={t("highlightsTitle")}
              italic={t("highlightsTitleItalic")}
            />
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

        {/* ── Developer highlights ───────────────────────────────────── */}
        <section>
        {developerStats.length === 0 ? (
          <div
            className="rounded-xl px-6 py-8 text-center"
            style={{ background: PULSE_SURFACE, border: `1px solid ${PULSE_BORDER}` }}
          >
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-2" style={{ color: GOLD_HEX }}>
              {t("developerHighlightsLabel")}
            </p>
            <p className="text-sm" style={{ color: PULSE_TEXT_MUTED }}>
              {t("developerEmptyState")}
            </p>
          </div>
        ) : (
          <section>
            <SectionHeading
              eyebrow={t("developerHighlightsLabel")}
              title={t("developerHighlightsTitle")}
              italic={t("developerHighlightsTitleItalic")}
            />

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
                      <tr style={{ borderBottom: `1px solid ${PULSE_BORDER}`, background: PULSE_SURFACE }}>
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
                            <span className="flex items-center gap-2">
                              <span
                                className="text-[10px] font-bold tabular-nums w-5 text-right flex-shrink-0"
                                style={{ color: PULSE_TEXT_MUTED }}
                              >
                                {i + 1}
                              </span>
                              {dev.developer}
                            </span>
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
        </section>

        {/* ── Top communities leaderboard ───────────────────────────── */}
        {leaderboardRows.length > 0 && (
          <section>
            <SectionHeading
              eyebrow={t("leaderboardLabel")}
              title={t("leaderboardTitle")}
              italic={t("leaderboardTitleItalic")}
            />
            <CommunityLeaderboard rows={leaderboardRows} />
          </section>
        )}

        {/* ── Featured insight (magazine 60/40) ─────────────────────── */}
        {featuredArticle && (
          <section>
            <SectionHeading
              eyebrow={t("insightLabel")}
              title={t("insightTitle")}
              italic={t("insightTitleItalic")}
            />
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
          <SectionHeading
            eyebrow={t("whyLabel")}
            title={t("whyTitle")}
            italic={t("whyTitleItalic")}
          />
          <div className="space-y-8">
            <WhyEntry num="01." headline={t("why1Headline")} sub={t("why1Sub")} source={t("why1Source")} />
            <WhyEntry num="02." headline={t("why2Headline")} sub={t("why2Sub")} source={t("why2Source")} />
            <WhyEntry num="03." headline={t("why3Headline")} sub={t("why3Sub")} source={t("why3Source")} />
            <WhyEntry num="04." headline={t("why4Headline")} sub={t("why4Sub")} source={t("why4Source")} />
          </div>
        </section>

        {/* ── Featured community cards carousel ────────────────────── */}
        <section>
          <SectionHeading
            eyebrow={t("communitiesLabel")}
            title={t("communitiesTitle")}
            italic={t("communitiesTitleItalic")}
          />
          <div
            ref={communityScrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {FEATURED_COMMUNITIES.map((c) => (
              <FeaturedCommunityCard key={c.slug} community={c} t={t} />
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
