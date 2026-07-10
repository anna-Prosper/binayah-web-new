// Per-deploy static CSP nonce.
//
// The nonce is frozen to ONE value per deployment (derived from the git commit
// SHA in next.config.ts and inlined via `env`, so it's identical in the Edge
// middleware, the server render, and the cached ISR HTML). A per-request nonce
// forced every route to read headers() in the root layout, which opts the
// entire app out of static/ISR rendering — so no page was ever edge-cached and
// crawlers re-rendered everything from origin on each hit.
//
// A static nonce baked into public HTML provides limited XSS protection (the
// value is readable in the page source), but the CSP's other directives
// (object-src 'none', base-uri, frame-ancestors, connect-src, the script host
// allowlist) remain fully enforced, and the nonce still rotates on every
// deploy. This is the accepted trade-off for making the whole site cacheable.
export const CSP_NONCE = process.env.CSP_NONCE || "binayah-dev-static-nonce0";
