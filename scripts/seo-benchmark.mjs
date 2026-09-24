#!/usr/bin/env node
/**
 * SEO benchmark — measures the things that actually cap organic reach, against
 * the LIVE site, and stores each run so a change can be proven rather than
 * asserted.
 *
 * Why this exists: the Sep 2026 GSC report (440 clicks, avg position 25.9,
 * -38% impressions) said rankings were the ceiling but could not say why. The
 * causes turned out to be measurable on the pages themselves — a 6.8MB hub
 * page, and project descriptions that were 85% absent from the served HTML —
 * and none of them was visible from the code or from a type check.
 *
 * Metrics, and why each one is here:
 *
 *   pageWeight      Document bytes for the key templates. Crawl budget is spent
 *                   on bytes; /pulse/guides was 6.8MB, 11x its neighbours.
 *   descriptionInHtml
 *                   What share of a project's description text actually reaches
 *                   the served HTML. The detail template renders only the first
 *                   block server-side and hides the rest behind a "read more"
 *                   toggle, so the richest unique copy on the core commercial
 *                   template was invisible to a crawler.
 *   longFormCoverage
 *                   Share of project pages carrying a seoArticle. Recent
 *                   projects have one; the older corpus does not, and the gap
 *                   is the real content story behind "Projects -18%".
 *   sitemapUrls     Total URLs. Every group degrades to [] on failure, so a
 *                   silent data-source outage shows up here as a cliff.
 *   rawI18nKeys     Pages rendering "footer.address" instead of copy. next-intl
 *                   fails quietly, so this is the only way to see it.
 *
 * Sampling is a deterministic stride over the sitemap's project URLs, not the
 * API's list endpoint: /api/projects?limit=100 returns only the most recent 100,
 * which are the enriched ones. Measuring those alone reported 75% long-form
 * coverage where the true corpus figure is ~3%.
 *
 * The API rate-limits (HTTP 429). Requests are serialised with a delay and
 * retried on 429 — a concurrent run silently reports missing data as absent
 * content, which is how the 75% figure was first produced.
 *
 *   node scripts/seo-benchmark.mjs                 # run, print, append to history
 *   node scripts/seo-benchmark.mjs --sample 60     # wider project sample
 *   node scripts/seo-benchmark.mjs --compare       # diff against the last run
 *   node scripts/seo-benchmark.mjs --no-save       # don't append to history
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HISTORY = path.join(ROOT, "scripts", "seo-benchmark-history.json");

const SITE = process.env.BENCH_SITE || "https://www.binayah.ae";
const API = process.env.BENCH_API || "https://binayah-api.onrender.com";

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
};
const SAMPLE = Number(arg("sample", 25));
const SAVE = !process.argv.includes("--no-save");
const COMPARE = process.argv.includes("--compare");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const strip = (s) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const pct = (a, b) => (b ? +((100 * a) / b).toFixed(1) : 0);

async function getText(url, init) {
  const res = await fetch(url, { headers: { "Cache-Control": "no-cache", ...(init?.headers || {}) } });
  return { ok: res.ok, status: res.status, text: await res.text() };
}

/** The API 429s under load; a concurrent scan reports rate limits as missing data. */
async function getJson(url, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { "Cache-Control": "no-cache" } });
      if (res.status === 429) {
        const ra = parseInt(res.headers.get("retry-after") || "20", 10);
        await sleep(Math.min(isNaN(ra) ? 20 : ra, 45) * 1000);
        continue;
      }
      if (!res.ok) return null;
      return await res.json();
    } catch {
      await sleep(1500);
    }
  }
  return null;
}

// ─────────────────────────────────────────────────────────── page weight
const WEIGHT_PAGES = [
  "/",
  "/off-plan",
  "/rent",
  "/news",
  "/pulse/guides",
  "/communities",
  "/valuation",
  "/buy-property-in/dubai-marina",
];

async function measureWeight() {
  const out = {};
  for (const p of WEIGHT_PAGES) {
    try {
      const { text, status } = await getText(`${SITE}${p}?cb=${Date.now()}`);
      out[p] = status === 200 ? Math.round(Buffer.byteLength(text, "utf8") / 1024) : null;
    } catch {
      out[p] = null;
    }
    await sleep(200);
  }
  return out; // KB
}

// ─────────────────────────────────────────────── raw i18n keys on live pages
/** next-intl renders "namespace.key" when a namespace is missing from a route's
 *  slice. It never throws, so only the rendered HTML reveals it. */
