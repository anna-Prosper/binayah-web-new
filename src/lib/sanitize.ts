import sanitizeHtml from "sanitize-html";

// Migrated WordPress content (articles, project descriptions) still contains
// links to the old https://www.binayah.com site. Rendered on binayah.ae those
// leak clicks + link equity to the old domain (shows up as a binayah.ae
// referral in binayah.com analytics). Rewrite the DOMAIN to binayah.ae, keeping
// the path. Image src is deliberately left alone — those assets only exist on
// the old WP host, so swapping them would 404 the images.
const LEGACY_DOMAIN_RE = /^https?:\/\/(?:www\.|wp\.)?binayah\.com/i;
export function rewriteLegacyHref(href: string | undefined | null): string {
  if (!href) return "";
  return href.replace(LEGACY_DOMAIN_RE, "https://www.binayah.ae");
}
// Rewrite only href="..."/href='...' occurrences inside an HTML string (not src=).
function rewriteLegacyAnchorsInHtml(html: string): string {
  return html.replace(
    /(href=["'])https?:\/\/(?:www\.|wp\.)?binayah\.com/gi,
    "$1https://www.binayah.ae"
  );
}

// Sanitizes scraped/CMS article HTML before it is rendered via
// dangerouslySetInnerHTML. News content comes from an external scraper, and the
// CSP allows 'unsafe-inline', so an injected <script> or onerror handler would
// otherwise execute (stored XSS). Allows safe formatting tags only.
export function sanitizeArticleHtml(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtml(html, {
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
  });
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
    if (typeof out[f] === "string") out[f] = rewriteLegacyAnchorsInHtml(stripCacheJunk(out[f] as string));
  }
  // Drop heavy, never-rendered DB blobs so they don't bloat the serialized client
  // payload — and, in seoArticle's case, leak rounded/stale prices (e.g. an
  // AED 1,692,000 unit written as "from AED 1,690,000") into the HTML source.
  delete out.seoArticle;
  delete out.wpContent;
  return out as T;
}
