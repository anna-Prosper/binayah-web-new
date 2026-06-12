// Codemod pass 2: add he branch to inline locale ternaries whose values are
// FLAT string arrays (SEO keywords):  locale === "vi" ? ["a","b"] : ["c","d"]
// → locale === "vi" ? [...] : locale === "he" ? [HE...] : ["c","d"]
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = path.resolve(process.cwd());
const CACHE = path.join(ROOT, "scripts/he-arrays.json");
const OPENAI_API_KEY = (fs.readFileSync("/Users/zoop/.env.shared","utf8").split("\n").find(l=>l.startsWith("OPENAI_API_KEY="))||"").slice(15).trim();

const STRARR = `\\[(?:\\s*"(?:\\\\.|[^"\\\\])*"\\s*,?\\s*)*\\]`;
const RE = new RegExp(`locale === "vi"\\s*\\?\\s*(${STRARR})\\s*:\\s*(${STRARR})`, "g");
const FILES = execSync(`grep -rl 'locale === "vi"' src/app --include="*.tsx"`, { cwd: ROOT }).toString().trim().split("\n").filter(Boolean);

const enArrays = new Map(); // json(en) -> en array
for (const f of FILES) {
  for (const m of fs.readFileSync(path.join(ROOT,f),"utf8").matchAll(RE)) {
    const en = JSON.parse(m[2]); enArrays.set(JSON.stringify(en), en);
  }
}
console.log(`unique EN keyword arrays: ${enArrays.size}`);

let cache = {};
if (fs.existsSync(CACHE)) { try { cache = JSON.parse(fs.readFileSync(CACHE,"utf8")); } catch {} }

const SYSTEM = `You translate arrays of short English real-estate SEO keyword phrases (Dubai/UAE market) into natural Hebrew search keywords. Return ONLY a JSON object {"items": [...]} with the SAME number of elements, each the Hebrew translation of the corresponding input. Keep brand/place names in Latin (Dubai, Binayah, Aldar, Emaar, AED, Sharjah, Abu Dhabi, RAK, etc.). Keep numbers/units intact.`;

async function translateArr(arr) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method:"POST", headers:{ "Content-Type":"application/json", Authorization:`Bearer ${OPENAI_API_KEY}` },
    body: JSON.stringify({ model:"gpt-4o", temperature:0.2, response_format:{type:"json_object"},
      messages:[{role:"system",content:SYSTEM},{role:"user",content:`Translate to Hebrew, return {"items":[...]} with ${arr.length} elements:\n${JSON.stringify(arr)}`}] }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const out = JSON.parse((await res.json()).choices[0].message.content).items;
  if (!Array.isArray(out) || out.length !== arr.length) throw new Error(`len ${out?.length} != ${arr.length}`);
  return out;
}

for (const [key, arr] of enArrays) {
  if (cache[key]) continue;
  process.stdout.write(`translating array (${arr.length}) ... `);
  for (let a=1;a<=4;a++){ try { cache[key]=await translateArr(arr); break; } catch(e){ console.error(`\n  attempt ${a}: ${e.message}`); if(a===4) throw e; await new Promise(r=>setTimeout(r,1500*a)); } }
  fs.writeFileSync(CACHE, JSON.stringify(cache,null,2)); console.log("done");
}

let total=0;
for (const f of FILES) {
  const fp=path.join(ROOT,f); let src=fs.readFileSync(fp,"utf8"); let n=0;
  src=src.replace(RE,(full,viLit,enLit)=>{ const he=cache[JSON.stringify(JSON.parse(enLit))]; if(!he) return full; n++; return `locale === "vi" ? ${viLit} : locale === "he" ? ${JSON.stringify(he)} : ${enLit}`; });
  if(n){ fs.writeFileSync(fp,src); console.log(`  ${f}: +${n}`); total+=n; }
}
console.log(`\nDONE — inserted ${total} he array branches`);
