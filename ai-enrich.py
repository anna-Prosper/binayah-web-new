#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════
  BINAYAH — Phase 2: AI Content Enrichment (OpenAI)
═══════════════════════════════════════════════════════════════

Reads original_description (raw WordPress HTML) + ALL non-empty
fields from Phase 1, sends to OpenAI GPT-4o-mini for polished
content generation.

Fields generated:
  - fullDescription       → 2 polished marketing paragraphs
  - shortOverview         → 2-3 sentence summary
  - keyHighlights         → 5-7 bullet points
  - idealFor              → target buyer groups
  - investmentHighlights  → location/market advantage bullets

Usage:
  python3 ai_enrich.py --dry-run --limit 5 --verbose
  python3 ai_enrich.py --limit 100
  python3 ai_enrich.py --skip-existing
  python3 ai_enrich.py --slug "reportage-plaza-masdar-city"
"""

import os
import re
import sys
import json
import html
import time
import argparse
from datetime import datetime, timezone

from dotenv import load_dotenv
from pymongo import MongoClient

# ── Load env ──
load_dotenv('.env')
if not os.environ.get('MONGODB_URI'):
    load_dotenv('.env.local')

MONGO_URI = os.environ.get('MONGODB_URI')
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')

if not MONGO_URI:
    print('❌ MONGODB_URI missing from .env')
    sys.exit(1)
if not OPENAI_API_KEY:
    print('❌ OPENAI_API_KEY missing from .env')
    print('   Add: OPENAI_API_KEY=sk-... to your .env file')
    sys.exit(1)

MONGO_DB = "binayah_website_new"
COLLECTION = "projects"

# ── OpenAI config ──
MODEL = "gpt-4o-mini"
MAX_RETRIES = 3
RATE_LIMIT_DELAY = 0.5

try:
    from openai import OpenAI
    client_ai = OpenAI(api_key=OPENAI_API_KEY)
except ImportError:
    print('❌ openai not installed. Run: pip install openai')
    sys.exit(1)


# ═══════════════════════════════════════════════════════════
# HELPERS
# ═══════════════════════════════════════════════════════════

def strip_html(text):
    if not text:
        return ''
    return re.sub(r'<[^>]+>', '', html.unescape(str(text))).strip()

def truncate_html(raw_html, max_chars=6000):
    plain = strip_html(raw_html)
    plain = re.sub(r'\s+', ' ', plain).strip()
    if len(plain) > max_chars:
        plain = plain[:max_chars] + '...'
    return plain

def is_empty(val):
    if val is None:
        return True
    if isinstance(val, str):
        return val.strip() in ('', '0', '0,0,0', 'null', 'N/A')
    if isinstance(val, list):
        return len(val) == 0
    if isinstance(val, dict):
        return len(val) == 0
    if isinstance(val, (int, float)):
        return val == 0
    return False

# Fields to skip (internal/meta — not useful as AI context)
SKIP_FIELDS = {
    '_id', 'source', 'sourceId', 'sourceUrl', 'wpId',
    'original_description',  # passed separately as raw text
    'featuredImage', 'imageGallery', 'localImages', 'masterPlanImages',
    'locationMapImages', 'constructionUpdates',
    'floorPlanImage', 'floorPlanContent', 'floorPlans',
    'enhancedImage', 'imagePrompt', 'brochureUrl',
    'viewCount', 'publishStatus', 'publishedAt', 'createdAt', 'updatedAt',
    'focusKeyword',
    '_enrichedAt', '_enrichedFields', '_aiEnrichedAt', '_aiModel',
    '_rawFullDescription', 'mapUrl', 'latitude', 'longitude',
}

def build_context(doc):
    """Dynamically build context from ALL non-empty fields."""
    lines = []

    for key, val in doc.items():
        if key in SKIP_FIELDS:
            continue
        if is_empty(val):
            continue

        if isinstance(val, list):
            if len(val) > 0 and isinstance(val[0], dict):
                formatted = json.dumps(val[:10], ensure_ascii=False)
                if len(formatted) > 300:
                    formatted = formatted[:300] + '...]'
                lines.append(f"{key}: {formatted}")
            else:
                lines.append(f"{key}: {', '.join(str(v) for v in val[:20])}")
        elif isinstance(val, dict):
            formatted = json.dumps(val, ensure_ascii=False)
            if len(formatted) > 300:
                formatted = formatted[:300] + '...}'
            lines.append(f"{key}: {formatted}")
        elif isinstance(val, (int, float)):
            if 'price' in key.lower() or 'Price' in key:
                lines.append(f"{key}: AED {val:,.0f}")
            elif 'size' in key.lower() or 'Size' in key:
                lines.append(f"{key}: {val:,.0f} sq.ft")
            else:
                lines.append(f"{key}: {val}")
        else:
            s = str(val).strip()
            if len(s) > 300:
                s = s[:300] + '...'
            lines.append(f"{key}: {s}")

    return '\n'.join(lines)


# ═══════════════════════════════════════════════════════════
# OPENAI PROMPT
# ═══════════════════════════════════════════════════════════

SYSTEM_PROMPT = """You are a professional Dubai real estate copywriter for Binayah Properties.
You write polished, factual marketing content for off-plan property listings.

