/**
 * Audit: Find orphaned projects where community doesn't match any community doc
 * Usage: node audit-community-links.js
 */
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env' });
if (!process.env.MONGODB_URI) require('dotenv').config({ path: '.env.local' });

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('binayah_website_new');

  // Get all community names (including archived for reference)
  const allComms = await db.collection('communities').find({}, { projection: { name: 1, publishStatus: 1, oldName: 1, mergedInto: 1 } }).toArray();
  const activeNames = new Set(allComms.filter(c => c.publishStatus !== 'Archived').map(c => c.name));
  const archivedNames = new Map(allComms.filter(c => c.publishStatus === 'Archived').map(c => [c.name, c.mergedInto || c.oldName || '']));

  // Get all distinct community values from projects
  const projCommunities = await db.collection('projects').aggregate([
    { $match: { publishStatus: 'Published' } },
    { $group: { _id: '$community', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]).toArray();

  let orphanTotal = 0;
  const orphans = [];
  const matched = [];

  for (const { _id: name, count } of projCommunities) {
    if (!name || name === 'null' || name === '') {
      orphans.push({ name: name || '(empty)', count, reason: 'No community assigned' });
      orphanTotal += count;
    } else if (activeNames.has(name)) {
      matched.push({ name, count });
    } else if (archivedNames.has(name)) {
      orphans.push({ name, count, reason: `Community archived (mergedInto: ${archivedNames.get(name) || 'none'})` });
      orphanTotal += count;
    } else {
      orphans.push({ name, count, reason: 'NO matching community document' });
      orphanTotal += count;
    }
  }

  console.log('═══════════════════════════════════════════════');
  console.log('  Project ↔ Community Link Audit');
  console.log('═══════════════════════════════════════════════\n');

  console.log(`  ✅ Matched: ${matched.length} communities, ${matched.reduce((s, m) => s + m.count, 0)} projects`);
  console.log(`  ❌ Orphaned: ${orphans.length} values, ${orphanTotal} projects\n`);

  if (orphans.length > 0) {
    console.log('━━━ ORPHANED PROJECTS ━━━\n');
    for (const o of orphans.sort((a, b) => b.count - a.count)) {
      console.log(`  ${String(o.count).padStart(4)} projects | "${o.name}"`);
      console.log(`         → ${o.reason}`);

      // Find closest active community match
      if (o.reason.includes('NO matching')) {
        const lower = (o.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        for (const active of activeNames) {
          const aLower = active.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (aLower.includes(lower) || lower.includes(aLower)) {
            console.log(`         💡 Possible match: "${active}"`);
          }
        }
      }
      console.log();
    }

    // Generate fix commands
    console.log('━━━ SUGGESTED FIXES ━━━\n');
    for (const o of orphans.sort((a, b) => b.count - a.count)) {
      if (o.reason.includes('archived') && archivedNames.get(o.name)) {
        const target = archivedNames.get(o.name);
        if (activeNames.has(target)) {
          console.log(`  db.projects.updateMany({ community: "${o.name}" }, { $set: { community: "${target}" } })  // ${o.count} projects`);
        }
      }
    }
  }

  // Also check: active communities with 0 matching projects
  console.log('\n━━━ ACTIVE COMMUNITIES WITH 0 PROJECTS ━━━\n');
  const projNameSet = new Set(projCommunities.map(p => p._id));
  let ghostCount = 0;
  for (const name of [...activeNames].sort()) {
    if (!projNameSet.has(name)) {
      const comm = allComms.find(c => c.name === name);
      console.log(`  "${name}" — no projects reference this name`);
      ghostCount++;
    }
  }
  if (ghostCount === 0) console.log('  None — all active communities have projects ✅');

  console.log(`\n✅ Audit complete`);
  await client.close();
}

main().catch(e => { console.error('❌', e); process.exit(1); });