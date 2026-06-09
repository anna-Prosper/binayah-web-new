"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, BarChart3, Layers, Home, Building2,
  ChevronLeft, ChevronRight, CalendarDays, RefreshCw, MapPin,
} from "lucide-react";
import { apiUrl } from "@/lib/api";

// ── Types ──────────────────────────────────────────────────────────────────

interface PrevDay {
  date: string;
  totalTransactions: number;
  totalValue: number;
  offPlanCount: number;
  offPlanValue: number;
  readyCount: number;
  readyValue: number;
}

interface DailyData {
  date: string;
  totalAllTypes: number | null;
  totalTransactions: number;
  totalValue: number;
  offPlanCount: number;
  offPlanValue: number;
  readyCount: number;
  readyValue: number;
  avgPpsf: number | null;
  medianPpsf: number | null;
  topAreas: { name: string; count: number; value: number }[];
  byPropertyType: { type: string; count: number; value: number }[];
  byBedrooms: { bedrooms: number | null; count: number; value: number }[];
  prevDay: PrevDay | null;
}

type T = ReturnType<typeof useTranslations<"pulseDaily">>;

// ── Helpers ────────────────────────────────────────────────────────────────

const AED = (n: number) => {
  if (!n || n <= 0) return "—";
  if (n >= 1_000_000_000) return `AED ${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `AED ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `AED ${(n / 1_000).toFixed(0)}K`;
  return `AED ${n.toLocaleString()}`;
};

const dubaiTodayLabel = () => {
  const dubaiNow = new Date(Date.now() + 4 * 60 * 60 * 1000);
  return dubaiNow.toISOString().split("T")[0];
};

