export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";
import Listing from "@/models/Listing";

// Budget string → max price number
function parseBudget(budget: string): number | null {
  const map: Record<string, number> = {
    "Up to 500K": 500_000,
    "500K - 1M": 1_000_000,
    "1M - 2M": 2_000_000,
    "2M - 5M": 5_000_000,
    "5M - 10M": 10_000_000,
    "10M+": 999_999_999,
  };
  return map[budget] || null;
}

function parseBedrooms(bed: string): number | null {
  if (bed === "Studio") return 0;
  const match = bed.match(/(\d+)/);
  return match ? parseInt(match[1]) : null;
}

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);

  const status = searchParams.get("status") || "";
  const type = searchParams.get("type") || "";
  const location = searchParams.get("location") || "";
  const bedroomsStr = searchParams.get("bedrooms") || "";
  const budget = searchParams.get("budget") || "";
  const q = searchParams.get("q") || "";
  const limit = Math.min(parseInt(searchParams.get("limit") || "24"), 100);
  const skip = parseInt(searchParams.get("skip") || "0");

  const maxPrice = parseBudget(budget);
  const bedNum = bedroomsStr ? parseBedrooms(bedroomsStr) : null;

  let projects: any[] = [];
  let listings: any[] = [];
  let projectCount = 0;
  let listingCount = 0;

  // --- Query Off-Plan Projects ---
  if (status === "" || status === "All" || status === "Off-Plan") {
    const pFilter: Record<string, any> = { publishStatus: "Published" };

    if (type) pFilter.propertyType = { $regex: type, $options: "i" };
    if (location) pFilter.community = { $regex: location.replace(/\s*\/\s*/g, "|"), $options: "i" };
    if (maxPrice) pFilter.startingPrice = { $lte: maxPrice };
    if (bedNum !== null) {
      pFilter.bedrooms = { $regex: bedNum === 0 ? "studio" : `${bedNum}`, $options: "i" };
    }
    if (q) {
      pFilter.$or = [
        { name: { $regex: q, $options: "i" } },
        { community: { $regex: q, $options: "i" } },
        { developerName: { $regex: q, $options: "i" } },
        { shortOverview: { $regex: q, $options: "i" } },
      ];
    }

    [projects, projectCount] = await Promise.all([
      Project.find(pFilter)
        .select("name slug status developerName community startingPrice completionDate featuredImage imageGallery propertyType")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Project.countDocuments(pFilter),
    ]);
  }

  // --- Query Listings (Ready / Secondary / Rent) ---
  if (status === "" || status === "All" || status === "Ready" || status === "For Rent") {
    const lFilter: Record<string, any> = { publishStatus: "Published" };

    if (status === "For Rent") lFilter.listingType = "Rent";
    else if (status === "Ready") lFilter.listingType = "Sale";

    if (type) lFilter.propertyType = { $regex: type, $options: "i" };
    if (location) lFilter.community = { $regex: location.replace(/\s*\/\s*/g, "|"), $options: "i" };
    if (maxPrice) lFilter.price = { $lte: maxPrice };
    if (bedNum !== null) lFilter.bedrooms = bedNum;
    if (q) {
      lFilter.$or = [
        { title: { $regex: q, $options: "i" } },
        { community: { $regex: q, $options: "i" } },
        { address: { $regex: q, $options: "i" } },
      ];
    }

    [listings, listingCount] = await Promise.all([
      Listing.find(lFilter)
        .select("title slug listingType propertyType bedrooms bathrooms size sizeUnit price currency community city featuredImage imageGallery")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Listing.countDocuments(lFilter),
    ]);
  }

  return NextResponse.json(
    {
      projects: JSON.parse(JSON.stringify(projects)),
      listings: JSON.parse(JSON.stringify(listings)),
      projectCount,
      listingCount,
      totalCount: projectCount + listingCount,
    },
    { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" } }
  );
}
