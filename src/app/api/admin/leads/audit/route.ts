import { NextRequest, NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { queryLeadsAudit } from "@/lib/leads/audit";

export const dynamic = "force-dynamic";

// Optional friendly names for keyIds, so the dashboard shows "CRM" instead of
// "k_2688a0c3". Format: LEADS_KEY_LABELS="k_2688a0c3=CRM,k_93ab8de2=CRM (new)".
function keyLabels(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const pair of (process.env.LEADS_KEY_LABELS || "").split(",")) {
    const idx = pair.indexOf("=");
    if (idx <= 0) continue;
    const k = pair.slice(0, idx).trim();
    const v = pair.slice(idx + 1).trim();
    if (k && v) out[k] = v;
  }
  return out;
}

// GET /api/admin/leads/audit?days=30&keyId=k_xxxx
// Admin-session only — this exposes key identifiers and source IPs, so an
// external (even read-only) API key must NOT be able to read it.
export async function GET(req: NextRequest) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sp = req.nextUrl.searchParams;
  const windowDays = parseInt(sp.get("days") || "30", 10) || 30;
  const keyId = sp.get("keyId") || undefined;
  try {
    const result = await queryLeadsAudit({ windowDays, keyId, recentLimit: 150 });
    return NextResponse.json(
      { ...result, labels: keyLabels() },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[admin/leads/audit]", err);
    return NextResponse.json({ error: "Failed to load audit log" }, { status: 500 });
  }
}
