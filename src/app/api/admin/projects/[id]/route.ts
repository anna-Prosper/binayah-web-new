import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";

export const dynamic = "force-dynamic";

const ADMIN_SECRET = process.env.PROJECT_ADMIN_SECRET || process.env.PROJECT_IMPORT_SECRET;

function isAuthorized(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret");
  return Boolean(ADMIN_SECRET && secret === ADMIN_SECRET);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const publishStatus = body?.publishStatus || (body?.action === "approve" ? "Published" : undefined);
  if (!publishStatus) {
    return NextResponse.json({ error: "Missing publishStatus" }, { status: 400 });
  }

  await connectDB();
  const result = await Project.updateOne({ _id: id }, { $set: { publishStatus } });

  if (result.matchedCount === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, modified: result.modifiedCount });
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
