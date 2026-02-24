/**
 * Project Enrichment v5 — Two-Pass, Zero-Hallucination
 * 
 * Pass 1: REGEX extraction from fullDescription + Coordinates lookup table
 *         → prices, dates, units, sizes, coords — ZERO AI involvement
 * 
 * Pass 2: AI generates ONLY content/marketing fields
 *         → highlights, FAQs, nearby, overview, description rewrite
 *         → AI is NEVER asked for prices, dates, coordinates, unit counts
 * 
 * Usage:
 *   node enrich-projects.js                    # enrich all needing it
 *   node enrich-projects.js --limit 10         # test on 10
 *   node enrich-projects.js --dry-run          # preview, no writes
 *   node enrich-projects.js --force            # re-enrich even filled
 *   node enrich-projects.js --slug some-slug   # one specific project
 *   node enrich-projects.js --pass1-only       # regex/coords only, no AI
 *   node enrich-projects.js --pass2-only       # AI content only
 *   node enrich-projects.js --rewrite        # also rewrite fullDescription
 *   node enrich-projects.js --reset            # wipe AI-filled fields first
 *   node enrich-projects.js --reset --limit 5  # reset + re-enrich 5
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env' });
if (!process.env.MONGODB_URI) require('dotenv').config({ path: '.env.local' });

const MONGO_URI = process.env.MONGODB_URI;
const API_KEY = process.env.OPENAI_API_KEY || '';

if (!MONGO_URI) { console.error('❌ MONGODB_URI missing'); process.exit(1); }

const AED_TO_USD = 0.2723;
const BATCH_SIZE = 4;

const args = process.argv.slice(2);
const LIMIT = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1]) : 0;
const DRY_RUN = args.includes('--dry-run');
const FORCE = args.includes('--force');
const SLUG = args.includes('--slug') ? args[args.indexOf('--slug') + 1] : null;
const PASS1_ONLY = args.includes('--pass1-only');
const PASS2_ONLY = args.includes('--pass2-only');
const RESET = args.includes('--reset');
const REWRITE = args.includes('--rewrite');

// ═══════════════════════════════════════════════════════
//  COMMUNITY → COORDINATES
//  Priority: 1) community-coords.json (from geocoder)
//            2) Fallback hardcoded table
// ═══════════════════════════════════════════════════════
const fs = require('fs');
const path = require('path');

let GEOCODED_COORDS = {};
const CACHE_FILE = path.join(__dirname, 'community-coords.json');
if (fs.existsSync(CACHE_FILE)) {
  try {
    const raw = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    for (const [name, data] of Object.entries(raw)) {
      GEOCODED_COORDS[name] = [data.lat, data.lng];
    }
    console.log(`  Loaded ${Object.keys(GEOCODED_COORDS).length} geocoded coordinates from cache`);
  } catch (e) {
    console.warn('  ⚠️  Failed to load community-coords.json, using fallback');
  }
}

// Fallback hardcoded — used ONLY if geocode cache not available
const FALLBACK_COORDS = {
  // These are approximate and should be replaced by running geocode-communities.js
  'Emaar Beachfront': [25.0990, 55.1420],
  'Downtown Dubai': [25.1972, 55.2744],
  'Dubai Marina': [25.0800, 55.1400],
  'Business Bay': [25.1851, 55.2684],
  'Palm Jumeirah': [25.1167, 55.1333],
  'Jumeirah Village Circle': [25.0566, 55.2080],
  'Dubai Hills Estate': [25.1200, 55.2400],
  'Dubai Islands': [25.3332, 55.3122],
  'Dubai Creek Harbour': [25.1950, 55.3350],
  'Jumeirah Lake Towers': [25.0750, 55.1450],
  'Jumeirah Beach Residence': [25.0780, 55.1350],
  'Dubai South': [24.9000, 55.1600],
};

function getCommunityCoords(communityName) {
  if (!communityName) return null;
  
  // 1. Try exact match in geocoded cache
  if (GEOCODED_COORDS[communityName]) return GEOCODED_COORDS[communityName];
  
  // 2. Try case-insensitive match in geocoded cache
  const cl = communityName.toLowerCase();
  for (const [name, coords] of Object.entries(GEOCODED_COORDS)) {
    if (name.toLowerCase() === cl) return coords;
  }
  
  // 3. Try partial match in geocoded cache
  for (const [name, coords] of Object.entries(GEOCODED_COORDS)) {
    const nl = name.toLowerCase();
    if (cl.includes(nl) || nl.includes(cl)) return coords;
  }
  
  // 4. Fallback hardcoded
  if (FALLBACK_COORDS[communityName]) return FALLBACK_COORDS[communityName];
  for (const [name, coords] of Object.entries(FALLBACK_COORDS)) {
    const nl = name.toLowerCase();
    if (cl.includes(nl) || nl.includes(cl)) return coords;
  }
  
  return null;
}

// ═══════════════════════════════════════════════════════
//  ALL TEMPLATE FIELDS (must exist on every project)
// ═══════════════════════════════════════════════════════
const ALL_FIELDS = {
  wpId: null,
  status: 'Off-Plan', projectType: 'Residential', propertyType: '',
  developerName: '', community: '', city: 'Dubai', country: 'UAE',
  address: '', latitude: 0, longitude: 0, mapUrl: '',
  startingPrice: null, priceMax: null, priceUSD: null,
  displayPrice: '', currency: 'AED', priceRange: '', priceByType: [],
  bedrooms: '', bathrooms: '',
  unitTypes: [], typesAndSizes: [],
  totalUnits: null, unitSizeMin: null, unitSizeMax: null, unitSizeUnit: 'sqft',
  completionDate: '', constructionStatus: '',
  shortOverview: '',
  titleType: '', eligibility: '',
  paymentPlan: '', paymentPlanSummary: '', downPayment: '',
  paymentPlanSteps: [], acceptedPaymentMethods: [],
  keyHighlights: [],
  investmentHighlights: { rentalYield: '', capitalGrowth: '', occupancyRate: '', bullets: [] },
  idealFor: [], availability: '',
  nearbyAttractions: [], faqs: [],
  amenities: [], amenitiesTitle: '', amenitiesContent: '',
  featuredImage: '', imageGallery: [], localImages: [],
  masterPlanImages: [], masterPlanDescription: '',
  locationMapImages: [], constructionUpdates: [],
  videos: [], brochureUrl: '',
  enhancedImage: '', imagePrompt: '',
  floorPlans: [], floorPlanContent: '', floorPlanImage: '',
  metaTitle: '', metaDescription: '', focusKeyword: '',
  tags: [], areas: [],
  viewCount: 0, publishStatus: 'Published',
  publishedAt: '', createdAt: '', updatedAt: '',
};

// Fields that --reset will wipe (AI-generated content only, not WP source data)
const RESET_FIELDS = {
  faqs: [], nearbyAttractions: [], keyHighlights: [],
  latitude: 0, longitude: 0,
  startingPrice: null, priceMax: null, priceUSD: null,
  displayPrice: '', priceRange: '',
  totalUnits: null, unitSizeMin: null, unitSizeMax: null,
  unitTypes: [], paymentPlanSteps: [], paymentPlanSummary: '',
  downPayment: '', availability: '', shortOverview: '', completionDate: '',
  investmentHighlights: { rentalYield: '', capitalGrowth: '', occupancyRate: '', bullets: [] },
  idealFor: [], amenities: [], titleType: '', eligibility: '',
  address: '', metaTitle: '', metaDescription: '',
};

// ═══ UTILS ═══

function stripHtml(html) {
  return (html || '').replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&#?\w+;/g, '')
    .replace(/\s+/g, ' ').trim();
}

function isEmpty(val) {
  if (val === null || val === undefined || val === '' || val === 0) return true;
  if (val === 'NULL' || val === 'null' || val === 'N/A') return true;
  if (Array.isArray(val) && val.length === 0) return true;
  if (typeof val === 'object' && !Array.isArray(val)) {
    return Object.values(val).every(v => isEmpty(v));
  }
  return false;
}

// ═══════════════════════════════════════════════════════
//  PASS 1: REGEX DATA EXTRACTION (zero AI, zero hallucination)
// ═══════════════════════════════════════════════════════

function extractDataFromDescription(project) {
  const text = stripHtml(project.fullDescription || '');
  const $set = {};

  // ── Prices — only from actual text mentions ──
  if (isEmpty(project.startingPrice)) {
    const pricePatterns = [
      /(?:starting\s+(?:from|price)|from|price)\s*:?\s*AED\s*([\d,]+(?:\.\d+)?)\s*(?:million|m\b)?/gi,
      /AED\s*([\d,]+(?:\.\d+)?)\s*(?:million|m\b)?/gi,
      /([\d,]+(?:\.\d+)?)\s*AED/gi,
    ];
    const prices = [];
    for (const pat of pricePatterns) {
      let match;
      while ((match = pat.exec(text)) !== null) {
        let val = match[1].replace(/,/g, '');
        let num = parseFloat(val);
        if (match[0].toLowerCase().match(/million|m\b/)) {
          if (num < 1000) num *= 1000000;
        }
        if (num > 100 && num < 50000) num *= 1000; // e.g. "1500" → 1,500,000
        if (num >= 100000 && num <= 500000000) prices.push(num);
      }
    }
    if (prices.length > 0) {
      const unique = [...new Set(prices)].sort((a, b) => a - b);
      $set.startingPrice = unique[0];
      $set.priceUSD = Math.round(unique[0] * AED_TO_USD);
      $set.displayPrice = `AED ${unique[0].toLocaleString()}`;
      $set.currency = 'AED';
      if (unique.length > 1) {
        $set.priceMax = unique[unique.length - 1];
        $set.priceRange = `AED ${(unique[0] / 1e6).toFixed(1)}M - AED ${(unique[unique.length - 1] / 1e6).toFixed(1)}M`;
      }
    }
  }

  // ── Completion date — only from actual text ──
  if (isEmpty(project.completionDate)) {
    const datePatterns = [
      /(?:handover|completion|expected|ready)\s*(?:date|by|in)?\s*:?\s*(Q[1-4]\s*20\d{2})/i,
      /(?:handover|completion|ready)\s*:?\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?\s*20\d{2})/i,
      /(?:handover|completion|ready)\s*:?\s*(20\d{2})/i,
    ];
    for (const pat of datePatterns) {
      const m = text.match(pat);
      if (m) { $set.completionDate = m[1].trim(); break; }
    }
  }

  // ── Unit types — from description text ──
  if (isEmpty(project.unitTypes)) {
    const types = new Set();
    const pat = /\b(studio|([1-6])\s*(?:bed(?:room)?s?|br|bhk)|penthouse|duplex|townhouse|villa)\b/gi;
    let m;
    while ((m = pat.exec(text)) !== null) {
      const t = m[1].toLowerCase();
      if (t === 'studio') types.add('Studio');
      else if (t === 'penthouse') types.add('Penthouse');
      else if (t === 'duplex') types.add('Duplex');
      else if (t === 'townhouse') types.add('Townhouse');
      else if (t === 'villa') types.add('Villa');
      else if (m[2]) types.add(`${m[2]} Bedroom`);
    }
    if (types.size > 0) $set.unitTypes = [...types].sort();
  }

  // ── Total units — from description text ──
  if (isEmpty(project.totalUnits)) {
    const m = text.match(/(\d{2,4})\s*(?:units?|residences?|apartments?|villas?|homes?)\b/i);
    if (m) {
      const n = parseInt(m[1]);
      if (n >= 10 && n < 10000) $set.totalUnits = n;
    }
  }

  // ── Size range — from description text ──
  if (isEmpty(project.unitSizeMin)) {
    const sizePats = [
      /([\d,]+)\s*(?:to|-|–)\s*([\d,]+)\s*(?:sq\.?\s*ft|sqft|square\s*feet)/i,
      /(?:from|starting)\s*([\d,]+)\s*(?:sq\.?\s*ft|sqft)/i,
    ];
    for (const pat of sizePats) {
      const m = text.match(pat);
      if (m) {
        const min = parseInt(m[1].replace(/,/g, ''));
        if (min > 100 && min < 100000) $set.unitSizeMin = min;
        if (m[2]) {
          const max = parseInt(m[2].replace(/,/g, ''));
          if (max > 100 && max < 100000) $set.unitSizeMax = max;
        }
        break;
      }
    }
  }

  // ── Payment plan — from description text ──
  if (isEmpty(project.paymentPlanSummary)) {
    const m = text.match(/(\d{1,2})\s*[\/\\]\s*(\d{1,2})\s*(?:payment\s*plan)?/i);
    if (m) {
      const a = parseInt(m[1]), b = parseInt(m[2]);
      if (a + b >= 90 && a + b <= 110) $set.paymentPlanSummary = `${a}/${b}`;
    }
  }
  if (isEmpty(project.downPayment)) {
    const m = text.match(/(?:down\s*payment|booking|initial)\s*(?:of\s*)?\s*(\d{1,2})%/i);
    if (m) $set.downPayment = `${m[1]}%`;
  }

  // ── Coordinates from LOOKUP (geocode cache → fallback) ──
  const community = project.community || '';
  if ((isEmpty(project.latitude) || project.latitude === 0) && community) {
    const coords = getCommunityCoords(community);
    if (coords) {
      $set.latitude = coords[0];
      $set.longitude = coords[1];
    }
  }

  // ── Address from community ──
  if ((isEmpty(project.address) || project.address === '0,0,0') && community) {
    $set.address = `${community}, ${project.city || 'Dubai'}, UAE`;
  }

  return $set;
}

// ═══════════════════════════════════════════════════════
//  OPENAI API
// ═══════════════════════════════════════════════════════

async function callGPT(messages, maxTokens = 8000) {
  if (!API_KEY) throw new Error('No OPENAI_API_KEY');
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
    body: JSON.stringify({ model: 'gpt-4o-mini', max_tokens: maxTokens, temperature: 0.15, messages }),
  });
  if (!resp.ok) throw new Error(`API ${resp.status}: ${await resp.text()}`);
  const data = await resp.json();
  return data.choices?.[0]?.message?.content || '';
}

function parseJSON(text) {
  const arrMatch = text.match(/\[[\s\S]*\]/);
  if (arrMatch) { try { return JSON.parse(arrMatch[0]); } catch {} }
  const objMatch = text.match(/\{[\s\S]*\}/);
  if (objMatch) { try { return [JSON.parse(objMatch[0])]; } catch {} }
  return null;
}

// ═══════════════════════════════════════════════════════
//  PASS 2: AI CONTENT (only marketing/content fields)
//  AI NEVER sees: prices, dates, coords, unit counts
// ═══════════════════════════════════════════════════════

function buildContentPrompt(projects, rewrite = false) {
  const items = projects.map((p, i) => {
    const desc = stripHtml(p.fullDescription || '').slice(0, 2000);
    const missing = [];

    if (isEmpty(p.shortOverview)) missing.push('shortOverview');
    if (isEmpty(p.keyHighlights)) missing.push('keyHighlights');
    if (isEmpty(p.investmentHighlights)) missing.push('investmentHighlights');
    if (isEmpty(p.idealFor)) missing.push('idealFor');
    if (isEmpty(p.availability)) missing.push('availability');
    if (isEmpty(p.titleType)) missing.push('titleType');
    if (isEmpty(p.eligibility)) missing.push('eligibility');
    if (isEmpty(p.nearbyAttractions)) missing.push('nearbyAttractions');
    if (isEmpty(p.faqs)) missing.push('faqs');
    if (isEmpty(p.amenities)) missing.push('amenities');
    if (isEmpty(p.metaTitle)) missing.push('metaTitle');
    if (isEmpty(p.metaDescription)) missing.push('metaDescription');
    if (rewrite) missing.push('improvedDescription');

    if (missing.length === 0) return null;

    const known = [];
    if (p.community) known.push(`community: ${p.community}`);
    if (p.city && p.city !== 'Dubai') known.push(`city: ${p.city}`);
    if (p.developerName) known.push(`developer: ${p.developerName}`);
    if (!isEmpty(p.startingPrice)) known.push(`price: AED ${p.startingPrice.toLocaleString()}`);
    if (!isEmpty(p.priceMax)) known.push(`priceMax: AED ${p.priceMax.toLocaleString()}`);
    if (!isEmpty(p.completionDate)) known.push(`completion: ${p.completionDate}`);
    if (p.unitTypes?.length) known.push(`units: ${p.unitTypes.join(', ')}`);
    if (p.status) known.push(`status: ${p.status}`);
    if (p.propertyType) known.push(`type: ${p.propertyType}`);
    if (!isEmpty(p.totalUnits)) known.push(`totalUnits: ${p.totalUnits}`);
    if (!isEmpty(p.paymentPlanSummary)) known.push(`payment: ${p.paymentPlanSummary}`);
    if (!isEmpty(p.downPayment)) known.push(`downPayment: ${p.downPayment}`);
    if (!isEmpty(p.unitSizeMin)) known.push(`size: ${p.unitSizeMin}${p.unitSizeMax ? '-' + p.unitSizeMax : ''} sqft`);

    return `[${i}] "${p.name}"
Known facts: ${known.join(' | ') || 'minimal info'}
Missing: ${missing.join(', ')}
Description: ${desc || 'no description'}`;
  }).filter(Boolean);

  if (items.length === 0) return null;

  return [
    {
      role: 'system',
      content: `You generate marketing content for UAE real estate project pages.

STRICT RULES — FOLLOW EXACTLY:
1. You ONLY fill content/marketing fields. NEVER invent prices, dates, coordinates, or unit counts.
2. nearbyAttractions: Use REAL landmarks ACTUALLY near that SPECIFIC community. Include realistic drive/walk times.
   Community-specific examples (use these as reference, not copy):
   - Emaar Beachfront: "Dubai Marina Mall (5 min walk)", "JBR The Walk (7 min)", "Ain Dubai (10 min)"
   - Downtown Dubai: "Dubai Mall (5 min walk)", "Burj Khalifa (walking distance)", "DIFC (5 min drive)"
   - JVC: "Circle Mall (5 min drive)", "Dubai Miracle Garden (10 min)", "Mall of Emirates (15 min)"
   - Palm Jumeirah: "Nakheel Mall (5 min drive)", "Atlantis The Royal (10 min)", "Dubai Marina (15 min)"
   - Meydan/MBR City: "Meydan Racecourse (5 min)", "Meydan Mall (5 min)", "Downtown Dubai (10 min)"
   - Dubai Hills Estate: "Dubai Hills Mall (5 min)", "Motor City (10 min)", "Downtown (15 min)"
   - Yas Island: "Yas Mall (5 min)", "Ferrari World (5 min)", "Abu Dhabi Airport (10 min)"
   - Sharjah (Aljada/Masaar): "Sahara Centre (15 min)", "Sharjah Airport (20 min)", "Dubai (30 min)"
   Do NOT use "Dubai Mall 20 min" for every community. Be specific to the actual location.
3. faqs: Answers MUST ONLY reference facts from "Known facts". For anything not in known facts:
   - Price unknown → "Please contact our sales team for current pricing."
   - Date unknown → "Please contact us for the latest project timeline."
   - Units unknown → "Various configurations available. Contact us for details."
   NEVER invent handover dates like "Q4 2027" unless it's in Known facts.
4. keyHighlights: Must be SPECIFIC to this project and community. Examples:
   - BAD (generic): "Prime location", "World-class amenities", "High ROI"
   - GOOD (specific): "Direct beach access on JBR coastline", "5 min walk to Dubai Mall", "Rooftop infinity pool with Burj Khalifa views"
5. investmentHighlights: Use realistic yields for community tier:
   - Premium (Downtown, Palm, DIFC): 5-7% yield, 8-12% growth
   - Mid-tier (JVC, JVT, Arjan, DSO): 7-9% yield, 5-8% growth
   - Emerging (Dubailand, Dubai South): 6-8% yield, 10-15% growth
6. titleType: Default "Freehold" for Dubai freehold zones, "Leasehold" for non-freehold areas.
7. eligibility: Default "All Nationalities" for freehold, "GCC Nationals Only" if leasehold.
8. If city is Abu Dhabi/Sharjah/RAK, adjust nearby landmarks accordingly — do NOT list Dubai landmarks.
9. Return ONLY valid JSON array. No markdown, no backticks, no explanation.`
    },
    {
      role: 'user',
      content: `Return a JSON array for each project:
[{
  "index": 0,
  "shortOverview": "1-2 sentences",
  "keyHighlights": ["Specific point 1", ...] (4-6),
  "investmentHighlights": {
    "rentalYield": "X-Y%", "capitalGrowth": "X-Y%", "occupancyRate": "X%+",
    "bullets": ["Reason 1", ...] (3-5)
  },
  "idealFor": ["End Users", "Investors", ...] (2-4),
  "availability": "Available" or "Limited Units",
  "titleType": "Freehold" or "Leasehold",
  "eligibility": "All Nationalities",
  "nearbyAttractions": [{"name":"Real Place","distance":"X min walk/drive"}] (4-6 REAL nearby places),
  "faqs": [{"question":"...","answer":"...(only known facts or say contact us)"}] (4-5),
  "amenities": ["Swimming Pool","Gym",...] (6-10),
  "metaTitle": "Project | Community | City",
  "metaDescription": "155 char SEO desc"
}]

Projects:
${items.join('\n\n---\n\n')}`
    }
  ];
}

// ═══════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  Binayah — Project Enrichment v5');
  console.log('═══════════════════════════════════════════════\n');

  const flags = [];
  if (DRY_RUN) flags.push('DRY RUN');
  if (FORCE) flags.push('FORCE');
  if (PASS1_ONLY) flags.push('PASS1 ONLY');
  if (PASS2_ONLY) flags.push('PASS2 ONLY');
  if (RESET) flags.push('RESET');
  if (REWRITE) flags.push('REWRITE DESC');
  if (SLUG) flags.push(`SLUG: ${SLUG}`);
  if (LIMIT) flags.push(`LIMIT: ${LIMIT}`);
  if (flags.length) console.log(`  Flags: ${flags.join(' | ')}\n`);

  const client = new MongoClient(MONGO_URI);
  await client.connect();
  console.log('✅ Connected to MongoDB\n');
  const db = client.db('binayah_website_new');

  // ═══ RESET (if requested) ═══
  if (RESET) {
    console.log('--- RESET: Wiping AI-filled fields ---');
    let resetQuery = { publishStatus: 'Published' };
    if (SLUG) resetQuery.slug = SLUG;
    if (LIMIT && !SLUG) {
      // Reset only projects that have AI data
      const toReset = await db.collection('projects').find(
        { ...resetQuery, faqs: { $exists: true, $not: { $size: 0 } } },
        { projection: { _id: 1 } }
      ).limit(LIMIT).toArray();
      if (toReset.length > 0) {
        const res = await db.collection('projects').updateMany(
          { _id: { $in: toReset.map(p => p._id) } },
          { $set: { ...RESET_FIELDS, updatedAt: new Date() } }
        );
        console.log(`  Reset ${res.modifiedCount} projects\n`);
      } else {
        console.log('  No projects to reset\n');
      }
    } else {
      const res = await db.collection('projects').updateMany(
        resetQuery,
        { $set: { ...RESET_FIELDS, updatedAt: new Date() } }
      );
      console.log(`  Reset ${res.modifiedCount} projects\n`);
    }
  }

  // ═══ STEP 0: Ensure fields exist ═══
  console.log('--- Step 0: Ensure template fields ---');
  let fieldsAdded = 0;
  const skipFields = ['name', 'slug', 'source', 'sourceId', 'fullDescription',
                      'featuredImage', 'publishStatus', 'publishedAt', 'createdAt'];
  for (const [field, defaultVal] of Object.entries(ALL_FIELDS)) {
    if (skipFields.includes(field)) continue;
    const res = await db.collection('projects').updateMany(
      { [field]: { $exists: false } },
      { $set: { [field]: defaultVal } }
    );
    if (res.modifiedCount > 0) {
      console.log(`  + "${field}" → ${res.modifiedCount} projects`);
      fieldsAdded += res.modifiedCount;
    }
  }
  console.log(fieldsAdded > 0 ? `  ✅ ${fieldsAdded} fields added` : '  ✅ All fields exist');

  // ═══ STEP 0.5: Sanitize bad strings ═══
  console.log('\n--- Step 0.5: Sanitize bad values ---');
  const nullStrings = ['NULL', 'null', 'N/A', 'n/a', 'undefined', 'none', 'None'];
  let sanitized = 0;
  for (const badVal of nullStrings) {
    for (const field of ['completionDate', 'titleType', 'eligibility', 'availability',
                          'paymentPlanSummary', 'downPayment', 'shortOverview', 'address']) {
      const res = await db.collection('projects').updateMany(
        { [field]: badVal },
        { $set: { [field]: '' } }
      );
      sanitized += res.modifiedCount;
    }
  }
  // Fix address "0,0,0"
  const addrFix = await db.collection('projects').updateMany(
    { address: '0,0,0' },
    { $set: { address: '' } }
  );
  sanitized += addrFix.modifiedCount;
  console.log(sanitized > 0 ? `  ✅ Sanitized ${sanitized} bad values` : '  ✅ No bad values');

  // Load communities + city map
  const communities = await db.collection('communities').find(
    { publishStatus: 'Published' }, { projection: { name: 1, slug: 1, city: 1, _id: 1 } }
  ).toArray();
  const communityCity = {};
  for (const c of communities) {
    communityCity[c.name] = c.city || 'Dubai';
  }
  console.log(`\n  Communities: ${communities.length}`);

  // Select projects
  let query = { publishStatus: 'Published' };
  if (SLUG) query.slug = SLUG;
  const allProjects = await db.collection('projects').find(query).toArray();
  console.log(`  Projects: ${allProjects.length}`);

  let toProcess;
  if (FORCE || SLUG || RESET) {
    toProcess = allProjects;
  } else {
    toProcess = allProjects.filter(p => {
      const critFields = ['shortOverview', 'keyHighlights', 'nearbyAttractions', 'faqs', 'idealFor'];
      return critFields.filter(f => isEmpty(p[f])).length >= 2;
    });
  }
  if (LIMIT > 0) toProcess = toProcess.slice(0, LIMIT);
  console.log(`  To process: ${toProcess.length}\n`);

  const stats = { pass1: 0, pass2: 0, failed: 0, fields: {} };
  function track(name) { stats.fields[name] = (stats.fields[name] || 0) + 1; }

  // ═══ PASS 1: Regex extraction + coordinate lookup ═══
  if (!PASS2_ONLY) {
    console.log('━━━ PASS 1: Data extraction (regex + coords) ━━━\n');
    let p1details = { price: 0, date: 0, units: 0, coords: 0, address: 0, types: 0, size: 0, payment: 0 };

    for (const project of toProcess) {
      const $set = extractDataFromDescription(project);

      // Set correct city from community
      const comm = project.community || '';
      if (communityCity[comm] && project.city !== communityCity[comm]) {
        $set.city = communityCity[comm];
      }

      // Fix address to use correct city
      if ($set.address || (isEmpty(project.address) || project.address === '0,0,0') && comm) {
        $set.address = `${comm}, ${communityCity[comm] || project.city || 'Dubai'}, UAE`;
      }

      if (Object.keys($set).length > 0) {
        $set.updatedAt = new Date();
        if (!DRY_RUN) {
          await db.collection('projects').updateOne({ _id: project._id }, { $set });
          Object.assign(project, $set); // update in-memory for Pass 2
        }
        if ($set.startingPrice) p1details.price++;
        if ($set.completionDate) p1details.date++;
        if ($set.totalUnits) p1details.units++;
        if ($set.latitude) p1details.coords++;
        if ($set.address) p1details.address++;
        if ($set.unitTypes) p1details.types++;
        if ($set.unitSizeMin) p1details.size++;
        if ($set.paymentPlanSummary) p1details.payment++;
        for (const k of Object.keys($set)) { if (k !== 'updatedAt') track(`p1:${k}`); }
        stats.pass1++;
      }
    }
    console.log(`  Projects with extracted data: ${stats.pass1}/${toProcess.length}`);
    console.log(`  Prices found:      ${p1details.price}`);
    console.log(`  Dates found:       ${p1details.date}`);
    console.log(`  Unit types found:  ${p1details.types}`);
    console.log(`  Total units found: ${p1details.units}`);
    console.log(`  Sizes found:       ${p1details.size}`);
    console.log(`  Payment found:     ${p1details.payment}`);
    console.log(`  Coords set:        ${p1details.coords}`);
    console.log(`  Addresses set:     ${p1details.address}\n`);
  }

  // ═══ PASS 2: AI content generation ═══
  if (!PASS1_ONLY) {
    if (!API_KEY) {
      console.log('━━━ PASS 2: Skipped (no OPENAI_API_KEY) ━━━\n');
    } else {
      console.log('━━━ PASS 2: AI content generation ━━━\n');

      for (let i = 0; i < toProcess.length; i += BATCH_SIZE) {
        const batch = toProcess.slice(i, i + BATCH_SIZE);
        const progress = Math.min(i + BATCH_SIZE, toProcess.length);
        process.stdout.write(`\r  Processing ${progress}/${toProcess.length}... (${stats.pass2} updated, ${stats.failed} failed)`);

        if (DRY_RUN) {
          if (i === 0) {
            const msgs = buildContentPrompt(batch, REWRITE);
            if (msgs) {
              console.log('\n\n  === Sample prompt ===');
              console.log(msgs[1].content.slice(0, 600) + '\n  ...\n');
            }
          }
          continue;
        }

        try {
          const messages = buildContentPrompt(batch, REWRITE);
          if (!messages) continue;

          const responseText = await callGPT(messages, 10000);
          const results = parseJSON(responseText);
          if (!results) { stats.failed += batch.length; continue; }

          for (const r of results) {
            if (!r || r.index == null) continue;
            const project = batch[r.index];
            if (!project) continue;

            const $set = { updatedAt: new Date() };
            let updated = false;

            function setIf(field, value, cond) {
              if (value != null && value !== '' && cond) {
                $set[field] = value; track(field); updated = true;
              }
            }

            setIf('shortOverview', r.shortOverview, r.shortOverview && isEmpty(project.shortOverview));
            setIf('titleType', r.titleType, r.titleType && isEmpty(project.titleType));
            setIf('eligibility', r.eligibility, r.eligibility && isEmpty(project.eligibility));
            setIf('availability', r.availability, r.availability && isEmpty(project.availability));

            if (r.keyHighlights?.length && isEmpty(project.keyHighlights))
              setIf('keyHighlights', r.keyHighlights.slice(0, 6), true);
            if (r.investmentHighlights && isEmpty(project.investmentHighlights))
              setIf('investmentHighlights', {
                rentalYield: r.investmentHighlights.rentalYield || '',
                capitalGrowth: r.investmentHighlights.capitalGrowth || '',
                occupancyRate: r.investmentHighlights.occupancyRate || '',
                bullets: (r.investmentHighlights.bullets || []).slice(0, 6),
              }, true);
            if (r.idealFor?.length && isEmpty(project.idealFor))
              setIf('idealFor', r.idealFor.slice(0, 4), true);
            if (r.nearbyAttractions?.length && isEmpty(project.nearbyAttractions))
              setIf('nearbyAttractions', r.nearbyAttractions.slice(0, 8), true);
            if (r.faqs?.length && isEmpty(project.faqs))
              setIf('faqs', r.faqs.slice(0, 6), true);
            if (r.amenities?.length && isEmpty(project.amenities))
              setIf('amenities', r.amenities.slice(0, 12), true);

            // Description rewrite
            if (r.improvedDescription?.includes('<p>')) {
              const newDesc = stripHtml(r.improvedDescription);
              if (newDesc.length > 50) {
                $set.fullDescription = r.improvedDescription;
                track('fullDescription'); updated = true;
              }
            }

            setIf('metaTitle', r.metaTitle, r.metaTitle && isEmpty(project.metaTitle));
            setIf('metaDescription', r.metaDescription, r.metaDescription && isEmpty(project.metaDescription));

            if (updated) {
              await db.collection('projects').updateOne({ _id: project._id }, { $set });
              stats.pass2++;
            }
          }

          await new Promise(r => setTimeout(r, 1500));
        } catch (e) {
          stats.failed += batch.length;
          console.error(`\n  ❌ ${e.message}`);
          await new Promise(r => setTimeout(r, 5000));
        }
      }
      console.log('');
    }
  }

  // ═══ COVERAGE REPORT ═══
  console.log('\n═══════════════════════════════════════════════');
  console.log('            ENRICHMENT REPORT');
  console.log('═══════════════════════════════════════════════\n');

  console.log(`  Pass 1 (regex):    ${stats.pass1} projects`);
  console.log(`  Pass 2 (AI):       ${stats.pass2} projects`);
  console.log(`  Failed:            ${stats.failed}\n`);

  if (Object.keys(stats.fields).length > 0) {
    console.log('  Fields filled:');
    const sorted = Object.entries(stats.fields).sort((a, b) => b[1] - a[1]);
    for (const [field, count] of sorted) {
      console.log(`    ${field.padEnd(30)} ${count}`);
    }
  }

  console.log('\n\n  ═══ FIELD COVERAGE ═══\n');
  const total = await db.collection('projects').countDocuments({ publishStatus: 'Published' });
  const fields = [
    'community', 'developerName', 'startingPrice', 'completionDate',
    'shortOverview', 'unitTypes', 'amenities', 'titleType', 'eligibility',
    'keyHighlights', 'idealFor', 'investmentHighlights', 'paymentPlanSummary',
    'downPayment', 'paymentPlanSteps', 'totalUnits', 'priceMax', 'availability',
    'nearbyAttractions', 'faqs', 'typesAndSizes', 'latitude',
  ];
  for (const f of fields) {
    let q;
    if (['amenities','unitTypes','paymentPlanSteps','typesAndSizes',
         'keyHighlights','idealFor','nearbyAttractions','faqs'].includes(f))
      q = { publishStatus: 'Published', [f]: { $exists: true, $not: { $size: 0 } } };
    else if (f === 'latitude')
      q = { publishStatus: 'Published', latitude: { $gt: 1 } };
    else if (['startingPrice','priceMax','totalUnits'].includes(f))
      q = { publishStatus: 'Published', [f]: { $gt: 0 } };
    else if (f === 'investmentHighlights')
      q = { publishStatus: 'Published', 'investmentHighlights.rentalYield': { $ne: '' } };
    else
      q = { publishStatus: 'Published', [f]: { $exists: true, $ne: '', $ne: null } };
    const count = await db.collection('projects').countDocuments(q);
    const pct = ((count / total) * 100).toFixed(0);
    const bar = '█'.repeat(Math.round(pct / 5)) + '░'.repeat(20 - Math.round(pct / 5));
    console.log(`  ${f.padEnd(26)} ${bar} ${count}/${total} (${pct}%)`);
  }

  console.log('\n✅ Done');
  await client.close();
}

main().catch(e => { console.error('❌', e); process.exit(1); });