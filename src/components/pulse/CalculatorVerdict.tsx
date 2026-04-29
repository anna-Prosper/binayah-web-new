"use client";

import { useTranslations } from "next-intl";
import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";

// ── Dubai benchmark constant ──────────────────────────────────────────────────
// Source: DLD aggregated transaction data, trailing 12 months.
export const DUBAI_AVG_YIELD = 6.8;

// ── Pure scoring function (named export, covered by unit test stub) ───────────

/**
 * Scores a Dubai property investment on 3 criteria:
 * 1 pt — rental yield exceeds Dubai community average
 * 1 pt — 5-yr appreciation forecast > 5%
 * 1 pt — 5-yr ROI beats S&P 500 5-yr benchmark (~62.9%)
 *
 * 3/3 → "strong" | 2/3 → "moderate" | 0–1/3 → "weak"
 */
export function computeVerdict(
  rentalYield: number,
  dubaiAvgYield: number,
  fiveYrForecast: number,
  vsSp500Delta: number
): "strong" | "moderate" | "weak" {
  const score =
    (rentalYield > dubaiAvgYield ? 1 : 0) +
    (fiveYrForecast > 5 ? 1 : 0) +
    (vsSp500Delta > 0 ? 1 : 0);
  return score >= 3 ? "strong" : score >= 2 ? "moderate" : "weak";
}

// ── UI Component ──────────────────────────────────────────────────────────────

interface VerdictProps {
  rentalYield: number;     // gross yield %
  fiveYrForecast: number;  // property 5-yr ROI %
  sp500Roi: number;        // S&P 500 5-yr ROI %
}

export default function CalculatorVerdict({
  rentalYield,
  fiveYrForecast,
  sp500Roi,
}: VerdictProps) {
  const t = useTranslations("pulseCalculator");

  const vsSp500Delta = fiveYrForecast - sp500Roi;
  const verdict = computeVerdict(rentalYield, DUBAI_AVG_YIELD, fiveYrForecast, vsSp500Delta);

  const verdictStyles = {
    strong: {
      pill: "bg-emerald-100 text-emerald-700 border-emerald-200",
      border: "border-emerald-100",
    },
    moderate: {
      pill: "bg-amber-100 text-amber-700 border-amber-200",
      border: "border-amber-100",
    },
    weak: {
      pill: "bg-slate-100 text-slate-500 border-slate-200",
      border: "border-slate-100",
    },
  }[verdict];

  return (
    <div className={`bg-card border rounded-2xl p-5 space-y-4 ${verdictStyles.border}`}>
      {/* Verdict pill */}
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border ${verdictStyles.pill}`}>
          {t(`rating_${verdict}` as "rating_strong" | "rating_moderate" | "rating_weak")}
        </span>
        <span className="text-xs text-muted-foreground">{t("investmentRating")}</span>
      </div>

      {/* Explainer rows */}
      <div className="space-y-2">
        {/* Row 1: Rental yield vs Dubai avg */}
        <VerdictRow
          label={t("verdictYieldLabel")}
          value={`${rentalYield.toFixed(1)}%`}
          comparison={`vs Dubai avg ${DUBAI_AVG_YIELD.toFixed(1)}%`}
          positive={rentalYield > DUBAI_AVG_YIELD}
          neutral={Math.abs(rentalYield - DUBAI_AVG_YIELD) < 0.3}
          tooltip={t("verdictYieldTooltip")}
        />

        {/* Row 2: 5-yr appreciation forecast */}
        <VerdictRow
          label={t("verdictAppreciationLabel")}
          value={`${fiveYrForecast >= 0 ? "+" : ""}${fiveYrForecast.toFixed(1)}%`}
          comparison={t("verdictAppreciationSub")}
          positive={fiveYrForecast > 5}
          neutral={fiveYrForecast >= 0 && fiveYrForecast <= 5}
          tooltip={t("verdictAppreciationTooltip")}
        />

        {/* Row 3: vs S&P 500 */}
        <VerdictRow
          label={t("verdictVsSpLabel")}
          value={`${vsSp500Delta >= 0 ? "+" : ""}${vsSp500Delta.toFixed(1)}%`}
          comparison={t("verdictVsSpSub")}
          positive={vsSp500Delta > 0}
          neutral={Math.abs(vsSp500Delta) < 2}
          tooltip={t("verdictVsSpTooltip")}
        />
      </div>

      <p className="text-[10px] text-muted-foreground">{t("verdictDisclaimer")}</p>
    </div>
  );
}

// ── Sub-component ─────────────────────────────────────────────────────────────

function VerdictRow({
  label,
  value,
  comparison,
  positive,
  neutral,
  tooltip,
}: {
  label: string;
  value: string;
  comparison: string;
  positive: boolean;
  neutral: boolean;
  tooltip: string;
}) {
  const color = positive
    ? "text-emerald-600"
    : neutral
    ? "text-amber-500"
    : "text-rose-500";

  const Icon = positive ? TrendingUp : neutral ? Minus : TrendingDown;

  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
      <div className="flex items-center gap-1.5">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span
          title={tooltip}
          className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-muted/50 cursor-help"
        >
          <Info className="h-2.5 w-2.5 text-muted-foreground/60" />
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-bold ${color}`}>{value}</span>
        <div className={`flex items-center gap-1 text-xs ${color}`}>
          <Icon className="h-3 w-3" />
          <span className="text-[10px] text-muted-foreground">{comparison}</span>
        </div>
      </div>
    </div>
  );
}
