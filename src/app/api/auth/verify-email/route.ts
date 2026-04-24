import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import clientPromise from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  const rawToken = req.nextUrl.searchParams.get("token")?.trim() || "";
  const base = process.env.NEXTAUTH_URL || "https://staging.binayahhub.com";

  if (!rawToken) {
    return NextResponse.redirect(`${base}/signin?error=verify`);
  }

  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const client = await clientPromise;
  const db = client.db("binayah_web_new_dev");
  const tokens = db.collection("email_verification_tokens");
  const users = db.collection("users");

  const claimed = await tokens.findOneAndUpdate(
    { tokenHash, usedAt: null, expiresAt: { $gt: new Date() } },
    { $set: { usedAt: new Date() } },
    { returnDocument: "before" }
  );

  const tokenDoc = (claimed as any)?.value ?? claimed;
  if (!tokenDoc) {
    return NextResponse.redirect(`${base}/signin?error=verify`);
  }

  await users.updateOne(
    { _id: tokenDoc.userId },
    { $set: { emailVerified: new Date() } }
  );

  return NextResponse.redirect(`${base}/signin?verified=1`);
}
