// ── Leads API usage audit log ────────────────────────────────────────────────
// Every /api/admin/leads/* authorization decision (allow or deny) is recorded so
// we can see WHERE and by WHICH key the leads data is accessed. Two sinks:
//   1. console.log — immediate visibility in Vercel runtime logs.
//   2. Mongo `leads_api_audit` — durable, queryable trail (self-expires via TTL).
// Keys are never logged in the clear: `keyId` is a short sha256 prefix derived in
// api-auth.ts, so the log identifies the integration without leaking the secret.

import clientPromise from "@/lib/mongodb";

export interface LeadsApiAuditEntry {
  ok: boolean;
  reason: "ok" | "no-auth" | "invalid-key" | "insufficient-scope" | "rate-limited";
  via: "session" | "api-key" | null;
  keyId: string | null;
  scope: "read" | "write" | null;
  required: "read" | "write";
  method: string;
  path: string;
  ip: string;
}

const AUDIT_TTL_DAYS = 180;
let indexEnsured = false;

/** Fire-and-forget — never blocks or fails the request on logging problems. */
export function logLeadsApiUsage(entry: LeadsApiAuditEntry): void {
  console.log(
    `[leads-api] ${entry.ok ? "OK  " : "DENY"} ${entry.reason} ` +
      `via=${entry.via ?? "-"} key=${entry.keyId ?? "-"} ` +
      `scope=${entry.scope ?? "-"}/${entry.required} ${entry.method} ${entry.path} ip=${entry.ip}`
  );

  void (async () => {
    try {
      const client = await clientPromise;
      const col = client.db("binayah_web_new_dev").collection("leads_api_audit");
      if (!indexEnsured) {
        try {
          await col.createIndex({ at: 1 }, { expireAfterSeconds: AUDIT_TTL_DAYS * 86400 });
          await col.createIndex({ keyId: 1, at: -1 });
        } catch { /* index already exists */ }
        indexEnsured = true;
      }
      await col.insertOne({ ...entry, at: new Date() });
    } catch (err) {
      console.error("[leads-api] audit write failed:", (err as Error).message);
    }
  })();
}

// ── Read side (dashboard) ─────────────────────────────────────────────────────

export interface AuditRow extends LeadsApiAuditEntry {
  at: string; // ISO
}

export interface KeyUsageSummary {
  keyId: string;         // "session" | "k_xxxx" | "-" (anonymous)
  total: number;
  allowed: number;
  denied: number;
  ips: string[];         // distinct source IPs (capped)
  lastUsed: string;      // ISO
  scopes: string[];      // scopes observed for this caller
}

export interface AuditQueryResult {
  recent: AuditRow[];
  byKey: KeyUsageSummary[];
  windowDays: number;
}

/**
 * Read the audit trail for the dashboard: a per-caller usage summary (who,
 * how much, from which IPs, allow/deny, last seen) plus the most recent rows.
 * Admin-only — surfaced via GET /api/admin/leads/audit.
 */
export async function queryLeadsAudit(opts?: {
  windowDays?: number;
  recentLimit?: number;
  keyId?: string;
}): Promise<AuditQueryResult> {
  const windowDays = Math.min(180, Math.max(1, opts?.windowDays ?? 30));
  const recentLimit = Math.min(500, Math.max(1, opts?.recentLimit ?? 100));
  const since = new Date(Date.now() - windowDays * 86400_000);

  const client = await clientPromise;
  const col = client.db("binayah_web_new_dev").collection("leads_api_audit");

  const match: Record<string, unknown> = { at: { $gte: since } };
  if (opts?.keyId) match.keyId = opts.keyId === "-" ? null : opts.keyId;

  const [recentDocs, byKeyDocs] = await Promise.all([
    col.find(match).sort({ at: -1 }).limit(recentLimit).toArray(),
    col
      .aggregate([
        { $match: { at: { $gte: since } } },
        {
          $group: {
            _id: { $ifNull: ["$keyId", "-"] },
            total: { $sum: 1 },
            allowed: { $sum: { $cond: ["$ok", 1, 0] } },
            denied: { $sum: { $cond: ["$ok", 0, 1] } },
            ips: { $addToSet: "$ip" },
            scopes: { $addToSet: "$scope" },
            lastUsed: { $max: "$at" },
          },
        },
        { $sort: { total: -1 } },
      ])
      .toArray(),
  ]);

  const recent: AuditRow[] = recentDocs.map((d) => ({
    ok: !!d.ok,
    reason: d.reason,
    via: d.via ?? null,
    keyId: d.keyId ?? null,
    scope: d.scope ?? null,
    required: d.required,
    method: d.method,
    path: d.path,
    ip: d.ip,
    at: (d.at instanceof Date ? d.at : new Date(d.at)).toISOString(),
  }));

  const byKey: KeyUsageSummary[] = byKeyDocs.map((g) => ({
    keyId: String(g._id),
    total: g.total,
    allowed: g.allowed,
    denied: g.denied,
    ips: (g.ips as (string | null)[]).filter(Boolean).slice(0, 25) as string[],
    lastUsed: (g.lastUsed instanceof Date ? g.lastUsed : new Date(g.lastUsed)).toISOString(),
    scopes: (g.scopes as (string | null)[]).filter(Boolean) as string[],
  }));

  return { recent, byKey, windowDays };
}
