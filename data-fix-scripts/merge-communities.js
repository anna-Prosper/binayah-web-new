/**
 * Merge Duplicate Communities
 * 
 * Merges variant/duplicate/sub-area communities into canonical ones.
 * For each merge: updates projects, transfers best data, archives old doc.
 * 
 * Usage:
 *   node merge-communities.js --dry-run
 *   node merge-communities.js
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env' });
if (!process.env.MONGODB_URI) require('dotenv').config({ path: '.env.local' });

const DRY = process.argv.includes('--dry-run');

// ═══════════════════════════════════════════════════════
//  MERGE DEFINITIONS — [from, to, reason]
// ═══════════════════════════════════════════════════════
const MERGES = [
  // Typo fix (rename — no target exists yet)
  ['Arabaian Ranches 3', 'Arabian Ranches 3', 'typo fix'],

  // Duplicates
  ['La Mer', 'La Mer Dubai', 'duplicate — generic vs specific'],
  ['World Trade Centre', 'Dubai World Trade Centre', 'duplicate'],
  ['Mirage The Oasis', 'The Oasis by Emaar', 'same community'],

  // Sub-areas → parent
  ['Akoya Oxygen', 'Akoya Damac Hills', 'sub-area'],
  ['Al Yufrah 1', 'The Valley', 'sub-area'],
];

// ═══════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  Merge Duplicate Communities');
  console.log('═══════════════════════════════════════════════\n');
  if (DRY) console.log('  🏃 DRY RUN\n');

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('binayah_website_new');

  const stats = { merged: 0, projectsMoved: 0, archived: 0, renamed: 0 };

  for (const [fromName, toName, reason] of MERGES) {
    console.log(`━━━ "${fromName}" → "${toName}" (${reason}) ━━━\n`);

    // Find source community
    const fromDoc = await db.collection('communities').findOne({
      name: fromName, publishStatus: { $ne: 'Archived' }
    });
    if (!fromDoc) {
      console.log(`  ⚠️  Source "${fromName}" not found or already archived — skip\n`);
      continue;
    }

    // Find target community
    let toDoc = await db.collection('communities').findOne({
      name: toName, publishStatus: { $ne: 'Archived' }
    });

    // If target doesn't exist, this is a RENAME (not merge)
    if (!toDoc) {
      console.log(`  📝 Target "${toName}" doesn't exist — renaming "${fromName}" → "${toName}"`);
      const projCount = await db.collection('projects').countDocuments({
        community: fromName, publishStatus: 'Published'
      });
      console.log(`  Projects: ${projCount}`);

      if (!DRY) {
        // Rename community doc
        await db.collection('communities').updateOne(
          { _id: fromDoc._id },
          { $set: {
            name: toName,
            oldName: fromName,
            slug: toName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
            metaTitle: `Properties in ${toName} | Dubai Real Estate`,
            updatedAt: new Date(),
          }}
        );

        // Update projects
        const res = await db.collection('projects').updateMany(
          { community: fromName },
          { $set: { community: toName } }
        );
        console.log(`  Updated ${res.modifiedCount} projects`);
        stats.projectsMoved += res.modifiedCount;
      }
      stats.renamed++;
      console.log('');
      continue;
    }

    // ═══ MERGE: source → target ═══
    const fromProjects = await db.collection('projects').countDocuments({
      community: fromName, publishStatus: 'Published'
    });
    const toProjects = await db.collection('projects').countDocuments({
      community: toName, publishStatus: 'Published'
    });
    console.log(`  Source: "${fromName}" (${fromProjects} projects)`);
    console.log(`  Target: "${toName}" (${toProjects} projects)`);

    // Transfer best data from source to target (if target is missing)
    const dataTransfer = {};
    if (fromDoc.description && fromDoc.description.length > (toDoc.description || '').length) {
      dataTransfer.description = fromDoc.description;
    }
    if (fromDoc.featuredImage && !toDoc.featuredImage) {
      dataTransfer.featuredImage = fromDoc.featuredImage;
    }
    if (fromDoc.latitude && fromDoc.latitude > 1 && (!toDoc.latitude || toDoc.latitude < 1)) {
      dataTransfer.latitude = fromDoc.latitude;
      dataTransfer.longitude = fromDoc.longitude;
    }

    if (Object.keys(dataTransfer).length > 0) {
      console.log(`  📋 Transferring: ${Object.keys(dataTransfer).join(', ')}`);
      if (!DRY) {
        await db.collection('communities').updateOne(
          { _id: toDoc._id },
          { $set: { ...dataTransfer, updatedAt: new Date() } }
        );
      }
    }

    // Move projects
    if (!DRY) {
      const res = await db.collection('projects').updateMany(
        { community: fromName },
        { $set: { community: toName } }
      );
      console.log(`  ✅ Moved ${res.modifiedCount} projects`);
      stats.projectsMoved += res.modifiedCount;

      // Update target projectCount
      const newCount = await db.collection('projects').countDocuments({
        community: toName, publishStatus: 'Published'
      });
      await db.collection('communities').updateOne(
        { _id: toDoc._id },
        { $set: { projectCount: newCount, updatedAt: new Date() } }
      );
      console.log(`  Target now: ${newCount} projects`);
    } else {
      console.log(`  Would move ${fromProjects} projects`);
    }

    // Archive source
    if (!DRY) {
      await db.collection('communities').updateOne(
        { _id: fromDoc._id },
        { $set: {
          publishStatus: 'Archived',
          mergedInto: toName,
          projectCount: 0,
          updatedAt: new Date(),
        }}
      );
    }
    console.log(`  🗄️  Archived "${fromName}"\n`);
    stats.merged++;
    stats.archived++;
  }

  // ═══ CHECK: "Dubai" and "Dubai Holding" projects ═══
  console.log('━━━ Investigate generic communities ━━━\n');

  for (const genericName of ['Dubai', 'Dubai Holding']) {
    const projects = await db.collection('projects').find(
      { community: genericName, publishStatus: 'Published' },
      { projection: { name: 1, _id: 0 } }
    ).toArray();

    if (projects.length > 0) {
      console.log(`  "${genericName}" (${projects.length} projects):`);
      for (const p of projects) {
        console.log(`    - ${p.name}`);
      }
      console.log('');
    }
  }

  // ═══ FINAL REPORT ═══
  console.log('═══════════════════════════════════════════════');
  console.log('  MERGE REPORT');
  console.log('═══════════════════════════════════════════════\n');

  console.log(`  Merged:          ${stats.merged}`);
  console.log(`  Renamed:         ${stats.renamed}`);
  console.log(`  Projects moved:  ${stats.projectsMoved}`);
  console.log(`  Archived:        ${stats.archived}`);

  const total = await db.collection('communities').countDocuments({ publishStatus: { $ne: 'Archived' } });
  const totalProj = await db.collection('projects').countDocuments({ publishStatus: 'Published' });
  console.log(`\n  Active communities: ${total}`);
  console.log(`  Total projects:     ${totalProj}`);

  console.log('\n✅ Done');
  await client.close();
}

main().catch(e => { console.error('❌', e); process.exit(1); });