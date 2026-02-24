/**
 * Community Master Fix — Names, Cities, Metas, Descriptions, Orphans
 * 
 * Fixes:
 *   1. Bad WP names → clean names (saves oldName)
 *   2. Correct city for EVERY community (Dubai/Abu Dhabi/Sharjah/RAK/UAQ)
 *   3. Fix meta titles to match city
 *   4. Strip phone/CTA spam from WP descriptions
 *   5. Fix Expo 2020 → Expo City Dubai
 *   6. Fix wrong city references in AI descriptions
 *   7. Merge duplicates (Creek Beach, Design District, etc.)
 *   8. Archive zero-project orphans
 *   9. Recount projects per community
 * 
 * Usage:
 *   node fix-communities-master-v3.js --dry-run   # preview
 *   node fix-communities-master-v3.js              # apply all
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env' });
if (!process.env.MONGODB_URI) require('dotenv').config({ path: '.env.local' });

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) { console.error('❌ MONGODB_URI missing'); process.exit(1); }

const DRY = process.argv.includes('--dry-run');

// ═══════════════════════════════════════════════════════
//  CITY ASSIGNMENTS — every community gets its real city
// ═══════════════════════════════════════════════════════
const CITY_MAP = {
  // Abu Dhabi
  'Abu Dhabi': 'Abu Dhabi',
  'Al Maryah Island': 'Abu Dhabi',
  'Al Raha Beach': 'Abu Dhabi',
  'Al Reef': 'Abu Dhabi',
  'Al Reem Island': 'Abu Dhabi',
  'Hudayriyat Island': 'Abu Dhabi',
  'Khalifa City': 'Abu Dhabi',
  'Masdar City': 'Abu Dhabi',
  'Saadiyat Island': 'Abu Dhabi',
  'Yas Island': 'Abu Dhabi',
  'Zayed City': 'Abu Dhabi',

  // Sharjah
  'Sharjah': 'Sharjah',
  'Al Mamsha': 'Sharjah',
  'Al Zahia': 'Sharjah',
  'Aljada': 'Sharjah',
  'Maryam Island': 'Sharjah',
  'Masaar': 'Sharjah',
  'Nasma': 'Sharjah',

  // Ras Al Khaimah
  'Al Hamra': 'Ras Al Khaimah',
  'Al Marjan Island': 'Ras Al Khaimah',
  'Mina Al Arab': 'Ras Al Khaimah',
  'Al Jurf': 'Ras Al Khaimah',
  'AlJurf': 'Ras Al Khaimah',

  // Umm Al Quwain
  'Hayat Island': 'Umm Al Quwain',
  'Siniya Island': 'Umm Al Quwain',

  // Everything else → Dubai (default)
};

// ═══════════════════════════════════════════════════════
//  NAME FIXES — WP suffix → clean name
// ═══════════════════════════════════════════════════════
const NAME_FIXES = {
  'Barsha Heights (Tecom) Dubai Offices and Apartments for Sale & Rent': 'Barsha Heights',
  'Dubai Al Quoz- Apartment & Villas': 'Al Quoz',
  'Dubai Springs Villa for Sale - Springs Villa for  Rent': 'The Springs',
  'Al Rigga Dubai Apartments and Villas': 'Al Rigga',
  'Bur Dubai- Bur Dubai Properties': 'Bur Dubai',
  'Properties for Sale in Deira Dubai': 'Deira',
  'Emirates Hills Properties for Sale': 'Emirates Hills',
  'Villas and Townhosuesin Reem': 'Reem Community',
  'La Mer Dubai Apartments': 'La Mer',
  'Muhaisnah Dubai Labour Camp for Rent': 'Muhaisnah',
  'Properties For Sale in The Oasis by Emaar': 'The Oasis by Emaar',
  'Properties For Sale in Arabian Hills Estate': 'Arabian Hills Estate',
  'Properties For Sale in Mirage The Oasis': 'Mirage The Oasis',
  'Properties For Sale in Damac Riverside': 'Damac Riverside',
  'Properties For Sale in Athlon, Dubailand': 'Athlon',
  'Properties For Sale in Dubai Land Residence Complex (DLRC)': 'Dubai Land Residence Complex',
  'Properties For Sale in Jumeirah Garden City, Dubai': 'Jumeirah Garden City',
  'Properties For Sale in Sobha Sanctuary at Dubailand, Dubai': 'Sobha Sanctuary',
  'Properties For SaleDesign District': 'Design District',
  'in The Old Town Island': 'Old Town',
  'in World Trade Centre': 'World Trade Centre',
  'in City of Arabia': 'City of Arabia',
  'in Culture Village': 'Culture Village',
  'Opera Grandat Downtown': 'Opera Grand',
  'Dubai Festival City (DFC)': 'Dubai Festival City',
  'Dubai Health Care City': 'Dubai Healthcare City',
};

// ═══════════════════════════════════════════════════════
//  DUPLICATES TO MERGE → [keep, ...merge]
// ═══════════════════════════════════════════════════════
const MERGES = [
  ['Dubai Creek Beach', ['Creek Beach']],
  ['Design District', ['D3', 'Dubai Design District']],
  ['Dubai Healthcare City', ['Dubai Health Care City']],
  ['Jumeirah Lake Towers', ['Jumeirah Lakes Towers']],
  ['Sheikh Zayed Road', ['Shaikh Zayed Road']],
  ['Zabeel', ["Za'abeel"]],
  ['Rashid Yachts & Marina', ['Rashid Yachts and Marina']],
  ['Mohammed Bin Rashid City', ['Mohd Bin Rashid City']],
  ['Madinat Jumeirah Living', ['MJL']],
  ['Falcon City of Wonders', ['Falconcity of Wonders']],
  ['Al Jaddaf', ['Al Jadaf']],
  ['Warsan', ['Al Warsan']],
  ['Dubai Investment Park', ['Dubai Investments Park']],
];

// CTA spam patterns to strip from descriptions
const SPAM_PATTERNS = [
  /CONTACT US FOR PAYMENT PLANS[\s\S]*?(?=<|[A-Z][a-z])/gi,
  /(?:CALL|Call)\s*(?:\+971[\s\d-]+|800-BINAYAH)/gi,
  /\+971\s*[\d\s-]+/g,
  /800-BINAYAH/gi,
  /CONTACT US[\s\S]{0,50}(?:CALL|AVAILABILITY)/gi,
  /<strong>CONTACT[\s\S]*?<\/strong>/gi,
];

// ═══ MAIN ═══
async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  Community Master Fix v3');
  console.log('═══════════════════════════════════════════════\n');
  if (DRY) console.log('  🏃 DRY RUN\n');

  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db('binayah_website_new');

  const stats = {
    renamed: 0, cityFixed: 0, metaFixed: 0,
    descCleaned: 0, expoFixed: 0, merged: 0,
    archived: 0, projRelinked: 0, descCityFixed: 0,
  };

  // ═══ STEP 1: Rename bad names ═══
  console.log('━━━ Step 1: Fix community names ━━━\n');

  for (const [oldName, newName] of Object.entries(NAME_FIXES)) {
    const comm = await db.collection('communities').findOne({ name: oldName });
    if (!comm) continue;

    // Check if newName already exists
    const existing = await db.collection('communities').findOne({ name: newName, _id: { $ne: comm._id } });

    if (existing) {
      // Merge into existing
      console.log(`  🔀 "${oldName}" → merge into "${newName}"`);
      if (!DRY) {
        const moved = await db.collection('projects').updateMany(
          { community: oldName },
          { $set: { community: newName } }
        );
        stats.projRelinked += moved.modifiedCount;
        await db.collection('communities').updateOne(
          { _id: comm._id },
          { $set: { oldName: oldName, publishStatus: 'Archived', mergedInto: newName, updatedAt: new Date() } }
        );
        stats.merged++;
      }
    } else {
      const newSlug = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      console.log(`  ✏️  "${oldName}" → "${newName}"`);
      if (!DRY) {
        await db.collection('communities').updateOne(
          { _id: comm._id },
          { $set: { oldName: oldName, name: newName, slug: newSlug, updatedAt: new Date() } }
        );
        const moved = await db.collection('projects').updateMany(
          { community: oldName },
          { $set: { community: newName } }
        );
        stats.projRelinked += moved.modifiedCount;
        stats.renamed++;
      }
    }
  }

  // ═══ STEP 2: Merge duplicates ═══
  console.log('\n━━━ Step 2: Merge duplicates ━━━\n');

  for (const [keepName, mergeNames] of MERGES) {
    for (const mergeName of mergeNames) {
      const mergeComm = await db.collection('communities').findOne({ name: mergeName });
      if (!mergeComm) continue;
      const keepComm = await db.collection('communities').findOne({ name: keepName });

      console.log(`  🔀 "${mergeName}" → "${keepName}"`);
      if (!DRY) {
        const moved = await db.collection('projects').updateMany(
          { community: mergeName },
          { $set: { community: keepName } }
        );
        stats.projRelinked += moved.modifiedCount;
        if (moved.modifiedCount) console.log(`    ↳ ${moved.modifiedCount} projects moved`);

        await db.collection('communities').updateOne(
          { _id: mergeComm._id },
          { $set: { oldName: mergeName, publishStatus: 'Archived', mergedInto: keepName, updatedAt: new Date() } }
        );

        // If keep doesn't have description but merge does, copy it
        if (keepComm && (!keepComm.description || keepComm.description.length < 50) && mergeComm.description?.length > 50) {
          await db.collection('communities').updateOne(
            { _id: keepComm._id },
            { $set: { description: mergeComm.description } }
          );
        }
        stats.merged++;
      }
    }
  }

  // ═══ STEP 3: Fix city + meta for ALL communities ═══
  console.log('\n━━━ Step 3: Fix cities & meta titles ━━━\n');

  const allComms = await db.collection('communities').find({
    publishStatus: { $ne: 'Archived' }
  }).toArray();

  for (const comm of allComms) {
    const name = comm.name;
    const correctCity = CITY_MAP[name] || 'Dubai';
    const currentCity = comm.city || 'Dubai';
    const $set = {};

    // Fix city
    if (currentCity !== correctCity) {
      $set.city = correctCity;
      stats.cityFixed++;
    }

    // Fix meta title — always use correct city
    const expectedMeta = `Properties in ${name} | ${correctCity} Real Estate`;
    if (comm.metaTitle !== expectedMeta) {
      $set.metaTitle = expectedMeta;
      stats.metaFixed++;
    }

    // Fix meta description
    const expectedMetaDesc = `Explore properties for sale and rent in ${name}, ${correctCity}. Browse off-plan projects and investment opportunities.`;
    if (!comm.metaDescription || comm.metaDescription.includes('Dubai Real Estate') && correctCity !== 'Dubai') {
      $set.metaDescription = expectedMetaDesc;
    }

    if (Object.keys($set).length > 0) {
      $set.updatedAt = new Date();
      if (!DRY) {
        await db.collection('communities').updateOne({ _id: comm._id }, { $set });
      }
      if ($set.city) console.log(`  🌍 ${name}: ${currentCity} → ${correctCity}`);
    }

    // Also fix city on projects
    if (correctCity !== 'Dubai') {
      if (!DRY) {
        await db.collection('projects').updateMany(
          { community: name, city: { $ne: correctCity } },
          { $set: { city: correctCity } }
        );
      }
    }
  }

  console.log(`  Cities fixed: ${stats.cityFixed}`);
  console.log(`  Metas fixed: ${stats.metaFixed}`);

  // ═══ STEP 4: Clean CTA spam from descriptions ═══
  console.log('\n━━━ Step 4: Strip phone/CTA spam from descriptions ━━━\n');

  for (const comm of allComms) {
    let desc = comm.description || '';
    let changed = false;

    for (const pat of SPAM_PATTERNS) {
      const newDesc = desc.replace(pat, '');
      if (newDesc !== desc) { desc = newDesc; changed = true; }
    }

    // Clean up empty tags left behind
    desc = desc.replace(/<p>\s*<\/p>/g, '')
               .replace(/<strong>\s*<\/strong>/g, '')
               .replace(/<b>\s*<\/b>/g, '')
               .replace(/\t+/g, '')
               .replace(/\n{3,}/g, '\n\n')
               .trim();

    if (changed) {
      stats.descCleaned++;
      if (!DRY) {
        await db.collection('communities').updateOne(
          { _id: comm._id },
          { $set: { description: desc, updatedAt: new Date() } }
        );
      }
    }
  }
  console.log(`  Descriptions cleaned: ${stats.descCleaned}`);

  // ═══ STEP 5: Fix Expo 2020 references ═══
  console.log('\n━━━ Step 5: Fix Expo 2020 references ━━━\n');

  const expoComms = await db.collection('communities').find({
    description: { $regex: 'Expo 2020', $options: 'i' }
  }).toArray();

  for (const comm of expoComms) {
    let desc = comm.description
      .replace(/Expo 2020/gi, 'Expo City Dubai')
      .replace(/the upcoming Expo/gi, 'the Expo City development')
      .replace(/will host the World Expo/gi, 'hosted the World Expo 2020')
      .replace(/is set to host/gi, 'hosted')
      .replace(/designed to host the World Expo 2020/gi, 'which hosted the World Expo 2020 and has since become a vibrant urban district');

    if (!DRY) {
      await db.collection('communities').updateOne(
        { _id: comm._id },
        { $set: { description: desc, updatedAt: new Date() } }
      );
    }
    stats.expoFixed++;
  }
  console.log(`  Expo references fixed: ${stats.expoFixed}`);

  // ═══ STEP 6: Fix wrong city in AI descriptions ═══
  console.log('\n━━━ Step 6: Fix wrong city in AI descriptions ━━━\n');

  const cityFixPairs = [
    ['Zayed City', 'Abu Dhabi'],
    ['Hayat Island', 'Umm Al Quwain'],
    ['Siniya Island', 'Umm Al Quwain'],
  ];

  for (const [name, city] of cityFixPairs) {
    const comm = await db.collection('communities').findOne({ name });
    if (!comm) continue;
    let desc = comm.description || '';
    if (desc.toLowerCase().includes('dubai') && !desc.toLowerCase().includes(city.toLowerCase())) {
      // Replace "in Dubai" / "in the heart of Dubai" etc. with correct city
      desc = desc.replace(/in Dubai/gi, `in ${city}`)
                 .replace(/in the heart of Dubai/gi, `in ${city}`)
                 .replace(/located in Dubai/gi, `located in ${city}`);
      if (!DRY) {
        await db.collection('communities').updateOne(
          { _id: comm._id },
          { $set: { description: desc, updatedAt: new Date() } }
        );
      }
      console.log(`  ✏️  ${name}: Dubai → ${city} in description`);
      stats.descCityFixed++;
    }
  }

  // ═══ STEP 7: Recount projects & archive orphans ═══
  console.log('\n━━━ Step 7: Recount projects & archive orphans ━━━\n');

  const freshComms = await db.collection('communities').find({
    publishStatus: { $ne: 'Archived' }
  }).toArray();

  let active = 0;
  for (const comm of freshComms) {
    const count = await db.collection('projects').countDocuments({
      community: comm.name, publishStatus: 'Published'
    });

    if (count === 0) {
      if (!DRY) {
        await db.collection('communities').updateOne(
          { _id: comm._id },
          { $set: { oldName: comm.oldName || comm.name, publishStatus: 'Archived', projectCount: 0, updatedAt: new Date() } }
        );
      }
      stats.archived++;
    } else {
      active++;
      if (!DRY) {
        await db.collection('communities').updateOne(
          { _id: comm._id },
          { $set: { projectCount: count, updatedAt: new Date() } }
        );
      }
    }
  }

  console.log(`  Active: ${active}`);
  console.log(`  Archived (0 projects): ${stats.archived}`);

  // ═══ REPORT ═══
  console.log('\n═══════════════════════════════════════════════');
  console.log('            CLEANUP REPORT');
  console.log('═══════════════════════════════════════════════\n');

  console.log(`  Renamed:                ${stats.renamed}`);
  console.log(`  Merged:                 ${stats.merged}`);
  console.log(`  Cities fixed:           ${stats.cityFixed}`);
  console.log(`  Meta titles fixed:      ${stats.metaFixed}`);
  console.log(`  Descriptions cleaned:   ${stats.descCleaned}`);
  console.log(`  Expo 2020 fixed:        ${stats.expoFixed}`);
  console.log(`  Desc city fixed:        ${stats.descCityFixed}`);
  console.log(`  Archived (0 projects):  ${stats.archived}`);
  console.log(`  Projects relinked:      ${stats.projRelinked}`);
  console.log();

  // Show top communities by city
  const topByCity = {};
  const finalComms = await db.collection('communities').find(
    { publishStatus: 'Published' },
    { projection: { name: 1, city: 1, projectCount: 1 } }
  ).sort({ projectCount: -1 }).toArray();

  for (const c of finalComms) {
    const city = CITY_MAP[c.name] || c.city || 'Dubai';
    if (!topByCity[city]) topByCity[city] = [];
    topByCity[city].push(c);
  }

  for (const [city, comms] of Object.entries(topByCity).sort()) {
    const total = comms.reduce((s, c) => s + (c.projectCount || 0), 0);
    console.log(`\n  ${city} (${comms.length} communities, ${total} projects):`);
    for (const c of comms.slice(0, 5)) {
      console.log(`    ${(c.name || '').padEnd(35)} ${c.projectCount || 0} projects`);
    }
    if (comms.length > 5) console.log(`    ... and ${comms.length - 5} more`);
  }

  console.log('\n✅ Done');
  await client.close();
}

main().catch(e => { console.error('❌', e); process.exit(1); });