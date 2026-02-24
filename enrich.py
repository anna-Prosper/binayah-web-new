#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════
  BINAYAH — Ultimate Full Description Enrichment Script
═══════════════════════════════════════════════════════════════

Extracts structured data from fullDescription HTML (+ base64 blocks)
and overview_content bullets. ZERO hallucination — only writes fields
that are found via regex. If not found → field stays untouched.

Data sources (in priority order):
  1. Base64-encoded HTML block inside fullDescription (key-value pairs)
  2. overview_content <li> bullets (from WordPress migration)
  3. Prose paragraphs in fullDescription (amenities, FAQs, etc.)

Usage:
  # Dry run (no writes)
  python3 enrich_from_description.py --dry-run

  # Live run
  python3 enrich_from_description.py

  # Process single project for testing
  python3 enrich_from_description.py --slug "reportage-plaza"

  # Only run sanity audit
  python3 enrich_from_description.py --audit-only
"""
from dotenv import load_dotenv

import os
import re
import sys
import html
import base64
import json
import argparse
from datetime import datetime, timezone
from urllib.parse import unquote
from collections import Counter

# ── MongoDB ──
try:
    from pymongo import MongoClient  # type: ignore
except ImportError:
    # If pymongo is not installed, try to fall back to mongomock for local testing.
    # If neither is available, provide a placeholder that raises a clear runtime error
    # when an attempt is made to use MongoClient.
    try:
        import mongomock  # type: ignore
        MongoClient = mongomock.MongoClient
    except Exception:
        class _MissingMongoClient:
            def __init__(self, *args, **kwargs):
                raise RuntimeError(
                    "pymongo is not installed. Install with: pip install pymongo\n"
                    "For local testing you can also install mongomock: pip install mongomock"
                )
        MongoClient = _MissingMongoClient

# ═══════════════════════════════════════════════════════════
# CONFIGURATION — Update these before running
# ═══════════════════════════════════════════════════════════


MONGO_URI = "mongodb+srv://binayah_admin:TJ7Xi9oDourwpRE2@binayah.f0haxdf.mongodb.net/binayah_website_new?retryWrites=true&w=majority"
MONGO_DB = "binayah_website_new"
COLLECTION = "projects"  # or "offplan" — adjust to your collection name

# AED → USD conversion rate (approx)
AED_TO_USD = 0.2722

# Known payment methods to match against
KNOWN_PAYMENT_METHODS = {
    'Cash', 'Bank Transfer', 'Bitcoin', 'Credit Card', 'Cheque',
    'Cryptocurrency', 'Crypto', 'Wire Transfer', 'Mortgage',
    'Manager Cheque', 'Debit Card',
}

# Placeholder values to SKIP (these are WordPress defaults)
SKIP_VALUES = {
    'select developer', 'select status', 'n/a', 'na', 'tba', 'tbd',
    'call us', 'contact us', 'call', 'update soon', 'coming soon',
    'upon request', 'on request',
}


# ═══════════════════════════════════════════════════════════
# UTILITY FUNCTIONS
# ═══════════════════════════════════════════════════════════

def strip_html(text):
    """Remove all HTML tags and decode entities."""
    if not text:
        return ''
    return re.sub(r'<[^>]+>', '', html.unescape(str(text))).strip()


def is_skip_value(val):
    """Check if value is a placeholder that should be ignored."""
    if not val:
        return True
    return str(val).strip().lower() in SKIP_VALUES


def parse_price(text):
    """
    Parse AED price from text. Returns float or None.
    Handles: AED 1,722,888 | AED 1.4M | AED 990K | AED 702,853
    """
    if not text or is_skip_value(text):
        return None

    text = str(text).strip()

    # Try "AED X.XM" or "AED XXXK" format
    m = re.search(r'AED\s*([\d,.]+)\s*([KMB])', text, re.IGNORECASE)
    if m:
        num = float(m.group(1).replace(',', ''))
        suffix = m.group(2).upper()
        multiplier = {'K': 1_000, 'M': 1_000_000, 'B': 1_000_000_000}.get(suffix, 1)
        return num * multiplier

    # Try "AED 1,722,888" format
    m = re.search(r'AED\s*([\d,]+(?:\.\d+)?)', text, re.IGNORECASE)
    if m:
        return float(m.group(1).replace(',', ''))

    return None


def parse_completion_date(text):
    """Parse completion date. Returns string like 'Q3 2025' or None."""
    if not text or is_skip_value(text):
        return None
    m = re.search(r'Q([1-4])\s*[-–/]?\s*(20\d{2})', str(text), re.IGNORECASE)
    if m:
        return f"Q{m.group(1)} {m.group(2)}"
    # Try "2025" alone
    m = re.search(r'(20\d{2})', str(text))
    if m:
        return m.group(1)
    return None


# ═══════════════════════════════════════════════════════════
# LAYER 1: BASE64 BLOCK PARSER
# ═══════════════════════════════════════════════════════════

def decode_base64_blocks(full_desc):
    """
    Find and decode base64-encoded HTML blocks in fullDescription.
    These contain structured key-value property data.
    Returns dict of extracted fields.
    """
    result = {}

    # Find base64 strings (long alphanumeric blocks with = padding)
    b64_matches = re.findall(
        r'([A-Za-z0-9+/]{50,}={0,2})',
        str(full_desc)
    )

    for b64_str in b64_matches:
        try:
            decoded = base64.b64decode(b64_str).decode('utf-8', errors='ignore')
            decoded_html = unquote(decoded)

            # Extract <strong>Key</strong> <span>Value</span> pairs
            pairs = re.findall(
                r'<strong>(.*?)</strong>\s*<span>(.*?)</span>',
                decoded_html, re.IGNORECASE | re.DOTALL
            )

            for raw_key, raw_val in pairs:
                key = strip_html(raw_key).strip().lower()
                val = strip_html(raw_val).strip()

                if is_skip_value(val):
                    continue

                if 'property type' in key:
                    result['propertyType'] = val
                elif 'unit type' in key:
                    result['unitTypeLine'] = val
                elif key == 'size':
                    result['sizeLine'] = val
                elif key == 'area' or key == 'location':
                    result['community'] = val
                elif 'title' in key and 'type' in key:
                    result['titleType'] = val
                elif 'downpayment' in key or 'down payment' in key:
                    result['downPayment'] = val
                elif 'payment' in key and 'plan' in key:
                    result['paymentPlan'] = val
                elif 'completion' in key:
                    parsed = parse_completion_date(val)
                    if parsed:
                        result['completionDate'] = parsed
                elif 'developer' in key:
                    result['developerName'] = val
                elif 'starting' in key and 'price' in key:
                    price = parse_price(f"AED {val}" if 'AED' not in val.upper() else val)
                    if price:
                        result['startingPrice'] = price
                elif 'price' in key:
                    price = parse_price(f"AED {val}" if 'AED' not in val.upper() else val)
                    if price:
                        result.setdefault('startingPrice', price)
                elif 'eligibility' in key or 'ownership' in key:
                    result['eligibility'] = val

        except Exception:
            continue

    return result


# ═══════════════════════════════════════════════════════════
# LAYER 2: OVERVIEW_CONTENT BULLET PARSER
# ═══════════════════════════════════════════════════════════

def parse_overview_bullets(overview_html):
    """
    Parse <li> items from overview_content (WordPress CSV field).
    Returns dict of extracted fields.
    """
    result = {}
    if not overview_html:
        return result

    items = re.findall(r'<li[^>]*>(.*?)</li>', str(overview_html), re.DOTALL)

    for raw_item in items:
        item = strip_html(raw_item)
        if not item or len(item) < 3:
            continue

        # ── Starting Price ──
        price_m = re.search(
            r'(?:Starting\s+(?:Price|from)\s+)?AED\s*([\d,]+(?:\.\d+)?(?:\s*[KMB])?)',
            item, re.IGNORECASE
        )
        if price_m and 'startingPrice' not in result:
            price = parse_price(f"AED {price_m.group(1)}")
            if price:
                result['startingPrice'] = price

        # ── Payment Plan (ratio format: 60/40, 25/75) ──
        plan_ratio = re.search(r'(\d+/\d+)', item)
        if plan_ratio and ('payment' in item.lower() or 'plan' in item.lower()
                           or 'post' in item.lower() or 'handover' in item.lower()):
            result['paymentPlan'] = plan_ratio.group(1)
            # Check for post-handover detail
            post_m = re.search(r'(\d+)\s*(?:Yrs?|Years?)\s*Post[- ]?(?:Handover|Hand-over)', item, re.IGNORECASE)
            if post_m:
                result['paymentPlanSummary'] = f"{plan_ratio.group(1)}, {post_m.group(1)} Yrs Post-Handover"
            else:
                result['paymentPlanSummary'] = f"{plan_ratio.group(1)} Payment Plan"

        # ── Payment Plan (percentage format: 75% Payment Plan) ──
        if 'paymentPlan' not in result:
            pct_plan = re.search(r'(\d+%)\s*(?:Post\s*Handover|Payment\s*Plan)', item, re.IGNORECASE)
            if pct_plan:
                result['paymentPlan'] = pct_plan.group(1)
                result['paymentPlanSummary'] = item.strip()

        # ── Post-Handover standalone (e.g., "2 Years Post Handover", "50% Post Handover") ──
        if 'paymentPlan' not in result:
            post_standalone = re.search(r'(\d+(?:%|\s*Years?))\s*Post[- ]?(?:Handover|Hand-over)', item, re.IGNORECASE)
            if post_standalone:
                result['paymentPlanSummary'] = item.strip()

        # ── Downpayment ──
        down_m = re.search(r'(?:Down\s*payment|Booking)\s+(?:with\s+)?(\d+%)', item, re.IGNORECASE)
        if down_m:
            result['downPayment'] = down_m.group(1)

        # ── Completion Date ──
        comp_m = re.search(r'Q([1-4])\s*[-–/]?\s*(20\d{2})', item, re.IGNORECASE)
        if comp_m and 'completionDate' not in result:
            result['completionDate'] = f"Q{comp_m.group(1)} {comp_m.group(2)}"

        # ── Developer ──
        dev_m = re.search(r'(?:Develop(?:ed|er)\s+(?:by\s+)?)(.*)', item, re.IGNORECASE)
        if dev_m:
            dev = dev_m.group(1).strip().rstrip('.')
            if not is_skip_value(dev):
                result['developerName'] = dev

        # ── Community / Area / Location ──
        area_m = re.search(r'(?:Area|Location)\s*[-–:]?\s*(.*)', item, re.IGNORECASE)
        if area_m and not price_m:
            community = area_m.group(1).strip().rstrip('.')
            if community and not is_skip_value(community):
                result['community'] = community

        # ── Unit types line ──
        if re.search(r'\d+\s*(?:BR|Bed)', item, re.IGNORECASE) or \
           re.search(r'Studio', item, re.IGNORECASE):
            result.setdefault('unitTypeLine', item)

    return result


# ═══════════════════════════════════════════════════════════
# LAYER 3: FULL DESCRIPTION HTML PARSER
# ═══════════════════════════════════════════════════════════

def parse_full_description(full_desc):
    """
    Parse the HTML body of fullDescription for:
    - amenities, payment methods, unit sizes, FAQs, videos,
    - key highlights, clean description paragraphs
    """
    result = {}
    if not full_desc:
        return result

    text = str(full_desc)

    # ── Amenities from <ul class="live type2"> ──
    amenity_lists = re.findall(r'<ul\s+class=["\']live(?:\s+type2?)?["\']>(.*?)</ul>', text, re.DOTALL)
    amenities = []
    for ul in amenity_lists:
        items = re.findall(r'<li>(.*?)</li>', ul, re.DOTALL)
        amenities.extend([strip_html(i) for i in items if strip_html(i)])
    if amenities:
        result['amenities'] = list(dict.fromkeys(amenities))  # dedupe, preserve order

    # ── Payment Methods from centered <strong> blocks ──
    centered_strongs = re.findall(
        r'<p[^>]*text-align:\s*center[^>]*>\s*<(?:strong|b)>(.*?)</(?:strong|b)>\s*</p>',
        text, re.IGNORECASE
    )
    payment_methods = []
    for s in centered_strongs:
        clean = strip_html(s)
        if clean in KNOWN_PAYMENT_METHODS:
            payment_methods.append(clean)
    if payment_methods:
        result['acceptedPaymentMethods'] = payment_methods

    # ── Types and Sizes (e.g., "Studio" → "Size: 545.52 Sq.Ft") ──
    type_size_pattern = (
        r'<(?:b|strong)>\s*'
        r'((?:Studio|[\d]+\s*(?:BR|Bed(?:room)?)\s*(?:Apartment|Townhouse|Villa|Penthouse|Duplex|Unit)?)\s*)'
        r'\s*</(?:b|strong)>.*?'
        r'<(?:b|strong)>\s*Size:\s*([\d,.]+)\s*(?:Sq\.?\s*Ft\.?|sqft|sq\.?\s*m)'
    )
    type_size_pairs = re.findall(type_size_pattern, text, re.IGNORECASE | re.DOTALL)
    if type_size_pairs:
        types_and_sizes = []
        for t, s in type_size_pairs:
            types_and_sizes.append({
                "type": t.strip(),
                "size": float(s.replace(',', ''))
            })
        result['typesAndSizes'] = types_and_sizes

        # Derive unitSizeMin/Max from these
        sizes = [ts['size'] for ts in types_and_sizes]
        result['unitSizeMin'] = min(sizes)
        result['unitSizeMax'] = max(sizes)

    # ── Videos (YouTube embeds) ──
    video_urls = re.findall(
        r'src="(https?://(?:www\.)?youtube\.com/embed/[^"]+)"', text
    )
    if video_urls:
        result['videos'] = video_urls

    # ── Key Highlights from <ul> after "Key Points/Highlights/Features" heading ──
    highlights_match = re.search(
        r'(?:Key\s*(?:Points|Highlights|Features))\s*</(?:h[2-6]|strong|b)>\s*<ul[^>]*>(.*?)</ul>',
        text, re.DOTALL | re.IGNORECASE
    )
    if highlights_match:
        items = re.findall(r'<li>(.*?)</li>', highlights_match.group(1), re.DOTALL)
        highlights = [strip_html(i) for i in items if strip_html(i)]
        if highlights:
            result['keyHighlights'] = highlights

    # ── FAQs (question-answer pairs at bottom of description) ──
    plain = strip_html(text)
    faq_matches = re.findall(
        r'((?:What|How|Where|Who|Is|Can|Do|Does|Are|Will|When|Which)\s+[^?]{10,}?\?)\s*'
        r'([^?]+?)(?=(?:What|How|Where|Who|Is|Can|Do|Does|Are|Will|When|Which)\s+[A-Z]|\Z)',
        plain, re.DOTALL
    )
    faqs = []
    for q, a in faq_matches:
        answer = a.strip()
        if len(answer) > 20 and len(answer) < 2000:
            faqs.append({"question": q.strip(), "answer": answer})
    if faqs:
        result['faqs'] = faqs

    # ── Clean Short Overview (first 2 meaningful prose paragraphs) ──
    # Strategy: find <p> tags with justify alignment OR regular <p> that have
    # substantial text (not just "Update Soon" or payment method labels)
    all_paras = re.findall(r'<p[^>]*>(.*?)</p>', text, re.DOTALL)
    clean_paras = []
    for p in all_paras:
        clean = strip_html(p)
        # Skip short, centered, payment method, or boilerplate paragraphs
        if len(clean) < 60:
            continue
        if clean.lower() in SKIP_VALUES:
            continue
        if clean in KNOWN_PAYMENT_METHODS:
            continue
        if re.match(r'^Size:', clean):
            continue
        if 'Call us at' in clean:
            continue
        clean_paras.append(clean)

    if clean_paras:
        # Take first 2 meaningful paragraphs
        result['shortOverview'] = ' '.join(clean_paras[:2])

    # ── Rewrite fullDescription as clean 2 paragraphs ──
    # Same content but stripped of all base64, structured data, etc.
    if clean_paras:
        result['cleanDescription'] = '\n\n'.join(clean_paras[:2])

    return result


# ═══════════════════════════════════════════════════════════
# UNIT TYPE PARSING
# ═══════════════════════════════════════════════════════════

def parse_unit_types(unit_type_line):
    """
    Parse bedroom types from strings like:
    "1, 2, 3 & 4 BR Apartments" → ["Studio", "1 BR", "2 BR", "3 BR", "4 BR"]
    "Studio, 1, 2 & 4 Bed" → ["Studio", "1 BR", "2 BR", "4 BR"]
    """
    if not unit_type_line:
        return [], ''

    line = strip_html(str(unit_type_line))
    types = []

    # Check for Studio
    if re.search(r'studio', line, re.IGNORECASE):
        types.append("Studio")

    # Extract all bedroom numbers
    # Pattern: "1, 2, 3 & 4 BR" or "1, 2 & 3 Bed" or "3 & 4 BR"
    nums = re.findall(r'(\d+)\s*(?:,|\s|&amp;|&|\+|and)', line, re.IGNORECASE)
    # Also get the last number before BR/Bed
    last_num = re.search(r'(\d+)\s*(?:BR|Bed|Bedroom)', line, re.IGNORECASE)
    if last_num:
        nums.append(last_num.group(1))

    # Dedupe while preserving order
    seen = set()
    unique_nums = []
    for n in nums:
        if n not in seen:
            seen.add(n)
            unique_nums.append(n)

    types.extend([f"{n} BR" for n in unique_nums])

    # Determine property sub-type from the line
    bedrooms_str = ', '.join(types) if types else ''

    return types, bedrooms_str


def parse_size_range(size_line):
    """Parse size range from "546 to 2,345 Sq.Ft" → (546.0, 2345.0)"""
    if not size_line:
        return None, None
    m = re.search(r'([\d,]+(?:\.\d+)?)\s*(?:to|-|–)\s*([\d,]+(?:\.\d+)?)', str(size_line))
    if m:
        return float(m.group(1).replace(',', '')), float(m.group(2).replace(',', ''))
    # Single value
    m = re.search(r'([\d,]+(?:\.\d+)?)\s*(?:Sq|sqft|sq)', str(size_line))
    if m:
        val = float(m.group(1).replace(',', ''))
        return val, val
    return None, None


# ═══════════════════════════════════════════════════════════
# CITY DETECTION
# ═══════════════════════════════════════════════════════════

DUBAI_COMMUNITIES = {
    'dubai marina', 'downtown dubai', 'dubai hills', 'dubai creek',
    'palm jumeirah', 'jbr', 'jumeirah', 'business bay', 'dubai south',
    'emaar beachfront', 'dubai harbour', 'arabian ranches', 'damac hills',
    'dubailand', 'mina rashid', 'bluewaters', 'city walk', 'la mer',
    'dubai sports city', 'motor city', 'discovery gardens', 'dubai land',
    'silicon oasis', 'jvc', 'jvt', 'production city', 'tecom',
    'al barsha', 'the valley', 'tilal al ghaf', 'dubai creek harbour',
    'emaar south', 'port rashid', 'mohammed bin rashid', 'mbr',
    'madinat jumeirah', 'dubai hills estate',
}

ABU_DHABI_COMMUNITIES = {
    'masdar city', 'yas island', 'saadiyat island', 'al reem island',
    'al raha', 'khalifa city', 'abu dhabi gate', 'al maryah',
    'al ghadeer', 'jubail island',
}

def detect_city(community, full_desc='', name=''):
    """Detect city from community name or description."""
    all_text = f"{community} {full_desc} {name}".lower()

    for c in ABU_DHABI_COMMUNITIES:
        if c in all_text:
            return 'Abu Dhabi'

    if 'abu dhabi' in all_text:
        return 'Abu Dhabi'
    if 'sharjah' in all_text:
        return 'Sharjah'
    if 'ajman' in all_text:
        return 'Ajman'
    if 'ras al khaimah' in all_text or 'rak' in all_text:
        return 'Ras Al Khaimah'

    return 'Dubai'  # default


# ═══════════════════════════════════════════════════════════
# MAIN ENRICHMENT FUNCTION
# ═══════════════════════════════════════════════════════════

def enrich_project(doc):
    """
    Enrich a single project document.
    Returns dict of fields to $set, or empty dict if nothing found.
    """
    update = {}
    full_desc = doc.get('fullDescription', '') or ''
    overview = doc.get('overview_content', '') or doc.get('overviewContent', '') or ''
    name = doc.get('name', '') or doc.get('metaTitle', '') or ''

    # ── Parse all 3 layers ──
    b64_data = decode_base64_blocks(full_desc)
    overview_data = parse_overview_bullets(overview)
    html_data = parse_full_description(full_desc)

    # ── Merge with priority: base64 > overview > html ──
    # (base64 has the most structured/reliable data)

    # Developer Name — always overwrite if extracted
    dev = b64_data.get('developerName') or overview_data.get('developerName')
    if dev and not is_skip_value(dev):
        update['developerName'] = dev

    # Community — always overwrite if extracted
    comm = b64_data.get('community') or overview_data.get('community')
    if comm and not is_skip_value(comm):
        update['community'] = comm

    # City (derived from community)
    if comm:
        city = detect_city(comm, full_desc, name)
        update['city'] = city
        update['country'] = 'UAE'

    # Starting Price
    price = b64_data.get('startingPrice') or overview_data.get('startingPrice')
    if price and price > 0:
        update['startingPrice'] = price
        update['displayPrice'] = f"AED {price:,.0f}"
        update['priceUSD'] = round(price * AED_TO_USD)
        update['currency'] = 'AED'

    # Completion Date
    comp = b64_data.get('completionDate') or overview_data.get('completionDate')
    if comp:
        update['completionDate'] = comp

    # Construction Status (from existing wp field)
    status = doc.get('project_status') or doc.get('constructionStatus') or ''
    if status and not is_skip_value(status):
        update['constructionStatus'] = status

    # Payment Plan
    plan = b64_data.get('paymentPlan') or overview_data.get('paymentPlan')
    if plan and not is_skip_value(plan):
        update['paymentPlan'] = plan

    plan_summary = overview_data.get('paymentPlanSummary')
    if plan_summary:
        update['paymentPlanSummary'] = plan_summary

    # Down Payment
    down = b64_data.get('downPayment') or overview_data.get('downPayment')
    if down and not is_skip_value(down):
        update['downPayment'] = down

    # Title Type
    title_type = b64_data.get('titleType')
    if title_type and title_type.lower() in ('freehold', 'leasehold'):
        update['titleType'] = title_type

    # Eligibility
    elig = b64_data.get('eligibility')
    if elig:
        update['eligibility'] = elig

    # Property Type (from base64 if more specific)
    prop_type = b64_data.get('propertyType')
    if prop_type:
        update['propertyType'] = prop_type

    # ── Unit Types ──
    unit_line = b64_data.get('unitTypeLine') or overview_data.get('unitTypeLine')
    if unit_line:
        types, bedrooms_str = parse_unit_types(unit_line)
        if types:
            update['unitTypes'] = types
            update['bedrooms'] = bedrooms_str

    # ── Size Range ──
    size_line = b64_data.get('sizeLine')
    if size_line:
        smin, smax = parse_size_range(size_line)
        if smin:
            update['unitSizeMin'] = smin
        if smax:
            update['unitSizeMax'] = smax

    # ── From HTML parsing ──
    # Types and Sizes (individual unit floor plan sizes)
    if html_data.get('typesAndSizes'):
        update['typesAndSizes'] = html_data['typesAndSizes']
        # Also set size range if not already set from base64
        if 'unitSizeMin' not in update and html_data.get('unitSizeMin'):
            update['unitSizeMin'] = html_data['unitSizeMin']
        if 'unitSizeMax' not in update and html_data.get('unitSizeMax'):
            update['unitSizeMax'] = html_data['unitSizeMax']

    # Amenities
    if html_data.get('amenities'):
        update['amenities'] = html_data['amenities']

    # Payment Methods
    if html_data.get('acceptedPaymentMethods'):
        update['acceptedPaymentMethods'] = html_data['acceptedPaymentMethods']

    # Videos
    if html_data.get('videos'):
        update['videos'] = html_data['videos']

    # Key Highlights
    if html_data.get('keyHighlights'):
        update['keyHighlights'] = html_data['keyHighlights']

    # FAQs
    if html_data.get('faqs'):
        update['faqs'] = html_data['faqs']

    # Short Overview (2 paragraphs)
    if html_data.get('shortOverview'):
        update['shortOverview'] = html_data['shortOverview']

    # Clean Description (rewrite fullDescription)
    if html_data.get('cleanDescription'):
        update['fullDescription'] = html_data['cleanDescription']

    # Timestamp
    if update:
        update['updatedAt'] = datetime.now(timezone.utc)
        update['_enrichedAt'] = datetime.now(timezone.utc)
        update['_enrichedFields'] = list(update.keys())

    return update


# ═══════════════════════════════════════════════════════════
# SANITY AUDIT
# ═══════════════════════════════════════════════════════════

AUDIT_FIELDS = [
    'developerName', 'community', 'propertyType', 'constructionStatus',
    'completionDate', 'shortOverview', 'displayPrice', 'downPayment',
    'paymentPlan', 'paymentPlanSummary', 'titleType', 'eligibility',
    'startingPrice', 'priceUSD', 'unitTypes', 'unitSizeMin', 'unitSizeMax',
    'amenities', 'acceptedPaymentMethods', 'keyHighlights', 'faqs',
    'videos', 'bedrooms', 'city', 'typesAndSizes',
    'fullDescription', 'metaTitle', 'metaDescription',
    'featuredImage', 'imageGallery', 'viewCount', 'tags',
]

def run_audit(col):
    """Run field coverage audit and print results."""
    total = col.count_documents({'publishStatus': 'Published'})
    if total == 0:
        total = col.count_documents({})

    print(f"\n{'═'*60}")
    print(f" FIELD COVERAGE AUDIT ({total} projects)")
    print(f"{'═'*60}")

    for field in AUDIT_FIELDS:
        # Count documents where field exists and is not null/empty
        query = {
            '$and': [
                {field: {'$exists': True}},
                {field: {'$ne': None}},
                {field: {'$ne': ''}},
                {field: {'$ne': []}},
                {field: {'$ne': 0}},
            ]
        }
        count = col.count_documents(query)
        pct = (count / total * 100) if total > 0 else 0

        # Visual bar
        bar_len = 20
        filled = int(pct / 100 * bar_len)
        bar = '█' * filled + '░' * (bar_len - filled)

        # Status emoji
        if pct >= 95:
            emoji = '✅'
        elif pct >= 60:
            emoji = '🟢'
        elif pct >= 25:
            emoji = '🟡'
        elif pct > 0:
            emoji = '🔴'
        else:
            emoji = '💀'

        print(f"{emoji} {field:<30} {bar}  {count:>5}/{total} ({pct:.0f}%)")

    print(f"{'═'*60}\n")


# ═══════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(description='Enrich Binayah projects from fullDescription')
    parser.add_argument('--dry-run', action='store_true', help='Parse but do not write to MongoDB')
    parser.add_argument('--slug', type=str, help='Process a single project by slug')
    parser.add_argument('--limit', type=int, default=0, help='Limit number of projects to process')
    parser.add_argument('--audit-only', action='store_true', help='Only run the audit, no enrichment')
    parser.add_argument('--verbose', '-v', action='store_true', help='Print details for each project')
    args = parser.parse_args()

    # Connect
    print(f"🔌 Connecting to MongoDB...")
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=10000)
    db = client[MONGO_DB]
    col = db[COLLECTION]

    # Test connection
    total = col.count_documents({})
    print(f"✅ Connected! Collection '{COLLECTION}' has {total} documents.\n")

    # Audit only mode
    if args.audit_only:
        run_audit(col)
        return

    # Build query
    query = {}
    if args.slug:
        query = {'slug': args.slug}

    cursor = col.find(query)
    if args.limit > 0:
        cursor = cursor.limit(args.limit)

    # Stats
    processed = 0
    enriched = 0
    field_counts = Counter()
    errors = 0

    print(f"{'🧪 DRY RUN — no writes' if args.dry_run else '🚀 LIVE RUN — writing to MongoDB'}")
    print(f"{'='*60}\n")

    for doc in cursor:
        processed += 1
        slug = doc.get('slug', doc.get('_id'))

        try:
            update = enrich_project(doc)

            if update:
                enriched += 1
                for field in update:
                    if field not in ('updatedAt', '_enrichedAt', '_enrichedFields'):
                        field_counts[field] += 1

                if args.verbose:
                    print(f"\n📋 {slug}")
                    for k, v in update.items():
                        if k in ('updatedAt', '_enrichedAt', '_enrichedFields'):
                            continue
                        val_str = str(v)[:80]
                        print(f"   {k}: {val_str}")

                if not args.dry_run:
                    col.update_one({'_id': doc['_id']}, {'$set': update})

            if processed % 200 == 0:
                print(f"  ... processed {processed} projects ({enriched} enriched)")

        except Exception as e:
            errors += 1
            print(f"  ❌ Error on {slug}: {e}")

    # Summary
    print(f"\n{'='*60}")
    print(f"  ENRICHMENT COMPLETE")
    print(f"{'='*60}")
    print(f"  Processed:  {processed}")
    print(f"  Enriched:   {enriched} ({enriched/processed*100:.1f}%)" if processed else "  Enriched:   0")
    print(f"  Errors:     {errors}")
    print(f"\n  Fields populated:")
    for field, count in field_counts.most_common():
        print(f"    {field}: {count}")

    # Run audit after enrichment
    if not args.dry_run:
        print("\n📊 Running post-enrichment audit...")
        run_audit(col)


if __name__ == '__main__':
    main()