// fix-overview.js
// Node script to normalize/fill project fields in MongoDB from fullDescription + community CSV exports
//
// Usage:
//   npm i mongodb
//   node fix-overview.js
//
// Optional env vars:
//   MONGODB_URI=mongodb://127.0.0.1:27017
//   MONGODB_DB=binayah
//   MONGODB_COLLECTION=projects
//   COMMUNITIES_POSTS_CSV=./migration/exports/communities_posts.csv
//   COMMUNITIES_META_CSV=./migration/exports/communities_meta.csv
//   DRY_RUN=true
//   LIMIT=100
//   ONLY_SLUG=marina-vista-at-emaar-beachfront
//
// Notes:
// - This script is defensive and tries to parse messy HTML / encoded blobs in fullDescription.
// - It only fills missing fields by default, but will also fix obviously broken placeholders (e.g., address "0,0,0").
// - It will NOT overwrite good values aggressively.

const fs = require("fs");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");

/* ---------------------------------- CONFIG --------------------------------- */

const CONFIG = {
  MONGODB_URI: process.env.MONGODB_URI || "mongodb+srv://binayah_admin:TJ7Xi9oDourwpRE2@binayah.f0haxdf.mongodb.net/binayah_website_new?retryWrites=true&w=majority",
  MONGODB_DB: process.env.MONGODB_DB || "binayah_website_new",
  MONGODB_COLLECTION: process.env.MONGODB_COLLECTION || "projects",

  COMMUNITIES_POSTS_CSV:
    process.env.COMMUNITIES_POSTS_CSV || "./migration/exports/communities_posts.csv",
  COMMUNITIES_META_CSV:
    process.env.COMMUNITIES_META_CSV || "./migration/exports/communities_meta.csv",

  DRY_RUN: String(process.env.DRY_RUN ?? "true").toLowerCase() === "true",
  LIMIT: Number(process.env.LIMIT || "0"), // 0 = no limit
  ONLY_SLUG: (process.env.ONLY_SLUG || "").trim(),
};

if (!CONFIG.MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables (MONGODB_URI)');
  process.exit(1);
}

/* ------------------------------ CSV UTILITIES ------------------------------ */

function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((v) => v.trim());
}

function parseCsv(text) {
  const lines = String(text || "")
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0);

  if (!lines.length) return [];

  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {};
    headers.forEach((h, i) => {
      row[h] = values[i] ?? "";
    });
    return row;
  });
}

/* ----------------------------- TEXT / HTML UTIL ---------------------------- */

