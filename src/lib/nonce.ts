import { headers } from "next/headers";

/**
 * Reads the per-request CSP nonce set by middleware (x-nonce header). Server
 * components render inline <script> tags with this nonce so they satisfy the
 * nonce-based Content-Security-Policy. Returns "" if unavailable (e.g. a
 * statically-rendered context) so callers degrade gracefully instead of erroring.
 */
export async function getNonce(): Promise<string> {
  try {
    return (await headers()).get("x-nonce") ?? "";
  } catch {
    return "";
  }
}
