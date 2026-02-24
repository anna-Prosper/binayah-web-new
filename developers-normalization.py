#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════
  BINAYAH — Final Developer Cleanup (Round 2)
═══════════════════════════════════════════════════════════════

Remaining normalizations missed in round 1.
Merges duplicates, fixes casing, clears junk.

Usage:
  python3 cleanup_developers_r2.py --dry-run
  python3 cleanup_developers_r2.py
"""

import os
import sys
import argparse
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv('.env')
if not os.environ.get('MONGODB_URI'):
    load_dotenv('.env.local')

MONGO_URI = os.environ.get('MONGODB_URI')
if not MONGO_URI:
    print('❌ MONGODB_URI missing')
    sys.exit(1)

# ═══════════════════════════════════════════════════════════
# ROUND 2 MAPPINGS: messy → canonical
# ═══════════════════════════════════════════════════════════
NORMALIZE = {
    # Duplicates to merge
    '4Direction': '4Direction Developments',
    'AB Developer': 'AB Developers',
    'Abou Eid Real Estate Development': 'Abou Eid Developer',
    'Al Jaziri Group': 'Al Jaziri Developments',
    'Al Yakka Developers': 'Al Yakka Developer',
    'Asak Real Estate Development': 'ASAK Development',
    'Aura Infinite Real Estate': 'Aura Infinite',
    'B.N.H Developer': 'BNH Developer',
    'BNH Real Estate & Refine': 'BNH Developer',
    'BNW': 'BNW Developments',
    'Bam Real Estate Development': 'Bam Eskan Development',
    'Binghatti Developer': 'Binghatti Developers',
    'Crystal Bay Real Estate': 'Crystal Bay',
    'Dubai South Properties': 'Dubai South',
    'East & West Properties': 'East and West Properties',
    'EMPIRE DEVELOPMENT': 'Empire Development',
    'Empire Developments': 'Empire Development',
    'Esnaad developments': 'ESNAD Management',
    'Evera Developments': 'Evera Development',
    'Forum Real Estate': 'Forum Group',
    'GFS': 'GFS Real Estate',
    'GFS Developer': 'GFS Real Estate',
    'GFS Developers': 'GFS Real Estate',
    'GFS Development': 'GFS Real Estate',
    'Golden Woods': 'Golden Wood Real Estate',
    'Green Horizon': 'Green Horizon Development',
    'Gulf Land Property': 'Gulf Land Developers',
    'H&H': 'H&H Development',
    'Hijazi Real Estate': 'Hijazi Development',
    'IGO': 'Invest Group Overseas',
    'Innovate Development LLC': 'Innovate Development',
    'Jumeriah Luxury Living': 'Jumeirah Group',
    'LMD Continental Investment': 'LMD Continental Investments',
    'LMD Development': 'LMD Continental Investments',
    'Lamar Development': 'Lamar',
    'Lincoln': 'Lincoln Star Real Estate',
    'Lucky Aeon Development': 'Lucky Aeon',
    'Maaia Developers': 'Maaia',
    "Mada'in": "Mada'in Properties",
    'Madar Developments': 'Madar Real Estate',
    'Madar Real Estate Development': 'Madar Real Estate',
    'Main Reality': 'Main Realty Real Estate',
    'Manam Real Estate Development': 'Manam Real Estate',
    'Nabni Developments': 'NABNI Development',
    'OHANA Development': 'Ohana Development',
    'ONE Development': 'One Development',
    'Palladium Development': 'Palladium Developers',
    'Peak Summit Real Estate Development': 'Peak Summit',
    'Radiant': 'Radiant Real Estate',
    'Radiant Developer': 'Radiant Real Estate',
    'Range RAK Development': 'Range Developments',
    'Reef Luxury Development': 'Reef Developments',
    'Rijas Development': 'RIJAS ACES',
    'Royal Development Holding': 'Royal Development Company',
    'S&S Developments': 'S&S Development',
    'Sido Developments': 'Sido Development',
    'Sol Arena Development': 'Sol Development',
    'Source Of Fate Properties': 'Source of Fate Properties',
    'Tabeer Development': 'Tabeer Developments',
    'Tabeer Real Estate': 'Tabeer Developments',
    'Tabeer Starwood Holding': 'Tabeer Developments',
    'Tasmeer Indigo Development': 'Tasmeer Development',
    'Vision Development': 'Vision Developments',
    'Vision Platinum Real Estate': 'Vision Platinum Real Estate Development',
}

# Values to clear (not real developers)
JUNK = {
    'AED 3,212,888',
    'NULL',
    'Reveal Soon',
    'Dubai',
    'Naser',
    'Markaz',
    'One Yard',
    'Nine Yard',
    'PG Living',
    'KAYA',
    'JHK',
    'SDIC',
    'Cledor',
    'Newbury',
    'NEOTERRA',
    'Richmind',
    'Elevate',
}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()

    mongo = MongoClient(MONGO_URI, serverSelectionTimeoutMS=10000)
    db = mongo[MONGO_DB]
    col = db['projects']

    print(f"✅ Connected! {col.count_documents({})} projects\n")
    mode = '🧪 DRY RUN' if args.dry_run else '🚀 LIVE'
    print(f"{mode}")
    print('=' * 60)

    renamed = 0
    junked = 0

    # Clear junk
    for val in sorted(JUNK):
        count = col.count_documents({'developerName': val})
        if count > 0:
            print(f"  🗑️  '{val}' ({count}) → cleared")
            junked += count
            if not args.dry_run:
                col.update_many({'developerName': val}, {'$set': {'developerName': ''}})

    # Normalize
    for old, new in sorted(NORMALIZE.items()):
        count = col.count_documents({'developerName': old})
        if count > 0:
            print(f"  ✏️  '{old}' ({count}) → '{new}'")
            renamed += count
            if not args.dry_run:
                col.update_many({'developerName': old}, {'$set': {'developerName': new}})

    print(f"\n{'='*60}")
    print(f"  Renamed: {renamed} projects")
    print(f"  Junked:  {junked} projects")
    print(f"{'='*60}")

    # Show remaining unique count
    remaining = len([d for d in col.distinct('developerName') if d and d.strip()])
    print(f"\n  Unique developers remaining: {remaining}")


MONGO_DB = "binayah_website_new"

if __name__ == '__main__':
    main()