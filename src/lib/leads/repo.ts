// ── Per-lead repository ─────────────────────────────────────────────────────
// Reads + writes against the underlying source collection. Updates are
// idempotent: missing fields (status/notes/assignedTo) get backfilled with
// safe defaults on first write — no separate migration script needed.

import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import type {
  LeadNote,
  LeadPatchInput,
  LeadSource,
  LeadStatus,
  UnifiedLead,
} from "./types";
import { LEAD_STATUSES } from "./types";

const DB = "binayah_web_new_dev";

const SOURCE_COLLECTION: Record<LeadSource, string> = {
  inquiry: "inquiries",
  newsletter: "marketreportsubscriptions",
  "list-property": "property_submissions",
  "project-subscribe": "project_subscriptions",
};

export class LeadNotFoundError extends Error {
  constructor() {
    super("Lead not found");
    this.name = "LeadNotFoundError";
  }
}

export class LeadValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LeadValidationError";
  }
}

function isValidObjectId(id: string): boolean {
  return /^[a-f0-9]{24}$/i.test(id);
}

function buildSystemNote(author: string, text: string): LeadNote {
  return { author, text, at: new Date(), system: true };
}

function normalizeNotesFromDoc(n: unknown): LeadNote[] {
  if (!Array.isArray(n)) return [];
  return n
    .filter((x): x is Record<string, unknown> => !!x && typeof x === "object")
    .map((note) => ({
      author: String(note.author ?? "unknown"),
      text: String(note.text ?? ""),
      at: note.at instanceof Date ? note.at : new Date(String(note.at ?? Date.now())),
      system: Boolean(note.system),
    }));
}

function asDate(v: unknown): Date | undefined {
  if (!v) return undefined;
  if (v instanceof Date) return v;
  const d = new Date(v as string);
  return isNaN(d.getTime()) ? undefined : d;
}

