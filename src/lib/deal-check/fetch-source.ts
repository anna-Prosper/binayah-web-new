/**
 * deal-check/fetch-source.ts
 *
 * Fetches a visitor-supplied listing URL and reduces it to plain text for the
 * extractor.
 *
 * SECURITY: this takes a URL from an anonymous visitor and fetches it from our
 * server, which is a textbook SSRF sink. The guards below are deliberately
 * strict and deny-by-default:
 *   - https only (no file:, no http:, no gopher:, no data:)
 *   - no credentials in the URL
 *   - hostname must resolve to a public IP — every private, loopback,
 *     link-local and CGNAT range is rejected, which is what protects cloud
 *     metadata endpoints (169.254.169.254) and anything on the VPC
 *   - redirects are followed manually so each hop is re-validated; a public
 *     URL that 302s to localhost is caught on the second hop
 *   - hard caps on response size and time
 * Do not relax any of these without thinking through the metadata-endpoint case.
 */

import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const MAX_BYTES = 2_000_000;
const TIMEOUT_MS = 12_000;
const MAX_REDIRECTS = 3;

/** Browser-ish UA. Portals block obvious bots, and we are acting for a user. */
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

export interface FetchedSource {
  text: string;
  url: string;
}

/** Reject any address that isn't a routable public unicast IP. */
function isPrivateAddress(ip: string): boolean {
  const v = isIP(ip);

  if (v === 4) {
    const p = ip.split(".").map(Number);
    if (p.length !== 4 || p.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return true;
    const [a, b] = p;
    if (a === 0) return true; // "this" network
    if (a === 10) return true; // private
    if (a === 127) return true; // loopback
    if (a === 169 && b === 254) return true; // link-local — cloud metadata
    if (a === 172 && b >= 16 && b <= 31) return true; // private
    if (a === 192 && b === 168) return true; // private
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
    if (a === 192 && b === 0) return true; // IETF protocol assignments
    if (a >= 224) return true; // multicast + reserved + broadcast
    return false;
  }

  if (v === 6) {
    const s = ip.toLowerCase().replace(/^\[|\]$/g, "");
    if (s === "::" || s === "::1") return true;
    if (s.startsWith("fe80")) return true; // link-local
    if (s.startsWith("fc") || s.startsWith("fd")) return true; // unique local
    if (s.startsWith("ff")) return true; // multicast
    // IPv4-mapped (::ffff:a.b.c.d) — re-check the embedded v4 address.
    const mapped = s.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPrivateAddress(mapped[1]);
    return false;
  }

  return true; // not an IP at all
}

/** Validate a single URL: scheme, credentials, and where the host resolves. */
async function assertSafeUrl(raw: string): Promise<URL | null> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }

  if (url.protocol !== "https:") return null;
  if (url.username || url.password) return null;

  const host = url.hostname.replace(/^\[|\]$/g, "");

  // A literal IP in the URL still has to be public.
  if (isIP(host)) {
    return isPrivateAddress(host) ? null : url;
  }

  try {
    // Check EVERY address the name resolves to — a host with one public and
    // one private A record would otherwise slip through.
    const results = await lookup(host, { all: true });
    if (results.length === 0) return null;
    if (results.some((r) => isPrivateAddress(r.address))) return null;
  } catch {
    return null;
  }

  return url;
}

/**
 * Fetch a listing page and strip it to text. Returns null on any failure —
 * callers treat a blocked portal as "no text", not as an error, because many
 * portals refuse server-side requests and the visitor can still paste or
 * screenshot instead.
 */
export async function fetchListingText(rawUrl: string): Promise<FetchedSource | null> {
  let current = rawUrl.trim();

  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    const url = await assertSafeUrl(current);
    if (!url) return null;

    let res: Response;
    try {
      res = await fetch(url, {
        redirect: "manual", // re-validate every hop ourselves
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: {
          "User-Agent": UA,
          Accept: "text/html,application/xhtml+xml",
          "Accept-Language": "en",
        },
        cache: "no-store",
      });
    } catch {
      return null;
    }

    // Follow the redirect manually so the next hop goes through assertSafeUrl.
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) return null;
      try {
        current = new URL(loc, url).toString();
      } catch {
        return null;
      }
      continue;
    }

    if (!res.ok) return null;

    const type = res.headers.get("content-type") ?? "";
    if (!type.includes("html") && !type.includes("text")) return null;

    const declared = Number(res.headers.get("content-length") ?? 0);
    if (declared > MAX_BYTES) return null;

    const body = await readCapped(res, MAX_BYTES);
    if (!body) return null;

    const text = htmlToText(body);
    if (text.length < 40) return null;

    return { text, url: url.toString() };
  }

  return null;
}

/** Read the body with a hard byte cap, so a huge page can't exhaust memory. */
async function readCapped(res: Response, cap: number): Promise<string | null> {
  if (!res.body) return null;
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.length;
      if (total > cap) {
        await reader.cancel();
        break;
      }
      chunks.push(value);
    }
  } catch {
    return null;
  }

  const buf = new Uint8Array(total > cap ? cap : total);
  let off = 0;
  for (const c of chunks) {
    if (off + c.length > buf.length) {
      buf.set(c.subarray(0, buf.length - off), off);
      break;
    }
    buf.set(c, off);
    off += c.length;
  }

  return new TextDecoder("utf-8", { fatal: false }).decode(buf);
}

/**
 * Crude HTML → text. We only need enough for the model to read prices, sizes
 * and community names, so a full parser would be overkill. JSON-LD is pulled
 * out first because portals put clean structured data there.
 */
function htmlToText(html: string): string {
  const parts: string[] = [];

  // Structured data — the highest-quality signal on most listing pages.
  const ldMatches = html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );
  for (const m of ldMatches) {
    const raw = m[1]?.trim();
    if (raw && raw.length < 20_000) parts.push(raw);
  }

  // Meta description / og:title often carry price and location.
  const metas = html.matchAll(
    /<meta[^>]+(?:property|name)=["'](?:og:title|og:description|description)["'][^>]+content=["']([^"']{10,400})["']/gi,
  );
  for (const m of metas) parts.push(m[1]);

  const title = html.match(/<title[^>]*>([\s\S]{0,300}?)<\/title>/i);
  if (title?.[1]) parts.push(title[1]);

  const body = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

  parts.push(body);

  return parts.join("\n\n").slice(0, 30_000);
}
