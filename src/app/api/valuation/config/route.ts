import { getValuationApiUrl } from "@/lib/valuation-api";

export const dynamic = "force-dynamic";

export async function GET() {
  const backendUrl = getValuationApiUrl("config");

  if (!backendUrl) {
    return new Response(
      JSON.stringify({ error: "Valuation API not configured." }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  const upstream = await fetch(backendUrl, {
    method: "GET",
    headers: { Accept: "application/json" },
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
