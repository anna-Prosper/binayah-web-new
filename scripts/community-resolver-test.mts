#!/usr/bin/env tsx
/**
 * Guards resolveBuyCommunity(), which turns the community string stored on a
 * project into a curated community so the page can link to its hub.
 *
 * Why it exists: the project page matched on the curated `name` alone, which
 * resolved 47% of projects measured across a 120-project sample. The other 53%
 * silently rendered no community link — no error, no empty state, just a
 * missing internal link on the core commercial template.
 *
 * The harder half is what must NOT resolve. "Akoya Damac Hills" looks like a
 * plain alias for Damac Hills, but in the live data it is a fallback value
 * attached to projects in Saadiyat, Al Reem Island, Sharjah, Ras Al Khaimah and
 * Town Square. Adding it as a synonym would have pointed Abu Dhabi projects at
 * a Dubai golf community — a wrong link is worse than no link, because it
 * misleads both the reader and the crawler. Those cases are pinned below.
 *
 *   npx tsx scripts/community-resolver-test.mts
 */
import { resolveBuyCommunity, normalizeCommunityName, BUY_COMMUNITIES } from "../src/lib/buy-communities";

type Case = [input: string, expected: string | null, note?: string];

const CASES: Case[] = [
  // Abbreviations projects actually store
  ["JVC", "jumeirah-village-circle", "10x in a 120-project sample"],
  ["jvc", "jumeirah-village-circle", "case-insensitive"],
  ["JLT", "jumeirah-lakes-towers"],

  // Canonical names
  ["Jumeirah Village Circle", "jumeirah-village-circle"],
  ["Dubai Marina", "dubai-marina"],

  // apiName rather than name
  ["Mohammed Bin Rashid City", "mbr-city"],

  // ", Dubai" / " Dubai" suffixes, very common on stored values
  ["Jumeirah Village Circle, Dubai", "jumeirah-village-circle"],
  ["International City Dubai", "international-city"],

  // Whitespace and punctuation noise
  ["Dubai  Marina ", "dubai-marina"],

  // MUST NOT resolve — see the header note
  ["Akoya Damac Hills", null, "fallback value on non-Dubai projects"],
  ["Arjan Dubai", null, "Arjan is not a curated community"],
  ["", null],
  ["Not A Real Community Anywhere", null],
];

let pass = 0;
const failures: string[] = [];

for (const [input, expected, note] of CASES) {
  const got = resolveBuyCommunity(input)?.slug ?? null;
  if (got === expected) {
    pass++;
  } else {
    failures.push(`  ${JSON.stringify(input)} -> ${got ?? "(none)"}, expected ${expected ?? "(none)"}${note ? `  [${note}]` : ""}`);
  }
}

// Every curated name must resolve to its own community: a looser synonym must
// never be able to claim another community's canonical name.
const hijacked: string[] = [];
for (const c of BUY_COMMUNITIES) {
  const got = resolveBuyCommunity(c.name)?.slug;
  if (got !== c.slug) hijacked.push(`  ${c.name} -> ${got ?? "(none)"}, expected ${c.slug}`);
}

// No two communities may declare the same normalised variant.
const owner = new Map<string, string>();
const collisions: string[] = [];
for (const c of BUY_COMMUNITIES) {
  for (const variant of [c.name, c.apiName, ...(c.synonyms ?? [])]) {
    if (!variant) continue;
    const key = normalizeCommunityName(variant);
    if (!key) continue;
    const prev = owner.get(key);
    if (prev && prev !== c.slug) collisions.push(`  "${variant}" claimed by both ${prev} and ${c.slug}`);
    else owner.set(key, c.slug);
  }
}

console.log(`cases            ${pass}/${CASES.length} pass`);
console.log(`self-resolution  ${BUY_COMMUNITIES.length - hijacked.length}/${BUY_COMMUNITIES.length} canonical names resolve to themselves`);
console.log(`variant clashes  ${collisions.length}`);

if (failures.length) {
  console.log(`\nfailed cases:`);
  failures.forEach((f) => console.log(f));
}
if (hijacked.length) {
  console.log(`\ncanonical names claimed by another community:`);
  hijacked.forEach((h) => console.log(h));
}
if (collisions.length) {
  console.log(`\nthe same variant declared by two communities:`);
  collisions.forEach((c) => console.log(c));
}

const failed = failures.length + hijacked.length + collisions.length;
if (!failed) console.log(`\n✓ community resolution is sound`);
process.exit(failed ? 1 : 0);
