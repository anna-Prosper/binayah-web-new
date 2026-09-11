/**
 * Re-encode the community hero images to something a web page can actually serve.
 *
 * The images were generated through the kie.ai upscale pipeline and uploaded
 * exactly as that pipeline emitted them. The result, measured across all 215
 * objects under community-images/:
 *
 *   51 files    491 MB   lossless WEBP, 4096x2341, every one named "*.png"
 *  113 files    317 MB   real PNG, up to 2100px
 *   51 files     82 MB   JPEG
 *                891 MB  total, mean 4.1 MB per hero
 *
 * Two costs came out of that. The obvious one is transfer. The one that
 * actually got reported was latency: Next's image optimiser has to fetch AND
 * fully decode the source before it can resize, so the first request for any
 * new (url, width) pair paid a 2.6s S3 fetch plus a lossless-WEBP decode of a
 * 4096px frame. For a newsletter, every Monday's URLs are new, so that cost
 * landed on whoever opened the email first — which is exactly what Ahsan hit.
 *
 * 2560px wide at JPEG q85 is visually indistinguishable from the 4096px
 * lossless source at 1:1 (checked on the Expo dome, the busiest detail in the
 * set) while turning an 11.9 MB file into 774 KB. Nothing on the site renders
 * a hero above 2560 CSS px even on a 2x display, and the optimiser downscales
 * from here anyway.
 *
 * Reads from community-images-original/ — the untouched backup — NOT from the
 * live prefix, so this is idempotent: re-running always starts from pristine
 * sources rather than re-compressing its own output.
 *
 * A file is left byte-for-byte alone when re-encoding would not actually help
 * (already a JPEG, already under the width cap, already smaller than the
 * result) — those only get their Content-Type corrected on upload.
 *
 *   node scripts/optimize-community-heroes.mjs           # encode to a local dir
 *   node scripts/optimize-community-heroes.mjs --limit 5 # try a few first
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const BUCKET = "binayah-media-456051253184-us-east-1-an";
const SRC_PREFIX = "community-images-original";
const BASE = `https://${BUCKET}.s3.us-east-1.amazonaws.com/${SRC_PREFIX}/`;
const MAX_WIDTH = 2560;
const QUALITY = 85;
const CONCURRENCY = 6;

const OUT = process.env.OUT_DIR;
if (!OUT) { console.error("set OUT_DIR"); process.exit(1); }
const li = process.argv.indexOf("--limit");
const LIMIT = li > -1 ? Number(process.argv[li + 1]) : Infinity;

const names = fs.readFileSync(process.env.LIST_FILE, "utf8")
  .split("\n").map((l) => l.trim().split(/\s+/).slice(3).join(" ")).filter(Boolean).slice(0, LIMIT);

fs.mkdirSync(OUT, { recursive: true });
const report = [];

async function one(name) {
  const res = await fetch(BASE + encodeURIComponent(name), { signal: AbortSignal.timeout(180_000) });
  if (!res.ok) { report.push({ name, status: `FETCH ${res.status}` }); return; }
  const src = Buffer.from(await res.arrayBuffer());
  const meta = await sharp(src).metadata();

  const out = await sharp(src)
    .rotate()                                  // honour EXIF before stripping it
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .flatten({ background: "#ffffff" })        // every source checked: no real transparency
    .jpeg({ quality: QUALITY, mozjpeg: true, progressive: true })
    .toBuffer();

  // Don't make an already-fine file worse.
  const keepOriginal = meta.format === "jpeg" && meta.width <= MAX_WIDTH && src.length <= out.length;
  const final = keepOriginal ? src : out;
  fs.writeFileSync(path.join(OUT, name), final);
  const m2 = await sharp(final).metadata();
  report.push({
    name, status: keepOriginal ? "kept" : "re-encoded",
    from: `${meta.format} ${meta.width}x${meta.height} ${(src.length / 1e6).toFixed(1)}MB`,
    to: `${m2.format} ${m2.width}x${m2.height} ${(final.length / 1e6).toFixed(2)}MB`,
    before: src.length, after: final.length,
  });
}

const queue = [...names];
await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
  while (queue.length) {
    const n = queue.shift();
    try { await one(n); } catch (e) { report.push({ name: n, status: `ERR ${e.message}` }); }
    if (report.length % 25 === 0) console.log(`  ${report.length}/${names.length}`);
  }
}));

const ok = report.filter((r) => r.before);
const before = ok.reduce((a, r) => a + r.before, 0);
const after = ok.reduce((a, r) => a + r.after, 0);
const errs = report.filter((r) => !r.before);
console.log(`\n${ok.length} processed, ${report.filter(r=>r.status==="kept").length} left as-is, ${errs.length} error(s)`);
console.log(`${(before / 1e6).toFixed(0)} MB  ->  ${(after / 1e6).toFixed(0)} MB   (${(100 - after / before * 100).toFixed(1)}% smaller)`);
for (const e of errs) console.log(`  ${e.status}  ${e.name}`);
fs.writeFileSync(path.join(OUT, "_report.json"), JSON.stringify(report, null, 2));
