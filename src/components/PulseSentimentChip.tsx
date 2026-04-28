"use client";

import { useTranslations } from "next-intl";

export type SentimentValue = "bullish" | "neutral" | "bearish";

interface MonthlyPoint {
  label: string;
  count?: number;
  avgPpsf?: number;
  totalValue?: number;
}

interface Props {
  // Pass either a pre-computed sentiment or a monthly[] array for derivation
  sentiment?: SentimentValue;
  monthly?: MonthlyPoint[];
  // Which metric to derive sentiment from
  metric?: "ppsf" | "count" | "value";
}

/** Derive sentiment from last 3 months MoM trend */
function deriveSentiment(monthly: MonthlyPoint[], metric: "ppsf" | "count" | "value"): SentimentValue {
  if (monthly.length < 2) return "neutral";
  const recent = monthly.slice(-3);
  if (recent.length < 2) return "neutral";

  const getVal = (m: MonthlyPoint) => {
    if (metric === "ppsf") return m.avgPpsf ?? 0;
    if (metric === "value") return m.totalValue ?? 0;
    return m.count ?? 0;
  };

  const vals = recent.map(getVal);
  let upCount = 0;
  let downCount = 0;
  for (let i = 1; i < vals.length; i++) {
    if (vals[i] > vals[i - 1] * 1.005) upCount++;
    else if (vals[i] < vals[i - 1] * 0.995) downCount++;
  }

  if (upCount > downCount) return "bullish";
  if (downCount > upCount) return "bearish";
  return "neutral";
}

/** Compute mini-sparkline path for 3 dots */
function sparklinePath(monthly: MonthlyPoint[], metric: "ppsf" | "count" | "value"): number[] {
  const getVal = (m: MonthlyPoint) => {
    if (metric === "ppsf") return m.avgPpsf ?? 0;
    if (metric === "value") return m.totalValue ?? 0;
    return m.count ?? 0;
  };
  const vals = monthly.slice(-3).map(getVal);
  if (vals.length === 0) return [0, 0, 0];
  const max = Math.max(...vals) || 1;
  const min = Math.min(...vals);
  const range = max - min || 1;
  // Normalize to 0–1
  return vals.map((v) => (v - min) / range);
}

export default function PulseSentimentChip({ sentiment: sentimentProp, monthly = [], metric = "ppsf" }: Props) {
  const t = useTranslations("pulseSentimentChip");

  const sentiment: SentimentValue = sentimentProp ?? (monthly.length >= 2 ? deriveSentiment(monthly, metric) : "neutral");
  const dots = sparklinePath(monthly, metric);

  const isBullish = sentiment === "bullish";
  const isBearish = sentiment === "bearish";

  // Per brief: color in TYPE / BORDER / ICON only — no fill backgrounds
  const chipColor = isBullish
    ? "hsl(160, 55%, 42%)"
    : isBearish
    ? "hsl(0, 72%, 51%)"
    : "hsl(43, 55%, 55%)";

  const glyph = isBullish ? "●" : isBearish ? "—" : "›";
  const label = isBullish ? t("bullish") : isBearish ? t("bearish") : t("neutral");

  // Sparkline dot y-positions (24px height, 3 dots at x=2,10,18)
  const sparkDots = dots.length === 3
    ? dots
    : [0.5, 0.5, 0.5];
  const dotY = (norm: number) => Math.round(2 + (1 - norm) * 14); // 2..16 px range in 18px viewBox

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[11px] font-semibold border select-none ${
        isBullish ? "animate-[pulse_3s_ease-in-out_infinite]" : ""
      }`}
      style={{
        color: chipColor,
        borderColor: chipColor,
        background: "transparent",
        letterSpacing: "0.04em",
      }}
      aria-label={`${t("ariaLabel")}: ${label}`}
    >
      {/* Glyph */}
      <span aria-hidden="true" className="text-[10px] leading-none">{glyph}</span>

      {/* Label */}
      <span>{label}</span>

      {/* 3-dot mini sparkline (SVG, 24×12px) */}
      <svg
        width="24"
        height="12"
        viewBox="0 0 24 12"
        aria-hidden="true"
        className="flex-shrink-0"
      >
        {/* Connecting line */}
        {sparkDots.length === 3 && (
          <polyline
            points={`2,${dotY(sparkDots[0])} 10,${dotY(sparkDots[1])} 18,${dotY(sparkDots[2])}`}
            stroke={chipColor}
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.5"
          />
        )}
        {/* Dots */}
        {sparkDots.map((norm, i) => (
          <circle
            key={i}
            cx={2 + i * 8}
            cy={dotY(norm)}
            r="1.5"
            fill={chipColor}
            opacity={i === 2 ? 1 : 0.6}
          />
        ))}
      </svg>
    </span>
  );
}
