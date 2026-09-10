/**
 * Run every community through the real metadata builder and fail on anything
 * Google would truncate or that reads wrong.
 *
 * This exists because four defects sat live on the community pages and none was
 * visible from the code: 61 of 152 said "Dubai" twice ("Arjan Dubai, Dubai"),
 * 47 titles ran past the ~60 characters Google displays, and three described
 * themselves as "homes for sale & rent … from AED 1,656/sqft" — an average rate
 * presented as an entry price. Each was only findable by generating the output
 * for all of them and looking at the distribution.
 *
 * Run it after adding a community or touching src/lib/community-meta.ts.
 *
 *   npx tsx scripts/community-seo-audit.ts [--locale en] [--verbose]
 */
import { buildCommunityMeta, pickPriceFrom } from "../src/lib/community-meta";

const LOCALES = ["en", "fr", "ru", "ar", "zh", "vi", "he"];
const li = process.argv.indexOf("--locale");
const ONLY = li > -1 ? [process.argv[li + 1]] : LOCALES;
const VERBOSE = process.argv.includes("--verbose");

// Google shows roughly 60 characters of a title and 160 of a description.
const TITLE_MAX = 60;
const DESC_MAX = 160;

type Row = {
  slug: string;
  name?: string;
  description?: string;
  enrichment?: { highlights?: { label?: string; value?: string }[]; overview?: string; tagline?: string };
};

/**
 * Straight from Mongo, not the API: the list endpoint omits enrichment and the
 * project counts, and the rate-as-price check needs the highlights.
 */
async function load(): Promise<{ rows: Row[]; counts: Map<string, number> }> {
  const { MongoClient } = await import("mongodb");
  // No dotenv in this repo's script deps; read .env.local directly so the
  // audit runs the same way from a shell or from CI.
  let uri = process.env.MONGODB_URI;
  if (!uri) {
    try {
      const fs = await import("node:fs");
      const env = fs.readFileSync(new URL("../.env.local", import.meta.url), "utf8");
      uri = env.split("\n").find((l) => l.startsWith("MONGODB_URI="))?.slice("MONGODB_URI=".length).trim();
    } catch { /* fall through to the error below */ }
  }
  if (!uri) throw new Error("MONGODB_URI is not set (env or .env.local)");
  const c = new MongoClient(uri);
  await c.connect();
  const db = c.db(process.env.MONGODB_DB || "binayah_web_new_dev");
  const rows = (await db
    .collection("communities")
    .find({}, { projection: { slug: 1, name: 1, description: 1, "enrichment.highlights": 1, "enrichment.overview": 1, "enrichment.tagline": 1 } })
    .toArray()) as unknown as Row[];
  // Project count decides which lead sentence the description uses, so the
  // audit has to see the same number the page will.
  const grouped = (await db
    .collection("projects")
    .aggregate([{ $match: { publishStatus: "published", community: { $nin: ["", null] } } }, { $group: { _id: "$community", n: { $sum: 1 } } }])
    .toArray()) as { _id: string; n: number }[];
  const counts = new Map<string, number>();
  for (const g of grouped) counts.set(String(g._id).toLowerCase(), g.n);
  await c.close();
  return { rows, counts };
}

async function main() {
  const { rows, counts } = await load();
  const problems: string[] = [];
  let checked = 0;

  for (const c of rows) {
    const name = c.name || c.slug;
    const projCount = counts.get(String(name).toLowerCase()) ?? 0;
    const priceFrom = pickPriceFrom(c.enrichment?.highlights);
    const baseDesc = c.description || c.enrichment?.overview || c.enrichment?.tagline || "";

    for (const locale of ONLY) {
      const { title, description } = buildCommunityMeta({ locale, name, projCount, priceFrom, baseDesc });
      checked++;
      const where = `${c.slug} [${locale}]`;

      if (title.length > TITLE_MAX) problems.push(`${where} title ${title.length} chars: ${title}`);
      if (description.length > DESC_MAX) problems.push(`${where} description ${description.length} chars`);
      // The emirate twice in one line is the failure that shipped. Match on a
      // word boundary so "Dubailand … in Dubai" reads as the two different
      // places it is, and check only the lead we generate — the editorial
      // sentence after it is human prose and will mention the city as often as
      // it needs to.
      // Chinese ends a sentence with 。 and no space, so a Latin-only splitter
      // swallowed the editorial sentence into the lead and flagged every zh page.
      const lead = description.split(/(?<=[.!?。！？])\s*/)[0] ?? description;
      for (const city of ["Dubai", "Dubaï", "Дубай", "دبي", "迪拜", "דובאי"]) {
        const re = new RegExp(`(^|[^\\p{L}])${city}([^\\p{L}]|$)`, "giu");
        if ((title.match(re) || []).length > 1) problems.push(`${where} title repeats "${city}": ${title}`);
        if ((lead.match(re) || []).length > 1) problems.push(`${where} lead repeats "${city}": ${lead}`);
      }
      if (/from\s+AED[^.,]*\b(sqft|sqm|sq\s?ft)\b/i.test(description)) {
        problems.push(`${where} quotes a RATE as a from-price: ${description.slice(0, 90)}`);
      }
      if (!title.trim() || !description.trim()) problems.push(`${where} empty title or description`);
      if (VERBOSE && locale === "en") console.log(`  ${String(title.length).padStart(2)}  ${title}`);
    }
  }

  console.log(`\nchecked ${checked} community×locale pages across ${rows.length} communities`);
  if (problems.length) {
    console.log(`\n${problems.length} problem(s):`);
    problems.slice(0, 40).forEach((p) => console.log(`  ${p}`));
    if (problems.length > 40) console.log(`  …and ${problems.length - 40} more`);
    process.exitCode = 1;
  } else {
    console.log("no problems found");
  }
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
