"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, BarChart2, Building2, TrendingUp, Star, Landmark } from "lucide-react";
import { apiUrl } from "@/lib/api";

// ── Types ──────────────────────────────────────────────────────────────────

interface YieldArea { area: string; yield: number; avgRent: number; avgSale: number }
interface ByArea { area: string; count: number; totalValue: number; avgPrice: number; avgPpsf: number }

interface MarketStats {
  yieldByArea: YieldArea[];
  priceByArea: { area: string; price: number; count: number }[];
  volumeByArea: { area: string; volume: number }[];
  summary: { offPlanShare: number };
  communityMatrix: {
    area: string;
    avgPricePerSqft: number;
    rentalYield: number;
    totalListings: number;
    offPlanCount: number;
    investmentScore: number;
    avgSalePrice: number;
  }[];
}

interface MarketData {
  transactions: {
    hasData: boolean;
    byArea: ByArea[];
  } | null;
}

interface Community {
  _id: string;
  name: string;
  slug: string;
  totalListings?: number;
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
// (verified from /binayah-api/src/routes/market-stats.ts).
const PRESETS: { id: string; nameKey: string; slugs: string[] }[] = [
  {
    id: "waterfront",
    nameKey: "presetWaterfront",
    slugs: ["Dubai Marina", "Palm Jumeirah", "Dubai Hills"],
  },
  {
    id: "highyield",
    nameKey: "presetHighYield",
    slugs: ["JVC", "Dubai Hills", "JBR"],
  },
  {
    id: "urban",
    nameKey: "presetUrban",
    slugs: ["Downtown Dubai", "Business Bay", "MBR City"],
  },
  {
    id: "emerging",
    nameKey: "presetEmerging",
    slugs: ["Creek Harbour", "MBR City", "DAMAC Hills"],
  },
];

// ── Area name normalization ────────────────────────────────────────────────
// DLD stores area names in ALLCAPS raw format; community names use mixed-case
// abbreviations. Normalize both sides to a canonical token for matching.

// Maps canonical abbreviation/label → partial search term for /api/dld/areas?q=
// Values are partial strings so the API regex matches both singular/plural variants.
const AREA_EXPANSIONS: Record<string, string> = {
  jlt: "jumeirah lake",                                // matches "Jumeirah Lake Towers" and "Jumeirah Lakes Towers"
  "jumeirah lakes towers": "jumeirah lake",
  jvc: "jumeirah village circle",
  jvt: "jumeirah village triangle",
  jbr: "jumeirah beach residence",
  "mbr city": "mohammed bin rashid",
  meydan: "mohammed bin rashid",
  dlrc: "dubai land residence complex",
  "dubai land residence complex (dlrc)": "dubai land residence complex",
};

function normalizeAreaName(s: string): string {
  const lower = s.toLowerCase().replace(/\s+/g, " ").trim();
  return AREA_EXPANSIONS[lower] ?? lower;
}

// For DLD area search: expand abbreviations so /api/dld/areas?q=X returns results.
// E.g. "JLT" → "Jumeirah Lake Towers", "Business Bay" stays as-is.
function dldSearchTerm(name: string): string {
  const expanded = AREA_EXPANSIONS[name.toLowerCase().trim()];
  if (expanded) return expanded.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  return name;
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
  marketStats,
  marketData,
  communities,
  developers,
}: {
  marketStats: MarketStats | null;
  marketData: MarketData | null;
  communities: Community[] | null;
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

  // ── DLD area cache — fetched on demand for communities not in matrix ───────
  const [dldAreaCache, setDldAreaCache] = useState<Record<string, { avgPpsf: number; totalSales: number } | null>>({});

  const debouncedQuery = useDebounce(query, 300);

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

  // ── Search results (communities/developers) ───────────────────────────────
  const communityList: Community[] = useMemo(() => {
    const raw = Array.isArray(communities) ? communities : [];
    return raw;
  }, [communities]);

  const developerList: Developer[] = useMemo(() => {
    const raw = Array.isArray(developers) ? developers : [];
    return raw;
  }, [developers]);

  const items = mode === "communities" ? communityList : developerList;

  const filtered = useMemo(() => {
    if (mode === "buildings") return [];
    if (!query.trim()) return items.slice(0, 12);
    const q = query.toLowerCase().trim();
    return items.filter((item) => {
      const nameLow = item.name.toLowerCase();
      if (nameLow.includes(q)) return true;
      // Check if the query matches an expansion of this community name
      const expansion = AREA_EXPANSIONS[nameLow];
      if (expansion && expansion.includes(q)) return true;
      return false;
    }).slice(0, 12);
  }, [items, query, mode]);

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
    setSelected(preset.slugs.slice(0, 3));
  };