function normalizeText(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/&amp;/g, "&")
    .replace(/&#038;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/[^\p{L}\p{N}\s&/+\-.]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCase(s) {
  return String(s || "")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function htmlEntityDecode(str) {
  if (!str) return "";
  return String(str)
    .replace(/&nbsp;/gi, " ")
    .replace(/&#160;/g, " ")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#038;/g, "&")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function stripHtml(html) {
  return htmlEntityDecode(String(html || ""))
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function tryDecodeURIComponentSafe(s) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

function extractEncodedHtmlBlobs(rawHtml) {
  // Detect URL-encoded HTML fragments like JTNDZGl2... (base64?) OR %3Cdiv...
  // In your sample, there is a base64-looking string beginning with "JTND..." (actually URL-encoded string)
  const blobs = [];
  const text = String(rawHtml || "");

  // 1) URL-encoded HTML chunks (%3Cdiv... or JTNDZGl2... where "JTN" is encoded "%")
  // We'll target long sequences of URL-safe chars likely representing encoded HTML
  const candidates = text.match(/[A-Za-z0-9%+/=]{200,}/g) || [];
  for (const c of candidates) {
    let decoded = c;
    // Decode multiple rounds if needed
    for (let i = 0; i < 3; i++) {
      const next = tryDecodeURIComponentSafe(decoded);
      if (next === decoded) break;
      decoded = next;
    }

    // If still no obvious HTML and it looks base64-ish, try base64 decode
    if (!/[<][a-z!/]/i.test(decoded) && /^[A-Za-z0-9+/=\s]+$/.test(decoded)) {
      try {
        const b64 = Buffer.from(decoded.trim(), "base64").toString("utf8");
        if (/[<][a-z!/]/i.test(b64)) decoded = b64;
      } catch {
        // ignore
      }
    }

    if (/[<](div|ul|li|p|h\d|a|span|strong)\b/i.test(decoded)) {
      blobs.push(decoded);
    }
  }

  return blobs;
}

function buildParseableHtml(fullDescription) {
  const html = String(fullDescription || "");
  const decodedMain = htmlEntityDecode(html);
  const extraBlobs = extractEncodedHtmlBlobs(decodedMain);
  return [decodedMain, ...extraBlobs].join("\n");
}

/* ---------------------------- COMMUNITIES LOADER --------------------------- */

function loadCommunitiesFromCsv(postsCsvPath, metaCsvPath) {
  const postsAbs = path.resolve(postsCsvPath);
  const metaAbs = path.resolve(metaCsvPath);

  if (!fs.existsSync(postsAbs)) {
    throw new Error(`communities_posts.csv not found: ${postsAbs}`);
  }
  if (!fs.existsSync(metaAbs)) {
    throw new Error(`communities_meta.csv not found: ${metaAbs}`);
  }

  const postsRows = parseCsv(fs.readFileSync(postsAbs, "utf8"));
  const metaRows = parseCsv(fs.readFileSync(metaAbs, "utf8"));

  const metaByPostId = new Map();

  for (const row of metaRows) {
    const postId =
      row.post_id ||
      row.postid ||
      row.ID ||
      row.id ||
      row.object_id ||
      row.post ||
      "";
    const metaKey = row.meta_key || row.key || row.metaKey || "";
    const metaValue = row.meta_value || row.value || row.metaValue || "";

    if (!postId || !metaKey) continue;
    const pid = String(postId).trim();
    if (!metaByPostId.has(pid)) metaByPostId.set(pid, {});
    metaByPostId.get(pid)[metaKey] = metaValue;
  }

  const communities = [];

  for (const row of postsRows) {
    const id = String(row.ID || row.id || row.post_id || "").trim();
    const postTitle = String(row.post_title || row.title || row.name || "").trim();
    const postName = String(row.post_name || row.slug || "").trim();
    const postType = String(row.post_type || row.type || "").toLowerCase();
    const postStatus = String(row.post_status || row.status || "").toLowerCase();

    // Soft filter only
    if (postStatus && !["publish", "published"].includes(postStatus)) {
      // keep if title still exists (some exports don't match WP naming exactly)
      if (!postTitle) continue;
    }

    const meta = metaByPostId.get(id) || {};

    const city =
      meta.city ||
      meta._city ||
      meta.project_city ||
      meta.community_city ||
      meta.location_city ||
      "";
    const country =
      meta.country ||
      meta._country ||
      meta.project_country ||
      meta.community_country ||
      "UAE";

    const maybeName =
      postTitle ||
      meta.community_name ||
      meta.name ||
      meta._community_name ||
      "";
    if (!maybeName) continue;

    // If you want stricter filtering by post_type, uncomment:
    // if (postType && !postType.includes("community")) continue;

    const item = {
      id,
      name: maybeName.trim(),
      slug: postName,
      city: city ? titleCase(city) : "",
      country: country ? String(country).trim().toUpperCase() : "UAE",
      normName: normalizeText(maybeName),
      postType,
    };

    if (!item.normName) continue;
    communities.push(item);
  }

  // Deduplicate by normalized name (keep longest/most complete)
  const dedup = new Map();
  for (const c of communities.sort((a, b) => b.name.length - a.name.length)) {
    if (!dedup.has(c.normName)) dedup.set(c.normName, c);
  }

  return Array.from(dedup.values());
}

function detectCommunityFromProject(project, communities) {
  const haystack = normalizeText(
    [
      project.name,
      project.metaTitle,
      project.metaDescription,
      project.shortOverview,
      project.fullDescription,
      project.address,
      project.slug,
    ]
      .filter(Boolean)
      .join(" ")
  );

  if (!haystack) return null;

  const sorted = [...communities].sort((a, b) => b.normName.length - a.normName.length);
  for (const c of sorted) {
    if (!c.normName) continue;
    if (haystack.includes(c.normName)) return c;
  }
  return null;
}

/* ------------------------------ FIELD EXTRACTORS --------------------------- */

function parseMoneyToNumber(text) {
  if (!text) return null;
  const cleaned = String(text).replace(/[, ]+/g, "");
  const m = cleaned.match(/(\d+(?:\.\d+)?)/);
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isFinite(n)) return null;
  // price should be integer AED typically
  return Math.round(n);
}

function extractStartingPrice(html, plainText) {
  const sources = [html || "", plainText || ""];

  // 1) "Starting price AED 2,058,888"
  for (const src of sources) {
    const m = src.match(
      /starting\s*price[^A-Za-z0-9]{0,20}(?:<[^>]*>\s*)*(AED|USD|EUR|GBP|CNY|RUB)?\s*([\d,]+(?:\.\d+)?)/i
    );
    if (m) return parseMoneyToNumber(m[2]);
  }

  // 2) "Starting Price For ... around AED 1.5 million"
  for (const src of sources) {
    const mMil = src.match(
      /starting\s+price[\s\S]{0,120}?(AED)\s*([\d.]+)\s*(million|m)\b/i
    );
    if (mMil) return Math.round(Number(mMil[2]) * 1_000_000);

    const mNum = src.match(
      /starting\s+price[\s\S]{0,120}?(AED)\s*([\d,]+(?:\.\d+)?)/i
    );
    if (mNum) return parseMoneyToNumber(mNum[2]);
  }

  // 3) fallback first AED amount in feature list block
  for (const src of sources) {
    const m = src.match(/\bAED\s*([\d,]+(?:\.\d+)?)\b/i);
    if (m) return parseMoneyToNumber(m[1]);
  }

  return null;
}

function extractCompletionDate(html, plainText) {
  const text = `${html}\n${plainText}`;

  // "Completion date Mar - 2023"
  let m = text.match(/completion\s*date[^A-Za-z0-9]{0,30}(?:<[^>]*>\s*)*([A-Za-z]{3,9}\s*[-–]?\s*\d{4})/i);
  if (m) return m[1].replace(/\s*[-–]\s*/, " ").trim();

  // "expected to be completed by December 2023"
  m = text.match(/completed\s+by\s+([A-Za-z]{3,9}\s+\d{4})/i);
  if (m) return m[1].trim();

  // "Q4 2027"
  m = text.match(/\b(Q[1-4]\s*\d{4})\b/i);
  if (m) return m[1].toUpperCase().replace(/\s+/, " ");

  // year only
  m = text.match(/\b(20\d{2})\b/);
  if (m) return m[1];

  return "";
}

function extractTitleType(html, plainText) {
  const text = `${html}\n${plainText}`;
  let m = text.match(/title\s*type[^A-Za-z0-9]{0,20}(?:<[^>]*>\s*)*([A-Za-z ]{3,30})/i);
  if (m) return titleCase(m[1]).trim();

  if (/\bfreehold\b/i.test(text)) return "Freehold";
  if (/\bleasehold\b/i.test(text)) return "Leasehold";

  return "";
}

function extractPaymentPlanSummary(html, plainText) {
  const text = `${html}\n${plainText}`;

  let m = text.match(/payment\s*plan[^A-Za-z0-9]{0,20}(?:<[^>]*>\s*)*([^\n<]{3,80})/i);
  if (m) return htmlEntityDecode(m[1]).trim();

  m = text.match(/(\d+\s*(?:yrs?|years?)\s*post[- ]handover)/i);
  if (m) return m[1].replace(/\s+/g, " ").trim();

  return "";
}

function extractDownPayment(html, plainText) {
  const text = `${html}\n${plainText}`;

  // "Downpayment 12%" or "Down Payment 12%"
  let m = text.match(/down\s*payment[^0-9%]{0,40}(\d{1,2})\s*%/i);
  if (m) return `${m[1]}%`;

  // centered blocks e.g. <strong>12%</strong> ... <strong>Down Payment</strong>
  const pairs = [];
  const strongs = [...String(html || "").matchAll(/<strong>(.*?)<\/strong>/gi)].map((x) =>
    stripHtml(x[1]).trim()
  );
  for (let i = 0; i < strongs.length - 1; i++) {
    pairs.push([strongs[i], strongs[i + 1]]);
  }
  for (const [a, b] of pairs) {
    if (/^\d{1,2}%$/.test(a) && /down\s*payment/i.test(b)) return a;
    if (/^\d{1,2}%$/.test(b) && /down\s*payment/i.test(a)) return b;
  }

  return "";
}

function extractAcceptedPaymentMethods(html) {
  const methods = [];
  const strongs = [...String(html || "").matchAll(/<strong>(.*?)<\/strong>/gi)].map((m) =>
    stripHtml(m[1]).trim()
  );

  const allowed = new Set([
    "Cash",
    "Bank Transfer",
    "Bitcoin",
    "Credit Card",
    "Cheque",
    "Cheques",
  ]);

  for (const s of strongs) {
    const t = titleCase(s);
    if (allowed.has(t)) methods.push(t);
  }

  return [...new Set(methods)];
}

function extractAmenities(html) {
  const amenities = [];

  // Try ul.live type2 first
  const ulMatches = [...String(html || "").matchAll(/<ul[^>]*class="[^"]*\blive\b[^"]*"[^>]*>([\s\S]*?)<\/ul>/gi)];
  for (const ul of ulMatches) {
    const liMatches = [...ul[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)];
    for (const li of liMatches) {
      const item = stripHtml(li[1]).trim();
      if (item) amenities.push(item);
    }
  }

  // Fallback generic amenity-like bullets if none found
  if (!amenities.length) {
    const genericUl = [...String(html || "").matchAll(/<ul[^>]*>([\s\S]*?)<\/ul>/gi)];
    for (const ul of genericUl) {
      const liMatches = [...ul[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)];
      for (const li of liMatches) {
        const item = stripHtml(li[1]).trim();
        if (!item) continue;
        if (item.length > 70) continue;
        if (/bedroom|sq\.?ft|starting price|payment|completion/i.test(item)) continue;
        amenities.push(item);
      }
    }
  }

  return [...new Set(amenities)];
}

function extractNearbyAttractions(html) {
  const out = [];
  const strongs = [...String(html || "").matchAll(/<p[^>]*>\s*<strong>(.*?)<\/strong>\s*<\/p>/gi)].map((m) =>
    stripHtml(m[1]).trim()
  );

  for (const s of strongs) {
    if (!s) continue;
    // Filter out payment/floorplan/payment-method labels
    if (
      /^\d+%$/.test(s) ||
      /down payment|during construction|on handover|post handover/i.test(s) ||
      /cash|bank transfer|bitcoin|credit card|cheques?/i.test(s) ||
      /bedroom apartment|size:/i.test(s) ||
      /faq/i.test(s)
    ) {
      continue;
    }

    let type = "landmark";
    if (/beach/i.test(s)) type = "beach";
    else if (/marina/i.test(s)) type = "marina";
    else if (/walk/i.test(s)) type = "park";
    else if (/golf/i.test(s)) type = "landmark";
    else if (/waterpark/i.test(s)) type = "landmark";

    out.push({ name: s, type, distance: "" });
  }

  // dedupe
  const seen = new Set();
  return out.filter((x) => {
    const k = normalizeText(x.name);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function extractUnitTypes(html, plainText) {
  const found = new Set();

  // "1, 2, 3, and 4-bedroom"
  const pattern1 = /(\d)\s*[- ]?bedroom/gi;
  let m;
  while ((m = pattern1.exec(plainText))) {
    found.add(`${m[1]} Bedroom`);
  }

  // explicit labels from centered strongs or bullets:
  // "1 Bedroom Apartment", "Studio Apartment"
  const labels = [...`${html}\n${plainText}`.matchAll(/\b(Studio|\d)\s*Bedroom(?:\s+Apartment)?\b/gi)];
  for (const l of labels) {
    const raw = l[0];
    if (/studio/i.test(raw)) found.add("Studio");
    else {
      const n = raw.match(/\d/)[0];
      found.add(`${n} Bedroom`);
    }
  }

  // "1-4br"
  const brRange = plainText.match(/\b(\d)\s*[-–]\s*(\d)\s*br\b/i);
  if (brRange) {
    const start = Number(brRange[1]);
    const end = Number(brRange[2]);
    for (let i = start; i <= end; i++) found.add(`${i} Bedroom`);
  }

  const ordered = [...found].sort((a, b) => {
    const va = /studio/i.test(a) ? 0 : Number((a.match(/\d+/) || ["99"])[0]);
    const vb = /studio/i.test(b) ? 0 : Number((b.match(/\d+/) || ["99"])[0]);
    return va - vb;
  });

  return ordered;
}

function extractUnitSizeRange(html, plainText) {
  const nums = [];

  // "Size: 746 Sqft" and "Size: 1133 – 1277 Sqft"
  const reSize = /size\s*:\s*([\d,]+)(?:\s*[–-]\s*([\d,]+))?\s*sq\.?\s*ft/gi;
  let m;
  while ((m = reSize.exec(`${html}\n${plainText}`))) {
    nums.push(Number(String(m[1]).replace(/,/g, "")));
    if (m[2]) nums.push(Number(String(m[2]).replace(/,/g, "")));
  }

  // "653.58 to 2,449.65 Sq.Ft"
  const reGeneral = /([\d,]+(?:\.\d+)?)\s*(?:to|[-–])\s*([\d,]+(?:\.\d+)?)\s*sq\.?\s*ft/gi;
  while ((m = reGeneral.exec(`${html}\n${plainText}`))) {
    nums.push(Math.round(Number(String(m[1]).replace(/,/g, ""))));
    nums.push(Math.round(Number(String(m[2]).replace(/,/g, ""))));
  }

  const valid = nums.filter((n) => Number.isFinite(n) && n >= 150 && n <= 20000);
  if (!valid.length) return { min: null, max: null };

  return {
    min: Math.min(...valid),
    max: Math.max(...valid),
  };
}

function extractShortOverview(plainText, projectName) {
  if (!plainText) return "";
  // Grab first meaningful paragraph-ish chunk
  const chunks = plainText
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => s.length > 40)
    .filter((s) => !/register your details/i.test(s));

  if (!chunks.length) return "";

  let p = chunks[0];
  if (p.length > 320) p = p.slice(0, 317).trim() + "...";
  if (!/[.!?]$/.test(p)) p += ".";
  return p;
}

function extractFaqsFromPlainText(plainText) {
  // Handles inline FAQ block like:
  // What Is ...? Answer ... What Amenities ...? Answer ...
  const faqs = [];
  const text = String(plainText || "").replace(/\s+/g, " ").trim();
  if (!/faq/i.test(text) && !/\?/.test(text)) return faqs;

  const qRegex = /([A-Z][^?]{10,200}\?)/g;
  const matches = [...text.matchAll(qRegex)];
  for (let i = 0; i < matches.length; i++) {
    const q = matches[i][1].trim();
    const start = matches[i].index + q.length;
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
    const ans = text.slice(start, end).trim();

    if (ans.length < 20) continue;
    if (q.length > 220) continue;
    if (faqs.length >= 12) break;

    faqs.push({
      question: q,
      answer: ans.replace(/\s+/g, " "),
    });
  }

  // Basic dedupe
  const seen = new Set();
  return faqs.filter((f) => {
    const k = normalizeText(f.question);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function extractYouTubeUrl(html) {
  const m = String(html || "").match(
    /<iframe[^>]+src=["'](https?:\/\/(?:www\.)?youtube\.com\/embed\/[^"']+)["']/i
  );
  if (!m) return "";
  // Keep embed or convert to watch? embed is okay
  return m[1];
}

function cleanFullDescription(html) {
  // Remove obvious junk encoded blobs while preserving actual HTML
  let out = String(html || "");

  // remove massive encoded lines that are not human-readable
  out = out
    .split(/\r?\n/)
    .filter((line) => {
      const t = line.trim();
      if (!t) return true;
      const looksEncoded = /^[A-Za-z0-9%+/=]{200,}$/.test(t);
      return !looksEncoded;
    })
    .join("\n");

  // normalize repeated duplicate paragraphs (common in scraped imports)
  const paragraphs = out.split(/\n+/);
  const seen = new Set();
  const rebuilt = [];
  for (const p of paragraphs) {
    const key = normalizeText(stripHtml(p));
    if (key && key.length > 30) {
      if (seen.has(key)) continue;
      seen.add(key);
    }
    rebuilt.push(p);
  }

  return rebuilt.join("\n").trim();
}

function mapFloorPlansToNormalized(project) {
  const floorPlans = Array.isArray(project.floorPlans) ? project.floorPlans : [];
  if (!floorPlans.length) return [];

  return floorPlans
    .map((fp) => {
      if (!fp) return null;
      if (typeof fp === "string") {
        return {
          bedrooms: "",
          category: "",
          size: "",
          unitInfo: "",
          imageUrl: fp,
        };
      }
      return {
        bedrooms: fp.bedrooms || "",
        category: fp.category || "",
        size: fp.size || "",
        unitInfo: fp.unitInfo || "",
        imageUrl: fp.imageUrl || fp.url || "",
      };
    })
    .filter(Boolean)
    .filter((fp) => fp.imageUrl || fp.unitInfo || fp.bedrooms);
}

function extractFieldCandidates(project, communities) {
  const html = buildParseableHtml(project.fullDescription || "");
  const cleanHtml = cleanFullDescription(html);
  const plainText = stripHtml(cleanHtml);

  const matchedCommunity = detectCommunityFromProject(project, communities);

  const unitSize = extractUnitSizeRange(cleanHtml, plainText);
  const unitTypes = extractUnitTypes(cleanHtml, plainText);

  const candidates = {
    community: matchedCommunity?.name || "",
    city: matchedCommunity?.city || "",
    country: matchedCommunity?.country || "",
    startingPrice: extractStartingPrice(cleanHtml, plainText),
    completionDate: extractCompletionDate(cleanHtml, plainText),
    titleType: extractTitleType(cleanHtml, plainText),
    paymentPlanSummary: extractPaymentPlanSummary(cleanHtml, plainText),
    downPayment: extractDownPayment(cleanHtml, plainText),
    acceptedPaymentMethods: extractAcceptedPaymentMethods(cleanHtml),
    amenities: extractAmenities(cleanHtml),
    nearbyAttractions: extractNearbyAttractions(cleanHtml),
    unitTypes,
    unitSizeMin: unitSize.min,
    unitSizeMax: unitSize.max,
    shortOverview: extractShortOverview(plainText, project.name),
    faqs: extractFaqsFromPlainText(plainText),
    videoUrl: extractYouTubeUrl(cleanHtml),
    fullDescription: cleanHtml,
    floorPlans: mapFloorPlansToNormalized(project),
  };

  return { candidates, plainText };
}

/* ------------------------------ UPDATE LOGIC ------------------------------- */

function isBlank(v) {
  if (v == null) return true;
  if (typeof v === "string") return v.trim() === "";
  if (Array.isArray(v)) return v.length === 0;
  return false;
}

function shouldFixAddress(address) {
  const a = String(address || "").trim();
  return !a || a === "0,0,0" || /^0(?:\s*,\s*0){1,}$/.test(a);
}

function buildProjectUpdate(project, candidates) {
  const set = {};
  const unset = {};

  const fillIfMissing = (field, value) => {
    if (value == null) return;
    if (typeof value === "string" && !value.trim()) return;
    if (Array.isArray(value) && !value.length) return;
    if (isBlank(project[field])) set[field] = value;
  };

  const replaceIfPlaceholder = (field, value, isPlaceholderFn) => {
    if (value == null) return;
    if (typeof value === "string" && !value.trim()) return;
    if (Array.isArray(value) && !value.length) return;
    if (isPlaceholderFn(project[field])) set[field] = value;
  };

  // Core fills
  fillIfMissing("community", candidates.community);
  fillIfMissing("city", candidates.city);
  fillIfMissing("country", candidates.country);

  // If status says under construction but completion date in past, keep as-is (no business logic overwrite)
  fillIfMissing("startingPrice", candidates.startingPrice);
  fillIfMissing("completionDate", candidates.completionDate);
  fillIfMissing("titleType", candidates.titleType);
  fillIfMissing("paymentPlanSummary", candidates.paymentPlanSummary);
  fillIfMissing("downPayment", candidates.downPayment);

  // Arrays
  fillIfMissing("acceptedPaymentMethods", candidates.acceptedPaymentMethods);
  fillIfMissing("amenities", candidates.amenities);
  fillIfMissing("nearbyAttractions", candidates.nearbyAttractions);
  fillIfMissing("unitTypes", candidates.unitTypes);
  fillIfMissing("faqs", candidates.faqs);

  // numeric size range
  if ((project.unitSizeMin == null || project.unitSizeMin === "") && candidates.unitSizeMin) {
    set.unitSizeMin = candidates.unitSizeMin;
  }
  if ((project.unitSizeMax == null || project.unitSizeMax === "") && candidates.unitSizeMax) {
    set.unitSizeMax = candidates.unitSizeMax;
  }

  // Description cleanup: replace if it contains huge encoded garbage
  if (
    typeof project.fullDescription === "string" &&
    /[A-Za-z0-9%+/=]{400,}/.test(project.fullDescription) &&
    candidates.fullDescription &&
    candidates.fullDescription !== project.fullDescription
  ) {
    set.fullDescription = candidates.fullDescription;
  }

  // shortOverview fill
  fillIfMissing("shortOverview", candidates.shortOverview);

  // video URL (your UI checks project.videoUrl)
  fillIfMissing("videoUrl", candidates.videoUrl);

  // floorPlans normalize shape (if array exists but malformed for UI)
  if (Array.isArray(project.floorPlans) && project.floorPlans.length && Array.isArray(candidates.floorPlans)) {
    const hasObjectShape = project.floorPlans.some((fp) => fp && typeof fp === "object" && fp.imageUrl);
    if (!hasObjectShape && candidates.floorPlans.length) {
      set.floorPlans = candidates.floorPlans;
    } else if (hasObjectShape) {
      // Keep, but optionally normalize missing imageUrl fields
      const normalized = candidates.floorPlans;
      const changed =
        JSON.stringify(project.floorPlans) !== JSON.stringify(normalized) &&
        normalized.some((fp) => fp.imageUrl);
      if (changed) set.floorPlans = normalized;
    }
  }

  // Fix broken address placeholder only if we have community/city
  if (shouldFixAddress(project.address)) {
    const parts = [candidates.community || project.community, candidates.city || project.city, candidates.country || project.country]
      .filter(Boolean)
      .map((s) => String(s).trim());
    if (parts.length) set.address = parts.join(", ");
  }

  // Fill googleMapsUrl/mapUrl if empty and community/city available? (optional, no API key generation here)
  // We avoid setting potentially invalid URLs automatically.

  // Keep timestamps
  set.updatedAt = new Date().toISOString();

  if (!Object.keys(set).length && !Object.keys(unset).length) return null;
  return { $set: set, ...(Object.keys(unset).length ? { $unset: unset } : {}) };
}

function summarizeChanges(before, updateDoc) {
  const changes = [];
  if (!updateDoc || !updateDoc.$set) return changes;

  for (const [k, v] of Object.entries(updateDoc.$set)) {
    if (k === "updatedAt") continue;
    const oldV = before[k];
    const oldStr =
      Array.isArray(oldV) ? `[${oldV.length}]` : oldV == null ? "null" : String(oldV).slice(0, 80);
    const newStr =
      Array.isArray(v) ? `[${v.length}]` : v == null ? "null" : String(v).slice(0, 80);
    if (oldStr !== newStr) changes.push(`${k}: ${oldStr} -> ${newStr}`);
  }
  return changes;
}

/* ------------------------------- MAIN SCRIPT ------------------------------- */

async function main() {
  console.log("Starting project fixer...");
  console.log(`DRY_RUN=${CONFIG.DRY_RUN}`);
  console.log(`Mongo: ${CONFIG.MONGODB_URI} / ${CONFIG.MONGODB_DB}.${CONFIG.MONGODB_COLLECTION}`);

  let communities = [];
  try {
    communities = loadCommunitiesFromCsv(CONFIG.COMMUNITIES_POSTS_CSV, CONFIG.COMMUNITIES_META_CSV);
    console.log(`Loaded ${communities.length} communities from CSV exports`);
  } catch (e) {
    console.warn(`Could not load communities CSVs: ${e.message}`);
    console.warn("Community matching will be skipped.");
  }

  const client = new MongoClient(CONFIG.MONGODB_URI);
  await client.connect();

  try {
    const db = client.db(CONFIG.MONGODB_DB);
    const col = db.collection(CONFIG.MONGODB_COLLECTION);

    const query = {};
    if (CONFIG.ONLY_SLUG) query.slug = CONFIG.ONLY_SLUG;

    let cursor = col.find(query);

    if (CONFIG.LIMIT > 0) {
      cursor = cursor.limit(CONFIG.LIMIT);
    }

    let processed = 0;
    let updated = 0;
    let skipped = 0;
    let errored = 0;

    while (await cursor.hasNext()) {
      const project = await cursor.next();
      processed++;

      try {
        const { candidates } = extractFieldCandidates(project, communities);
        const updateDoc = buildProjectUpdate(project, candidates);

        if (!updateDoc) {
          skipped++;
          if (processed % 25 === 0) {
            console.log(`Processed ${processed} (updated ${updated}, skipped ${skipped})`);
          }
          continue;
        }

        const changes = summarizeChanges(project, updateDoc);
        console.log(
          `\n[${processed}] ${project.slug || project.name || project._id}\n` +
            (changes.length ? `  - ${changes.join("\n  - ")}` : "  - Changes detected")
        );

        if (!CONFIG.DRY_RUN) {
          await col.updateOne({ _id: project._id }, updateDoc);
        }

        updated++;

        if (processed % 25 === 0) {
          console.log(`Processed ${processed} (updated ${updated}, skipped ${skipped})`);
        }
      } catch (e) {
        errored++;
        console.error(
          `Error processing ${project.slug || project._id}:`,
          e && e.stack ? e.stack : e
        );
      }
    }

    console.log("\nDone.");
    console.log(`Processed: ${processed}`);
    console.log(`Updated:   ${updated}`);
    console.log(`Skipped:   ${skipped}`);
    console.log(`Errored:   ${errored}`);
    console.log(`Mode:      ${CONFIG.DRY_RUN ? "DRY RUN (no DB writes)" : "WRITE"}`);
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});