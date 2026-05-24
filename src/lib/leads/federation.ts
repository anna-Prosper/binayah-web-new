// ── Lead federation ─────────────────────────────────────────────────────────
// Queries all 5 lead-bearing collections in parallel and normalizes them
// into the unified UnifiedLead shape. Filters/sort are pushed to the DB
// layer where possible; cross-source pagination is applied in memory after
// federation. Acceptable up to ~50K total leads; cursor-based federation
// will be needed beyond that.

import type { Collection, Document } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { decrypt, fieldHash } from "@/lib/encryption";
import type {
  LeadSource,
  LeadStatus,
  LeadsListFilters,
  LeadsListResponse,
  UnifiedLead,
  LeadNote,
} from "./types";
import { LEAD_STATUSES } from "./types";

const DB = "binayah_web_new_dev";

const ALL_SOURCES: LeadSource[] = [
  "inquiry",
  "newsletter",
  "list-property",
  "project-subscribe",
];

function asDate(v: unknown): Date | undefined {
  if (!v) return undefined;
  if (v instanceof Date) return v;
  const d = new Date(v as string);
  return isNaN(d.getTime()) ? undefined : d;
}

function normalizeStatus(s: unknown): LeadStatus {
  if (typeof s !== "string") return "new";
  const lower = s.toLowerCase() as LeadStatus;
  return LEAD_STATUSES.includes(lower) ? lower : "new";
}

function normalizeNotes(n: unknown): LeadNote[] {
  if (!Array.isArray(n)) return [];
  return n
    .filter((x): x is LeadNote => !!x && typeof x === "object" && "text" in x)
    .map((note) => ({
      author: String((note as LeadNote).author || "unknown"),
      text: String((note as LeadNote).text || ""),
      at: (note as LeadNote).at || new Date(),
      system: Boolean((note as LeadNote).system),
    }));
}

// ── Source mappers ───────────────────────────────────────────────────────────

function mapInquiry(doc: Document): UnifiedLead {
  const channel = String(doc.source || doc.inquiryType || "contact-form");
  return {
    id: `inquiry:${doc._id}`,
    source: "inquiry",
    channel,
    name: decrypt(doc.name as string) || "",
    email: doc.email ? decrypt(doc.email as string) : undefined,
    phone: doc.phone ? decrypt(doc.phone as string) : undefined,
    message: doc.message ? decrypt(doc.message as string) : undefined,
    property: doc.propertySlug
      ? { slug: doc.propertySlug, title: doc.propertyTitle }
      : undefined,
    status: normalizeStatus(doc.status),
    assignedTo: doc.assignedTo || undefined,
    notes: normalizeNotes(doc.notes),
    createdAt: asDate(doc.createdAt) ?? new Date(),
    updatedAt: asDate(doc.updatedAt),
  };
}

function mapNewsletter(doc: Document): UnifiedLead {
  return {
    id: `newsletter:${doc._id}`,
    source: "newsletter",
    channel: String(doc.source || "newsletter"),
    name: decrypt(doc.name as string) || "",
    email: doc.email ? decrypt(doc.email as string) : undefined,
    phone: doc.phone ? decrypt(doc.phone as string) : undefined,
    intent: Array.isArray(doc.intents) ? doc.intents : undefined,
    budget:
      doc.budgetMin != null || doc.budgetMax != null
        ? { min: doc.budgetMin, max: doc.budgetMax }
        : undefined,
    community: Array.isArray(doc.areas) && doc.areas.length > 0 ? doc.areas[0] : undefined,
    status: normalizeStatus(doc.status),
    assignedTo: doc.assignedTo || undefined,
    notes: normalizeNotes(doc.notes),
    createdAt: asDate(doc.createdAt) ?? new Date(),
    updatedAt: asDate(doc.updatedAt),
  };
}

