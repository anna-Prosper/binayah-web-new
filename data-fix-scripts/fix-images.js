/**
 * Fix images in MongoDB from WordPress CSV exports.
 *
 * Usage:
 *   1. Place projects_images.csv and articles_images.csv in ./exports or project root
 *   2. Run: node fix-images.js
 *
 * Requires: mongoose + dotenv (already in your project)
 */

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error("❌ MONGODB_URI not found in .env.local");
  process.exit(1);
}

// ---------- Helpers ----------

function normalizeSlug(value) {
  return String(value || "").trim().toLowerCase();
}

function cleanString(value) {
  return String(value || "").trim();
}

function uniqueArray(arr) {
  return [...new Set(arr)];
}

function resolveCsvPath(filename) {
  const candidates = [
    path.join(process.cwd(), filename),
    path.join(process.cwd(), "exports", filename),
    path.join(__dirname, filename),
    path.join(__dirname, "exports", filename),
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

// Simple CSV parser (no extra deps)
function parseCSV(filename) {
  const filePath = resolveCsvPath(filename);
  if (!filePath) {
    console.warn(`⚠️  ${filename} not found (checked root + /exports), skipping`);
    return [];
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split(/\r?\n/);
  if (lines.length < 2) return [];

  // Remove BOM if present
  const rawHeaders = parseCSVLine(lines[0]).map((h) =>
    h.replace(/^\uFEFF/, "").trim().replace(/^"|"$/g, "")
  );

  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line || !line.trim()) continue;

    const values = parseCSVLine(line);
    const row = {};

    rawHeaders.forEach((h, idx) => {
      row[h] = (values[idx] || "").replace(/^"|"$/g, "").trim();
    });

    rows.push(row);
  }

  return rows;
}

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      // Escaped quote ("")
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

async function updateBySlug({
  db,
  collectionName,
  rows,
  rowTypeLabel,
  progressEvery,
  buildUpdate,
}) {
  const collection = db.collection(collectionName);

  let processed = 0;
  let matched = 0;
  let modified = 0;
  let skipped = 0;
  let notFound = 0;

  const total = rows.length;
  if (!total) {
    console.log(`📄 ${rowTypeLabel}: 0 rows`);
    return { processed, matched, modified, skipped, notFound };
  }

  console.log(`📄 ${rowTypeLabel}: ${total} rows`);

  // Debug sample
  const dbSample = await collection.findOne({}, { projection: { slug: 1, _id: 0 } });
  const csvSample = rows[0]?.slug;
  console.log(`DB slug example (${collectionName}):`, dbSample?.slug);
  console.log(`CSV slug example (${rowTypeLabel}):`, csvSample);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    processed++;

    if ((i + 1) % progressEvery === 0 || i === total - 1) {
      process.stdout.write(
        `\r  Processing ${i + 1}/${total} ${rowTypeLabel.toLowerCase()}... ` +
          `(matched: ${matched}, modified: ${modified}, not found: ${notFound}, skipped: ${skipped})`
      );
    }

    const slug = normalizeSlug(row.slug);
    if (!slug) {
      skipped++;
      continue;
    }

    const update = buildUpdate(row);
    if (!update || Object.keys(update).length === 0) {
      skipped++;
      continue;
    }

    // Normalize values before update
    if (typeof update.featuredImage === "string") {
      update.featuredImage = cleanString(update.featuredImage);
    }
    if (Array.isArray(update.imageGallery)) {
      update.imageGallery = uniqueArray(
        update.imageGallery.map(cleanString).filter(Boolean)
      );
    }

    const result = await collection.updateOne(
      {
        $expr: {
          $eq: [{ $toLower: "$slug" }, slug],
        },
      },
      { $set: update }
    );

    if (result.matchedCount > 0) matched++;
    else notFound++;

    if (result.modifiedCount > 0) modified++;
  }

  process.stdout.write("\n");

  console.log(
    `  → ${collectionName}: processed=${processed}, matched=${matched}, modified=${modified}, notFound=${notFound}, skipped=${skipped}\n`
  );

  return { processed, matched, modified, skipped, notFound };
}

// ---------- Main ----------

async function main() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected\n");

  const db = mongoose.connection.db;

  // ===== PROJECTS =====
  const projectRows = parseCSV("projects_images.csv");

  if (projectRows.length > 0) {
    console.log("Projects CSV Headers:", Object.keys(projectRows[0]));
    console.log("Projects first row:", JSON.stringify(projectRows[0]));
  }

  await updateBySlug({
    db,
    collectionName: "projects",
    rows: projectRows,
    rowTypeLabel: "Projects CSV",
    progressEvery: 100,
    buildUpdate: (row) => {
      const update = {};

      const featured = cleanString(row.featured_image);
      if (featured) {
        update.featuredImage = featured;
      }

      const galleryRaw = cleanString(row.gallery_images);
      if (galleryRaw) {
        update.imageGallery = galleryRaw
          .split("|||")
          .map((u) => u.trim())
          .filter(Boolean);
      }

      return update;
    },
  });

  // ===== ARTICLES =====
  const articleRows = parseCSV("articles_images.csv");

  await updateBySlug({
    db,
    collectionName: "articles",
    rows: articleRows,
    rowTypeLabel: "Articles CSV",
    progressEvery: 50,
    buildUpdate: (row) => {
      const slug = normalizeSlug(row.slug);
      const featured = cleanString(row.featured_image);

      if (!slug || !featured) return {};
      return { featuredImage: featured };
    },
  });

  // ===== VERIFY =====
  console.log("--- Verification ---");

  const tilal = await db.collection("projects").findOne(
    { name: /Tilal.*Binghatti/i },
    {
      projection: {
        name: 1,
        slug: 1,
        featuredImage: 1,
        imageGallery: { $slice: 2 },
        _id: 0,
      },
    }
  );
  console.log("Tilal by Binghatti:", JSON.stringify(tilal, null, 2));

  const floarea = await db.collection("projects").findOne(
    { name: /Floarea Lakes/i },
    {
      projection: {
        name: 1,
        slug: 1,
        featuredImage: 1,
        imageGallery: { $slice: 2 },
        _id: 0,
      },
    }
  );
  console.log("Floarea Lakes:", JSON.stringify(floarea, null, 2));

  console.log("\n✅ Done");
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error("❌ Error:", err);
  try {
    await mongoose.disconnect();
  } catch (_) {}
  process.exit(1);
});