/**
 * Add missing fields to projects collection
 * 
 * Adds new fields needed by the project detail page that don't exist yet.
 * Safe to run multiple times — only sets fields that don't exist.
 * 
 * Usage: node add-missing-fields.js
 * Env: MONGODB_URI in .env
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env' });
if (!process.env.MONGODB_URI) require('dotenv').config({ path: '.env.local' });

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) { console.error('❌ MONGODB_URI missing'); process.exit(1); }

async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  console.log('✅ Connected\n');
  const db = client.db('binayah_website_new');

  const total = await db.collection('projects').countDocuments({ publishStatus: 'Published' });
  console.log(`Total published projects: ${total}\n`);

  // ═══ ADD NEW FIELDS WITH DEFAULTS ═══
  // Uses $set with $exists:false filter so it won't overwrite existing values

  const newFields = {
    titleType:             '',           // "Freehold" | "Leasehold" | ""
    eligibility:           '',           // "All Nationalities" | "GCC Nationals Only" | ""
    keyHighlights:         [],           // ["Triple tower development", "Panoramic views", ...]
    investmentHighlights:  {             // Investment metrics section
      rentalYield:    '',                // "7-9%"
      capitalGrowth:  '',                // "12-15%"
      occupancyRate:  '',                // "90%+"
      bullets:        [],                // ["Prime waterfront location", "Golden Visa eligible", ...]
    },
    idealFor:              [],           // ["End Users", "Investors", "Holiday Homes"]
    availability:          '',           // "Available" | "Sold Out" | "Limited Units" | "Upcoming"
    paymentPlanSteps:      [],           // [{step:1, milestone:"On Booking", percentage:10}, ...]
    priceMax:              null,         // Upper bound price in AED (number)
    priceUSD:              null,         // Starting price in USD (number)
    unitSizeUnit:          'sqft',       // "sqft" | "sqm"
  };

  console.log('Adding missing fields to projects...\n');

  let updated = 0;
  for (const [field, defaultValue] of Object.entries(newFields)) {
    const result = await db.collection('projects').updateMany(
      { [field]: { $exists: false } },
      { $set: { [field]: defaultValue } }
    );
    if (result.modifiedCount > 0) {
      console.log(`  + ${field}: added to ${result.modifiedCount} projects`);
      updated += result.modifiedCount;
    } else {
      console.log(`  ✓ ${field}: already exists on all projects`);
    }
  }

  // ═══ ALSO ENSURE EXISTING FIELDS HAVE DEFAULTS ═══
  // Some fields from migration might be missing on certain docs

  const existingFieldDefaults = {
    titleType:          '',
    downPayment:        '',
    paymentPlanSummary: '',
    shortOverview:      '',
    totalUnits:         null,
    constructionStatus: '',
    displayPrice:       '',
    priceRange:         '',
    bedrooms:           '',
    bathrooms:          '',
    mapUrl:             '',
    brochureUrl:        '',
    floorPlanContent:   '',
    floorPlanImage:     '',
    amenitiesTitle:     '',
    amenitiesContent:   '',
    masterPlanDescription: '',
    videoUrl:           '',
  };

  console.log('\nEnsuring existing field defaults...\n');

  for (const [field, defaultValue] of Object.entries(existingFieldDefaults)) {
    const result = await db.collection('projects').updateMany(
      { [field]: { $exists: false } },
      { $set: { [field]: defaultValue } }
    );
    if (result.modifiedCount > 0) {
      console.log(`  + ${field}: added to ${result.modifiedCount} projects`);
      updated += result.modifiedCount;
    }
  }

  // ═══ AUTO-COMPUTE: priceUSD from startingPrice ═══
  // AED to USD rate ~0.2723 (fixed peg)
  const AED_TO_USD = 0.2723;

  const withPrice = await db.collection('projects').find(
    { startingPrice: { $gt: 0 }, $or: [{ priceUSD: null }, { priceUSD: { $exists: false } }] },
    { projection: { startingPrice: 1 } }
  ).toArray();

  let priceComputed = 0;
  for (const p of withPrice) {
    const usd = Math.round(p.startingPrice * AED_TO_USD);
    await db.collection('projects').updateOne(
      { _id: p._id },
      { $set: { priceUSD: usd } }
    );
    priceComputed++;
  }
  if (priceComputed) console.log(`\n  💲 Computed priceUSD for ${priceComputed} projects`);

  // ═══ AUTO-SET: availability from status ═══
  const availResult = await db.collection('projects').updateMany(
    { availability: '', status: 'Ready' },
    { $set: { availability: 'Available' } }
  );
  if (availResult.modifiedCount) console.log(`  📦 Set availability='Available' for ${availResult.modifiedCount} Ready projects`);

  const availResult2 = await db.collection('projects').updateMany(
    { availability: '', status: { $in: ['Under Construction', 'Off-Plan'] } },
    { $set: { availability: 'Available' } }
  );
  if (availResult2.modifiedCount) console.log(`  📦 Set availability='Available' for ${availResult2.modifiedCount} Off-Plan/UC projects`);

  // ═══ FINAL STATS ═══
  console.log('\n═══ FIELD COVERAGE ═══\n');

  const fields = [
    'titleType', 'eligibility', 'keyHighlights', 'idealFor', 'availability',
    'paymentPlanSteps', 'priceMax', 'priceUSD', 'investmentHighlights',
    // Also check existing important fields
    'community', 'developerName', 'startingPrice', 'completionDate',
    'shortOverview', 'amenities', 'unitTypes', 'paymentPlanSummary',
    'downPayment', 'totalUnits', 'nearbyAttractions', 'faqs',
  ];

  for (const f of fields) {
    const empty = await db.collection('projects').countDocuments({
      publishStatus: 'Published',
      $or: [
        { [f]: null },
        { [f]: '' },
        { [f]: { $size: 0 } },
        { [f]: { $exists: false } },
      ]
    });
    const filled = total - empty;
    const pct = ((filled / total) * 100).toFixed(0);
    const bar = '█'.repeat(Math.round(filled / total * 20)) + '░'.repeat(20 - Math.round(filled / total * 20));
    console.log(`  ${f.padEnd(22)} ${bar} ${filled}/${total} (${pct}%)`);
  }

  console.log('\n✅ Done');
  await client.close();
}

main().catch(e => { console.error('❌', e); process.exit(1); });