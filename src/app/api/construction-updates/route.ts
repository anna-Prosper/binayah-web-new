export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ConstructionUpdate from "@/models/ConstructionUpdate";

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const developer = searchParams.get("developer");
  const status = searchParams.get("status"); // "completed" or "in-progress"
  const search = searchParams.get("q");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);

  const filter: Record<string, unknown> = {};
  if (developer) filter.developerName = { $regex: developer, $options: "i" };
  if (status === "completed") filter.progress = { $gte: 100 };
  if (status === "in-progress") filter.$or = [{ progress: { $lt: 100 } }, { progress: null }];
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { developerName: { $regex: search, $options: "i" } },
      { projectLocation: { $regex: search, $options: "i" } },
    ];
  }

  const updates = await ConstructionUpdate.find(filter)
    .sort({ publishedAt: -1 })
    .limit(limit)
    .lean();

  return NextResponse.json(updates, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
  });
}
