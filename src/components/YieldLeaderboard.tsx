"use client";

import { useTranslations } from "next-intl";

export interface YieldRow {
  area: string;
  avgRentPerSqft: number;
  avgSalePerSqft: number;
  yieldPct: number;
  salesSampleSize: number;
  rentSampleSize: number;
  lowConfidence: boolean;
}

interface Props {
  rows: YieldRow[];
}

const GOLD = "hsl(43, 55%, 55%)";
const GREEN = "hsl(160, 55%, 42%)";

export default function YieldLeaderboard({ rows }: Props) {
  const t = useTranslations("yieldLeaderboard");

  if (rows.length === 0) {
    return (
      <div className="bg-muted/20 border border-border/30 rounded-xl p-8 text-center">
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      </div>
    );
  }

  const sorted = [...rows].sort((a, b) => b.yieldPct - a.yieldPct);

  return (
    <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 px-4 py-2 border-b border-border/50 bg-muted/30">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">{t("colArea")}</p>
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground text-right w-16">{t("colRentSqft")}</p>
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground text-right w-16">{t("colSaleSqft")}</p>
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground text-right w-14">{t("colYield")}</p>
      </div>

      {sorted.map((row, idx) => (
        <div
          key={row.area}
          className={`grid grid-cols-[1fr_auto_auto_auto] gap-x-4 px-4 py-3 items-center transition-colors hover:bg-muted/20 ${
            idx < sorted.length - 1 ? "border-b border-border/40" : ""
          }`}
          style={{ minHeight: 44 }}
        >
          {/* Area */}
          <div className="flex items-center gap-2 min-w-0">
            {idx === 0 && (
              <span
                className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold text-white flex-shrink-0"
                style={{ background: GOLD }}
              >
                1
              </span>
            )}
            <div>
              <p className="text-sm font-medium text-foreground truncate">{row.area}</p>
              {row.lowConfidence && (
                <p className="text-[10px] text-muted-foreground/60 italic">{t("thinSample")}</p>
              )}
            </div>
          </div>

          {/* Rent/sqft */}
          <p className="text-xs text-muted-foreground text-right w-16 tabular-nums">
            {row.avgRentPerSqft > 0 ? row.avgRentPerSqft.toFixed(0) : "—"}
          </p>

          {/* Sale/sqft */}
          <p className="text-xs text-muted-foreground text-right w-16 tabular-nums">
            {row.avgSalePerSqft > 0 ? row.avgSalePerSqft.toLocaleString() : "—"}
          </p>

          {/* Yield */}
          <p
            className="text-sm font-bold text-right w-14 tabular-nums"
            style={{
              color: row.yieldPct >= 7 ? GREEN : row.yieldPct >= 5 ? GOLD : "hsl(var(--foreground))",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {row.yieldPct > 0 ? `${row.yieldPct.toFixed(1)}%` : "—"}
          </p>
        </div>
      ))}

      <p className="px-4 py-2.5 text-[10px] text-muted-foreground/60 border-t border-border/30">
        {t("footnote")}
      </p>
    </div>
  );
}
