export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ConstructionUpdate from "@/models/ConstructionUpdate";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  await connectDB();
  const { slug } = await params;
  const update = await ConstructionUpdate.findOne({ slug }).lean();
  if (!update) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(update, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
  });
}
