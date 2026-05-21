import { NextRequest, NextResponse } from "next/server";
import { isLeadsApiAuthorized } from "@/lib/leads/api-auth";
import { leadToCsvRow, listLeads } from "@/lib/leads/federation";
import type { LeadSource, LeadStatus, LeadsListFilters } from "@/lib/leads/types";

export const dynamic = "force-dynamic";

const VALID_SOURCES: LeadSource[] = [
  "inquiry",
  "newsletter",
  "list-property",
  "project-subscribe",
];
const VALID_STATUSES: LeadStatus[] = ["new", "contacted", "qualified", "meeting", "won", "lost"];

function parseCsv<T extends string>(value: string | null, valid: readonly T[]): T[] | undefined {
  if (!value) return undefined;
  const parts = value
    .split(",")
    .map((p) => p.trim())
    .filter((p): p is T => valid.includes(p as T));
  return parts.length ? parts : undefined;
}

function parseDate(value: string | null): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return isNaN(d.getTime()) ? undefined : d;
}

// RFC 4180 quoting — wrap in quotes, escape internal quotes by doubling them.
function csvCell(v: unknown): string {
  const s = v == null ? "" : String(v);
  if (s.includes(",") || s.includes("\"") || s.includes("\n") || s.includes("\r")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

// GET /api/admin/leads/export — same filters as the list endpoint, returns CSV.
// Hard-capped at 10K rows to keep memory bounded; for larger exports use
// repeated calls with date-range slicing.
export async function GET(req: NextRequest) {
  const auth = await isLeadsApiAuthorized(req);
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sp = req.nextUrl.searchParams;
  const filters: LeadsListFilters = {
    source: parseCsv(sp.get("source"), VALID_SOURCES),
    status: parseCsv(sp.get("status"), VALID_STATUSES),
    q: sp.get("q") || undefined,
    community: sp.get("community") || undefined,
    assignedTo: sp.get("assignedTo") || undefined,
    from: parseDate(sp.get("from")),
    to: parseDate(sp.get("to")),
    page: 1,
    limit: 10000,
    sort: "createdAt:desc",
  };

  const { leads } = await listLeads(filters);
  const rows = leads.map(leadToCsvRow);
  if (rows.length === 0) {
    return new NextResponse("No leads\n", { headers: { "content-type": "text/csv" } });
  }

  const columns = Object.keys(rows[0]);
  const header = columns.map(csvCell).join(",");
  const body = rows.map((row) => columns.map((c) => csvCell(row[c])).join(",")).join("\n");
  const csv = `${header}\n${body}\n`;

  const dateStamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="binayah-leads-${dateStamp}.csv"`,
      "cache-control": "no-store",
    },
  });
}
