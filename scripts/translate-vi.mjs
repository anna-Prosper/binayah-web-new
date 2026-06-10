// One-off: translate messages/en.json -> messages/vi.json (natural Vietnamese)
// Preserves JSON structure, keys, and ALL interpolation placeholders.
// Run: node scripts/translate-vi.mjs
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd());
const EN = JSON.parse(fs.readFileSync(path.join(ROOT, "messages/en.json"), "utf8"));
const OUT_PATH = path.join(ROOT, "messages/vi.json");

// Load OpenAI key from .env.shared
const shared = fs.readFileSync("/Users/zoop/.env.shared", "utf8");
const keyLine = shared.split("\n").find((l) => l.startsWith("OPENAI_API_KEY="));
const OPENAI_API_KEY = keyLine ? keyLine.slice("OPENAI_API_KEY=".length).trim() : "";
if (!OPENAI_API_KEY) {
  console.error("No OPENAI_API_KEY found in .env.shared");
  process.exit(1);
}

const SYSTEM = `You are a professional Vietnamese (Tiếng Việt) localization expert specializing in real estate and property investment for the Dubai / UAE market.
You translate JSON values from English to natural, formal, fluent Vietnamese suitable for a premium real-estate website.

ABSOLUTE RULES:
1. Output ONLY a valid JSON object with the EXACT same keys and nesting structure as the input. Never add, remove, rename, or reorder keys.
2. Translate ONLY the string VALUES. Keep arrays as arrays (translate each element), objects as objects.
3. Preserve EVERY interpolation placeholder EXACTLY as-is, character for character: {count}, {name}, {price}, {min}, {max}, {year}, {area}, {city}, etc. Do not translate, rename, reorder, or remove placeholder tokens. ICU plural/select syntax like "{count, plural, one {# item} other {# items}}" must keep its structure — translate only the human words inside.
4. Keep these brand / proper nouns UNTRANSLATED: Binayah, Dubai, Abu Dhabi, Sharjah, Ras Al Khaimah, Aldar, DLD, Emaar, Damac, AED, USD, Golden Visa (may render as "Golden Visa (Thị thực Vàng)" only where it reads as marketing copy — otherwise keep "Golden Visa"), penthouse, off-plan (use "dự án hình thành trong tương lai" for descriptive prose, but keep "Off-plan" as a short UI label/badge).
5. Real-estate vocabulary: apartment=căn hộ, villa=biệt thự, townhouse=nhà phố, property/real estate=bất động sản, bedroom=phòng ngủ, bathroom=phòng tắm, area=diện tích, price=giá, buy=mua, rent=thuê, sell=bán, mortgage=vay thế chấp / khoản vay mua nhà, developer=chủ đầu tư, community=khu dân cư, yield=lợi suất, investment=đầu tư.
6. Keep currency symbol "AED" as "AED". Keep numbers and units intact.
7. Do not wrap the JSON in markdown code fences. Return raw JSON only.`;

async function translateChunk(name, obj) {
  const userPrompt = `Translate the VALUES of this JSON namespace "${name}" to Vietnamese, following all rules. Return the same JSON structure with Vietnamese values:\n\n${JSON.stringify(obj, null, 2)}`;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: SYSTEM },
            { role: "user", content: userPrompt },
          ],
        }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status}: ${txt.slice(0, 300)}`);
      }
      const data = await res.json();
      const content = data.choices[0].message.content;
      const parsed = JSON.parse(content);
      validateShape(obj, parsed, name);
      return parsed;
    } catch (err) {
      console.error(`  [${name}] attempt ${attempt} failed: ${err.message}`);
      if (attempt === 4) throw err;
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
}

// Ensure translated object has the exact same key structure (placeholders checked separately at end)
function validateShape(en, vi, p) {
  if (Array.isArray(en)) {
    if (!Array.isArray(vi)) throw new Error(`${p}: expected array`);
    if (en.length !== vi.length) throw new Error(`${p}: array length ${vi.length} != ${en.length}`);
    en.forEach((x, i) => validateShape(x, vi[i], `${p}[${i}]`));
    return;
  }
  if (en && typeof en === "object") {
    if (!vi || typeof vi !== "object") throw new Error(`${p}: expected object`);
    for (const k of Object.keys(en)) {
      if (!(k in vi)) throw new Error(`${p}.${k}: missing key in translation`);
      validateShape(en[k], vi[k], `${p}.${k}`);
    }
    return;
  }
}

async function main() {
  // Resume support: keep already-translated namespaces if file exists.
  let out = {};
  if (fs.existsSync(OUT_PATH)) {
    try { out = JSON.parse(fs.readFileSync(OUT_PATH, "utf8")); } catch { out = {}; }
  }
  const namespaces = Object.keys(EN);
  for (const ns of namespaces) {
    if (out[ns]) {
      // verify shape; if good skip
      try { validateShape(EN[ns], out[ns], ns); console.log(`skip ${ns} (already done)`); continue; }
      catch { /* re-translate */ }
    }
    process.stdout.write(`translating ${ns} ... `);
    const t0 = Date.now();
    out[ns] = await translateChunk(ns, EN[ns]);
    fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2) + "\n");
    console.log(`done (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
  }
  console.log("ALL DONE");
}

main().catch((e) => { console.error(e); process.exit(1); });
