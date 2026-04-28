"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";

interface MoverItem {
  area: string;
  ppsf: number;
  momPct: number; // e.g. 2.4 for +2.4%, -1.3 for -1.3%
  /** optional sparkline data (3-7 points, normalized 0-1) */
  sparkline?: number[];
}

interface Props {
  movers: MoverItem[];
}

const GOLD = "hsl(43, 55%, 55%)";
const GREEN = "hsl(160, 55%, 42%)";
const RED = "hsl(0, 72%, 51%)";

/** 24px sparkline SVG */
function Sparkline({ data, up }: { data: number[]; up: boolean }) {
  if (data.length < 2) return null;
  const w = 48;
  const h = 24;
  const xStep = w / (data.length - 1);
  const pts = data
    .map((v, i) => `${(i * xStep).toFixed(1)},${(h - 2 - v * (h - 4)).toFixed(1)}`)
    .join(" ");
  const color = up ? GREEN : RED;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" className="flex-shrink-0">
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Format MoM % with true U+2212 minus, tabular-nums */
function formatMom(pct: number): string {
  const abs = Math.abs(pct).toFixed(1);
  return pct >= 0 ? `+${abs}%` : `−${abs}%`;
}

export default function PulseQuickTicker({ movers }: Props) {
  const t = useTranslations("pulseQuickTicker");
  const scrollRef = useRef<HTMLDivElement>(null);

  if (movers.length === 0) return null;

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between px-0.5">
        <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-muted-foreground">
          {t("label")}
        </p>
        <p className="text-[10px] text-muted-foreground/60">{t("scrollHint")}</p>
      </div>

      {/* Manual scroll container — snap, no auto-scroll */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide"
        style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
        role="list"
        aria-label={t("label")}
      >
        {movers.map((m) => {
          const up = m.momPct >= 0;
          const momColor = up ? GREEN : RED;
          const sparkData = m.sparkline ?? [];

          return (
            <div
              key={m.area}
              role="listitem"
              className="flex-shrink-0 flex flex-col justify-between bg-card border border-border/50 rounded-xl p-4 hover:border-accent/40 hover:shadow-sm transition-all"
              style={{ width: 240, scrollSnapAlign: "start" }}
            >
              {/* Top row: area name + ArrowUpRight */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">{m.area}</p>
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/40 flex-shrink-0 mt-0.5" />
              </div>

              {/* PPSF */}
              <p
                className="text-2xl font-bold tabular-nums"
                style={{ color: GOLD }}
              >
                {m.ppsf > 0 ? m.ppsf.toLocaleString() : "—"}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{t("ppsf")}</p>

              {/* Bottom row: MoM + sparkline */}
              <div className="flex items-end justify-between mt-3">
                <div>
                  <p
                    className="text-sm font-bold tabular-nums"
                    style={{ color: momColor, fontVariantNumeric: "tabular-nums" }}
                  >
                    {formatMom(m.momPct)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{t("mom")}</p>
                </div>
                {sparkData.length >= 2 && <Sparkline data={sparkData} up={up} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
