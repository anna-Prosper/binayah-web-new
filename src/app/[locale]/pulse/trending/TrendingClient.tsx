"use client";

import { useMemo, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, Newspaper, Building2,
  Share2, Copy, MessageCircle, Check, ExternalLink,
  BarChart3, RefreshCw, FileDown,
} from "lucide-react";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────

interface MonthlyEntry {
  label: string;
  count: number;
  totalValue: number;
  avgPrice: number;
  avgPpsf: number;
}

interface NewsItem {
  title: string;
  url: string;
  source: string;
  summary: string;
  imageUrl: string;
  publishedAt: string;
}

interface MarketData {
  transactions: {
    hasData: boolean;
    summary: { totalTransactions: number; totalValue: number; avgTransactionValue: number; avgPpsf: number };
    monthly: MonthlyEntry[];
    byArea: { area: string; count: number; totalValue: number; avgPrice: number; avgPpsf: number }[];
  } | null;
  news: NewsItem[];
}

interface Project {
  _id: string;
  name: string;
  developer?: string | { name?: string };
  developerName?: string;
  community?: string | { name?: string };
  startingPrice?: number;
  paymentPlan?: string;
  status?: string;
  launchDate?: string;
  createdAt?: string;
  slug?: string;
}

interface CommunityStats {
  area: string;
  avgPricePerSqft: number;
  rentalYield: number;
  investmentScore: number;
  totalListings: number;
  offPlanCount: number;
  avgSalePrice: number;
}

interface MarketStats {
  communityMatrix: CommunityStats[];
  summary: { avgPricePerSqft: number; avgYield: number; offPlanShare: number };
  yieldByArea: { area: string; yield: number; avgRent: number; avgSale: number }[];
}

