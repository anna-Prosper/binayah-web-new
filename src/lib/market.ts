import { cache } from "react";
import { serverApiUrl, serverFetch } from "@/lib/api";

// Per-community market stats from the public /api/market-stats endpoint
// (listings + DLD/ejari enriched). Used to add real depth — avg price/sqft,
// gross yield, supply mix — to community/area/off-plan-in templates so they
// aren't thin. One upstream fetch is shared across the request via cache().

export interface CommunityStat {
  area: string;
  avgPricePerSqft: number;
  avgSalePrice: number;
  avgRentPrice: number;
  rentalYield: number;
  yieldSource: "listings" | "benchmark" | "ejari" | string;
  totalListings: number;
  offPlanCount: number;
  secondaryCount: number;
  investmentScore?: number;
}

export interface MarketStatsResponse {
  summary?: Record<string, number | null>;
  communityMatrix?: CommunityStat[];
  figuresSource?: string;
  figuresUpdatedAt?: string;
}

export const getMarketStats = cache(async (): Promise<MarketStatsResponse | null> => {
  try {
    // Cross-request cache: /api/market-stats is a heavy, site-wide, slow-moving
    // endpoint. serverFetch() is uncached (Next defaults to no-store), so every
    // render re-fetched it. Cache it in Next's data cache for an hour instead —
    // fetched at most once/hour site-wide and reused everywhere. (React cache()
    // dedupes within a single render; next.revalidate caches across requests.)
    const res = await fetch(serverApiUrl("/api/market-stats"), {
      signal: AbortSignal.timeout(10_000),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return (await res.json()) as MarketStatsResponse;
  } catch {
    return null;
  }
});

const norm = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim();

// Marketing community name → the official DLD area name used in the buildings
// dataset (the building filter is a contains-regex, so one canonical name is
// enough). Only the communities whose marketing name differs from the DLD area
// need an entry; everything else falls through unchanged. Verified to return
// buildings against /api/dld/buildings?area=.
const DLD_AREA_ALIASES: Record<string, string> = {
  "downtown dubai": "Burj Khalifa",
  "downtown": "Burj Khalifa",
  "dubai hills estate": "Dubai Hills",
  "mbr city": "Hadaeq Sheikh Mohammed Bin Rashid",
  "mohammed bin rashid city": "Hadaeq Sheikh Mohammed Bin Rashid",
  "meydan": "Meydan",
  "jlt": "Jumeirah Lakes Towers",
  "jumeirah lake towers": "Jumeirah Lakes Towers",
  "jumeirah lakes towers": "Jumeirah Lakes Towers",
};

/** Map a community name to the DLD area name for building lookups (falls back to itself). */
export function dldAreaFor(community: string): string {
  return DLD_AREA_ALIASES[norm(community)] ?? community;
}

/** Find the stats row for a community name (tolerant of aliases/casing). */
export const getCommunityStats = cache(async (community: string): Promise<CommunityStat | null> => {
  if (!community) return null;
  const data = await getMarketStats();
  const rows = data?.communityMatrix;
  if (!Array.isArray(rows) || rows.length === 0) return null;
  const target = norm(community);
  // exact normalized match first, then a contains match either direction
  return (
    rows.find((r) => norm(r.area) === target) ||
    rows.find((r) => norm(r.area).includes(target) || target.includes(norm(r.area))) ||
    null
  );
});

/** Data-driven FAQ set for a community/area page (only includes Qs we have data for). */
export function buildCommunityFaqs(name: string, s: CommunityStat | null): { question: string; answer: string }[] {
  const faqs: { question: string; answer: string }[] = [];
  if (s?.avgPricePerSqft) {
    faqs.push({
      question: `What is the average price per square foot in ${name}?`,
      answer: `The current average sale price in ${name} is around AED ${s.avgPricePerSqft.toLocaleString("en-AE")} per square foot, based on the latest listing and Dubai Land Department (DLD) data.`,
    });
  }
  if (s?.rentalYield) {
    const src = s.yieldSource === "ejari" ? "DLD/Ejari rental contracts" : s.yieldSource === "listings" ? "current rental listings" : "Dubai market benchmarks";
    faqs.push({
      question: `What rental yield can I expect in ${name}?`,
      answer: `${name} offers an average gross rental yield of about ${s.rentalYield}%, derived from ${src}. Actual yield varies by building, unit type and furnishing.`,
    });
  }
  if (s && (s.offPlanCount || s.secondaryCount)) {
    faqs.push({
      question: `Is ${name} better for off-plan or ready property?`,
      answer: `${name} currently has roughly ${s.offPlanCount.toLocaleString("en-AE")} off-plan and ${s.secondaryCount.toLocaleString("en-AE")} ready (secondary) listings. Off-plan suits investors wanting payment plans and capital appreciation; ready suits end-users and immediate rental income.`,
    });
  }
  if (s?.avgSalePrice) {
    faqs.push({
      question: `How much does property cost in ${name}?`,
      answer: `The average asking price in ${name} is around AED ${s.avgSalePrice.toLocaleString("en-AE")}, though it ranges widely by unit size, view and building. Browse live listings above for current availability.`,
    });
  }
  return faqs;
}

/**
 * A transaction-type-specific market sentence for the buy-/rent-property-in
 * community pages, so the two (otherwise near-identical) templates diverge with
 * real, distinct DLD data: sale metrics on Buy, rent metrics on Rent. Returns ""
 * when there's no data to state.
 */
export function buildMarketNote(name: string, s: CommunityStat | null, intent: "buy" | "rent"): string {
  if (!s) return "";
  if (intent === "buy") {
    const parts: string[] = [];
    if (s.avgPricePerSqft) parts.push(`average sale prices around AED ${s.avgPricePerSqft.toLocaleString("en-AE")} per sqft`);
    if (s.avgSalePrice) parts.push(`a typical asking price near AED ${s.avgSalePrice.toLocaleString("en-AE")}`);
    if (!parts.length) return "";
    return `Buyers in ${name} are seeing ${parts.join(" and ")}, based on the latest listing and Dubai Land Department (DLD) data.`;
  }
  const parts: string[] = [];
  if (s.avgRentPrice) parts.push(`average rents around AED ${s.avgRentPrice.toLocaleString("en-AE")} per year`);
  if (s.rentalYield) {
    const src = s.yieldSource === "ejari" ? "DLD/Ejari contracts" : s.yieldSource === "listings" ? "current listings" : "market benchmarks";
    parts.push(`a gross rental yield of about ${s.rentalYield}% (${src})`);
  }
  if (!parts.length) return "";
  return `Tenants and investors in ${name} are seeing ${parts.join(" and ")}.`;
}

/**
 * Data-driven fallback "About" paragraph for a community page whose DB record has
 * no editorial description (the DB-only render branch). Uses real project count +
 * DLD stats so the hero isn't left blank and the copy is factually unique.
 */
export function buildCommunitySummary(name: string, s: CommunityStat | null, projectCount: number): string {
  let first = projectCount > 0
    ? `${name} is a Dubai community with ${projectCount} ${projectCount === 1 ? "project" : "projects"} listed on Binayah`
    : `${name} is a residential community in Dubai`;
  const bits: string[] = [];
  if (s?.avgPricePerSqft) bits.push(`average sale prices around AED ${s.avgPricePerSqft.toLocaleString("en-AE")} per sqft`);
  if (s?.rentalYield) bits.push(`a gross rental yield of about ${s.rentalYield}%`);
  if (bits.length) first += `, with ${bits.join(" and ")} based on the latest DLD and listing data`;
  first += ".";
  return `${first} Browse off-plan and ready properties for sale and rent in ${name} below.`;
}

export const fmtAed = (n: number | null | undefined): string =>
  !n || n <= 0
    ? "-"
    : n >= 1_000_000
    ? `AED ${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`
    : n >= 1_000
    ? `AED ${Math.round(n / 1_000)}K`
    : `AED ${n.toLocaleString("en-AE")}`;
