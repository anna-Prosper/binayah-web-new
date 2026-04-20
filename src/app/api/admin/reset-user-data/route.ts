import { NextRequest, NextResponse } from "next/server";
import crypto, { timingSafeEqual } from "crypto";
import clientPromise from "@/lib/mongodb";

const COLLECTIONS = [
  "users",
  "accounts",
  "sessions",
  "verificationtokens",
  "verification_tokens",
  "favorites",
  "inquiries",
  "property_submissions",
  "submission_events",
  "password_reset_tokens",
  "rate_limits",
];

function safeCompare(candidate: string, secret: string): boolean {
  const key = "binayah-admin-compare";
  const a = crypto.createHmac("sha256", key).update(candidate).digest();
  const b = crypto.createHmac("sha256", key).update(secret).digest();
  return timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const provided = req.headers.get("x-admin-secret") || "";
  if (!provided || !safeCompare(provided, adminSecret)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db("binayah_web_new_dev");
  const existing = (await db.listCollections().toArray()).map((c) => c.name);

  const results: Record<string, string> = {};
  for (const name of COLLECTIONS) {
    if (!existing.includes(name)) {
      results[name] = "skipped (not present)";
      continue;
    }
    try {
      const count = await db.collection(name).countDocuments();
      await db.collection(name).drop();
      results[name] = `dropped (${count} docs)`;
    } catch (e) {
      results[name] = `error: ${(e as Error).message}`;
    }
  }

  return NextResponse.json({ ok: true, results });
}
