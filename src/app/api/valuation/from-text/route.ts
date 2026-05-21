import { NextRequest } from "next/server";
import { proxyValuationJson } from "@/lib/valuation-api";

// Proxy for the upstream `/api/valuation/from-text` endpoint exposed by the
// shared valuation backend (server.js → processValuationFromText). The
// SharedValuationPage frontend posts the user's free-text query here and
// expects one of: { decision: "ready" | "guidance" | "needs_more_details"
// | "extraction_failed" }. Without this proxy the smart-search input on the
// /valuation page would fail with a 404 from the Next.js app.
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  return proxyValuationJson(request, "from-text");
}
