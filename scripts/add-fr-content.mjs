// Add an `fr:` CONTENT block to funnel landing pages by translating their `en:` block.
// Brace-matches the `en: { ... }` object inside `const CONTENT = {`, evals it to a
// JS object, translates values to French (chunked, placeholder-safe), and inserts a
// `fr: {...},` block right after `const CONTENT = {`. Idempotent: skips files that
// already have an `fr:` block. Run: node scripts/add-fr-content.mjs
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd());
const FILES = [
  "src/app/[locale]/buy/page.tsx",
  "src/app/[locale]/off-plan/page.tsx",
  "src/app/[locale]/rent/page.tsx",
  "src/app/[locale]/sell/page.tsx",
];
const OPENAI_API_KEY = (fs.readFileSync("/Users/zoop/.env.shared", "utf8").split("\n").find((l) => l.startsWith("OPENAI_API_KEY=")) || "").slice("OPENAI_API_KEY=".length).trim();
if (!OPENAI_API_KEY) { console.error("no key"); process.exit(1); }
const MAX_LEAVES = 25;

const SYSTEM = `You are a professional French (Français) localization expert for a premium Dubai/UAE real-estate website. Translate JSON values from English to natural, formal, fluent French (polite vouvoiement register).
RULES:
1. Output ONLY a valid JSON object with the EXACT same keys/nesting/array-lengths as input. Never add/remove/reorder keys.
2. Translate ONLY string values. Preserve EVERY placeholder exactly: {count},{name},{price},{area}, ICU plural/select structures.
3. Keep brand/proper nouns Latin & untranslated: Binayah, Dubai, Abu Dhabi, Aldar, Emaar, Damac, DLD, RERA, AED, USD, JVC, "Golden Visa". "Off-plan" → "sur plan" in prose.
4. Vocabulary: apartment=appartement, villa=villa, townhouse=maison de ville, real estate=immobilier, property=bien, bedroom=chambre, area=superficie, buy=acheter, rent=louer, sell=vendre, mortgage=prêt immobilier, developer=promoteur, community=quartier, yield=rendement, freehold=pleine propriété, capital gains tax=impôt sur les plus-values.
5. Keep AED, numbers, %, units intact. Return raw JSON only, no markdown fences.`;

const countLeaves = (n) => Array.isArray(n) ? n.reduce((s, x) => s + countLeaves(x), 0) : (n && typeof n === "object") ? Object.values(n).reduce((s, x) => s + countLeaves(x), 0) : 1;

function validateShape(en, fr, p) {
  if (Array.isArray(en)) { if (!Array.isArray(fr) || en.length !== fr.length) throw new Error(`${p}: array mismatch`); en.forEach((x, i) => validateShape(x, fr[i], `${p}[${i}]`)); return; }
  if (en && typeof en === "object") { if (!fr || typeof fr !== "object") throw new Error(`${p}: expected object`); for (const k of Object.keys(en)) { if (!(k in fr)) throw new Error(`${p}.${k}: missing`); validateShape(en[k], fr[k], `${p}.${k}`); } }
}

async function callOpenAI(name, obj) {
  const userPrompt = `Translate the VALUES of this JSON path "${name}" to French per the rules. Return same structure:\n\n${JSON.stringify(obj, null, 2)}`;
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify({ model: "gpt-4o", temperature: 0.2, response_format: { type: "json_object" }, messages: [{ role: "system", content: SYSTEM }, { role: "user", content: userPrompt }] }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 150)}`);
      const parsed = JSON.parse((await res.json()).choices[0].message.content);
      validateShape(obj, parsed, name);
      return parsed;
    } catch (err) { console.error(`    [${name}] attempt ${attempt}: ${err.message}`); if (attempt === 5) throw err; await new Promise((r) => setTimeout(r, 1200 * attempt)); }
  }
}

async function translateNode(name, node) {
  if (node === null || typeof node !== "object") return (await callOpenAI(name, { _: node }))._;
  if (countLeaves(node) <= MAX_LEAVES) return Array.isArray(node) ? (await callOpenAI(name, { _: node }))._ : await callOpenAI(name, node);
  if (Array.isArray(node)) { const out = []; for (let i = 0; i < node.length; i++) out.push(await translateNode(`${name}[${i}]`, node[i])); return out; }
  const out = {}; for (const k of Object.keys(node)) out[k] = await translateNode(`${name}.${k}`, node[k]); return out;
}

// Brace-match the object literal starting at the `{` at/after `fromIdx`.
function extractBlock(src, fromIdx) {
  const start = src.indexOf("{", fromIdx);
  let depth = 0, inStr = false, q = "", esc = false;
  for (let i = start; i < src.length; i++) {
    const c = src[i];
    if (inStr) { if (esc) esc = false; else if (c === "\\") esc = true; else if (c === q) inStr = false; continue; }
    if (c === '"' || c === "'" || c === "`") { inStr = true; q = c; continue; }
    if (c === "{") depth++;
    else if (c === "}") { depth--; if (depth === 0) return { start, end: i + 1, text: src.slice(start, i + 1) }; }
  }
  throw new Error("unbalanced braces");
}

async function main() {
  for (const rel of FILES) {
    const p = path.join(ROOT, rel);
    let src = fs.readFileSync(p, "utf8");
    const anchor = src.indexOf("const CONTENT = {");
    if (anchor === -1) { console.log(`skip (no CONTENT) ${rel}`); continue; }
    if (/^\s*fr:\s*\{/m.test(src.slice(anchor, anchor + 50000))) { console.log(`skip (fr exists) ${rel}`); continue; }
    const enIdx = src.indexOf("en:", anchor);
    if (enIdx === -1) { console.log(`skip (no en:) ${rel}`); continue; }
    const { text } = extractBlock(src, enIdx);
    const enObj = new Function(`return (${text})`)();
    process.stdout.write(`translating ${rel} (${countLeaves(enObj)} leaves) ... `);
    const frObj = await translateNode("CONTENT.fr", enObj);
    // Serialize as a 2-space-indented `fr:` block sitting inside `const CONTENT = {`
    const body = JSON.stringify(frObj, null, 2).split("\n").map((l, i) => i === 0 ? l : "  " + l).join("\n");
    const insertAt = src.indexOf("\n", anchor) + 1; // right after `const CONTENT = {\n`
    src = src.slice(0, insertAt) + `  fr: ${body},\n` + src.slice(insertAt);
    fs.writeFileSync(p, src);
    console.log("done");
  }
  console.log("ALL CONTENT BLOCKS DONE");
}
main().catch((e) => { console.error("FATAL:", e.message); process.exit(1); });
