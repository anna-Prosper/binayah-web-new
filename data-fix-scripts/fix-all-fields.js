/**
 * AI-Powered Project Data Fixer
 * 
 * Combines:
 * 1. Community matching (local + AI)
 * 2. Address fixing
 * 3. Missing field extraction from fullDescription using Claude
 * 
 * Fields filled: community, address, startingPrice, completionDate,
 *   unitTypes, unitSizeMin, unitSizeMax, titleType, paymentPlanSummary,
 *   downPayment, amenities, shortOverview, developerName
 * 
 * Usage: node fix-all-fields.js
 * Env: MONGODB_URI, OPENAI_API_KEY in .env
 * 
 * Also enriches communities collection with AI-generated descriptions
 */

const { MongoClient } = require('mongodb');
// Try .env first, then .env.local
require('dotenv').config({ path: '.env' });
if (!process.env.MONGODB_URI) require('dotenv').config({ path: '.env.local' });

const MONGO_URI = process.env.MONGODB_URI;
const API_KEY = process.env.OPENAI_API_KEY || '';

if (!MONGO_URI) { console.error('❌ MONGODB_URI missing'); process.exit(1); }
if (!API_KEY) { console.error('❌ OPENAI_API_KEY missing'); process.exit(1); }

// ═══ UTILS ═══

function stripHtml(html) {
  return (html || '').replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#\d+;/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

function normalize(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

function isSameCommunity(a, b) {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return true;
  if (na.includes(nb) || nb.includes(na)) return true;
  const abbrs = [
    [/\bjvt\b/, 'jumeirah village triangle'],
    [/\bjvc\b/, 'jumeirah village circle'],
    [/\bjlt\b/, 'jumeirah lake towers'],
    [/\bjbr\b/, 'jumeirah beach residence'],
    [/\bmbr city\b/, 'mohammed bin rashid city'],
    [/\bdifc\b/, 'dubai international financial centre'],
    [/\bdso\b/, 'dubai silicon oasis'],
    [/\bdip\b/, 'dubai investment park'],
    [/\bdwc\b/, 'dubai world central'],
  ];
  let ea = na, eb = nb;
  for (const [a, f] of abbrs) { ea = ea.replace(a, f); eb = eb.replace(a, f); }
  if (ea === eb || ea.includes(eb) || eb.includes(ea)) return true;
  return false;
}

function findExistingMatch(name, communities) {
  for (const c of communities) {
    if (isSameCommunity(name, c.name)) return c.name;
  }
  return null;
}

// ═══ CLAUDE API ═══

async function callGPT(prompt, maxTokens = 4096) {
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: maxTokens,
      temperature: 0.1,
      messages: [
        { role: 'system', content: 'You are a Dubai real estate data expert. Always respond with valid JSON arrays only, no markdown or extra text.' },
        { role: 'user', content: prompt }
      ],
    }),
  });
  if (!resp.ok) throw new Error(`API error ${resp.status}: ${await resp.text()}`);
  const data = await resp.json();
  const text = data.choices?.[0]?.message?.content || '';
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return [];
  try { return JSON.parse(match[0]); } catch { return []; }
}

