import { NextRequest } from "next/server";
import { proxyValuationJson } from "@/lib/valuation-api";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return proxyValuationJson(request, "report");
}
