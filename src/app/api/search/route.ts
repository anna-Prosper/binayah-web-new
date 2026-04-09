export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";
import Listing from "@/models/Listing";

type SearchIntent = "buy" | "rent" | "off-plan" | "";
type SearchStatus = "All" | "Off-Plan" | "Secondary";

const BUY_BUDGETS: Record<string, [number, number | null]> = {
  "Up to 500K": [0, 500_000],
  "500K - 1M": [500_000, 1_000_000],
  "1M - 2M": [1_000_000, 2_000_000],
  "2M - 5M": [2_000_000, 5_000_000],
  "5M - 10M": [5_000_000, 10_000_000],
  "10M+": [10_000_000, null],
};

const RENT_BUDGETS: Record<string, [number, number | null]> = {
  "Up to 100K": [0, 100_000],
  "100K - 200K": [100_000, 200_000],
  "200K - 350K": [200_000, 350_000],
  "350K - 500K": [350_000, 500_000],
  "500K+": [500_000, null],
};

function communityRegex(location: string): RegExp {
  const aliases: Record<string, string> = {
    "JVC / JVT": "JVC|JVT|Jumeirah Village Circle|Jumeirah Village Triangle",
    "Downtown Dubai": "Downtown Dubai|Downtown",
    "Dubai Marina": "Dubai Marina|Marina",
    "Palm Jumeirah": "Palm Jumeirah|Palm",
    "Dubai Hills": "Dubai Hills|Dubai Hills Estate",
    "Dubai Hills Estate": "Dubai Hills|Dubai Hills Estate",
    "Creek Harbour": "Creek Harbour|Dubai Creek Harbour|Creek Harbor",
    "Business Bay": "Business Bay",
    "MBR City": "MBR City|Mohammed Bin Rashid City|Meydan",
    "Dubai South": "Dubai South|Dubai World Central",
    "Al Barari": "Al Barari|Barari",
    "JBR": "JBR|Jumeirah Beach Residence",
    "DIFC": "DIFC|Dubai International Financial Centre",
    "Jumeirah": "Jumeirah(?! Village| Beach)",
  };

  const pattern = aliases[location] || escapeRegex(location);
  return new RegExp(pattern, "i");
}

function parseBedroomNum(value: string): number | null {
  if (value === "Studio") return 0;
  const match = value.match(/(\d+)/);
  return match ? Number.parseInt(match[1], 10) : null;
}

function parseBathroomNum(value: string): number | null {
  const match = value.match(/(\d+)/);
  return match ? Number.parseInt(match[1], 10) : null;
}

function parseBudgetRange(label: string, intent: SearchIntent) {
  const map = intent === "rent" ? RENT_BUDGETS : BUY_BUDGETS;
  const exact = map[label];
  if (!exact) return { min: null, max: null };
  return { min: exact[0], max: exact[1] };
}

function normalizeStatus(value: string | null): SearchStatus {
  if (value === "Off-Plan") return "Off-Plan";
  if (value === "Secondary") return "Secondary";
  return "All";
}

function normalizeIntent(value: string | null): SearchIntent {
  if (value === "buy") return "buy";
  if (value === "rent") return "rent";
  if (value === "off-plan") return "off-plan";
  return "";
}

