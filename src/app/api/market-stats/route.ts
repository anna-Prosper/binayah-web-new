export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";
import Listing from "@/models/Listing";

// Communities to track
const TRACKED_COMMUNITIES = [
  { key: "Downtown Dubai", aliases: /downtown dubai|downtown/i, label: "Downtown" },
  { key: "Dubai Marina", aliases: /dubai marina|marina/i, label: "Marina" },
  { key: "Palm Jumeirah", aliases: /palm jumeirah|palm/i, label: "Palm" },
  { key: "JVC", aliases: /jvc|jumeirah village circle/i, label: "JVC" },
  { key: "Business Bay", aliases: /business bay/i, label: "Business Bay" },
  { key: "JBR", aliases: /jbr|jumeirah beach residence/i, label: "JBR" },
  { key: "Dubai Hills", aliases: /dubai hills/i, label: "Dubai Hills" },
  { key: "Creek Harbour", aliases: /creek harbour|creek harbor|dubai creek/i, label: "Creek Harbour" },
  { key: "MBR City", aliases: /mbr city|mohammed bin rashid|meydan/i, label: "MBR City" },
  { key: "DAMAC Hills", aliases: /damac hills/i, label: "DAMAC Hills" },
];

export async function GET() {
  await connectDB();

  const [projects, listings] = await Promise.all([
    Project.find({ publishStatus: "Published" })
      .select("community startingPrice propertyType bedrooms")
      .lean(),
    Listing.find({ publishStatus: "Published" })
      .select("community price size sizeUnit propertyType listingType bedrooms")
      .lean(),
  ]);

  // ── 1. Average price per sqft by community (from listings with size + price) ──
  const pricePerSqftMap: Record<string, { total: number; count: number }> = {};

  for (const l of listings as any[]) {
    if (!l.price || !l.size || l.size <= 0) continue;
    const ppsf = l.price / l.size;
    // Only include reasonable values (filter outliers)
    if (ppsf < 100 || ppsf > 20000) continue;

    for (const comm of TRACKED_COMMUNITIES) {
      if (comm.aliases.test(l.community || "")) {
        if (!pricePerSqftMap[comm.label]) pricePerSqftMap[comm.label] = { total: 0, count: 0 };
        pricePerSqftMap[comm.label].total += ppsf;
        pricePerSqftMap[comm.label].count += 1;
        break;
      }
    }
  }

  const priceByArea = TRACKED_COMMUNITIES
    .filter((c) => pricePerSqftMap[c.label]?.count > 0)
    .map((c) => ({
      area: c.label,
      price: Math.round(pricePerSqftMap[c.label].total / pricePerSqftMap[c.label].count),
      count: pricePerSqftMap[c.label].count,
    }))
    .sort((a, b) => b.price - a.price);

  // ── 2. Overall average price/sqft ──
  let totalPpsf = 0;
  let countPpsf = 0;
  for (const l of listings as any[]) {
    if (!l.price || !l.size || l.size <= 0) continue;
    const ppsf = l.price / l.size;
    if (ppsf < 100 || ppsf > 20000) continue;
    totalPpsf += ppsf;
    countPpsf++;
  }
  const avgPricePerSqft = countPpsf > 0 ? Math.round(totalPpsf / countPpsf) : 0;

  // ── 3. Rental yield by community ──
  // Yield = (Annual Rent / Sale Price) * 100 for same community
  const rentByComm: Record<string, number[]> = {};
  const saleByComm: Record<string, number[]> = {};

  for (const l of listings as any[]) {
    if (!l.price || l.price <= 0) continue;
    for (const comm of TRACKED_COMMUNITIES) {
      if (comm.aliases.test(l.community || "")) {
        if ((l.listingType || "").toLowerCase() === "rent") {
          if (!rentByComm[comm.label]) rentByComm[comm.label] = [];
          rentByComm[comm.label].push(l.price);
        } else {
          if (!saleByComm[comm.label]) saleByComm[comm.label] = [];
          saleByComm[comm.label].push(l.price);
        }
        break;
      }
    }
  }

  const yieldByArea = TRACKED_COMMUNITIES
    .filter((c) => rentByComm[c.label]?.length > 0 && saleByComm[c.label]?.length > 0)
    .map((c) => {
      const avgRent = rentByComm[c.label].reduce((a, b) => a + b, 0) / rentByComm[c.label].length;
      const avgSale = saleByComm[c.label].reduce((a, b) => a + b, 0) / saleByComm[c.label].length;
      const yieldPct = avgSale > 0 ? (avgRent / avgSale) * 100 : 0;
      return {
        area: c.label,
        yield: parseFloat(yieldPct.toFixed(1)),
        avgRent: Math.round(avgRent),
        avgSale: Math.round(avgSale),
      };
    })
    .filter((y) => y.yield > 0 && y.yield < 20) // filter unreasonable
    .sort((a, b) => b.yield - a.yield);

  // Overall avg yield
  const avgYield =
    yieldByArea.length > 0
      ? parseFloat((yieldByArea.reduce((s, y) => s + y.yield, 0) / yieldByArea.length).toFixed(1))
      : 0;

  // ── 4. Property type distribution (projects + listings combined) ──
  const typeCount: Record<string, number> = {};
  for (const p of projects as any[]) {
    const t = (p.propertyType || "Other").trim();
    const normalized =
      /apartment|flat/i.test(t) ? "Apartments" :
      /villa/i.test(t) ? "Villas" :
      /townhouse/i.test(t) ? "Townhouses" :
      /commercial|office|retail|shop/i.test(t) ? "Commercial" :
      /penthouse/i.test(t) ? "Penthouses" :
      "Other";
    typeCount[normalized] = (typeCount[normalized] || 0) + 1;
  }
  for (const l of listings as any[]) {
    const t = (l.propertyType || "Other").trim();
    const normalized =
      /apartment|flat/i.test(t) ? "Apartments" :
      /villa/i.test(t) ? "Villas" :
      /townhouse/i.test(t) ? "Townhouses" :
      /commercial|office|retail|shop/i.test(t) ? "Commercial" :
      /penthouse/i.test(t) ? "Penthouses" :
      "Other";
    typeCount[normalized] = (typeCount[normalized] || 0) + 1;
  }

  const totalTypeCount = Object.values(typeCount).reduce((a, b) => a + b, 0);
  const SEGMENT_COLORS: Record<string, string> = {
    Apartments: "hsl(168, 100%, 15%)",
    Villas: "hsl(43, 60%, 55%)",
    Townhouses: "hsl(168, 80%, 30%)",
    Commercial: "hsl(43, 40%, 70%)",
    Penthouses: "hsl(168, 60%, 45%)",
    Other: "hsl(40, 15%, 75%)",
  };

  const segments = Object.entries(typeCount)
    .map(([name, count]) => ({
      name,
      value: totalTypeCount > 0 ? parseFloat(((count / totalTypeCount) * 100).toFixed(1)) : 0,
      count,
      color: SEGMENT_COLORS[name] || "hsl(40, 15%, 75%)",
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // top 5

  // ── 5. Counts ──
  const offPlanCount = projects.length;
  const secondaryCount = listings.length;
  const totalCount = offPlanCount + secondaryCount;
  const offPlanShare = totalCount > 0 ? parseFloat(((offPlanCount / totalCount) * 100).toFixed(0)) : 0;

  // ── 6. Listings by community (for "transactions" tab — listing volume) ──
  const listingsByComm: Record<string, number> = {};
  for (const item of [...(projects as any[]), ...(listings as any[])]) {
    for (const comm of TRACKED_COMMUNITIES) {
      if (comm.aliases.test(item.community || "")) {
        listingsByComm[comm.label] = (listingsByComm[comm.label] || 0) + 1;
        break;
      }
    }
  }

  const volumeByArea = Object.entries(listingsByComm)
    .map(([area, volume]) => ({ area, volume }))
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 10);

  return NextResponse.json(
    {
      summary: {
        avgPricePerSqft,
        totalListings: totalCount,
        avgYield,
        offPlanShare,
        offPlanCount,
        secondaryCount,
      },
      priceByArea,
      yieldByArea,
      volumeByArea,
      segments,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}