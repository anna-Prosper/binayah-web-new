/**
 * POST /api/deal-check/unlock
 *
 * Captures the lead attached to a Deal Check report.
 *
 * The report itself is NOT gated — a visitor gets the full assessment whether
 * or not they leave details. This endpoint is for someone who wants an agent
 * to review the deal with them. Gating honest financial analysis behind a form
 * would undercut the entire premise of the tool.
 *
 * Follows the list-your-property pattern: PII encrypted at rest with a
 * searchable HMAC, honeypot trips persist the lead FLAGGED rather than
 * silently dropping it (a false positive would lose a real buyer), and
 * notifications are fire-and-forget so a webhook outage can't fail the write.
 */

import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { encrypt, fieldHash } from "@/lib/encryption";
import { isHoneypotTripped } from "@/lib/honeypot";
import { notifyNewLead } from "@/lib/leads/notify";
import { sendMail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

const PHONE_RE = /^\+?[0-9 ()-]{7,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COLLECTION = "deal_check_leads";

function clientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

/** Only the summary fields — never the whole report — go in the lead doc. */
interface DealSummary {
  price?: number | null;
  community?: string | null;
  bedrooms?: number | null;
  areaSqft?: number | null;
  propertyKind?: string | null;
  purchaseType?: string | null;
  sourceUrl?: string | null;
  priceVerdict?: string | null;
  deltaPct?: number | null;
  netYieldPct?: number | null;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const client = await clientPromise;
  const col = client.db("binayah_web_new_dev").collection(COLLECTION);

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").toLowerCase().trim();
  const phone = String(body.phone ?? "").trim();
  const summary = (body.deal ?? {}) as DealSummary;
  const normalisedPhone = phone.replace(/[\s\-.()]/g, "");

  // Honeypot: persist flagged, skip notifications, return a normal success so
  // a bot learns nothing. A genuine lead caught by a false positive is still
  // recoverable from the collection.
  if (isHoneypotTripped(body)) {
    try {
      await col.insertOne({
        name: name ? encrypt(name) : null,
        email: email ? encrypt(email) : null,
        emailH: email ? fieldHash(email) : undefined,
        phone: phone ? encrypt(phone) : null,
        phoneH: normalisedPhone ? fieldHash(normalisedPhone) : undefined,
        deal: sanitizeSummary(summary),
        status: "new",
        spam: true,
        createdAt: new Date(),
      });
    } catch (e) {
      console.error("[deal-check] honeypot lead save failed:", e);
    }
    console.warn("[honeypot] deal-check tripped — saved flagged, notifications skipped.");
    return NextResponse.json({ ok: true });
  }

  if (!name) {
    return NextResponse.json({ error: "Please add your name." }, { status: 400 });
  }
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please add a valid email address." }, { status: 400 });
  }
  if (!phone || !PHONE_RE.test(phone)) {
    return NextResponse.json({ error: "Please add a valid phone number." }, { status: 400 });
  }

  const ip = clientIp(req);
  const allowed = await checkRateLimit("deal-check-lead", ip, 5, 60 * 60 * 1000).catch(() => true);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  const deal = sanitizeSummary(summary);

  try {
    await col.insertOne({
      name: encrypt(name),
      email: encrypt(email),
      emailH: fieldHash(email),
      phone: encrypt(phone),
      phoneH: normalisedPhone ? fieldHash(normalisedPhone) : undefined,
      deal,
      status: "new",
      source: "deal-check",
      ip,
      pageUrl: typeof body.pageUrl === "string" ? body.pageUrl.slice(0, 500) : undefined,
      createdAt: new Date(),
    });
  } catch (e) {
    console.error("[deal-check] lead save failed:", e);
    return NextResponse.json({ error: "Could not save your request." }, { status: 500 });
  }

  // Fire-and-forget: the lead is already safe in Mongo.
  try {
    notifyNewLead({
      source: "inquiry",
      channel: "deal-check",
      name,
      email,
      phone,
      community: deal.community ?? undefined,
      message: describeDeal(deal),
    });
  } catch (e) {
    console.error("[deal-check] notify failed:", e);
  }

  sendMail({
    to: process.env.INQUIRY_EMAIL || "info@binayah.com",
    subject: `Deal Check review request — ${deal.community ?? "Dubai"}`,
    html: `
      <h2>Deal Check review request</h2>
      <p><strong>${escapeHtml(name)}</strong> asked for a second opinion on a property.</p>
      <ul>
        <li>Email: ${escapeHtml(email)}</li>
        <li>Phone: ${escapeHtml(phone)}</li>
      </ul>
      <h3>The deal</h3>
      <ul>
        ${deal.price ? `<li>Asking price: AED ${deal.price.toLocaleString()}</li>` : ""}
        ${deal.community ? `<li>Community: ${escapeHtml(deal.community)}</li>` : ""}
        ${deal.bedrooms != null ? `<li>Bedrooms: ${deal.bedrooms}</li>` : ""}
        ${deal.areaSqft ? `<li>Size: ${deal.areaSqft.toLocaleString()} sqft</li>` : ""}
        ${deal.purchaseType ? `<li>Type: ${escapeHtml(deal.purchaseType)}</li>` : ""}
        ${deal.priceVerdict ? `<li>Our read on the price: ${escapeHtml(deal.priceVerdict)}</li>` : ""}
        ${deal.netYieldPct != null ? `<li>Modelled net yield: ${deal.netYieldPct}%</li>` : ""}
        ${deal.sourceUrl ? `<li>Source: ${escapeHtml(deal.sourceUrl)}</li>` : ""}
      </ul>
    `,
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}

/** Whitelist + bound the summary so a crafted payload can't bloat the doc. */
function sanitizeSummary(s: DealSummary): DealSummary {
  const num = (v: unknown, max: number): number | null => {
    const n = Number(v);
    return Number.isFinite(n) && Math.abs(n) <= max ? n : null;
  };
  const str = (v: unknown, max = 120): string | null =>
    typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;

  return {
    price: num(s.price, 2e9),
    community: str(s.community),
    bedrooms: num(s.bedrooms, 50),
    areaSqft: num(s.areaSqft, 1e6),
    propertyKind: str(s.propertyKind, 40),
    purchaseType: str(s.purchaseType, 20),
    sourceUrl: str(s.sourceUrl, 500),
    priceVerdict: str(s.priceVerdict, 40),
    deltaPct: num(s.deltaPct, 100),
    netYieldPct: num(s.netYieldPct, 100),
  };
}

function describeDeal(d: DealSummary): string {
  const bits = [
    d.bedrooms != null ? `${d.bedrooms === 0 ? "Studio" : `${d.bedrooms}-bed`}` : null,
    d.propertyKind,
    d.community ? `in ${d.community}` : null,
    d.price ? `at AED ${d.price.toLocaleString()}` : null,
    d.priceVerdict ? `(our read: ${d.priceVerdict} comparable sales)` : null,
  ].filter(Boolean);
  return `Deal Check: ${bits.join(" ")}`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
