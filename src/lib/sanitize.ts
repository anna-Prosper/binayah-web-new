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

// Hosts the Next.js image optimizer is configured to accept (mirror of
// next.config.ts images.remotePatterns). An inline <img> from any of these —
// or a local/relative path — can be routed through /_next/image to gain AVIF/
// WebP + a responsive srcset. Anything else (unknown host, SVG, data URI) is
// left untouched so it can't 400 the optimizer and break the image.
const OPTIMIZABLE_HOSTS = new Set([
  "binayah.ae", "www.binayah.ae",
  "binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com",
  "binayah-media-456051253184-us-east-1-an.s3.amazonaws.com",
  "binayah-images.s3.ap-south-1.amazonaws.com",
  "sm-automation-5464.s3.ap-south-1.amazonaws.com",
  "sm-automation-5464.s3.amazonaws.com",
  "manage.tanamiproperties.com", "tanamiproperties.com",
  "keyone.com", "www.keyone.com",
  "stageproperties.com", "www.stageproperties.com",
  "upload.wikimedia.org", "commons.wikimedia.org",
  "cdn.prod.website-files.com", "www.modon.com",
  "sherwoodsproperty.com", "abudhabioffplan.ae",
  "lh3.googleusercontent.com",
]);
// Widths must be a subset of next.config images.deviceSizes (defaults), and
// q=75 is the always-allowed default quality — both required or /_next/image 400s.
const OPT_WIDTHS = [640, 828, 1080, 1200, 1920];
// Body copy renders in a ~720px content column (matches ArticleBody's blocks).
const OPT_SIZES = "(max-width: 768px) 100vw, 720px";

function canOptimize(src: string): boolean {
  if (!src || /^data:/i.test(src) || /\.svg(\?|$)/i.test(src)) return false;
  if (/\/_next\/image/.test(src)) return false; // already optimized
  if (src.startsWith("/") && !src.startsWith("//")) return true; // local/relative
  try {
    return OPTIMIZABLE_HOSTS.has(new URL(src).hostname);
  } catch {
    return false;
  }
}

function optUrl(src: string, w: number): string {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=75`;
}

// Route optimizable inline images through the Next optimizer for AVIF/WebP +
// responsive srcset. Rebuilds only src/srcset/sizes; preserves alt/class/etc.
// Runs on already-sanitized output, and only ever adds static attributes.
function optimizeImages(html: string): string {
  return html.replace(/<img\b([^>]*?)\/?>/gi, (full, attrs) => {
    const srcM = attrs.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
    if (!srcM || !canOptimize(srcM[1])) return full;
    const src = srcM[1];
    const rest = attrs
      .replace(/\s*\bsrcset\s*=\s*["'][^"']*["']/gi, "")
      .replace(/\s*\bsizes\s*=\s*["'][^"']*["']/gi, "")
      .replace(/\s*\bsrc\s*=\s*["'][^"']*["']/gi, "")
      .replace(/\/\s*$/, "")
      .trim();
    const srcset = OPT_WIDTHS.map((w) => `${optUrl(src, w)} ${w}w`).join(", ");
    return `<img src="${optUrl(src, 1200)}" srcset="${srcset}" sizes="${OPT_SIZES}"${rest ? " " + rest : ""}>`;
  });
}

// Rewrite legacy href links + strip legacy images in one pass (for raw HTML
// strings rendered via dangerouslySetInnerHTML, e.g. project descriptions).
function cleanLegacyHtml(html: string): string {
  return addLazyLoading(optimizeImages(stripLegacyImages(
    html.replace(/(href=["'])https?:\/\/(?:www\.|wp\.)?binayah\.com/gi, "$1https://www.binayah.ae")
  )));
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
  return addLazyLoading(optimizeImages(sanitizeHtml(stripLegacyImages(html), {
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
  })));
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