  const handleModeChange = (m: Mode) => {
    setMode(m);
    setSelected([]);
    setQuery("");
    setBuildingSearchResults([]);
    if (m !== "buildings") setSelectedBuildings([]);
  };

  // ── Community comparison data ─────────────────────────────────────────────
  const matrix = marketStats?.communityMatrix ?? [];
  const yieldByArea = marketStats?.yieldByArea ?? [];
  const priceByArea = marketStats?.priceByArea ?? [];
  const txByArea = marketData?.transactions?.byArea ?? [];

  // Fetch DLD area data for selected communities not resolved via txByArea
  useEffect(() => {
    if (mode !== "communities") return;
    for (const name of selected) {
      const inTx = txByArea.some((a) => normalizeAreaName(a.area) === normalizeAreaName(name));
      if (inTx) continue; // tx already has data, skip DLD area fetch
      if (dldAreaCache[name] !== undefined) continue; // already fetched (null = not found)
      const searchQ = dldSearchTerm(name);
      fetch(apiUrl(`/api/dld/areas?q=${encodeURIComponent(searchQ)}&limit=1`))
        .then((r) => r.ok ? r.json() : { results: [] })
        .then((data: { results?: { avgPpsf?: number; totalSales?: number }[] }) => {
          const area = data.results?.[0];
          setDldAreaCache((prev) => ({
            ...prev,
            [name]: area ? { avgPpsf: area.avgPpsf ?? 0, totalSales: area.totalSales ?? 0 } : null,
          }));
        })
        .catch(() => setDldAreaCache((prev) => ({ ...prev, [name]: null })));
    }
  }, [selected, txByArea, dldAreaCache, mode]);

  const getCommunityData = (name: string) => {
    const normName = normalizeAreaName(name);
    const mat = matrix.find((m) => normalizeAreaName(m.area) === normName);
    const yld = yieldByArea.find((a) => normalizeAreaName(a.area) === normName);
    const pr = priceByArea.find((a) => normalizeAreaName(a.area) === normName);
    const tx = txByArea.find((a) => normalizeAreaName(a.area) === normName);
    const dld = dldAreaCache[name];
    return {
      ppsf: mat?.avgPricePerSqft ?? pr?.price ?? tx?.avgPpsf ?? dld?.avgPpsf ?? 0,
      yield: mat?.rentalYield ?? yld?.yield ?? 0,
      volume: tx?.count ?? dld?.totalSales ?? 0,
      offPlanShare: mat ? (mat.totalListings > 0 ? Math.round((mat.offPlanCount / mat.totalListings) * 100) : 0) : null,
      score: mat?.investmentScore ?? 0,
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
        {mode !== "buildings" && query.trim() && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-4 bg-card border border-border/50 rounded-xl shadow-lg overflow-hidden"
          >
            {filtered.map((item) => (
              <button
                key={item._id}
                onClick={() => addItem(item.name)}
                disabled={selected.includes(item.name)}
                className="w-full text-left px-4 py-3 text-sm hover:bg-muted/50 transition-colors border-b border-border/30 last:border-0 disabled:opacity-40"
              >
                {item.name}
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
  getData: (name: string) => { ppsf: number; yield: number; volume: number; offPlanShare: number | null; score: number };
  t: ReturnType<typeof useTranslations<"pulseCompare">>;
}) {
  const rows = selected.map(getData);

  const ppsfVals = rows.map((r) => r.ppsf);
  const yieldVals = rows.map((r) => r.yield);
  const volVals = rows.map((r) => r.volume);
  const scoreVals = rows.map((r) => r.score);

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
              label={t("priceSqft")}
              values={ppsfVals.map((v) => v > 0 ? `AED ${v.toLocaleString()}` : "—")}
              highlights={ppsfVals.map((v, i) => highlight(ppsfVals, i))}
            />
            <TableRow
              label={t("grossYield")}
              values={yieldVals.map((v) => pct(v))}
              highlights={yieldVals.map((v, i) => highlight(yieldVals, i))}
            />
            <TableRow
              label={t("txVolume")}
              values={volVals.map((v) => v > 0 ? v.toLocaleString() : "—")}
              highlights={volVals.map((v, i) => highlight(volVals, i))}
            />
            <TableRow
              label={t("investScore")}
              values={scoreVals.map((v) => v > 0 ? `${v}/100` : "—")}
              highlights={scoreVals.map((v, i) => highlight(scoreVals, i))}
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
