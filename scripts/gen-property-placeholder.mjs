// Regenerates the "Photo Coming Soon" missing-image placeholder.
//
// Renders the exact source design (scripts/photo-coming-soon.source.html — a
// self-contained artifact with the Binayah logo + fonts embedded) in headless
// Chromium and screenshots the 1080x1080 card, then writes an optimized WebP.
//
// The filename carries a content hash so the URL changes whenever the design
// changes. Static assets are served `immutable, max-age=1yr`, so reusing a
// filename would leave every browser/CDN pinned to the stale bytes for a year.
// A hashed name makes cache-busting automatic — this script rewrites the
// IMAGE_PLACEHOLDER constant to the new URL, so a design change is one command:
//   npx playwright install chromium   # once
//   node scripts/gen-property-placeholder.mjs
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { chromium } from "playwright";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC_HTML = path.join(ROOT, "scripts/photo-coming-soon.source.html");
const assetsDir = path.join(ROOT, "public/assets");
const SIZE = 1440; // output is square (1:1, matching the source card); crisp on 4:3 cards

// 1. Render the source artifact and screenshot the card.
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 1200 }, deviceScaleFactor: 2 });
await page.goto("file://" + encodeURI(SRC_HTML), { waitUntil: "load" });
await page.waitForSelector('img[alt="Binayah Properties"]', { timeout: 20000 });
await page.waitForTimeout(700); // let embedded fonts settle
const shot = await page.locator('div[style*="width:1080px"]').first().screenshot();
await browser.close();

// 2. Optimize to WebP.
const buf = await sharp(shot).resize(SIZE, SIZE).webp({ quality: 84, effort: 6 }).toBuffer();

// 3. Content-hashed filename — drop previous builds so only the current ships.
const hash = crypto.createHash("sha256").update(buf).digest("hex").slice(0, 8);
const filename = `property-placeholder.${hash}.webp`;
for (const f of fs.readdirSync(assetsDir)) {
  if (/^property-placeholder(\.[0-9a-f]{8})?(-v\d+)?\.webp$/.test(f)) fs.rmSync(path.join(assetsDir, f));
}
fs.writeFileSync(path.join(assetsDir, filename), buf);

// 4. Rewrite the single source-of-truth constant to the new hashed URL.
const imagesTs = path.join(ROOT, "src/lib/images.ts");
const newUrl = `/assets/${filename}`;
const before = fs.readFileSync(imagesTs, "utf8");
const after = before.replace(/(export const IMAGE_PLACEHOLDER = )"[^"]*";/, `$1"${newUrl}";`);
if (after === before) throw new Error("Could not rewrite IMAGE_PLACEHOLDER in src/lib/images.ts");
fs.writeFileSync(imagesTs, after);

console.log("wrote WebP:", filename, buf.length, "bytes");
console.log("IMAGE_PLACEHOLDER ->", newUrl);
