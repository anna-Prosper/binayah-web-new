/**
 * Community Standardization, Ordering & Images — v2
 * 
 * Fixes from v1:
 * - Strips WordPress SEO suffixes from community names
 * - Checks slug uniqueness before inserting (no more E11000)
 * - 50+ more alias mappings for long WP-style names
 * 
 * Usage: node fix-communities-master.js
 * Env: MONGODB_URI in .env
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env' });
if (!process.env.MONGODB_URI) require('dotenv').config({ path: '.env.local' });

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) { console.error('❌ MONGODB_URI missing'); process.exit(1); }

// ═══════════════════════════════════════════════════
// WORDPRESS SEO SUFFIX PATTERNS — strip these from names
// ═══════════════════════════════════════════════════

const WP_SUFFIXES = [
  /\s*(apartments?|villas?|townhouses?|properties|penthouses?)\s*(and|&)\s*(apartments?|villas?|townhouses?|properties|penthouses?)\s*(for\s+sale\s*(and|&)?\s*rent|for\s+sale|for\s+rent)\s*(in\s+dubai)?\s*/gi,
  /\s*(apartments?|villas?|townhouses?|properties|penthouses?)\s+for\s+sale\s*(and|&|,)?\s*rent?\s*(in\s+dubai)?\s*/gi,
  /\s*properties\s+for\s+sale\s*(and|&)?\s*rent?\s*[-–]\s*(buy\s+)?(apartments?|villas?|townhouses?)(\s*(and|&)\s*(apartments?|villas?|townhouses?))?\s*/gi,
  /\s*for\s+sale\s*(and|&|,)?\s*rent?\s*(in\s+dubai)?\s*/gi,
  /\s*[-–]\s*dubai(land)?\s*/gi,
  /\s*[-–]\s*buy\s+.*$/gi,
  /\s*in\s+dubai\s*/gi,
  /\s+(dubai)\s*$/gi,  // trailing "Dubai" (but not if name IS "Dubai X")
  /\s+phase\s+\d+\s*$/gi,
];

function stripWPSuffix(name) {
  let cleaned = name.trim();
  for (const re of WP_SUFFIXES) {
    cleaned = cleaned.replace(re, '');
  }
  // Fix common leftovers
  cleaned = cleaned.replace(/\s*[-–,]\s*$/, '').replace(/^\s*[-–,]\s*/, '').trim();
  // Don't return empty
  return cleaned.length >= 2 ? cleaned : name.trim();
}

// ═══════════════════════════════════════════════════
// MASTER COMMUNITY LIST — Dubai's Premier Communities
// ═══════════════════════════════════════════════════

