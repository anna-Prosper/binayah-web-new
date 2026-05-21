// ── Leads API authorization ─────────────────────────────────────────────────
// Two acceptable auth methods for /api/admin/leads/*:
//
// 1. Browser / NextAuth session of a user whose email is in ADMIN_EMAILS.
//    Used by the in-app admin dashboard.
//
// 2. API key in either header:
//      Authorization: Bearer <key>
//    or:
//      x-api-key: <key>
//    Valid keys come from LEADS_API_KEYS (comma-separated CSV).
//    Used by external systems — colleague's CRM, sync scripts, n8n, etc.

import type { NextRequest } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";

function extractApiKey(req: NextRequest): string | null {
  const headerKey = req.headers.get("x-api-key");
  if (headerKey) return headerKey.trim();
  const auth = req.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  return null;
}

function validApiKeys(): Set<string> {
  return new Set(
    (process.env.LEADS_API_KEYS || "")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean)
  );
}

/** Returns true if the caller is an admin user OR a holder of a valid API key. */
export async function isLeadsApiAuthorized(req: NextRequest): Promise<{
  ok: boolean;
  via: "session" | "api-key" | null;
}> {
  const key = extractApiKey(req);
  if (key) {
    const keys = validApiKeys();
    if (keys.size > 0 && keys.has(key)) {
      return { ok: true, via: "api-key" };
    }
  }
  const sessionOk = await isAdminSession();
  if (sessionOk) return { ok: true, via: "session" };
  return { ok: false, via: null };
}
