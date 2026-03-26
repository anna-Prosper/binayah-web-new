import { NextRequest } from "next/server";

const BACKEND_URL =
  process.env.VALUATION_API_URL ?? // server-side only (no NEXT_PUBLIC_)
  process.env.NEXT_PUBLIC_VALUATION_API_URL ??
  "";

export async function POST(req: NextRequest) {
  if (!BACKEND_URL) {
    return new Response(
      JSON.stringify({ error: "Valuation API not configured." }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  const body = await req.text();

  const upstream = await fetch(BACKEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  // Stream the NDJSON response straight through
  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-store",
    },
  });
}