function mapListProperty(doc: Document): UnifiedLead {
  const name = decrypt(doc.userName as string) || decrypt(doc.ownerName as string) || decrypt(doc.name as string) || "";
  const email = decrypt((doc.userEmail || doc.ownerEmail || doc.email) as string) || undefined;
  const phone = decrypt((doc.phone || doc.ownerPhone) as string) || undefined;
  const community = doc.community || doc.location || undefined;
  const message = [
    doc.listingType ? `For: ${doc.listingType}` : null,
    doc.propertyType ? `Type: ${doc.propertyType}` : null,
    doc.bedrooms != null ? `Beds: ${doc.bedrooms}` : null,
    doc.areaSqft ? `Area: ${doc.areaSqft} sqft` : null,
    doc.askingPrice ? `Asking: AED ${Number(doc.askingPrice).toLocaleString()}` : null,
    doc.description ? `Notes: ${decrypt(doc.description as string)}` : null,
  ]
    .filter(Boolean)
    .join(" | ");
  return {
    id: `list-property:${doc._id}`,
    source: "list-property",
    channel: "list-your-property",
    name: String(name),
    email,
    phone,
    message: message || undefined,
    community: community || undefined,
    status: normalizeStatus(doc.status),
    assignedTo: doc.assignedTo || undefined,
    notes: normalizeNotes(doc.notes_log || doc.adminNotes),
    createdAt: asDate(doc.createdAt) ?? new Date(),
    updatedAt: asDate(doc.updatedAt),
  };
}

function mapProjectSubscribe(doc: Document): UnifiedLead {
  return {
    id: `project-subscribe:${doc._id}`,
    source: "project-subscribe",
    channel: "project-watch",
    name: decrypt(doc.name as string) || decrypt(doc.userName as string) || "",
    email: doc.email ? decrypt(doc.email as string) : undefined,
    phone: doc.phone ? decrypt(doc.phone as string) : undefined,
    project: doc.slug ? { slug: doc.slug, name: doc.projectName } : undefined,
    status: normalizeStatus(doc.status),
    assignedTo: doc.assignedTo || undefined,
    notes: normalizeNotes(doc.notes),
    createdAt: asDate(doc.createdAt) ?? new Date(),
    updatedAt: asDate(doc.updatedAt),
  };
}

// Note: calculator leads route through /api/calculator/email which POSTs to
// /api/market-report/subscribe — so they land in the marketreportsubscriptions
// collection with intents=["calculator-lead"]. No separate collection needed.

// ── Per-source query builder ─────────────────────────────────────────────────

interface SourceMeta {
  collection: string;
  mapper: (doc: Document) => UnifiedLead;
  // Non-PII fields safe for regex search (PII fields are encrypted; use HMAC hashes instead)
  searchFields: string[];
  emailHashField?: string;
  phoneHashField?: string;
  communityFilter?: (community: string) => Document;
}

const SOURCE_META: Record<LeadSource, SourceMeta> = {
  inquiry: {
    collection: "inquiries",
    mapper: mapInquiry,
    searchFields: ["propertyTitle", "propertySlug"],
    emailHashField: "emailH",
    phoneHashField: "phoneH",
    communityFilter: (community) => ({
      $or: [
        { propertyTitle: { $regex: community, $options: "i" } },
        { propertySlug: { $regex: community.toLowerCase().replace(/\s+/g, "-"), $options: "i" } },
      ],
    }),
  },
  newsletter: {
    collection: "marketreportsubscriptions",
    mapper: mapNewsletter,
    searchFields: [],
    emailHashField: "emailH",
    phoneHashField: "phoneH",
    communityFilter: (community) => ({ areas: { $regex: community, $options: "i" } }),
  },
  "list-property": {
    collection: "property_submissions",
    mapper: mapListProperty,
    searchFields: ["community", "propertyType"],
    emailHashField: "emailH",
    phoneHashField: "phoneH",
    communityFilter: (community) => ({
      $or: [
        { community: { $regex: community, $options: "i" } },
        { location: { $regex: community, $options: "i" } },
      ],
    }),
  },
  "project-subscribe": {
    collection: "project_subscriptions",
    mapper: mapProjectSubscribe,
    searchFields: ["projectName", "slug"],
    emailHashField: "emailH",
  },
};

