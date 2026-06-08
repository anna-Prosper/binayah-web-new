import { NextRequest, NextResponse } from "next/server";

// Vercel Cron hits this every 5 minutes to keep binayah-api (Render) warm.
// Render free tier spins down after 15 min of inactivity; a cold start takes
// ~15 s and causes slow page loads and sitemap timeouts.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const apiBase = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "";
  if (!apiBase) return NextResponse.json({ skipped: "no API_BASE_URL" });

  const start = Date.now();
  try {
    const res = await fetch(`${apiBase}/health`, {
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    return NextResponse.json({ ok: res.ok, status: res.status, ms: Date.now() - start });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err), ms: Date.now() - start }, { status: 502 });
  }
}
