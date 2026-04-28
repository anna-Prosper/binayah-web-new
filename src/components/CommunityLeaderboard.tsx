"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";

export interface LeaderboardRow {
  rank: number;
  area: string;
  // Primary metrics
  totalSales: number;
  ppsf: number;
  yieldPct: number;
  yoyPct: number;
  volume: number;
  // Secondary (revealed on hover)
  avgDealSize?: number;
  offPlanShare?: number;
  rentAvg?: number;
}

type MetricKey = "sales" | "ppsf" | "yield" | "yoy" | "volume";

const METRICS: { id: MetricKey; labelKey: string }[] = [
  { id: "sales", labelKey: "metricSales" },
  { id: "ppsf", labelKey: "metricPpsf" },
  { id: "yield", labelKey: "metricYield" },
  { id: "yoy", labelKey: "metricYoy" },
  { id: "volume", labelKey: "metricVolume" },
];

const GOLD = "hsl(43, 55%, 55%)";
const GREEN = "hsl(160, 55%, 42%)";
const RED = "hsl(0, 72%, 51%)";

function getMetricValue(row: LeaderboardRow, metric: MetricKey): number {
  switch (metric) {
    case "sales": return row.totalSales;
    case "ppsf": return row.ppsf;
    case "yield": return row.yieldPct;
    case "yoy": return row.yoyPct;
    case "volume": return row.volume;
  }
}

function formatMetric(value: number, metric: MetricKey): string {
  if (value === 0) return "—";
  switch (metric) {
    case "sales": return value.toLocaleString();
    case "ppsf": return `${value.toLocaleString()}`;
    case "yield": return `${value.toFixed(1)}%`;
    case "yoy": {
      const abs = Math.abs(value).toFixed(1);
      return value >= 0 ? `+${abs}%` : `−${abs}%`;
    }
    case "volume": {
      if (value >= 1_000_000_000) return `AED ${(value / 1_000_000_000).toFixed(1)}B`;
      if (value >= 1_000_000) return `AED ${(value / 1_000_000).toFixed(1)}M`;
      return `AED ${(value / 1_000).toFixed(0)}K`;
    }
  }
}

function metricColor(value: number, metric: MetricKey): string | undefined {
  if (metric === "yoy") {
    return value > 0 ? GREEN : value < 0 ? RED : undefined;
  }
  if (metric === "yield") {
    return value >= 7 ? GREEN : value >= 5 ? GOLD : undefined;
  }
  return undefined;
}

interface Props {
  rows: LeaderboardRow[];
  /** Show a "View all" footer link */
  viewAllHref?: string;
}

export default function CommunityLeaderboard({ rows, viewAllHref }: Props) {
  const t = useTranslations("communityLeaderboard");
  const [activeMetric, setActiveMetric] = useState<MetricKey>("sales");
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  if (rows.length === 0) {
    return (
      <div className="bg-muted/20 border border-border/30 rounded-xl p-8 text-center">
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      </div>
    );
  }

  // Sort rows by active metric (desc for most metrics, except yoy/yield we still rank by value desc)
  const sorted = [...rows].sort((a, b) => {
    const av = getMetricValue(a, activeMetric);
    const bv = getMetricValue(b, activeMetric);
    return bv - av;
  });

  const maxVal = Math.max(...sorted.map((r) => getMetricValue(r, activeMetric)), 1);

  return (
    <div className="space-y-3">
      {/* Segmented pill metric switcher */}
      <div
        role="group"
        aria-label={t("metricSwitcherLabel")}
        className="flex gap-1 flex-wrap"
      >
        {METRICS.map((m) => (
          <button
            key={m.id}
            onClick={() => setActiveMetric(m.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              activeMetric === m.id
                ? "text-white border-transparent shadow-sm"
                : "text-muted-foreground border-border/50 bg-card hover:border-accent/40 hover:text-foreground"
            }`}
            style={
              activeMetric === m.id
                ? { background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }
                : undefined
            }
          >
            {t(m.labelKey as Parameters<typeof t>[0])}
          </button>
        ))}
      </div>

      {/* Linear-dense rows with 1px dividers */}
      <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
        {sorted.map((row, idx) => {
          const isFirst = idx === 0;
          const val = getMetricValue(row, activeMetric);
          const barWidth = maxVal > 0 ? Math.min((val / maxVal) * 100, 100) : 0;
          const valueColor = metricColor(val, activeMetric);
          const isHovered = hoveredRow === row.area;

          return (
            <div
              key={row.area}
              onMouseEnter={() => setHoveredRow(row.area)}
              onMouseLeave={() => setHoveredRow(null)}
              className={`relative flex items-center gap-3 px-4 py-2.5 transition-colors ${
                idx < sorted.length - 1 ? "border-b border-border/40" : ""
              } ${isHovered ? "bg-muted/30" : ""}`}
              style={{ minHeight: 44 }}
            >
              {/* Rank */}
              <div className="w-6 flex-shrink-0 text-center">
                {isFirst ? (
                  <span
                    className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white"
                    style={{ background: GOLD }}
                  >
                    1
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground/50 font-medium">{idx + 1}</span>
                )}
              </div>

              {/* Area name */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isFirst ? "text-foreground" : "text-foreground/80"}`}>
                  {row.area}
                </p>

                {/* Bar */}
                <div className="h-1 mt-1 rounded-full overflow-hidden bg-muted/60 w-24">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${barWidth}%`,
                      background: isFirst ? GOLD : "hsl(168, 60%, 30%)",
                    }}
                  />
                </div>
              </div>

              {/* Primary metric value */}
              <div className="text-right flex-shrink-0 min-w-[72px]">
                <p
                  className="text-sm font-bold tabular-nums"
                  style={{ color: valueColor ?? (isFirst ? GOLD : "hsl(var(--foreground))"), fontVariantNumeric: "tabular-nums" }}
                >
                  {formatMetric(val, activeMetric)}
                </p>
              </div>

              {/* Secondary metrics — slide-in on hover */}
              {isHovered && (
                <div className="absolute inset-y-0 right-0 flex items-center gap-3 px-4 bg-card/95 backdrop-blur-sm border-l border-border/50 z-10 animate-in slide-in-from-right-4 duration-150">
                  {row.avgDealSize !== undefined && row.avgDealSize > 0 && (
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground">{t("secAvgDeal")}</p>
                      <p className="text-xs font-semibold text-foreground tabular-nums">
                        AED {(row.avgDealSize / 1_000_000).toFixed(1)}M
                      </p>
                    </div>
                  )}
                  {row.offPlanShare !== undefined && (
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground">{t("secOffPlan")}</p>
                      <p className="text-xs font-semibold text-foreground tabular-nums">
                        {row.offPlanShare.toFixed(0)}%
                      </p>
                    </div>
                  )}
                  {row.rentAvg !== undefined && row.rentAvg > 0 && (
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground">{t("secRentAvg")}</p>
                      <p className="text-xs font-semibold text-foreground tabular-nums">
                        AED {(row.rentAvg / 1_000).toFixed(0)}K
                      </p>
                    </div>
                  )}
                  <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {viewAllHref && (
        <div className="text-center pt-1">
          <a
            href={viewAllHref}
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("viewAll")} →
          </a>
        </div>
      )}
    </div>
  );
}
