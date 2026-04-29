import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/lib/email";

export const runtime = "nodejs";

// ── HTML escaping ─────────────────────────────────────────────────────────────

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ── Rate limiting (in-memory sliding window: max 3 sends/IP/hour) ─────────────

type RateBucket = { count: number; resetAt: number };
const rateLimitMap = new Map<string, RateBucket>();
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function getClientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

function checkRateLimit(ip: string): { ok: boolean; resetAt?: number } {
  const now = Date.now();
  const bucket = rateLimitMap.get(ip);
  if (!bucket || bucket.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { ok: true };
  }
  if (bucket.count >= RATE_LIMIT_MAX) {
    return { ok: false, resetAt: bucket.resetAt };
  }
  bucket.count += 1;
  return { ok: true };
}

// Periodic cleanup so the Map doesn't grow unbounded under attack
setInterval(() => {
  const now = Date.now();
  for (const [ip, bucket] of rateLimitMap.entries()) {
    if (bucket.resetAt < now) rateLimitMap.delete(ip);
  }
}, 5 * 60 * 1000); // every 5 min

// ── Types ─────────────────────────────────────────────────────────────────────

interface CalcSnapshot {
  community: string;
  budget: number;
  propType: string;
  purpose: string;
  financing: string;
  downPaymentPct: number;
  grossYield: number;
  netYield: number;
  annualRental: number;
  value5yr: number;
  roi5yr: number;
}

