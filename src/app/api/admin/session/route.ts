import { NextRequest, NextResponse } from "next/server";
import crypto, { timingSafeEqual } from "crypto";

function safeCompare(candidate: string, secret: string): boolean {
  const key = "binayah-admin-compare";
  const a = crypto.createHmac("sha256", key).update(candidate).digest();
  const b = crypto.createHmac("sha256", key).update(secret).digest();
  return timingSafeEqual(a, b);
}

export async function GET(req: NextRequest) {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  const url = new URL(req.url);
  const candidate = (url.searchParams.get("secret") || "").trim();
  const next = url.searchParams.get("next") || "/en/admin";
  // Only allow same-origin relative paths for `next`
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/en/admin";

  if (candidate.length === 0 || !safeCompare(candidate, adminSecret)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const res = NextResponse.redirect(new URL(safeNext, req.url));
  res.cookies.set("admin_secret", adminSecret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });
  return res;
}
