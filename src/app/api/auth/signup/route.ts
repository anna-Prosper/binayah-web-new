import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";

// Simple in-memory rate limiter: max 5 signups per IP per 10 min
const signupRateMap = new Map<string, { count: number; resetAt: number }>();

function checkSignupRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = signupRateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    signupRateMap.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RE = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (!checkSignupRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many signup attempts. Try again later." },
      { status: 429 }
    );
  }

  let body: { name?: string; email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const name = (body.name || "").trim();
  const email = (body.email || "").toLowerCase().trim();
  const password = body.password || "";

  if (!name || name.length < 1 || name.length > 80) {
    return NextResponse.json(
      { error: "Name must be between 1 and 80 characters." },
      { status: 400 }
    );
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }
  if (!PASSWORD_RE.test(password)) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters with at least one letter and one digit." },
      { status: 400 }
    );
  }

  const client = await clientPromise;
  const db = client.db("binayah_web_new_dev");
  const users = db.collection("users");

  const existing = await users.findOne(
    { email },
    { projection: { _id: 1, passwordHash: 1 } }
  );

  const passwordHash = await bcrypt.hash(password, 10);

  if (existing) {
    if (existing.passwordHash) {
      // Already has a password — don't leak existence, just 409
      return NextResponse.json(
        { error: "Email already registered." },
        { status: 409 }
      );
    }
    // Google-only user — attach password hash (merge)
    await users.updateOne(
      { _id: existing._id },
      { $set: { passwordHash, emailVerified: new Date(), name } }
    );
  } else {
    await users.insertOne({
      email,
      name,
      passwordHash,
      emailVerified: new Date(), // skip email verification for MVP
      createdAt: new Date(),
    });
  }

  return NextResponse.json({ ok: true });
}
