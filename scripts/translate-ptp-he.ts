// One-off: generate `vi` blocks for each entry in PROPERTY_TYPE_PAGES.
// Translates each entry's `en` PropertyTypeLocale to Hebrew and writes
// a JSON map slug -> heLocale to scripts/ptp-he.json for injection.
// Run: node_modules/.bin/tsx scripts/translate-ptp-vi.ts
import fs from "node:fs";
import { PROPERTY_TYPE_PAGES, PropertyTypeLocale } from "../src/lib/property-type-pages";

const shared = fs.readFileSync("/Users/zoop/.env.shared", "utf8");
const keyLine = shared.split("\n").find((l) => l.startsWith("OPENAI_API_KEY="));
const OPENAI_API_KEY = keyLine ? keyLine.slice("OPENAI_API_KEY=".length).trim() : "";

const SYSTEM = `You are a professional Hebrew (עברית) real-estate localization expert for the Dubai / UAE property market.
Translate the VALUES of this JSON object (an English PropertyTypeLocale) into natural, formal, fluent modern Hebrew. Hebrew is right-to-left; write idiomatic Hebrew without directionality control characters.
RULES:
1. Output ONLY valid JSON with the EXACT same keys, nesting, and array lengths. Never add/remove/reorder keys.
2. Translate string values only. Arrays stay arrays (translate each string). Objects keep their keys (metaTitle, metaDesc, h1, h1sub, heroDesc, stats[].n, stats[].label, highlights[].title, highlights[].body, areas[], faqs[].question, faqs[].answer, ctaSearch, keywords[]).
3. metaDesc must stay under ~155 characters.
4. Keep brand/proper nouns and place names UNTRANSLATED (Latin script): Binayah, Dubai, JVC, Marina, Downtown, Business Bay, Palm Jumeirah, DIFC, Aldar, DLD, Emaar, AED, and Dubai community/area names. "Golden Visa" -> "ויזת זהב" in prose, keep recognizable. "Off-plan" -> "על הנייר" in prose, keep "Off-plan" as a short label. "freehold" -> "בעלות מלאה (freehold)".
5. Keep numeric values, currency "AED", percentages, and units exactly (do not convert digits).
6. stats[].n values (like "2,500+", "AED 350K", "5-8%") stay numeric/unchanged; translate only stats[].label.
7. Vocabulary: apartment=דירה, villa=וילה, townhouse=בית טורי, office=משרד, warehouse=מחסן, land=קרקע, penthouse=פנטהאוז, bedroom=חדר שינה, yield=תשואה, rental=השכרה, freehold=בעלות מלאה.
8. Return raw JSON only, no markdown fences.`;

async function translate(en: PropertyTypeLocale): Promise<PropertyTypeLocale> {
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: "gpt-4o",
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: SYSTEM },
            { role: "user", content: JSON.stringify(en, null, 2) },
          ],
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
      const data = await res.json();
      const parsed = JSON.parse(data.choices[0].message.content) as PropertyTypeLocale;
      validate(en, parsed);
      return parsed;
    } catch (e) {
      console.error(`  attempt ${attempt}: ${(e as Error).message}`);
      if (attempt === 4) throw e;
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
  throw new Error("unreachable");
}

function validate(en: unknown, vi: unknown, p = ""): void {
  if (Array.isArray(en)) {
    if (!Array.isArray(vi) || vi.length !== en.length) throw new Error(`${p}: array mismatch`);
    en.forEach((x, i) => validate(x, vi[i], `${p}[${i}]`));
  } else if (en && typeof en === "object") {
    for (const k of Object.keys(en)) {
      if (!(k in (vi as object))) throw new Error(`${p}.${k} missing`);
      validate((en as Record<string, unknown>)[k], (vi as Record<string, unknown>)[k], `${p}.${k}`);
    }
  }
}

async function main() {
  const out: Record<string, PropertyTypeLocale> = {};
  const existingPath = "scripts/ptp-he.json";
  if (fs.existsSync(existingPath)) Object.assign(out, JSON.parse(fs.readFileSync(existingPath, "utf8")));
  for (const page of PROPERTY_TYPE_PAGES) {
    if (out[page.slug]) { console.log(`skip ${page.slug}`); continue; }
    process.stdout.write(`translating ${page.slug} ... `);
    out[page.slug] = await translate(page.en);
    fs.writeFileSync(existingPath, JSON.stringify(out, null, 2));
    console.log("done");
  }
  console.log("ALL DONE");
}
main().catch((e) => { console.error(e); process.exit(1); });
