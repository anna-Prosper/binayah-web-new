import { CSP_NONCE } from "./csp";

/**
 * Returns the deploy's static CSP nonce (see src/lib/csp.ts). Server components
 * render inline <script> tags with this nonce so they satisfy the nonce-based
 * Content-Security-Policy.
 *
 * This intentionally does NOT read headers() anymore: doing so opted every
 * route into dynamic rendering and disabled the ISR/edge cache site-wide. The
 * nonce is now frozen per deployment, so a plain constant is correct and keeps
 * pages statically cacheable. Kept async so the existing call sites
 * (`await getNonce()`) don't need to change.
 */
export async function getNonce(): Promise<string> {
  return CSP_NONCE;
}
