export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";

export const revalidate = 60;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  await connectDB();
  const { slug } = await params;
  const project = await Project.findOne({ slug, publishStatus: "published" }).lean();
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  
  return NextResponse.json(project, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