async function extractFieldsBatch(projects) {
  const items = projects.map((p, i) => {
    const desc = stripHtml(p.fullDescription || '').slice(0, 800);
    const existing = [];
    if (p.community) existing.push(`community: ${p.community}`);
    if (p.developerName) existing.push(`developer: ${p.developerName}`);
    if (p.startingPrice) existing.push(`price: ${p.startingPrice}`);
    if (p.completionDate) existing.push(`completion: ${p.completionDate}`);
    return `[${i}] Name: ${p.name}\nSlug: ${p.slug}\nExisting: ${existing.join(', ') || 'none'}\nDescription: ${desc}`;
  }).join('\n\n');

  const prompt = `You are a Dubai real estate data extraction expert. For each project, extract ALL available data from the name, slug, and description.

Return a JSON array where each item has:
{
  "index": 0,
  "community": "string - the real Dubai area/neighborhood (e.g. Dubai Marina, JVC, Downtown Dubai). Must be a REAL place, not an amenity or marketing phrase.",
  "address": "string - Community, Dubai, UAE (or relevant emirate)",
  "developerName": "string - the real estate developer if mentioned",
  "startingPrice": number or null - price in AED (no formatting, just the number),
  "completionDate": "string - e.g. Q4 2027, March 2026, 2028, etc.",
  "unitTypes": ["Studio", "1 Bedroom", "2 Bedroom", etc.] or null,
  "unitSizeMin": number or null - minimum sqft,
  "unitSizeMax": number or null - maximum sqft,
  "titleType": "Freehold" or "Leasehold" or null,
  "paymentPlanSummary": "string - e.g. 60/40, 20/80, etc." or null,
  "downPayment": "string - e.g. 10%, 20%" or null,
  "amenities": ["pool", "gym", ...] or null - max 10 items,
  "shortOverview": "string - 1-2 sentence summary for cards" or null
}

Rules:
- ONLY extract data that is CLEARLY stated or strongly implied. Do NOT guess.
- community must be a REAL Dubai neighborhood/area, NOT an amenity like "swimming pool"
- If you find "at [Area]" or "in [Area]" in the name, that's likely the community
- If the developer is in the name (e.g. "by Emaar", "by Damac"), extract it
- For existing fields that are already set, you can skip them (return null)
- Return "Unknown" for community ONLY if you genuinely cannot determine it
- startingPrice must be a raw number in AED (e.g. 1500000 not "1.5M")

Projects:
${items}`;

  return await callGPT(prompt);
}

// ═══ MAIN ═══

