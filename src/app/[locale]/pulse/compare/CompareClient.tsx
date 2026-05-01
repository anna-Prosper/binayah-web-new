"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, BarChart2, Building2, TrendingUp, Star, Landmark } from "lucide-react";
import { apiUrl } from "@/lib/api";

// ── Types ──────────────────────────────────────────────────────────────────

interface DldArea {
  _id: string;
  slug: string;
  name: string;
  city?: string;
  totalUnits: number;
  totalSales: number;
  totalRents: number;
  buildingCount: number;
  avgPpsf: number | null;
  avgPrice: number | null;
  lastAggregatedAt?: string | null;
}

interface DldAreaYield {
  grossYieldPct: number | null;
  salesSampleSize: number;
  rentSampleSize: number;
  lowConfidence: boolean;
}

interface Developer {
  _id: string;
  name: string;
  slug: string;
  totalProjects?: number;
  offPlanCount?: number;
  communities?: string[];
}

interface DldBuilding {
  _id: string;
  slug: string;
  name: string;
  area: string;
  masterProject?: string;
  city?: string;
  sales: number;
  rents: number;
  units: number;
  avgPpsf: number;
  avgPrice: number;
}

type Mode = "communities" | "developers" | "buildings";

// ── Preset slugs — canonical area labels from the market-stats endpoint
// DLD area names come from /api/dld/areas, not local community aliases.
const PRESETS: { id: string; nameKey: string; slugs: string[] }[] = [
  {
    id: "waterfront",
    nameKey: "presetWaterfront",
    slugs: ["Dubai Marina", "Palm Jumeirah", "Dubai Maritime City"],
  },
  {
    id: "highyield",
    nameKey: "presetHighYield",
    slugs: ["Jumeirah Village Circle", "Dubai Land Residence Complex", "International City Ph 1"],
  },
  {
    id: "urban",
    nameKey: "presetUrban",
    slugs: ["Business Bay", "Zaabeel Second", "Al Wasl"],
  },
  {
    id: "emerging",
    nameKey: "presetEmerging",
    slugs: ["Al Yelayiss 1", "Al Hebiah Fifth", "Madinat Al Mataar"],
  },
];

const AREA_ALIASES: Record<string, string> = {
  jlt: "Jumeirah Lakes Towers",
  "jumeirah lake towers": "Jumeirah Lakes Towers",
  "deira dubai": "Deira",
  deira: "Deira",
  marina: "Dubai Marina",
  "dubai marina": "Dubai Marina",
  jvc: "Jumeirah Village Circle",
  "dubai hills": "Hadaeq Sheikh Mohammed Bin Rashid",
  "dubai hills estate": "Hadaeq Sheikh Mohammed Bin Rashid",
  "creek harbour": "Al Khairan First",
  "dubai creek harbour": "Al Khairan First",
};

function normalizeAreaName(value: string) {
  return value.trim().toLowerCase();
}

function resolveAreaQuery(value: string) {
  return AREA_ALIASES[normalizeAreaName(value)] ?? value;
}

// ── Helpers ────────────────────────────────────────────────────────────────

