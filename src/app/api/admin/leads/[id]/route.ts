import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isLeadsApiAuthorized } from "@/lib/leads/api-auth";
import {
  LeadNotFoundError,
  LeadValidationError,
  getLead,
  patchLead,
  softDeleteLead,
} from "@/lib/leads/repo";
import { LEAD_STATUSES } from "@/lib/leads/types";
import type { LeadPatchInput, LeadSource, LeadStatus } from "@/lib/leads/types";

export const dynamic = "force-dynamic";

const VALID_SOURCES: LeadSource[] = [
  "inquiry",
  "newsletter",
  "list-property",
  "project-subscribe",
];

function parseSource(value: string | null): LeadSource | null {
  if (!value || !VALID_SOURCES.includes(value as LeadSource)) return null;
  return value as LeadSource;
}

function handleError(err: unknown): NextResponse {
  if (err instanceof LeadNotFoundError) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }
  if (err instanceof LeadValidationError) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
  console.error("[admin/leads/:id]", err);
  return NextResponse.json({ error: "Internal error" }, { status: 500 });
}

// GET /api/admin/leads/:id?source=inquiry
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = await isLeadsApiAuthorized(req);
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const source = parseSource(req.nextUrl.searchParams.get("source"));
  if (!source) return NextResponse.json({ error: "Invalid source" }, { status: 400 });
  try {
    const lead = await getLead(source, id);
    return NextResponse.json(lead, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return handleError(err);
  }
}

// PATCH /api/admin/leads/:id?source=inquiry
// body: { status?, assignedTo?, note? }
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = await isLeadsApiAuthorized(req);
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const session = await getServerSession(authOptions);
  const author =
    session?.user?.email ||
    (auth.via === "api-key" ? "api-key" : "unknown@binayah");

  const { id } = await ctx.params;
  const source = parseSource(req.nextUrl.searchParams.get("source"));
  if (!source) return NextResponse.json({ error: "Invalid source" }, { status: 400 });

  let body: LeadPatchInput;
  try {
    body = (await req.json()) as LeadPatchInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Per-field whitelist; ignore unknown keys.
  const patch: LeadPatchInput = {};
  if (typeof body.status === "string") {
    if (!LEAD_STATUSES.includes(body.status as LeadStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    patch.status = body.status as LeadStatus;
  }
  if (Object.prototype.hasOwnProperty.call(body, "assignedTo")) {
    const v = body.assignedTo;
    if (v !== null && (typeof v !== "string" || v.trim() === "")) {
      return NextResponse.json({ error: "Invalid assignedTo" }, { status: 400 });
    }
    patch.assignedTo = v === null ? null : (v as string).trim();
  }
  if (body.note && typeof body.note.text === "string" && body.note.text.trim().length > 0) {
    patch.note = { text: body.note.text.trim().slice(0, 2000) };
  }

  if (!patch.status && !("assignedTo" in patch) && !patch.note) {
    return NextResponse.json({ error: "No changes provided" }, { status: 400 });
  }

  try {
    const lead = await patchLead(source, id, patch, author);
    return NextResponse.json(lead, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return handleError(err);
  }
}

// DELETE /api/admin/leads/:id?source=inquiry  — soft delete
export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = await isLeadsApiAuthorized(req);
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const session = await getServerSession(authOptions);
  const author =
    session?.user?.email ||
    (auth.via === "api-key" ? "api-key" : "unknown@binayah");

  const { id } = await ctx.params;
  const source = parseSource(req.nextUrl.searchParams.get("source"));
  if (!source) return NextResponse.json({ error: "Invalid source" }, { status: 400 });

  try {
    const result = await softDeleteLead(source, id, author);
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return handleError(err);
  }
}
