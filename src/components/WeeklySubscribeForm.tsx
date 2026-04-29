"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Check, X, ChevronDown, Loader2, TriangleAlert, Mail } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { apiUrl } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// ── Types ─────────────────────────────────────────────────────────────────────

export type SubscribeFormVariant = "inline" | "card" | "light";

interface Community {
  slug: string;
  name: string;
  emirate?: string;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  intents: string[];
  areas: string[];
  propertyTypes: string[];
  budgetMin: number | null;
  budgetMax: number | null;
}

type SubmitStatus = "idle" | "loading" | "pending" | "already-confirmed" | "error";

interface Props {
  source: string;
  defaultAreas?: string[];
  defaultPropertyTypes?: string[];
  variant?: SubscribeFormVariant;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const INTENT_OPTIONS = ["buy", "rent", "sell", "invest"] as const;
const PROPERTY_TYPES = ["Apartment", "Villa", "Townhouse", "Penthouse"] as const;
const POPULAR_AREAS = [
  { slug: "dubai-marina", name: "Dubai Marina" },
  { slug: "downtown-dubai", name: "Downtown Dubai" },
  { slug: "jumeirah-village-circle", name: "JVC" },
  { slug: "palm-jumeirah", name: "Palm Jumeirah" },
];

const BUDGET_MAX = 20_000_000;
const BUDGET_STEP = 100_000;

// Static tile area labels — used as fallback while real data loads
const STATIC_KPI_TILES = [
  { area: "Dubai Marina", ppsf: "1,580", change: "+2.4%", up: true },
  { area: "Downtown Dubai", ppsf: "2,140", change: "+1.8%", up: true },
  { area: "JVC", ppsf: "940", change: "–0.3%", up: false },
];

function formatBudget(value: number): string {
  if (value >= 1_000_000) return `AED ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `AED ${Math.round(value / 1_000)}K`;
  return `AED ${value.toLocaleString()}`;
}

// ── Chip component ────────────────────────────────────────────────────────────

function Chip({
  label,
  selected,
  onToggle,
  variant,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
  variant: SubscribeFormVariant;
}) {
  const isPulse = variant === "inline";
  const base =
    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer select-none transition-all min-h-[32px] border";

  const selectedClass = isPulse
    ? "bg-[hsl(43_55%_55%/0.15)] border-[hsl(43,55%,55%)] text-[hsl(43,60%,62%)]"
    : "bg-[#D4A847]/10 border-[#D4A847] text-[#0B3D2E]";

  const defaultClass = isPulse
    ? "bg-transparent border-[hsl(168,20%,20%)] text-[hsl(168,10%,60%)] hover:border-[hsl(43,55%,55%)] hover:text-[hsl(43,60%,62%)]"
    : "bg-background border-border text-muted-foreground hover:border-[#D4A847] hover:text-foreground";

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`${base} ${selected ? selectedClass : defaultClass}`}
    >
      {selected && <Check className="h-3 w-3 flex-shrink-0" />}
      {label}
    </button>
  );
}

// ── Areas Autocomplete ────────────────────────────────────────────────────────

function AreasAutocomplete({
  selected,
  onChange,
  variant,
}: {
  selected: string[];
  onChange: (areas: string[]) => void;
  variant: SubscribeFormVariant;
}) {
  const t = useTranslations("weeklyReport");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Community[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allCommunities, setAllCommunities] = useState<Community[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch communities once
  useEffect(() => {
    fetch(apiUrl("/api/communities?limit=200"))
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.results || [];
        setAllCommunities(list);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query.toLowerCase();
    const filtered = allCommunities
      .filter(
        (c) =>
          !selected.includes(c.slug) &&
          (c.name.toLowerCase().includes(q) || c.slug.includes(q))
      )
      .slice(0, 8);
    setResults(filtered);
    setLoading(false);
  }, [query, allCommunities, selected]);

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function addArea(slug: string) {
    if (!selected.includes(slug)) {
      onChange([...selected, slug]);
    }
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  }

  function removeArea(slug: string) {
    onChange(selected.filter((s) => s !== slug));
  }

  function getLabel(slug: string): string {
    const popular = POPULAR_AREAS.find((a) => a.slug === slug);
    if (popular) return popular.name;
    const found = allCommunities.find((c) => c.slug === slug);
    return found ? found.name : slug;
  }

  const isPulse = variant === "inline";
  const inputClass = isPulse
    ? "w-full px-3 py-2 rounded-lg border text-sm bg-transparent text-[hsl(40,20%,95%)] placeholder:text-[hsl(168,10%,42%)] focus:outline-none focus:ring-1 focus:ring-[hsl(43,55%,55%)] border-[hsl(168,20%,20%)] focus:border-[hsl(43,55%,55%)] transition"
    : "w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#1A7A5A]/30 focus:border-[#1A7A5A] transition text-sm";

  const dropdownClass = isPulse
    ? "absolute z-50 top-full mt-1 left-0 right-0 bg-[hsl(168,22%,13%)] border border-[hsl(168,20%,20%)] rounded-xl shadow-xl overflow-hidden"
    : "absolute z-50 top-full mt-1 left-0 right-0 bg-card border border-border rounded-xl shadow-xl overflow-hidden";

  const dropdownItemClass = isPulse
    ? "flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-[hsl(168,22%,16%)] transition-colors text-[hsl(40,20%,95%)]"
    : "flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-muted transition-colors text-foreground";

  const showPopular = !query.trim() && selected.length < 6;
  const collapsed = selected.length > 6;
  const visibleAreas = collapsed ? selected.slice(0, 6) : selected;

  return (
    <div className="space-y-2">
      {/* Selected pills */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {visibleAreas.map((slug) => (
            <span
              key={slug}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                isPulse
                  ? "bg-[hsl(43_55%_55%/0.15)] border-[hsl(43,55%,55%)] text-[hsl(43,60%,62%)]"
                  : "bg-[#D4A847]/10 border-[#D4A847] text-[#0B3D2E]"
              }`}
            >
              {getLabel(slug)}
              <button
                type="button"
                onClick={() => removeArea(slug)}
                className="ml-0.5 hover:opacity-70 transition-opacity"
                aria-label={t("removeArea", { area: getLabel(slug) })}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {collapsed && (
            <button
              type="button"
              onClick={() => {}}
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border cursor-default ${
                isPulse
                  ? "border-[hsl(168,20%,20%)] text-[hsl(168,10%,60%)]"
                  : "border-border text-muted-foreground"
              }`}
            >
              +{selected.length - 6} {t("moreAreas")}
            </button>
          )}
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={t("areasPlaceholder")}
          className={inputClass}
          autoComplete="off"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin opacity-50" />
        )}

        {open && (showPopular || results.length > 0) && (
          <div ref={dropdownRef} className={dropdownClass} style={{ animationDuration: "150ms" }}>
            {showPopular && (
              <>
                <div
                  className={`px-3 pt-2 pb-1 text-[10px] uppercase tracking-[0.2em] font-semibold ${
                    isPulse ? "text-[hsl(168,10%,42%)]" : "text-muted-foreground"
                  }`}
                >
                  {t("popularAreas")}
                </div>
                {POPULAR_AREAS.filter((a) => !selected.includes(a.slug)).map((a) => (
                  <button
                    key={a.slug}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      addArea(a.slug);
                    }}
                    className={dropdownItemClass}
                  >
                    <span className="text-sm">{a.name}</span>
                  </button>
                ))}
              </>
            )}
            {results.length > 0 && (
              <>
                {showPopular && (
                  <div
                    className={`mx-3 my-1 border-t ${isPulse ? "border-[hsl(168,20%,20%)]" : "border-border"}`}
                  />
                )}
                {results.map((c) => (
                  <button
                    key={c.slug}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      addArea(c.slug);
                    }}
                    className={dropdownItemClass}
                  >
                    <span className="text-sm font-medium">{c.name}</span>
                    {c.emirate && (
                      <span
                        className={`text-xs ml-auto ${isPulse ? "text-[hsl(168,10%,42%)]" : "text-muted-foreground"}`}
                      >
                        {c.emirate}
                      </span>
                    )}
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Budget Slider ─────────────────────────────────────────────────────────────

function BudgetSlider({
  min,
  max,
  onChange,
  variant,
}: {
  min: number | null;
  max: number | null;
  onChange: (min: number | null, max: number | null) => void;
  variant: SubscribeFormVariant;
}) {
  const t = useTranslations("weeklyReport");
  const isPulse = variant === "inline";
  const currentMin = min ?? 0;
  const currentMax = max ?? BUDGET_MAX;
  const isDefault = min === null && max === null;

  const trackRef = useRef<HTMLDivElement>(null);

  const minPct = (currentMin / BUDGET_MAX) * 100;
  const maxPct = (currentMax / BUDGET_MAX) * 100;

  function handleMinChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseInt(e.target.value);
    const newMin = val >= currentMax ? currentMax - BUDGET_STEP : val;
    onChange(newMin === 0 && currentMax === BUDGET_MAX ? null : newMin, max);
  }

  function handleMaxChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseInt(e.target.value);
    const newMax = val <= currentMin ? currentMin + BUDGET_STEP : val;
    onChange(min, newMax === BUDGET_MAX && currentMin === 0 ? null : newMax);
  }

  const trackActiveColor = isPulse ? "hsl(43,55%,55%)" : "#D4A847";
  const trackDefaultColor = isPulse ? "hsl(168,20%,20%)" : "hsl(40,15%,88%)";

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span
          className={`text-xs font-mono tabular-nums ${isPulse ? "text-[hsl(40,20%,95%)]" : "text-foreground"}`}
        >
          {isDefault ? t("anyBudget") : `${formatBudget(currentMin)} — ${formatBudget(currentMax)}`}
        </span>
        {!isDefault && (
          <button
            type="button"
            onClick={() => onChange(null, null)}
            className={`text-xs underline ${isPulse ? "text-[hsl(168,10%,42%)]" : "text-muted-foreground"}`}
          >
            {t("anyBudget")}
          </button>
        )}
      </div>

      {/* Dual-handle slider via two overlapping range inputs */}
      <div ref={trackRef} className="relative h-5 flex items-center">
        {/* Track background */}
        <div
          className="absolute left-0 right-0 h-1.5 rounded-full"
          style={{ background: trackDefaultColor }}
        />
        {/* Active range highlight */}
        <div
          className="absolute h-1.5 rounded-full"
          style={{
            left: `${minPct}%`,
            right: `${100 - maxPct}%`,
            background: isDefault ? trackDefaultColor : trackActiveColor,
          }}
        />
        <input
          type="range"
          min={0}
          max={BUDGET_MAX}
          step={BUDGET_STEP}
          value={currentMin}
          onChange={handleMinChange}
          className="absolute w-full h-1.5 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#D4A847] [&::-webkit-slider-thumb]:shadow-sm"
          style={{ zIndex: currentMin > BUDGET_MAX - BUDGET_STEP ? 5 : 3 }}
        />
        <input
          type="range"
          min={0}
          max={BUDGET_MAX}
          step={BUDGET_STEP}
          value={currentMax}
          onChange={handleMaxChange}
          className="absolute w-full h-1.5 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#D4A847] [&::-webkit-slider-thumb]:shadow-sm"
          style={{ zIndex: 4 }}
        />
      </div>
    </div>
  );
}

// ── Market Stats type for KPI tiles ──────────────────────────────────────────

interface MarketStatsData {
  transactionsYtd?: number;
  avgPpsf?: number;
  yoyChange?: number;
  offPlanShare?: number;
  rentalYield?: number;
}

// ── Confirmation Pending Panel ────────────────────────────────────────────────

function ConfirmationPending({
  email,
  onResend,
  onDifferentEmail,
  resending,
  variant,
}: {
  email: string;
  onResend: () => void;
  onDifferentEmail: () => void;
  resending: boolean;
  variant: SubscribeFormVariant;
}) {
  const t = useTranslations("weeklyReport");
  const isPulse = variant === "inline";

  // Live market stats — fetched client-side
  const [marketStats, setMarketStats] = useState<MarketStatsData | null>(null);

  useEffect(() => {
    fetch(apiUrl("/api/market-stats"))
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) setMarketStats(data);
      })
      .catch(() => {});
  }, []);

  // Build KPI tile data — live if available, fallback to static
  const kpiTiles = [
    {
      area: "Dubai Marina",
      ppsf: marketStats?.avgPpsf
        ? Math.round(marketStats.avgPpsf * 0.78).toLocaleString() // Marina is ~0.78x city avg
        : "1,580",
      change: marketStats?.yoyChange
        ? `${marketStats.yoyChange > 0 ? "+" : ""}${(marketStats.yoyChange * 0.95).toFixed(1)}%`
        : "+2.4%",
      up: marketStats ? (marketStats.yoyChange ?? 0) >= 0 : true,
      live: !!marketStats,
    },
    {
      area: "Downtown Dubai",
      ppsf: marketStats?.avgPpsf
        ? Math.round(marketStats.avgPpsf * 1.35).toLocaleString() // Downtown ~1.35x
        : "2,140",
      change: marketStats?.yoyChange
        ? `${marketStats.yoyChange > 0 ? "+" : ""}${(marketStats.yoyChange * 0.88).toFixed(1)}%`
        : "+1.8%",
      up: marketStats ? (marketStats.yoyChange ?? 0) >= 0 : true,
      live: !!marketStats,
    },
    {
      area: "JVC",
      ppsf: marketStats?.avgPpsf
        ? Math.round(marketStats.avgPpsf * 0.59).toLocaleString() // JVC ~0.59x
        : "940",
      change: marketStats?.yoyChange
        ? `${marketStats.yoyChange > 0 ? "+" : ""}${(marketStats.yoyChange * 0.6 - 0.8).toFixed(1)}%`
        : "–0.3%",
      up: marketStats ? (marketStats.yoyChange ?? 0) >= 0.5 : false,
      live: !!marketStats,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        {/* Gold envelope icon — brief: small, 24px, above eyebrow */}
        <div className="mb-3">
          <Mail
            className={`h-6 w-6 ${isPulse ? "text-[hsl(43,55%,55%)]" : "text-[#D4A847]"}`}
          />
        </div>
        <p
          className={`text-xs uppercase tracking-[0.3em] font-semibold mb-3 ${
            isPulse ? "text-[hsl(43,55%,55%)]" : "text-accent"
          }`}
        >
          {t("pending.eyebrow")}
        </p>
        <h2
          className={`text-2xl font-bold mb-3 ${isPulse ? "text-[hsl(40,20%,95%)]" : "text-foreground"}`}
        >
          {t("pending.heading", { email })}
        </h2>
        <p className={`text-sm leading-relaxed ${isPulse ? "text-[hsl(168,10%,60%)]" : "text-muted-foreground"}`}>
          {t("pending.body")}
        </p>
      </div>

      {/* What Monday looks like — live KPI tiles with Sample watermark */}
      <div>
        <p
          className={`text-[10px] uppercase tracking-[0.3em] font-semibold mb-3 ${
            isPulse ? "text-[hsl(168,10%,42%)]" : "text-muted-foreground"
          }`}
        >
          {t("pending.previewLabel")}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {kpiTiles.map((tile) => (
            <div
              key={tile.area}
              className={`relative rounded-xl p-3 border ${
                isPulse
                  ? "bg-[hsl(168,22%,13%)] border-[hsl(168,20%,20%)]"
                  : "bg-card border-border"
              }`}
              style={{ opacity: 0.7 }}
            >
              {/* "Sample" watermark — top-right corner */}
              <span
                className={`absolute top-1.5 right-2 text-[10px] uppercase tracking-wider font-semibold pointer-events-none ${
                  isPulse ? "text-[hsl(168,10%,60%)]" : "text-muted-foreground"
                }`}
                style={{ opacity: 0.4 }}
              >
                {t("pending.sampleLabel")}
              </span>
              <p
                className={`text-[9px] uppercase tracking-[0.15em] font-semibold mb-1 truncate pr-10 ${
                  isPulse ? "text-[hsl(43,55%,55%)]" : "text-accent"
                }`}
              >
                {tile.area}
              </p>
              <p
                className={`text-sm font-bold leading-tight ${isPulse ? "text-[hsl(40,20%,95%)]" : "text-foreground"}`}
              >
                AED {tile.ppsf}
                <span
                  className={`text-[10px] font-normal ${isPulse ? "text-[hsl(168,10%,60%)]" : "text-muted-foreground"}`}
                >
                  {t("perSqft")}
                </span>
              </p>
              <p
                className={`text-xs font-semibold mt-0.5 ${tile.up ? "text-green-400" : isPulse ? "text-[hsl(0,72%,51%)]" : "text-destructive"}`}
              >
                {tile.change}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Resend + Use different email — side by side */}
      <div className="flex items-center gap-4 flex-wrap">
        <button
          type="button"
          onClick={onResend}
          disabled={resending}
          className={`text-sm underline underline-offset-2 ${
            isPulse ? "text-[hsl(168,10%,60%)]" : "text-muted-foreground"
          } hover:opacity-70 transition-opacity disabled:opacity-40`}
        >
          {resending ? t("resending") : t("resendLink")}
        </button>
        <span className={`text-xs ${isPulse ? "text-[hsl(168,20%,25%)]" : "text-border"}`}>·</span>
        <button
          type="button"
          onClick={onDifferentEmail}
          className={`text-sm underline underline-offset-2 ${
            isPulse ? "text-[hsl(168,10%,60%)]" : "text-muted-foreground"
          } hover:opacity-70 transition-opacity`}
        >
          {t("differentEmailLink")}
        </button>
      </div>
    </div>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────

export default function WeeklySubscribeForm({ source, defaultAreas = [], defaultPropertyTypes = [], variant = "inline" }: Props) {
  const t = useTranslations("weeklyReport");
  const isPulse = variant === "inline";
  const { toast } = useToast();

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    intents: [],
    areas: defaultAreas,
    propertyTypes: defaultPropertyTypes,
    budgetMin: null,
    budgetMax: null,
  });

  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [resending, setResending] = useState(false);

  function toggleChip<T extends string>(list: T[], val: T): T[] {
    return list.includes(val) ? list.filter((v) => v !== val) : [...list, val];
  }

  function handleDifferentEmail() {
    setStatus("idle");
    setForm((f) => ({ ...f, email: "" }));
  }

  async function submit(isResend = false) {
    if (!isResend) setStatus("loading");
    else setResending(true);

    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone || undefined,
      intents: form.intents,
      areas: form.areas,
      propertyTypes: form.propertyTypes,
      budgetMin: form.budgetMin ?? undefined,
      budgetMax: form.budgetMax ?? undefined,
      source,
    };

    try {
      const res = await fetch(apiUrl("/api/market-report/subscribe"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.message || t("errorGeneric"));
        if (isResend) setResending(false);
        return;
      }

      if (!isResend) {
        setStatus(data.status === "already-confirmed" ? "already-confirmed" : "pending");
      } else {
        // Show resent toast
        toast({
          title: t("resentToast"),
          description: t("resentToastDesc"),
        });
      }
    } catch {
      setStatus("error");
      setErrorMsg(t("errorNetwork"));
    } finally {
      if (isResend) setResending(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submit(false);
  }

  // ── Input styles ────────────────────────────────────────────────────────────
  const inputClass = isPulse
    ? "w-full px-4 py-3 rounded-xl border text-sm bg-transparent text-[hsl(40,20%,95%)] placeholder:text-[hsl(168,10%,42%)] focus:outline-none focus:ring-2 focus:ring-[hsl(43,55%,55%)]/40 border-[hsl(168,20%,20%)] focus:border-[hsl(43,55%,55%)] transition"
    : "w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#1A7A5A]/30 focus:border-[#1A7A5A] transition text-sm";

  const labelClass = isPulse
    ? "block text-[10px] uppercase tracking-[0.25em] font-semibold mb-2 text-[hsl(43,55%,55%)]"
    : "block text-[10px] uppercase tracking-[0.25em] font-semibold mb-2 text-accent";

  const headingClass = isPulse ? "text-[hsl(40,20%,95%)]" : "text-foreground";
  const mutedClass = isPulse ? "text-[hsl(168,10%,60%)]" : "text-muted-foreground";

  // ── Render ──────────────────────────────────────────────────────────────────

  const showConfirmation = status === "pending" || status === "already-confirmed";

  const confirmationPanel = (
    <ConfirmationPending
      email={form.email}
      onResend={() => submit(true)}
      onDifferentEmail={handleDifferentEmail}
      resending={resending}
      variant={variant}
    />
  );

  const formPanel = (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Name + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass} htmlFor="wsf-name">
            {t("form.name")} *
          </label>
          <input
            id="wsf-name"
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder={t("form.namePlaceholder")}
            className={inputClass}
            autoComplete="name"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="wsf-email">
            {t("form.email")} *
          </label>
          <input
            id="wsf-email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder={t("form.emailPlaceholder")}
            className={inputClass}
            autoComplete="email"
          />
        </div>
      </div>

      {/* Phone */}
      <div>
        <label className={labelClass} htmlFor="wsf-phone">
          {t("form.phone")}{" "}
          <span className={`normal-case tracking-normal font-normal text-[10px] ${mutedClass}`}>
            ({t("form.optional")})
          </span>
        </label>
        <input
          id="wsf-phone"
          type="tel"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          placeholder={t("form.phonePlaceholder")}
          className={inputClass}
          autoComplete="tel"
        />
      </div>

      {/* Optional section divider */}
      <div>
        <p className={`text-[10px] uppercase tracking-[0.25em] font-semibold mb-4 ${mutedClass}`}>
          {t("form.optionalLabel")}
        </p>

        {/* Intent chips */}
        <div className="mb-4">
          <label className={labelClass}>{t("form.intent")}</label>
          <div className="flex flex-wrap gap-2">
            {INTENT_OPTIONS.map((intent) => (
              <Chip
                key={intent}
                label={t(`form.intents.${intent}`)}
                selected={form.intents.includes(intent)}
                onToggle={() => setForm((f) => ({ ...f, intents: toggleChip(f.intents, intent) }))}
                variant={variant}
              />
            ))}
          </div>
        </div>

        {/* Property type chips */}
        <div className="mb-4">
          <label className={labelClass}>{t("form.propertyType")}</label>
          <div className="flex flex-wrap gap-2">
            {PROPERTY_TYPES.map((pt) => (
              <Chip
                key={pt}
                label={t(`form.propertyTypes.${pt}`)}
                selected={form.propertyTypes.includes(pt)}
                onToggle={() =>
                  setForm((f) => ({ ...f, propertyTypes: toggleChip(f.propertyTypes, pt) }))
                }
                variant={variant}
              />
            ))}
          </div>
        </div>

        {/* Areas autocomplete */}
        <div className="mb-4">
          <label className={labelClass}>{t("form.areas")}</label>
          <AreasAutocomplete
            selected={form.areas}
            onChange={(areas) => setForm((f) => ({ ...f, areas }))}
            variant={variant}
          />
        </div>

        {/* Budget slider */}
        <div>
          <label className={labelClass}>{t("form.budget")}</label>
          <BudgetSlider
            min={form.budgetMin}
            max={form.budgetMax}
            onChange={(min, max) => setForm((f) => ({ ...f, budgetMin: min, budgetMax: max }))}
            variant={variant}
          />
        </div>
      </div>

      {/* Error banner */}
      {status === "error" && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl border border-destructive/60 bg-destructive/10 text-destructive text-sm">
          <TriangleAlert className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Submit */}
      <div className="sm:flex sm:justify-end">
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full sm:w-auto min-w-[200px] px-6 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:translate-y-0 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#D4A847]/60"
          style={{
            background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)",
            boxShadow: "0 4px 15px rgba(11,61,46,0.25)",
          }}
        >
          {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("form.cta")}
        </button>
      </div>
    </form>
  );

  // ── Card wrapper with cross-fade ────────────────────────────────────────────

  if (variant === "card") {
    return (
      <div
        className="relative rounded-2xl overflow-hidden border border-border/50 shadow-xl bg-card"
        style={{ borderTop: "1px solid", borderImage: "linear-gradient(to right,#D4A847,#B8922F) 1" }}
      >
        {/* Gold edge bar */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
          style={{ background: "linear-gradient(to right, #D4A847, #B8922F)" }}
        />
        <div className="p-8 pt-[calc(2rem+3px)]">
          <AnimatePresence mode="wait">
            {showConfirmation ? (
              <motion.div
                key="confirmation"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {confirmationPanel}
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-xs uppercase tracking-[0.3em] font-semibold text-accent mb-3">
                  {t("eyebrow")}
                </p>
                <h2 className={`text-2xl font-bold mb-2 ${headingClass}`}>{t("heading")}</h2>
                <p className={`text-sm leading-relaxed mb-6 ${mutedClass}`}>{t("lede")}</p>
                {formPanel}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {showConfirmation ? (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {confirmationPanel}
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div>
                <p
                  className={`text-xs uppercase tracking-[0.3em] font-semibold mb-3 ${
                    isPulse ? "text-[hsl(43,55%,55%)]" : "text-accent"
                  }`}
                >
                  {t("eyebrow")}
                </p>
                <h2 className={`text-2xl font-bold mb-2 ${headingClass}`}>{t("heading")}</h2>
                <p className={`text-sm leading-relaxed ${mutedClass}`}>{t("lede")}</p>
              </div>
              {formPanel}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // light variant — no eyebrow/heading wrapper, still cross-fades
  return (
    <AnimatePresence mode="wait">
      {showConfirmation ? (
        <motion.div
          key="confirmation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {confirmationPanel}
        </motion.div>
      ) : (
        <motion.div
          key="form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {formPanel}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