const PREMIER_COMMUNITIES = [
  // ── Tier 1: Iconic / Ultra-Premium ──
  { canonical: 'Downtown Dubai',         order: 1,  tier: 1, image: 'https://images.unsplash.com/photo-1546412414-e1885259563a?w=1200&q=85' },
  { canonical: 'Dubai Marina',           order: 2,  tier: 1, image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=85' },
  { canonical: 'Palm Jumeirah',          order: 3,  tier: 1, image: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=1200&q=85' },
  { canonical: 'Business Bay',           order: 4,  tier: 1, image: 'https://images.unsplash.com/photo-1597659840241-37e2b9c2f55f?w=1200&q=85' },
  { canonical: 'Dubai Hills Estate',     order: 5,  tier: 1, image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=85' },
  { canonical: 'Jumeirah Beach Residence', order: 6, tier: 1, image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1200&q=85' },
  { canonical: 'Dubai Creek Harbour',    order: 7,  tier: 1, image: 'https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?w=1200&q=85' },
  { canonical: 'DIFC',                   order: 8,  tier: 1, image: 'https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?w=1200&q=85' },

  // ── Tier 2: Premium / High-Demand ──
  { canonical: 'Jumeirah Village Circle', order: 9,  tier: 2, image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=85' },
  { canonical: 'Mohammed Bin Rashid City', order: 10, tier: 2, image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=85' },
  { canonical: 'Emaar Beachfront',       order: 11, tier: 2, image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=85' },
  { canonical: 'Jumeirah Lake Towers',   order: 12, tier: 2, image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=85' },
  { canonical: 'City Walk',              order: 13, tier: 2, image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=85' },
  { canonical: 'Bluewaters Island',      order: 14, tier: 2, image: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=1200&q=85' },
  { canonical: 'Arabian Ranches',        order: 15, tier: 2, image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=85' },
  { canonical: 'Damac Hills',            order: 16, tier: 2, image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=85' },
  { canonical: 'Dubai South',            order: 17, tier: 2, image: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1200&q=85' },
  { canonical: 'Al Barsha',              order: 18, tier: 2, image: 'https://images.unsplash.com/photo-1600573472556-e636c2acda9e?w=1200&q=85' },

  // ── Tier 3: Popular / Established ──
  { canonical: 'Dubai Sports City',      order: 19, tier: 3, image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=85' },
  { canonical: 'Jumeirah Village Triangle', order: 20, tier: 3, image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&q=85' },
  { canonical: 'Dubai Silicon Oasis',    order: 21, tier: 3, image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=85' },
  { canonical: 'Motor City',             order: 22, tier: 3, image: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1200&q=85' },
  { canonical: 'Al Furjan',              order: 23, tier: 3, image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=85' },
  { canonical: 'Damac Lagoons',          order: 24, tier: 3, image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&q=85' },
  { canonical: 'Dubai Land',             order: 25, tier: 3, image: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1200&q=85' },
  { canonical: 'Town Square',            order: 26, tier: 3, image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&q=85' },
  { canonical: 'Dubai Production City',  order: 27, tier: 3, image: 'https://images.unsplash.com/photo-1600585153490-76fb20a32601?w=1200&q=85' },
  { canonical: 'Arjan',                  order: 28, tier: 3, image: 'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=1200&q=85' },
  { canonical: 'Meydan',                 order: 29, tier: 3, image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=85' },
  { canonical: 'The Valley',             order: 30, tier: 3, image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=85' },
  { canonical: 'Sobha Hartland',         order: 31, tier: 3, image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&q=85' },
  { canonical: 'Tilal Al Ghaf',          order: 32, tier: 3, image: 'https://images.unsplash.com/photo-1600566753376-12c8ab7c14a2?w=1200&q=85' },
  { canonical: 'Dubai Harbour',          order: 33, tier: 3, image: 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=1200&q=85' },
  { canonical: 'Expo City',              order: 34, tier: 3, image: 'https://images.unsplash.com/photo-1600573472556-e636c2acda9e?w=1200&q=85' },
  { canonical: 'Dubai Islands',          order: 35, tier: 3, image: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=1200&q=85' },
  { canonical: 'Palm Jebel Ali',         order: 36, tier: 3, image: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=1200&q=85' },
  { canonical: 'Mudon',                  order: 37, tier: 3, image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=85' },
  { canonical: 'Dubai Investment Park',  order: 38, tier: 3, image: 'https://images.unsplash.com/photo-1600573472556-e636c2acda9e?w=1200&q=85' },
  { canonical: 'Majan',                  order: 39, tier: 3, image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&q=85' },
  { canonical: 'Emaar South',            order: 40, tier: 3, image: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1200&q=85' },
  { canonical: 'Al Jaddaf',              order: 41, tier: 3, image: 'https://images.unsplash.com/photo-1600573472556-e636c2acda9e?w=1200&q=85' },
  { canonical: 'Dubai Maritime City',    order: 42, tier: 3, image: 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=1200&q=85' },
  { canonical: 'Downtown Jebel Ali',     order: 43, tier: 3, image: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1200&q=85' },
  { canonical: 'Al Satwa',               order: 44, tier: 3, image: 'https://images.unsplash.com/photo-1600573472556-e636c2acda9e?w=1200&q=85' },
  { canonical: 'Pearl Jumeirah',         order: 45, tier: 3, image: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=1200&q=85' },
  { canonical: 'Liwan',                  order: 46, tier: 3, image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&q=85' },
  { canonical: 'Jumeirah Golf Estates',  order: 47, tier: 3, image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=85' },
  { canonical: 'Nad Al Sheba',           order: 48, tier: 3, image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=85' },
  { canonical: 'Damac Islands',          order: 49, tier: 3, image: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=1200&q=85' },
  { canonical: 'International City',     order: 50, tier: 3, image: 'https://images.unsplash.com/photo-1600573472556-e636c2acda9e?w=1200&q=85' },
  { canonical: 'Mina Rashid',            order: 51, tier: 3, image: 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=1200&q=85' },
  { canonical: 'Dubai Studio City',      order: 52, tier: 3, image: 'https://images.unsplash.com/photo-1600585153490-76fb20a32601?w=1200&q=85' },
  { canonical: 'Al Barari',              order: 53, tier: 3, image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&q=85' },
  { canonical: 'Yas Island',             order: 54, tier: 3, image: 'https://images.unsplash.com/photo-1600573472591-ee6981cf81ab?w=1200&q=85' },
  { canonical: 'Saadiyat Island',        order: 55, tier: 3, image: 'https://images.unsplash.com/photo-1600573472591-ee6981cf81ab?w=1200&q=85' },
  { canonical: 'Al Reem Island',         order: 56, tier: 3, image: 'https://images.unsplash.com/photo-1600573472591-ee6981cf81ab?w=1200&q=85' },
  { canonical: 'Sharjah',                order: 57, tier: 3, image: 'https://images.unsplash.com/photo-1600573472556-e636c2acda9e?w=1200&q=85' },
];

// ═══════════════════════════════════════════════════
// ALIAS MAP — all known variations → canonical name
// ═══════════════════════════════════════════════════

const ALIASES = {
  // Downtown
  'downtown': 'Downtown Dubai',
  'downtown dubai': 'Downtown Dubai',
  'downtown burj khalifa': 'Downtown Dubai',
  'burj khalifa district': 'Downtown Dubai',

  // Marina
  'dubai marina': 'Dubai Marina',
  'marina': 'Dubai Marina',
  'the marina': 'Dubai Marina',

  // Palm Jumeirah
  'palm jumeirah': 'Palm Jumeirah',
  'the palm': 'Palm Jumeirah',
  'palm': 'Palm Jumeirah',
  'the palm jumeirah': 'Palm Jumeirah',

  // Business Bay
  'business bay': 'Business Bay',
  'businessbay': 'Business Bay',

  // Dubai Hills
  'dubai hills estate': 'Dubai Hills Estate',
  'dubai hills': 'Dubai Hills Estate',
  'dhc': 'Dubai Hills Estate',
  'dubai hills community': 'Dubai Hills Estate',

  // JBR
  'jumeirah beach residence': 'Jumeirah Beach Residence',
  'jbr': 'Jumeirah Beach Residence',
  'jbr walk': 'Jumeirah Beach Residence',
  'the walk jbr': 'Jumeirah Beach Residence',

  // Dubai Creek Harbour
  'dubai creek harbour': 'Dubai Creek Harbour',
  'creek harbour': 'Dubai Creek Harbour',
  'the creek': 'Dubai Creek Harbour',
  'dubai creek': 'Dubai Creek Harbour',

  // DIFC
  'difc': 'DIFC',
  'dubai international financial centre': 'DIFC',
  'dubai international financial center': 'DIFC',

  // JVC
  'jumeirah village circle': 'Jumeirah Village Circle',
  'jvc': 'Jumeirah Village Circle',
  'jumeirah village circle jvc': 'Jumeirah Village Circle',

  // MBR City / Meydan
  'mohammed bin rashid city': 'Mohammed Bin Rashid City',
  'mbr city': 'Mohammed Bin Rashid City',
  'mbrc': 'Mohammed Bin Rashid City',
  'meydan city': 'Meydan',
  'meydan': 'Meydan',

  // Emaar Beachfront
  'emaar beachfront': 'Emaar Beachfront',

  // JLT
  'jumeirah lake towers': 'Jumeirah Lake Towers',
  'jlt': 'Jumeirah Lake Towers',

  // City Walk
  'city walk': 'City Walk',
  'citywalk': 'City Walk',

  // Bluewaters
  'bluewaters island': 'Bluewaters Island',
  'bluewaters': 'Bluewaters Island',
  'blue waters': 'Bluewaters Island',

  // Arabian Ranches
  'arabian ranches': 'Arabian Ranches',
  'arabian ranches 2': 'Arabian Ranches',
  'arabian ranches 3': 'Arabian Ranches',
  'arabian ranches ii': 'Arabian Ranches',
  'arabian ranches iii': 'Arabian Ranches',

  // Damac Hills
  'damac hills': 'Damac Hills',
  'damac hills 2': 'Damac Hills',
  'akoya': 'Damac Hills',

  // Dubai South
  'dubai south': 'Dubai South',
  'dubai world central': 'Dubai South',
  'dwc': 'Dubai South',

  // Al Barsha
  'al barsha': 'Al Barsha',
  'al barsha south': 'Al Barsha',

  // Dubai Sports City
  'dubai sports city': 'Dubai Sports City',
  'dsc': 'Dubai Sports City',
  'sports city': 'Dubai Sports City',

  // JVT
  'jumeirah village triangle': 'Jumeirah Village Triangle',
  'jvt': 'Jumeirah Village Triangle',
  'jvt dubai': 'Jumeirah Village Triangle',

  // DSO
  'dubai silicon oasis': 'Dubai Silicon Oasis',
  'dso': 'Dubai Silicon Oasis',
  'silicon oasis': 'Dubai Silicon Oasis',

  // Motor City
  'motor city': 'Motor City',

  // Al Furjan
  'al furjan': 'Al Furjan',

  // Damac Lagoons
  'damac lagoons': 'Damac Lagoons',

  // Dubai Land
  'dubai land': 'Dubai Land',
  'dubailand': 'Dubai Land',
  'dubai land residence complex': 'Dubai Land',
  'dlrc': 'Dubai Land',

  // Town Square
  'town square': 'Town Square',
  'town square dubai': 'Town Square',

  // DPC / IMPZ
  'dubai production city': 'Dubai Production City',
  'impz': 'Dubai Production City',
  'international media production zone impz': 'Dubai Production City',
  'international media production zone': 'Dubai Production City',

  // Arjan
  'arjan': 'Arjan',
  'al arjan': 'Arjan',
  'dubai arjan': 'Arjan',

  // Sobha Hartland
  'sobha hartland': 'Sobha Hartland',

  // Tilal Al Ghaf
  'tilal al ghaf': 'Tilal Al Ghaf',

  // Dubai Harbour
  'dubai harbour': 'Dubai Harbour',

  // Expo City
  'expo city': 'Expo City',
  'expo city dubai': 'Expo City',
  'district 2020': 'Expo City',

  // Palm Jebel Ali
  'palm jebel ali': 'Palm Jebel Ali',

  // Mudon
  'mudon': 'Mudon',

  // DIP
  'dubai investment park': 'Dubai Investment Park',
  'dip': 'Dubai Investment Park',

  // The Valley
  'the valley': 'The Valley',

  // ── NEW: From unmapped list ──
  'dubai islands': 'Dubai Islands',
  'majan': 'Majan',
  'majan dubai': 'Majan',
  'emaar south': 'Emaar South',
  'emaar south dubai': 'Emaar South',
  'al jaddaf': 'Al Jaddaf',
  'al jaddaf dubai': 'Al Jaddaf',
  'dubai maritime city': 'Dubai Maritime City',
  'downtown jebel ali': 'Downtown Jebel Ali',
  'al satwa': 'Al Satwa',
  'al satwa dubai': 'Al Satwa',
  'pearl jumeirah': 'Pearl Jumeirah',
  'pearl jumeirah island': 'Pearl Jumeirah',
  'liwan': 'Liwan',
  'jumeirah golf estates': 'Jumeirah Golf Estates',
  'jumeirah golf estates villas': 'Jumeirah Golf Estates',
  'nad al sheba': 'Nad Al Sheba',
  'nad al sheba dubai': 'Nad Al Sheba',
  'damac islands': 'Damac Islands',
  'international city': 'International City',
  'lawnz': 'International City',
  'mina rashid': 'Mina Rashid',
  'dubai studio city': 'Dubai Studio City',
  'studio city': 'Dubai Studio City',
  'al barari': 'Al Barari',
  'al barari dubai': 'Al Barari',
  'santorini': 'Damac Lagoons', // Santorini is a cluster within Damac Lagoons
  'sharjah': 'Sharjah',

  // Yas / Saadiyat / Reem (Abu Dhabi)
  'yas island': 'Yas Island',
  'saadiyat island': 'Saadiyat Island',
  'al reem island': 'Al Reem Island',
  'reem island': 'Al Reem Island',
};

// ═══ UTILS ═══

function normalizeKey(name) {
  return (name || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

function toSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ═══ RESOLVE: raw name → canonical community name ═══
function resolveCanonical(rawName) {
  // Step 1: Direct alias match on raw name
  let key = normalizeKey(rawName);
  if (ALIASES[key]) return ALIASES[key];

  // Step 2: Strip WP suffixes, try again
  const stripped = stripWPSuffix(rawName);
  key = normalizeKey(stripped);
  if (ALIASES[key]) return ALIASES[key];

  // Step 3: Partial match against premier list
  for (const pc of PREMIER_COMMUNITIES) {
    const pcKey = normalizeKey(pc.canonical);
    if (key.includes(pcKey) || pcKey.includes(key)) {
      return pc.canonical;
    }
  }

  // Step 4: If stripped name is different from raw, and looks like a clean name (< 40 chars), use it
  if (stripped !== rawName.trim() && stripped.length < 40 && stripped.length >= 3) {
    // Check if stripped version matches any alias
    const strippedKey = normalizeKey(stripped);
    if (ALIASES[strippedKey]) return ALIASES[strippedKey];
    // Return cleaned version even if not in alias map
    return stripped;
  }

  return null; // Truly unmapped
}

// ═══ MAIN ═══

async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  console.log('✅ Connected\n');
  const db = client.db('binayah_website_new');

  // ═══ STEP 1: STANDARDIZE PROJECT COMMUNITY NAMES ═══
  console.log('--- Step 1: Standardize project community names ---');

  const projects = await db.collection('projects').find(
    { publishStatus: 'Published', community: { $ne: '', $ne: null } },
    { projection: { community: 1, _id: 1 } }
  ).toArray();

  let renamed = 0;
  const unmapped = new Map();

  for (const p of projects) {
    const raw = p.community.trim();
    const canonical = resolveCanonical(raw);

    if (canonical && canonical !== raw) {
      await db.collection('projects').updateOne(
        { _id: p._id },
        { $set: { community: canonical } }
      );
      renamed++;
    } else if (!canonical) {
      unmapped.set(raw, (unmapped.get(raw) || 0) + 1);
    }
  }

  console.log(`  Renamed: ${renamed} projects`);
  console.log(`  Unmapped communities: ${unmapped.size}`);
  if (unmapped.size > 0) {
    const sorted = [...unmapped.entries()].sort((a, b) => b[1] - a[1]);
    console.log('  Top unmapped:');
    sorted.slice(0, 25).forEach(([name, count]) => console.log(`    "${name}" (${count} projects)`));
  }

  // ═══ STEP 2: ENSURE ALL PREMIER COMMUNITIES EXIST IN COLLECTION ═══
  console.log('\n--- Step 2: Ensure premier communities exist ---');

  // Build lookup sets by BOTH name and slug
  const existing = await db.collection('communities').find(
    {}, { projection: { name: 1, slug: 1, _id: 1 } }
  ).toArray();
  const existingByName = new Map(existing.map(c => [c.name.toLowerCase(), c]));
  const existingBySlug = new Map(existing.map(c => [c.slug, c]));

  let added = 0, skippedDupe = 0;
  for (const pc of PREMIER_COMMUNITIES) {
    const slug = toSlug(pc.canonical);

    // Check by name OR slug
    if (existingByName.has(pc.canonical.toLowerCase()) || existingBySlug.has(slug)) {
      skippedDupe++;
      continue;
    }

    const projCount = await db.collection('projects').countDocuments({
      publishStatus: 'Published', community: pc.canonical
    });

    try {
      await db.collection('communities').insertOne({
        name: pc.canonical,
        slug,
        description: '',
        featuredImage: pc.image,
        metaTitle: `${pc.canonical} - Properties for Sale & Rent | Binayah`,
        metaDescription: `Discover luxury properties in ${pc.canonical}. Browse apartments, villas & townhouses for sale and rent.`,
        featured: pc.tier <= 2,
        order: pc.order,
        tier: pc.tier,
        projectCount: projCount,
        viewCount: 0,
        publishStatus: 'Published',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      added++;
      console.log(`  + ${pc.canonical} (tier ${pc.tier}, ${projCount} projects)`);
    } catch (err) {
      if (err.code === 11000) {
        console.log(`  ⏭️  ${pc.canonical} — slug "${slug}" already exists, skipping`);
        skippedDupe++;
      } else {
        throw err;
      }
    }
  }
  console.log(`  Added: ${added}, Already existed: ${skippedDupe}`);

  // ═══ STEP 3: STANDARDIZE COMMUNITY COLLECTION NAMES ═══
  console.log('\n--- Step 3: Standardize community collection names ---');

  const allComms = await db.collection('communities').find({}).toArray();
  let commRenamed = 0;

  for (const c of allComms) {
    const canonical = resolveCanonical(c.name);

    if (canonical && canonical !== c.name) {
      // Check if canonical already exists as a separate doc
      const canonicalDoc = allComms.find(x => x.name === canonical && x._id.toString() !== c._id.toString());

      if (canonicalDoc) {
        // Merge: move projects to canonical, delete duplicate
        await db.collection('projects').updateMany(
          { community: c.name },
          { $set: { community: canonical } }
        );
        await db.collection('communities').deleteOne({ _id: c._id });
        console.log(`  Merged "${c.name}" → "${canonical}" (deleted duplicate)`);
      } else {
        // Rename community + update slug
        const newSlug = toSlug(canonical);
        // Check slug isn't taken
        const slugTaken = allComms.find(x => x.slug === newSlug && x._id.toString() !== c._id.toString());
        const $set = { name: canonical };
        if (!slugTaken) $set.slug = newSlug;

        await db.collection('communities').updateOne({ _id: c._id }, { $set });
        await db.collection('projects').updateMany(
          { community: c.name },
          { $set: { community: canonical } }
        );
        console.log(`  Renamed "${c.name}" → "${canonical}"`);
      }
      commRenamed++;
    }
  }
  console.log(`  Communities standardized: ${commRenamed}`);

  // ═══ STEP 4: SET ORDER, TIER, FEATURED, IMAGES ═══
  console.log('\n--- Step 4: Set ordering, images & featured flags ---');

  const freshComms = await db.collection('communities').find({}).toArray();
  let orderSet = 0;

  // Apply premier list order + images
  for (const pc of PREMIER_COMMUNITIES) {
    const comm = freshComms.find(c => c.name === pc.canonical);
    if (!comm) continue;

    const $set = {
      order: pc.order,
      tier: pc.tier,
      featured: pc.tier <= 2,
      updatedAt: new Date(),
    };

    if (!comm.featuredImage || comm.featuredImage.includes('placeholder') || comm.featuredImage === '') {
      $set.featuredImage = pc.image;
    }

    await db.collection('communities').updateOne({ _id: comm._id }, { $set });
    orderSet++;
  }

  // Non-premier: sort by project count
  const projCounts = await db.collection('projects').aggregate([
    { $match: { publishStatus: 'Published', community: { $ne: '', $ne: null } } },
    { $group: { _id: '$community', count: { $sum: 1 } } }
  ]).toArray();
  const countMap = new Map(projCounts.map(r => [r._id, r.count]));

  const nonPremier = freshComms.filter(c =>
    !PREMIER_COMMUNITIES.find(pc => pc.canonical === c.name)
  );
  nonPremier.sort((a, b) => (countMap.get(b.name) || 0) - (countMap.get(a.name) || 0));

  let baseOrder = PREMIER_COMMUNITIES.length + 1;
  for (const c of nonPremier) {
    const count = countMap.get(c.name) || 0;
    await db.collection('communities').updateOne(
      { _id: c._id },
      { $set: { order: baseOrder++, tier: 4, featured: false, projectCount: count, updatedAt: new Date() } }
    );
  }

  console.log(`  Premier ordered: ${orderSet}`);
  console.log(`  Non-premier ordered: ${nonPremier.length}`);

  // ═══ STEP 5: UPDATE ALL PROJECT COUNTS ═══
  console.log('\n--- Step 5: Update project counts ---');

  let countsUpdated = 0;
  for (const { _id: name, count } of projCounts) {
    const res = await db.collection('communities').updateOne({ name }, { $set: { projectCount: count } });
    if (res.modifiedCount) countsUpdated++;
  }
  console.log(`  Updated: ${countsUpdated}`);

  // ═══ STEP 6: FIX ADDRESSES ═══
  console.log('\n--- Step 6: Fix addresses ---');

  const noAddr = await db.collection('projects').find(
    { publishStatus: 'Published', $or: [{ address: '' }, { address: null }] },
    { projection: { community: 1, city: 1, _id: 1 } }
  ).toArray();
  let addrFixed = 0;
  for (const p of noAddr) {
    const parts = [p.community, p.city || 'Dubai', 'UAE'].filter(Boolean);
    await db.collection('projects').updateOne({ _id: p._id }, { $set: { address: parts.join(', ') } });
    addrFixed++;
  }
  console.log(`  Fixed: ${addrFixed}`);

  // ═══ FINAL REPORT ═══
  console.log('\n═══════════════════════════════════');
  console.log('       COMMUNITY REPORT');
  console.log('═══════════════════════════════════\n');

  const finalComms = await db.collection('communities').find(
    { publishStatus: 'Published' }
  ).sort({ order: 1 }).toArray();

  const totalProjects = await db.collection('projects').countDocuments({ publishStatus: 'Published' });
  const withCommunity = await db.collection('projects').countDocuments({
    publishStatus: 'Published', community: { $ne: '', $ne: null }
  });

  console.log(`  Total communities: ${finalComms.length}`);
  console.log(`  Featured (tier 1-2): ${finalComms.filter(c => c.featured).length}`);
  console.log(`  Projects with community: ${withCommunity}/${totalProjects}`);
  console.log(`  With images: ${finalComms.filter(c => c.featuredImage).length}/${finalComms.length}`);

  console.log('\n  Top 30 communities by order:\n');
  console.log('  #   Community                        Tier  Projects  Image');
  console.log('  ' + '─'.repeat(70));

  for (const c of finalComms.slice(0, 30)) {
    const num = String(c.order || '?').padStart(2);
    const name = (c.name || '').padEnd(32);
    const tier = `T${c.tier || '?'}`.padEnd(4);
    const proj = String(c.projectCount || 0).padStart(4);
    const img = c.featuredImage ? '✅' : '❌';
    console.log(`  ${num}  ${name}  ${tier}  ${proj}     ${img}`);
  }

  const noCommunity = totalProjects - withCommunity;
  if (noCommunity > 0) {
    console.log(`\n  ⚠️  ${noCommunity} projects still have no community assigned`);
  }

  console.log('\n✅ Done');
  await client.close();
}

main().catch(e => { console.error('❌', e); process.exit(1); });