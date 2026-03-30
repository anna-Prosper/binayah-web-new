import { NextRequest } from "next/server";

import { getValuationApiUrl } from "@/lib/valuation-api";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const backendUrl = getValuationApiUrl("document");

  if (!backendUrl) {
    return new Response(
      JSON.stringify({ error: "Valuation API not configured." }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  const body = await req.text();

  const upstream = await fetch(backendUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    cache: "no-store",
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") ?? "application/json",
      "Cache-Control": "no-store",
    },
  });
}
