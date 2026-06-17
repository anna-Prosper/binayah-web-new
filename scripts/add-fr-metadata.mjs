// Add an `fr:` entry to every page-level `Record<string, string>` locale map
// (title/description metadata maps) that has locale keys (en+he) but no fr.
// Translates the `en` value to French and inserts `fr:` right after the `{`.
// Idempotent. Run: node scripts/add-fr-metadata.mjs
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = path.resolve(process.cwd());
const OPENAI_API_KEY = (fs.readFileSync("/Users/zoop/.env.shared", "utf8").split("\n").find((l) => l.startsWith("OPENAI_API_KEY=")) || "").slice("OPENAI_API_KEY=".length).trim();
if (!OPENAI_API_KEY) { console.error("no key"); process.exit(1); }

const FILES = execSync(`grep -rl "Record<string, string>" "src/app/[locale]" --include="page.tsx"`, { cwd: ROOT })
  .toString().trim().split("\n").filter(Boolean);

const SYSTEM = `You are a professional French localization expert for a premium Dubai/UAE real-estate website. Translate the given English page <title> or meta description into natural, concise, SEO-friendly French (polite register). Keep brand/proper nouns Latin (Binayah, Dubai→Dubaï, Abu Dhabi, AED, RERA, DLD, "Golden Visa"). Keep the "|" / "—" separators and overall structure if present. "Off-plan"→"sur plan". Return ONLY the translated string as JSON {"t":"..."} — no extra keys.`;

async function translate(en) {
  for (let a = 1; a <= 5; a++) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify({ model: "gpt-4o", temperature: 0.2, response_format: { type: "json_object" }, messages: [{ role: "system", content: SYSTEM }, { role: "user", content: `Translate to French: ${JSON.stringify(en)}` }] }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const t = JSON.parse((await res.json()).choices[0].message.content).t;
      if (typeof t !== "string" || !t) throw new Error("empty");
      return t;
    } catch (e) { if (a === 5) throw e; await new Promise((r) => setTimeout(r, 1000 * a)); }
  }
}

function extractBlock(src, braceIdx) {
  let depth = 0, inStr = false, q = "", esc = false;
  for (let i = braceIdx; i < src.length; i++) {
    const c = src[i];
    if (inStr) { if (esc) esc = false; else if (c === "\\") esc = true; else if (c === q) inStr = false; continue; }
    if (c === '"' || c === "'" || c === "`") { inStr = true; q = c; continue; }
    if (c === "{") depth++;
    else if (c === "}") { depth--; if (depth === 0) return { start: braceIdx, end: i + 1, text: src.slice(braceIdx, i + 1) }; }
  }
  throw new Error("unbalanced");
}

async function main() {
  for (const rel of FILES) {
    const p = path.join(ROOT, rel);
    let src = fs.readFileSync(p, "utf8");
    const re = /Record<string,\s*string>\s*=\s*\{/g;
    const blocks = [];
    let m;
    while ((m = re.exec(src))) {
      const braceIdx = src.indexOf("{", m.index);
      const blk = extractBlock(src, braceIdx);
      let obj;
      try { obj = new Function(`return (${blk.text})`)(); } catch { continue; }
      const keys = Object.keys(obj);
      // Only locale maps: must have en + he and lack fr
      if (keys.includes("en") && keys.includes("he") && !keys.includes("fr") && typeof obj.en === "string") {
        blocks.push({ braceIdx, en: obj.en });
      }
    }
    if (!blocks.length) { console.log(`skip ${rel}`); continue; }
    // Process from last to first so earlier insert offsets stay valid
    blocks.sort((a, b) => b.braceIdx - a.braceIdx);
    for (const b of blocks) {
      const fr = await translate(b.en);
      const insertAt = b.braceIdx + 1;
      src = src.slice(0, insertAt) + `\n  fr: ${JSON.stringify(fr)},` + src.slice(insertAt);
    }
    fs.writeFileSync(p, src);
    console.log(`done ${rel} (+${blocks.length} fr)`);
  }
  console.log("ALL METADATA DONE");
}
main().catch((e) => { console.error("FATAL:", e.message); process.exit(1); });
