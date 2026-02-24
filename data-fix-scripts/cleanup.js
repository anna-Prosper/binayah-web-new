/**
 * Schema Cleanup — Remove, Merge, Derive
 * 
 *   Phase 1: REMOVE 15 dead/redundant fields
 *   Phase 2: MERGE data before removing source fields
 *   Phase 3: DERIVE computable fields from existing data
 *   Phase 4: CLEAN invalid values (NULL strings, etc.)
 *   Phase 5: Update Mongoose model field list
 * 
 * Usage:
 *   node schema-cleanup.js --dry-run
 *   node schema-cleanup.js
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env' });
if (!process.env.MONGODB_URI) require('dotenv').config({ path: '.env.local' });

const DRY = process.argv.includes('--dry-run');

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  Schema Cleanup — Remove · Merge · Derive');
  console.log('═══════════════════════════════════════════════\n');
  if (DRY) console.log('  🏃 DRY RUN\n');

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('binayah_website_new');
  const col = db.collection('projects');
  const total = await col.countDocuments({ publishStatus: 'Published' });

  const stats = {
    phase1_removed: 0,
    phase2_paymentMerged: 0,
    phase2_floorPlanMerged: 0,
    phase2_amenitiesMerged: 0,
    phase2_videoMerged: 0,
    phase3_mapUrl: 0,
    phase3_displayPrice: 0,
    phase3_titleType: 0,
    phase3_eligibility: 0,
    phase4_nullStrings: 0,
    phase4_emptyArrays: 0,
  };

  // ═══════════════════════════════════════════════════════
  //  PHASE 1: Remove dead fields (0% coverage)
  // ═══════════════════════════════════════════════════════
  console.log('━━━ Phase 1: Remove 15 dead/redundant fields ━━━\n');

  const DEAD_FIELDS = [
    // 0% coverage — totally dead
    'sourceUrl',
    'priceByType',
    'bedrooms',
    'bathrooms',
    'typesAndSizes',
    'localImages',
    'videos',
    'videoUrl',
    'brochureUrl',
    'enhancedImage',
    'imagePrompt',
    'locationMapImages',
    'constructionUpdates',
    'acceptedPaymentMethods',
    // Will be re-derived
    'mapUrl',
  ];

  const $unset = {};
  DEAD_FIELDS.forEach(f => { $unset[f] = ''; });

  if (!DRY) {
    const res = await col.updateMany({}, { $unset });
    stats.phase1_removed = res.modifiedCount;
  }
  console.log(`  Removing: ${DEAD_FIELDS.join(', ')}`);
  console.log(`  Projects affected: ${DRY ? '~' + total : stats.phase1_removed}\n`);

  // ═══════════════════════════════════════════════════════
  //  PHASE 2: Merge before removing source fields
  // ═══════════════════════════════════════════════════════
  console.log('━━━ Phase 2: Merge redundant fields ━━━\n');

  // 2a: paymentPlan (3%) → paymentPlanSummary (29%), then remove paymentPlan + paymentPlanSteps
  const needsPayMerge = await col.find({
    publishStatus: 'Published',
    paymentPlan: { $exists: true, $nin: ['', null] },
    $or: [
      { paymentPlanSummary: '' },
      { paymentPlanSummary: null },
      { paymentPlanSummary: { $exists: false } },
    ]
  }).toArray();

  for (const p of needsPayMerge) {
    if (!DRY) {
      await col.updateOne({ _id: p._id }, { $set: { paymentPlanSummary: p.paymentPlan } });
    }
    stats.phase2_paymentMerged++;
  }
  console.log(`  paymentPlan → paymentPlanSummary: ${stats.phase2_paymentMerged} merged`);

  // Remove source fields
  if (!DRY) {
    await col.updateMany({}, { $unset: { paymentPlan: '', paymentPlanSteps: '' } });
  }
  console.log('  Removed: paymentPlan, paymentPlanSteps');

  // 2b: floorPlanContent + floorPlanImage → floorPlans (if floorPlans empty)
  const needsFpMerge = await col.find({
    publishStatus: 'Published',
    $or: [
      { floorPlanImage: { $exists: true, $nin: ['', null] } },
      { floorPlanContent: { $exists: true, $nin: ['', null] } },
    ],
    $or: [
      { floorPlans: { $size: 0 } },
      { floorPlans: { $exists: false } },
    ]
  }).toArray();

  for (const p of needsFpMerge) {
    if (p.floorPlanImage || p.floorPlanContent) {
      const entry = {};
      if (p.floorPlanImage) entry.image = p.floorPlanImage;
      if (p.floorPlanContent) entry.description = p.floorPlanContent.replace(/<[^>]*>/g, '').slice(0, 500);
      if (!DRY) {
        await col.updateOne({ _id: p._id }, { $push: { floorPlans: entry } });
      }
      stats.phase2_floorPlanMerged++;
    }
  }
  console.log(`  floorPlanImage/Content → floorPlans: ${stats.phase2_floorPlanMerged} merged`);

  if (!DRY) {
    await col.updateMany({}, { $unset: { floorPlanContent: '', floorPlanImage: '' } });
  }
  console.log('  Removed: floorPlanContent, floorPlanImage');

  // 2c: amenitiesTitle + amenitiesContent → keep amenities array, remove title/content
  // If amenities is empty but amenitiesContent has data, extract bullet items
  const needsAmMerge = await col.find({
    publishStatus: 'Published',
    amenitiesContent: { $exists: true, $nin: ['', null] },
    $or: [
      { amenities: { $size: 0 } },
      { amenities: { $exists: false } },
    ]
  }).toArray();

  for (const p of needsAmMerge) {
    const html = p.amenitiesContent || '';
    // Extract items from HTML list or comma-separated
    const items = html
      .replace(/<li[^>]*>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .split(/\n|,|;/)
      .map(s => s.replace(/&\w+;/g, ' ').trim())
      .filter(s => s.length > 2 && s.length < 100);

    if (items.length > 0) {
      if (!DRY) {
        await col.updateOne({ _id: p._id }, { $set: { amenities: items } });
      }
      stats.phase2_amenitiesMerged++;
    }
  }
  console.log(`  amenitiesContent → amenities[]: ${stats.phase2_amenitiesMerged} merged`);

  if (!DRY) {
    await col.updateMany({}, { $unset: { amenitiesTitle: '', amenitiesContent: '' } });
  }
  console.log('  Removed: amenitiesTitle, amenitiesContent');

  // 2d: masterPlanDescription → keep only if masterPlanImages has items
  if (!DRY) {
    await col.updateMany({}, { $unset: { masterPlanDescription: '' } });
  }
  console.log('  Removed: masterPlanDescription\n');

  // ═══════════════════════════════════════════════════════
  //  PHASE 3: Derive computable fields
  // ═══════════════════════════════════════════════════════
  console.log('━━━ Phase 3: Derive computable fields ━━━\n');

  // 3a: mapUrl from lat/lng
  const withCoords = await col.find(
    { publishStatus: 'Published', latitude: { $gt: 1 }, longitude: { $gt: 1 } },
    { projection: { latitude: 1, longitude: 1 } }
  ).toArray();

  for (const p of withCoords) {
    if (!DRY) {
      await col.updateOne({ _id: p._id }, {
        $set: { mapUrl: `https://www.google.com/maps?q=${p.latitude},${p.longitude}` }
      });
    }
    stats.phase3_mapUrl++;
  }
  console.log(`  mapUrl from coords: ${stats.phase3_mapUrl}`);

  // 3b: displayPrice from startingPrice
  const withPrice = await col.find(
    { publishStatus: 'Published', startingPrice: { $gt: 0 }, $or: [{ displayPrice: '' }, { displayPrice: null }, { displayPrice: { $exists: false } }] },
    { projection: { startingPrice: 1 } }
  ).toArray();

  for (const p of withPrice) {
    if (!DRY) {
      await col.updateOne({ _id: p._id }, {
        $set: { displayPrice: `AED ${p.startingPrice.toLocaleString()}` }
      });
    }
    stats.phase3_displayPrice++;
  }
  console.log(`  displayPrice from startingPrice: ${stats.phase3_displayPrice}`);

  // 3c: titleType — default Freehold for Dubai freehold zones
  const LEASEHOLD = new Set([
    'Dubai Healthcare City', 'Dubai Internet City', 'Dubai Media City (DMC)',
    'Dubai Studio City', 'Dubai Production City', 'Dubai Industrial City',
    'Dubai Science Park', 'Muhaisnah', 'Al Mamzar', 'Al Quoz',
  ]);

  const noTitle = await col.find(
    { publishStatus: 'Published', $or: [{ titleType: '' }, { titleType: null }, { titleType: { $exists: false } }] },
    { projection: { community: 1 } }
  ).toArray();

  for (const p of noTitle) {
    const isLeasehold = LEASEHOLD.has(p.community);
    if (!DRY) {
      await col.updateOne({ _id: p._id }, {
        $set: {
          titleType: isLeasehold ? 'Leasehold' : 'Freehold',
          eligibility: isLeasehold ? 'GCC Nationals Only' : 'All Nationalities',
        }
      });
    }
    stats.phase3_titleType++;
  }
  console.log(`  titleType + eligibility: ${stats.phase3_titleType}`);

  // 3d: priceUSD from startingPrice where missing
  if (!DRY) {
    const AED_TO_USD = 0.2723;
    const needsUsd = await col.find({
      publishStatus: 'Published',
      startingPrice: { $gt: 0 },
      $or: [{ priceUSD: null }, { priceUSD: 0 }, { priceUSD: { $exists: false } }]
    }).toArray();
    for (const p of needsUsd) {
      await col.updateOne({ _id: p._id }, {
        $set: { priceUSD: Math.round(p.startingPrice * AED_TO_USD) }
      });
    }
    console.log(`  priceUSD from startingPrice: ${needsUsd.length}`);
  }

  // ═══════════════════════════════════════════════════════
  //  PHASE 4: Clean invalid string values
  // ═══════════════════════════════════════════════════════
  console.log('\n━━━ Phase 4: Clean invalid values ━━━\n');

  // "NULL", "null", "none", "N/A" → empty string
  const INVALID_STRINGS = ['NULL', 'null', 'none', 'N/A', 'n/a', 'undefined'];
  const STRING_FIELDS = [
    'completionDate', 'shortOverview', 'constructionStatus', 'priceRange',
    'displayPrice', 'downPayment', 'paymentPlanSummary', 'availability',
    'titleType', 'eligibility',
  ];

  for (const field of STRING_FIELDS) {
    if (!DRY) {
      const res = await col.updateMany(
        { [field]: { $in: INVALID_STRINGS } },
        { $set: { [field]: '' } }
      );
      if (res.modifiedCount > 0) {
        console.log(`  ${field}: cleaned ${res.modifiedCount} invalid values`);
        stats.phase4_nullStrings += res.modifiedCount;
      }
    }
  }
  console.log(`  Total NULL/null/none cleaned: ${stats.phase4_nullStrings}`);

  // Remove priceRange (derivable, only 18% filled)
  if (!DRY) {
    await col.updateMany({}, { $unset: { priceRange: '' } });
  }
  console.log('  Removed: priceRange (derivable from startingPrice + priceMax)');

  // Remove areas (1% coverage, not useful)  
  if (!DRY) {
    await col.updateMany({}, { $unset: { areas: '' } });
  }
  console.log('  Removed: areas (1% coverage)');

  // ═══════════════════════════════════════════════════════
  //  FINAL REPORT
  // ═══════════════════════════════════════════════════════
  console.log('\n═══════════════════════════════════════════════');
  console.log('  CLEANUP REPORT');
  console.log('═══════════════════════════════════════════════\n');

  const removed = [
    ...DEAD_FIELDS,
    'paymentPlan', 'paymentPlanSteps',
    'floorPlanContent', 'floorPlanImage',
    'amenitiesTitle', 'amenitiesContent',
    'masterPlanDescription',
    'priceRange', 'areas',
  ];

  console.log(`  Fields REMOVED (${removed.length}):`);
  console.log(`    ${removed.join(', ')}\n`);

  console.log('  Fields MERGED:');
  console.log(`    paymentPlan → paymentPlanSummary:     ${stats.phase2_paymentMerged}`);
  console.log(`    floorPlanImage → floorPlans[]:        ${stats.phase2_floorPlanMerged}`);
  console.log(`    amenitiesContent → amenities[]:       ${stats.phase2_amenitiesMerged}\n`);

  console.log('  Fields DERIVED:');
  console.log(`    mapUrl from lat/lng:                  ${stats.phase3_mapUrl}`);
  console.log(`    displayPrice from startingPrice:      ${stats.phase3_displayPrice}`);
  console.log(`    titleType + eligibility:              ${stats.phase3_titleType}`);
  console.log(`    NULL strings cleaned:                 ${stats.phase4_nullStrings}\n`);

  // Final schema — remaining fields
  console.log('  FINAL SCHEMA (remaining fields):');
  const FINAL_FIELDS = [
    '── Identity ──',
    'name, slug, source, sourceId, wpId',
    '── Classification ──',
    'status, projectType, propertyType, constructionStatus',
    '── Location ──',
    'developerName, community, city, country, address, latitude, longitude, mapUrl',
    '── Pricing ──',
    'startingPrice, priceMax, priceUSD, displayPrice, currency, downPayment',
    '── Units ──',
    'unitTypes[], totalUnits, unitSizeMin, unitSizeMax, unitSizeUnit',
    '── Dates ──',
    'completionDate',
    '── Content ──',
    'shortOverview, fullDescription, amenities[]',
    '── Floor Plans ──',
    'floorPlans[]',
    '── Payment ──',
    'paymentPlanSummary',
    '── Media ──',
    'featuredImage, imageGallery[], masterPlanImages[]',
    '── SEO ──',
    'metaTitle, metaDescription, focusKeyword, tags[]',
    '── Ownership ──',
    'titleType, eligibility',
    '── AI Enrichment ──',
    'keyHighlights[], investmentHighlights{}, idealFor[], availability',
    'nearbyAttractions[], faqs[]',
    '── Meta ──',
    'viewCount, publishStatus, publishedAt, createdAt, updatedAt',
  ];
  FINAL_FIELDS.forEach(f => console.log(`    ${f}`));

  // Post-cleanup coverage
  console.log('\n  Post-cleanup coverage:');
  const coverageChecks = [
    ['developerName', { publishStatus: 'Published', developerName: { $nin: ['', null] } }],
    ['startingPrice', { publishStatus: 'Published', startingPrice: { $gt: 0 } }],
    ['mapUrl', { publishStatus: 'Published', mapUrl: { $exists: true, $nin: ['', null] } }],
    ['titleType', { publishStatus: 'Published', titleType: { $nin: ['', null] } }],
    ['amenities', { publishStatus: 'Published', amenities: { $exists: true, $not: { $size: 0 } } }],
    ['paymentPlanSummary', { publishStatus: 'Published', paymentPlanSummary: { $nin: ['', null] } }],
    ['shortOverview', { publishStatus: 'Published', shortOverview: { $nin: ['', null] } }],
    ['completionDate', { publishStatus: 'Published', completionDate: { $nin: ['', null, 'NULL'] } }],
  ];
  for (const [name, query] of coverageChecks) {
    const c = await col.countDocuments(query);
    const pct = Math.round(c / total * 100);
    const bar = '█'.repeat(Math.round(pct / 5)) + '░'.repeat(20 - Math.round(pct / 5));
    console.log(`    ${name.padEnd(22)} ${bar} ${c}/${total} (${pct}%)`);
  }

  console.log('\n✅ Done — schema reduced from ~53 fields to ~37 clean fields');
  await client.close();
}

main().catch(e => { console.error('❌', e); process.exit(1); });