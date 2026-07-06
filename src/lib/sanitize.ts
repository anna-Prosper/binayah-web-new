import sanitizeHtml from "sanitize-html";

// Migrated WordPress content (articles, project descriptions) still references
// the old binayah.com site. binayah.ae must not mention or depend on it:
//  - LINKS (href) are rewritten to binayah.ae (keep the path).
//  - IMAGES (src) that point at binayah.com are stripped entirely — those
//    assets only live on the old host, which is being retired, so proxying or
//    rewriting them would just break later. Removing them drops the mention and
//    the dependency (article featured images live on S3 and are unaffected).
const LEGACY_DOMAIN_RE = /^https?:\/\/(?:www\.|wp\.)?binayah\.com/i;
export function rewriteLegacyHref(href: string | undefined | null): string {
  if (!href) return "";
  return href.replace(LEGACY_DOMAIN_RE, "https://www.binayah.ae");
}
// Drop <img>/<source> tags whose src points at binayah.com (also unwrap an
// otherwise-empty wrapping <figure>).
function stripLegacyImages(html: string): string {
  return html
    .replace(/<(?:img|source)\b[^>]*\bsrc(?:set)?\s*=\s*["'][^"']*binayah\.com[^"']*["'][^>]*>/gi, "")
    .replace(/<figure\b[^>]*>\s*(?:<figcaption\b[^>]*>.*?<\/figcaption>)?\s*<\/figure>/gi, "");
}
// Inline content images live inside stored CMS HTML rendered via
// dangerouslySetInnerHTML, so they bypass next/image entirely (no AVIF/srcset).
// At minimum, force native lazy-loading + async decoding on any <img> that
// doesn't already set loading, so off-screen body images don't block render.
// Runs on already-sanitized/cleaned output, so it only adds static attributes.
function addLazyLoading(html: string): string {
  return html.replace(/<img\b([^>]*?)\/?>/gi, (full, attrs) => {
    if (/\bloading\s*=/i.test(attrs)) return full;
    return `<img${attrs.replace(/\s+$/, "")} loading="lazy" decoding="async">`;
  });
}

// Rewrite legacy href links + strip legacy images in one pass (for raw HTML
// strings rendered via dangerouslySetInnerHTML, e.g. project descriptions).
function cleanLegacyHtml(html: string): string {
  return addLazyLoading(stripLegacyImages(
    html.replace(/(href=["'])https?:\/\/(?:www\.|wp\.)?binayah\.com/gi, "$1https://www.binayah.ae")
  ));
}

// Sanitizes scraped/CMS article HTML before it is rendered via
// dangerouslySetInnerHTML. News content comes from an external scraper, and the
// CSP allows 'unsafe-inline', so an injected <script> or onerror handler would
// otherwise execute (stored XSS). Allows safe formatting tags only.
export function sanitizeArticleHtml(html: string | null | undefined): string {
  if (!html) return "";
  // Drop binayah.com images first so the sanitized output never references the
  // old host (links are rewritten via transformTags below). Lazy-load pass runs
  // last, on the sanitized (safe) output.
  return addLazyLoading(sanitizeHtml(stripLegacyImages(html), {
    allowedTags: [
      "h2", "h3", "h4", "h5", "h6", "p", "blockquote", "ul", "ol", "li",
      "strong", "b", "em", "i", "u", "s", "a", "img", "figure", "figcaption",
      "br", "hr", "table", "thead", "tbody", "tr", "th", "td", "span", "div",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      "*": ["class"],
    },
    allowedSchemes: ["https", "http", "mailto"],
    transformTags: {
      a: (tagName, attribs) => ({
        tagName: "a",
        attribs: {
          ...attribs,
          href: rewriteLegacyHref(attribs.href),
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
    },
  }));
}

// Strips WordPress cache-plugin boilerplate that was scraped into project
// descriptions (e.g. "Note: None of these options will be applied if this post
// has been excluded from cache in the global cache settings.") — present in
// ~2,200 projects' fullDescription. Used server-side so the junk never reaches
// the client (not rendered, not in the serialized RSC payload, not in SEO).
export function stripCacheJunk(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .replace(/Note:\s*None of these options[^.]*\.?/gi, "")
    .replace(/^.*\b(?:excluded from cache|global cache settings|none of these options will be applied)\b.*$/gim, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Sanitize the free-text description fields on a project/listing object in place-ish (returns a new object). */
export function sanitizeDescriptions<T extends Record<string, unknown>>(obj: T): T {
  if (!obj || typeof obj !== "object") return obj;
  const FIELDS = ["fullDescription", "rawDescription", "shortOverview", "overview", "cleanDescription", "description", "locationDescription"];
  const out: Record<string, unknown> = { ...obj };
  for (const f of FIELDS) {
    if (typeof out[f] === "string") out[f] = cleanLegacyHtml(stripCacheJunk(out[f] as string));
  }
  // Drop heavy, never-rendered DB blobs so they don't bloat the serialized client
  // payload — and, in seoArticle's case, leak rounded/stale prices (e.g. an
  // AED 1,692,000 unit written as "from AED 1,690,000") into the HTML source.
  delete out.seoArticle;
  delete out.wpContent;
  return out as T;
}
