// Regenerates the "Photo Coming Soon" missing-image placeholder.
// Renders an SVG composition (green gradient card + white Binayah logo + skyline
// + "PHOTO COMING SOON") to an optimized WebP that overwrites
// public/assets/property-placeholder-v2.webp — the single asset every
// missing-image fallback points to. Run: `node scripts/gen-property-placeholder.mjs`
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const logoRaw = fs.readFileSync(path.join(ROOT, "public/assets/binayah-logo.svg"), "utf8");
// Keep just the inner paths of the logo; embed as a nested <svg> with its own viewBox.
const logoInner = logoRaw
  .replace(/<\?xml[^>]*\?>/i, "")
  .replace(/<svg[^>]*>/i, "")
  .replace(/<\/svg>/i, "")
  .trim();
const LOGO_VB = "800 3370 6500 1400"; // from the source logo
const LOGO_RATIO = 1400 / 6500;

const W = 1024, H = 512;

// Skyline: varying-height bars along the bottom (scaled from the 1080 design).
const bars = [
  [70, 108], [60, 150], [54, 90], [96, 205], [54, 120], [66, 168], [58, 96],
].map(([w, h]) => ({ w: w * (W / 1080), h: h * (H / 1080) }));
const gap = 6 * (W / 1080);
const totalBarsW = bars.reduce((s, b) => s + b.w, 0) + gap * (bars.length - 1);
let bx = (W - totalBarsW) / 2;
const skyline = bars
  .map((b) => {
    const rect = `<rect x="${bx.toFixed(1)}" y="${(H - b.h).toFixed(1)}" width="${b.w.toFixed(1)}" height="${b.h.toFixed(1)}" rx="3" fill="#000000"/>`;
    bx += b.w + gap;
    return rect;
  })
  .join("");

// Logo box (centered stack: logo + label).
const logoW = 300;
const logoH = logoW * LOGO_RATIO;
const gapToText = 30;
const textFont = 15;
const stackH = logoH + gapToText + textFont;
const stackTop = (H - stackH) / 2;
const logoX = (W - logoW) / 2;
const logoY = stackTop;
const textY = stackTop + logoH + gapToText + textFont * 0.5;

const label = "PHOTO COMING SOON";
// Flanking hairlines around the label (widths approximate; text is centered).
const lineW = 40, lineGap = 16, labelHalf = 118; // labelHalf ~ visual half-width of the letter-spaced label
const cx = W / 2;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="${W}" y2="${H}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#1A7A5A"/>
      <stop offset="0.55" stop-color="#0B3D2E"/>
      <stop offset="1" stop-color="#072A1F"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.9" cy="0.1" r="0.6">
      <stop offset="0" stop-color="#D4A847" stop-opacity="0.20"/>
      <stop offset="0.66" stop-color="#D4A847" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="skyfade" x1="0" y1="${H - 170}" x2="0" y2="${H}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#0B3D2E" stop-opacity="0"/>
      <stop offset="1" stop-color="#0B3D2E" stop-opacity="0.35"/>
    </linearGradient>
    <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse">
      <circle cx="1.4" cy="1.4" r="1.4" fill="#FFFFFF" fill-opacity="0.06"/>
    </pattern>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <g opacity="0.16">${skyline}</g>
  <rect x="0" y="${H - 170}" width="${W}" height="170" fill="url(#skyfade)"/>

  <svg x="${logoX}" y="${logoY.toFixed(1)}" width="${logoW}" height="${logoH.toFixed(1)}" viewBox="${LOGO_VB}" preserveAspectRatio="xMidYMid meet">
    ${logoInner}
  </svg>

  <g>
    <line x1="${cx - labelHalf - lineGap - lineW}" y1="${textY.toFixed(1)}" x2="${cx - labelHalf - lineGap}" y2="${textY.toFixed(1)}" stroke="#E8D38A" stroke-opacity="0.55" stroke-width="1"/>
    <text x="${cx}" y="${textY.toFixed(1)}" text-anchor="middle" dominant-baseline="middle"
      font-family="'JetBrains Mono', ui-monospace, monospace" font-size="${textFont}" font-weight="500"
      letter-spacing="4" fill="#E8D38A" fill-opacity="0.9">${label}</text>
    <line x1="${cx + labelHalf + lineGap}" y1="${textY.toFixed(1)}" x2="${cx + labelHalf + lineGap + lineW}" y2="${textY.toFixed(1)}" stroke="#E8D38A" stroke-opacity="0.55" stroke-width="1"/>
  </g>
</svg>`;

// Render an optimized WebP drop-in at the existing placeholder path. The SVG is
// intentionally not written to public/ (it embeds the 63KB logo) — the WebP is
// the shipped asset; re-run this script to regenerate it.
const OUT_WEBP = path.join(ROOT, "public/assets/property-placeholder-v2.webp");
await sharp(Buffer.from(svg), { density: 200 })
  .resize(W, H)
  .webp({ quality: 84, effort: 6 })
  .toFile(OUT_WEBP);
const st = fs.statSync(OUT_WEBP);
console.log("wrote WebP:", OUT_WEBP, st.size, "bytes");
