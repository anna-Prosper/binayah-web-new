import { NextRequest, NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

const ALLOWED_ACTIONS = new Set(["whatsapp", "phone", "chat-open", "inquiry", "view"]);

// GET /api/admin/events?action=whatsapp&limit=50&skip=0
export async function GET(req: NextRequest) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const action = searchParams.get("action") ?? "";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 200);
  const skip = Math.max(parseInt(searchParams.get("skip") ?? "0", 10), 0);

  if (!ALLOWED_ACTIONS.has(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("binayah_web_new_dev");
    const col = db.collection("userevents");

    const [events, total] = await Promise.all([
      col
        .find({ action })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .project({ _id: 0, action: 1, source: 1, entityType: 1, entitySlug: 1, entityTitle: 1, createdAt: 1 })
        .toArray(),
      col.countDocuments({ action }),
    ]);

    return NextResponse.json({ events, total, limit, skip });
  } catch (err) {
    console.error("[admin/events]", err);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
