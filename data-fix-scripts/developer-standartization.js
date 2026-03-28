/**
 * Developer Standardization
 * 
 *   1. Normalize variant names → canonical (match developers collection)
 *   2. Clear junk values (city names, community names, garbage)
 *   3. Re-extract real developer from project name for cleared entries
 *   4. Fallback: community → master developer
 *   5. Report coverage
 * 
 * Usage:
 *   node fix-developers.js --dry-run
 *   node fix-developers.js
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env' });
if (!process.env.MONGODB_URI) require('dotenv').config({ path: '.env.local' });

const DRY = process.argv.includes('--dry-run');

// ═══════════════════════════════════════════════════════
//  STEP 1: Rename map — variant → canonical
// ═══════════════════════════════════════════════════════
const RENAME_MAP = {
  // Match to developers collection names
  'Ellington':                'Ellington Properties',
  'Sobha Group':              'Sobha Realty',
  'Sobha':                    'Sobha Realty',
  'OMNIYAT':                  'Omniyat Developers',
  'Omniyat':                  'Omniyat Developers',
  'Nakheel':                  'Nakheel Developers',
  'Nshama':                   'Nshama Developers',
  'ARADA':                    'ARADA Developer',
  'Arada':                    'ARADA Developer',
  'Arada Developer':          'ARADA Developer',
  'Bloom':                    'Bloom Holding',
  'Aldar':                    'Aldar Properties',
  'Dubai Properties':         'Dubai Properties Group',
  'Meydan Group':             'Meydan Developers',
  'Meydan':                   'Meydan Developers',
  'Meydan Dubai':             'Meydan Developers',
  'Reportage':                'Reportage Properties',
  'Azizi':                    'AZIZI Developments',
  'Azizi Developments':       'AZIZI Developments',
  'Al Barari':                'Al Barari Developers',
  'ORO 24':                   'ORO24',
  'LIV Real Estate':          'LIV Developers',
  'LEOS':                     'Leos',
  'Invest Group Overseas (IGO)': 'Invest Group Overseas',
  'Green Yard Properties':    'Green Yard Property Development LLC',
  'Green Yard':               'Green Yard Property Development LLC',
  'ZaZEN Property Development LLC': 'ZāZEN Property Development LLC',
  'Palmridge Development':    'Palmridge Real Estate Development',
  'IMKAN Properties':         'IMKAN Properties',
  'Imkan Properties':         'IMKAN Properties',
  'IRTH Development':         'IRTH Development',
  'Irth Development':         'IRTH Development',
  'H&H Development':          'H&amp;H Development',
  'G&Co':                     'G & Co',
  'Kleindienst Group':        'Kleindienst',
  'SAFE':                     'SAFE Developers',
  'Safe':                     'SAFE Developers',
  'Orion':                    'Orion Real Estate Development',
  'Dugasta Properties':       'Dugasta Properties',
  'Dugasta':                  'Dugasta Properties',
  'Heilbronn Properties':     'Heilbronn Properties',
  'Heilbronn':                'Heilbronn Properties',
  'Prestige One Developments':'Prestige One',
  'Prestige One':             'Prestige One',
  'AMIS Properties':          'AMIS',
  'AMIS':                     'AMIS',
  'Centurion Group':          'Centurion',
  'Centurion':                'Centurion',
  'Westar Properties':        'Westar',
  'Westar':                   'Westar',
  'Tarrad Development':       'Tarrad',
  'Tarrad':                   'Tarrad',
  'ADE Development':          'ADE',
  'ADE':                      'ADE',
  'RAK – Al Hamra Development': 'Al Hamra',
  'Al Hamra':                 'Al Hamra',
  'RAK – BNW Developments':   'BNW Developments',
  'Condor Developers':        'The Condor Group',
  'The Condor Group':         'The Condor Group',
  'Sharjah Holding':          'Sharjah Holding',
  'RAK Properties':           'RAK Properties',
  'Enaam Properties':         'Enaam Properties Development',
  'Tanmiyat':                 'Tanmiyat',
  'Tilal Properties':         'Tilal Properties',
  'Object 1':                 'Object 1',
};

// ═══════════════════════════════════════════════════════
//  STEP 2: Junk values — city/community/garbage as developer
// ═══════════════════════════════════════════════════════
const JUNK_VALUES = new Set([
  // Cities
  'Dubai', 'Abu Dhabi', 'Sharjah', 'RAK', 'Ras Al Khaimah', 'Umm Al Quwain',
  // Community names
  'Dubailand', 'Dubai South', 'District One', 'Expo Dubai Group', 'Expo City Dubai',
  'Dubai Sports City', 'MBR City', 'MBR City Dubai', 'MBR', 'Damac Hills',
  'DIFC Living', 'DIFC Developments', 'Downtown Dubai', 'Jebel Ali', 'Mina Al Arab',
  'Dubai Creek Harbour', 'Yas Island', 'Saadiyat Island', 'Jumeirah', 'Jumeirah Dubai',
  'Al Barsha South', 'Zayed City', 'District 11',
  // Garbage
  'null', 'NULL', 'none', 'Private Owner', 'Greenview 3', 'Aston Martin',
  // "City - Developer" patterns (extract the real developer)
  'Dubai by Emaar Properties', 'Dubai by Danube Properties',
  'Dubai - Reportage Properties', 'Dubai - Prescott Real Estate',
  'Dubai - Object 1', 'Dubai - MAAS Developers', 'Dubai - MN Vision Development',
  'Dubai – Mak Developers', 'Dubailand - Sol Development',
  'Jumeirah Golf Estates',  // community name, not developer
]);

// ═══════════════════════════════════════════════════════
//  STEP 3: Extract developer from project name
// ═══════════════════════════════════════════════════════
const NAME_PATTERNS = [
  // "by Developer" patterns — most specific first
  [/\bby Emaar Properties\b/i,     'Emaar Properties'],
  [/\bby Emaar\b/i,                'Emaar Properties'],
  [/\bby Damac Properties\b/i,     'Damac Properties'],
  [/\bby Damac\b/i,                'Damac Properties'],
  [/\bby Nakheel\b/i,              'Nakheel Developers'],
  [/\bby Meraas\b/i,               'Meraas'],
  [/\bby Sobha\b/i,                'Sobha Realty'],
  [/\bby Azizi\b/i,                'AZIZI Developments'],
  [/\bby Binghatti\b/i,            'Binghatti Developers'],
  [/\bby Ellington\b/i,            'Ellington Properties'],
  [/\bby Nshama\b/i,               'Nshama Developers'],
  [/\bby Danube\b/i,               'Danube Properties'],
  [/\bby Reportage\b/i,            'Reportage Properties'],
  [/\bby Samana\b/i,               'Samana Developers'],
  [/\bby Aldar\b/i,                'Aldar Properties'],
  [/\bby Tiger\b/i,                'Tiger Group'],
  [/\bby Omniyat\b/i,              'Omniyat Developers'],
  [/\bby Wasl\b/i,                 'Wasl Properties'],
  [/\bby Dubai Holding\b/i,        'Dubai Holding'],
  [/\bby Select Group\b/i,         'Select Group'],
  [/\bby MAG\b/i,                  'MAG Property Development'],
  [/\bby IGO\b/i,                  'Invest Group Overseas'],
  [/\bby Imtiaz\b/i,               'Imtiaz Developments'],
  [/\bby Pantheon\b/i,             'Pantheon Development'],
  [/\bby Deca\b/i,                 'DECA Properties'],
  [/\bby London Gate\b/i,          'London Gate'],
  [/\bby Vincitore\b/i,            'Vincitore Real Estate Development LLC'],
  [/\bby PMR\b/i,                  'IMKAN Properties'],
  [/\bby Major\b/i,                'Major Developments'],
  [/\bby BnW\b/i,                  'BNW Developments'],
  [/\bby Arada\b/i,                'ARADA Developer'],
  [/\bby Bloom\b/i,                'Bloom Holding'],
  [/\bby Eagle Hills\b/i,          'Eagle Hills'],
  [/\bby Mak\b/i,                  'Mak Developers'],
  [/\bby MAAS\b/i,                 'MAAS Developers'],
  [/\bby Sol\b/i,                  'Sol Development'],
  [/\bby MN Vision\b/i,            'MN Vision Development'],
  // Brand names in project name (only match if "by" not available)
  [/\bDAMAC\b/,                    'Damac Properties'],
  [/\bEmaar\b/,                    'Emaar Properties'],
  [/\bSobha\b/,                    'Sobha Realty'],
  [/\bAzizi\b/,                    'AZIZI Developments'],
  [/\bBinghatti\b/,                'Binghatti Developers'],
  [/\bSamana\b/,                   'Samana Developers'],
  [/\bDanube\b/,                   'Danube Properties'],
  [/\bPrescott\b/,                 'Prescott Real Estate Development'],
  [/\bMeraas\b/,                   'Meraas'],
  [/\bNshama\b/,                   'Nshama Developers'],
  [/\bNakheel\b/,                  'Nakheel Developers'],
  [/\bWasl\b/,                     'Wasl Properties'],
  [/\bMAG\s/,                      'MAG Property Development'],
  [/\bImtiaz\b/,                   'Imtiaz Developments'],
];

// ═══════════════════════════════════════════════════════
//  STEP 4: Community → master developer fallback
// ═══════════════════════════════════════════════════════
const COMMUNITY_DEV = {
  'Akoya Damac Hills':     'Damac Properties',
  'Damac Hills':           'Damac Properties',
  'Damac Hills 2':         'Damac Properties',
  'Damac Island':          'Damac Properties',
  'Damac Lagoons':         'Damac Properties',
  'Damac Riverside':       'Damac Properties',
  'Dubai Hills Estate':    'Emaar Properties',
  'Downtown Dubai':        'Emaar Properties',
  'Dubai Creek Harbour':   'Emaar Properties',
  'Emaar Beachfront':      'Emaar Properties',
  'Emaar South':           'Emaar Properties',
  'The Valley':            'Emaar Properties',
  'The Oasis by Emaar':    'Emaar Properties',
  'Arabian Ranches':       'Emaar Properties',
  'Arabian Ranches 2':     'Emaar Properties',
  'Arabian Ranches 3':     'Emaar Properties',
  'Sobha Hartland':        'Sobha Realty',
  'Sobha Hartland 2':      'Sobha Realty',
  'Sobha Sanctuary':       'Sobha Realty',
  'Tilal Al Ghaf':         'Majid Al Futtaim',
  'Ghaf Woods':            'Majid Al Futtaim',
  'Town Square':           'Nshama Developers',
  'Palm Jumeirah':         'Nakheel Developers',
  'Dubai Islands':         'Nakheel Developers',
  'Jumeirah Islands':      'Nakheel Developers',
  'Palm Jebel Ali':        'Nakheel Developers',
  'Dragon City':           'Nakheel Developers',
  'City Walk':             'Meraas',
  'La Mer Dubai':          'Meraas',
  'Bluewaters Island':     'Meraas',
  'Pearl Jumeirah':        'Meraas',
  'Wasl Gate':             'Wasl Properties',
  'Aljada':                'ARADA Developer',
  'Masaar':                'ARADA Developer',
  'Al Mamsha':             'ARADA Developer',
  'Yas Island':            'Aldar Properties',
  'Saadiyat Island':       'Aldar Properties',
  'Al Reem Island':        'Aldar Properties',
  'Meydan':                'Meydan Developers',
  'Mohammed Bin Rashid City': 'Meydan Developers',
  'Grand Polo Club and Resort': 'Emaar Properties',
  'Expo City':             'Dubai South',
  'Mina Rashid':           'Emaar Properties',
  'Dubai Marina':          'Emaar Properties',
  'Jumeirah Beach Residence': 'Dubai Properties Group',
  'Dubai Land Residence Complex (DLRC)': 'Dubai Properties Group',
  'Mudon':                 'Dubai Properties Group',
  'Villanova':             'Dubai Properties Group',
  'Liwan':                 'Dubai Properties Group',
  'Rashid Yachts & Marina': 'Emaar Properties',
  'Dubai Creek Beach':     'Emaar Properties',
  'District One':          'Meydan Developers',
  'Uptown':                'DMCC',
  'Nad Al Sheba':          'Meydan Developers',
  'Jumeirah Golf Estates': 'Dubai Properties Group',
  'Motor City':            'Dubai Properties Group',
  'The World Islands':     'Kleindienst',
  'Falcon City of Wonders':'Falconcity of Wonders LLC',
  'Maryam Island':         'Eagle Hills',
  'Al Marjan Island':      'Marjan',
  'Zayed City':            'Aldar Properties',
};

// "City - Developer" pattern extraction
const CITY_DEV_PATTERN = /^(?:Dubai|Abu Dhabi|Sharjah|RAK|Dubailand)\s*[-–]\s*(.+)$/;

function extractFromName(name) {
  if (!name) return null;
  for (const [pat, dev] of NAME_PATTERNS) {
    if (pat.test(name)) return dev;
  }
  return null;
}

// ═══════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  Developer Standardization');
  console.log('═══════════════════════════════════════════════\n');
  if (DRY) console.log('  🏃 DRY RUN\n');

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('binayah_website_new');

  const stats = { renamed: 0, cleared: 0, extracted: 0, community: 0, stillEmpty: 0 };

  // ═══ Step 1: Rename variants ═══
  console.log('━━━ Step 1: Rename developer variants ━━━\n');

  for (const [from, to] of Object.entries(RENAME_MAP)) {
    if (from === to) continue;
    const count = await db.collection('projects').countDocuments({
      publishStatus: 'Published', developerName: from
    });
    if (count === 0) continue;

    console.log(`  "${from}" → "${to}" (${count})`);
    if (!DRY) {
      await db.collection('projects').updateMany(
        { publishStatus: 'Published', developerName: from },
        { $set: { developerName: to } }
      );
    }
    stats.renamed += count;
  }
  console.log(`\n  Renamed: ${stats.renamed} projects\n`);

  // ═══ Step 2: Clear junk values ═══
  console.log('━━━ Step 2: Clear junk developer values ━━━\n');

  for (const junk of JUNK_VALUES) {
    const projects = await db.collection('projects').find(
      { publishStatus: 'Published', developerName: junk },
      { projection: { name: 1, community: 1, developerName: 1 } }
    ).toArray();

    if (projects.length === 0) continue;

    console.log(`  ❌ "${junk}" (${projects.length} projects)`);

    for (const p of projects) {
      let newDev = null;

      // Try extract from "City - Developer" pattern
      const cityDevMatch = junk.match(CITY_DEV_PATTERN);
      if (cityDevMatch) {
        const extracted = cityDevMatch[1].trim();
        // Check rename map
        newDev = RENAME_MAP[extracted] || extracted;
      }

      // Try extract from project name
      if (!newDev) {
        newDev = extractFromName(p.name);
      }

      // Try community fallback
      if (!newDev && COMMUNITY_DEV[p.community]) {
        newDev = COMMUNITY_DEV[p.community];
      }

      if (newDev) {
        if (!DRY) {
          await db.collection('projects').updateOne(
            { _id: p._id },
            { $set: { developerName: newDev } }
          );
        }
        stats.extracted++;
      } else {
        // Clear the junk value
        if (!DRY) {
          await db.collection('projects').updateOne(
            { _id: p._id },
            { $set: { developerName: '' } }
          );
        }
        stats.cleared++;
      }
    }
  }
  console.log(`\n  Re-extracted: ${stats.extracted}`);
  console.log(`  Cleared to empty: ${stats.cleared}\n`);

  // ═══ Step 3: Fill remaining empty developers ═══
  console.log('━━━ Step 3: Fill remaining empty developers ━━━\n');

  const empty = await db.collection('projects').find({
    publishStatus: 'Published',
    $or: [
      { developerName: '' },
      { developerName: null },
      { developerName: { $exists: false } }
    ]
  }, { projection: { name: 1, community: 1 } }).toArray();

  console.log(`  Empty developers: ${empty.length}`);

  for (const p of empty) {
    let dev = extractFromName(p.name);
    if (!dev && COMMUNITY_DEV[p.community]) {
      dev = COMMUNITY_DEV[p.community];
      if (dev) stats.community++;
    }
    if (dev) {
      if (!DRY) {
        await db.collection('projects').updateOne(
          { _id: p._id },
          { $set: { developerName: dev } }
        );
      }
      stats.extracted++;
    } else {
      stats.stillEmpty++;
    }
  }
  console.log(`  Filled: ${stats.extracted - stats.cleared}`);
  console.log(`  Via community: ${stats.community}`);
  console.log(`  Still empty: ${stats.stillEmpty}`);

  // ═══ REPORT ═══
  console.log('\n═══════════════════════════════════════════════');
  console.log('  DEVELOPER REPORT');
  console.log('═══════════════════════════════════════════════\n');

  const total = await db.collection('projects').countDocuments({ publishStatus: 'Published' });
  const hasDev = await db.collection('projects').countDocuments({
    publishStatus: 'Published',
    developerName: { $exists: true, $nin: ['', null, 'none', 'NULL'] }
  });
  const pct = ((hasDev / total) * 100).toFixed(1);

  console.log(`  Total projects:      ${total}`);
  console.log(`  Has developer:       ${hasDev} (${pct}%)`);
  console.log(`  Missing developer:   ${total - hasDev}`);

  // Top developers after fix
  console.log('\n  Top developers:');
  const top = await db.collection('projects').aggregate([
    { $match: { publishStatus: 'Published', developerName: { $nin: ['', null] } } },
    { $group: { _id: '$developerName', n: { $sum: 1 } } },
    { $sort: { n: -1 } },
    { $limit: 25 }
  ]).toArray();
  for (const d of top) {
    console.log(`    ${String(d.n).padStart(5)} | ${d._id}`);
  }

  // Remaining empty by community
  const emptyByComm = await db.collection('projects').aggregate([
    { $match: { publishStatus: 'Published', $or: [{ developerName: '' }, { developerName: null }] } },
    { $group: { _id: '$community', n: { $sum: 1 } } },
    { $sort: { n: -1 } },
    { $limit: 20 }
  ]).toArray();
  if (emptyByComm.length > 0) {
    console.log('\n  Still empty by community:');
    for (const c of emptyByComm) {
      console.log(`    ${String(c.n).padStart(5)} | ${c._id}`);
    }
  }

  console.log('\n✅ Done');
  await client.close();
}

main().catch(e => { console.error('❌', e); process.exit(1); });