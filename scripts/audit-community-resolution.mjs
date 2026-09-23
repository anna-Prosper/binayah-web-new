/**
 * Community name resolution audit.
 *
 * Every pSEO template resolves a community name against a *different* backend
 * vocabulary, and each lookup fails silently — a miss returns null/[] and the
 * page quietly drops a section or renders its "nothing here" state. Nothing
 * errors, nothing fails a type check. Two such bugs shipped:
 *
 *   - /off-plan-in/dubai-south said "No off-plan projects right now" while 94
 *     published Dubai South projects existed (projects use "Dubai South";
 *     apiName was "Dubai South (Dubai World Central)").
 *   - /…-in-jumeirah-lakes-towers and /…-in-mbr-city lost their market-stats
 *     band and FAQ schema across 120 URLs (the matrix calls them "JLT" and
 *     "MBR City"; apiName is "Jumeirah Lake Towers" / "Mohammed Bin Rashid
 *     City").
 *
 * The vocabularies are genuinely different and NOT interchangeable:
 *   projects.community      — short marketing names  ("Dubai South", "JVT")
 *   listings.community      — canonical names        ("Jumeirah Lake Towers")
 *   market-stats matrix     — abbreviations          ("JLT", "MBR City")
 *   DLD areas               — official area names    ("Hadaeq Sheikh …")
 *
 * So this checks each community against each vocabulary separately and reports
 * only the misses that hide real data — a community with genuinely no
 * inventory is not a failure.
 *
 * Run: node scripts/audit-community-resolution.mjs
 * Exits non-zero if a community resolves to nothing in a vocabulary where an
 * alternative spelling WOULD have found data.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const API = process.env.API_BASE || "https://binayah-api.onrender.com";

function env(key) {
  for (const f of ["/Users/zoop/.env.shared", path.join(ROOT, ".env.local")]) {
    try {
      const m = fs.readFileSync(f, "utf8").match(new RegExp(`^${key}=(.*)$`, "m"));
      if (m) return m[1].trim().replace(/^["']|["']$/g, "");
    } catch { /* next */ }
  }
  return "";
}
const KEY = env("API_KEY");

// ── Parse BUY_COMMUNITIES (slug, name, apiName, synonyms) ───────────────────
const src = fs.readFileSync(path.join(ROOT, "src/lib/buy-communities.ts"), "utf8");
const communities = [...src.matchAll(
  /\{\s*slug:\s*"([^"]+)",\s*name:\s*"([^"]+)",([\s\S]*?)(?=\n {2}\{\s*slug:|\n\];)/g,
)].map(([, slug, name, body]) => {
  const api = body.match(/apiName:\s*"([^"]+)"/);
  const syn = body.match(/synonyms:\s*\[([^\]]*)\]/);
  return {
    slug,
    name,
    apiName: api ? api[1] : null,
    synonyms: syn ? [...syn[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]) : [],
  };
});

const norm = (s) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim();
// Candidate spellings to try when the primary misses.
const variants = (c) => [...new Set([c.apiName ?? c.name, ...c.synonyms, c.name])].filter(Boolean);

async function json(url) {
  try {
    const r = await fetch(url, { headers: KEY ? { "x-api-key": KEY } : {} , signal: AbortSignal.timeout(30_000) });
    return r.ok ? await r.json() : null;
  } catch { return null; }
}

// ── Vocabulary probes ───────────────────────────────────────────────────────
const projectCount = async (n) =>
  (await json(`${API}/api/projects?community=${encodeURIComponent(n)}&limit=1`) || []).length;

const listingCount = async (n, type) =>
  (await json(`${API}/api/listings?listingType=${type}&community=${encodeURIComponent(n)}&countOnly=1`))?.total ?? 0;

// market-stats: replicate getCommunityStats' matching (alias → exact → fuzzy).
const stats = await json(`${API}/api/market-stats`);
const rows = stats?.communityMatrix ?? [];
const ALIASES = (() => {
  const m = fs.readFileSync(path.join(ROOT, "src/lib/market.ts"), "utf8")
    .match(/const MARKET_STATS_AREA_ALIASES[^{]*\{([\s\S]*?)\n\};/);
  const out = {};
  if (m) for (const [, k, v] of m[1].matchAll(/"([^"]+)":\s*"([^"]+)"/g)) out[k] = v;
  return out;
})();
function overlap(a, b) {
  const [sh, lo] = a.length <= b.length ? [a, b] : [b, a];
  if (!sh.length) return 0;
  for (let i = 0; i <= lo.length - sh.length; i++)
    if (sh.every((w, j) => lo[i + j] === w)) return sh.length / lo.length;
  return 0;
}
function statsFor(name) {
  if (!rows.length) return null;
  const target = norm(ALIASES[norm(name)] ?? name);
  const exact = rows.find((r) => norm(r.area) === target);
  if (exact) return exact;
  let best = null, bestRatio = 0;
  for (const r of rows) {
    const ratio = overlap(target.split(" "), norm(r.area).split(" "));
    if (ratio >= 0.6 && ratio > bestRatio) { best = r; bestRatio = ratio; }
  }
  return best;
}

// ── Run ─────────────────────────────────────────────────────────────────────
const failures = [];
const genuinelyEmpty = [];

console.log(`Auditing ${communities.length} communities across 4 vocabularies…\n`);

for (const c of communities) {
  const primary = c.apiName ?? c.name;
  const alts = variants(c).filter((v) => v !== primary);

  const checks = [
    { vocab: "projects", probe: projectCount },
    { vocab: "listings:Sale", probe: (n) => listingCount(n, "Sale") },
    { vocab: "listings:Rent", probe: (n) => listingCount(n, "Rent") },
  ];

  for (const { vocab, probe } of checks) {
    if (await probe(primary) > 0) continue;
    let rescued = null;
    for (const alt of alts) {
      if (await probe(alt) > 0) { rescued = alt; break; }
    }
    if (rescued) failures.push({ slug: c.slug, vocab, primary, rescued });
    else genuinelyEmpty.push(`${c.slug} (${vocab})`);
  }

  if (!statsFor(primary)) {
    const rescued = alts.find((a) => statsFor(a));
    if (rescued) failures.push({ slug: c.slug, vocab: "market-stats", primary, rescued });
    else genuinelyEmpty.push(`${c.slug} (market-stats)`);
  }
}

if (failures.length) {
  console.error(`FAIL — ${failures.length} resolution miss(es) hiding real data:\n`);
  for (const f of failures) {
    console.error(`  ${f.slug}  [${f.vocab}]`);
    console.error(`     passes  "${f.primary}"  -> nothing`);
    console.error(`     but     "${f.rescued}"  -> has data`);
  }
  console.error("\nFix: add the spelling to the relevant alias map, or ensure the");
  console.error("caller passes `synonyms` through to the fetch.\n");
}

console.log(`genuinely empty (expected, not a failure): ${genuinelyEmpty.length}`);
if (process.env.VERBOSE) console.log("  " + genuinelyEmpty.join("\n  "));

if (failures.length) process.exit(1);
console.log("\nOK — every community resolves on the name its pages actually pass.\n");
