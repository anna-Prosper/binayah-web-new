// ── Unified Lead types ──────────────────────────────────────────────────────
// One normalized shape across all 5 lead-bearing collections.

export type LeadSource =
  | "inquiry"
  | "newsletter"
  | "list-property"
  | "project-subscribe";

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "meeting"
  | "won"
  | "lost";

export const LEAD_STATUSES: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "meeting",
  "won",
  "lost",
];

export interface LeadNote {
  author: string;        // email of the user who added the note
  text: string;
  at: Date | string;
  system?: boolean;      // true = auto-generated (status change, assignment, etc.)
}

export interface UnifiedLead {
  id: string;            // composite: "<source>:<mongoId>", used in PATCH endpoints
  source: LeadSource;
  channel?: string;      // sub-source: "contact-form" | "ai-chat" | "newsletter-strip" | ...
  name: string;
  email?: string;
  phone?: string;
  message?: string;
  property?: { slug?: string; title?: string };
  project?: { slug?: string; name?: string };
  pageUrl?: string;          // canonical URL of the related property or project page
  pageTitle?: string;        // document.title of the page the lead was captured on
  ip?: string;               // req.ip as seen by the API (post trustProxy)
  country?: string;          // resolved async from ip; may be absent even when ip is present
  intent?: string[];     // ["buy","rent","invest"] for newsletter subscribers
  budget?: { min?: number; max?: number };
  community?: string;
  status: LeadStatus;
  assignedTo?: string;   // email of agent
  notes: LeadNote[];
  createdAt: Date | string;
  updatedAt?: Date | string;
  raw?: Record<string, unknown>;  // original document, included in detail view only
}

export interface LeadsListResponse {
  total: number;
  page: number;
  limit: number;
  leads: UnifiedLead[];
  counts: Partial<Record<LeadSource, number>>;
}

export interface LeadsListFilters {
  source?: LeadSource[];
  status?: LeadStatus[];
  q?: string;             // fuzzy search name/email/phone
  community?: string;
  from?: Date;
  to?: Date;
  assignedTo?: string;
  page?: number;
  limit?: number;
  sort?: "createdAt:desc" | "createdAt:asc" | "updatedAt:desc";
}

export interface LeadPatchInput {
  status?: LeadStatus;
  assignedTo?: string | null;   // null = unassign
  note?: { text: string };       // appends a manual note (system: false)
}
