// One-off: translate messages/en.json -> messages/fr.json (natural French, LTR)
// Translates at a bounded leaf-count granularity so the model never drops keys
// on large namespaces. Preserves structure, keys, and ALL placeholders.
// Resumable: re-run to fill only missing/invalid chunks.
// Run: node scripts/translate-fr.mjs
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd());
const EN = JSON.parse(fs.readFileSync(path.join(ROOT, "messages/en.json"), "utf8"));
const OUT_PATH = path.join(ROOT, "messages/fr.json");
const MAX_LEAVES = 25; // chunk size — small enough that gpt-4o never drops keys

const shared = fs.readFileSync("/Users/zoop/.env.shared", "utf8");
const keyLine = shared.split("\n").find((l) => l.startsWith("OPENAI_API_KEY="));
const OPENAI_API_KEY = keyLine ? keyLine.slice("OPENAI_API_KEY=".length).trim() : "";
if (!OPENAI_API_KEY) { console.error("No OPENAI_API_KEY"); process.exit(1); }

const SYSTEM = `You are a professional French (Français) localization expert specializing in real estate and property investment for the Dubai / UAE market.
You translate JSON values from English to natural, formal, fluent modern French for a premium real-estate website. Use the polite register (vouvoiement) when addressing the user.

ABSOLUTE RULES:
1. Output ONLY a valid JSON object with the EXACT same keys and nesting as the input. Never add, remove, rename, or reorder keys.
2. Translate ONLY string VALUES. Keep arrays as arrays (translate each element), objects as objects.
3. Preserve EVERY interpolation placeholder EXACTLY: {count}, {name}, {price}, {min}, {max}, {year}, {area}, {city}, etc. ICU plural/select like "{count, plural, one {# item} other {# items}}" must keep structure — translate only human words inside.
4. Keep brand/proper nouns UNTRANSLATED (Latin): Binayah, Dubai, Abu Dhabi, Sharjah, Ras Al Khaimah, Aldar, DLD, Emaar, Damac, AED, USD. "Golden Visa" → "Golden Visa" (keep as is). "Off-plan" → "sur plan" in prose, keep "Off-plan" as a short badge label.
5. Vocabulary: apartment=appartement, villa=villa, townhouse=maison de ville, penthouse=penthouse, real estate=immobilier, property=bien (immobilier), bedroom=chambre, bathroom=salle de bain, area=superficie, price=prix, buy=acheter, rent=louer, sell=vendre, mortgage=prêt immobilier, developer=promoteur, community=quartier, yield=rendement, investment=investissement, freehold=pleine propriété.
6. Keep "AED" as "AED". Keep numbers, percentages and units intact. Use French typographic conventions naturally (e.g. accents) but do NOT insert non-breaking-space control characters.
7. Return raw JSON only, no markdown fences.`;

function countLeaves(node) {
  if (Array.isArray(node)) return node.reduce((s, x) => s + countLeaves(x), 0);
  if (node && typeof node === "object") return Object.values(node).reduce((s, x) => s + countLeaves(x), 0);
  return 1;
}

function validateShape(en, fr, p) {
  if (Array.isArray(en)) {
    if (!Array.isArray(fr)) throw new Error(`${p}: expected array`);
    if (en.length !== fr.length) throw new Error(`${p}: array len ${fr.length} != ${en.length}`);
    en.forEach((x, i) => validateShape(x, fr[i], `${p}[${i}]`));
    return;
  }
  if (en && typeof en === "object") {
    if (!fr || typeof fr !== "object") throw new Error(`${p}: expected object`);
    for (const k of Object.keys(en)) {
      if (!(k in fr)) throw new Error(`${p}.${k}: missing`);
      validateShape(en[k], fr[k], `${p}.${k}`);
    }
    return;
  }
}

async function callOpenAI(name, obj) {
  const userPrompt = `Translate the VALUES of this JSON path "${name}" to French per the rules. Return same structure:\n\n${JSON.stringify(obj, null, 2)}`;
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: "gpt-4o", temperature: 0.2, response_format: { type: "json_object" },
          messages: [{ role: "system", content: SYSTEM }, { role: "user", content: userPrompt }],
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
      const data = await res.json();
      const parsed = JSON.parse(data.choices[0].message.content);
      validateShape(obj, parsed, name);
      return parsed;
    } catch (err) {
      console.error(`    [${name}] attempt ${attempt}: ${err.message}`);
      if (attempt === 5) throw err;
      await new Promise((r) => setTimeout(r, 1200 * attempt));
    }
  }
}

// Recursively translate a node: small enough → one call; else split by keys.
async function translateNode(name, node, existing) {
  // Reuse existing valid translation if present
  if (existing !== undefined) {
    try { validateShape(node, existing, name); return existing; } catch { /* retranslate */ }
  }
  if (node === null || typeof node !== "object") {
    // primitive — wrap (OpenAI json_object mode needs a top-level object)
    const r = await callOpenAI(name, { _: node });
    return r._;
  }
  if (countLeaves(node) <= MAX_LEAVES) {
    if (Array.isArray(node)) {
      const r = await callOpenAI(name, { _: node });
      return r._;
    }
    return await callOpenAI(name, node);
  }
  // Too big — split
  if (Array.isArray(node)) {
    const out = [];
    for (let i = 0; i < node.length; i++) out.push(await translateNode(`${name}[${i}]`, node[i], existing?.[i]));
    return out;
  }
  const out = {};
  for (const k of Object.keys(node)) {
    out[k] = await translateNode(`${name}.${k}`, node[k], existing?.[k]);
  }
  return out;
}

async function main() {
  let out = {};
  if (fs.existsSync(OUT_PATH)) { try { out = JSON.parse(fs.readFileSync(OUT_PATH, "utf8")); } catch { out = {}; } }
  for (const ns of Object.keys(EN)) {
    try { validateShape(EN[ns], out[ns], ns); console.log(`skip ${ns}`); continue; } catch { /* do it */ }
    process.stdout.write(`translating ${ns} (${countLeaves(EN[ns])} leaves) ... `);
    const t0 = Date.now();
    out[ns] = await translateNode(ns, EN[ns], out[ns]);
    fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2) + "\n");
    console.log(`done (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
  }
  // final full validation
  validateShape(EN, out, "root");
  console.log("ALL DONE — full shape validated");
}

main().catch((e) => { console.error("FATAL:", e.message); process.exit(1); });
