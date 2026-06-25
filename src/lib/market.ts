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
    const res = await serverFetch(serverApiUrl("/api/market-stats"), 10_000);
    if (!res.ok) return null;
    return (await res.json()) as MarketStatsResponse;
  } catch {
    return null;
  }
});

const norm = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim();

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

export const fmtAed = (n: number | null | undefined): string =>
  !n || n <= 0
    ? "-"
    : n >= 1_000_000
    ? `AED ${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`
    : n >= 1_000
    ? `AED ${Math.round(n / 1_000)}K`
    : `AED ${n.toLocaleString("en-AE")}`;
