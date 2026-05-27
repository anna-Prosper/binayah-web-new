import { NextRequest, NextResponse } from "next/server";
import { isLeadsApiAuthorized } from "@/lib/leads/api-auth";
import { computeLeadStats } from "@/lib/leads/stats";

export const dynamic = "force-dynamic";

function parseDate(value: string | null, endOfDay = false): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  if (isNaN(d.getTime())) return undefined;
  if (endOfDay && /^\d{4}-\d{2}-\d{2}$/.test(value)) d.setUTCHours(23, 59, 59, 999);
  return d;
}

// GET /api/admin/leads/stats?from=2026-01-01&to=2026-05-25
// Federated lead analytics: source/status breakdown, 30-day histogram,
// pipeline funnel + conversion rates, top communities, top properties,
// avg time-to-first-contact. Auth: NextAuth admin-allowlist.
export async function GET(req: NextRequest) {
  const auth = await isLeadsApiAuthorized(req);
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const sp = req.nextUrl.searchParams;
    const from = parseDate(sp.get("from"));
    const to = parseDate(sp.get("to"), true);
    const stats = await computeLeadStats({ from, to });
    return NextResponse.json(stats, {
      headers: {
        "Cache-Control": from || to ? "no-store" : "private, max-age=60",
      },
    });
  } catch (err) {
    console.error("[admin/leads/stats]", err);
    return NextResponse.json({ error: "Failed to compute stats" }, { status: 500 });
  }
}
