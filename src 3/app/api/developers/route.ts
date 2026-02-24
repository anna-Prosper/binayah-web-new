export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Developer from "@/models/Developer";
import Project from "@/models/Project";

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("q");
  const limit = Math.min(parseInt(searchParams.get("limit") || "48"), 200);
  const skip = parseInt(searchParams.get("skip") || "0");

  const filter: Record<string, unknown> = { publishStatus: "Published" };
  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  // Get developers
  const developers = await Developer.find(filter)
    .select("name slug logo description")
    .sort({ name: 1 })
    .skip(skip)
    .limit(limit)
    .lean();

  // Get real project counts grouped by developerName
  const projectCounts = await Project.aggregate([
    { $match: { publishStatus: "Published" } },
    { $group: { _id: "$developerName", count: { $sum: 1 } } },
  ]);

  // Build a map: lowercased developerName -> count
  const countMap = new Map<string, number>();
  for (const pc of projectCounts) {
    if (pc._id) countMap.set(pc._id.toLowerCase(), pc.count);
  }

  // Merge real counts into developer records
  const result = developers.map((dev) => ({
    ...dev,
    projectCount: countMap.get(dev.name.toLowerCase()) || 0,
  }));

  // Sort by real project count descending, then name
  result.sort((a, b) => b.projectCount - a.projectCount || a.name.localeCompare(b.name));

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
