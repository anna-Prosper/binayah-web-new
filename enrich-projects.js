/**
 * Project Enrichment v4.1 — Two-Pass, Zero-Hallucination
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

// ═══════════════════════════════════════════════════════
//  COMMUNITY → COORDINATES LOOKUP (100+ real locations)
// ═══════════════════════════════════════════════════════
const COMMUNITY_COORDS = {
  'Abu Dhabi': [24.4539, 54.3773],
  'Akoya Oxygen': [25.0300, 55.2600],
  'Al Barari': [25.1094, 55.2564],
  'Al Barsha': [25.1134, 55.2000],
  'Al Furjan': [25.0255, 55.1456],
  'Al Jaddaf': [25.2157, 55.3324],
  'Al Mamzar': [25.2900, 55.3500],
  'Al Marjan Island': [25.8000, 55.7500],
  'Al Nahda': [25.2910, 55.3650],
  'Al Quoz': [25.1445, 55.2300],
  'Al Reef': [24.4800, 54.6500],
  'Al Reem Island': [24.4950, 54.4000],
  'Al Rigga': [25.2675, 55.3205],
  'Al Zahia': [25.3600, 55.4200],
  'Arabian Hills Estate': [25.0400, 55.2650],
  'Arabian Ranches': [25.0600, 55.2700],
  'Arabian Ranches 2': [25.0580, 55.2750],
  'Arabian Ranches 3': [25.0550, 55.2800],
  'Arjan': [25.0481, 55.2197],
  'Athlon': [25.0500, 55.2850],
  'Barsha Heights (Tecom)': [25.0990, 55.1740],
  'Bluewaters Island': [25.0810, 55.1200],
  'Bur Dubai': [25.2540, 55.2990],
  'Business Bay': [25.1851, 55.2684],
  'Central Park': [25.0450, 55.2650],
  'City Walk': [25.2040, 55.2650],
  'Creek Beach': [25.1980, 55.3380],
  'Creek Harbour': [25.1950, 55.3350],
  'Damac Hills': [25.0300, 55.2400],
  'Damac Hills 2': [25.0100, 55.2500],
  'Damac Lagoons': [25.0200, 55.2300],
  'Damac Riverside': [25.0250, 55.2200],
  'Deira': [25.2680, 55.3240],
  'Design District': [25.1880, 55.2870],
  'Discovery Gardens': [25.0380, 55.1350],
  'District One': [25.1640, 55.2930],
  'Downtown Dubai': [25.1972, 55.2744],
  'Dubai Creek Beach': [25.1980, 55.3380],
  'Dubai Creek Harbour': [25.1950, 55.3350],
  'Dubai Festival City': [25.2240, 55.3530],
  'Dubai Harbour': [25.0800, 55.1350],
  'Dubai Hills Estate': [25.1200, 55.2400],
  'Dubai Industrial City': [24.9300, 55.1600],
  'Dubai Internet City': [25.0950, 55.1540],
  'Dubai Investment Park': [24.9800, 55.1400],
  'Dubai Investments Park': [24.9800, 55.1400],
  'Dubai Land': [25.0700, 55.2800],
  'Dubai Land Residence Complex': [25.0650, 55.2750],
  'Dubai Marina': [25.0800, 55.1400],
  'Dubai Production City': [25.0400, 55.1900],
  'Dubai Silicon Oasis': [25.1180, 55.3770],
  'Dubai South': [24.9000, 55.1600],
  'Dubai Sports City': [25.0400, 55.2200],
  'Dubai World Central': [24.9000, 55.1600],
  'Dubailand': [25.0600, 55.2800],
  'Emaar Beachfront': [25.0780, 55.1250],
  'Emirates Hills': [25.0870, 55.1600],
  'Emirates Living': [25.0500, 55.1700],
  'Expo City': [24.9600, 55.1500],
  'Falcon City of Wonders': [25.0700, 55.2600],
  'Ghaf Woods': [25.0350, 55.2900],
  'Green Community': [25.0100, 55.1600],
  'Greens': [25.0930, 55.1730],
  'International City': [25.1580, 55.4050],
  'Jebel Ali': [25.0200, 55.0800],
  'Jumeirah': [25.2100, 55.2400],
  'Jumeirah Beach Residence': [25.0780, 55.1350],
  'Jumeirah Garden City': [25.1900, 55.2600],
  'Jumeirah Golf Estates': [25.0300, 55.1500],
  'Jumeirah Islands': [25.0650, 55.1500],
  'Jumeirah Lake Towers': [25.0750, 55.1450],
  'Jumeirah Park': [25.0650, 55.1550],
  'Jumeirah Village Circle': [25.0600, 55.2000],
  'Jumeirah Village Triangle': [25.0550, 55.1950],
  'La Mer': [25.2300, 55.2590],
  'Living Legends': [25.1000, 55.2500],
  'Madinat Jumeirah Living': [25.1370, 55.1830],
  'Marina Gate': [25.0800, 55.1400],
  'Maryam Island': [25.3550, 55.3930],
  'Masdar City': [24.4260, 54.6170],
  'Meydan': [25.1600, 55.2900],
  'Mina Rashid': [25.2710, 55.2880],
  'Mirage The Oasis': [25.0700, 55.2700],
  'Mohammed Bin Rashid City': [25.1650, 55.2950],
  'Motor City': [25.0450, 55.2350],
  'Mudon': [25.0350, 55.2700],
  'Muhaisnah': [25.2700, 55.3900],
  'Nad Al Sheba': [25.1430, 55.3050],
  'Nasma': [25.3400, 55.4300],
  'Old Town': [25.1940, 55.2750],
  'Opera Grand': [25.1920, 55.2720],
  'Palm Jumeirah': [25.1124, 55.1390],
  'Pearl Jumeirah': [25.1700, 55.2000],
  'Port De La Mer': [25.2350, 55.2630],
  'Rashid Yachts & Marina': [25.2710, 55.2880],
  'Reem': [25.0650, 55.2550],
  'Saadiyat Island': [24.5400, 54.4300],
  'Sharjah': [25.3463, 55.4209],
  'Sheikh Zayed Road': [25.1800, 55.2600],
  'Sobha Hartland': [25.1850, 55.3200],
  'Sobha Sanctuary': [25.0550, 55.2850],
  'The Hills': [25.0950, 55.1750],
  'The Meadows': [25.0700, 55.1650],
  'The Oasis by Emaar': [25.0650, 55.2650],
  'The Opera District': [25.1920, 55.2720],
  'The Springs': [25.0720, 55.1700],
  'The Valley': [25.0200, 55.3200],
  'The Views': [25.0880, 55.1730],
  'The World Islands': [25.2200, 55.1700],
  'Tilal Al Ghaf': [25.0450, 55.2550],
  'Town Square': [25.0350, 55.2550],
  'Umm Suqeim': [25.1400, 55.2000],
  'Villanova': [25.0500, 55.2800],
  'Wasl Gate': [25.1710, 55.2540],
  'World Trade Centre': [25.2250, 55.2850],
  'Yas Island': [24.4900, 54.6100],
  'Zabeel': [25.2220, 55.2900],
};

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

  // ── Coordinates from LOOKUP TABLE (not AI) ──
  const community = project.community || '';
  if ((isEmpty(project.latitude) || project.latitude === 0) && community) {
    let coords = COMMUNITY_COORDS[community];
    if (!coords) {
      const cl = community.toLowerCase();
      for (const [name, c] of Object.entries(COMMUNITY_COORDS)) {
        const nl = name.toLowerCase();
        if (cl === nl || cl.includes(nl) || nl.includes(cl)) { coords = c; break; }
      }
    }
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

function buildContentPrompt(projects) {
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
    missing.push('improvedDescription'); // always rewrite

    if (missing.length <= 1) return null;

    const known = [];
    if (p.community) known.push(`community: ${p.community}`);
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

    return `[${i}] "${p.name}"
Known facts: ${known.join(' | ') || 'minimal info'}
Missing: ${missing.join(', ')}
Description: ${desc || 'no description'}`;
  }).filter(Boolean);

  if (items.length === 0) return null;

  return [
    {
      role: 'system',
      content: `You generate marketing content for Dubai real estate project pages.

STRICT RULES:
1. You ONLY fill content/marketing fields. NEVER invent prices, dates, coordinates, or unit counts.
2. nearbyAttractions: Use REAL landmarks ACTUALLY near that specific community. Include realistic times. Examples:
   - Emaar Beachfront: "Dubai Marina Mall (5 min walk)", "JBR The Walk (7 min walk)", "Ain Dubai (10 min walk)"
   - Downtown Dubai: "Dubai Mall (5 min walk)", "Burj Khalifa (walking distance)", "DIFC (5 min drive)"
   - JVC: "Circle Mall (5 min drive)", "Dubai Miracle Garden (10 min drive)", "Mall of the Emirates (15 min drive)"
   Do NOT use "Dubai Mall 20 min drive" for every project.
3. faqs: Answers MUST only reference facts from "Known facts". For unknown info, answer: "Please contact our team for details."
   - If price is known: "Starting from AED X"
   - If price is NOT known: "Please contact our sales team for current pricing and availability."
   - If completion date is known: use it. If NOT known: "Please contact us for the latest project timeline."
   - If unit types are known: list them. If NOT: "Various configurations are available. Contact us for details."
4. keyHighlights: Specific to this community/project. NOT generic.
5. investmentHighlights: Use realistic yields for that specific community tier.
6. improvedDescription: Rewrite as clean HTML (2-3 <p> tags). Keep all facts from original. No WP shortcodes.
7. Return ONLY valid JSON array. No markdown fences.`
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
  "improvedDescription": "<p>...</p><p>...</p>",
  "metaTitle": "Project | Community | Dubai",
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
  console.log('  Binayah — Project Enrichment v4.1');
  console.log('═══════════════════════════════════════════════\n');

  const flags = [];
  if (DRY_RUN) flags.push('DRY RUN');
  if (FORCE) flags.push('FORCE');
  if (PASS1_ONLY) flags.push('PASS1 ONLY');
  if (PASS2_ONLY) flags.push('PASS2 ONLY');
  if (RESET) flags.push('RESET');
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

  // Load communities
  const communities = await db.collection('communities').find(
    { publishStatus: 'Published' }, { projection: { name: 1, slug: 1, _id: 1 } }
  ).toArray();
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
            const msgs = buildContentPrompt(batch);
            if (msgs) {
              console.log('\n\n  === Sample prompt ===');
              console.log(msgs[1].content.slice(0, 600) + '\n  ...\n');
            }
          }
          continue;
        }

        try {
          const messages = buildContentPrompt(batch);
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