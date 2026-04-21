import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { sendMail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rateLimit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Strip HTML tags and trim to max length to prevent injection via body.projectName. */
function sanitizeProjectName(raw: string, max = 200): string {
  return raw.replace(/<[^>]*>/g, "").slice(0, max).trim();
}

/** Escape characters that have special meaning in HTML. */
function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

async function getCollections() {
  const client = await clientPromise;
  const db = client.db("binayah_web_new_dev");

  const subscriptions = db.collection("project_subscriptions");
  const notifications = db.collection("project_notifications");

  // Ensure indexes (idempotent)
  await Promise.all([
    subscriptions.createIndex({ email: 1, slug: 1 }, { unique: true }),
    subscriptions.createIndex({ userId: 1, slug: 1 }),
    subscriptions.createIndex({ unsubscribeToken: 1 }, { unique: true, sparse: true }),
    notifications.createIndex({ userId: 1, createdAt: -1 }),
    notifications.createIndex({ email: 1, createdAt: -1 }),
    notifications.createIndex({ createdAt: 1 }, { expireAfterSeconds: 180 * 24 * 60 * 60 }),
  ]).catch(() => {
    // Indexes may already exist; ignore errors
  });

  return { subscriptions, notifications };
}

// ── GET /api/project-subscriptions ─────────────────────────────────────────
// Returns { slugs: string[] } for the authenticated user.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { subscriptions } = await getCollections();
    const rows = await subscriptions
      .find({ userId: session.user.id }, { projection: { slug: 1 } })
      .toArray();
    return NextResponse.json({ slugs: rows.map((r) => r.slug as string) });
  } catch (err) {
    console.error("[project-subscriptions GET]", err);
    return NextResponse.json({ error: "db_unreachable" }, { status: 503 });
  }
}

// ── POST /api/project-subscriptions ────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  let body: {
    slug?: string;
    projectName?: string;
    projectImage?: string;
    email?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const slug = (body.slug || "").trim();
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const projectName = sanitizeProjectName(body.projectName || slug);
  const projectImage: string | null = body.projectImage || null;

  // Determine email — session takes priority
  let email: string;
  let userId: string | null = null;

  if (session?.user?.email && session?.user?.id) {
    email = session.user.email.toLowerCase().trim();
    userId = session.user.id;
  } else {
    // Anonymous — body.email required
    const rawEmail = (body.email || "").toLowerCase().trim();
    if (!EMAIL_RE.test(rawEmail)) {
      return NextResponse.json({ error: "valid email required" }, { status: 400 });
    }
    email = rawEmail;

    // Rate-limit anon by IP: 10/10min
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const allowed = await checkRateLimit("sub-anon", ip, 10, 10 * 60 * 1000).catch(() => true);
    if (!allowed) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }
  }

  try {
    const { subscriptions, notifications } = await getCollections();

    // Check for existing subscription
    const existing = await subscriptions.findOne({ email, slug });
    if (existing) {
      return NextResponse.json({ ok: true, alreadySubscribed: true });
    }

    // Create subscription row
    const unsubscribeToken = crypto.randomBytes(24).toString("hex");
    const now = new Date();
    await subscriptions.insertOne({
      userId,
      email,
      slug,
      projectName,
      createdAt: now,
      unsubscribeToken,
    });

    // Create notification row
    const notifTitle = `Subscribed to ${projectName}`;
    await notifications.insertOne({
      userId,
      email,
      slug,
      projectName,
      projectImage,
      type: "subscribed",
      title: notifTitle,
      body: `You'll be first to hear about price changes, new floor plans, construction milestones, and launch events.`,
      read: false,
      createdAt: now,
    });

    // Send confirmation email (fire-and-forget — never block HTTP response)
    const baseUrl =
      process.env.NEXTAUTH_URL || "https://staging.binayahhub.com";
    const unsubscribeUrl = `${baseUrl}/api/project-subscriptions/unsubscribe?token=${unsubscribeToken}`;

    const safeProjectName = escHtml(projectName);
    sendMail({
      to: email,
      subject: `You're subscribed to ${projectName} updates`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px 24px;background:#fff;border-radius:12px;border:1px solid #e5e7eb;">
          <div style="text-align:center;margin-bottom:24px;">
            <div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:14px;background:linear-gradient(135deg,#0B3D2E,#1A7A5A);">
              <span style="color:#fff;font-weight:700;font-size:22px;">B</span>
            </div>
          </div>
          <h2 style="color:#0B3D2E;margin:0 0 8px;">You're subscribed!</h2>
          <p style="color:#4b5563;margin:0 0 16px;line-height:1.6;">
            You'll be the first to hear about updates for <strong>${safeProjectName}</strong>, including:
          </p>
          <ul style="color:#4b5563;margin:0 0 24px;padding-left:20px;line-height:1.8;">
            <li>Price changes</li>
            <li>New floor plans</li>
            <li>Construction milestones</li>
            <li>Launch events</li>
          </ul>
          <p style="color:#9ca3af;font-size:13px;line-height:1.5;">
            Don't want these updates?
            <a href="${unsubscribeUrl}" style="color:#0B3D2E;">Unsubscribe here</a>.
          </p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
          <p style="color:#d1d5db;font-size:12px;text-align:center;margin:0;">
            Binayah Properties &mdash; Dubai Real Estate
          </p>
        </div>
      `,
      text: `You're subscribed to ${projectName} updates!\n\nYou'll be the first to hear about price changes, new floor plans, construction milestones, and launch events.\n\nUnsubscribe: ${unsubscribeUrl}`,
    }).catch((err) => {
      console.error("[project-subscriptions] email send failed:", err?.message);
    });

    return NextResponse.json({ ok: true, alreadySubscribed: false });
  } catch (err) {
    console.error("[project-subscriptions POST]", err);
    return NextResponse.json({ error: "db_unreachable" }, { status: 503 });
  }
}

// ── DELETE /api/project-subscriptions ──────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { slug?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const slug = (body.slug || "").trim();
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const email = session.user.email.toLowerCase().trim();
  const userId = session.user.id;

  try {
    const { subscriptions } = await getCollections();
    await subscriptions.deleteOne({
      $or: [{ userId, slug }, { email, slug }],
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[project-subscriptions DELETE]", err);
    return NextResponse.json({ error: "db_unreachable" }, { status: 503 });
  }
}
