const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const headers = parseCSVLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCSVLine(line);
    const row = {};
    headers.forEach((h, idx) => {
      row[h.trim().replace(/^"|"$/g, '')] = (values[idx] || '').replace(/^"|"$/g, '');
    });
    rows.push(row);
  }
  return rows;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected\n');
  const db = mongoose.connection.db;

  const rows = parseCSV('communities_images.csv');
  console.log(`🏘️  Communities CSV: ${rows.length} rows\n`);

  // Show first few to debug slug matching
  const csvSlugs = rows.slice(0, 3).map(r => r.slug);
  const dbSlugs = await db.collection('communities').find({}, { projection: { slug: 1, _id: 0 } }).limit(3).toArray();
  console.log('CSV slugs:', csvSlugs);
  console.log('DB slugs:', dbSlugs.map(d => d.slug));
  console.log('');

  let updated = 0;
  for (let i = 0; i < rows.length; i++) {
    const { slug, featured_image, gallery_images } = rows[i];
    if (!slug) continue;

    const update = {};
    if (featured_image) {
      update.featuredImage = featured_image;
    }
    if (gallery_images) {
      update.imageGallery = Array.from(
        new Set(
          gallery_images
            .split('|||')
            .map((u) => u.trim())
            .filter(Boolean)
        )
      );
    }
    if (Object.keys(update).length === 0) continue;

    const result = await db.collection('communities').updateOne(
      { slug },
      { $set: update }
    );
    if (result.modifiedCount > 0) updated++;

    if ((i + 1) % 20 === 0 || i === rows.length - 1) {
      process.stdout.write(`\r  Processing ${i + 1}/${rows.length}... (${updated} updated)`);
    }
  }

  console.log(`\n\n  → Updated ${updated} communities`);

  // Verify
  const sample = await db.collection('communities').findOne(
    {},
    { projection: { name: 1, featuredImage: 1, _id: 0 } }
  );
  console.log('\nSample:', JSON.stringify(sample, null, 2));
  console.log('\n✅ Done');
  await mongoose.disconnect();
}

main().catch(err => { console.error('❌', err); process.exit(1); });
