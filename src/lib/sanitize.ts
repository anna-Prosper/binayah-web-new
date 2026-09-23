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

// schema.org articleBody must be PLAIN TEXT — markup inside it is not stripped
// by consumers, it is taken literally, so shipping raw HTML there publishes tag
// soup as the article's text. Three of our four article types store HTML
// (news, reports) or markdown (guides), so both have to collapse to prose here.
//
// The JSON-LD is duplicated page text with no rich-result value, so it is capped:
// uncapped, a long report roughly doubles the HTML payload for zero rendering
// benefit. Truncation is at a word boundary so the tail is not a broken word.
const ARTICLE_BODY_MAX_CHARS = 12000;

export function toPlainText(input: string | null | undefined): string {
  if (!input) return "";
  return input
    // Block-level tags become paragraph breaks, so sentences don't run together.
    .replace(/<\/(?:p|div|h[1-6]|li|tr|blockquote|section|article)>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    // Drop script/style bodies wholesale before the generic tag strip, otherwise
    // their contents survive as text.
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<[^>]+>/g, "")
    // Markdown leftovers from guide bodies: heading/emphasis/link syntax.
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^[ \t]*#{1,6}[ \t]+/gm, "")
    .replace(/(\*\*|__|\*|_|`)/g, "")
    // Entities that would otherwise read as literal &amp; in the structured data.
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Plain text for JSON-LD articleBody, capped at a word boundary. */
export function articleBodyText(input: string | null | undefined): string | undefined {
  const text = toPlainText(input);
  if (!text) return undefined;
  if (text.length <= ARTICLE_BODY_MAX_CHARS) return text;
  const cut = text.slice(0, ARTICLE_BODY_MAX_CHARS);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd() + "…";
}

/**
 * News articles do NOT store HTML — `body` is an array of typed blocks
 * (paragraph, section_title, stats, table, faq, quote, …). Flatten it to the
 * prose a reader actually sees, so articleBody matches the rendered page
 * rather than a JSON dump. Block types are the ten observed across the feed;
 * an unknown type falls back to its `text` field if it has one, so a new
 * block type degrades to partial text instead of vanishing.
 */
export function newsBodyToPlainText(body: unknown): string {
  if (!Array.isArray(body)) return "";
  const parts: string[] = [];
  for (const raw of body) {
    if (!raw || typeof raw !== "object") continue;
    const b = raw as Record<string, any>;
    switch (b.type) {
      case "intro":
      case "paragraph":
      case "section_title":
        if (b.text) parts.push(String(b.text));
        break;
      case "callout":
        if (b.title) parts.push(String(b.title));
        if (b.text) parts.push(String(b.text));
        break;
      case "quote":
        if (b.text) parts.push(b.author ? `"${b.text}" — ${b.author}` : String(b.text));
        break;
      case "bullet_list":
        if (Array.isArray(b.items)) parts.push(b.items.map((i: any) => String(i?.text ?? i ?? "")).filter(Boolean).join("\n"));
        break;
      case "stats":
        if (b.title) parts.push(String(b.title));
        if (Array.isArray(b.stats)) parts.push(b.stats.map((s: any) => `${s?.label ?? ""}: ${s?.value ?? ""}`.trim()).filter((s: string) => s !== ":").join("\n"));
        break;
      case "table":
        if (Array.isArray(b.headers)) parts.push(b.headers.map(String).join(" | "));
        if (Array.isArray(b.rows)) parts.push(b.rows.map((r: any) => (Array.isArray(r) ? r.map(String).join(" | ") : "")).filter(Boolean).join("\n"));
        break;
      case "faq":
        if (Array.isArray(b.items)) parts.push(b.items.map((i: any) => `${i?.question ?? i?.q ?? ""} ${i?.answer ?? i?.a ?? ""}`.trim()).filter(Boolean).join("\n\n"));
        break;
      // `image` contributes no prose — alt/caption are the image's, not the article's.
      case "image":
        break;
      default:
        if (typeof b.text === "string") parts.push(b.text);
    }
  }
  // Blocks may still carry inline markup/entities, so run the text cleaner over the join.
  return toPlainText(parts.filter(Boolean).join("\n\n"));
}
