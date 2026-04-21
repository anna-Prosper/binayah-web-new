import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

async function getNotificationsCollection() {
  const client = await clientPromise;
  return client.db("binayah_web_new_dev").collection("project_notifications");
}

// ── GET /api/notifications ──────────────────────────────────────────────────
// Returns last 50 notifications for the authenticated user.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    // Anon users get an empty list; client reads localStorage instead.
    return NextResponse.json({ items: [] });
  }

  try {
    const col = await getNotificationsCollection();
    const items = await col
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({
      items: items.map((n) => ({
        id: n._id.toString(),
        slug: n.slug,
        projectName: n.projectName,
        projectImage: n.projectImage ?? null,
        type: n.type,
        title: n.title,
        body: n.body ?? null,
        read: n.read,
        createdAt: n.createdAt,
      })),
    });
  } catch (err) {
    console.error("[notifications GET]", err);
    return NextResponse.json({ error: "db_unreachable" }, { status: 503 });
  }
}

// ── PATCH /api/notifications ────────────────────────────────────────────────
// Marks notifications as read. body: { ids: string[] }
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { ids?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const ids = (body.ids || [])
    .filter((id) => typeof id === "string" && id.length === 24)
    .map((id) => {
      try { return new ObjectId(id); } catch { return null; }
    })
    .filter(Boolean) as ObjectId[];

  if (ids.length === 0) return NextResponse.json({ ok: true });

  try {
    const col = await getNotificationsCollection();
    await col.updateMany(
      { _id: { $in: ids }, userId: session.user.id },
      { $set: { read: true } }
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[notifications PATCH]", err);
    return NextResponse.json({ error: "db_unreachable" }, { status: 503 });
  }
}