async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  console.log('✅ Connected\n');
  const db = client.db('binayah_website_new');

  // ═══ STEP 1: LOAD COMMUNITIES ═══
  let communities = await db.collection('communities').find(
    { publishStatus: 'Published' },
    { projection: { name: 1, slug: 1, _id: 1 } }
  ).toArray();
  communities.sort((a, b) => b.name.length - a.name.length);
  console.log(`Existing communities: ${communities.length}`);

  // ═══ STEP 2: LOCAL COMMUNITY MATCH ═══
  console.log('\n--- Step 1: Local community matching ---');
  const emptyComm = await db.collection('projects').find(
    { $or: [{ community: '' }, { community: null }] },
    { projection: { name: 1, slug: 1, fullDescription: 1, _id: 1 } }
  ).toArray();
  console.log(`Projects needing community: ${emptyComm.length}`);

  let localMatched = 0;
  const stillUnmatched = [];

  for (const p of emptyComm) {
    const nameText = [p.name || '', (p.slug || '').replace(/-/g, ' ')].join(' ').toLowerCase();
    const descText = stripHtml(p.fullDescription || '').toLowerCase();
    let found = null;

    for (const c of communities) {
      const cn = c.name.toLowerCase();
      const cs = (c.slug || '').replace(/-/g, ' ');
      if (nameText.includes(cn) || nameText.includes(cs)) { found = c.name; break; }
    }
    if (!found) {
      for (const c of communities) {
        const cn = c.name.toLowerCase();
        if (cn.length < 4) continue;
        try {
          const re = new RegExp('\\b' + cn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
          if (re.test(descText)) { found = c.name; break; }
        } catch { continue; }
      }
    }

    if (found) {
      await db.collection('projects').updateOne(
        { _id: p._id },
        { $set: { community: found, address: found + ', Dubai, UAE' } }
      );
      localMatched++;
    } else {
      stillUnmatched.push(p);
    }
  }
  console.log(`  Local matched: ${localMatched}`);

  // ═══ STEP 3: AI EXTRACTION (communities + all fields) ═══
  // Get ALL projects that need any field filled
  const allProjects = await db.collection('projects').find(
    { publishStatus: 'Published' },
    { projection: {
      name: 1, slug: 1, community: 1, address: 1, developerName: 1,
      startingPrice: 1, completionDate: 1, unitTypes: 1, unitSizeMin: 1,
      unitSizeMax: 1, titleType: 1, paymentPlanSummary: 1, downPayment: 1,
      amenities: 1, shortOverview: 1, fullDescription: 1, _id: 1
    } }
  ).toArray();

  // Filter to projects missing at least one important field
  const needsAI = allProjects.filter(p => {
    const missing = [];
    if (!p.community) missing.push('community');
    if (!p.startingPrice) missing.push('price');
    if (!p.completionDate) missing.push('completion');
    if (!p.unitTypes || !p.unitTypes.length) missing.push('unitTypes');
    if (!p.amenities || !p.amenities.length) missing.push('amenities');
    if (!p.shortOverview) missing.push('overview');
    if (!p.developerName) missing.push('developer');
    return missing.length >= 2; // at least 2 missing fields
  });

  console.log(`\n--- Step 2: AI field extraction ---`);
  console.log(`  Projects needing AI: ${needsAI.length}`);

  const BATCH = 10;
  let aiUpdated = 0;
  let aiFailed = 0;
  const newCommunityMap = new Map();

  for (let i = 0; i < needsAI.length; i += BATCH) {
    const batch = needsAI.slice(i, i + BATCH);
    process.stdout.write(`\r  Processing ${Math.min(i + BATCH, needsAI.length)}/${needsAI.length}... (${aiUpdated} updated)`);

    try {
      const results = await extractFieldsBatch(batch);

      for (const r of results) {
        if (!r || r.index == null) continue;
        const project = batch[r.index];
        if (!project) continue;

        const $set = {};

        // Community
        if (r.community && r.community !== 'Unknown' && !project.community) {
          const existing = findExistingMatch(r.community, communities);
          const communityName = existing || r.community.trim();
          $set.community = communityName;
          if (!existing) {
            newCommunityMap.set(communityName, (newCommunityMap.get(communityName) || 0) + 1);
          }
        }

        // Address
        if (r.address && (!project.address || project.address === '' || project.address === '0,0,0')) {
          $set.address = r.address;
        }

        // Developer
        if (r.developerName && !project.developerName) {
          $set.developerName = r.developerName;
        }

        // Starting price
        if (r.startingPrice && !project.startingPrice) {
          const price = Number(r.startingPrice);
          if (price > 50000 && price < 500000000) { // sanity check
            $set.startingPrice = price;
          }
        }

        // Completion date
        if (r.completionDate && !project.completionDate) {
          $set.completionDate = r.completionDate;
        }

        // Unit types
        if (r.unitTypes && Array.isArray(r.unitTypes) && r.unitTypes.length &&
            (!project.unitTypes || !project.unitTypes.length)) {
          $set.unitTypes = r.unitTypes;
        }

        // Unit sizes
        if (r.unitSizeMin && !project.unitSizeMin) {
          const min = Number(r.unitSizeMin);
          if (min > 100 && min < 50000) $set.unitSizeMin = min;
        }
        if (r.unitSizeMax && !project.unitSizeMax) {
          const max = Number(r.unitSizeMax);
          if (max > 100 && max < 50000) $set.unitSizeMax = max;
        }

        // Title type
        if (r.titleType && !project.titleType) {
          $set.titleType = r.titleType;
        }

        // Payment plan
        if (r.paymentPlanSummary && !project.paymentPlanSummary) {
          $set.paymentPlanSummary = r.paymentPlanSummary;
        }
        if (r.downPayment && !project.downPayment) {
          $set.downPayment = r.downPayment;
        }

        // Amenities
        if (r.amenities && Array.isArray(r.amenities) && r.amenities.length &&
            (!project.amenities || !project.amenities.length)) {
          $set.amenities = r.amenities.slice(0, 15);
        }

        // Short overview
        if (r.shortOverview && !project.shortOverview) {
          $set.shortOverview = r.shortOverview;
        }

        if (Object.keys($set).length > 0) {
          $set.updatedAt = new Date();
          await db.collection('projects').updateOne({ _id: project._id }, { $set });
          aiUpdated++;
        }
      }

      // Rate limit
      await new Promise(r => setTimeout(r, 1200));

    } catch (e) {
      aiFailed++;
      console.error(`\n  Batch error at ${i}: ${e.message}`);
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  console.log(`\n  AI updated: ${aiUpdated}`);
  console.log(`  AI failed batches: ${aiFailed}`);

  // ═══ STEP 4: ADD NEW COMMUNITIES ═══
  if (newCommunityMap.size > 0) {
    console.log(`\n--- Step 3: Adding ${newCommunityMap.size} new communities ---`);
    // Refresh communities list
    communities = await db.collection('communities').find(
      { publishStatus: 'Published' },
      { projection: { name: 1, slug: 1, _id: 1 } }
    ).toArray();

    const newDocs = [];
    for (const [name, count] of newCommunityMap) {
      const dupe = findExistingMatch(name, communities);
      if (dupe) {
        console.log(`  Skip dupe: "${name}" → "${dupe}"`);
        await db.collection('projects').updateMany(
          { community: name }, { $set: { community: dupe } }
        );
        continue;
      }
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      newDocs.push({
        name, slug,
        description: '',
        featuredImage: '',
        metaTitle: name + ' - Properties in Dubai',
        metaDescription: 'Find properties for sale and rent in ' + name + ', Dubai.',
        publishStatus: 'Published',
        viewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`  + ${name} (${count} projects)`);
    }
    if (newDocs.length > 0) {
      await db.collection('communities').insertMany(newDocs);
      console.log(`  Inserted ${newDocs.length} new communities`);
    }
  }

  // ═══ STEP 5: FIX REMAINING ADDRESSES ═══
  console.log('\n--- Step 4: Fix remaining addresses ---');
  const noAddr = await db.collection('projects').find(
    { $or: [{ address: '' }, { address: null }, { address: '0,0,0' }] },
    { projection: { community: 1, _id: 1 } }
  ).toArray();
  let addrFixed = 0;
  for (const p of noAddr) {
    const addr = p.community ? p.community + ', Dubai, UAE' : 'Dubai, UAE';
    await db.collection('projects').updateOne({ _id: p._id }, { $set: { address: addr } });
    addrFixed++;
  }
  console.log(`  Fixed: ${addrFixed}`);

  // ═══ STEP 6: ENRICH COMMUNITIES WITH AI ═══
  console.log('\n--- Step 5: Enrich communities from projects ---');

  const allCommunities = await db.collection('communities').find(
    { publishStatus: 'Published' }
  ).toArray();

  // Find communities missing description or with empty description
  const needsEnrich = allCommunities.filter(c =>
    !c.description || stripHtml(c.description).length < 50
  );
  console.log(`  Communities needing enrichment: ${needsEnrich.length}/${allCommunities.length}`);

  const COMM_BATCH = 5;
  let commEnriched = 0;

  for (let i = 0; i < needsEnrich.length; i += COMM_BATCH) {
    const batch = needsEnrich.slice(i, i + COMM_BATCH);
    process.stdout.write(`\r  Enriching ${Math.min(i + COMM_BATCH, needsEnrich.length)}/${needsEnrich.length}...`);

    // For each community, gather its projects info
    const commData = [];
    for (let j = 0; j < batch.length; j++) {
      const c = batch[j];
      const projInComm = await db.collection('projects').find(
        { community: c.name, publishStatus: 'Published' },
        { projection: { name: 1, developerName: 1, startingPrice: 1, unitTypes: 1, propertyType: 1 } }
      ).limit(20).toArray();

      const projSummary = projInComm.map(p => {
        const parts = [p.name];
        if (p.developerName) parts.push(`by ${p.developerName}`);
        if (p.startingPrice) parts.push(`from AED ${(p.startingPrice / 1e6).toFixed(1)}M`);
        if (p.unitTypes?.length) parts.push(p.unitTypes.join(', '));
        return parts.join(' - ');
      }).join('\n');

      commData.push(`[${j}] Community: ${c.name}\nSlug: ${c.slug}\nProject count: ${projInComm.length}\nExisting description: ${stripHtml(c.description || '').slice(0, 100) || 'none'}\nProjects:\n${projSummary || 'no projects'}`);
    }

    try {
      const prompt = `You are a Dubai real estate content writer. For each community below, generate:
1. description - An SEO-friendly HTML description (2-3 paragraphs wrapped in <p> tags). Cover: location highlights, lifestyle, property types available, nearby landmarks, investment appeal. Professional tone.
2. metaTitle - SEO title like "Properties in [Community] | Dubai Real Estate"  
3. metaDescription - 155 character SEO meta description

Use the project data to make descriptions accurate (mention actual developers, price ranges, unit types when available).

Return ONLY a JSON array:
[{"index": 0, "description": "<p>...</p><p>...</p>", "metaTitle": "...", "metaDescription": "..."}]

Communities:
${commData.join('\n\n')}`;

      const results = await callGPT(prompt, 8192);

      for (const r of results) {
        if (!r || r.index == null) continue;
        const comm = batch[r.index];
        if (!comm) continue;

        const $set = {};
        if (r.description) $set.description = r.description;
        if (r.metaTitle) $set.metaTitle = r.metaTitle;
        if (r.metaDescription) $set.metaDescription = r.metaDescription;

        if (Object.keys($set).length > 0) {
          $set.updatedAt = new Date();
          await db.collection('communities').updateOne({ _id: comm._id }, { $set });
          commEnriched++;
        }
      }

      await new Promise(r => setTimeout(r, 1200));

    } catch (e) {
      console.error(`\n  Community batch error at ${i}: ${e.message}`);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  console.log(`\n  Communities enriched: ${commEnriched}`);

  // ═══ STEP 7: LINK COMMUNITY PROJECT COUNTS ═══
  console.log('\n--- Step 6: Update community project counts ---');
  const commProjectCounts = await db.collection('projects').aggregate([
    { $match: { publishStatus: 'Published', community: { $ne: '', $ne: null } } },
    { $group: { _id: '$community', count: { $sum: 1 } } }
  ]).toArray();

  let countsUpdated = 0;
  for (const { _id: name, count } of commProjectCounts) {
    const res = await db.collection('communities').updateOne(
      { name },
      { $set: { projectCount: count, updatedAt: new Date() } }
    );
    if (res.modifiedCount) countsUpdated++;
  }
  console.log(`  Counts updated: ${countsUpdated}`);

  // ═══ FINAL STATS ═══
  console.log('\n═══ FINAL STATS ═══');

  const commStats = await db.collection('projects').aggregate([
    { $group: { _id: { $cond: [{ $in: ['$community', ['', null]] }, 'empty', 'filled'] }, count: { $sum: 1 } } }
  ]).toArray();
  commStats.forEach(s => console.log(`  Community ${s._id}: ${s.count}`));

  const fieldStats = {};
  const fields = ['startingPrice', 'completionDate', 'unitTypes', 'amenities', 'shortOverview', 'developerName'];
  for (const f of fields) {
    const empty = await db.collection('projects').countDocuments({
      $or: [
        { [f]: null }, { [f]: '' }, { [f]: { $size: 0 } }, { [f]: { $exists: false } }
      ]
    });
    const total = await db.collection('projects').countDocuments({ publishStatus: 'Published' });
    fieldStats[f] = `${total - empty}/${total} filled`;
  }
  console.log('\nField coverage:');
  for (const [k, v] of Object.entries(fieldStats)) {
    console.log(`  ${k}: ${v}`);
  }

  const topComm = await db.collection('projects').aggregate([
    { $match: { community: { $ne: '' }, community: { $ne: null } } },
    { $group: { _id: '$community', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 15 }
  ]).toArray();
  console.log('\nTop communities:');
  topComm.forEach(r => console.log(`  ${r._id}: ${r.count}`));

  const totalComm = await db.collection('communities').countDocuments({ publishStatus: 'Published' });
  const commWithDesc = await db.collection('communities').countDocuments({
    publishStatus: 'Published',
    description: { $exists: true, $ne: '' }
  });
  console.log(`\nCommunities: ${commWithDesc}/${totalComm} with descriptions`);

  console.log('\n✅ Done');
  await client.close();
}

main().catch(e => { console.error('❌', e); process.exit(1); });