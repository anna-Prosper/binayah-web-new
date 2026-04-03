export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";
import Listing from "@/models/Listing";

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

function parseBudgetMin(budget: string): number | null {
  const map: Record<string, number> = {
    "Up to 500K": 0,
    "500K - 1M": 500_000,
    "1M - 2M": 1_000_000,
    "2M - 5M": 2_000_000,
    "5M - 10M": 5_000_000,
    "10M+": 10_000_000,
  };
  return map[budget] || null;
}

// Fuzzy community matching
function communityRegex(location: string): RegExp {
  const aliases: Record<string, string> = {
    "JVC / JVT": "JVC|JVT|Jumeirah Village Circle|Jumeirah Village Triangle",
    "Downtown Dubai": "Downtown Dubai|Downtown",
    "Dubai Marina": "Dubai Marina|Marina",
    "Palm Jumeirah": "Palm Jumeirah|Palm",
    "Dubai Hills": "Dubai Hills|Dubai Hills Estate",
    "Creek Harbour": "Creek Harbour|Dubai Creek Harbour|Creek Harbor",
    "Business Bay": "Business Bay",
    "MBR City": "MBR City|Mohammed Bin Rashid City|Meydan",
    "Dubai South": "Dubai South|Dubai World Central",
    "Al Barari": "Al Barari|Barari",
    "JBR": "JBR|Jumeirah Beach Residence",
    "DIFC": "DIFC|Dubai International Financial Centre",
    "Jumeirah": "Jumeirah(?! Village| Beach)",
  };
  const pattern = aliases[location] || location;
  return new RegExp(pattern, "i");
}

function parseBedroomNum(bed: string): number | null {
  if (bed === "Studio") return 0;
  const match = bed.match(/(\d+)/);
  return match ? parseInt(match[1]) : null;
}

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);

  const status = searchParams.get("status") || "";     // "Off-Plan" | "Secondary" | "" (All)
  const type = searchParams.get("type") || "";
  const location = searchParams.get("location") || "";
  const bedroomsStr = searchParams.get("bedrooms") || "";
  const budget = searchParams.get("budget") || "";
  const q = searchParams.get("q") || "";
  const limit = Math.min(parseInt(searchParams.get("limit") || "24"), 100);
  const skip = parseInt(searchParams.get("skip") || "0");

  const maxPrice = parseBudget(budget);
  const minPrice = parseBudgetMin(budget);
  const bedNum = bedroomsStr ? parseBedroomNum(bedroomsStr) : null;

  let projects: any[] = [];
  let listings: any[] = [];
  let projectCount = 0;
  let listingCount = 0;

  // Off-Plan = Projects collection
  const searchOffPlan = !status || status === "All" || status === "Off-Plan";
  // Secondary = Listings collection (both Sale AND Rent)
  const searchSecondary = !status || status === "All" || status === "Secondary";

  // --- OFF-PLAN (Projects) ---
  if (searchOffPlan) {
    const pFilter: Record<string, any> = { publishStatus: "Published" };

    if (type) pFilter.propertyType = { $regex: type, $options: "i" };
    if (location) pFilter.community = { $regex: communityRegex(location) };

    if (maxPrice && minPrice !== null) {
      pFilter.startingPrice = { $gte: minPrice, $lte: maxPrice };
    } else if (maxPrice) {
      pFilter.startingPrice = { $lte: maxPrice };
    }

    // Projects store bedrooms as string: "Studio, 1 BR, 2 BR"
    if (bedNum !== null) {
      if (bedNum === 0) {
        pFilter.bedrooms = { $regex: /studio/i };
      } else {
        pFilter.bedrooms = { $regex: new RegExp(`${bedNum}\\s*(BR|Bed|Bedroom)`, "i") };
      }
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
        .select("name slug status developerName community startingPrice completionDate featuredImage imageGallery propertyType bedrooms")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Project.countDocuments(pFilter),
    ]);
  }

  // --- SECONDARY (Listings — both Sale and Rent) ---
  if (searchSecondary) {
    const lFilter: Record<string, any> = { publishStatus: "Published" };

    if (type) lFilter.propertyType = { $regex: type, $options: "i" };
    if (location) lFilter.community = { $regex: communityRegex(location) };

    if (maxPrice && minPrice !== null) {
      lFilter.price = { $gte: minPrice, $lte: maxPrice };
    } else if (maxPrice) {
      lFilter.price = { $lte: maxPrice };
    }

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
        .select("title slug listingType propertyType bedrooms bathrooms size sizeUnit price currency community city featuredImage images")
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
