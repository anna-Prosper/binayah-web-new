from pymongo import MongoClient

c = MongoClient('mongodb+srv://binayah_admin:TJ7Xi9oDourwpRE2@binayah.f0haxdf.mongodb.net/')
db = c['binayah_website_new']

print('Collections:', db.list_collection_names())

backup = db['projects_copy']
projects = db['projects']

matched = 0
skipped = 0

for doc in backup.find({}, {'slug': 1, 'fullDescription': 1}):
    slug = doc.get('slug')
    fd = doc.get('fullDescription')
    if not slug or not fd:
        skipped += 1
        continue

    result = projects.update_one(
        {'slug': slug},
        {'$set': {'original_description': fd}}
    )
    if result.modified_count:
        matched += 1

print(f'Done! Matched: {matched}, Skipped: {skipped}')

sample = projects.find_one({'original_description': {'$exists': True}})
if sample:
    print(f'Sample: {sample["slug"]}')
    print(f'  original_description length: {len(sample["original_description"])}')
    print(f'  fullDescription length: {len(sample.get("fullDescription", ""))}')