const humanDate = (label: string) => {
  // Parse YYYY-MM-DD as a calendar date without timezone drift.
  const [y, m, d] = label.split("-").map(Number);
  if (!y || !m || !d) return label;
  return new Date(y, m - 1, d).toLocaleDateString("en-AE", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
};

const shiftDate = (label: string, days: number) => {
  const [y, m, d] = label.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
};

// Returns a signed percentage delta, or null when it can't be expressed cleanly.
const delta = (curr: number, prev: number | undefined): number | null => {
  if (prev == null || prev === 0) return null;
  if (!Number.isFinite(curr) || !Number.isFinite(prev)) return null;
  const pct = ((curr - prev) / prev) * 100;
  if (!Number.isFinite(pct)) return null;
  return pct;
};

// ── Count-up hook ────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (!Number.isFinite(target) || target <= 0) { setValue(target || 0); return; }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(target * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);
  return value;
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function DailyClient({ initialData }: { initialData: DailyData | null }) {
  const t = useTranslations("pulseDaily");
  const today = useMemo(() => dubaiTodayLabel(), []);

  const [data, setData] = useState<DailyData | null>(initialData);
  const [activeDate, setActiveDate] = useState<string>(initialData?.date ?? today);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchDay = useCallback(async (date: string) => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(apiUrl(`/api/dld/daily?date=${date}`), {
        signal: AbortSignal.timeout(12_000),
      });
      if (!res.ok) throw new Error("bad response");
      const json: DailyData = await res.json();
      setData(json);
      setActiveDate(json.date ?? date);
    } catch {
      // Keep prior data on-screen; surface an inline notice only.
      setError(true);
      setActiveDate(date);
    } finally {
      setLoading(false);
    }
  }, []);

  const goPrev = () => fetchDay(shiftDate(activeDate, -1));
  const goNext = () => { if (activeDate < today) fetchDay(shiftDate(activeDate, 1)); };
  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (v) fetchDay(v > today ? today : v);
  };

  const isToday = activeDate >= today;
  const hasData = !!data && data.totalTransactions > 0;
  const prev = data?.prevDay ?? null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12">
      {/* ── Date controls ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-accent mb-1">
            {t("heroLabel")}
          </p>
          <p className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            {humanDate(activeDate)}
            {loading && <RefreshCw className="h-4 w-4 text-accent animate-spin" />}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            disabled={loading}
            aria-label={t("prevDay")}
            className="h-11 w-11 flex items-center justify-center rounded-xl bg-card border border-border/60 text-foreground hover:border-accent/50 hover:text-accent transition-colors disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <input
            type="date"
            value={activeDate}
            max={today}
            onChange={onPick}
            aria-label={t("today")}
            className="h-10 rounded-xl bg-card border border-border/60 text-sm text-foreground px-3 focus:outline-none focus:border-accent/60"
          />
          <button
            onClick={goNext}
            disabled={loading || isToday}
            aria-label={t("nextDay")}
            className="h-11 w-11 flex items-center justify-center rounded-xl bg-card border border-border/60 text-foreground hover:border-accent/50 hover:text-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-amber-300/60 bg-amber-50 text-amber-800 text-sm px-4 py-3">
          {t("loadError")}
        </div>
      )}

      {!hasData ? (
        <EmptyDay date={activeDate} onYesterday={() => fetchDay(shiftDate(activeDate, -1))} t={t} />
      ) : (
        <>
          <HeadlineTiles data={data!} prev={prev} t={t} />
          <SplitBar data={data!} t={t} />
          <Leaderboard data={data!} t={t} />
          <MixSection data={data!} t={t} />
        </>
      )}
    </div>
  );
}

// ── Headline tiles ───────────────────────────────────────────────────────────

function HeadlineTiles({ data, prev, t }: { data: DailyData; prev: PrevDay | null; t: T }) {
  const txDelta = delta(data.totalTransactions, prev?.totalTransactions);
  const valDelta = delta(data.totalValue, prev?.totalValue);
  const offPlanShare = data.totalTransactions > 0
    ? (data.offPlanCount / data.totalTransactions) * 100
    : 0;
  const prevOffPlanShare = prev && prev.totalTransactions > 0
    ? (prev.offPlanCount / prev.totalTransactions) * 100
    : undefined;
  const shareDelta = prevOffPlanShare != null
    ? offPlanShare - prevOffPlanShare
    : null;

  return (
    <section>
      <SectionHeader label={t("heroLabel")} title={t("heroTitle")} titleItalic={t("heroTitleItalic")} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Tile
          icon={BarChart3}
          label={data.totalAllTypes != null ? t("totalTransactions") : t("salesTransactions")}
          value={data.totalAllTypes ?? data.totalTransactions}
          format={(n) => Math.round(n).toLocaleString()}
          deltaPct={txDelta}
          footnote={data.totalAllTypes != null ? t("salesCountFootnote", { value: data.totalTransactions.toLocaleString() }) : undefined}
          t={t}
          accent
        />
        <Tile
          icon={TrendingUp}
          label={t("totalValue")}
          value={data.totalValue}
          format={(n) => AED(n)}
          deltaPct={valDelta}
          t={t}
        />
        <Tile
          icon={Layers}
          label={t("medianPpsf")}
          value={data.medianPpsf ?? 0}
          format={(n) => (data.medianPpsf ? `AED ${Math.round(n).toLocaleString()}` : "—")}
          deltaPct={null}
          footnote={data.avgPpsf ? t("avgPpsfFootnote", { value: `AED ${data.avgPpsf.toLocaleString()}` }) : undefined}
          t={t}
        />
        <Tile
          icon={Home}
          label={t("offPlanShare")}
          value={offPlanShare}
          format={(n) => `${Math.round(n)}%`}
          deltaPct={shareDelta}
          deltaIsPoints
          t={t}
        />
      </div>
    </section>
  );
}

function Tile({
  icon: Icon, label, value, format, deltaPct, deltaIsPoints, footnote, t, accent = false,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  format: (n: number) => string;
  deltaPct: number | null;
  deltaIsPoints?: boolean;
  footnote?: string;
  t: T;
  accent?: boolean;
}) {
  const animated = useCountUp(value);
  const up = deltaPct != null && deltaPct > 0;
  const flat = deltaPct != null && Math.abs(deltaPct) < 0.05;

  return (
    <div className={`rounded-2xl p-4 sm:p-5 border ${accent ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border/50"}`}>
      <div className="flex items-start justify-between mb-3">
        <p className={`text-[11px] sm:text-xs font-medium ${accent ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{label}</p>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${accent ? "bg-white/15" : "bg-accent/10"}`}>
          <Icon className={`h-3.5 w-3.5 ${accent ? "text-white" : "text-accent"}`} />
        </div>
      </div>
      <p className={`text-2xl sm:text-3xl font-bold tracking-tight ${accent ? "text-white" : "text-foreground"}`}>
        {format(animated)}
      </p>
      {deltaPct != null && !flat && (
        <div className="mt-2">
          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            accent
              ? (up ? "bg-white/20 text-white" : "bg-black/15 text-white")
              : (up ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600")
          }`}>
            {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {up ? "+" : ""}{deltaPct.toFixed(deltaIsPoints ? 1 : 1)}{deltaIsPoints ? "pp" : "%"}
            <span className={accent ? "text-white/70" : "text-muted-foreground"}>{t("vsYesterday")}</span>
          </span>
        </div>
      )}
      {footnote && (
        <p className={`text-[10px] mt-2 leading-snug ${accent ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{footnote}</p>
      )}
    </div>
  );
}

// ── Split bar (off-plan vs ready) ────────────────────────────────────────────

function SplitBar({ data, t }: { data: DailyData; t: T }) {
  const total = data.offPlanCount + data.readyCount;
  const offPlanPct = total > 0 ? (data.offPlanCount / total) * 100 : 0;
  const readyPct = 100 - offPlanPct;

  return (
    <section>
      <SectionHeader label={t("splitLabel")} title={t("splitTitle")} titleItalic={t("splitTitleItalic")} />
      <div className="bg-card border border-border/50 rounded-2xl p-5">
        <div className="h-12 w-full rounded-xl overflow-hidden flex bg-muted/40">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${offPlanPct}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="h-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
          >
            {offPlanPct >= 12 && (
              <span className="text-[11px] font-bold text-white px-2 truncate">{Math.round(offPlanPct)}%</span>
            )}
          </motion.div>
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${readyPct}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="h-full flex items-center justify-center bg-muted-foreground/20"
          >
            {readyPct >= 12 && (
              <span className="text-[11px] font-bold text-foreground/70 px-2 truncate">{Math.round(readyPct)}%</span>
            )}
          </motion.div>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }} />
            <span className="font-semibold text-foreground">{t("offPlan")}</span>
            <span className="text-muted-foreground">
              {data.offPlanCount.toLocaleString()} · {AED(data.offPlanValue)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-muted-foreground/30" />
            <span className="font-semibold text-foreground">{t("ready")}</span>
            <span className="text-muted-foreground">
              {data.readyCount.toLocaleString()} · {AED(data.readyValue)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Leaderboard (gold) ───────────────────────────────────────────────────────

function Leaderboard({ data, t }: { data: DailyData; t: T }) {
  const rows = data.topAreas ?? [];
  if (rows.length === 0) return null;
  const max = Math.max(...rows.map((r) => r.count), 1);

  return (
    <section>
      <SectionHeader label={t("leaderboardLabel")} title={t("leaderboardTitle")} titleItalic={t("leaderboardTitleItalic")} />
      <div className="bg-card border border-border/50 rounded-2xl p-5 space-y-3">
        {rows.map((row, i) => {
          const pct = (row.count / max) * 100;
          return (
            <div key={row.name} className="flex items-center gap-3">
              <div className="w-5 text-xs font-bold text-muted-foreground tabular-nums flex-shrink-0">{i + 1}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1 gap-2">
                  <span className="text-sm font-semibold text-foreground truncate flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-accent flex-shrink-0" />
                    {row.name}
                  </span>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {row.count.toLocaleString()} {t("salesUnit")} · {AED(row.value)}
                  </span>
                </div>
                <div className="h-3 w-full rounded-full bg-muted/40 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: "easeOut", delay: i * 0.06 }}
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(to right, #D4A847, #B8922F)" }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── Property type + bedroom mix (neutral/green) ──────────────────────────────

function MixSection({ data, t }: { data: DailyData; t: T }) {
  const types = data.byPropertyType ?? [];
  const beds = data.byBedrooms ?? [];
  if (types.length === 0 && beds.length === 0) return null;

  const typeMax = Math.max(...types.map((x) => x.count), 1);
  const bedMax = Math.max(...beds.map((x) => x.count), 1);

  const bedLabel = (b: number | null) => {
    if (b == null || b <= 0) return t("studio");
    return `${b} ${b === 1 ? t("bed") : t("bedPlural")}`;
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {types.length > 0 && (
        <section>
          <SectionHeader label={t("typeMixLabel")} title={t("typeMixTitle")} titleItalic={t("typeMixTitleItalic")} />
          <div className="bg-card border border-border/50 rounded-2xl p-5 space-y-3">
            {types.map((row, i) => (
              <MixRow key={row.type} label={row.type} count={row.count} value={row.value} pct={(row.count / typeMax) * 100} index={i} t={t} />
            ))}
          </div>
        </section>
      )}
      {beds.length > 0 && (
        <section>
          <SectionHeader label={t("bedroomMixLabel")} title={t("bedroomMixTitle")} titleItalic={t("bedroomMixTitleItalic")} />
          <div className="bg-card border border-border/50 rounded-2xl p-5 space-y-3">
            {beds.map((row, i) => (
              <MixRow key={`${row.bedrooms}`} label={bedLabel(row.bedrooms)} count={row.count} value={row.value} pct={(row.count / bedMax) * 100} index={i} t={t} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function MixRow({ label, count, value, pct, index, t }: {
  label: string; count: number; value: number; pct: number; index: number; t: T;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1 gap-2">
          <span className="text-sm font-semibold text-foreground truncate flex items-center gap-1.5">
            <Building2 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            {label}
          </span>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {count.toLocaleString()} · {AED(value)}
          </span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-muted/40 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${pct}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.05 }}
            className="h-full rounded-full"
            style={{ background: "#1A7A5A" }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Empty day ────────────────────────────────────────────────────────────────

function EmptyDay({ date, onYesterday, t }: { date: string; onYesterday: () => void; t: T }) {
  return (
    <div className="bg-card border border-border/50 rounded-2xl p-10 sm:p-14 text-center max-w-2xl mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
        <CalendarDays className="h-7 w-7 text-accent" />
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">{t("emptyTitle")}</h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
        {t("emptyBody", { date: humanDate(date) })}
      </p>
      <button
        onClick={onYesterday}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
        style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
      >
        <ChevronLeft className="h-4 w-4" />
        {t("emptyCta")}
      </button>
    </div>
  );
}

// ── Shared section header (mirrors trending) ─────────────────────────────────

function SectionHeader({ label, title, titleItalic }: { label: string; title: string; titleItalic: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="h-[2px] w-10 bg-accent flex-shrink-0" />
      <div>
        <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-accent">{label}</p>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">
          {title} <span className="font-light">{titleItalic}</span>
        </h2>
      </div>
    </div>
  );
}
