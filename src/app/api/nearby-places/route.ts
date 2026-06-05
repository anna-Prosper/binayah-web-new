// GET /api/nearby-places?community=Al+Jaddaf&city=Dubai
// Returns NearbyItem[] using Google Maps Distance Matrix.
// Requires GOOGLE_PLACES_API_KEY env var. Returns [] if not configured.
// Results cached for 24 hours via ISR.

import { NextRequest, NextResponse } from "next/server";
import { fetchNearbyFromGoogleMaps } from "@/lib/parseNearby";

// Approximate lat/lng centres for major Dubai communities (used for geocoding fallback)
const COMMUNITY_COORDS: Record<string, [number, number]> = {
  "al jaddaf":            [25.2173, 55.3238],
  "dubai marina":         [25.0800, 55.1400],
  "downtown dubai":       [25.1972, 55.2744],
  "business bay":         [25.1857, 55.2594],
  "palm jumeirah":        [25.1124, 55.1390],
  "jumeirah village circle": [25.0517, 55.2097],
  "jvc":                  [25.0517, 55.2097],
  "dubai hills estate":   [25.1060, 55.2266],
  "arabian ranches":      [25.0562, 55.2699],
  "damac hills":          [25.0432, 55.2433],
  "dubai south":          [24.8960, 55.1593],
  "jumeirah lake towers": [25.0697, 55.1408],
  "jlt":                  [25.0697, 55.1408],
  "al barsha":            [25.1046, 55.2002],
  "mirdif":               [25.2225, 55.4133],
  "international city":   [25.1648, 55.4130],
  "dubai creek harbour":  [25.2098, 55.3425],
  "yas island":           [24.4928, 54.6068],
  "saadiyat island":      [24.5476, 54.4327],
};

function findCoords(community: string, city: string): [number, number] | null {
  const key = community.toLowerCase().trim();
  if (COMMUNITY_COORDS[key]) return COMMUNITY_COORDS[key];
  // Partial match
  for (const [k, v] of Object.entries(COMMUNITY_COORDS)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return null;
}

export async function GET(req: NextRequest) {
  const community = req.nextUrl.searchParams.get("community") || "";
  const city = req.nextUrl.searchParams.get("city") || "Dubai";

  if (!process.env.GOOGLE_PLACES_API_KEY) {
    return NextResponse.json({ items: [], reason: "GOOGLE_PLACES_API_KEY not configured" });
  }

  const coords = findCoords(community, city);
  if (!coords) {
    return NextResponse.json({ items: [], reason: `No coordinates for "${community}"` });
  }

  const [lat, lng] = coords;
  const items = await fetchNearbyFromGoogleMaps(lat, lng);

  return NextResponse.json(
    { items, community, lat, lng },
    { headers: { "Cache-Control": "s-maxage=86400, stale-while-revalidate=43200" } }
  );
}