interface BinayahArticle {
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  publishedAt: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

const AED = (n: number) => {
  if (n >= 1_000_000) return `AED ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `AED ${(n / 1_000).toFixed(0)}K`;
  return n > 0 ? `AED ${n.toLocaleString()}` : "—";
};

// ── Main Component ─────────────────────────────────────────────────────────

export default function TrendingClient({
  marketData,
  projects,
  marketStats,
  binayahNews,
}: {
  marketData: MarketData | null;
  projects: Project[] | null;
  marketStats: MarketStats | null;
  binayahNews: BinayahArticle[] | null;
}) {
  const t = useTranslations("pulseTrending");
  const [copied, setCopied] = useState(false);

  const txData = marketData?.transactions;
  const monthly = txData?.monthly ?? [];
  const news = marketData?.news ?? [];
  const allProjects: Project[] = Array.isArray(projects) ? projects : [];

  // ── Movers: MoM change from most recent two entries ────────────────────
  const movers = useMemo(() => {
    if (monthly.length < 2) return { risers: [], fallers: [] };

    const valid = monthly.filter((m) => m.avgPpsf > 0);
    if (valid.length < 2) return { risers: [], fallers: [] };

    const changes: { label: string; prev: number; curr: number; changePct: number }[] = [];
    for (let i = 1; i < valid.length; i++) {
      const prev = valid[i - 1];
      const curr = valid[i];
      if (prev.avgPpsf > 0) {
        changes.push({
          label: curr.label,
          prev: prev.avgPpsf,
          curr: curr.avgPpsf,
          changePct: ((curr.avgPpsf - prev.avgPpsf) / prev.avgPpsf) * 100,
        });
      }
    }

    const byArea = txData?.byArea ?? [];
    byArea.forEach((area) => {
      void area;
    });

    const sorted = [...changes].sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct));
    const risers = sorted.filter((c) => c.changePct > 0).slice(0, 5);
    const fallers = sorted.filter((c) => c.changePct < 0).slice(0, 5);

    return { risers, fallers };
  }, [monthly, txData]);

  // ── New launches: projects within last 30 days ─────────────────────────
  const newLaunches = useMemo(() => {
    const now = Date.now();
    const thirty = 30 * 24 * 60 * 60 * 1000;
    return allProjects
      .filter((p) => {
        const dateStr = p.launchDate ?? p.createdAt;
        if (!dateStr) return true;
        return now - new Date(dateStr).getTime() <= thirty;
      })
      .slice(0, 6);
  }, [allProjects]);

  // ── Market stats derived data ──────────────────────────────────────────
  const matrix = marketStats?.communityMatrix ?? [];

  // Yield champions — top 5 communities by rental yield (>0)
  const yieldChampions = useMemo(() =>
    [...matrix]
      .filter((c) => c.rentalYield > 0 && c.avgSalePrice > 0)
      .sort((a, b) => b.rentalYield - a.rentalYield)
      .slice(0, 5),
  [matrix]);

  // Best value — high investment score relative to price
  const bestValue = useMemo(() =>
    [...matrix]
      .filter((c) => c.investmentScore > 0 && c.avgPricePerSqft > 0)
      .sort((a, b) => {
        const maxPpsf = Math.max(...matrix.map(x => x.avgPricePerSqft), 1);
        const aVal = a.investmentScore * (1 - a.avgPricePerSqft / maxPpsf);
        const bVal = b.investmentScore * (1 - b.avgPricePerSqft / maxPpsf);
        return bVal - aVal;
      })
      .slice(0, 5),
  [matrix]);

  // Off-plan hotspots — most active off-plan areas
  const offPlanHotspots = useMemo(() =>
    [...matrix]
      .filter((c) => c.offPlanCount > 0)
      .sort((a, b) => b.offPlanCount - a.offPlanCount)
      .slice(0, 6),
  [matrix]);

  // DLD activity leaders — top areas by transaction count from byArea
  const activityLeaders = txData?.byArea?.slice(0, 6) ?? [];

  // Featured Binayah article
  const featuredBinayah = binayahNews?.[0] ?? null;

  // ── Featured insight: use Binayah article if available ──────────────
  const featuredNews = featuredBinayah
    ? {
        title: featuredBinayah.title,
        url: `/news/${featuredBinayah.slug}`,
        source: "Binayah",
        summary: featuredBinayah.excerpt ?? "",
        imageUrl: featuredBinayah.featuredImage ?? "",
        publishedAt: featuredBinayah.publishedAt ?? new Date().toISOString(),
      }
    : (news.find((n) => n.imageUrl) ?? news[0] ?? null);

  // ── Weekly summary: latest monthly entry ─────────────────────────────
  const latest = monthly[monthly.length - 1] ?? null;

  // ── Share ─────────────────────────────────────────────────────────────
  const [baseUrl, setBaseUrl] = useState("https://staging.binayahhub.com/pulse/trending");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(`${window.location.origin}/pulse/trending`);
    }
  }, []);
  const waUrl   = `${baseUrl}?utm_source=whatsapp&utm_medium=share&utm_campaign=pulse-trending`;
  const xUrl    = `${baseUrl}?utm_source=twitter&utm_medium=share&utm_campaign=pulse-trending`;
  const liUrl   = `${baseUrl}?utm_source=linkedin&utm_medium=share&utm_campaign=pulse-trending`;
  const copyUrlTrending = `${baseUrl}?utm_source=copy&utm_medium=share&utm_campaign=pulse-trending`;
  const shareText = `Dubai Real Estate Trending\nLatest data: ${latest ? `${latest.count} transactions, ${AED(latest.avgPrice)} avg price` : "See full report"}\nvia Binayah Properties\n${waUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(copyUrlTrending).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-12">
      {/* ── Hero ───────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-5 w-5 text-accent" />
          <p className="text-accent font-semibold tracking-[0.3em] uppercase text-xs">{t("label")}</p>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
          {t("title")} <span className="italic font-light">{t("titleItalic")}</span>
        </h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </motion.div>

      {/* ── Weekly stat strip ──────────────────────────────────── */}
      {latest ? (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <SectionHeader label={t("summaryLabel")} title={t("summaryTitle")} titleItalic={t("summaryItalic")} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              icon={BarChart3}
              label={t("totalTx")}
              value={latest.count.toLocaleString()}
              accent
            />
            <StatCard
              icon={TrendingUp}
              label={t("totalValue")}
              value={AED(latest.totalValue)}
            />
            <StatCard
              icon={Building2}
              label={t("avgPrice")}
              value={AED(latest.avgPrice)}
            />
            <StatCard
              icon={TrendingUp}
              label={t("avgPpsf")}
              value={latest.avgPpsf > 0 ? `AED ${latest.avgPpsf.toLocaleString()}` : "—"}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            {t("summaryPeriod", { period: latest.label })}
          </p>
        </motion.section>
      ) : null}

      {/* ── Biggest Movers ─────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.05 }}
      >
        <SectionHeader label={t("moversLabel")} title={t("moversTitle")} titleItalic={t("moversItalic")} />

        {!txData?.hasData || monthly.length < 2 || (movers.risers.length === 0 && movers.fallers.length === 0) ? (
          null
        ) : (
          <>
            <div className="grid sm:grid-cols-2 gap-6">
              {movers.risers.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-emerald-700 flex items-center gap-2 mb-3">
                    <TrendingUp className="h-4 w-4" /> {t("risers")}
                  </h3>
                  <div className="space-y-2">
                    {movers.risers.map((r, i) => (
                      <MoverRow
                        key={i}
                        label={r.label}
                        ppsf={r.curr}
                        changePct={r.changePct}
                        isRiser
                        t={t}
                      />
                    ))}
                  </div>
                </div>
              )}
              {movers.fallers.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-red-600 flex items-center gap-2 mb-3">
                    <TrendingDown className="h-4 w-4" /> {t("fallers")}
                  </h3>
                  <div className="space-y-2">
                    {movers.fallers.map((r, i) => (
                      <MoverRow
                        key={i}
                        label={r.label}
                        ppsf={r.curr}
                        changePct={r.changePct}
                        isRiser={false}
                        t={t}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground mt-3">{t("moversNote")}</p>
          </>
        )}
      </motion.section>

      {/* ── New Launches ─────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.08 }}
      >
        <SectionHeader label={t("launchesLabel")} title={t("launchesTitle")} titleItalic={t("launchesItalic")} />

        {newLaunches.length === 0 ? (
          <div className="bg-muted/20 border border-border/30 rounded-2xl p-8 text-center">
            <Building2 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-semibold text-muted-foreground">{t("noLaunches")}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {newLaunches.map((p) => (
              <LaunchCard key={p._id} project={p} t={t} />
            ))}
          </div>
        )}
      </motion.section>

      {/* ── Yield Champions ───────────────────────────────────────── */}
      {yieldChampions.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.09 }}
        >
          <SectionHeader label="RENTAL YIELD" title="Yield" titleItalic="Champions" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {yieldChampions.map((c, i) => (
              <div key={c.area} className="bg-card border border-border/50 rounded-xl p-4 hover:border-accent/30 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">{i + 1}</div>
                    <p className="font-semibold text-sm text-foreground">{c.area}</p>
                  </div>
                  <span className="text-lg font-bold text-emerald-600">{c.rentalYield}%</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                  <div><p className="text-muted-foreground">{"Avg Sale"}</p><p className="font-semibold text-foreground">{c.avgSalePrice > 0 ? AED(c.avgSalePrice) : "—"}</p></div>
                  <div><p className="text-muted-foreground">{"Price/sqft"}</p><p className="font-semibold text-foreground">{c.avgPricePerSqft > 0 ? `AED ${c.avgPricePerSqft.toLocaleString()}` : "—"}</p></div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* ── Best Value Areas ──────────────────────────────────────── */}
      {bestValue.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <SectionHeader label="INVESTMENT" title="Best Value" titleItalic="Areas" />
          <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  {["Community", "Score", "Price/sqft", "Yield"].map((col, i) => (
                    <th key={i} className={`px-4 py-3 text-xs font-semibold text-muted-foreground ${i === 0 ? "text-left" : "text-right"}`}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bestValue.map((c, i) => (
                  <tr key={c.area} className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                        {c.area}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.investmentScore >= 70 ? "bg-emerald-100 text-emerald-700" : c.investmentScore >= 45 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>{c.investmentScore}/100</span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-foreground">{c.avgPricePerSqft > 0 ? `AED ${c.avgPricePerSqft.toLocaleString()}` : "—"}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-emerald-600">{c.rentalYield > 0 ? `${c.rentalYield}%` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>
      )}

      {/* ── DLD Activity Leaders ──────────────────────────────────── */}
      {activityLeaders.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.11 }}
        >
          <SectionHeader label="DLD DATA" title="Transaction" titleItalic="Hotspots" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activityLeaders.map((area, i) => (
              <div key={area.area} className="bg-card border border-border/50 rounded-xl p-4 hover:border-accent/30 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                    <p className="font-semibold text-sm text-foreground leading-tight">{area.area}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs mt-3">
                  <div><p className="text-muted-foreground">{"Sales"}</p><p className="font-bold text-foreground">{area.count.toLocaleString()}</p></div>
                  <div><p className="text-muted-foreground">{"Avg Price"}</p><p className="font-semibold text-foreground">{area.avgPrice > 0 ? AED(area.avgPrice) : "—"}</p></div>
                  <div><p className="text-muted-foreground">{"AED/sqft"}</p><p className="font-semibold text-foreground">{area.avgPpsf > 0 ? area.avgPpsf.toLocaleString() : "—"}</p></div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">{"Source: Dubai Land Department transaction data"}</p>
        </motion.section>
      )}

      {/* ── Off-Plan Hotspots ─────────────────────────────────────── */}
      {offPlanHotspots.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.12 }}
        >
          <SectionHeader label="DEVELOPMENT" title="Off-Plan" titleItalic="Hotspots" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {offPlanHotspots.map((c, i) => (
              <div key={c.area} className="bg-card border border-border/50 rounded-xl p-3 text-center hover:border-accent/30 transition-all">
                <div className="text-xl font-bold text-primary mb-0.5">{c.offPlanCount}</div>
                <div className="text-[10px] text-muted-foreground font-medium mb-1">{"projects"}</div>
                <div className="text-xs font-semibold text-foreground leading-tight">{c.area}</div>
                {c.avgPricePerSqft > 0 && (
                  <div className="text-[10px] text-accent mt-1">{`AED ${c.avgPricePerSqft.toLocaleString()}/sqft`}</div>
                )}
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* ── Featured Insight ─────────────────────────────────────── */}
      {featuredNews && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.13 }}
        >
          <SectionHeader label={t("insightLabel")} title={t("insightTitle")} titleItalic={t("insightItalic")} />
          <a
            href={featuredNews.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block bg-card border border-border/50 rounded-2xl overflow-hidden hover:border-accent/40 hover:shadow-lg transition-all"
          >
            <div className="grid sm:grid-cols-5 gap-0">
              {featuredNews.imageUrl && (
                <div className="sm:col-span-2 relative h-48 sm:h-full min-h-[180px] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featuredNews.imageUrl}
                    alt={featuredNews.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className={`${featuredNews.imageUrl ? "sm:col-span-3" : "sm:col-span-5"} p-5 sm:p-6 flex flex-col`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">{featuredNews.source}</span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-accent transition-colors" />
                </div>
                <p className="font-bold text-foreground text-lg leading-snug group-hover:text-accent transition-colors mb-3">{featuredNews.title}</p>
                {featuredNews.summary && (
                  <p className="text-sm text-muted-foreground line-clamp-3">{featuredNews.summary}</p>
                )}
                <p className="text-[10px] text-muted-foreground mt-auto pt-3 flex items-center gap-1">
                  <Newspaper className="h-3 w-3" />
                  {new Date(featuredNews.publishedAt).toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            </div>
          </a>
        </motion.section>
      )}

      {/* ── Share ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-card border border-border/50 rounded-2xl p-5"
      >
        <h3 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
          <Share2 className="h-4 w-4 text-accent" />
          {t("share")}
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
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(xUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors border border-sky-200"
          >
            {t("shareX")}
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(liUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200"
          >
            {t("shareLinkedIn")}
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
        </div>
      </motion.div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

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

function StatCard({ icon: Icon, label, value, accent = false }: {
  icon: React.ElementType; label: string; value: string; accent?: boolean;
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
    </div>
  );
}

function MoverRow({ label, ppsf, changePct, isRiser, t }: {
  label: string; ppsf: number; changePct: number; isRiser: boolean;
  t: ReturnType<typeof useTranslations<"pulseTrending">>;
}) {
  return (
    <div className="flex items-center justify-between bg-card border border-border/50 rounded-xl px-4 py-3 hover:border-accent/30 transition-all">
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-[10px] text-muted-foreground">
          {`AED ${ppsf.toLocaleString()} / ${t("sqftUnit")}`}
        </p>
      </div>
      <span className={`text-sm font-bold flex items-center gap-1 ${isRiser ? "text-emerald-600" : "text-red-500"}`}>
        {isRiser ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
        {isRiser ? "+" : ""}{changePct.toFixed(1)}%
      </span>
    </div>
  );
}

function LaunchCard({ project, t }: {
  project: Project;
  t: ReturnType<typeof useTranslations<"pulseTrending">>;
}) {
  const devName = project.developerName ?? extractName(project.developer);
  const commName = extractName(project.community);
  const showOffPlan = !project.status || project.status === "Off-Plan";

  return (
    <div className="bg-card border border-border/50 rounded-xl p-4 hover:border-accent/30 hover:shadow-sm transition-all flex flex-col gap-2">
      <div className="flex items-center justify-between">
        {showOffPlan ? (
          <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">{t("offPlan")}</span>
        ) : (
          <span />
        )}
        {project.paymentPlan && (
          <span className="text-[10px] font-medium text-muted-foreground">{project.paymentPlan}</span>
        )}
      </div>
      <p className="font-bold text-foreground leading-snug">{project.name}</p>
      <p className="text-xs text-muted-foreground">
        {devName !== "—" ? `${devName} · ` : ""}{commName}
      </p>
      {project.startingPrice && project.startingPrice > 0 && (
        <p className="text-sm font-semibold text-primary">
          {t("from")} {AED(project.startingPrice)}
        </p>
      )}
      {project.slug && (
        <Link
          href={`/off-plan/${project.slug}`}
          className="text-xs font-semibold text-accent hover:underline mt-auto"
        >
          {t("viewProject")} →
        </Link>
      )}
    </div>
  );
}

function extractName(val: string | { name?: string } | undefined): string {
  if (!val) return "—";
  if (typeof val === "string") return val;
  return val.name ?? "—";
}
