import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import clientPromise from "@/lib/mongodb";
import { sendMail } from "@/lib/mailer";
import { checkRateLimit } from "@/lib/rateLimit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RE = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (!(await checkRateLimit("signup", ip, 5, 10 * 60 * 1000))) {
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

  if (existing?.passwordHash) {
    return NextResponse.json(
      { error: "Email already registered." },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  let userId;
  if (existing) {
    // Google-only user — attach password, keep emailVerified as-is (already verified via Google)
    await users.updateOne(
      { _id: existing._id },
      { $set: { passwordHash, name } }
    );
    userId = existing._id;
    // Google users already have emailVerified set — send welcome instead of verify email
    return NextResponse.json({ ok: true, verified: true });
  } else {
    const result = await users.insertOne({
      email,
      name,
      passwordHash,
      emailVerified: null,
      createdAt: new Date(),
    });
    userId = result.insertedId;
  }

  // Create verification token
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  await db.collection("email_verification_tokens").insertOne({
    userId,
    tokenHash,
    expiresAt,
    usedAt: null,
    createdAt: new Date(),
  });

  const baseUrl = process.env.NEXTAUTH_URL || "https://staging.binayahhub.com";
  const verifyLink = `${baseUrl}/api/auth/verify-email?token=${rawToken}`;

  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px 24px;background:#fff;border-radius:12px;border:1px solid #e5e7eb;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:14px;background:linear-gradient(135deg,#0B3D2E,#1A7A5A);">
          <span style="color:#fff;font-weight:700;font-size:22px;">B</span>
        </div>
      </div>
      <h2 style="color:#0B3D2E;margin:0 0 8px;">Verify your email</h2>
      <p style="color:#4b5563;margin:0 0 24px;line-height:1.6;">
        Welcome to Binayah Properties, ${name}! Click the button below to verify your email address and activate your account. This link expires in 24 hours.
      </p>
      <div style="text-align:center;margin-bottom:24px;">
        <a href="${verifyLink}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#0B3D2E,#1A7A5A);color:#fff;text-decoration:none;border-radius:10px;font-weight:600;font-size:15px;">
          Verify Email Address
        </a>
      </div>
      <p style="color:#9ca3af;font-size:13px;line-height:1.5;">
        If you didn't create an account, you can safely ignore this email.
      </p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
      <p style="color:#d1d5db;font-size:12px;text-align:center;margin:0;">
        Binayah Properties &mdash; Dubai Real Estate
      </p>
    </div>
  `;

  try {
    await sendMail({
      to: email,
      subject: "Verify your Binayah Properties email",
      html,
      text: `Welcome to Binayah Properties!\n\nVerify your email by clicking this link (expires in 24 hours):\n${verifyLink}\n\nIf you didn't create an account, ignore this email.`,
    });
  } catch {
    // Don't fail signup if email fails — user can request resend
  }

  return NextResponse.json({ ok: true, verified: false });
}
