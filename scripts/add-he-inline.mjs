// Codemod: add a Hebrew (he) branch to every inline locale ternary of the form
//   locale === "vi" ? "VI" : "EN"
// becomes
//   locale === "vi" ? "VI" : locale === "he" ? "HE" : "EN"
// HE is a fresh OpenAI translation of the EN fallback string.
// Translations are cached in scripts/he-inline.json (resumable).
// Run: node scripts/add-he-inline.mjs
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = path.resolve(process.cwd());
const CACHE = path.join(ROOT, "scripts/he-inline.json");
const shared = fs.readFileSync("/Users/zoop/.env.shared", "utf8");
const OPENAI_API_KEY = (shared.split("\n").find((l) => l.startsWith("OPENAI_API_KEY=")) || "").slice("OPENAI_API_KEY=".length).trim();
if (!OPENAI_API_KEY) { console.error("no key"); process.exit(1); }

// Double-quoted JS string literal: "(?:\\.|[^"\\])*"
const STR = `"(?:\\\\.|[^"\\\\])*"`;
const RE = new RegExp(`locale === "vi"\\s*\\?\\s*(${STR})\\s*:\\s*(${STR})`, "g");

const FILES = execSync(`grep -rl 'locale === "vi"' src/app --include="*.tsx"`, { cwd: ROOT })
  .toString().trim().split("\n").filter(Boolean);

// 1) Collect unique EN fallback strings (parsed values, no quotes)
const enSet = new Set();
const fileMatches = {};
for (const f of FILES) {
  const src = fs.readFileSync(path.join(ROOT, f), "utf8");
  const ms = [...src.matchAll(RE)];
  fileMatches[f] = ms.length;
  for (const m of ms) {
    const en = JSON.parse(m[2]); // m[2] is the EN literal incl. quotes
    enSet.add(en);
  }
}
console.log(`files: ${FILES.length}, total ternaries: ${Object.values(fileMatches).reduce((a,b)=>a+b,0)}, unique EN strings: ${enSet.size}`);

// 2) Translate (cached)
let cache = {};
if (fs.existsSync(CACHE)) { try { cache = JSON.parse(fs.readFileSync(CACHE, "utf8")); } catch {} }
const todo = [...enSet].filter((s) => !cache[s]);
console.log(`to translate: ${todo.length} (cached: ${enSet.size - todo.length})`);

const SYSTEM = `You translate short English real-estate website strings (page titles, meta descriptions, hero copy, breadcrumbs) for the Dubai/UAE market into natural, fluent modern Hebrew.
RULES:
- Return ONLY a JSON object mapping each input English string to its Hebrew translation. Keys must be the EXACT English inputs.
- Preserve any {placeholder} tokens exactly.
- Keep brand/place names in Latin: Binayah, Dubai, Abu Dhabi, Sharjah, Ras Al Khaimah (RAK), Aldar, Emaar, Damac, DLD, AED, Wynn Resort, Al Marjan Island, Mina Al Arab, Yas Island, Saadiyat, Al Reem Island, Aljada, Tilal City, Masaar, Business Bay, DIFC, etc.
- "Off-plan" → "על הנייר" in prose, keep "Off-plan" as a short label. "Golden Visa" → "ויזת זהב".
- Keep numbers, %, and units intact.
- Hebrew is RTL; no directionality control characters.`;

async function translateBatch(batch) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: "gpt-4o", temperature: 0.2, response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: `Translate each of these strings to Hebrew. Return a JSON object keyed by the exact English string:\n\n${JSON.stringify(batch, null, 2)}` },
      ],
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0,200)}`);
  const data = await res.json();
  return JSON.parse(data.choices[0].message.content);
}

const BATCH = 15;
for (let i = 0; i < todo.length; i += BATCH) {
  const batch = todo.slice(i, i + BATCH);
  process.stdout.write(`translating ${i + 1}-${i + batch.length} / ${todo.length} ... `);
  let got = null;
  for (let a = 1; a <= 4; a++) {
    try { got = await translateBatch(batch); break; }
    catch (e) { console.error(`\n  attempt ${a}: ${e.message}`); if (a === 4) throw e; await new Promise(r=>setTimeout(r,1500*a)); }
  }
  let missing = 0;
  for (const en of batch) {
    if (got[en] && typeof got[en] === "string") cache[en] = got[en];
    else missing++;
  }
  fs.writeFileSync(CACHE, JSON.stringify(cache, null, 2));
  console.log(`done${missing ? ` (${missing} missing, will retry next run)` : ""}`);
}

// 3) Apply replacements
let totalReplaced = 0, totalSkipped = 0;
for (const f of FILES) {
  const fp = path.join(ROOT, f);
  let src = fs.readFileSync(fp, "utf8");
  let replaced = 0, skipped = 0;
  src = src.replace(RE, (full, viLit, enLit) => {
    const en = JSON.parse(enLit);
    const he = cache[en];
    if (!he) { skipped++; return full; }
    replaced++;
    return `locale === "vi" ? ${viLit} : locale === "he" ? ${JSON.stringify(he)} : ${enLit}`;
  });
  if (replaced) fs.writeFileSync(fp, src);
  totalReplaced += replaced; totalSkipped += skipped;
  if (replaced || skipped) console.log(`  ${f}: +${replaced}${skipped ? ` (skipped ${skipped})` : ""}`);
}
console.log(`\nDONE — inserted ${totalReplaced} he branches, skipped ${totalSkipped}`);
