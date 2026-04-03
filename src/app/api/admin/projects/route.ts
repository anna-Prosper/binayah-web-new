import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";

export const dynamic = "force-dynamic";

const ADMIN_SECRET = process.env.PROJECT_ADMIN_SECRET || process.env.PROJECT_IMPORT_SECRET;

function isAuthorized(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret");
  return Boolean(ADMIN_SECRET && secret === ADMIN_SECRET);
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
  const status = searchParams.get("status") || "Draft";

  const drafts = await Project.find({ publishStatus: status })
    .select("name slug developerName community city startingPrice currency featuredImage imageGallery source sourceUrl createdAt")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return NextResponse.json({ count: drafts.length, items: drafts });
}

export async function POST() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