interface RequestBody {
  name: string;
  email: string;
  phone?: string;
  calc: CalcSnapshot;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const AED = (n: number) => {
  if (n >= 1_000_000) return `AED ${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `AED ${(n / 1_000).toFixed(0)}K`;
  return `AED ${n.toLocaleString()}`;
};

const pct = (n: number) => `${n.toFixed(1)}%`;

function buildEmailHtml(name: string, calc: CalcSnapshot): string {
  const BRAND_GREEN = "#0B3D2E";
  const GOLD = "#C9A84C";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Dubai Investment Report</title>
</head>
<body style="margin:0;padding:0;background:#F8F9FA;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#FFFFFF;border-radius:12px;overflow:hidden;border:1px solid #E5E7EB;">
    <!-- Header -->
    <div style="background:${BRAND_GREEN};padding:28px 32px;text-align:left;">
      <p style="margin:0;font-size:20px;font-weight:bold;color:#FFFFFF;letter-spacing:1px;">BINAYAH</p>
      <p style="margin:4px 0 0;font-size:10px;color:rgba(255,255,255,0.7);letter-spacing:2px;text-transform:uppercase;">Investment Calculator Report</p>
      <div style="height:3px;width:40px;background:${GOLD};margin-top:10px;border-radius:2px;"></div>
    </div>

    <!-- Body -->
    <div style="padding:32px;">
      <p style="font-size:16px;color:#1A1A2E;margin:0 0 8px;">Hi ${escapeHtml(name)},</p>
      <p style="font-size:14px;color:#6B7280;margin:0 0 24px;line-height:1.6;">
        Here is your personalised Dubai investment analysis for <strong style="color:#1A1A2E;">${escapeHtml(calc.community)}</strong>.
      </p>

      <!-- KPI Grid -->
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:24px;">
        <tr>
          <td width="50%" style="padding:0 8px 12px 0;">
            <div style="background:#F9FAFB;border-radius:10px;padding:14px;border-left:3px solid ${GOLD};">
              <p style="margin:0 0 4px;font-size:10px;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.8px;">Budget</p>
              <p style="margin:0;font-size:18px;font-weight:bold;color:#1A1A2E;">${AED(calc.budget)}</p>
            </div>
          </td>
          <td width="50%" style="padding:0 0 12px 8px;">
            <div style="background:#F9FAFB;border-radius:10px;padding:14px;border-left:3px solid ${GOLD};">
              <p style="margin:0 0 4px;font-size:10px;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.8px;">Gross Yield</p>
              <p style="margin:0;font-size:18px;font-weight:bold;color:#1A1A2E;">${pct(calc.grossYield)}</p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:0 8px 12px 0;">
            <div style="background:#F9FAFB;border-radius:10px;padding:14px;border-left:3px solid ${GOLD};">
              <p style="margin:0 0 4px;font-size:10px;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.8px;">Net Yield</p>
              <p style="margin:0;font-size:18px;font-weight:bold;color:#1A1A2E;">${pct(calc.netYield)}</p>
            </div>
          </td>
          <td style="padding:0 0 12px 8px;">
            <div style="background:#F9FAFB;border-radius:10px;padding:14px;border-left:3px solid ${GOLD};">
              <p style="margin:0 0 4px;font-size:10px;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.8px;">Est. Annual Rental</p>
              <p style="margin:0;font-size:18px;font-weight:bold;color:#1A1A2E;">${AED(calc.annualRental)}</p>
            </div>
          </td>
        </tr>
      </table>

      <!-- 5-yr projection -->
      <div style="background:linear-gradient(135deg,#0B3D2E,#1A7A5A);border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;">
        <p style="margin:0 0 6px;font-size:11px;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:1px;">5-Year Projected Value</p>
        <p style="margin:0;font-size:28px;font-weight:bold;color:#FFFFFF;">${AED(calc.value5yr)}</p>
        <p style="margin:4px 0 0;font-size:12px;color:${GOLD};">+${pct(calc.roi5yr)} total return</p>
      </div>

      <!-- Details -->
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:13px;margin-bottom:24px;">
        <tr style="border-bottom:1px solid #F3F4F6;">
          <td style="padding:8px 0;color:#6B7280;">Property type</td>
          <td style="padding:8px 0;text-align:right;color:#1A1A2E;font-weight:600;">${escapeHtml(calc.propType)}</td>
        </tr>
        <tr style="border-bottom:1px solid #F3F4F6;">
          <td style="padding:8px 0;color:#6B7280;">Purpose</td>
          <td style="padding:8px 0;text-align:right;color:#1A1A2E;font-weight:600;">${escapeHtml(calc.purpose)}</td>
        </tr>
        <tr style="border-bottom:1px solid #F3F4F6;">
          <td style="padding:8px 0;color:#6B7280;">Financing</td>
          <td style="padding:8px 0;text-align:right;color:#1A1A2E;font-weight:600;">${escapeHtml(calc.financing)}${calc.financing === "mortgage" ? ` (${calc.downPaymentPct}% down)` : ""}</td>
        </tr>
      </table>

      <!-- CTA -->
      <div style="text-align:center;margin-top:8px;">
        <a href="https://staging.binayahhub.com/pulse/calculator?utm_source=email&utm_medium=report&utm_campaign=calculator-lead"
           style="display:inline-block;background:linear-gradient(135deg,#0B3D2E,#1A7A5A);color:#FFFFFF;text-decoration:none;padding:12px 28px;border-radius:10px;font-size:14px;font-weight:bold;">
          Adjust my calculation
        </a>
        <p style="margin:16px 0 0;font-size:12px;color:#9CA3AF;">or <a href="https://staging.binayahhub.com/contact" style="color:${BRAND_GREEN};text-decoration:none;">talk to a Binayah agent</a></p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:${BRAND_GREEN};padding:16px 32px;display:flex;justify-content:space-between;align-items:center;">
      <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.6);">Binayah Properties · binayahhub.com</p>
      <p style="margin:0;font-size:10px;color:rgba(255,255,255,0.4);">Projections are illustrative. Past performance does not guarantee future results.</p>
    </div>
  </div>
</body>
</html>`;
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Rate limit check — before any work
  const ip = getClientIp(req);
  const rl = checkRateLimit(ip);
  if (!rl.ok) {
    const retryAfterSec = Math.ceil((rl.resetAt! - Date.now()) / 1000);
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429, headers: { "Retry-After": retryAfterSec.toString() } }
    );
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  const { name, email, phone, calc } = body;

  // Input validation
  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ message: "Name and email are required" }, { status: 400 });
  }
  if (name.length > 200) {
    return NextResponse.json({ message: "Invalid input" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ message: "Invalid email address" }, { status: 400 });
  }
  if (!calc || typeof calc !== "object" || Array.isArray(calc)) {
    return NextResponse.json({ message: "Invalid input" }, { status: 400 });
  }

  // Send the HTML email to the user
  try {
    await sendMail({
      to: email,
      subject: `Your Dubai Investment Report — ${calc?.community ?? "Dubai"}`,
      html: buildEmailHtml(name, calc),
    });
  } catch (err) {
    console.error("[calculator/email] sendMail failed:", err);
    return NextResponse.json({ message: "Failed to send email — please try again" }, { status: 500 });
  }

  // Log lead to binayah-api as a calculator-lead (fire-and-forget, non-blocking)
  const API_BASE = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  if (API_BASE) {
    try {
      await fetch(`${API_BASE}/api/market-report/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: phone || undefined,
          intents: ["calculator-lead"],
          areas: calc?.community ? [calc.community] : [],
          propertyTypes: calc?.propType ? [calc.propType] : [],
          source: "calculator",
        }),
        signal: AbortSignal.timeout(5000),
      });
    } catch {
      // Non-blocking — don't fail the request if lead logging fails
    }
  }

  return NextResponse.json({ ok: true });
}
