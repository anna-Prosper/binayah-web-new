/**
 * deal-check/comps.ts
 *
 * Resolves a DealInput to a set of DLD-registered comparable sales.
 *
 * ── Unit warning ──────────────────────────────────────────────────────────
 * The DLD feed stores `pricePerSqft` and `avgPpsf` as AED per square METRE
 * despite the name, and `size`/`actualArea` in sqm. Some upstream endpoints
 * convert and some do not:
 *   /api/dld/areas/:slug/matrix  → already AED/sqft (converts internally)
 *   /api/dld/areas/:slug/yield   → already AED/sqft
 *   /api/dld/areas               → RAW per-sqm, must divide by SQM_TO_SQFT
 * Everything leaving this module is AED/sqft.
 *
 * DLD also only classifies Flat vs Villa — there is no townhouse or penthouse
 * tag in the transaction feed — so we fold our richer property kinds down to
 * the two buckets the matrix actually keys on.
 */

import { serverApiUrl } from "@/lib/api";
import type { CompSet } from "./engine";
import type { DealInput } from "./types";

const DLD_HEADERS = (): Record<string, string> => ({ "x-api-key": process.env.API_KEY || "" });

interface MatrixCombo {
  type: string;
  bedrooms: number;
  count: number;
  medianPrice: number;
  minPrice: number;
  maxPrice: number;
  pricePerSqft: number; // already AED/sqft from this endpoint
}

interface MatrixResponse {
  area: string;
  slug: string;
  combos: MatrixCombo[];
}

interface YieldResponse {
  slug: string;
  name: string;
  avgSalePsf: number;
  avgRentPsf: number;
  grossYieldPct: number;
  salesSampleSize: number;
  rentSampleSize: number;
  lowConfidence: boolean;
  period: string;
  coverageStart: string;
}

/**
 * Marketing community name → the DLD area slug that actually serves data.
 *
 * IMPORTANT: only map names that genuinely differ on the SALES side. The DLD
 * *sales* dataset is keyed on marketing names, so `dubai-marina` and
 * `palm-jumeirah` resolve correctly on their own — mapping them to the
 * official sector names (`marsa-dubai`, `nakhlat-jumeira`) 404s and silently
 * costs us the whole comparable set. The sector-name vocabulary belongs to the
 * *rents* collection, and the API already bridges that internally when it
 * computes yield. Verified live against /api/dld/areas/:slug/matrix.
 *
 * These four are the real exceptions, matching the API's own SLUG_ALIAS.
 */
const SLUG_ALIAS: Record<string, string> = {
  "downtown-dubai": "burj-khalifa",
  downtown: "burj-khalifa",
  "dubai-hills-estate": "dubai-hills",
  "mbr-city": "hadaeq-sheikh-mohammed-bin-rashid",
  "mohammed-bin-rashid-city": "hadaeq-sheikh-mohammed-bin-rashid",
  // Common abbreviations users type — expand to the full marketing name.
  jvt: "jumeirah-village-triangle",
  jvc: "jumeirah-village-circle",
  jlt: "jumeirah-lake-towers",
  jbr: "jumeirah-beach-residence",
};

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function resolveSlug(community: string): string {
  const base = slugify(community);
  return SLUG_ALIAS[base] ?? base;
}

/** Fold our property kinds into the only two DLD actually distinguishes. */
function dldTypeFor(kind: DealInput["propertyKind"]): "apartments" | "villas" | null {
  switch (kind) {
    case "apartment":
    case "penthouse":
      return "apartments";
    case "villa":
    case "townhouse":
      return "villas";
    default:
      return null;
  }
}

async function fetchJson<T>(path: string, timeoutMs = 12_000): Promise<T | null> {
  try {
    const res = await fetch(serverApiUrl(path), {
      headers: DLD_HEADERS(),
      signal: AbortSignal.timeout(timeoutMs),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** An empty comp set — used when we have no community to look up. */
export function emptyComps(): CompSet {
  return {
    medianPrice: null,
    pricePsf: null,
    count: 0,
    label: "",
    areaName: null,
    areaSalePsf: null,
    areaRentPsf: null,
    areaGrossYieldPct: null,
    rentSampleSize: null,
    lowConfidence: true,
    periodLabel: null,
    coverageStart: null,
  };
}

/**
 * Pull the comparable set for a property. Runs the matrix and yield lookups
 * concurrently — they're independent and both are on the critical path.
 */
export async function resolveComps(input: DealInput): Promise<CompSet> {
  if (!input.community) return emptyComps();

  const slug = resolveSlug(input.community);

  const [matrix, yields] = await Promise.all([
    fetchJson<MatrixResponse>(`/api/dld/areas/${slug}/matrix`),
    fetchJson<YieldResponse>(`/api/dld/areas/${slug}/yield`),
  ]);

  const comps = emptyComps();

  if (yields) {
    comps.areaName = yields.name;
    comps.areaSalePsf = yields.avgSalePsf || null;
    comps.areaRentPsf = yields.avgRentPsf || null;
    comps.areaGrossYieldPct = yields.grossYieldPct || null;
    comps.rentSampleSize = yields.rentSampleSize || null;
    comps.lowConfidence = yields.lowConfidence;
    comps.coverageStart = yields.coverageStart ?? null;
    // DLD coverage begins ~Jan 2026, so a "12m" window may hold less than a
    // year. Label it with the real start date rather than implying 12 months.
    comps.periodLabel = yields.coverageStart
      ? `registered sales since ${formatMonth(yields.coverageStart)}`
      : `last ${yields.period ?? "12m"}`;
  }

  if (matrix?.area && !comps.areaName) comps.areaName = matrix.area;

  // Match the exact type + bedroom combo where we know both.
  const wantType = dldTypeFor(input.propertyKind);
  const beds = input.bedrooms;

  if (matrix?.combos?.length && wantType && beds != null) {
    const exact = matrix.combos.find((c) => c.type === wantType && c.bedrooms === beds);
    if (exact) {
      comps.medianPrice = exact.medianPrice;
      comps.pricePsf = exact.pricePerSqft;
      comps.count = exact.count;
      comps.label = `${bedLabel(beds)} ${wantType === "villas" ? "villas & townhouses" : "apartments"} in ${matrix.area}`;
      return comps;
    }
  }

  // No exact combo — fall back to all bedroom counts of the right type, which
  // still beats an area-wide average that mixes studios with penthouses.
  if (matrix?.combos?.length && wantType) {
    const sameType = matrix.combos.filter((c) => c.type === wantType);
    if (sameType.length) {
      const count = sameType.reduce((s, c) => s + c.count, 0);
      // Weight PSF by sample size so a 12-sale combo doesn't outvote a 900-sale one.
      const psf = sameType.reduce((s, c) => s + c.pricePerSqft * c.count, 0) / count;
      comps.pricePsf = Math.round(psf);
      comps.count = count;
      comps.label = `all ${wantType === "villas" ? "villas & townhouses" : "apartments"} in ${matrix.area}`;
      return comps;
    }
  }

  // Nothing type-specific: the area figure is all we have.
  if (comps.areaSalePsf) {
    comps.pricePsf = comps.areaSalePsf;
    comps.count = yields?.salesSampleSize ?? 0;
    comps.label = `all registered sales in ${comps.areaName}`;
  }

  return comps;
}

function bedLabel(beds: number): string {
  if (beds === 0) return "Studio";
  return `${beds}-bedroom`;
}

function formatMonth(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}