const AED = (n: number) => {
  if (n >= 1_000_000) return `AED ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `AED ${(n / 1_000).toFixed(0)}K`;
  return n > 0 ? `AED ${n.toLocaleString()}` : "—";
};

const pct = (n: number) => n > 0 ? `${n.toFixed(1)}%` : "—";

function highlight(vals: (number | null)[], i: number): boolean {
  const filtered = vals.filter((v): v is number => v !== null && v > 0);
  if (filtered.length === 0) return false;
  const max = Math.max(...filtered);
  return vals[i] === max && max > 0;
}

// ── Debounce hook ──────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function CompareClient({
  dldAreas,
  developers,
}: {
  dldAreas: { results?: DldArea[] } | DldArea[] | null;
  developers: Developer[] | null;
}) {
  const t = useTranslations("pulseCompare");

  const [mode, setMode] = useState<Mode>("communities");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  // ── Buildings mode state ──────────────────────────────────────────────────
  const [buildingSearchResults, setBuildingSearchResults] = useState<DldBuilding[]>([]);
  const [buildingSearchLoading, setBuildingSearchLoading] = useState(false);
  // selectedBuildings stores full building objects for the comparison table
  const [selectedBuildings, setSelectedBuildings] = useState<DldBuilding[]>([]);
  const [areaSearchResults, setAreaSearchResults] = useState<DldArea[]>([]);
  const [areaSearchLoading, setAreaSearchLoading] = useState(false);
  const [areaYields, setAreaYields] = useState<Record<string, DldAreaYield | null>>({});

  const debouncedQuery = useDebounce(query, 300);

  // ── Search base lists ────────────────────────────────────────────────────
  const dldAreaList: DldArea[] = useMemo(() => {
    const raw = Array.isArray(dldAreas) ? dldAreas : dldAreas?.results ?? [];
    return raw;
  }, [dldAreas]);

  const developerList: Developer[] = useMemo(() => {
    const raw = Array.isArray(developers) ? developers : [];
    return raw;
  }, [developers]);

  const knownDldAreas = useMemo(() => {
    const bySlug = new Map<string, DldArea>();
    [...dldAreaList, ...areaSearchResults].forEach((area) => {
      bySlug.set(area.slug, area);
    });
    return Array.from(bySlug.values());
  }, [dldAreaList, areaSearchResults]);

  const findKnownArea = useCallback((name: string) => {
    const normalizedName = normalizeAreaName(name);
    const resolvedName = normalizeAreaName(resolveAreaQuery(name));
    return knownDldAreas.find((area) => {
      const areaName = normalizeAreaName(area.name);
      return areaName === normalizedName || areaName === resolvedName;
    });
  }, [knownDldAreas]);

  // ── Fetch buildings when query changes in buildings mode ──────────────────
  useEffect(() => {
    if (mode !== "buildings") return;
    if (!debouncedQuery.trim()) {
      setBuildingSearchResults([]);
      return;
    }
    setBuildingSearchLoading(true);
    fetch(apiUrl(`/api/dld/buildings?q=${encodeURIComponent(debouncedQuery.trim())}&limit=10`))
      .then((r) => r.ok ? r.json() : { results: [] })
      .then((data: { results?: DldBuilding[] }) => {
        setBuildingSearchResults(Array.isArray(data.results) ? data.results : []);
      })
      .catch(() => setBuildingSearchResults([]))
      .finally(() => setBuildingSearchLoading(false));
  }, [debouncedQuery, mode]);

  // ── Fetch DLD areas when query changes in communities mode ────────────────
  useEffect(() => {
    if (mode !== "communities") return;
    if (!debouncedQuery.trim()) {
      setAreaSearchResults([]);
      return;
    }
    setAreaSearchLoading(true);
    const areaQuery = resolveAreaQuery(debouncedQuery.trim());
    fetch(apiUrl(`/api/dld/areas?q=${encodeURIComponent(areaQuery)}&sortBy=totalSales&limit=12`))
      .then((r) => r.ok ? r.json() : { results: [] })
      .then((data: { results?: DldArea[] }) => {
        setAreaSearchResults(Array.isArray(data.results) ? data.results : []);
      })
      .catch(() => setAreaSearchResults([]))
      .finally(() => setAreaSearchLoading(false));
  }, [debouncedQuery, mode]);

  // ── Fetch DLD rent/sale yield for selected areas only ────────────────────
  useEffect(() => {
    if (mode !== "communities" || selected.length === 0) return;
    const selectedAreas = selected
      .map((name) => findKnownArea(name))
      .filter((area): area is DldArea => Boolean(area));

    selectedAreas.forEach((area) => {
      if (areaYields[area.slug] !== undefined) return;
      fetch(apiUrl(`/api/dld/areas/${area.slug}/yield`))
        .then((r) => r.ok ? r.json() : null)
        .then((data: DldAreaYield | null) => {
          setAreaYields((prev) => ({ ...prev, [area.slug]: data }));
        })
        .catch(() => {
          setAreaYields((prev) => ({ ...prev, [area.slug]: null }));
        });
    });
  }, [selected, mode, areaYields, findKnownArea]);

  useEffect(() => {
    if (mode !== "communities" || selected.length === 0) return;
    const missing = selected.find((name) => !findKnownArea(name));
    if (!missing) return;

    fetch(apiUrl(`/api/dld/areas?q=${encodeURIComponent(resolveAreaQuery(missing))}&sortBy=totalSales&limit=3`))
      .then((r) => r.ok ? r.json() : { results: [] })
      .then((data: { results?: DldArea[] }) => {
        const results = Array.isArray(data.results) ? data.results : [];
        if (results.length > 0) {
          setAreaSearchResults((prev) => {
            const seen = new Set(prev.map((area) => area.slug));
            return [...prev, ...results.filter((area) => !seen.has(area.slug))];
          });
        }
      })
      .catch(() => {});
  }, [selected, mode, findKnownArea]);

  const items = mode === "communities" ? dldAreaList : developerList;

  const filtered = useMemo(() => {
    if (mode === "buildings") return [];
    if (mode === "communities" && query.trim()) return areaSearchResults;
    if (!query.trim()) return items.slice(0, 12);
    const q = query.toLowerCase();
    return items.filter((item) => item.name.toLowerCase().includes(q)).slice(0, 12);
  }, [items, query, mode, areaSearchResults]);

  const addItem = (name: string) => {
    if (selected.length >= 3) return;
    if (!selected.includes(name)) setSelected([...selected, name]);
    setQuery("");
  };

  const removeItem = (name: string) => {
    setSelected(selected.filter((s) => s !== name));
  };

  const addBuilding = (building: DldBuilding) => {
    if (selectedBuildings.length >= 3) return;
    if (!selectedBuildings.find((b) => b.slug === building.slug)) {
      setSelectedBuildings([...selectedBuildings, building]);
    }
    setQuery("");
    setBuildingSearchResults([]);
  };

  const removeBuilding = (slug: string) => {
    setSelectedBuildings(selectedBuildings.filter((b) => b.slug !== slug));
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    if (mode !== "communities") setMode("communities");
    const availableNames = new Set(dldAreaList.map((area) => area.name.toLowerCase()));
    const resolved = preset.slugs.filter((name) => availableNames.has(name.toLowerCase()));
    setSelected((resolved.length >= 2 ? resolved : preset.slugs).slice(0, 3));
  };

  const handleModeChange = (m: Mode) => {
    setMode(m);
    setSelected([]);
    setQuery("");
    setBuildingSearchResults([]);
    setAreaSearchResults([]);
    if (m !== "buildings") setSelectedBuildings([]);
  };

  const getCommunityData = (name: string) => {
    const area = findKnownArea(name);
    const yld = area ? areaYields[area.slug] : null;
    return {
      ppsf: area?.avgPpsf ?? 0,
      yield: yld?.grossYieldPct ?? 0,
      volume: area?.totalSales ?? 0,
      avgDeal: area?.avgPrice ?? 0,
      rents: area?.totalRents ?? 0,
      buildings: area?.buildingCount ?? 0,
      units: area?.totalUnits ?? 0,
      lowConfidence: yld?.lowConfidence ?? false,
      hasData: Boolean(area),
    };
  };

  const getDeveloperData = (name: string) => {
    const dev = developerList.find((d) => d.name.toLowerCase() === name.toLowerCase());
    if (!dev) return null;
    return dev;
  };

  const showTable = selected.length >= 2;
  const showBuildingsTable = selectedBuildings.length >= 2;

  const selectedCount = mode === "buildings" ? selectedBuildings.length : selected.length;
  const maxReached = selectedCount >= 3;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* ── Hero ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-3">
          <BarChart2 className="h-5 w-5 text-accent" />
          <p className="text-accent font-semibold tracking-[0.3em] uppercase text-xs">{t("label")}</p>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
          {t("title")} <span className="italic font-light">{t("titleItalic")}</span>
        </h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </motion.div>

      {/* ── Mode Toggle ─────────────────────────────────────────── */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["communities", "developers", "buildings"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => handleModeChange(m)}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all min-h-[40px] ${
              mode === m
                ? "text-white shadow-sm"
                : "border border-border/60 text-muted-foreground hover:text-foreground hover:border-accent/40"
            }`}
            style={mode === m ? { background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" } : undefined}
          >
            {m === "communities" ? (
              <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" />{t("modeCommunities")}</span>
            ) : m === "developers" ? (
              <span className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5" />{t("modeDevelopers")}</span>
            ) : (
              <span className="flex items-center gap-1.5"><Landmark className="h-3.5 w-3.5" />{t("modeBuildings")}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Search ──────────────────────────────────────────────── */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            mode === "communities"
              ? t("searchCommunities")
              : mode === "developers"
              ? t("searchDevelopers")
              : t("searchBuildings")
          }
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          disabled={maxReached}
        />
        {maxReached && (
          <p className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{t("maxReached")}</p>
        )}
      </div>

      {/* ── Search dropdown (communities / developers) ───────────── */}
      <AnimatePresence>
        {mode !== "buildings" && query.trim() && (filtered.length > 0 || (mode === "communities" && areaSearchLoading)) && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-4 bg-card border border-border/50 rounded-xl shadow-lg overflow-hidden"
          >
            {mode === "communities" && areaSearchLoading && (
              <div className="px-4 py-3 text-sm text-muted-foreground">{t("searching")}</div>
            )}
            {filtered.map((item) => (
              <button
                key={item._id}
                onClick={() => addItem(item.name)}
                disabled={selected.includes(item.name)}
                className="w-full text-left px-4 py-3 text-sm hover:bg-muted/50 transition-colors border-b border-border/30 last:border-0 disabled:opacity-40"
              >
                <span className="font-medium">{item.name}</span>
                {mode === "communities" && "totalSales" in item && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    {(item.totalSales ?? 0).toLocaleString()} {t("txVolume").toLowerCase()}
                  </span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Buildings search dropdown ─────────────────────────────── */}
      <AnimatePresence>
        {mode === "buildings" && query.trim() && (buildingSearchResults.length > 0 || buildingSearchLoading) && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-4 bg-card border border-border/50 rounded-xl shadow-lg overflow-hidden"
          >
            {buildingSearchLoading && (
              <div className="px-4 py-3 text-sm text-muted-foreground">{t("searching")}</div>
            )}
            {!buildingSearchLoading && buildingSearchResults.map((building) => (
              <button
                key={building._id}
                onClick={() => addBuilding(building)}
                disabled={selectedBuildings.some((b) => b.slug === building.slug)}
                className="w-full text-left px-4 py-3 text-sm hover:bg-muted/50 transition-colors border-b border-border/30 last:border-0 disabled:opacity-40"
              >
                <span className="font-medium">{building.name}</span>
                {building.area && (
                  <span className="ml-2 text-xs text-muted-foreground">{building.area}</span>
                )}
              </button>
            ))}
            {!buildingSearchLoading && buildingSearchResults.length === 0 && query.trim() && (
              <div className="px-4 py-3 text-sm text-muted-foreground">{t("noResults")}</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Selected chips (communities / developers) ────────────── */}
      {mode !== "buildings" && selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {selected.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-white text-sm font-medium"
            >
              {name}
              <button
                onClick={() => removeItem(name)}
                className="hover:text-white/60 transition-colors"
                aria-label={`Remove ${name}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* ── Selected chips (buildings) ───────────────────────────── */}
      {mode === "buildings" && selectedBuildings.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {selectedBuildings.map((b) => (
            <span
              key={b.slug}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-white text-sm font-medium"
            >
              {b.name}
              <button
                onClick={() => removeBuilding(b.slug)}
                className="hover:text-white/60 transition-colors"
                aria-label={`Remove ${b.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* ── Presets (communities mode only, shown when < 2 selected) ─── */}
      {!showTable && mode === "communities" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <p className="text-sm font-semibold text-muted-foreground mb-3">{t("presetsLabel")}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className="p-4 rounded-xl border border-border/50 bg-card hover:border-accent/40 hover:shadow-sm transition-all text-left"
              >
                <p className="text-sm font-semibold text-foreground mb-1">
                  {t(preset.nameKey as keyof ReturnType<typeof useTranslations<"pulseCompare">>)}
                </p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  {preset.slugs.join(" · ")}
                </p>
              </button>
            ))}
          </div>

          {selected.length === 1 && (
            <div className="mt-6 p-4 bg-muted/30 rounded-xl border border-border/30 text-center text-sm text-muted-foreground">
              {t("selectOneMore")}
            </div>
          )}

          {selected.length === 0 && (
            <div className="mt-6 p-8 bg-muted/20 rounded-xl border border-border/30 text-center">
              <BarChart2 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-base font-semibold text-muted-foreground">{t("emptyTitle")}</p>
              <p className="text-sm text-muted-foreground/60 mt-1">{t("emptySub")}</p>
            </div>
          )}
        </motion.div>
      )}

      {/* ── Buildings mode empty / hint states ──────────────────── */}
      {mode === "buildings" && !showBuildingsTable && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          {selectedBuildings.length === 1 && (
            <div className="mt-0 p-4 bg-muted/30 rounded-xl border border-border/30 text-center text-sm text-muted-foreground">
              {t("selectOneMoreBuilding")}
            </div>
          )}

          {selectedBuildings.length === 0 && (
            <div className="mt-0 p-8 bg-muted/20 rounded-xl border border-border/30 text-center">
              <Landmark className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-base font-semibold text-muted-foreground">{t("buildingEmptyTitle")}</p>
              <p className="text-sm text-muted-foreground/60 mt-1">{t("buildingEmptySub")}</p>
            </div>
          )}
        </motion.div>
      )}

      {/* ── Comparison table ─────────────────────────────────────── */}
      <AnimatePresence>
        {showTable && mode === "communities" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <CommunityTable
              selected={selected}
              getData={getCommunityData}
              t={t}
            />
          </motion.div>
        )}
        {showTable && mode === "developers" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <DeveloperTable
              selected={selected}
              getData={getDeveloperData}
              t={t}
            />
          </motion.div>
        )}
        {showBuildingsTable && mode === "buildings" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <BuildingTable
              buildings={selectedBuildings}
              t={t}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Community Comparison Table ─────────────────────────────────────────────

function CommunityTable({
  selected,
  getData,
  t,
}: {
  selected: string[];
  getData: (name: string) => {
    ppsf: number;
    yield: number;
    volume: number;
    avgDeal: number;
    rents: number;
    buildings: number;
    units: number;
    lowConfidence: boolean;
    hasData: boolean;
  };
  t: ReturnType<typeof useTranslations<"pulseCompare">>;
}) {
  const rows = selected.map(getData);

  const ppsfVals = rows.map((r) => r.ppsf);
  const yieldVals = rows.map((r) => r.yield);
  const volVals = rows.map((r) => r.volume);
  const dealVals = rows.map((r) => r.avgDeal);
  const rentVals = rows.map((r) => r.rents);
  const buildingVals = rows.map((r) => r.buildings);
  const unitVals = rows.map((r) => r.units);

  return (
    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 bg-muted/20 px-4 py-3">
        <p className="text-xs font-semibold text-foreground">{t("dldCommunitySource")}</p>
        <p className="text-[11px] text-muted-foreground">{t("dldYieldNote")}</p>
      </div>
      <div className="grid sm:grid-cols-3 gap-3 p-4 border-b border-border/40 bg-gradient-to-br from-emerald-950/[0.03] via-transparent to-amber-500/[0.06]">
        {rows.map((row, i) => (
          <div key={selected[i]} className="rounded-2xl border border-border/40 bg-background/80 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-foreground">{selected[i]}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {row.hasData ? t("dldMatched") : t("dldMissing")}
                </p>
              </div>
              <span className={`h-2.5 w-2.5 rounded-full mt-1 ${row.hasData ? "bg-emerald-500" : "bg-amber-500"}`} />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{t("priceSqft")}</p>
                <p className="text-lg font-bold text-foreground mt-1">{row.ppsf > 0 ? `AED ${Math.round(row.ppsf).toLocaleString()}` : "—"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{t("txVolume")}</p>
                <p className="text-lg font-bold text-foreground mt-1">{row.volume > 0 ? row.volume.toLocaleString() : "—"}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground w-40">{t("metric")}</th>
              {selected.map((name) => (
                <th key={name} className="px-4 py-3 text-right text-xs font-bold text-foreground">
                  {name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <TableRow
              label={t("priceSqft")}
              values={ppsfVals.map((v) => v > 0 ? `AED ${v.toLocaleString()}` : "—")}
              highlights={ppsfVals.map((v, i) => highlight(ppsfVals, i))}
            />
            <TableRow
              label={t("grossYield")}
              values={rows.map((r) => {
                const value = pct(r.yield);
                return r.lowConfidence && value !== "—" ? `${value}*` : value;
              })}
              highlights={yieldVals.map((v, i) => highlight(yieldVals, i))}
            />
            <TableRow
              label={t("txVolume")}
              values={volVals.map((v) => v > 0 ? v.toLocaleString() : "—")}
              highlights={volVals.map((v, i) => highlight(volVals, i))}
            />
            <TableRow
              label={t("avgDealSize")}
              values={dealVals.map((v) => AED(v))}
              highlights={dealVals.map((v, i) => highlight(dealVals, i))}
            />
            <TableRow
              label={t("rentContracts")}
              values={rentVals.map((v) => v > 0 ? v.toLocaleString() : "—")}
              highlights={rentVals.map((v, i) => highlight(rentVals, i))}
            />
            <TableRow
              label={t("buildingCount")}
              values={buildingVals.map((v) => v > 0 ? v.toLocaleString() : "—")}
              highlights={buildingVals.map((v, i) => highlight(buildingVals, i))}
            />
            <TableRow
              label={t("registeredUnits")}
              values={unitVals.map((v) => v > 0 ? v.toLocaleString() : "—")}
              highlights={unitVals.map((v, i) => highlight(unitVals, i))}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Developer Comparison Table ─────────────────────────────────────────────

function DeveloperTable({
  selected,
  getData,
  t,
}: {
  selected: string[];
  getData: (name: string) => Developer | null;
  t: ReturnType<typeof useTranslations<"pulseCompare">>;
}) {
  const rows = selected.map(getData);

  const totalProjects = rows.map((r) => r?.totalProjects ?? 0);
  const offPlanCounts = rows.map((r) => r?.offPlanCount ?? 0);

  return (
    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground w-40">{t("metric")}</th>
              {selected.map((name) => (
                <th key={name} className="px-4 py-3 text-right text-xs font-bold text-foreground">
                  {name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <TableRow
              label={t("totalProjects")}
              values={totalProjects.map((v) => v > 0 ? v.toLocaleString() : "—")}
              highlights={totalProjects.map((v, i) => highlight(totalProjects, i))}
            />
            <TableRow
              label={t("offPlanProjects")}
              values={offPlanCounts.map((v) => v > 0 ? v.toLocaleString() : "—")}
              highlights={offPlanCounts.map((v, i) => highlight(offPlanCounts, i))}
            />
            <TableRow
              label={t("communitiesActive")}
              values={rows.map((r) => r?.communities ? r.communities.length.toString() : "—")}
              highlights={rows.map((r, i) => {
                const vals = rows.map((x) => x?.communities?.length ?? 0);
                return highlight(vals, i);
              })}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Building Comparison Table ──────────────────────────────────────────────

function BuildingTable({
  buildings,
  t,
}: {
  buildings: DldBuilding[];
  t: ReturnType<typeof useTranslations<"pulseCompare">>;
}) {
  const salesVals = buildings.map((b) => b.sales ?? 0);
  const rentsVals = buildings.map((b) => b.rents ?? 0);
  const unitsVals = buildings.map((b) => b.units ?? 0);
  const ppsfVals = buildings.map((b) => b.avgPpsf ?? 0);
  const priceVals = buildings.map((b) => b.avgPrice ?? 0);

  return (
    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground w-40">{t("metric")}</th>
              {buildings.map((b) => (
                <th key={b.slug} className="px-4 py-3 text-right text-xs font-bold text-foreground">
                  {b.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <TableRow
              label={t("bldSales12mo")}
              values={salesVals.map((v) => v > 0 ? v.toLocaleString() : "—")}
              highlights={salesVals.map((v, i) => highlight(salesVals, i))}
            />
            <TableRow
              label={t("bldRents")}
              values={rentsVals.map((v) => v > 0 ? v.toLocaleString() : "—")}
              highlights={rentsVals.map((v, i) => highlight(rentsVals, i))}
            />
            <TableRow
              label={t("bldUnits")}
              values={unitsVals.map((v) => v > 0 ? v.toLocaleString() : "—")}
              highlights={unitsVals.map((v, i) => highlight(unitsVals, i))}
            />
            <TableRow
              label={t("bldAvgPpsf")}
              values={ppsfVals.map((v) => v > 0 ? `AED ${v.toLocaleString()}` : "—")}
              highlights={ppsfVals.map((v, i) => highlight(ppsfVals, i))}
            />
            <TableRow
              label={t("bldAvgDeal")}
              values={priceVals.map((v) => AED(v))}
              highlights={priceVals.map((v, i) => highlight(priceVals, i))}
            />
            <TableRow
              label={t("bldMasterProject")}
              values={buildings.map((b) => b.masterProject ?? "—")}
              highlights={buildings.map(() => false)}
            />
            <TableRow
              label={t("bldArea")}
              values={buildings.map((b) => b.area ?? "—")}
              highlights={buildings.map(() => false)}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Shared table row ───────────────────────────────────────────────────────

function TableRow({
  label, values, highlights,
}: {
  label: string; values: string[]; highlights: boolean[];
}) {
  return (
    <tr className="border-b border-border/30 last:border-0">
      <td className="px-4 py-3.5 text-xs font-semibold text-muted-foreground">{label}</td>
      {values.map((val, i) => (
        <td key={i} className={`px-4 py-3.5 text-right font-semibold ${highlights[i] ? "text-emerald-600" : "text-foreground"}`}>
          {highlights[i] && val !== "—" ? (
            <span className="inline-flex items-center gap-1">
              <TrendingUp className="h-3 w-3 flex-shrink-0" />
              {val}
            </span>
          ) : val}
        </td>
      ))}
    </tr>
  );
}

// (Developer type is declared above with the interface block)