ABSOLUTE RULES — VIOLATION = FAILURE:
1. ONLY use facts explicitly present in the provided data.
2. NEVER invent, estimate, or assume ANY numbers — no prices, yields, percentages, sizes, unit counts, dates, or statistics unless they appear VERBATIM in the data.
3. If a data point isn't provided, do NOT reference it at all. Do not say "starting from AED..." unless startingPrice is in the data.
4. For investmentHighlights: NEVER fabricate rental yields, ROI, capital growth rates, or occupancy rates. Only mention these if the EXACT numbers appear in the provided data. Focus on qualitative strengths instead.
5. Write in third person. Professional, confident, grounded tone.
6. BANNED words: stunning, breathtaking, unparalleled, world-class, exquisite, prestigious, magnificent, paradise, masterpiece, state-of-the-art. Use plain, strong language.
7. Be specific — use the actual project name, community name, developer name, bedroom counts from the data.
8. Output MUST be valid JSON only — no markdown, no explanation, no code blocks."""


def build_user_prompt(doc, plain_desc):
    context = build_context(doc)
    name = doc.get('name') or doc.get('metaTitle') or 'this project'

    prompt = f"""Generate marketing content for this real estate project.

ALL AVAILABLE PROJECT DATA (use ONLY these facts — do not add anything not listed here):
{context}

ORIGINAL WEBSITE DESCRIPTION (extract additional facts only — do not copy phrasing):
{plain_desc}

Return a JSON object:

