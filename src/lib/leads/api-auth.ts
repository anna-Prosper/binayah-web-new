// ── Leads API authorization ─────────────────────────────────────────────────
// Auth methods for /api/admin/leads/*:
//
// 1. Browser / NextAuth session of a user whose email is in ADMIN_EMAILS
//    → full "write" scope. Used by the in-app admin dashboard.
//
// 2. API key in `Authorization: Bearer <key>` or `x-api-key: <key>`:
//      - LEADS_API_KEYS           → "write" scope (read + mutate + delete)
//      - LEADS_API_KEYS_READONLY  → "read" scope only (list / get / export / stats)
//    Both are comma-separated CSVs. Give external integrations that only need to
//    pull leads (a CRM sync, n8n, dashboards) a READ-ONLY key — a leaked read-only
//    key can't modify or delete leads.
//
// Every call is rate-limited per caller and written to the leads_api_audit log
// (see ./audit) so we can see where and by which key the data is used.

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { isAdminSession } from "@/lib/admin-auth";
import { checkRateLimit } from "@/lib/rateLimit";
import { logLeadsApiUsage } from "@/lib/leads/audit";

export type LeadsScope = "read" | "write";

// Discriminated on `ok` so callers can `if (!auth.ok) return auth.response;` —
// `response` (401 unauthorized / 403 read-only-on-write / 429 rate limited) is
// guaranteed present on the failure branch.
export type LeadsAuthResult =
  | { ok: true; via: "session" | "api-key"; scope: LeadsScope; keyId: string | null; response?: undefined }
  | { ok: false; via: "session" | "api-key" | null; scope: LeadsScope | null; keyId: string | null; response: NextResponse };

// Per rolling minute.
const RL_WINDOW_MS = 60_000;
const RL_AUTHED_MAX = 120; // per API key / admin session
const RL_ANON_MAX = 20;    // per IP for unauthenticated hits — slows key brute-forcing

function extractApiKey(req: NextRequest): string | null {
  const headerKey = req.headers.get("x-api-key");
  if (headerKey) return headerKey.trim();
  const auth = req.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  return null;
}

function parseKeys(envVal: string | undefined): Set<string> {
  return new Set((envVal || "").split(",").map((k) => k.trim()).filter(Boolean));
}

/** Non-reversible, stable per-key identifier for logs — never the raw secret. */
export function keyIdOf(key: string): string {
  return "k_" + createHash("sha256").update(key).digest("hex").slice(0, 8);
}

function clientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

function deny(status: number, error: string): NextResponse {
  return NextResponse.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
}

/**
 * Authorize a leads API request for the given required scope. GET/list/export/
 * stats pass "read"; PATCH/DELETE/bulk pass "write". On failure, returns
 * `{ ok: false, response }` — the caller should `return auth.response`.
 */
export async function isLeadsApiAuthorized(
  req: NextRequest,
  required: LeadsScope = "write"
): Promise<LeadsAuthResult> {
  const method = req.method;
  const path = req.nextUrl.pathname;
  const ip = clientIp(req);

  // 1. Identify the caller and the scope they're granted.
  let via: "session" | "api-key" | null = null;
  let grantedScope: LeadsScope | null = null;
  let keyId: string | null = null;

  const key = extractApiKey(req);
  if (key) {
    if (parseKeys(process.env.LEADS_API_KEYS).has(key)) {
      via = "api-key"; grantedScope = "write"; keyId = keyIdOf(key);
    } else if (parseKeys(process.env.LEADS_API_KEYS_READONLY).has(key)) {
      via = "api-key"; grantedScope = "read"; keyId = keyIdOf(key);
    } else {
      const allowed = await checkRateLimit("leads-api-anon", ip, RL_ANON_MAX, RL_WINDOW_MS);
      logLeadsApiUsage({ ok: false, reason: "invalid-key", via: "api-key", keyId: keyIdOf(key), scope: null, required, method, path, ip });
      return { ok: false, via: null, scope: null, keyId: null, response: allowed ? deny(401, "Unauthorized") : deny(429, "Too many requests") };
    }
  } else if (await isAdminSession()) {
    via = "session"; grantedScope = "write"; keyId = "session";
  } else {
    const allowed = await checkRateLimit("leads-api-anon", ip, RL_ANON_MAX, RL_WINDOW_MS);
    logLeadsApiUsage({ ok: false, reason: "no-auth", via: null, keyId: null, scope: null, required, method, path, ip });
    return { ok: false, via: null, scope: null, keyId: null, response: allowed ? deny(401, "Unauthorized") : deny(429, "Too many requests") };
  }

  // 2. Rate limit the authenticated caller (per key / per session).
  const allowed = await checkRateLimit("leads-api", keyId ?? via ?? ip, RL_AUTHED_MAX, RL_WINDOW_MS);
  if (!allowed) {
    logLeadsApiUsage({ ok: false, reason: "rate-limited", via, keyId, scope: grantedScope, required, method, path, ip });
    return { ok: false, via, scope: grantedScope, keyId, response: deny(429, "Too many requests") };
  }

  // 3. Scope check — a read-only key may not hit a write route.
  if (required === "write" && grantedScope !== "write") {
    logLeadsApiUsage({ ok: false, reason: "insufficient-scope", via, keyId, scope: grantedScope, required, method, path, ip });
    return { ok: false, via, scope: grantedScope, keyId, response: deny(403, "This API key is read-only") };
  }

  // 4. Allowed. (via + grantedScope are non-null on this path.)
  logLeadsApiUsage({ ok: true, reason: "ok", via, keyId, scope: grantedScope, required, method, path, ip });
  return { ok: true, via, scope: grantedScope, keyId };
}
