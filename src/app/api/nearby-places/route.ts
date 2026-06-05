// GET /api/nearby-places?community=Al+Jaddaf&city=Dubai
// Returns NearbyItem[] using free OSRM routing — no API key needed.
// Results cached 24h via ISR.

import { NextRequest, NextResponse } from "next/server";
import { fetchNearbyFree } from "@/lib/parseNearby";

// Approximate lat/lng centres for major Dubai + UAE communities
const COMMUNITY_COORDS: Record<string, [number, number]> = {
  "al jaddaf":               [25.2173, 55.3238],
  "dubai marina":            [25.0800, 55.1400],
  "downtown dubai":          [25.1972, 55.2744],
  "business bay":            [25.1857, 55.2594],
  "palm jumeirah":           [25.1124, 55.1390],
  "jumeirah village circle": [25.0517, 55.2097],
  "jvc":                     [25.0517, 55.2097],
  "dubai hills estate":      [25.1060, 55.2266],
  "arabian ranches":         [25.0562, 55.2699],
  "damac hills":             [25.0432, 55.2433],
  "dubai south":             [24.8960, 55.1593],
  "jumeirah lake towers":    [25.0697, 55.1408],
  "jlt":                     [25.0697, 55.1408],
  "al barsha":               [25.1046, 55.2002],
  "mirdif":                  [25.2225, 55.4133],
  "international city":      [25.1648, 55.4130],
  "dubai creek harbour":     [25.2098, 55.3425],
  "difc":                    [25.2124, 55.2810],
  "jumeirah":                [25.2178, 55.2417],
  "al quoz":                 [25.1434, 55.2237],
  "mudon":                   [25.0432, 55.2433],
  "town square":             [24.9993, 55.2414],
  "the springs":             [25.0480, 55.1878],
  "al furjan":               [25.0192, 55.1477],
  "yas island":              [24.4928, 54.6068],
  "saadiyat island":         [24.5476, 54.4327],
  "al reem island":          [24.4896, 54.4025],
  "al marjan island":        [25.6572, 55.8265],
  "mina al arab":            [25.6602, 55.8124],
};

function findCoords(community: string): [number, number] | null {
  const key = community.toLowerCase().trim();
  if (COMMUNITY_COORDS[key]) return COMMUNITY_COORDS[key];
  for (const [k, v] of Object.entries(COMMUNITY_COORDS)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return null;
}

export async function GET(req: NextRequest) {
  const community = req.nextUrl.searchParams.get("community") || "";
  const latParam = req.nextUrl.searchParams.get("lat");
  const lngParam = req.nextUrl.searchParams.get("lng");

  let lat: number | null = latParam ? parseFloat(latParam) : null;
  let lng: number | null = lngParam ? parseFloat(lngParam) : null;

  // Fall back to known community coords if no explicit lat/lng
  if (!lat || !lng) {
    const coords = findCoords(community);
    if (!coords) {
      return NextResponse.json({ items: [], reason: `No coordinates for "${community}"` });
    }
    [lat, lng] = coords;
  }

  const items = await fetchNearbyFree(lat, lng);

  return NextResponse.json(
    { items, community, lat, lng },
    { headers: { "Cache-Control": "s-maxage=86400, stale-while-revalidate=43200" } }
  );
}
