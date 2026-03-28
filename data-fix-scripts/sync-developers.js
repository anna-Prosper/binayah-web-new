/**
 * Sync Developers Collection
 * 
 *   1. Fix collection issues (H&amp;H, remove non-developers)
 *   2. Normalize variant names in projects (Prescott Real Estate → Prescott Real Estate Development)
 *   3. Add all missing developers from projects to collection
 * 
 * Usage:
 *   node sync-developers.js --dry-run
 *   node sync-developers.js
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env' });
if (!process.env.MONGODB_URI) require('dotenv').config({ path: '.env.local' });

const DRY = process.argv.includes('--dry-run');

// Fix in collection
const COLLECTION_FIXES = {
  'H&amp;H Development': 'H&H Development',
};

// Remove from collection (not real developers)
const REMOVE_FROM_COLLECTION = ['Bjarke Ingels Group'];

// Normalize in projects before syncing
const PROJECT_RENAMES = {
  'Prescott Real Estate':    'Prescott Real Estate Development',
  'Dubai South':             '', // community name — clear it
  'AWTAD Real Estate':       'Awtad',
  'Majid Developments':      'Majid Al Futtaim',
};

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  Sync Developers Collection');
  console.log('═══════════════════════════════════════════════\n');
  if (DRY) console.log('  🏃 DRY RUN\n');

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('binayah_website_new');

  // ═══ Step 1: Fix collection ═══
  console.log('━━━ Step 1: Fix developer collection ━━━\n');

  for (const [from, to] of Object.entries(COLLECTION_FIXES)) {
    const doc = await db.collection('developers').findOne({ name: from });
    if (doc) {
      console.log(`  📝 "${from}" → "${to}"`);
      if (!DRY) {
        await db.collection('developers').updateOne({ _id: doc._id }, { $set: { name: to } });
      }
    }
  }

  for (const name of REMOVE_FROM_COLLECTION) {
    const doc = await db.collection('developers').findOne({ name });
    if (doc) {
      console.log(`  🗑️  Remove "${name}"`);
      if (!DRY) {
        await db.collection('developers').deleteOne({ _id: doc._id });
      }
    }
  }

  // ═══ Step 2: Rename in projects ═══
  console.log('\n━━━ Step 2: Fix project developer names ━━━\n');

  for (const [from, to] of Object.entries(PROJECT_RENAMES)) {
    const count = await db.collection('projects').countDocuments({
      publishStatus: 'Published', developerName: from
    });
    if (count > 0) {
      console.log(`  "${from}" → "${to || '(clear)'}" (${count})`);
      if (!DRY) {
        await db.collection('projects').updateMany(
          { publishStatus: 'Published', developerName: from },
          { $set: { developerName: to } }
        );
      }
    }
  }

  // ═══ Step 3: Add missing developers to collection ═══
  console.log('\n━━━ Step 3: Add missing developers ━━━\n');

  const existingDevs = new Set(
    (await db.collection('developers').find({}, { projection: { name: 1 } }).toArray()).map(d => d.name)
  );

  const projectDevs = await db.collection('projects').aggregate([
    { $match: { publishStatus: 'Published', developerName: { $exists: true, $nin: ['', null] } } },
    { $group: { _id: '$developerName', projects: { $sum: 1 } } },
    { $sort: { projects: -1 } }
  ]).toArray();

  const missing = projectDevs.filter(d => !existingDevs.has(d._id));
  console.log(`  Existing in collection: ${existingDevs.size}`);
  console.log(`  Unique in projects:     ${projectDevs.length}`);
  console.log(`  Missing from collection: ${missing.length}\n`);

  let added = 0;
  for (const d of missing) {
    const slug = d._id.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    console.log(`  ➕ "${d._id}" (${d.projects} projects)`);
    if (!DRY) {
      await db.collection('developers').insertOne({
        name: d._id,
        slug,
        description: '',
        featuredImage: '',
        logoImage: '',
        website: '',
        metaTitle: `${d._id} | UAE Developer`,
        metaDescription: `Explore projects by ${d._id}. Browse off-plan and ready properties in the UAE.`,
        publishStatus: 'Published',
        projectCount: d.projects,
        viewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    added++;
  }

  // ═══ Step 4: Recount all developers ═══
  console.log('\n━━━ Step 4: Recount developer projects ━━━\n');

  if (!DRY) {
    const allDevs = await db.collection('developers').find({}).toArray();
    for (const d of allDevs) {
      const cnt = await db.collection('projects').countDocuments({
        developerName: d.name, publishStatus: 'Published'
      });
      await db.collection('developers').updateOne(
        { _id: d._id },
        { $set: { projectCount: cnt } }
      );
    }
    console.log(`  Recounted ${allDevs.length} developers`);
  }

  // ═══ REPORT ═══
  console.log('\n═══════════════════════════════════════════════');
  console.log('  SYNC REPORT');
  console.log('═══════════════════════════════════════════════\n');

  const totalDevs = await db.collection('developers').countDocuments();
  const totalProj = await db.collection('projects').countDocuments({ publishStatus: 'Published' });
  const hasDev = await db.collection('projects').countDocuments({
    publishStatus: 'Published', developerName: { $exists: true, $nin: ['', null] }
  });

  console.log(`  Added:          ${added}`);
  console.log(`  Total devs:     ${totalDevs}`);
  console.log(`  Projects:       ${totalProj}`);
  console.log(`  Has developer:  ${hasDev} (${((hasDev/totalProj)*100).toFixed(1)}%)`);

  // Top 10 by project count
  console.log('\n  Top 10 developers:');
  const top = await db.collection('developers').find(
    {}, { projection: { name: 1, projectCount: 1, _id: 0 } }
  ).sort({ projectCount: -1 }).limit(10).toArray();
  for (const d of top) {
    console.log(`    ${String(d.projectCount).padStart(5)} | ${d.name}`);
  }

  console.log('\n✅ Done');
  await client.close();
}

main().catch(e => { console.error('❌', e); process.exit(1); });