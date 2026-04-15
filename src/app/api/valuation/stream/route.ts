import { NextRequest } from "next/server";
import { proxyValuationStream } from "@/lib/valuation-api";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  return proxyValuationStream(request);
}