async function measureRawKeys() {
  const pages = ["/", "/ru", "/ar", "/pulse/guides", "/communities", "/valuation", "/rent"];
  const found = {};
  let total = 0;
  for (const p of pages) {
    try {
      const { text } = await getText(`${SITE}${p}?cb=${Date.now()}`);
      const body = text.replace(/<script[\s\S]*?<\/script>/g, "");
      const keys = [...new Set((body.match(/>[a-z][a-zA-Z]+\.[a-zA-Z_.]+</g) || []).map((k) => k.slice(1, -1)))];
      if (keys.length) found[p] = keys.slice(0, 8);
      total += keys.length;
    } catch {
      /* a fetch failure is not a content defect; leave it out */
    }
    await sleep(200);
  }
  return { total, found };
}

// ─────────────────────────────────────────────────────────────── sitemap
async function measureSitemap() {
  try {
    const { text, status } = await getText(`${SITE}/sitemap.xml`);
    if (status !== 200) return { urls: null, bytes: null, projectUrls: null };
    const urls = (text.match(/<loc>/g) || []).length;
    const projectUrls = new Set(
      (text.match(/https:\/\/www\.binayah\.ae\/project\/[a-z0-9-]+/g) || []).map((u) => u.split("/project/")[1]),
    ).size;
    return { urls, bytes: Buffer.byteLength(text, "utf8"), projectUrls };
  } catch {
    return { urls: null, bytes: null, projectUrls: null };
  }
}

/** Deterministic stride across ALL project slugs — see the header note on why
 *  the API's list endpoint is the wrong sample frame. */
async function projectSample(n) {
  const { text, status } = await getText(`${SITE}/sitemap.xml`);
  if (status !== 200) return [];
  const slugs = [...new Set((text.match(/https:\/\/www\.binayah\.ae\/project\/[a-z0-9-]+/g) || []).map((u) => u.split("/project/")[1]))].sort();
  if (!slugs.length) return [];
  const step = Math.max(1, Math.floor(slugs.length / n));
  const out = [];
  for (let i = 0; i < slugs.length && out.length < n; i += step) out.push(slugs[i]);
  return out;
}

// ────────────────────────── description reaching HTML + long-form coverage
async function measureProjectContent(slugs) {
  let chunksShown = 0;
  let chunksTotal = 0;
  let pagesMeasured = 0;
  let pagesTruncated = 0;
  let withLongForm = 0;
  let longFormChecked = 0;
  const worst = [];

  for (const slug of slugs) {
    const api = await getJson(`${API}/api/projects/${slug}`);
    if (!api) {
      await sleep(250);
      continue;
    }

    longFormChecked++;
    const article = api?.seoArticle?.en?.body;
    if (typeof article === "string" && article.trim()) withLongForm++;

    const desc = strip(api.fullDescription || api.shortOverview || "");
    const words = desc.split(" ").filter(Boolean);
    if (words.length < 40) {
      await sleep(250);
      continue;
    }

    let html;
    try {
      html = (await getText(`${SITE}/project/${slug}?cb=${Date.now()}`)).text;
    } catch {
      await sleep(250);
      continue;
    }
    const visible = strip(html.replace(/<script[\s\S]*?<\/script>/g, ""));

    let present = 0;
    let chunks = 0;
    for (let i = 0; i + 8 <= words.length; i += 8) {
      chunks++;
      if (visible.includes(words.slice(i, i + 8).join(" "))) present++;
    }
    if (!chunks) {
      await sleep(250);
      continue;
    }

    pagesMeasured++;
    chunksShown += present;
    chunksTotal += chunks;
    const share = pct(present, chunks);
    if (share < 80) pagesTruncated++;
    worst.push({ slug, words: words.length, pctInHtml: share });
    await sleep(300);
  }

  worst.sort((a, b) => a.pctInHtml - b.pctInHtml);
  return {
    descriptionInHtml: {
      pagesMeasured,
      chunksShown,
      chunksTotal,
      pctInHtml: pct(chunksShown, chunksTotal),
      pagesTruncated,
      pctPagesTruncated: pct(pagesTruncated, pagesMeasured),
      worst: worst.slice(0, 10),
    },
    longFormCoverage: {
      checked: longFormChecked,
      withArticle: withLongForm,
      pctWithArticle: pct(withLongForm, longFormChecked),
    },
  };
}

