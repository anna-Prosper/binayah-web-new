import { NextRequest } from "next/server";
import { proxyValuationJson } from "@/lib/valuation-api";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  return proxyValuationJson(request, "document");
}
