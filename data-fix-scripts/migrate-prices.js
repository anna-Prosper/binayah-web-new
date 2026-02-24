/**
 * WordPress → MongoDB: Prices & Payments Only
 * 
 * Updates ONLY price and payment fields from WP CSV exports.
 * Safe: skips if new value is null/empty/invalid.
 * Safe: skips if project already has valid data (no overwrite).
 * 
 * Required CSVs:
 *   wp_project_fields.csv          (Query 1 — has project_price)
 *   wp_project_payments.csv        (Query 4 — payment plan steps)
 *   wp_project_payment_methods.csv (Query 5 — accepted payment methods)
 * 
 * Usage:
 *   node migrate-prices-payments.js --dry-run
 *   node migrate-prices-payments.js
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: '.env' });
if (!process.env.MONGODB_URI) require('dotenv').config({ path: '.env.local' });

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) { console.error('❌ MONGODB_URI missing'); process.exit(1); }

const DRY = process.argv.includes('--dry-run');
const FORCE = process.argv.includes('--force'); // overwrite even if existing value

const CSV_DIR = process.cwd();
const CSV_FILES = {
  fields:         path.join(CSV_DIR, 'wp_project_fields.csv'),
  payments:       path.join(CSV_DIR, 'wp_project_payments.csv'),
  paymentMethods: path.join(CSV_DIR, 'wp_project_payment_methods.csv'),
};

const AED_TO_USD = 0.2723;

// ═══ CSV PARSER ═══

function parseCSV(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠️  ${path.basename(filePath)} not found, skipping`);
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  const rows = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    if (ch === '"') {
      if (inQuotes && content[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === '\n' && !inQuotes) { rows.push(current); current = ''; }
    else current += ch;
  }
  if (current.trim()) rows.push(current);
  if (rows.length < 2) return [];

  const headers = splitCSVLine(rows[0]);
  const results = [];
  for (let i = 1; i < rows.length; i++) {
    const vals = splitCSVLine(rows[i]);
    if (vals.length < headers.length) continue;
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h.trim().replace(/^"|"$/g, '')] = (vals[idx] || '').trim().replace(/^"|"$/g, '');
    });
    results.push(obj);
  }
  console.log(`  ✅ ${path.basename(filePath)}: ${results.length} rows`);
  return results;
}

function splitCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) { result.push(current); current = ''; }
    else current += ch;
  }
  result.push(current);
  return result;
}

// ═══ VALIDATORS ═══

function cleanPrice(raw) {
  if (!raw || raw === 'null' || raw === '0' || raw === 'N/A') return null;
  const num = parseInt(raw.replace(/[^0-9]/g, ''));
  if (isNaN(num) || num < 100000 || num > 500000000) return null; // AED 100k–500M
  return num;
}

function isValidExisting(val) {
  if (val === null || val === undefined || val === '' || val === 0) return false;
  if (Array.isArray(val) && val.length === 0) return false;
  return true;
}

// ═══ MAIN ═══

async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('  WP → MongoDB: Prices & Payments Only');
  console.log('═══════════════════════════════════════════\n');
  if (DRY) console.log('  🏃 DRY RUN\n');
  if (FORCE) console.log('  ⚠️  FORCE MODE: will overwrite existing values\n');

  // Load CSVs
  console.log('Loading CSVs...\n');
  const fields = parseCSV(CSV_FILES.fields);
  const paymentsRaw = parseCSV(CSV_FILES.payments);
  const payMethodsRaw = parseCSV(CSV_FILES.paymentMethods);

  if (fields.length === 0) {
    console.error('\n❌ wp_project_fields.csv required');
    process.exit(1);
  }

  // Group payment plan steps by wp_id
  const paymentsByWpId = new Map();
  for (const row of paymentsRaw) {
    const wpId = row.wp_id;
    if (!paymentsByWpId.has(wpId)) paymentsByWpId.set(wpId, {});
    const match = row.meta_key?.match(/payment_plan_section_payment_plan_(\d+)_payment_plan_(\w+)$/);
    if (match) {
      const idx = match[1];
      const field = match[2];
      if (!paymentsByWpId.get(wpId)[idx]) paymentsByWpId.get(wpId)[idx] = {};
      paymentsByWpId.get(wpId)[idx][field] = (row.meta_value || '').trim();
    }
  }

  // Group payment methods by wp_id
  const payMethodsByWpId = new Map();
  for (const row of payMethodsRaw) {
    const wpId = row.wp_id;
    if (!payMethodsByWpId.has(wpId)) payMethodsByWpId.set(wpId, []);
    if (row.meta_key?.includes('_title')) {
      const val = row.meta_value?.trim();
      if (val && val !== 'null') payMethodsByWpId.get(wpId).push(val);
    }
  }

  console.log(`\n  Payment Plans: ${paymentsByWpId.size} projects`);
  console.log(`  Payment Methods: ${payMethodsByWpId.size} projects`);

  // Connect
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db('binayah_website_new');

  // Build lookup
  const allProjects = await db.collection('projects').find(
    { publishStatus: 'Published' },
    { projection: { wpId: 1, slug: 1, _id: 1, startingPrice: 1, paymentPlanSummary: 1, paymentPlanSteps: 1, downPayment: 1, acceptedPaymentMethods: 1, displayPrice: 1, priceUSD: 1 } }
  ).toArray();

  const byWpId = new Map();
  const bySlug = new Map();
  for (const p of allProjects) {
    if (p.wpId) byWpId.set(String(p.wpId), p);
    if (p.slug) bySlug.set(p.slug, p);
  }
  console.log(`\n  MongoDB projects: ${allProjects.length} (${byWpId.size} with wpId)\n`);

  // Process
  const stats = {
    matched: 0, notFound: 0,
    priceSet: 0, priceSkippedInvalid: 0, priceSkippedExisting: 0,
    paymentSet: 0, paymentSkippedExisting: 0,
    payMethodsSet: 0, payMethodsSkippedExisting: 0,
    downPaymentSet: 0,
  };

  const updates = []; // collect for summary

  for (const row of fields) {
    const mongoDoc = byWpId.get(row.wp_id) || bySlug.get(row.slug);
    if (!mongoDoc) { stats.notFound++; continue; }
    stats.matched++;

    const $set = {};
    let hasUpdate = false;

    // ── PRICE ──
    const price = cleanPrice(row.project_price);
    if (price) {
      if (FORCE || !isValidExisting(mongoDoc.startingPrice)) {
        $set.startingPrice = price;
        $set.priceUSD = Math.round(price * AED_TO_USD);
        $set.displayPrice = `AED ${price.toLocaleString()}`;
        $set.currency = 'AED';
        stats.priceSet++;
        hasUpdate = true;
      } else {
        stats.priceSkippedExisting++;
      }
    } else {
      stats.priceSkippedInvalid++;
    }

    // ── PAYMENT PLAN STEPS ──
    const payObj = paymentsByWpId.get(row.wp_id);
    if (payObj) {
      const steps = Object.entries(payObj)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([idx, s]) => ({
          step: parseInt(idx) + 1,
          milestone: s.milestone || s.title || '',
          percentage: s.percentage || '',
        }))
        .filter(s => s.milestone || s.percentage);

      if (steps.length > 0) {
        if (FORCE || !isValidExisting(mongoDoc.paymentPlanSummary)) {
          const summary = steps.map(s => `${s.percentage} ${s.milestone}`.trim()).join(' | ');
          $set.paymentPlanSummary = summary;

          // Extract down payment
          const dp = steps.find(s =>
            (s.milestone || '').toLowerCase().includes('booking') ||
            (s.milestone || '').toLowerCase().includes('down') ||
            s.step === 1
          );
          if (dp && dp.percentage) {
            $set.downPayment = dp.percentage;
            stats.downPaymentSet++;
          }

          stats.paymentSet++;
          hasUpdate = true;
        } else {
          stats.paymentSkippedExisting++;
        }
      }
    }

    // ── PAYMENT METHODS ──
    const methods = payMethodsByWpId.get(row.wp_id);
    if (methods && methods.length > 0) {
      if (FORCE || !isValidExisting(mongoDoc.acceptedPaymentMethods)) {
        $set.acceptedPaymentMethods = methods;
        stats.payMethodsSet++;
        hasUpdate = true;
      } else {
        stats.payMethodsSkippedExisting++;
      }
    }

    // ── APPLY ──
    if (hasUpdate) {
      $set.updatedAt = new Date();
      if (!DRY) {
        await db.collection('projects').updateOne({ _id: mongoDoc._id }, { $set });
      }
      updates.push({ slug: row.slug || mongoDoc.slug, fields: Object.keys($set).filter(k => k !== 'updatedAt') });
    }
  }

  // ═══ REPORT ═══
  console.log('═══════════════════════════════════════════');
  console.log('       MIGRATION REPORT');
  console.log('═══════════════════════════════════════════\n');

  console.log(`  Matched:          ${stats.matched} / ${fields.length}`);
  console.log(`  Not found:        ${stats.notFound}\n`);

  console.log('  Prices:');
  console.log(`    Updated:        ${stats.priceSet}`);
  console.log(`    Skipped (existing): ${stats.priceSkippedExisting}`);
  console.log(`    Skipped (invalid):  ${stats.priceSkippedInvalid}\n`);

  console.log('  Payment Plans:');
  console.log(`    Updated:        ${stats.paymentSet}`);
  console.log(`    Down payments:  ${stats.downPaymentSet}`);
  console.log(`    Skipped (existing): ${stats.paymentSkippedExisting}\n`);

  console.log('  Payment Methods:');
  console.log(`    Updated:        ${stats.payMethodsSet}`);
  console.log(`    Skipped (existing): ${stats.payMethodsSkippedExisting}\n`);

  // Coverage check
  console.log('  Post-migration coverage:\n');
  const total = await db.collection('projects').countDocuments({ publishStatus: 'Published' });
  const checks = [
    ['startingPrice', { publishStatus: 'Published', startingPrice: { $gt: 0 } }],
    ['paymentPlanSummary', { publishStatus: 'Published', paymentPlanSummary: { $exists: true, $nin: ['', null] } }],
    ['downPayment', { publishStatus: 'Published', downPayment: { $exists: true, $nin: ['', null] } }],
    ['acceptedPaymentMethods', { publishStatus: 'Published', acceptedPaymentMethods: { $exists: true, $not: { $size: 0 } } }],
  ];
  for (const [name, query] of checks) {
    const c = await db.collection('projects').countDocuments(query);
    const pct = Math.round(c / total * 100);
    const bar = '█'.repeat(Math.round(pct / 5)) + '░'.repeat(20 - Math.round(pct / 5));
    console.log(`  ${name.padEnd(26)} ${bar} ${c}/${total} (${pct}%)`);
  }

  // Show first 10 updates as sample
  if (updates.length > 0) {
    console.log(`\n  Sample updates (first 10):`);
    for (const u of updates.slice(0, 10)) {
      console.log(`    ${u.slug} → ${u.fields.join(', ')}`);
    }
    if (updates.length > 10) console.log(`    ... and ${updates.length - 10} more`);
  }

  console.log('\n✅ Done');
  await client.close();
}

main().catch(e => { console.error('❌', e); process.exit(1); });