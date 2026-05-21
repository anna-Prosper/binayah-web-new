import { NextRequest, NextResponse } from "next/server";
import { isLeadsApiAuthorized } from "@/lib/leads/api-auth";
import { computeLeadStats } from "@/lib/leads/stats";

export const dynamic = "force-dynamic";

// GET /api/admin/leads/stats
// Federated lead analytics: source/status breakdown, 30-day histogram,
// pipeline funnel + conversion rates, top communities, top properties,
// avg time-to-first-contact. Auth: NextAuth admin-allowlist.
export async function GET(req: NextRequest) {
  const auth = await isLeadsApiAuthorized(req);
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const stats = await computeLeadStats();
    return NextResponse.json(stats, {
      headers: {
        // Short cache to absorb dashboard polling without thrashing Mongo.
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch (err) {
    console.error("[admin/leads/stats]", err);
    return NextResponse.json({ error: "Failed to compute stats" }, { status: 500 });
  }
}
