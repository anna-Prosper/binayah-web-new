import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import clientPromise from "@/lib/mongodb";
import { sendMail } from "@/lib/mailer";
import { checkRateLimit } from "@/lib/rateLimit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    // Always 200 — no enumeration
    return NextResponse.json({ ok: true });
  }

  const email = (body.email || "").toLowerCase().trim();

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: true });
  }

  // Rate limit by email (no enumeration risk — rate limits on email are OK)
  // Always return 200 even when limited, to prevent enumeration of the limit state.
  if (!(await checkRateLimit("forgot", email, 3, 60 * 60 * 1000))) {
    return NextResponse.json({ ok: true });
  }

  try {
    const client = await clientPromise;
    const db = client.db("binayah_web_new_dev");
    const users = db.collection("users");
    const tokens = db.collection("password_reset_tokens");

    const user = await users.findOne(
      { email },
      { projection: { _id: 1 } }
    );

    if (user) {
      // Invalidate prior unused tokens for this user
      await tokens.updateMany(
        { userId: user._id, usedAt: null },
        { $set: { usedAt: new Date(), invalidated: true } }
      );

      // Generate token
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 60 * 60 * 1000);

      await tokens.insertOne({
        userId: user._id,
        tokenHash,
        expiresAt,
        usedAt: null,
        createdAt: now,
      });

      const baseUrl = process.env.NEXTAUTH_URL || "https://staging.binayahhub.com";
      const resetLink = `${baseUrl}/en/reset-password?token=${rawToken}`;

      const html = `
        <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px 24px;background:#fff;border-radius:12px;border:1px solid #e5e7eb;">
          <div style="text-align:center;margin-bottom:24px;">
            <div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:14px;background:linear-gradient(135deg,#0B3D2E,#1A7A5A);">
              <span style="color:#fff;font-weight:700;font-size:22px;">B</span>
            </div>
          </div>
          <h2 style="color:#0B3D2E;margin:0 0 8px;">Reset your password</h2>
          <p style="color:#4b5563;margin:0 0 24px;line-height:1.6;">
            We received a request to reset your Binayah Properties password. Click the button below to choose a new password. This link expires in 1 hour.
          </p>
          <div style="text-align:center;margin-bottom:24px;">
            <a href="${resetLink}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#0B3D2E,#1A7A5A);color:#fff;text-decoration:none;border-radius:10px;font-weight:600;font-size:15px;">
              Reset Password
            </a>
          </div>
          <p style="color:#9ca3af;font-size:13px;line-height:1.5;">
            If you didn't request this, you can safely ignore this email. Your password won't change.
          </p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
          <p style="color:#d1d5db;font-size:12px;text-align:center;margin:0;">
            Binayah Properties &mdash; Dubai Real Estate
          </p>
        </div>
      `;

      const text = `Reset your Binayah Properties password\n\nClick the link below to reset your password (expires in 1 hour):\n${resetLink}\n\nIf you didn't request this, ignore this email.`;

      await sendMail({
        to: email,
        subject: "Reset your Binayah Properties password",
        html,
        text,
      });
    }
  } catch {
    // Swallow errors — always return 200 to prevent enumeration
  }

  return NextResponse.json({ ok: true });
}
