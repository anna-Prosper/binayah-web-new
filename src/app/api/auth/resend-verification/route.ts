import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import clientPromise from "@/lib/mongodb";
import { sendMail } from "@/lib/mailer";
import { checkRateLimit } from "@/lib/rateLimit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOKEN_TTL_HOURS = 24;

/**
 * POST /api/auth/resend-verification  { email }
 *
 * Reissues a verification token + email for an existing unverified account.
 * Silent-success on unknown / already-verified emails (no enumeration leak).
 * Rate-limited per-IP to prevent spam.
 */
export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (!(await checkRateLimit("resend-verify", ip, 3, 10 * 60 * 1000))) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429 }
    );
  }

  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const email = (body.email || "").toLowerCase().trim();
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db("binayah_web_new_dev");
  const users = db.collection("users");
  const tokens = db.collection("email_verification_tokens");

  const user = await users.findOne(
    { email },
    { projection: { _id: 1, name: 1, emailVerified: 1, passwordHash: 1 } }
  );

  // No-op if user doesn't exist or is already verified.
  // (Return ok:true so callers don't learn whether the email is registered.)
  if (!user || !user.passwordHash || user.emailVerified) {
    return NextResponse.json({ ok: true });
  }

  // Generate fresh token, invalidate prior unused ones
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000);

  await tokens.deleteMany({ userId: user._id });
  await tokens.insertOne({
    userId: user._id,
    tokenHash,
    expiresAt,
    createdAt: new Date(),
  });

  const baseUrl = process.env.NEXTAUTH_URL || "https://www.binayah.ae";
  const verifyLink = `${baseUrl}/api/auth/verify-email?token=${rawToken}`;
  const name = String(user.name || "there");

  const html = `
    <div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#fff;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:14px;background-color:#0B3D2E;background-image:linear-gradient(135deg,#0B3D2E,#1A7A5A);">
          <span style="color:#fff;font-weight:700;font-size:22px;">B</span>
        </div>
      </div>
      <h1 style="color:#0B3D2E;font-size:22px;margin:0 0 14px;text-align:center;font-weight:700;">Verify your email</h1>
      <p style="color:#374151;font-size:15px;line-height:1.6;margin-bottom:24px;">
        Hi ${name}, here's a fresh link to verify your Binayah Properties account. It expires in 24 hours.
      </p>
      <div style="text-align:center;margin-bottom:24px;">
        <!--[if mso]>
        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${verifyLink}" style="height:48px;v-text-anchor:middle;width:240px;" arcsize="22%" stroke="f" fillcolor="#0B3D2E">
          <w:anchorlock/>
          <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:600;">Verify Email Address</center>
        </v:roundrect>
        <![endif]-->
        <!--[if !mso]><!-- -->
        <a href="${verifyLink}" style="display:inline-block;padding:14px 32px;background-color:#0B3D2E;background-image:linear-gradient(135deg,#0B3D2E,#1A7A5A);color:#ffffff;text-decoration:none;border-radius:10px;font-weight:600;font-size:15px;">
          Verify Email Address
        </a>
        <!--<![endif]-->
      </div>
      <p style="color:#6b7280;font-size:13px;line-height:1.5;margin-top:-8px;text-align:center;">
        Button not showing? <a href="${verifyLink}" style="color:#0B3D2E;text-decoration:underline;">Click here to verify</a>.
      </p>
      <p style="color:#9ca3af;font-size:13px;line-height:1.5;text-align:center;margin-top:24px;">
        If you didn't request this, you can safely ignore the email.
      </p>
    </div>
  `;

  try {
    await sendMail({
      to: email,
      subject: "Verify your Binayah Properties email",
      html,
      text: `Verify your Binayah Properties email by visiting this link (expires in 24 hours):\n${verifyLink}\n\nIf you didn't request this, ignore this email.`,
    });
  } catch (err) {
    console.error("[resend-verification] mail failed:", err);
    return NextResponse.json({ error: "Could not send email. Try again later." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
