// Parses structured NearbyItem[] from a project's locationDescription field.
// Falls back to free OSRM routing + Nominatim geocoding — no API key needed.

export interface NearbyItem {
  name: string;
  type: string;
  distance: string;
}

// ─── Type inference ──────────────────────────────────────────────────────────

function inferType(name: string): string {
  const n = name.toLowerCase();
  if (/metro|tube|station|transit|tram/.test(n)) return "metro";
  if (/airport|dxb|dwc|maktoum/.test(n)) return "airport";
  if (/mall|shop|retail|souk|market/.test(n)) return "mall";
  if (/beach|marina|waterfront|canal|creek|jbr|corniche/.test(n)) return "beach";
  if (/park|garden|recreation|reserve/.test(n)) return "park";
  if (/school|university|college|gems/.test(n)) return "school";
  if (/hospital|clinic|medical|healthcare|health city/.test(n)) return "hospital";
  if (/golf|club/.test(n)) return "park";
  if (/road|highway|street|avenue|blvd/.test(n)) return "skip";
  return "landmark";
}

// ─── Parse locationDescription bullets ──────────────────────────────────────

const TIME_PATTERN =
  /^(\d+)\s*(?:minutes?|mins?|min)\s*(?:to|from|away|walk|drive|by car|by metro)?\s*(?:to|from)?\s*(.+)/i;
const PROXIMITY_PATTERN =
  /^(?:close to|near|easy access to|adjacent to|next to)\s+(.+)/i;

/**
 * Parse nearby items from a locationDescription string.
 * Handles bullet-point distances like "• 3 Minutes to Al Jaddaf Metro Station".
 */
export function parseNearbyFromDescription(description?: string | null): NearbyItem[] {
  if (!description) return [];

  const items: NearbyItem[] = [];
  const segments = description
    .split(/[•●◦▪■\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  for (const seg of segments) {
    if (seg.length > 120 || !/\d|close|near|adjacent|easy access/i.test(seg)) continue;

    const timeMatch = seg.match(TIME_PATTERN);
    if (timeMatch) {
      const [, time, rawName] = timeMatch;
      const name = rawName.replace(/\s*\([^)]*\)/g, "").replace(/\s*&\s*/g, " & ").trim();
      const type = inferType(name);
      if (type === "skip") continue;
      const isWalk = /walk|foot/i.test(seg);
      const minutes = parseInt(time, 10);
      const unit = isWalk || minutes <= 5 ? "min walk" : "min drive";
      items.push({ name, type, distance: `${time} ${unit}` });
      continue;
    }

    const proximityMatch = seg.match(PROXIMITY_PATTERN);
    if (proximityMatch) {
      const name = proximityMatch[1].replace(/\s*\([^)]*\)/g, "").trim();
      const type = inferType(name);
      if (type === "skip") continue;
      items.push({ name, type, distance: "Nearby" });
    }
  }

  return items;
}

// ─── Free OSRM + Nominatim fallback ─────────────────────────────────────────
// Uses OpenStreetMap infrastructure — no API key, no billing, completely free.

// Known Dubai POI coordinates for routing (avoids Nominatim lookup overhead)
const DUBAI_POIS: { name: string; type: string; lat: number; lng: number }[] = [
  { name: "Dubai Mall", type: "mall", lat: 25.1972, lng: 55.2796 },
  { name: "Dubai Marina Walk", type: "beach", lat: 25.0800, lng: 55.1400 },
  { name: "Dubai International Airport (DXB)", type: "airport", lat: 25.2532, lng: 55.3657 },
  { name: "Al Maktoum International Airport", type: "airport", lat: 24.8963, lng: 55.1614 },
  { name: "Mall of the Emirates", type: "mall", lat: 25.1180, lng: 55.2003 },
  { name: "Burj Khalifa / Downtown Dubai", type: "landmark", lat: 25.1972, lng: 55.2744 },
  { name: "Palm Jumeirah", type: "beach", lat: 25.1124, lng: 55.1390 },
  { name: "Dubai Creek Harbour", type: "beach", lat: 25.2098, lng: 55.3425 },
  { name: "JBR Beach", type: "beach", lat: 25.0790, lng: 55.1355 },
];

// Haversine straight-line distance (km)
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Get real driving times using free OSRM routing (OpenStreetMap).
 * No API key required. Picks the 5 nearest POIs then routes to them.
 *
 * Server-side only.
 */
export async function fetchNearbyFree(lat: number, lng: number): Promise<NearbyItem[]> {
  // Sort POIs by straight-line distance, take 5 nearest + always include airport
  const sorted = [...DUBAI_POIS]
    .map((poi) => ({ ...poi, dist: haversine(lat, lng, poi.lat, poi.lng) }))
    .sort((a, b) => a.dist - b.dist);

  // Pick 4 nearest + always include DXB if not already in top 4
  const candidates = sorted.slice(0, 4);
  const hasDXB = candidates.some((p) => p.type === "airport");
  if (!hasDXB) {
    const dxb = sorted.find((p) => p.name.includes("DXB"));
    if (dxb) candidates.push(dxb);
  }

  // OSRM table API: one origin → multiple destinations in one request
  const coords = [`${lng},${lat}`, ...candidates.map((p) => `${p.lng},${p.lat}`)].join(";");
  const sources = "0";
  const destinations = candidates.map((_, i) => i + 1).join(";");

  try {
    const url = `http://router.project-osrm.org/table/v1/driving/${coords}?sources=${sources}&destinations=${destinations}&annotations=duration`;
    const res = await fetch(url, {
      next: { revalidate: 86400 },
      headers: { "User-Agent": "Binayah-Properties/1.0" },
    });
    if (!res.ok) return fallbackEstimates(lat, lng);
    const data = await res.json();
    if (data.code !== "Ok") return fallbackEstimates(lat, lng);

    const durations: number[] = data.durations[0];
    return candidates.map((poi, i) => {
      const secs = durations[i];
      if (!secs || secs < 0) return null;
      const mins = Math.round(secs / 60);
      const unit = mins <= 10 ? "min walk" : "min drive";
      return { name: poi.name, type: poi.type, distance: `${mins} ${unit}` };
    }).filter(Boolean) as NearbyItem[];
  } catch {
    return fallbackEstimates(lat, lng);
  }
}

// Straight-line estimate fallback (if OSRM is unavailable)
function fallbackEstimates(lat: number, lng: number): NearbyItem[] {
  return DUBAI_POIS
    .map((poi) => {
      const km = haversine(lat, lng, poi.lat, poi.lng);
      const mins = Math.round((km / 40) * 60); // assume 40km/h avg speed
      const unit = mins <= 8 ? "min walk" : "min drive";
      return { name: poi.name, type: poi.type, distance: `~${mins} ${unit}` };
    })
    .sort((a, b) => parseInt(a.distance) - parseInt(b.distance))
    .slice(0, 5);
}
