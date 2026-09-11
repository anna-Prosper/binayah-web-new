/**
 * scripts/translate-deal-check-guides.ts
 *
 * Merges per-locale translations into the `translations` map on each guide doc.
 *
 * Why this matters for SEO: a guide is only indexable (self-canonical, own
 * hreflang entry) in a locale whose BODY is actually translated — see
 * translatedLocalesForGuideDoc in lib/guide-i18n. Until then the locale is
 * noindex,follow and canonicalises to English, which is correct but means six
 * of seven locales earn nothing. Writing a real body flips that on.
 *
 *   npx tsx --tsconfig tsconfig.json scripts/translate-deal-check-guides.ts
 */

import { MongoClient } from "mongodb";
import fs from "fs";
import path from "path";

const SCRATCH =
  process.env.GUIDES_DIR ??
  "/private/tmp/claude-503/-Users-zoop-All-home-folders-binayah-properties/0e63b8c6-f053-4c28-8306-c42abc3f40cf/scratchpad";

const LOCALES = ["ru", "fr", "ar", "zh", "vi", "he"];

function mongoUriFromEnvShared(): { uri: string; db: string } {
  const line = fs
    .readFileSync("/Users/zoop/.env.shared", "utf8")
    .split("\n")
    .find((l) => l.startsWith("MONGODB_URI="));
  if (!line) throw new Error("MONGODB_URI not found in .env.shared");
  const srv = line.slice("MONGODB_URI=".length).trim().replace(/^["']|["']$/g, "");
  const m = srv.match(/^mongodb\+srv:\/\/([^:]+):([^@]+)@([^/?]+)(?:\/([^?]*))?/);
  if (!m) throw new Error("Could not parse MONGODB_URI");
  const [, user, pass, host, dbInUri] = m;
  const hosts = ["ac-0zufr86-shard-00-00", "ac-0zufr86-shard-00-01", "ac-0zufr86-shard-00-02"]
    .map((h) => `${h}.${host.split(".").slice(1).join(".")}:27017`)
    .join(",");
  const db = process.env.DB_NAME || dbInUri || "binayah_web_new_dev";
  return {
    uri: `mongodb://${user}:${pass}@${hosts}/${db}?ssl=true&replicaSet=atlas-ex610l-shard-0&authSource=admin&retryWrites=true&w=majority`,
    db,
  };
}

interface Fields {
  title: string;
  description: string;
  body: string;
  faq: { question: string; answer: string }[];
}

async function main() {
  const english: { slug: string; faq: unknown[]; body: string }[] = JSON.parse(
    fs.readFileSync(path.join(SCRATCH, "articles.json"), "utf8"),
  );
  const enBySlug = new Map(english.map((a) => [a.slug, a]));

  const { uri, db } = mongoUriFromEnvShared();
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 30000 });
  await client.connect();
  const col = client.db(db).collection("guides");

  for (const locale of LOCALES) {
    const file = path.join(SCRATCH, `guides_${locale}.json`);
    if (!fs.existsSync(file)) {
      console.log(`${locale}: no file, skipping`);
      continue;
    }
    const byslug: Record<string, Fields> = JSON.parse(fs.readFileSync(file, "utf8"));

    for (const [slug, fields] of Object.entries(byslug)) {
      const en = enBySlug.get(slug);
      if (!en) {
        console.log(`  ${locale}/${slug}: not an English guide, skipping`);
        continue;
      }
      // FAQ merges POSITIONALLY against the English array — a different length
      // silently pairs the wrong question with the wrong answer.
      if (fields.faq.length !== en.faq.length) {
        console.error(`  ${locale}/${slug}: faq length ${fields.faq.length} != ${en.faq.length} — REFUSING`);
        continue;
      }
      if (!fields.body?.trim()) {
        console.error(`  ${locale}/${slug}: empty body — REFUSING`);
        continue;
      }

      await col.updateOne(
        { slug },
        {
          $set: {
            [`translations.${locale}.title`]: fields.title,
            [`translations.${locale}.description`]: fields.description,
            [`translations.${locale}.body`]: fields.body,
            [`translations.${locale}.faq`]: fields.faq,
            updatedAt: new Date(),
          },
        },
      );
      console.log(`  ${locale}/${slug}: merged (${fields.body.split(/\s+/).length} words)`);
    }
  }

  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
