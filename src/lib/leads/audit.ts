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
