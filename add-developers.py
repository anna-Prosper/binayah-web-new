#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════
  BINAYAH — Add Missing Developers to developers collection
═══════════════════════════════════════════════════════════════

Finds all developerName values in projects with 2+ projects,
checks which are missing from the developers collection,
and inserts them with proper schema.

Usage:
  python3 add_developers.py --dry-run    # preview
  python3 add_developers.py              # insert
"""

import os
import re
import sys
import argparse
from datetime import datetime, timezone

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv('.env')
if not os.environ.get('MONGODB_URI'):
    load_dotenv('.env.local')

MONGO_URI = os.environ.get('MONGODB_URI')
if not MONGO_URI:
    print('❌ MONGODB_URI missing')
    sys.exit(1)

MONGO_DB = "binayah_website_new"


def make_slug(name):
    """Convert developer name to URL-safe slug."""
    s = name.lower().strip()
    s = re.sub(r'[^\w\s-]', '', s)  # remove special chars
    s = re.sub(r'[\s_]+', '-', s)   # spaces/underscores to hyphens
    s = re.sub(r'-+', '-', s)       # collapse multiple hyphens
    s = s.strip('-')
    return s


def make_developer_doc(name, project_count):
    """Create a developer document matching existing schema."""
    now = datetime.now(timezone.utc).isoformat()
    slug = make_slug(name)
    return {
        'name': name,
        'slug': slug,
        'wpId': None,
        'description': '',
        'logo': '',
        'address': 'Dubai - UAE',
        'email': 'info@binayah.com',
        'phone': '+971 55 509 9157',
        'facebook': '',
        'twitter': '',
        'website': '',
        'projectCount': project_count,
        'metaTitle': f'{name} - Real Estate Developer in Dubai UAE',
        'metaDescription': f'{name} - Real Estate Developer in Dubai UAE',
        'viewCount': 0,
        'featured': False,
        'publishStatus': 'Published',
        'createdAt': now,
        'updatedAt': now,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--dry-run', action='store_true')
    parser.add_argument('--min-projects', type=int, default=2, help='Minimum project count (default: 2)')
    args = parser.parse_args()

    mongo = MongoClient(MONGO_URI, serverSelectionTimeoutMS=10000)
    db = mongo[MONGO_DB]
    projects = db['projects']
    developers = db['developers']

    print(f"✅ Connected!")
    print(f"   Projects: {projects.count_documents({})}")
    print(f"   Developers: {developers.count_documents({})}\n")

    # Get all developers with 2+ projects from projects collection
    pipeline = [
        {'$match': {'developerName': {'$nin': [None, '']}}},
        {'$group': {'_id': '$developerName', 'count': {'$sum': 1}}},
        {'$match': {'count': {'$gte': args.min_projects}}},
        {'$sort': {'count': -1}}
    ]
    project_devs = list(projects.aggregate(pipeline))
    print(f"📊 Developers with {args.min_projects}+ projects: {len(project_devs)}")

    # Get existing developer names from developers collection
    existing_names = set(developers.distinct('name'))
    # Also check slugs to avoid duplicates
    existing_slugs = set(developers.distinct('slug'))

    print(f"📋 Already in developers table: {len(existing_names)}\n")

    # Find missing
    to_add = []
    already_exists = 0
    for dev in project_devs:
        name = dev['_id']
        count = dev['count']
        slug = make_slug(name)

        if name in existing_names or slug in existing_slugs:
            already_exists += 1
            continue

        to_add.append((name, count))

    print(f"{'🧪 DRY RUN' if args.dry_run else '🚀 LIVE'}")
    print(f"{'='*60}")
    print(f"  Already in table: {already_exists}")
    print(f"  To add:           {len(to_add)}")
    print(f"{'='*60}\n")

    if not to_add:
        print("✅ Nothing to add!")
        return

    inserted = 0
    for name, count in to_add:
        doc = make_developer_doc(name, count)
        print(f"  {'➕' if not args.dry_run else '📋'} {name} ({count} projects) → slug: {doc['slug']}")

        if not args.dry_run:
            developers.insert_one(doc)
            inserted += 1

    # Update projectCount for existing developers too
    print(f"\n{'='*60}")
    print(f"  Updating projectCount for existing developers...")
    updated = 0
    for dev in project_devs:
        name = dev['_id']
        count = dev['count']
        if name in existing_names:
            if not args.dry_run:
                developers.update_one(
                    {'name': name},
                    {'$set': {'projectCount': count}}
                )
            updated += 1

    print(f"{'='*60}")
    print(f"  SUMMARY")
    print(f"{'='*60}")
    print(f"  New developers added:    {inserted if not args.dry_run else f'{len(to_add)} (dry run)'}")
    print(f"  Existing counts updated: {updated}")
    print(f"  Total in developers:     {developers.count_documents({})}")


if __name__ == '__main__':
    main()