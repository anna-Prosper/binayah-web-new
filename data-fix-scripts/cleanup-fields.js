/**
 * Cleanup Dead Fields & Derive Missing Data
 * 
 *   1. Remove 0% fields: typesAndSizes, bedrooms, bathrooms, brochureUrl, videos, mapUrl (will re-derive)
 *   2. Merge paymentPlan into paymentPlanSummary, remove paymentPlanSteps
 *   3. Derive mapUrl from latitude/longitude
 *   4. Derive developerName from project name where missing
 *   5. Set default titleType/eligibility for Dubai freehold zones
 * 
 * Usage:
 *   node cleanup-fields.js --dry-run
 *   node cleanup-fields.js
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env' });
if (!process.env.MONGODB_URI) require('dotenv').config({ path: '.env.local' });

const DRY = process.argv.includes('--dry-run');

// ═══════════════════════════════════════════════════════
//  DEVELOPER EXTRACTION from project names
// ═══════════════════════════════════════════════════════
const DEVELOPER_PATTERNS = [
  [/\bby Emaar\b/i,            'Emaar Properties'],
  [/\bEmaar\b/i,               'Emaar Properties'],
  [/\bby Damac\b/i,            'Damac Properties'],
  [/\bDAMAC\b/,                'Damac Properties'],
  [/\bby Nakheel\b/i,          'Nakheel'],
  [/\bNakheel\b/,              'Nakheel'],
  [/\bby Meraas\b/i,           'Meraas'],
  [/\bMeraas\b/,               'Meraas'],
  [/\bby Sobha\b/i,            'Sobha Realty'],
  [/\bSobha\b/,                'Sobha Realty'],
  [/\bby Azizi\b/i,            'Azizi Developments'],
  [/\bAzizi\b/,                'Azizi Developments'],
  [/\bby Binghatti\b/i,        'Binghatti Developers'],
  [/\bBinghatti\b/,            'Binghatti Developers'],
  [/\bby Ellington\b/i,        'Ellington Properties'],
  [/\bEllington\b/,            'Ellington Properties'],
  [/\bby Nshama\b/i,           'Nshama'],
  [/\bNshama\b/,               'Nshama'],
  [/\bby Danube\b/i,           'Danube Properties'],
  [/\bDanube\b/,               'Danube Properties'],
  [/\bby Reportage\b/i,        'Reportage Properties'],
  [/\bReportage\b/,            'Reportage Properties'],
  [/\bby Samana\b/i,           'Samana Developers'],
  [/\bSamana\b/,               'Samana Developers'],
  [/\bby Aldar\b/i,            'Aldar Properties'],
  [/\bAldar\b/,                'Aldar Properties'],
  [/\bby Tiger\b/i,            'Tiger Properties'],
  [/\bby Omniyat\b/i,          'Omniyat'],
  [/\bOmniyat\b/,              'Omniyat'],
  [/\bby Wasl\b/i,             'Wasl Properties'],
  [/\bWasl\b/,                 'Wasl Properties'],
  [/\bby Dubai Holding\b/i,    'Dubai Holding'],
  [/\bby Select Group\b/i,     'Select Group'],
  [/\bby MAG\b/i,              'MAG Property Development'],
  [/\bMAG\b/,                  'MAG Property Development'],
  [/\bby IGO\b/i,              'IGO'],
  [/\bby Imtiaz\b/i,           'Imtiaz Developments'],
  [/\bby Pantheon\b/i,         'Pantheon Development'],
  [/\bby Deca\b/i,             'DECA Properties'],
  [/\bby London Gate\b/i,      'London Gate'],
  [/\bby Vincitore\b/i,        'Vincitore'],
  [/\bby PMR\b/i,              'IMKAN'],
  [/\bby Major\b/i,            'Major Developments'],
  [/\bby BnW\b/i,              'BnW Developments'],
  [/\bPrescott\b/,             'Prescott Real Estate'],
  [/\bMajid Al Futtaim\b/i,    'Majid Al Futtaim'],
];

// Community → developer (known master developers)
const COMMUNITY_DEVELOPER = {
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
  'Dubai Marina':          'Emaar Properties',
  'Sobha Hartland':        'Sobha Realty',
  'Sobha Hartland 2':      'Sobha Realty',
  'Tilal Al Ghaf':         'Majid Al Futtaim',
  'Town Square':           'Nshama',
  'Palm Jumeirah':         'Nakheel',
  'Dubai Islands':         'Nakheel',
  'Jumeirah Islands':      'Nakheel',
  'Palm Jebel Ali':        'Nakheel',
  'City Walk':             'Meraas',
  'La Mer Dubai':          'Meraas',
  'Bluewaters Island':     'Meraas',
  'Wasl Gate':             'Wasl Properties',
  'Aljada':                'Arada',
  'Masaar':                'Arada',
  'Yas Island':            'Aldar Properties',
  'Saadiyat Island':       'Aldar Properties',
  'Al Reem Island':        'Aldar Properties',
};

// Leasehold zones in Dubai (non-freehold)
const LEASEHOLD_COMMUNITIES = new Set([
  'Dubai Healthcare City', 'Dubai Internet City', 'Dubai Media City (DMC)',
  'Dubai Studio City', 'Dubai Production City', 'Dubai Industrial City',
  'Dubai Science Park', 'Muhaisnah', 'Al Mamzar', 'Al Quoz',
]);

function extractDeveloper(projectName) {
  if (!projectName) return null;
  for (const [pat, dev] of DEVELOPER_PATTERNS) {
    if (pat.test(projectName)) return dev;
  }
  return null;
}

// ═══════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  Cleanup Fields & Derive Data');
  console.log('═══════════════════════════════════════════════\n');
  if (DRY) console.log('  🏃 DRY RUN\n');

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('binayah_website_new');

  const stats = {
    fieldsRemoved: 0,
    paymentMerged: 0,
    mapUrlSet: 0,
    developerSet: 0,
    titleTypeSet: 0,
    eligibilitySet: 0,
  };

  // ═══ Step 1: Remove dead fields ═══
  console.log('━━━ Step 1: Remove dead fields ━━━\n');

  const removeFields = {
    typesAndSizes: '',
    bedrooms: '',
    bathrooms: '',
    brochureUrl: '',
    videos: '',
    mapUrl: '',   // will re-derive
  };

  if (!DRY) {
    const res = await db.collection('projects').updateMany(
      { publishStatus: 'Published' },
      { $unset: removeFields }
    );
    stats.fieldsRemoved = res.modifiedCount;
    console.log(`  Removed ${Object.keys(removeFields).join(', ')} from ${res.modifiedCount} projects`);
  } else {
    console.log(`  Would remove: ${Object.keys(removeFields).join(', ')}`);
  }

  // ═══ Step 2: Merge paymentPlan → paymentPlanSummary ═══
  console.log('\n━━━ Step 2: Merge payment fields ━━━\n');

  // Where paymentPlan exists but paymentPlanSummary is empty
  const needsMerge = await db.collection('projects').find({
    publishStatus: 'Published',
    paymentPlan: { $exists: true, $nin: ['', null] },
    $or: [
      { paymentPlanSummary: '' },
      { paymentPlanSummary: null },
      { paymentPlanSummary: { $exists: false } }
    ]
  }).toArray();

  for (const p of needsMerge) {
    if (!DRY) {
      await db.collection('projects').updateOne(
        { _id: p._id },
        { $set: { paymentPlanSummary: p.paymentPlan } }
      );
    }
    stats.paymentMerged++;
  }
  console.log(`  Merged paymentPlan → paymentPlanSummary: ${stats.paymentMerged}`);

  // Remove paymentPlan and paymentPlanSteps
  if (!DRY) {
    await db.collection('projects').updateMany(
      { publishStatus: 'Published' },
      { $unset: { paymentPlan: '', paymentPlanSteps: '' } }
    );
  }
  console.log('  Removed paymentPlan + paymentPlanSteps fields');

  // ═══ Step 3: Derive mapUrl from coordinates ═══
  console.log('\n━━━ Step 3: Derive mapUrl from coordinates ━━━\n');

  const withCoords = await db.collection('projects').find({
    publishStatus: 'Published',
    latitude: { $gt: 1 },
    longitude: { $gt: 1 },
  }, { projection: { latitude: 1, longitude: 1, name: 1 } }).toArray();

  for (const p of withCoords) {
    const url = `https://www.google.com/maps?q=${p.latitude},${p.longitude}`;
    if (!DRY) {
      await db.collection('projects').updateOne(
        { _id: p._id },
        { $set: { mapUrl: url } }
      );
    }
    stats.mapUrlSet++;
  }
  console.log(`  Generated mapUrl for ${stats.mapUrlSet} projects`);

  // ═══ Step 4: Extract developer from project name ═══
  console.log('\n━━━ Step 4: Fill missing developer names ━━━\n');

  const noDev = await db.collection('projects').find({
    publishStatus: 'Published',
    $or: [
      { developerName: '' },
      { developerName: null },
      { developerName: 'none' },
      { developerName: { $exists: false } }
    ]
  }, { projection: { name: 1, community: 1 } }).toArray();

  console.log(`  Projects missing developer: ${noDev.length}`);

  for (const p of noDev) {
    // Try name extraction first
    let dev = extractDeveloper(p.name);

    // Fallback: community → developer
    if (!dev && COMMUNITY_DEVELOPER[p.community]) {
      dev = COMMUNITY_DEVELOPER[p.community];
    }

    if (dev) {
      if (!DRY) {
        await db.collection('projects').updateOne(
          { _id: p._id },
          { $set: { developerName: dev } }
        );
      }
      stats.developerSet++;
    }
  }
  console.log(`  Developer set: ${stats.developerSet}`);

  // ═══ Step 5: Set default titleType & eligibility ═══
  console.log('\n━━━ Step 5: Default titleType & eligibility ━━━\n');

  const noTitle = await db.collection('projects').find({
    publishStatus: 'Published',
    $or: [
      { titleType: '' },
      { titleType: null },
      { titleType: { $exists: false } }
    ]
  }, { projection: { community: 1, city: 1 } }).toArray();

  console.log(`  Projects missing titleType: ${noTitle.length}`);

  for (const p of noTitle) {
    const isLeasehold = LEASEHOLD_COMMUNITIES.has(p.community);
    const titleType = isLeasehold ? 'Leasehold' : 'Freehold';
    const eligibility = isLeasehold ? 'GCC Nationals Only' : 'All Nationalities';

    if (!DRY) {
      await db.collection('projects').updateOne(
        { _id: p._id },
        { $set: { titleType, eligibility } }
      );
    }
    stats.titleTypeSet++;
  }

  // Also set eligibility where missing but titleType exists
  if (!DRY) {
    const res = await db.collection('projects').updateMany(
      { publishStatus: 'Published', titleType: 'Freehold', $or: [{ eligibility: '' }, { eligibility: null }] },
      { $set: { eligibility: 'All Nationalities' } }
    );
    stats.eligibilitySet = res.modifiedCount;

    const res2 = await db.collection('projects').updateMany(
      { publishStatus: 'Published', titleType: 'Leasehold', $or: [{ eligibility: '' }, { eligibility: null }] },
      { $set: { eligibility: 'GCC Nationals Only' } }
    );
    stats.eligibilitySet += res2.modifiedCount;
  }
  console.log(`  titleType set: ${stats.titleTypeSet}`);
  console.log(`  eligibility backfill: ${stats.eligibilitySet}`);

  // ═══ REPORT ═══
  console.log('\n═══════════════════════════════════════════════');
  console.log('  CLEANUP REPORT');
  console.log('═══════════════════════════════════════════════\n');

  console.log(`  Dead fields removed:     ${Object.keys(removeFields).length} fields × ${stats.fieldsRemoved} projects`);
  console.log(`  Payment merged:          ${stats.paymentMerged}`);
  console.log(`  mapUrl derived:          ${stats.mapUrlSet}`);
  console.log(`  Developer filled:        ${stats.developerSet}/${noDev.length}`);
  console.log(`  titleType set:           ${stats.titleTypeSet}`);
  console.log(`  eligibility backfill:    ${stats.eligibilitySet}`);

  // Quick coverage check on key fields
  console.log('\n  ═══ UPDATED COVERAGE ═══\n');
  const total = await db.collection('projects').countDocuments({ publishStatus: 'Published' });
  const checks = [
    ['developerName', { publishStatus: 'Published', developerName: { $nin: ['', null, 'none'] } }],
    ['mapUrl', { publishStatus: 'Published', mapUrl: { $exists: true, $nin: ['', null] } }],
    ['titleType', { publishStatus: 'Published', titleType: { $nin: ['', null] } }],
    ['eligibility', { publishStatus: 'Published', eligibility: { $nin: ['', null] } }],
    ['startingPrice', { publishStatus: 'Published', startingPrice: { $gt: 0 } }],
    ['latitude', { publishStatus: 'Published', latitude: { $gt: 1 } }],
  ];
  for (const [name, query] of checks) {
    const c = await db.collection('projects').countDocuments(query);
    const pct = Math.round(c / total * 100);
    const bar = '█'.repeat(Math.round(pct / 5)) + '░'.repeat(20 - Math.round(pct / 5));
    console.log(`  ${name.padEnd(20)} ${bar} ${c}/${total} (${pct}%)`);
  }

  console.log('\n✅ Done');
  await client.close();
}

main().catch(e => { console.error('❌', e); process.exit(1); });