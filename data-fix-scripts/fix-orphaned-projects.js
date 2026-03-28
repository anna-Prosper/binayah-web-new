/**
 * Fix Orphaned Projects — remap community values
 * 
 * Handles:
 *   1. Name variants → canonical community name
 *   2. Developer names → need manual mapping (skip for now)
 *   3. Unarchive communities that have projects
 *   4. Create missing communities
 * 
 * Usage:
 *   node fix-orphaned-projects.js --dry-run
 *   node fix-orphaned-projects.js
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env' });
if (!process.env.MONGODB_URI) require('dotenv').config({ path: '.env.local' });

const DRY = process.argv.includes('--dry-run');

// ═══════════════════════════════════════════════════════
//  COMMUNITY REMAPS — project.community → correct name
// ═══════════════════════════════════════════════════════
const REMAP = {
  // ── Name variants → canonical ──
  'Mohammad Bin Rashid City':      'Mohammed Bin Rashid City',
  'Dubai Design District (D3)':    'Dubai Design District',
  'Madinat Jumeirah Living (MJL)': 'Madinat Jumeirah Living',
  'Barsha Heights (Tecom)':        'Barsha Heights',
  'The world Islands':             'The World Islands',
  'Dubai Media City':              'Dubai Media City (DMC)',
  'World Trade Center':            'Dubai World Trade Centre',
  'DIFC Living':                   'DIFC',
  'Meydan Group':                  'Meydan',
  'Port Rashid':                   'Mina Rashid',
  'Al Khawaneej':                  'Khawaneej',
  'Warsan 4':                      'Warsan',
  'Creek':                         'Dubai Creek Harbour',
  'Reem':                          'Reem Community',
  'Dubai Peninsula':               'Downtown Dubai',
  'Falcon City':                   'Falcon City of Wonders',

  // ── These ARE real communities, just got archived wrongly ──
  // Will be unarchived/created in step 2
  // 'Akoya Damac Hills' → keep as-is, unarchive
  // 'Dubailand' → keep as-is, unarchive 
  // 'Damac Hills 2' → keep as-is, unarchive
  // 'Arabian Ranches 2' → keep as-is, unarchive
  // 'Sobha Hartland 2' → keep as-is, unarchive
  // 'Arabaian Ranches 3' → keep as-is, unarchive (typo but keep for now)
  // 'Uptown' → keep, unarchive
  // 'Damac Island' → keep, unarchive
  // 'Dubai Land Residence Complex (DLRC)' → keep, unarchive
  // 'Dubai' → keep, unarchive
  // 'Dubai Holding' → ?? (3 projects, needs manual check)
  // 'Grand Polo Club and Resort' → keep, unarchive
};

// Communities that exist in projects but were wrongly archived
// These should be unarchived
const UNARCHIVE = [
  'Akoya Damac Hills',
  'Dubailand',
  'Damac Hills 2',
  'Arabian Ranches 2',
  'Sobha Hartland 2',
  'Arabaian Ranches 3',
  'Uptown',
  'Damac Island',
  'Dubai Land Residence Complex (DLRC)',
  'Dubai',
  'Grand Polo Club and Resort',
  'The Wilds',
  'The World Islands',
];

// Developer names used as community — these projects need
// individual review, but we can try to look at project.developer
// to find the real community
const DEVELOPER_COMMUNITIES = [
  'Emaar Properties',     // 42 projects
  'Damac Properties',     // 28 projects
  'Azizi Developments',   // 23 projects
  'Aldar Properties',     // 15 projects
  'Binghatti Developers', // 14 projects
  'Samana Developers',    // 8 projects
  'Reportage Properties', // 8 projects
  'Majid Al Futtaim',     // 8 projects
  'Sobha Group',          // 7 projects
  'Tiger Group',          // 6 projects
  'Wasl Properties',      // 6 projects
  'Nakheel',              // 6 projects
  'Meraas',               // 5 projects
  'Nshama',               // 4 projects
  'Ellington',            // 4 projects
  'Imtiaz Developments',  // 3 projects
  'Iman Developers',      // 3 projects
  'Pantheon Development', // 3 projects
  'Select Group',         // 3 projects
  'MAG Property Development', // 3 projects
  'Invest Group Overseas (IGO)', // 3 projects
  'Dubai Properties',     // 2 projects
  'Deyaar',               // 2 projects
  'Danube Properties',    // 2 projects
  'Prescott Real Estate Development', // 2 projects
  'TownX Development',    // 1 project
  'London Gate',          // 1 project
  'ARADA Developer',      // 1 project
  'Arsenal East Development', // 1 project
  'OMNIYAT',              // 1 project
  'DECA Properties',      // 1 project
  'Vincitore Real Estate Development LLC', // 1 project
  'ZaZEN Property Development LLC', // 1 project
  'Green Yard Properties',// 1 project
  'IMKAN Properties',     // 1 project
];

// NULL projects — need manual review
// 'NULL' — 49 projects with no community

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  Fix Orphaned Projects');
  console.log('═══════════════════════════════════════════════\n');
  if (DRY) console.log('  🏃 DRY RUN\n');

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('binayah_website_new');

  let totalFixed = 0;

  // ═══ STEP 1: Remap name variants ═══
  console.log('━━━ Step 1: Remap community name variants ━━━\n');

  for (const [from, to] of Object.entries(REMAP)) {
    const count = await db.collection('projects').countDocuments({ community: from });
    if (count === 0) continue;

    console.log(`  "${from}" → "${to}" (${count} projects)`);
    if (!DRY) {
      await db.collection('projects').updateMany(
        { community: from },
        { $set: { community: to } }
      );
    }
    totalFixed += count;
  }

  // ═══ STEP 2: Unarchive communities that have projects ═══
  console.log('\n━━━ Step 2: Unarchive/create communities with projects ━━━\n');

  // Also check all orphaned project communities
  const orphanedComms = await db.collection('projects').aggregate([
    { $match: { publishStatus: 'Published' } },
    { $group: { _id: '$community', count: { $sum: 1 } } },
  ]).toArray();

  const activeComms = new Set(
    (await db.collection('communities').find(
      { publishStatus: { $ne: 'Archived' } },
      { projection: { name: 1 } }
    ).toArray()).map(c => c.name)
  );

  for (const { _id: name, count } of orphanedComms) {
    if (!name || name === 'NULL' || name === 'null') continue;
    if (activeComms.has(name)) continue;
    if (DEVELOPER_COMMUNITIES.includes(name)) continue; // skip devs for now

    // Try unarchive first
    const archived = await db.collection('communities').findOne({ name, publishStatus: 'Archived' });
    if (archived) {
      console.log(`  🔓 Unarchive "${name}" (${count} projects)`);
      if (!DRY) {
        await db.collection('communities').updateOne(
          { _id: archived._id },
          { $set: { publishStatus: 'Published', projectCount: count, updatedAt: new Date() } }
        );
      }
      totalFixed += count;
    } else {
      // Create new community doc
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      console.log(`  ➕ Create "${name}" (${count} projects)`);
      if (!DRY) {
        await db.collection('communities').insertOne({
          name,
          slug,
          description: '',
          featuredImage: '',
          metaTitle: `Properties in ${name} | Dubai Real Estate`,
          metaDescription: `Explore properties for sale and rent in ${name}, Dubai.`,
          publishStatus: 'Published',
          viewCount: 0,
          projectCount: count,
          featured: false,
          order: 100,
          tier: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      totalFixed += count;
    }
  }

  // ═══ STEP 3: Handle developer-as-community ═══
  console.log('\n━━━ Step 3: Developer names as community ━━━\n');

  let devOrphans = 0;
  for (const dev of DEVELOPER_COMMUNITIES) {
    const projects = await db.collection('projects').find(
      { community: dev, publishStatus: 'Published' },
      { projection: { name: 1, developer: 1, community: 1, _id: 1 } }
    ).toArray();

    if (projects.length === 0) continue;

    console.log(`  ⚠️  "${dev}" (${projects.length} projects):`);
    for (const p of projects.slice(0, 3)) {
      console.log(`      - ${p.name} (developer: ${p.developer || 'none'})`);
    }
    if (projects.length > 3) console.log(`      ... and ${projects.length - 3} more`);
    devOrphans += projects.length;
  }
  console.log(`\n  Total dev-orphan projects: ${devOrphans}`);
  console.log('  → These need manual review to assign correct community\n');

  // ═══ STEP 4: Recount all communities ═══
  console.log('━━━ Step 4: Recount all communities ━━━\n');

  const allComms = await db.collection('communities').find(
    { publishStatus: { $ne: 'Archived' } }
  ).toArray();

  for (const comm of allComms) {
    const count = await db.collection('projects').countDocuments({
      community: comm.name, publishStatus: 'Published'
    });
    if (!DRY) {
      await db.collection('communities').updateOne(
        { _id: comm._id },
        { $set: { projectCount: count } }
      );
    }
  }
  console.log(`  Recounted ${allComms.length} communities`);

  // ═══ STEP 5: Final audit ═══
  console.log('\n━━━ Step 5: Final audit ━━━\n');

  const finalOrphans = await db.collection('projects').aggregate([
    { $match: { publishStatus: 'Published' } },
    { $lookup: {
      from: 'communities',
      let: { commName: '$community' },
      pipeline: [
        { $match: { $expr: { $eq: ['$name', '$$commName'] }, publishStatus: { $ne: 'Archived' } } }
      ],
      as: 'commDoc'
    }},
    { $match: { commDoc: { $size: 0 } } },
    { $group: { _id: '$community', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]).toArray();

  const remainingOrphans = finalOrphans.reduce((s, o) => s + o.count, 0);

  console.log(`  Fixed: ${totalFixed} projects`);
  console.log(`  Remaining orphans: ${remainingOrphans}`);
  if (remainingOrphans > 0) {
    for (const o of finalOrphans) {
      console.log(`    ${String(o.count).padStart(4)} | "${o._id}"`);
    }
  }

  // Total matched
  const totalProj = await db.collection('projects').countDocuments({ publishStatus: 'Published' });
  console.log(`\n  Total projects: ${totalProj}`);
  console.log(`  Matched: ${totalProj - remainingOrphans} (${((totalProj - remainingOrphans) / totalProj * 100).toFixed(1)}%)`);

  console.log('\n✅ Done');
  await client.close();
}

main().catch(e => { console.error('❌', e); process.exit(1); });