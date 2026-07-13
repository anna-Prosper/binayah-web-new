import { cache } from "react";
import { serverApiUrl, serverFetch } from "@/lib/api";

// ── Live per-area DLD stats for the Pulse area guides ──────────────────────
// Normalises the Dubai Land Department transaction feed into publishable
// figures. Two quirks are handled here:
//   1. The feed's avgPpsf is AED per square METRE, so we divide by 10.7639 to
//      get AED/sqft (verified: Burj Khalifa converts to exactly the value the
//      site's community-stats source reports).
//   2. Gross yield = avgRentPerSqm / avgPpsf (both per-sqm) × 100.
// Every field is independently sample-gated and sanity-bounded, so the panel
// only ever shows a number we trust — otherwise the field is omitted.

const SQM_TO_SQFT = 10.7639;
const DLD_HEADERS = (): Record<string, string> => ({ "x-api-key": process.env.API_KEY || "" });

export interface AreaStats {
  area: string;
  pricePerSqft: number | null;
  avgPrice: number | null; // all unit types combined — label accordingly
  grossYield: number | null;
  transactions: number | null;
  buildings: number | null;
  units: number | null;
  updatedAt: string | null;
  source: "dld-area" | "dld-buildings";
}

// Marketing name → DLD area name where they differ.
const ALIAS: Record<string, string> = {
  "downtown dubai": "Burj Khalifa",
  "downtown": "Burj Khalifa",
  "dubai hills estate": "Dubai Hills",
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const round = (n: number, step = 1) => Math.round(n / step) * step;

async function fetchJson(path: string): Promise<any[]> {
  try {
    const res = await serverFetch(serverApiUrl(path), 10_000, DLD_HEADERS(), 3600);
    if (!res.ok) return [];
    const d = await res.json();
    return (d?.results ?? d ?? []) as any[];
  } catch {
    return [];
  }
}

function fromAreaRecord(area: string, r: any): AreaStats {
  const sales = Number(r.totalSales) || 0;
  const rentCount = Number(r.rentCount) || 0;
  const ppsfSqm = Number(r.avgPpsf) || 0;
  const rentSqm = Number(r.avgRentPerSqm) || 0;
  const ppsf = ppsfSqm ? ppsfSqm / SQM_TO_SQFT : 0;
  const yieldPct = ppsfSqm && rentSqm ? (rentSqm / ppsfSqm) * 100 : 0;
  return {
    area,
    pricePerSqft: sales >= 50 && ppsf > 400 && ppsf < 9000 ? round(ppsf, 10) : null,
    avgPrice: sales >= 50 && r.avgPrice > 0 ? round(Number(r.avgPrice), 1000) : null,
    grossYield: rentCount >= 100 && yieldPct >= 2 && yieldPct <= 11 ? Math.round(yieldPct * 10) / 10 : null,
    transactions: sales >= 20 ? sales : null,
    buildings: Number(r.buildingCount) > 0 ? Number(r.buildingCount) : null,
    units: Number(r.totalUnits) > 0 ? Number(r.totalUnits) : null,
    updatedAt: r.lastAggregatedAt ?? null,
    source: "dld-area",
  };
}

// Fallback for areas the feed doesn't aggregate (e.g. Palm Jumeirah): build a
// sales-weighted average from the building records, trimming records whose
// implied average unit size is outside a plausible 20–800 m² band (those carry
// corrupt area data that would skew the mean).
function fromBuildings(area: string, rows: any[]): AreaStats | null {
  let wPpsf = 0, wPrice = 0, sales = 0, updated: string | null = null, kept = 0;
  for (const r of rows) {
    const p = Number(r.avgPrice) || 0;
    const ppsf = Number(r.avgPpsf) || 0;
    const s = Number(r.sales) || 0;
    if (p <= 0 || ppsf <= 0 || s <= 0) continue;
    const impliedSqm = p / ppsf;
    if (impliedSqm < 20 || impliedSqm > 800) continue;
    wPpsf += ppsf * s;
    wPrice += p * s;
    sales += s;
    kept++;
    if (r.lastAggregatedAt && (!updated || r.lastAggregatedAt > updated)) updated = r.lastAggregatedAt;
  }
  if (sales < 50 || kept < 5) return null;
  const ppsf = wPpsf / sales / SQM_TO_SQFT;
  return {
    area,
    pricePerSqft: ppsf > 400 && ppsf < 12000 ? round(ppsf, 10) : null,
    avgPrice: round(wPrice / sales, 1000),
    grossYield: null, // building records carry no rent
    transactions: sales,
    buildings: kept,
    units: null,
    updatedAt: updated,
    source: "dld-buildings",
  };
}

export const getAreaStats = cache(async (area: string): Promise<AreaStats | null> => {
  if (!area) return null;
  const target = ALIAS[norm(area)] ?? area;
  const areas = await fetchJson("/api/dld/areas?limit=800");
  const rec = areas.find((r) => norm(r?.name ?? "") === norm(target));
  if (rec) return fromAreaRecord(area, rec);
  const buildings = await fetchJson(`/api/dld/buildings?area=${encodeURIComponent(target)}&limit=500`);
  if (buildings.length) return fromBuildings(area, buildings);
  return null;
});

/** True when the panel has at least the headline metric worth rendering. */
export function hasRenderableStats(s: AreaStats | null): s is AreaStats {
  return !!s && (s.pricePerSqft !== null || s.avgPrice !== null || s.transactions !== null);
}
