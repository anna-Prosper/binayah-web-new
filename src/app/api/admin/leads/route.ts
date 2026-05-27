import { NextRequest, NextResponse } from "next/server";
import { isLeadsApiAuthorized } from "@/lib/leads/api-auth";
import { listLeads } from "@/lib/leads/federation";
import type { LeadSource, LeadStatus, LeadsListFilters } from "@/lib/leads/types";

export const dynamic = "force-dynamic";

const VALID_SOURCES: LeadSource[] = [
  "inquiry",
  "newsletter",
  "list-property",
  "project-subscribe",
];

const VALID_STATUSES: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "meeting",
  "won",
  "lost",
];

function parseCsv<T extends string>(value: string | null, valid: readonly T[]): T[] | undefined {
  if (!value) return undefined;
  const parts = value
    .split(",")
    .map((p) => p.trim())
    .filter((p): p is T => valid.includes(p as T));
  return parts.length ? parts : undefined;
}

function parseDate(value: string | null, endOfDay = false): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  if (isNaN(d.getTime())) return undefined;
  if (endOfDay && /^\d{4}-\d{2}-\d{2}$/.test(value)) d.setUTCHours(23, 59, 59, 999);
  return d;
}

// GET /api/admin/leads
//   ?source=inquiry,newsletter
//   &status=new,contacted
//   &q=ahmed@                  // fuzzy search name/email/phone
//   &community=Dubai+Marina
//   &assignedTo=anna@binayah.com
//   &from=2026-05-01&to=2026-05-21
//   &sort=createdAt:desc       // or createdAt:asc | updatedAt:desc
//   &page=1&limit=50
export async function GET(req: NextRequest) {
  const auth = await isLeadsApiAuthorized(req);
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sp = req.nextUrl.searchParams;
  const sortRaw = sp.get("sort");
  const sort = (sortRaw === "createdAt:asc" || sortRaw === "updatedAt:desc"
    ? sortRaw
    : "createdAt:desc") as LeadsListFilters["sort"];

  const filters: LeadsListFilters = {
    source: parseCsv(sp.get("source"), VALID_SOURCES),
    status: parseCsv(sp.get("status"), VALID_STATUSES),
    q: sp.get("q") || undefined,
    community: sp.get("community") || undefined,
    assignedTo: sp.get("assignedTo") || undefined,
    from: parseDate(sp.get("from")),
    to: parseDate(sp.get("to"), true),
    page: Math.max(1, parseInt(sp.get("page") || "1") || 1),
    limit: Math.max(1, Math.min(200, parseInt(sp.get("limit") || "50") || 50)),
    sort,
  };

  const result = await listLeads(filters);
  return NextResponse.json(result, {
    headers: { "Cache-Control": "no-store" },
  });
}
