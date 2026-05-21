import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isLeadsApiAuthorized } from "@/lib/leads/api-auth";
import {
  LeadNotFoundError,
  LeadValidationError,
  parseCompositeId,
  patchLead,
  softDeleteLead,
} from "@/lib/leads/repo";
import { LEAD_STATUSES } from "@/lib/leads/types";
import type { LeadPatchInput, LeadStatus } from "@/lib/leads/types";

export const dynamic = "force-dynamic";

// POST /api/admin/leads/bulk
// body:
//   {
//     ids: ["inquiry:507f...", "newsletter:abc...", ...],   // composite ids from list response
//     action: "patch" | "delete",
//     // patch-only:
//     status?: LeadStatus,
//     assignedTo?: string | null,
//     note?: { text: string },
//   }
// Returns:
//   { processed: N, succeeded: N, failed: [{ id, error }] }
//
// Hard-capped at 500 ids per request — beyond that, fan-out should be done
// client-side in chunks.
const MAX_BULK = 500;

interface BulkBody {
  ids: string[];
  action: "patch" | "delete";
  status?: LeadStatus;
  assignedTo?: string | null;
  note?: { text: string };
}

export async function POST(req: NextRequest) {
  const auth = await isLeadsApiAuthorized(req);
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const session = await getServerSession(authOptions);
  const author =
    session?.user?.email ||
    (auth.via === "api-key" ? "api-key" : "unknown@binayah");

  let body: BulkBody;
  try {
    body = (await req.json()) as BulkBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!Array.isArray(body.ids) || body.ids.length === 0) {
    return NextResponse.json({ error: "ids[] required" }, { status: 400 });
  }
  if (body.ids.length > MAX_BULK) {
    return NextResponse.json({ error: `Too many ids (max ${MAX_BULK})` }, { status: 400 });
  }
  if (body.action !== "patch" && body.action !== "delete") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  let patch: LeadPatchInput = {};
  if (body.action === "patch") {
    if (body.status) {
      if (!LEAD_STATUSES.includes(body.status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      patch.status = body.status;
    }
    if (Object.prototype.hasOwnProperty.call(body, "assignedTo")) {
      const v = body.assignedTo;
      if (v !== null && (typeof v !== "string" || v.trim() === "")) {
        return NextResponse.json({ error: "Invalid assignedTo" }, { status: 400 });
      }
      patch.assignedTo = v === null ? null : (v as string).trim();
    }
    if (body.note && typeof body.note.text === "string" && body.note.text.trim()) {
      patch.note = { text: body.note.text.trim().slice(0, 2000) };
    }
    if (!patch.status && !("assignedTo" in patch) && !patch.note) {
      return NextResponse.json({ error: "No patch fields provided" }, { status: 400 });
    }
  }

  const results = await Promise.allSettled(
    body.ids.map(async (compositeId) => {
      const { source, id } = parseCompositeId(compositeId);
      if (body.action === "delete") {
        await softDeleteLead(source, id, author);
      } else {
        await patchLead(source, id, patch, author);
      }
      return compositeId;
    })
  );

  const failed: { id: string; error: string }[] = [];
  let succeeded = 0;
  results.forEach((r, i) => {
    if (r.status === "fulfilled") {
      succeeded++;
    } else {
      const err = r.reason;
      const msg =
        err instanceof LeadNotFoundError
          ? "Lead not found"
          : err instanceof LeadValidationError
          ? err.message
          : "Internal error";
      failed.push({ id: body.ids[i], error: msg });
    }
  });

  return NextResponse.json(
    { processed: body.ids.length, succeeded, failed },
    { headers: { "Cache-Control": "no-store" } }
  );
}
