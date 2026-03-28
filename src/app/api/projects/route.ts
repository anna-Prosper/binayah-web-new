export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";

const CARD_FIELDS = "name slug status developerName community city startingPrice completionDate shortOverview featuredImage imageGallery propertyType";

export async function GET(req: NextRequest) {
  await connectDB(); 
  const { searchParams } = new URL(req.url);
  const community = searchParams.get("community");
  const status = searchParams.get("status");
  const search = searchParams.get("q");
  const limit = Math.min(parseInt(searchParams.get("limit") || "48"), 100);
  const skip = parseInt(searchParams.get("skip") || "0");

  const filter: Record<string, unknown> = { publishStatus: "Published" };
  if (community) filter.community = community;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { community: { $regex: search, $options: "i" } },
      { developerName: { $regex: search, $options: "i" } },
    ];
  }

  const projects = await Project.find(filter)
    .select(CARD_FIELDS)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  
  return NextResponse.json(projects, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
