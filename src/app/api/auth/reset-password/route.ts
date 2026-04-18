import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";

const PASSWORD_RE = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;

export async function POST(req: NextRequest) {
  let body: { token?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const rawToken = (body.token || "").trim();
  const password = body.password || "";

  if (!rawToken) {
    return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 400 });
  }

  if (!PASSWORD_RE.test(password)) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters with at least one letter and one digit." },
      { status: 400 }
    );
  }

  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  const client = await clientPromise;
  const db = client.db("binayah_web_new_dev");
  const tokens = db.collection("password_reset_tokens");
  const users = db.collection("users");

  // Atomic claim: find an unused, unexpired token and mark it used in one operation.
  const claimed = await tokens.findOneAndUpdate(
    {
      tokenHash,
      usedAt: null,
      expiresAt: { $gt: new Date() },
    },
    { $set: { usedAt: new Date() } },
    { returnDocument: "before" }
  );

  // MongoDB Node driver v5+ returns the document directly; v4 wraps in .value
  const tokenDoc = (claimed as any)?.value ?? claimed;
  if (!tokenDoc) {
    return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await users.updateOne(
    { _id: tokenDoc.userId },
    {
      $set: {
        passwordHash,
        emailVerified: new Date(),
      },
    }
  );

  return NextResponse.json({ ok: true });
}
