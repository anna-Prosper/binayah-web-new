import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const DB = "binayah_web_new_dev";
const COL = "user_profiles";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const client = await clientPromise;
    const doc = await client
      .db(DB)
      .collection(COL)
      .findOne(
        { userId: session.user.id },
        { projection: { _id: 0, phone: 1, location: 1, displayName: 1, notifPrefs: 1 } }
      );
    return NextResponse.json(doc ?? {});
  } catch {
    return NextResponse.json({});
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const update: Record<string, string | Date | boolean> = { updatedAt: new Date() };

  if (body.displayName !== undefined) {
    update.displayName = String(body.displayName).trim().slice(0, 80);
  }
  if (body.phone !== undefined) {
    const v = String(body.phone).trim().slice(0, 20);
    if (v && !/^[\d\s\+\-\(\)]{0,20}$/.test(v)) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }
    update.phone = v;
  }
  if (body.location !== undefined) {
    update.location = String(body.location).trim().slice(0, 100);
  }

  // Notification prefs: { [slug]: { email, whatsapp, telegram } }
  if (body.notifPrefs && typeof body.notifPrefs === "object" && body.notifPrefs !== null) {
    const prefs = body.notifPrefs as Record<string, { email?: boolean; whatsapp?: boolean; telegram?: boolean }>;
    for (const [slug, channels] of Object.entries(prefs)) {
      if (!slug || typeof channels !== "object") continue;
      if (typeof channels.email === "boolean") update[`notifPrefs.${slug}.email`] = channels.email;
      if (typeof channels.whatsapp === "boolean") update[`notifPrefs.${slug}.whatsapp`] = channels.whatsapp;
      if (typeof channels.telegram === "boolean") update[`notifPrefs.${slug}.telegram`] = channels.telegram;
    }
  }

  try {
    const client = await clientPromise;
    await client
      .db(DB)
      .collection(COL)
      .updateOne({ userId: session.user.id }, { $set: update }, { upsert: true });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
