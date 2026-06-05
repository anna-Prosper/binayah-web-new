import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const ALLOWED_ACTIONS = new Set(["view", "whatsapp", "phone", "chat-open", "inquiry", "share", "save"]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, entityType, entitySlug, entityTitle } = body;

    if (!action || !ALLOWED_ACTIONS.has(action)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("binayah_web_new_dev");

    await db.collection("userevents").insertOne({
      action,
      entityType: entityType || "unknown",
      entitySlug: entitySlug || null,
      entityTitle: entityTitle || null,
      ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || null,
      userAgent: req.headers.get("user-agent") || null,
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    // Silent fail — tracking should never break the user experience
    console.warn("[/api/track]", (err as Error).message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