function buildSourceFilter(
  source: LeadSource,
  filters: LeadsListFilters
): Document {
  const meta = SOURCE_META[source];
  const conditions: Document[] = [{ deletedAt: { $exists: false } }];

  if (filters.status?.length) {
    conditions.push({ status: { $in: filters.status } });
  }
  if (filters.assignedTo) {
    conditions.push({ assignedTo: filters.assignedTo });
  }
  if (filters.from || filters.to) {
    const createdAt: Document = {};
    if (filters.from) createdAt.$gte = filters.from;
    if (filters.to) createdAt.$lte = filters.to;
    conditions.push({ createdAt });
  }
  if (filters.q) {
    const q = filters.q.trim();
    const isEmail = q.includes("@") && /^[^\s@]+@[^\s@]+/.test(q);
    const isPhone = /^\+?[\d\s\-.()]{7,}$/.test(q);
    if (isEmail && meta.emailHashField) {
      conditions.push({ [meta.emailHashField]: fieldHash(q) });
    } else if (isPhone && meta.phoneHashField) {
      conditions.push({ [meta.phoneHashField]: fieldHash(q.replace(/[\s\-.()]/g, "")) });
    } else if (meta.searchFields.length > 0) {
      conditions.push({ $or: meta.searchFields.map((f) => ({ [f]: { $regex: q, $options: "i" } })) });
    }
  }
  if (filters.community && meta.communityFilter) {
    conditions.push(meta.communityFilter(filters.community));
  }

  return conditions.length === 1 ? conditions[0] : { $and: conditions };
}

async function countSource(
  col: Collection,
  source: LeadSource,
  filters: LeadsListFilters
): Promise<number> {
  try {
    const filter = buildSourceFilter(source, filters);
    return await col.countDocuments(filter);
  } catch {
    return 0;
  }
}

async function fetchSource(
  col: Collection,
  source: LeadSource,
  filters: LeadsListFilters,
  hardLimit: number
): Promise<UnifiedLead[]> {
  try {
    const meta = SOURCE_META[source];
    const filter = buildSourceFilter(source, filters);
    const sortKey = filters.sort?.startsWith("updatedAt") ? "updatedAt" : "createdAt";
    const sortDir = filters.sort?.endsWith(":asc") ? 1 : -1;
    const docs = await col.find(filter).sort({ [sortKey]: sortDir }).limit(hardLimit).toArray();
    return docs.map(meta.mapper);
  } catch {
    return [];
  }
}

// ── Main federation entry point ──────────────────────────────────────────────

export async function listLeads(filters: LeadsListFilters): Promise<LeadsListResponse> {
  const client = await clientPromise;
  const db = client.db(DB);
  const sourcesRequested = filters.source?.length ? filters.source : ALL_SOURCES;

  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.max(1, Math.min(200, filters.limit ?? 50));
  // To support cross-source sorting we over-fetch from each source enough to
  // cover the full page. With 5 sources × 200 = max 1000 docs scanned per request,
  // which is fine for the typical Binayah scale.
  const perSourceCap = limit * page;

  const [counts, rawLists] = await Promise.all([
    Promise.all(
      sourcesRequested.map(async (s) => {
        const meta = SOURCE_META[s];
        return [s, await countSource(db.collection(meta.collection), s, filters)] as const;
      })
    ),
    Promise.all(
      sourcesRequested.map(async (s) => {
        const meta = SOURCE_META[s];
        return fetchSource(db.collection(meta.collection), s, filters, perSourceCap);
      })
    ),
  ]);

  const merged = rawLists.flat();
  const sortDir = filters.sort?.endsWith(":asc") ? 1 : -1;
  merged.sort((a, b) => {
    const av = new Date(a.createdAt).getTime();
    const bv = new Date(b.createdAt).getTime();
    return sortDir === 1 ? av - bv : bv - av;
  });

  const total = counts.reduce((sum, [, n]) => sum + n, 0);
  const pageSlice = merged.slice((page - 1) * limit, page * limit);

  return {
    total,
    page,
    limit,
    leads: pageSlice,
    counts: Object.fromEntries(counts) as LeadsListResponse["counts"],
  };
}

// Compact representation for CSV / Excel export.
export function leadToCsvRow(l: UnifiedLead): Record<string, string> {
  return {
    id: l.id,
    source: l.source,
    channel: l.channel || "",
    name: l.name,
    email: l.email || "",
    phone: l.phone || "",
    status: l.status,
    assignedTo: l.assignedTo || "",
    community: l.community || "",
    property: l.property?.title || l.property?.slug || "",
    project: l.project?.name || l.project?.slug || "",
    intent: (l.intent || []).join("|"),
    budgetMin: l.budget?.min != null ? String(l.budget.min) : "",
    budgetMax: l.budget?.max != null ? String(l.budget.max) : "",
    message: (l.message || "").replace(/\s+/g, " ").slice(0, 500),
    notesCount: String(l.notes.length),
    createdAt: new Date(l.createdAt).toISOString(),
    updatedAt: l.updatedAt ? new Date(l.updatedAt).toISOString() : "",
  };
}