{{
  "fullDescription": "<2 paragraphs, 120-180 words total. Para 1: project name, developer, location/community, what units are offered, size range and price if available. Para 2: lifestyle, amenities, payment plan if known, completion date if known. ONLY facts from the data above.>",
  
  "shortOverview": "<2-3 sentences, 40-60 words. Must include project name, developer name, community. One key selling point.>",
  
  "keyHighlights": ["<6 bullet strings, each 8-15 words. Cover: unit types, location, payment plan if available, completion if available, a key amenity, developer. ONLY from data above.>"],
  
  "idealFor": ["<2-4 from ONLY: Investors, End-users, Families, Young Professionals, Couples, Retirees, Holiday Home Buyers, First-time Buyers>"],
  
  "investmentHighlights": {{
    "bullets": ["<3-4 strings about investment appeal. NO invented numbers. Focus on: developer reputation, community popularity, location connectivity, freehold status, payment plan flexibility. ONLY include yield/growth/occupancy numbers if they are in the data above verbatim.>"]
  }}
}}"""

    return prompt


# ═══════════════════════════════════════════════════════════
# OPENAI CALL
# ═══════════════════════════════════════════════════════════

def call_openai(doc, plain_desc):
    user_prompt = build_user_prompt(doc, plain_desc)

    for attempt in range(MAX_RETRIES):
        try:
            response = client_ai.chat.completions.create(
                model=MODEL,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                max_tokens=1500,
                response_format={"type": "json_object"}
            )

            content = response.choices[0].message.content.strip()
            result = json.loads(content)

            required = ['fullDescription', 'shortOverview', 'keyHighlights',
                        'idealFor', 'investmentHighlights']
            for field in required:
                if field not in result:
                    raise ValueError(f"Missing field: {field}")

            if not isinstance(result['keyHighlights'], list) or len(result['keyHighlights']) < 3:
                raise ValueError("keyHighlights needs 3+ items")
            if not isinstance(result['idealFor'], list):
                raise ValueError("idealFor must be list")

            return result

        except json.JSONDecodeError as e:
            print(f"    ⚠️  JSON error (attempt {attempt+1}): {e}")
            if attempt < MAX_RETRIES - 1:
                time.sleep(1)
            else:
                return None

        except Exception as e:
            err = str(e).lower()
            print(f"    ⚠️  Error (attempt {attempt+1}): {e}")
            if 'rate_limit' in err or '429' in err:
                wait = 10 * (attempt + 1)
                print(f"    ⏳ Rate limited, waiting {wait}s...")
                time.sleep(wait)
            elif attempt < MAX_RETRIES - 1:
                time.sleep(2)
            else:
                return None

    return None


# ═══════════════════════════════════════════════════════════
# VALIDATION
# ═══════════════════════════════════════════════════════════

VALID_IDEAL_FOR = {
    "Investors", "End-users", "Families", "Young Professionals",
    "Couples", "Retirees", "Holiday Home Buyers", "First-time Buyers"
}

def validate_and_clean(result):
    update = {}

    fd = result.get('fullDescription', '')
    if isinstance(fd, str) and len(fd) > 80:
        update['fullDescription'] = fd

    so = result.get('shortOverview', '')
    if isinstance(so, str) and 20 < len(so) < 500:
        update['shortOverview'] = so

    kh = result.get('keyHighlights', [])
    if isinstance(kh, list):
        clean = [h for h in kh if isinstance(h, str) and 5 < len(h) < 200]
        if len(clean) >= 3:
            update['keyHighlights'] = clean

    idf = result.get('idealFor', [])
    if isinstance(idf, list):
        filtered = [g for g in idf if g in VALID_IDEAL_FOR]
        if filtered:
            update['idealFor'] = filtered

    ih = result.get('investmentHighlights', {})
    if isinstance(ih, dict):
        bullets = ih.get('bullets', [])
        if isinstance(bullets, list):
            clean_b = [b for b in bullets if isinstance(b, str) and len(b) > 10]
            if clean_b:
                update['investmentHighlights'] = {'bullets': clean_b}

    if update:
        update['_aiEnrichedAt'] = datetime.now(timezone.utc)
        update['_aiModel'] = MODEL

    return update


# ═══════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(description='AI-enrich Binayah projects')
    parser.add_argument('--dry-run', action='store_true')
    parser.add_argument('--slug', type=str)
    parser.add_argument('--limit', type=int, default=0)
    parser.add_argument('--skip-existing', action='store_true')
    parser.add_argument('--verbose', '-v', action='store_true')
    args = parser.parse_args()

    print("🔌 Connecting to MongoDB...")
    mongo = MongoClient(MONGO_URI, serverSelectionTimeoutMS=10000)
    db = mongo[MONGO_DB]
    col = db[COLLECTION]

    total = col.count_documents({})
    print(f"✅ Connected! {total} projects.\n")

    query = {}
    if args.slug:
        query = {'slug': args.slug}
    elif args.skip_existing:
        query = {'_aiEnrichedAt': {'$exists': False}}

    cursor = col.find(query)
    if args.limit > 0:
        cursor = cursor.limit(args.limit)

    mode = '🧪 DRY RUN' if args.dry_run else '🚀 LIVE'
    print(f"{mode} | Model: {MODEL}")
    print('=' * 60 + '\n')

    processed = enriched = errors = skipped = 0
    cost = 0.0

    for doc in cursor:
        slug = doc.get('slug', '?')
        processed += 1

        raw_desc = doc.get('original_description') or doc.get('fullDescription') or ''
        if not raw_desc or len(str(raw_desc)) < 50:
            skipped += 1
            if args.verbose:
                print(f"  ⏭️  {slug} — no description")
            continue

        plain_desc = truncate_html(raw_desc)
        if len(plain_desc) < 30:
            skipped += 1
            continue

        result = call_openai(doc, plain_desc)
        if not result:
            errors += 1
            print(f"  ❌ {slug} — API failed")
            continue

        update = validate_and_clean(result)
        if not update:
            errors += 1
            print(f"  ❌ {slug} — validation failed")
            continue

        enriched += 1
        cost += 0.01

        if args.verbose:
            print(f"\n📋 {slug}")
            for k, v in update.items():
                if k.startswith('_'):
                    continue
                if isinstance(v, list):
                    print(f"   {k}:")
                    for item in v[:6]:
                        print(f"     • {item}")
                elif isinstance(v, dict):
                    for dk, dv in v.items():
                        if isinstance(dv, list):
                            print(f"   {k}.{dk}:")
                            for item in dv[:4]:
                                print(f"     • {item}")
                        else:
                            print(f"   {k}.{dk}: {dv}")
                elif isinstance(v, str) and len(v) > 100:
                    print(f"   {k}:")
                    # Split into paragraphs for readability
                    for para in v.split('\n\n')[:2]:
                        print(f"     {para[:180]}{'...' if len(para) > 180 else ''}")
                else:
                    print(f"   {k}: {v}")

        if not args.dry_run:
            col.update_one({'_id': doc['_id']}, {'$set': update})

        if processed % 50 == 0:
            print(f"\n  ... {processed} done | {enriched} enriched | {errors} err | ~${cost:.2f}")

        time.sleep(RATE_LIMIT_DELAY)

    print(f"\n{'='*60}")
    print(f"  AI ENRICHMENT COMPLETE")
    print(f"{'='*60}")
    print(f"  Processed: {processed}")
    print(f"  Enriched:  {enriched}")
    print(f"  Skipped:   {skipped}")
    print(f"  Errors:    {errors}")
    print(f"  Model:     {MODEL}")
    print(f"  Est. cost: ~${cost:.2f}")

    if enriched > 0 and not args.dry_run:
        sample = col.find_one(
            {'_aiEnrichedAt': {'$exists': True}},
            sort=[('_aiEnrichedAt', -1)]
        )
        if sample:
            print(f"\n  Latest: {sample.get('slug')}")
            print(f"  → {str(sample.get('shortOverview', ''))[:150]}")
            print(f"  → Ideal for: {sample.get('idealFor')}")


if __name__ == '__main__':
    main()