// ──────────────────────────────────────────────────────────────── report
function fmtDelta(cur, prev, { lowerIsBetter = false, unit = "" } = {}) {
  if (prev == null || cur == null) return "";
  const d = cur - prev;
  if (d === 0) return "  (unchanged)";
  const better = lowerIsBetter ? d < 0 : d > 0;
  const sign = d > 0 ? "+" : "";
  return `  (${sign}${d.toFixed(unit === "%" ? 1 : 0)}${unit} ${better ? "better" : "worse"})`;
}

const run = {
  at: new Date().toISOString(),
  site: SITE,
  sample: SAMPLE,
};

console.log(`SEO benchmark — ${SITE}`);
console.log(`sampling ${SAMPLE} project pages (deterministic stride over the sitemap)\n`);

run.sitemap = await measureSitemap();
console.log(`sitemap            ${run.sitemap.urls ?? "?"} URLs, ${run.sitemap.bytes ? (run.sitemap.bytes / 1024 / 1024).toFixed(1) : "?"} MB, ${run.sitemap.projectUrls ?? "?"} project pages`);

run.rawI18nKeys = await measureRawKeys();
console.log(`raw i18n keys      ${run.rawI18nKeys.total} across ${Object.keys(run.rawI18nKeys.found).length} page(s)`);
for (const [p, keys] of Object.entries(run.rawI18nKeys.found)) console.log(`                     ${p}: ${keys.join(", ")}`);

run.pageWeight = await measureWeight();
console.log(`\npage weight (KB)`);
for (const [p, kb] of Object.entries(run.pageWeight)) console.log(`   ${String(kb ?? "?").padStart(6)}  ${p}`);

const slugs = await projectSample(SAMPLE);
const content = await measureProjectContent(slugs);
Object.assign(run, content);

const d = run.descriptionInHtml;
console.log(`\ndescription reaching served HTML`);
console.log(`   ${d.pctInHtml}% of text (${d.chunksShown}/${d.chunksTotal} chunks) across ${d.pagesMeasured} pages`);
console.log(`   ${d.pagesTruncated}/${d.pagesMeasured} pages (${d.pctPagesTruncated}%) show under 80% of their description`);
if (d.worst.length) {
  console.log(`   worst:`);
  for (const w of d.worst.slice(0, 5)) console.log(`     ${String(w.pctInHtml).padStart(5)}%  ${String(w.words).padStart(4)}w  ${w.slug}`);
}

const lf = run.longFormCoverage;
console.log(`\nlong-form article coverage`);
console.log(`   ${lf.pctWithArticle}% of sampled project pages (${lf.withArticle}/${lf.checked})`);

// ─────────────────────────────────────────────────────────────── history
let history = [];
if (fs.existsSync(HISTORY)) {
  try {
    history = JSON.parse(fs.readFileSync(HISTORY, "utf8"));
  } catch {
    history = [];
  }
}

if (COMPARE && history.length) {
  const prev = history[history.length - 1];
  console.log(`\n── vs ${prev.at} ──`);
  console.log(`sitemap URLs          ${run.sitemap.urls}${fmtDelta(run.sitemap.urls, prev.sitemap?.urls)}`);
  console.log(`raw i18n keys         ${run.rawI18nKeys.total}${fmtDelta(run.rawI18nKeys.total, prev.rawI18nKeys?.total, { lowerIsBetter: true })}`);
  console.log(`description in HTML   ${d.pctInHtml}%${fmtDelta(d.pctInHtml, prev.descriptionInHtml?.pctInHtml, { unit: "%" })}`);
  console.log(`long-form coverage    ${lf.pctWithArticle}%${fmtDelta(lf.pctWithArticle, prev.longFormCoverage?.pctWithArticle, { unit: "%" })}`);
  for (const [p, kb] of Object.entries(run.pageWeight)) {
    const was = prev.pageWeight?.[p];
    if (kb != null && was != null && kb !== was) console.log(`weight ${p.padEnd(28)} ${kb}KB${fmtDelta(kb, was, { lowerIsBetter: true, unit: "KB" })}`);
  }
}

if (SAVE) {
  history.push(run);
  fs.writeFileSync(HISTORY, JSON.stringify(history, null, 2) + "\n");
  console.log(`\nappended to ${path.relative(ROOT, HISTORY)} (${history.length} run(s))`);
}
