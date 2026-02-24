/**
 * Master Community Matcher
 * 
 * Fixes ALL remaining orphaned projects:
 *   1. Extracts community from project name ("X at JVC, Dubai" → JVC)
 *   2. Sets developer field from old community value
 *   3. Handles NULL community projects
 *   4. Restores archived community data (description, image, etc.)
 *   5. Recounts everything
 * 
 * Usage:
 *   node match-communities.js --dry-run    # preview
 *   node match-communities.js              # apply
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env' });
if (!process.env.MONGODB_URI) require('dotenv').config({ path: '.env.local' });

const DRY = process.argv.includes('--dry-run');

// ═══════════════════════════════════════════════════════
//  ALIAS MAP — extracted text → canonical community name
// ═══════════════════════════════════════════════════════
const ALIASES = {
  // Abbreviations
  'JVC':                'Jumeirah Village Circle',
  'JVT':                'Jumeirah Village Triangle',
  'JLT':                'Jumeirah Lake Towers',
  'JBR':                'Jumeirah Beach Residence',
  'DSO':                'Dubai Silicon Oasis',
  'DIP':                'Dubai Investment Park',
  'MBR City':           'Mohammed Bin Rashid City',
  'MBR':                'Mohammed Bin Rashid City',
  'MBRC':               'Mohammed Bin Rashid City',
  'MJL':                'Madinat Jumeirah Living',
  'DMC':                'Dubai Media City (DMC)',
  'DFC':                'Dubai Festival City',
  'DHCC':               'Dubai Healthcare City',
  'D3':                 'Dubai Design District',
  'SZR':                'Sheikh Zayed Road',

  // Variants
  'Meydan - MBR City':        'Mohammed Bin Rashid City',
  'MBR City, Meydan Dubai':   'Mohammed Bin Rashid City',
  'MBR City, Meydan':         'Mohammed Bin Rashid City',
  'Meydan Horizon':            'Meydan',
  'Meydan Avenue':             'Meydan',
  'Meydan, Dubai':             'Meydan',
  'Town Square Park':          'Town Square',
  'Town Square':               'Town Square',
  'Yas Park Island':           'Yas Island',
  'Yas Park':                  'Yas Island',
  'Yas Park Island, Abu Dhabi':'Yas Island',
  'Reem Island':               'Al Reem Island',
  'Reem Island, Abu Dhabi':    'Al Reem Island',
  'Jumeirah La Mer':           'La Mer Dubai',
  'Bluewaters':                'Bluewaters Island',
  'Bluewaters Island':         'Bluewaters Island',
  'Jebel Ali':                 'Jebel Ali Village',
  'Arjan, Dubailand':          'Arjan',
  'Arjan':                     'Arjan',
  'Dubai Hills':               'Dubai Hills Estate',
  'Jumeirah':                  'Jumeirah 1',
  'Sobha Hartland 2':          'Sobha Hartland 2',
  'Emaar South, Greenview 3':  'Emaar South',
  'Emaar South':               'Emaar South',
  'Dubailand':                 'Dubailand',
  'Wadi Al Safa, Dubailand':   'Wadi Al Safa',
  'Wadi Al Safa':              'Wadi Al Safa',
  'The Next Chapter':          'Dubai South',
  'Mirage The Oasis':          'Mirage The Oasis',
  'Dubai Water Canal':         'Dubai Water Canal',
  'The Opera District, Downtown Dubai': 'Downtown Dubai',
  'The Opera District':        'Downtown Dubai',
  'Port De La Mer':            'Port De La Mer',
  'Palm Jumeirah':             'Palm Jumeirah',
  'Business Bay':              'Business Bay',
  'Downtown Dubai':            'Downtown Dubai',
  'Dubai Marina':              'Dubai Marina',
  'Al Furjan':                 'Al Furjan',
  'Al Sufouh':                 'Al Sufouh',
  'Al Jaddaf':                 'Al Jaddaf',
  'Al Barsha':                 'Al Barsha',
  'Sheikh Zayed Road':         'Sheikh Zayed Road',
  'Mirdif':                    'Mirdif',
  'Mudon':                     'Mudon',
  'Dragon City':               'Dragon City',
  'Tilal Al Ghaf':             'Tilal Al Ghaf',
  'Sobha Hartland':            'Sobha Hartland',
  'Motor City':                'Motor City',
  'Majan':                     'Majan',
  'Dubai Sports City':         'Dubai Sports City',
  'International City':        'International City',
  'Dubai Creek Harbour':       'Dubai Creek Harbour',
  'Jumeirah Golf Estates':     'Jumeirah Golf Estates',
  'Arabian Ranches':           'Arabian Ranches',
  'Arabian Ranches 3':         'Arabian Ranches 3',
  'Liwan':                     'Liwan',
  'The Valley':                'The Valley',
  'Villanova':                 'Villanova',
  'Dubai Science Park':        'Dubai Science Park',
  'Dubai South':               'Dubai South',
  'Expo City':                 'Expo City',
  'Damac Hills':               'Damac Hills',
  'Damac Lagoons':             'Damac Lagoons',
  'City Walk':                 'City Walk',
  'Nad Al Sheba':              'Nad Al Sheba',
  'Jumeirah Park':             'Jumeirah Park',
  'Emaar Beachfront':          'Emaar Beachfront',
  'Dubai Studio City':         'Dubai Studio City',
  'Dubai Production City':     'Dubai Production City',
  'Dubai Silicon Oasis':       'Dubai Silicon Oasis',
  'Dubai Investment Park':     'Dubai Investment Park',
  'Dubai Maritime City':       'Dubai Maritime City',
  'Dubai Islands':             'Dubai Islands',
  'Jumeirah Bay Island':       'Jumeirah Bay Island',
  'Jumeirah Garden City':      'Jumeirah Garden City',
  'Safa Park':                 'Safa Park',
  'Meydan':                    'Meydan',
  'Mina Rashid':               'Mina Rashid',
  'Jumeirah Village Circle':   'Jumeirah Village Circle',
  'Jumeirah Village Triangle': 'Jumeirah Village Triangle',
  'Jumeirah Lake Towers':      'Jumeirah Lake Towers',
  'Mohammed Bin Rashid City':  'Mohammed Bin Rashid City',
  'Yas Island':                'Yas Island',
  'Saadiyat Island':           'Saadiyat Island',
  'Al Reem Island':            'Al Reem Island',
  'Maryam Island':             'Maryam Island',
  'Masaar':                    'Masaar',
  'Aljada':                    'Aljada',
};

// Developer names → proper developer value
const DEVELOPER_MAP = {
  'Emaar Properties':       'Emaar Properties',
  'Damac Properties':       'Damac Properties',
  'Azizi Developments':     'Azizi Developments',
  'Aldar Properties':       'Aldar Properties',
  'Binghatti Developers':   'Binghatti Developers',
  'Samana Developers':      'Samana Developers',
  'Reportage Properties':   'Reportage Properties',
  'Majid Al Futtaim':       'Majid Al Futtaim',
  'Sobha Group':            'Sobha Realty',
  'Tiger Group':            'Tiger Properties',
  'Wasl Properties':        'Wasl Properties',
  'Nakheel':                'Nakheel',
  'Meraas':                 'Meraas',
  'Nshama':                 'Nshama',
  'Ellington':              'Ellington Properties',
  'Imtiaz Developments':    'Imtiaz Developments',
  'Iman Developers':        'Iman Developers',
  'Pantheon Development':   'Pantheon Development',
  'Select Group':           'Select Group',
  'MAG Property Development': 'MAG Property Development',
  'Invest Group Overseas (IGO)': 'IGO',
  'Dubai Properties':       'Dubai Properties',
  'Deyaar':                 'Deyaar',
  'Danube Properties':      'Danube Properties',
  'Prescott Real Estate Development': 'Prescott Real Estate',
  'TownX Development':      'TownX Development',
  'London Gate':             'London Gate',
  'ARADA Developer':         'Arada',
  'Arsenal East Development':'Arsenal East Development',
  'OMNIYAT':                 'Omniyat',
  'DECA Properties':         'DECA Properties',
  'Vincitore Real Estate Development LLC': 'Vincitore',
  'ZaZEN Property Development LLC': 'ZaZEN Properties',
  'Green Yard Properties':   'Green Yard Properties',
  'IMKAN Properties':        'IMKAN',
  'Dubai Holding':           'Dubai Holding',
};

// ═══════════════════════════════════════════════════════
//  NAME EXTRACTION ENGINE
// ═══════════════════════════════════════════════════════

function extractCommunity(projectName) {
  if (!projectName) return null;

  // Patterns to try in order (most specific first):
  const patterns = [
    /\bat\s+(.+?)(?:\s*,\s*(?:Dubai|Abu Dhabi|Sharjah|RAK|UAE))/i,
    /\bin\s+(.+?)(?:\s*,\s*(?:Dubai|Abu Dhabi|Sharjah|RAK|UAE))/i,
    /\bat\s+(.+?)(?:\s*-\s)/i,
    /\bat\s+(.+?)$/i,
    /\bin\s+(.+?)$/i,
  ];

  // Fallback: try to match known community names directly in the project name
  // For cases like "Mirage The Oasis by Emaar Properties, Dubai"
  const KNOWN_IN_NAME = [
    'Sobha Hartland 2', 'Sobha Hartland', 'Emaar South', 'Emaar Beachfront',
    'Palm Jumeirah', 'Business Bay', 'Downtown Dubai', 'Dubai Marina',
    'Dubai Hills Estate', 'Dubai Creek Harbour', 'Dubai South',
    'Jumeirah Village Circle', 'Jumeirah Golf Estates', 'Jumeirah Bay Island',
    'Arabian Ranches 3', 'Arabian Ranches 2', 'Arabian Ranches',
    'Damac Hills 2', 'Damac Hills', 'Damac Lagoons',
    'Town Square', 'The Valley', 'Tilal Al Ghaf', 'Motor City',
    'Al Furjan', 'Al Jaddaf', 'Al Barsha', 'Al Sufouh',
    'Meydan', 'Mudon', 'Arjan', 'Majan', 'Liwan',
    'Dubailand', 'City Walk', 'Bluewaters Island',
    'Port De La Mer', 'La Mer', 'Villanova',
    'Dubai Water Canal', 'Safa Park', 'Mirdif',
    'Sheikh Zayed Road', 'Dubai Science Park',
    'Dubai Maritime City', 'Dubai Production City',
    'Dubai Silicon Oasis', 'Dubai Investment Park',
    'Dubai Studio City', 'Dubai Sports City',
    'Dubai Creek Beach', 'Expo City',
    'Yas Island', 'Al Reem Island', 'Saadiyat Island',
    'Maryam Island', 'Masaar', 'Aljada',
  ];

  for (const pat of patterns) {
    const m = projectName.match(pat);
    if (m) {
      let extracted = m[1].trim();

      // Strip developer suffixes: "JVC, Dubai by Danube" → "JVC"
      extracted = extracted
        .replace(/\s+by\s+.+$/i, '')
        .replace(/\s*-\s+(?:Reportage|Prescott|Damac|Emaar|Sobha|Azizi|Binghatti|Nakheel|Meraas|Tiger|Ellington|Samana|Aldar|Majid|Wasl|Nshama|MAG|IGO|Select|Pantheon|Iman|Imtiaz|Danube|Deyaar|OMNIYAT|London Gate|DECA|IMKAN|PMR|Vincitore|ZaZEN|Green Yard|Arsenal|TownX|ARADA).+$/i, '')
        .trim();

      // Strip ", Dubailand" suffix but keep the community
      extracted = extracted.replace(/\s*,\s*Dubailand$/i, '').trim();

      // Strip "Dubai" suffix only if something remains
      const withoutDubai = extracted.replace(/\s*,\s*Dubai$/i, '').trim();
      if (withoutDubai.length > 2) extracted = withoutDubai;

      if (extracted.length > 1 && extracted.length < 80) {
        return extracted;
      }
    }
  }

  // Fallback: scan for known community names in project name
  for (const known of KNOWN_IN_NAME) {
    if (projectName.includes(known)) {
      return known;
    }
  }

  // Last resort: "Name by Developer, City" — the name itself might be the community
  const byDev = projectName.match(/^(.+?)\s+by\s+.+?,\s*(?:Dubai|Abu Dhabi|Sharjah)$/i);
  if (byDev) {
    return byDev[1].trim();
  }

  return null;
}

function normalize(name) {
  return (name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

// ═══════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  Master Community Matcher');
  console.log('═══════════════════════════════════════════════\n');
  if (DRY) console.log('  🏃 DRY RUN\n');

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('binayah_website_new');

  // ═══ STEP 0: Restore archived community data into recreated shells ═══
  console.log('━━━ Step 0: Restore archived community data ━━━\n');

  const archivedComms = await db.collection('communities').find(
    { publishStatus: 'Archived' }
  ).toArray();

  const activeComms = await db.collection('communities').find(
    { publishStatus: { $ne: 'Archived' } }
  ).toArray();

  let restored = 0;
  for (const active of activeComms) {
    // Skip if already has a good description
    if (active.description && active.description.length > 50) continue;

    // Find archived version by name, oldName, or mergedInto
    const archived = archivedComms.find(a =>
      a.name === active.name ||
      a.oldName === active.name ||
      a.mergedInto === active.name ||
      normalize(a.name) === normalize(active.name)
    );

    if (archived) {
      const $set = {};
      if (archived.description && archived.description.length > (active.description || '').length) {
        $set.description = archived.description;
      }
      if (archived.featuredImage && !active.featuredImage) {
        $set.featuredImage = archived.featuredImage;
      }
      if (archived.latitude && archived.latitude > 1 && (!active.latitude || active.latitude < 1)) {
        $set.latitude = archived.latitude;
        $set.longitude = archived.longitude;
      }
      if (archived.metaDescription && archived.metaDescription.length > (active.metaDescription || '').length) {
        $set.metaDescription = archived.metaDescription;
      }

      if (Object.keys($set).length > 0) {
        $set.updatedAt = new Date();
        console.log(`  🔄 "${active.name}" ← restored ${Object.keys($set).filter(k => k !== 'updatedAt').join(', ')} from "${archived.name}"`);
        if (!DRY) {
          await db.collection('communities').updateOne({ _id: active._id }, { $set });
        }
        restored++;
      }
    }
  }
  console.log(`  Restored: ${restored} communities\n`);

  // ═══ STEP 1: Build lookup structures ═══
  // Reload after restore
  const freshComms = await db.collection('communities').find(
    { publishStatus: { $ne: 'Archived' } },
    { projection: { name: 1 } }
  ).toArray();

  const commNames = new Set(freshComms.map(c => c.name));
  const commNormMap = new Map();
  for (const c of freshComms) {
    commNormMap.set(normalize(c.name), c.name);
  }

  console.log(`  Active communities: ${commNames.size}\n`);

  // ═══ STEP 2: Match orphaned projects ═══
  console.log('━━━ Step 1: Match developer-orphan projects ━━━\n');

  // Get all projects where community is a developer name or NULL
  const devNames = new Set(Object.keys(DEVELOPER_MAP));
  const orphanProjects = await db.collection('projects').find(
    {
      publishStatus: 'Published',
      $or: [
        { community: { $in: [...devNames] } },
        { community: 'NULL' },
        { community: 'null' },
        { community: null },
        { community: '' },
      ]
    }
  ).toArray();

  console.log(`  Orphan projects to process: ${orphanProjects.length}\n`);

  const stats = { matched: 0, unmatched: 0, devSet: 0 };
  const unmatchedList = [];

  for (const proj of orphanProjects) {
    const oldComm = proj.community;
    const pName = proj.name || '';

    // Extract community from project name
    const extracted = extractCommunity(pName);

    let matchedComm = null;

    if (extracted) {
      // Try direct match
      if (commNames.has(extracted)) {
        matchedComm = extracted;
      }
      // Try alias
      else if (ALIASES[extracted] && commNames.has(ALIASES[extracted])) {
        matchedComm = ALIASES[extracted];
      }
      // Try normalized
      else if (commNormMap.has(normalize(extracted))) {
        matchedComm = commNormMap.get(normalize(extracted));
      }
      // Try partial: "Emaar South, Greenview 3" → strip after comma
      else {
        const parts = extracted.split(',');
        const first = parts[0].trim();
        if (commNames.has(first)) {
          matchedComm = first;
        } else if (ALIASES[first] && commNames.has(ALIASES[first])) {
          matchedComm = ALIASES[first];
        } else if (commNormMap.has(normalize(first))) {
          matchedComm = commNormMap.get(normalize(first));
        }
      }
    }

    if (matchedComm) {
      const $set = { community: matchedComm };

      // Set developer from old community value
      if (DEVELOPER_MAP[oldComm] && (!proj.developer || proj.developer === 'none')) {
        $set.developer = DEVELOPER_MAP[oldComm];
        stats.devSet++;
      }

      if (!DRY) {
        await db.collection('projects').updateOne({ _id: proj._id }, { $set });
      }
      console.log(`  ✅ "${pName.substring(0, 55)}..." → ${matchedComm}` +
        ($set.developer ? ` (dev: ${$set.developer})` : ''));
      stats.matched++;
    } else {
      unmatchedList.push({ name: pName, community: oldComm, extracted, _id: proj._id });
      stats.unmatched++;
    }
  }

  // ═══ STEP 3: Show unmatched ═══
  console.log('\n━━━ Step 2: Unmatched projects ━━━\n');

  if (unmatchedList.length > 0) {
    // Group by old community
    const grouped = {};
    for (const u of unmatchedList) {
      const key = u.community || 'NULL';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(u);
    }

    for (const [comm, projects] of Object.entries(grouped).sort((a, b) => b[1].length - a[1].length)) {
      console.log(`  "${comm}" (${projects.length}):`);
      for (const p of projects) {
        console.log(`    ❌ ${p.name}`);
        if (p.extracted) console.log(`       extracted: "${p.extracted}" — no community match`);
      }
    }
  } else {
    console.log('  None! All matched ✅');
  }

  // ═══ STEP 4: Recount communities ═══
  console.log('\n━━━ Step 3: Recount communities ━━━\n');

  if (!DRY) {
    const allActive = await db.collection('communities').find(
      { publishStatus: { $ne: 'Archived' } }
    ).toArray();

    let zeroed = 0;
    for (const comm of allActive) {
      const count = await db.collection('projects').countDocuments({
        community: comm.name, publishStatus: 'Published'
      });
      await db.collection('communities').updateOne(
        { _id: comm._id },
        { $set: { projectCount: count } }
      );
      if (count === 0) zeroed++;
    }
    console.log(`  Recounted ${allActive.length} communities (${zeroed} with 0 projects)`);
  }

  // ═══ FINAL REPORT ═══
  console.log('\n═══════════════════════════════════════════════');
  console.log('  MATCH REPORT');
  console.log('═══════════════════════════════════════════════\n');

  console.log(`  Orphans processed:  ${orphanProjects.length}`);
  console.log(`  Matched:            ${stats.matched}`);
  console.log(`  Developer set:      ${stats.devSet}`);
  console.log(`  Unmatched:          ${stats.unmatched}`);
  console.log(`  Communities restored: ${restored}`);

  // Final coverage
  const totalProj = await db.collection('projects').countDocuments({ publishStatus: 'Published' });
  const totalActiveComms = await db.collection('communities').countDocuments({ publishStatus: { $ne: 'Archived' } });

  const finalOrphans = await db.collection('projects').aggregate([
    { $match: { publishStatus: 'Published' } },
    { $lookup: {
      from: 'communities',
      let: { cn: '$community' },
      pipeline: [{ $match: { $expr: { $eq: ['$name', '$$cn'] }, publishStatus: { $ne: 'Archived' } } }],
      as: 'cd'
    }},
    { $match: { cd: { $size: 0 } } },
    { $count: 'n' }
  ]).toArray();

  const orphanCount = finalOrphans[0]?.n || 0;

  console.log(`\n  Total projects:     ${totalProj}`);
  console.log(`  Active communities: ${totalActiveComms}`);
  console.log(`  Matched:            ${totalProj - orphanCount} (${((totalProj - orphanCount) / totalProj * 100).toFixed(1)}%)`);
  console.log(`  Remaining orphans:  ${orphanCount}`);

  if (orphanCount > 0) {
    const remaining = await db.collection('projects').aggregate([
      { $match: { publishStatus: 'Published' } },
      { $lookup: {
        from: 'communities',
        let: { cn: '$community' },
        pipeline: [{ $match: { $expr: { $eq: ['$name', '$$cn'] }, publishStatus: { $ne: 'Archived' } } }],
        as: 'cd'
      }},
      { $match: { cd: { $size: 0 } } },
      { $group: { _id: '$community', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();

    console.log('\n  Remaining by community:');
    for (const r of remaining) {
      console.log(`    ${String(r.count).padStart(4)} | "${r._id}"`);
    }
  }

  console.log('\n✅ Done');
  await client.close();
}

main().catch(e => { console.error('❌', e); process.exit(1); });