// Codemod: fill missing vi/he keys in flat locale Record objects
// (page metadata titles/descriptions of the form:
//    const titles = { en: "...", ru: "...", ar: "...", zh: "..." }
// Detects consecutive locale-key lines, and if vi or he is missing, translates
// the EN value and inserts the missing key(s) right after the group.
// Run: node scripts/add-he-metadata.mjs
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = path.resolve(process.cwd());
const CACHE = path.join(ROOT, "scripts/he-metadata.json");
const KEY = (fs.readFileSync("/Users/zoop/.env.shared","utf8").split("\n").find(l=>l.startsWith("OPENAI_API_KEY="))||"").slice(15).trim();
const LINE = /^(\s*)(en|ru|ar|zh|vi|he): "((?:\\.|[^"\\])*)",?\s*$/;

const FILES = execSync(`grep -rlE '^\\s*zh: "' src/app --include="*.tsx"`, { cwd: ROOT }).toString().trim().split("\n").filter(Boolean);

// Parse each file into locale-key groups
function parseGroups(lines) {
  const groups = [];
  let cur = null;
  lines.forEach((ln, i) => {
    const m = ln.match(LINE);
    if (m) {
      if (!cur) cur = { start: i, end: i, indent: m[1], keys: {} };
      cur.end = i; cur.keys[m[2]] = m[3];
    } else if (cur) { groups.push(cur); cur = null; }
  });
  if (cur) groups.push(cur);
  return groups;
}

let cache = {};
if (fs.existsSync(CACHE)) { try { cache = JSON.parse(fs.readFileSync(CACHE,"utf8")); } catch {} }

const SYSTEM = `You translate short English real-estate website page titles and meta descriptions (Dubai/UAE market, brand "Binayah Properties") into natural fluent {LANG}.
Return ONLY a JSON object {"t": "<translation>"}. Preserve any {placeholder} tokens. Keep brand/place names in Latin (Binayah, Dubai, Abu Dhabi, Aldar, Emaar, AED, WhatsApp, Bayut, Propertyfinder, etc.). Keep separators like " | " and "—". Keep numbers/units. Meta descriptions stay roughly the same length.`;

async function tr(text, langName) {
  const ck = `${langName}::${text}`;
  if (cache[ck]) return cache[ck];
  for (let a=1;a<=4;a++){
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${KEY}` },
        body: JSON.stringify({ model:"gpt-4o", temperature:0.2, response_format:{type:"json_object"},
          messages:[{role:"system",content:SYSTEM.replace("{LANG}",langName)},{role:"user",content:`Translate to ${langName}, return {"t":"..."}:\n${text}`}] })});
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      const t = JSON.parse((await res.json()).choices[0].message.content).t;
      if (typeof t !== "string" || !t) throw new Error("empty");
      cache[ck]=t; fs.writeFileSync(CACHE, JSON.stringify(cache,null,2)); return t;
    } catch(e){ if(a===4) throw e; await new Promise(r=>setTimeout(r,1200*a)); }
  }
}

function esc(s){ return s.replace(/\\/g,"\\\\").replace(/"/g,'\\"'); }

let totalIns = 0;
for (const f of FILES) {
  const fp = path.join(ROOT, f);
  let lines = fs.readFileSync(fp, "utf8").split("\n");
  // process groups bottom-up so insertion indices stay valid
  const groups = parseGroups(lines).filter(g => g.keys.en && g.keys.zh);
  for (const g of [...groups].reverse()) {
    const need = [];
    if (!g.keys.vi) need.push(["vi", "Vietnamese"]);
    if (!g.keys.he) need.push(["he", "Hebrew"]);
    if (!need.length) continue;
    const ins = [];
    for (const [code, name] of need) {
      const heText = await tr(g.keys.en, name);
      ins.push(`${g.indent}${code}: "${esc(heText)}",`);
      process.stdout.write(`  ${path.basename(path.dirname(f))}/${path.basename(f)} +${code}\n`);
    }
    lines.splice(g.end + 1, 0, ...ins);
    totalIns += ins.length;
  }
  fs.writeFileSync(fp, lines.join("\n"));
}
console.log(`\nDONE — inserted ${totalIns} locale keys`);