export async function GET(req: NextRequest) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const status = normalizeStatus(searchParams.get("status"));
  const intent = normalizeIntent(searchParams.get("intent"));
  const type = searchParams.get("type") || "";
  const location = searchParams.get("location") || "";
  const city = searchParams.get("city") || "";
  const bedroomsStr = searchParams.get("bedrooms") || "";
  const bathroomsStr = searchParams.get("bathrooms") || "";
  const budget = searchParams.get("budget") || "";
  const developer = searchParams.get("developer") || "";
  const q = searchParams.get("q") || "";
  const limit = Math.min(parseInt(searchParams.get("limit") || "24", 10), 100);
  const skip = parseInt(searchParams.get("skip") || "0", 10);

  const explicitBudgetMin = parseOptionalNumber(searchParams.get("budgetMin"));
  const explicitBudgetMax = parseOptionalNumber(searchParams.get("budgetMax"));
  const fallbackBudget = parseBudgetRange(budget, intent);
  const minBudget = explicitBudgetMin ?? fallbackBudget.min;
  const maxBudget = explicitBudgetMax ?? fallbackBudget.max;

  const bedrooms = bedroomsStr ? parseBedroomNum(bedroomsStr) : null;
  const bathrooms = bathroomsStr ? parseBathroomNum(bathroomsStr) : null;

  const searchOffPlan = status === "Off-Plan" || intent === "off-plan" || (status === "All" && !intent);
  const searchSecondary = status === "Secondary" || intent === "buy" || intent === "rent" || (status === "All" && intent !== "off-plan");

  let projects: any[] = [];
  let listings: any[] = [];
  let projectCount = 0;
  let listingCount = 0;

  if (searchOffPlan) {
    const projectFilter: Record<string, any> = { publishStatus: "published" };

    if (type) projectFilter.propertyType = { $regex: escapeRegex(type), $options: "i" };
    if (location) projectFilter.community = { $regex: communityRegex(location) };
    if (city) projectFilter.city = { $regex: escapeRegex(city), $options: "i" };
    if (developer) projectFilter.developerName = { $regex: escapeRegex(developer), $options: "i" };

    if (minBudget != null || maxBudget != null) {
      projectFilter.startingPrice = {};
      if (minBudget != null) projectFilter.startingPrice.$gte = minBudget;
      if (maxBudget != null) projectFilter.startingPrice.$lte = maxBudget;
    }

    if (bedrooms != null) {
      projectFilter.bedrooms = bedrooms === 0
        ? { $regex: /studio/i }
        : { $regex: new RegExp(`${bedrooms}\\s*(BR|Bed|Bedroom)`, "i") };
    }

    if (bathrooms != null) {
      projectFilter.bathrooms = { $regex: new RegExp(`${bathrooms}\\s*(Bath|Bathroom)`, "i") };
    }

    if (q) {
      projectFilter.$or = [
        { name: { $regex: escapeRegex(q), $options: "i" } },
        { community: { $regex: escapeRegex(q), $options: "i" } },
        { developerName: { $regex: escapeRegex(q), $options: "i" } },
        { shortOverview: { $regex: escapeRegex(q), $options: "i" } },
      ];
    }

    [projects, projectCount] = await Promise.all([
      Project.find(projectFilter)
        .select("name slug status developerName community city startingPrice completionDate featuredImage imageGallery propertyType bedrooms bathrooms")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Project.countDocuments(projectFilter),
    ]);
  }

  if (searchSecondary) {
    const listingFilter: Record<string, any> = { publishStatus: "Published" };

    if (intent === "buy") listingFilter.listingType = "Sale";
    if (intent === "rent") listingFilter.listingType = "Rent";

    if (type) listingFilter.propertyType = { $regex: escapeRegex(type), $options: "i" };
    if (location) listingFilter.community = { $regex: communityRegex(location) };
    if (city) listingFilter.city = { $regex: escapeRegex(city), $options: "i" };

    if (minBudget != null || maxBudget != null) {
      listingFilter.price = {};
      if (minBudget != null) listingFilter.price.$gte = minBudget;
      if (maxBudget != null) listingFilter.price.$lte = maxBudget;
    }

    if (bedrooms != null) listingFilter.bedrooms = bedrooms;
    if (bathrooms != null) listingFilter.bathrooms = bathrooms;

    if (q) {
      listingFilter.$or = [
        { title: { $regex: escapeRegex(q), $options: "i" } },
        { community: { $regex: escapeRegex(q), $options: "i" } },
        { address: { $regex: escapeRegex(q), $options: "i" } },
        { subCommunity: { $regex: escapeRegex(q), $options: "i" } },
      ];
    }

    [listings, listingCount] = await Promise.all([
      Listing.find(listingFilter)
        .select("title slug listingType propertyType bedrooms bathrooms size sizeUnit price currency community city featuredImage images")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Listing.countDocuments(listingFilter),
    ]);
  }

  return NextResponse.json(
    {
      listings: JSON.parse(JSON.stringify(listings)),
      listingCount,
      projectCount,
      projects: JSON.parse(JSON.stringify(projects)),
      totalCount: projectCount + listingCount,
    },
    { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" } },
  );
}

function parseOptionalNumber(value: string | null) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
