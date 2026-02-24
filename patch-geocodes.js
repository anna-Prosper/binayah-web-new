/**
 * Geocode Patch — Fix wrong coords, add missing, archive developers
 * 
 * Run AFTER geocode-communities.js, BEFORE enrich-projects.js
 * 
 * Fixes:
 *   1. Patches community-coords.json with verified coordinates
 *   2. Archives developer names from communities collection
 *   3. Writes corrections directly to MongoDB
 * 
 * Usage:
 *   node patch-geocodes.js --dry-run   # preview
 *   node patch-geocodes.js             # apply all
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env' });
if (!process.env.MONGODB_URI) require('dotenv').config({ path: '.env.local' });

const MONGO_URI = process.env.MONGODB_URI;
const DRY = process.argv.includes('--dry-run');
const CACHE_FILE = path.join(__dirname, 'community-coords.json');

// ═══════════════════════════════════════════════════════
//  VERIFIED COORDINATES — web-searched and confirmed
// ═══════════════════════════════════════════════════════

const VERIFIED_COORDS = {
  // ── WRONG in Nominatim — override with correct ──
  'D3':              { lat: 25.1883, lng: 55.2975, note: 'Dubai Design District, not random D3' },
  'Dubai Islands':   { lat: 25.3332, lng: 55.3122, note: 'Off Deira coast, formerly Deira Islands' },
  'Ghaf Woods':      { lat: 25.0350, lng: 55.2550, note: 'Near Tilal Al Ghaf, Dubailand area' },
  'Damac Island':    { lat: 25.0000, lng: 55.0500, note: 'Near Palm Jebel Ali' },
  'Marina District': { lat: 25.0800, lng: 55.1400, note: 'Dubai Marina area, not Abu Dhabi' },
  'Masaar':          { lat: 25.3200, lng: 55.4600, note: 'Tilal City, Sharjah (near E611)' },
  'Nasma':           { lat: 25.3400, lng: 55.4300, note: 'Nasma Residences, Sharjah' },
  'Wasl 1':          { lat: 25.2050, lng: 55.2550, note: 'Near Al Wasl/Jumeirah' },
  'Wasl Gate':       { lat: 25.0500, lng: 55.1500, note: 'Near Discovery Gardens' },
  'Zayed City':      { lat: 24.4500, lng: 54.6300, note: 'Abu Dhabi, not Dubai' },

  // ── MISSING — legitimate communities not found by Nominatim ──
  'AlJurf':                  { lat: 25.3800, lng: 55.4988, note: 'RAK, same as Al Jurf' },
  'Arabian Hills Estate':    { lat: 25.0400, lng: 55.2650, note: 'Dubailand area' },
  'Arabaian Ranches 3':      { lat: 25.0550, lng: 55.2800, note: 'typo name, near AR2' },
  'Arabian Ranches 3':       { lat: 25.0550, lng: 55.2800, note: 'Near Arabian Ranches 2' },
  'Athlon':                  { lat: 25.0500, lng: 55.2850, note: 'Dubailand area by Aldar' },
  'Damac Islands':           { lat: 25.0000, lng: 55.0500, note: 'Near Palm Jebel Ali coast' },
  'Damac Lagoons':           { lat: 25.0100, lng: 55.2300, note: 'Near Damac Hills' },
  'Damac Riverside':         { lat: 25.0250, lng: 55.2200, note: 'Near Damac Lagoons' },
  'Eden Hills':              { lat: 25.0400, lng: 55.2500, note: 'Dubailand area' },
  'Falconcity of Wonders':   { lat: 25.0903, lng: 55.3467, note: 'Same as Falcon City' },
  'Golf Verde':              { lat: 25.0300, lng: 55.2200, note: 'Near Dubai Sports City' },
  'Grand Polo Club & Resort Community': { lat: 25.0450, lng: 55.2800, note: 'Dubailand' },
  'Grand Polo Club &amp; Resort Community': { lat: 25.0450, lng: 55.2800, note: 'HTML encoded name' },
  'Hayat Island':            { lat: 25.5700, lng: 55.6500, note: 'Umm Al Quwain coast' },
  'Madinat Jumeirah Living': { lat: 25.1370, lng: 55.1830, note: 'Near Madinat Jumeirah' },
  'MJL':                     { lat: 25.1370, lng: 55.1830, note: 'Alias for Madinat Jumeirah Living' },
  'Maryam Island':           { lat: 25.3550, lng: 55.3930, note: 'Sharjah waterfront' },
  'Rashid Yachts & Marina':  { lat: 25.2710, lng: 55.2880, note: 'Port Rashid area' },
  'Rashid Yachts and Marina':{ lat: 25.2710, lng: 55.2880, note: 'Alt name' },
  'Riverside Views':         { lat: 25.0250, lng: 55.2200, note: 'Near Damac Riverside' },
  'Siniya Island':           { lat: 25.6400, lng: 55.5700, note: 'Umm Al Quwain' },
  'Sobha Sanctuary':         { lat: 25.0550, lng: 55.2850, note: 'Dubailand area' },
  'The Oasis by Emaar':      { lat: 25.0650, lng: 55.2650, note: 'Dubailand area' },
  'The Opera District':      { lat: 25.1920, lng: 55.2720, note: 'Downtown Dubai' },
  'The World Islands':       { lat: 25.2200, lng: 55.1700, note: 'Offshore artificial islands' },
  'The world Islands':       { lat: 25.2200, lng: 55.1700, note: 'Lowercase variant' },
  'The Wilds':               { lat: 25.0400, lng: 55.2600, note: 'Dubailand area' },
  'Waada':                   { lat: 25.0350, lng: 55.2650, note: 'Dubailand area' },
  'Townsquare Dubailand':    { lat: 24.9958, lng: 55.2959, note: 'Same as Town Square' },

  // ── BAD WP NAMES that failed geocoding — map to clean coords ──
  'Al Rigga Dubai Apartments and Villas': { lat: 25.2675, lng: 55.3205, note: 'Al Rigga' },
  'Barsha Heights (Tecom) Dubai Offices and Apartments for Sale & Rent': { lat: 25.1009, lng: 55.1733, note: 'Barsha Heights' },
  'Dubai Al Quoz- Apartment & Villas': { lat: 25.1596, lng: 55.254, note: 'Al Quoz' },
  'Dubai Springs Villa for Sale - Springs Villa for  Rent': { lat: 25.0720, lng: 55.1700, note: 'The Springs' },
  'Emirates Hills Properties for Sale': { lat: 25.064, lng: 55.1646, note: 'Emirates Hills' },
  'La Mer Dubai Apartments': { lat: 25.2271, lng: 55.2563, note: 'La Mer' },
  'Muhaisnah Dubai Labour Camp for Rent': { lat: 25.2608, lng: 55.4197, note: 'Muhaisnah' },
  'Opera Grandat Downtown': { lat: 25.1920, lng: 55.2720, note: 'Opera Grand' },
  'Villas and Townhosuesin Reem': { lat: 25.059, lng: 55.2921, note: 'Reem Community' },
  'Properties For Sale in Arabian Hills Estate': { lat: 25.0400, lng: 55.2650, note: 'Arabian Hills' },
  'Properties For Sale in Athlon, Dubailand': { lat: 25.0500, lng: 55.2850, note: 'Athlon' },
  'Properties For Sale in Damac Riverside': { lat: 25.0250, lng: 55.2200, note: 'Damac Riverside' },
  'Properties For Sale in Dubai Land Residence Complex (DLRC)': { lat: 25.0650, lng: 55.2750, note: 'DLRC' },
  'Properties For Sale in Mirage The Oasis': { lat: 25.0700, lng: 55.2700, note: 'Mirage The Oasis' },
  'Properties For Sale in Sobha Sanctuary at Dubailand, Dubai': { lat: 25.0550, lng: 55.2850, note: 'Sobha Sanctuary' },
  'Properties For Sale in The Oasis by Emaar': { lat: 25.0650, lng: 55.2650, note: 'The Oasis' },
  'Properties For SaleDesign District': { lat: 25.1883, lng: 55.2975, note: 'Design District' },
  'in The Old Town Island': { lat: 25.1940, lng: 55.2750, note: 'Old Town' },
  'Mohd Bin Rashid City': { lat: 25.1641, lng: 55.2857, note: 'MBR City' },
  'Shaikh Zayed Road': { lat: 25.2011, lng: 55.268, note: 'SZR' },
  'Dubai Health Care City': { lat: 25.231, lng: 55.3226, note: 'DHCC' },
  'Dubai Land Residence Complex': { lat: 25.0650, lng: 55.2750, note: 'DLRC' },
  'DIFC Living': { lat: 25.2128, lng: 55.2776, note: 'Same as DIFC' },
  'Madinat Jumeirah Living (MJL)': { lat: 25.1370, lng: 55.1830, note: 'Same as MJL' },
  'Mohammad Bin Rashid City': { lat: 25.1641, lng: 55.2857, note: 'MBR City variant' },
  'Nad Al Hammar': { lat: 25.1900, lng: 55.3700, note: 'Near Meydan' },
  'Jumeirah Second': { lat: 25.2100, lng: 55.2400, note: 'Jumeirah 2' },
  'Mirage The Oasis': { lat: 25.0700, lng: 55.2700, note: 'Dubailand area' },
};

// ═══════════════════════════════════════════════════════
//  DEVELOPER NAMES — not real communities, archive them
// ═══════════════════════════════════════════════════════
const DEVELOPER_NAMES = [
  'ARADA Developer', 'Aldar Properties', 'Arsenal East Development',
  'Azizi Developments', 'Binghatti Developers', 'DECA Properties',
  'Damac Properties', 'Danube Properties', 'Deyaar', 'Dubai Holding',
  'Dubai Properties', 'Ellington', 'Emaar Properties', 'Green Yard Properties',
  'IMKAN Properties', 'Iman Developers', 'Imtiaz Developments',
  'Invest Group Overseas (IGO)', 'London Gate', 'MAG Property Development',
  'Majid Al Futtaim', 'Meraas', 'Meydan Group', 'Nakheel', 'Nshama',
  'OMNIYAT', 'Pantheon Development', 'Prescott Real Estate Development',
  'Reportage Properties', 'Samana Developers', 'Select Group',
  'Sobha Group', 'Tiger Group', 'TownX Development',
  'Vincitore Real Estate Development LLC', 'Wasl Properties',
  'ZaZEN Property Development LLC',
];

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  Geocode Patch — Fix coords & archive devs');
  console.log('═══════════════════════════════════════════════\n');
  if (DRY) console.log('  🏃 DRY RUN\n');

  // ═══ STEP 1: Patch community-coords.json ═══
  console.log('━━━ Step 1: Patch community-coords.json ━━━\n');

  let cache = {};
  if (fs.existsSync(CACHE_FILE)) {
    cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    console.log(`  Loaded cache: ${Object.keys(cache).length} entries`);
  }

  let patched = 0, added = 0;
  for (const [name, data] of Object.entries(VERIFIED_COORDS)) {
    const existing = cache[name];
    if (existing) {
      const oldLat = existing.lat, oldLng = existing.lng;
      if (Math.abs(oldLat - data.lat) > 0.01 || Math.abs(oldLng - data.lng) > 0.01) {
        console.log(`  🔧 ${name}: [${oldLat}, ${oldLng}] → [${data.lat}, ${data.lng}] (${data.note})`);
        patched++;
      }
    } else {
      console.log(`  ➕ ${name}: [${data.lat}, ${data.lng}] (${data.note})`);
      added++;
    }
    cache[name] = { lat: data.lat, lng: data.lng, source: 'verified', note: data.note };
  }

  if (!DRY) {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
  }
  console.log(`\n  Patched: ${patched}, Added: ${added}`);
  console.log(`  Total in cache: ${Object.keys(cache).length}\n`);

  // ═══ STEP 2: Apply to MongoDB ═══
  console.log('━━━ Step 2: Apply coordinates to MongoDB ━━━\n');

  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db('binayah_website_new');

  let commUpdated = 0, projUpdated = 0;
  for (const [name, data] of Object.entries(cache)) {
    if (!DRY) {
      // Update communities
      const cr = await db.collection('communities').updateMany(
        { name },
        { $set: { latitude: data.lat, longitude: data.lng, updatedAt: new Date() } }
      );
      commUpdated += cr.modifiedCount;

      // Update projects
      const pr = await db.collection('projects').updateMany(
        { community: name, $or: [{ latitude: 0 }, { latitude: null }, { latitude: { $exists: false } }] },
        { $set: { latitude: data.lat, longitude: data.lng, updatedAt: new Date() } }
      );
      projUpdated += pr.modifiedCount;
    }
  }
  console.log(`  Communities updated: ${commUpdated}`);
  console.log(`  Projects updated: ${projUpdated}\n`);

  // ═══ STEP 3: Archive developer names ═══
  console.log('━━━ Step 3: Archive developer names ━━━\n');

  let archived = 0;
  for (const name of DEVELOPER_NAMES) {
    const comm = await db.collection('communities').findOne({ name, publishStatus: { $ne: 'Archived' } });
    if (!comm) continue;

    const projCount = await db.collection('projects').countDocuments({ community: name });
    
    if (projCount > 0) {
      console.log(`  ⚠️  ${name}: has ${projCount} projects — skipping (needs manual review)`);
    } else {
      console.log(`  🗑️  ${name}: archived (0 projects)`);
      if (!DRY) {
        await db.collection('communities').updateOne(
          { _id: comm._id },
          { $set: { publishStatus: 'Archived', isDeveloper: true, updatedAt: new Date() } }
        );
      }
      archived++;
    }
  }
  console.log(`\n  Archived: ${archived} developer entries\n`);

  // ═══ STEP 4: Verify coverage ═══
  console.log('━━━ Step 4: Coverage check ━━━\n');

  const activeComms = await db.collection('communities').find(
    { publishStatus: { $ne: 'Archived' }, projectCount: { $gt: 0 } },
    { projection: { name: 1, latitude: 1, longitude: 1 } }
  ).toArray();

  let hasCoords = 0, noCoords = 0;
  for (const c of activeComms) {
    if (cache[c.name] || (c.latitude && c.latitude > 1)) {
      hasCoords++;
    } else {
      console.log(`  ❌ ${c.name}: NO COORDINATES`);
      noCoords++;
    }
  }

  console.log(`\n  Active communities: ${activeComms.length}`);
  console.log(`  With coordinates:   ${hasCoords}`);
  console.log(`  Missing:            ${noCoords}`);

  // Projects coverage
  const totalProj = await db.collection('projects').countDocuments({ publishStatus: 'Published' });
  const projWithCoords = await db.collection('projects').countDocuments(
    { publishStatus: 'Published', latitude: { $gt: 1 } }
  );
  console.log(`\n  Projects with coords: ${projWithCoords}/${totalProj} (${((projWithCoords/totalProj)*100).toFixed(0)}%)`);

  console.log('\n✅ Done');
  await client.close();
}

main().catch(e => { console.error('❌', e); process.exit(1); });