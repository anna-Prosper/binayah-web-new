#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════
  BINAYAH — Project Import API
═══════════════════════════════════════════════════════════════

Simple API that accepts project data as JSON and upserts
into MongoDB. Your colleague POSTs JSON → it goes straight
into the projects collection.

Endpoints:
  POST /api/projects          → upsert single project
  POST /api/projects/batch    → upsert multiple projects
  GET  /api/projects/:slug    → get single project
  GET  /api/projects          → list projects (paginated)
  GET  /api/health            → health check

Usage:
  pip install flask pymongo python-dotenv
  python3 import_api.py

  # Then colleague sends:
  curl -X POST http://YOUR_IP:5050/api/projects \
    -H "Content-Type: application/json" \
    -H "X-API-Key: your-secret-key" \
    -d '{"name": "Test Project", "slug": "test-project", ...}'

Environment:
  MONGODB_URI=mongodb+srv://...
  IMPORT_API_KEY=some-secret-key   # simple auth
"""

import os
import sys
import re
from datetime import datetime, timezone

from dotenv import load_dotenv
from flask import Flask, request, jsonify
from pymongo import MongoClient

load_dotenv('.env')
if not os.environ.get('MONGODB_URI'):
    load_dotenv('.env.local')

MONGO_URI = os.environ.get('MONGODB_URI')
API_KEY = os.environ.get('IMPORT_API_KEY', 'change-me-to-something-secret')

if not MONGO_URI:
    print('❌ MONGODB_URI missing from .env')
    sys.exit(1)

MONGO_DB = "binayah_website_new"

# ── MongoDB connection ──
mongo = MongoClient(MONGO_URI, serverSelectionTimeoutMS=10000)
db = mongo[MONGO_DB]
projects_col = db['projects']
developers_col = db['developers']

app = Flask(__name__)


# ═══════════════════════════════════════════════════════════
# AUTH MIDDLEWARE
# ═══════════════════════════════════════════════════════════

def check_auth():
    """Simple API key auth via header."""
    key = request.headers.get('X-API-Key')
    if key != API_KEY:
        return False
    return True


# ═══════════════════════════════════════════════════════════
# HELPERS
# ═══════════════════════════════════════════════════════════

def make_slug(name):
    """Generate URL slug from project name."""
    s = name.lower().strip()
    s = re.sub(r'[^\w\s-]', '', s)
    s = re.sub(r'[\s_]+', '-', s)
    s = re.sub(r'-+', '-', s)
    return s.strip('-')


# All valid fields in our schema
VALID_FIELDS = {
    'name', 'slug', 'source', 'sourceId', 'sourceUrl',
    'status', 'projectType', 'propertyType',
    'developerName', 'community', 'city', 'country',
    'address', 'latitude', 'longitude', 'mapUrl',
    'startingPrice', 'displayPrice', 'currency', 'priceRange',
    'priceByType', 'priceUSD',
    'bedrooms', 'bathrooms', 'unitTypes', 'totalUnits',
    'unitSizeMin', 'unitSizeMax', 'typesAndSizes',
    'completionDate', 'constructionStatus',
    'shortOverview', 'fullDescription', 'original_description',
    'amenities', 'amenitiesTitle', 'amenitiesContent',
    'floorPlans', 'floorPlanContent', 'floorPlanImage',
    'paymentPlan', 'paymentPlanSummary', 'downPayment',
    'acceptedPaymentMethods',
    'featuredImage', 'imageGallery', 'localImages',
    'masterPlanImages', 'masterPlanDescription',
    'videos', 'brochureUrl',
    'metaTitle', 'metaDescription', 'focusKeyword',
    'tags', 'areas',
    'titleType', 'keyHighlights', 'idealFor',
    'investmentHighlights', 'faqs',
    'viewCount', 'publishStatus', 'publishedAt',
}


def validate_project(data):
    """Validate and clean incoming project data."""
    errors = []

    # Name is required
    if not data.get('name'):
        errors.append('name is required')

    # Generate slug if missing
    if not data.get('slug') and data.get('name'):
        data['slug'] = make_slug(data['name'])

    # Default values
    data.setdefault('source', 'api')
    data.setdefault('country', 'UAE')
    data.setdefault('city', 'Dubai')
    data.setdefault('currency', 'AED')
    data.setdefault('publishStatus', 'Published')

    # Strip unknown fields
    cleaned = {}
    unknown = []
    for key, val in data.items():
        if key in VALID_FIELDS:
            cleaned[key] = val
        elif key.startswith('_'):
            pass  # skip internal fields
        else:
            unknown.append(key)

    if unknown:
        errors.append(f'Unknown fields (ignored): {", ".join(unknown)}')

    return cleaned, errors


# ═══════════════════════════════════════════════════════════
# ENDPOINTS
# ═══════════════════════════════════════════════════════════

@app.route('/api/health', methods=['GET'])
def health():
    """Health check."""
    try:
        count = projects_col.count_documents({})
        return jsonify({
            'status': 'ok',
            'projects': count,
            'database': MONGO_DB
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/api/projects', methods=['GET'])
def list_projects():
    """List projects with pagination."""
    if not check_auth():
        return jsonify({'error': 'Unauthorized'}), 401

    page = int(request.args.get('page', 1))
    limit = min(int(request.args.get('limit', 50)), 200)
    skip = (page - 1) * limit

    # Optional filters
    query = {}
    if request.args.get('developer'):
        query['developerName'] = request.args['developer']
    if request.args.get('community'):
        query['community'] = request.args['community']
    if request.args.get('city'):
        query['city'] = request.args['city']

    total = projects_col.count_documents(query)
    docs = list(projects_col.find(
        query,
        {'_id': 0, 'original_description': 0}  # exclude large fields
    ).sort('updatedAt', -1).skip(skip).limit(limit))

    # Convert ObjectId etc. for JSON serialization
    for doc in docs:
        for k, v in doc.items():
            if hasattr(v, 'isoformat'):
                doc[k] = v.isoformat()

    return jsonify({
        'total': total,
        'page': page,
        'limit': limit,
        'pages': (total + limit - 1) // limit,
        'data': docs
    })


@app.route('/api/projects/<slug>', methods=['GET'])
def get_project(slug):
    """Get single project by slug."""
    if not check_auth():
        return jsonify({'error': 'Unauthorized'}), 401

    doc = projects_col.find_one({'slug': slug}, {'_id': 0})
    if not doc:
        return jsonify({'error': 'Not found'}), 404

    for k, v in doc.items():
        if hasattr(v, 'isoformat'):
            doc[k] = v.isoformat()

    return jsonify(doc)


@app.route('/api/projects', methods=['POST'])
def upsert_project():
    """
    Create or update a single project.
    Upserts by slug — if slug exists, updates; otherwise inserts.
    """
    if not check_auth():
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json()
    if not data:
        return jsonify({'error': 'JSON body required'}), 400

    cleaned, errors = validate_project(data)
    if not cleaned.get('name'):
        return jsonify({'error': 'name is required', 'validation_errors': errors}), 400

    slug = cleaned['slug']
    now = datetime.now(timezone.utc).isoformat()
    cleaned['updatedAt'] = now

    # Check if exists
    existing = projects_col.find_one({'slug': slug})

    if existing:
        # Update — only set provided fields (don't wipe existing data)
        result = projects_col.update_one(
            {'slug': slug},
            {'$set': cleaned}
        )
        action = 'updated'
    else:
        # Insert — add createdAt
        cleaned['createdAt'] = now
        cleaned.setdefault('viewCount', 0)
        result = projects_col.insert_one(cleaned)
        action = 'created'

    return jsonify({
        'status': 'ok',
        'action': action,
        'slug': slug,
        'warnings': errors if errors else None
    }), 200 if action == 'updated' else 201


@app.route('/api/projects/batch', methods=['POST'])
def batch_upsert():
    """
    Upsert multiple projects at once.
    Body: { "projects": [...] }
    """
    if not check_auth():
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json()
    if not data or 'projects' not in data:
        return jsonify({'error': 'JSON body with "projects" array required'}), 400

    projects = data['projects']
    if not isinstance(projects, list):
        return jsonify({'error': '"projects" must be an array'}), 400

    if len(projects) > 500:
        return jsonify({'error': 'Max 500 projects per batch'}), 400

    results = {
        'created': 0,
        'updated': 0,
        'errors': [],
        'total': len(projects)
    }

    now = datetime.now(timezone.utc).isoformat()

    for i, proj in enumerate(projects):
        cleaned, errors = validate_project(proj)

        if not cleaned.get('name'):
            results['errors'].append({
                'index': i,
                'error': 'name is required',
                'data': proj.get('name', '?')
            })
            continue

        slug = cleaned['slug']
        cleaned['updatedAt'] = now

        existing = projects_col.find_one({'slug': slug})

        if existing:
            projects_col.update_one({'slug': slug}, {'$set': cleaned})
            results['updated'] += 1
        else:
            cleaned['createdAt'] = now
            cleaned.setdefault('viewCount', 0)
            projects_col.insert_one(cleaned)
            results['created'] += 1

    return jsonify(results)


@app.route('/api/projects/<slug>', methods=['DELETE'])
def delete_project(slug):
    """Delete a project by slug."""
    if not check_auth():
        return jsonify({'error': 'Unauthorized'}), 401

    result = projects_col.delete_one({'slug': slug})
    if result.deleted_count == 0:
        return jsonify({'error': 'Not found'}), 404

    return jsonify({'status': 'ok', 'deleted': slug})


@app.route('/api/developers', methods=['GET'])
def list_developers():
    """List all developers."""
    if not check_auth():
        return jsonify({'error': 'Unauthorized'}), 401

    docs = list(developers_col.find(
        {},
        {'_id': 0}
    ).sort('projectCount', -1))

    for doc in docs:
        for k, v in doc.items():
            if hasattr(v, 'isoformat'):
                doc[k] = v.isoformat()

    return jsonify({'total': len(docs), 'data': docs})


@app.route('/api/schema', methods=['GET'])
def get_schema():
    """Return the valid fields schema for reference."""
    return jsonify({
        'valid_fields': sorted(VALID_FIELDS),
        'required': ['name'],
        'auto_generated': ['slug (from name)', 'updatedAt', 'createdAt'],
        'defaults': {
            'source': 'api',
            'country': 'UAE',
            'city': 'Dubai',
            'currency': 'AED',
            'publishStatus': 'Published'
        },
        'example': {
            'name': 'Test Residence by Developer X',
            'developerName': 'Developer X',
            'community': 'Dubai Marina',
            'city': 'Dubai',
            'propertyType': 'Apartment',
            'projectType': 'Residential',
            'bedrooms': '1 BR, 2 BR, 3 BR',
            'startingPrice': 1200000,
            'displayPrice': 'AED 1,200,000',
            'completionDate': 'Q4 2026',
            'constructionStatus': 'Under Construction',
            'paymentPlan': '60/40',
            'downPayment': '20%',
            'amenities': ['Gym', 'Pool', 'Parking'],
            'shortOverview': 'Short description here.',
            'fullDescription': 'Full marketing description...',
            'status': 'New Launch',
            'publishStatus': 'Published'
        }
    })


# ═══════════════════════════════════════════════════════════
# RUN
# ═══════════════════════════════════════════════════════════

if __name__ == '__main__':
    port = int(os.environ.get('IMPORT_API_PORT', 5050))
    print(f"🚀 Binayah Import API running on http://0.0.0.0:{port}")
    print(f"📋 Schema: http://localhost:{port}/api/schema")
    print(f"❤️  Health: http://localhost:{port}/api/health")
    print(f"🔑 API Key: {'SET' if API_KEY != 'change-me-to-something-secret' else '⚠️  USING DEFAULT — set IMPORT_API_KEY in .env'}")
    app.run(host='0.0.0.0', port=port, debug=True)