function rawToUnified(source: LeadSource, doc: Record<string, unknown>): UnifiedLead {
  // Mirrors the mapper logic in federation.ts, but returns the full raw doc too.
  const status = (typeof doc.status === "string" &&
    LEAD_STATUSES.includes(doc.status as LeadStatus)
    ? (doc.status as LeadStatus)
    : "new") as LeadStatus;
  const notes = normalizeNotesFromDoc(doc.notes);
  const assignedTo = typeof doc.assignedTo === "string" ? doc.assignedTo : undefined;

  const common = {
    id: `${source}:${String(doc._id)}`,
    source,
    status,
    assignedTo,
    notes,
    createdAt: asDate(doc.createdAt) ?? new Date(),
    updatedAt: asDate(doc.updatedAt),
    raw: doc,
  };

  switch (source) {
    case "inquiry":
      return {
        ...common,
        channel: String(doc.source ?? doc.inquiryType ?? "contact-form"),
        name: String(doc.name ?? ""),
        email: doc.email as string | undefined,
        phone: doc.phone as string | undefined,
        message: doc.message as string | undefined,
        property: doc.propertySlug
          ? { slug: doc.propertySlug as string, title: doc.propertyTitle as string }
          : undefined,
      };
    case "newsletter": {
      const areas = Array.isArray(doc.areas) ? (doc.areas as string[]) : [];
      const intents = Array.isArray(doc.intents) ? (doc.intents as string[]) : undefined;
      return {
        ...common,
        channel: String(doc.source ?? "newsletter"),
        name: String(doc.name ?? ""),
        email: doc.email as string | undefined,
        phone: doc.phone as string | undefined,
        intent: intents,
        budget:
          doc.budgetMin != null || doc.budgetMax != null
            ? { min: doc.budgetMin as number, max: doc.budgetMax as number }
            : undefined,
        community: areas[0],
      };
    }
    case "list-property":
      return {
        ...common,
        channel: "list-your-property",
        name: String(doc.userName ?? doc.ownerName ?? doc.name ?? ""),
        email: (doc.userEmail ?? doc.ownerEmail ?? doc.email) as string | undefined,
        phone: (doc.phone ?? doc.ownerPhone) as string | undefined,
        message: doc.description as string | undefined,
        community: (doc.community ?? doc.location) as string | undefined,
      };
    case "project-subscribe":
      return {
        ...common,
        channel: "project-watch",
        name: String(doc.userName ?? doc.name ?? ""),
        email: doc.email as string | undefined,
        phone: doc.phone as string | undefined,
        project: doc.slug
          ? { slug: doc.slug as string, name: doc.projectName as string }
          : undefined,
      };
  }
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function getLead(source: LeadSource, id: string): Promise<UnifiedLead> {
  if (!isValidObjectId(id)) throw new LeadValidationError("Invalid lead id");
  if (!SOURCE_COLLECTION[source]) throw new LeadValidationError("Invalid source");

  const client = await clientPromise;
  const col = client.db(DB).collection(SOURCE_COLLECTION[source]);
  const doc = await col.findOne({ _id: new ObjectId(id), deletedAt: { $exists: false } });
  if (!doc) throw new LeadNotFoundError();
  return rawToUnified(source, doc);
}

export async function patchLead(
  source: LeadSource,
  id: string,
  patch: LeadPatchInput,
  author: string
): Promise<UnifiedLead> {
  if (!isValidObjectId(id)) throw new LeadValidationError("Invalid lead id");
  if (!SOURCE_COLLECTION[source]) throw new LeadValidationError("Invalid source");

  if (patch.status && !LEAD_STATUSES.includes(patch.status)) {
    throw new LeadValidationError("Invalid status");
  }
  if (patch.note && (typeof patch.note.text !== "string" || patch.note.text.trim().length === 0)) {
    throw new LeadValidationError("Note text required");
  }

  const client = await clientPromise;
  const col = client.db(DB).collection(SOURCE_COLLECTION[source]);

  const existing = await col.findOne({ _id: new ObjectId(id), deletedAt: { $exists: false } });
  if (!existing) throw new LeadNotFoundError();

  // Build $set + audit-trail notes in one round-trip.
  const set: Record<string, unknown> = { updatedAt: new Date() };
  const newSystemNotes: LeadNote[] = [];

  if (patch.status && patch.status !== existing.status) {
    set.status = patch.status;
    newSystemNotes.push(
      buildSystemNote(author, `Status: ${existing.status ?? "new"} → ${patch.status}`)
    );
  }
  if (Object.prototype.hasOwnProperty.call(patch, "assignedTo")) {
    const next = patch.assignedTo ?? null;
    const prev = existing.assignedTo ?? null;
    if (next !== prev) {
      set.assignedTo = next ?? "";
      newSystemNotes.push(
        buildSystemNote(
          author,
          next ? `Assigned to ${next}${prev ? ` (was ${prev})` : ""}` : `Unassigned${prev ? ` (was ${prev})` : ""}`
        )
      );
    }
  }

  const userNote: LeadNote | null =
    patch.note && patch.note.text.trim()
      ? { author, text: patch.note.text.trim(), at: new Date(), system: false }
      : null;

  const updateOps: Record<string, unknown> = { $set: set };
  const notesToPush = [...newSystemNotes, ...(userNote ? [userNote] : [])];
  if (notesToPush.length > 0) {
    updateOps.$push = { notes: { $each: notesToPush } };
  }

  // No-op fast path: nothing actually changed.
  if (Object.keys(set).length === 1 && notesToPush.length === 0) {
    return rawToUnified(source, existing);
  }

  // First-time write needs status/notes/assignedTo defaults to coexist with $push.
  // $push implicitly creates the notes array if missing, so just ensure status default.
  if (set.status === undefined && existing.status === undefined) {
    set.status = "new";
  }

  await col.updateOne({ _id: new ObjectId(id) }, updateOps);
  const updated = await col.findOne({ _id: new ObjectId(id) });
  return rawToUnified(source, updated!);
}

export async function softDeleteLead(
  source: LeadSource,
  id: string,
  author: string
): Promise<{ deleted: true }> {
  if (!isValidObjectId(id)) throw new LeadValidationError("Invalid lead id");
  if (!SOURCE_COLLECTION[source]) throw new LeadValidationError("Invalid source");

  const client = await clientPromise;
  const col = client.db(DB).collection(SOURCE_COLLECTION[source]);

  const result = await col.updateOne(
    { _id: new ObjectId(id), deletedAt: { $exists: false } },
    {
      $set: { deletedAt: new Date(), updatedAt: new Date() },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      $push: { notes: buildSystemNote(author, "Soft-deleted from leads admin") } as any,
    }
  );

  if (result.matchedCount === 0) throw new LeadNotFoundError();
  return { deleted: true };
}

// Validate + split a composite id of the form "<source>:<mongoId>".
export function parseCompositeId(composite: string): { source: LeadSource; id: string } {
  const [sourcePart, ...rest] = composite.split(":");
  const id = rest.join(":");
  if (!sourcePart || !id) throw new LeadValidationError("Invalid lead id format");
  if (!SOURCE_COLLECTION[sourcePart as LeadSource]) throw new LeadValidationError("Invalid source");
  return { source: sourcePart as LeadSource, id };
}
