// Parses structured NearbyItem[] from a project's locationDescription field.
// Falls back to free OSRM routing + Nominatim geocoding — no API key needed.

export interface NearbyItem {
  name: string;
  type: string;
  /** Human-readable, English-by-default label ("12 min drive"). */
  distance: string;
  /**
   * Travel time in whole minutes, present ONLY when the figure came from a real
   * road route (OSRM). Consumers use this to render a localized label instead of
   * the English `distance` string — and to tell a measured number apart from a
   * project-supplied or estimated one.
   */
  minutes?: number;
  /** Travel mode `minutes` refers to. OSRM routing here is always by car. */
  mode?: "drive" | "walk";
  /** True when the figure is a straight-line guess, not a routed measurement. */
  estimated?: boolean;
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

// ─── Free OSRM routing + community coordinates ──────────────────────────────
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

/**
 * Approximate lat/lng centres for major Dubai + UAE communities.
 *
 * Hand-mirrored from the identical table in `src/app/api/nearby-places/route.ts`
 * (that route predates this module and still owns its own copy — collapse the two
 * when the route is next touched).
 *
 * Only ever add an entry whose coordinate is a checked centre for that exact
 * community name. A wrong centre silently produces a wrong drive time, which is
 * strictly worse than showing no drive time at all.
 */
export const COMMUNITY_COORDS: Record<string, [number, number]> = {
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
  // Same community: DAMAC Hills launched as "AKOYA by DAMAC" and was renamed.
  // Reuses the coordinate above rather than introducing a second guess.
  "akoya damac hills":       [25.0432, 55.2433],
  "akoya":                   [25.0432, 55.2433],
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

/** Trailing emirate/city qualifier: "Business Bay, Dubai" → "Business Bay". */
const CITY_SUFFIX =
  /\s+(dubai|uae|united arab emirates|abu dhabi|sharjah|ajman|ras al khaimah|rak|umm al quwain|fujairah)$/;

function normalizeCommunity(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ") // "Dubai Creek Harbour (The Lagoons)"
    .replace(/[,/\-–—]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Resolve a community name to coordinates. EXACT matches only (after dropping
 * parentheticals and a trailing city qualifier).
 *
 * Deliberately NOT fuzzy. Substring matching looks helpful and is actively
 * dangerous here: "Arjan" contains "arjan" from "Al Marjan Island" (a different
 * emirate, ~80 km away), "Jumeirah Golf Estates" starts with "Jumeirah" (~13 km
 * away), and "DAMAC Hills 2" contains "DAMAC Hills" (~15 km away). Each of those
 * would yield a confidently-wrong drive time. No match → no coordinates → no
 * distances rendered.
 */
export function findCommunityCoords(community?: string | null): [number, number] | null {
  if (!community) return null;
  let key = normalizeCommunity(String(community));
  while (key) {
    const hit = COMMUNITY_COORDS[key];
    if (hit) return hit;
    const stripped = key.replace(CITY_SUFFIX, "").trim();
    if (stripped === key) return null;
    key = stripped;
  }
  return null;
}

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

// Rough UAE bounding box — rejects null-island / swapped / garbage coordinates.
function inUAE(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) && Number.isFinite(lng) &&
    lat >= 22.5 && lat <= 26.5 &&
    lng >= 51.0 && lng <= 56.6
  );
}

export interface NearbyOriginSource {
  latitude?: number | string | null;
  longitude?: number | string | null;
  community?: string | null;
}

/**
 * Pick the origin point to measure drive times from.
 * 1) the project's own stored lat/lng (most accurate)
 * 2) an exact-match community centre
 * 3) null — caller must render no distances rather than guess.
 *
 * When both exist and disagree by more than 25 km, the stored point is treated
 * as bad data and the community centre wins: the community name is what the page
 * shows, so drive times must be consistent with it. (Some CMS records share one
 * default lat/lng across unrelated projects.)
 */
/** Coordinates that appear verbatim across many unrelated projects: a CMS
 *  default, not a location. Measured against these, drive times look confident
 *  and are wrong, so they are discarded before the drift check. */
const SENTINEL_COORDS: [number, number][] = [[24.9877, 55.3744]];
const isSentinel = (lat: number, lng: number) =>
  SENTINEL_COORDS.some(([a, b]) => Math.abs(a - lat) < 1e-4 && Math.abs(b - lng) < 1e-4);

export function resolveNearbyOrigin(project?: NearbyOriginSource | null): [number, number] | null {
  if (!project) return null;
  const communityCoords = findCommunityCoords(project.community);
  const lat = Number(project.latitude);
  const lng = Number(project.longitude);
  if (isSentinel(lat, lng)) return communityCoords;
  if (inUAE(lat, lng)) {
    if (communityCoords && haversine(lat, lng, communityCoords[0], communityCoords[1]) > 25) {
      return communityCoords;
    }
    return [lat, lng];
  }
  return communityCoords;
}

/**
 * Get real driving times using free OSRM routing (OpenStreetMap).
 * No API key required. Picks the 5 nearest POIs then routes to them.
 *
 * The OSRM response is cached for 24h via the fetch data cache, so a page render
 * never costs a live call to the router more than once a day per origin.
 *
 * `strict` (used by every project-page caller) returns [] when the router is
 * unavailable instead of falling back to straight-line estimates — an empty
 * section is correct, a guessed distance is not.
 *
 * Server-side only.
 */
export async function fetchNearbyFree(
  lat: number,
  lng: number,
  opts: { strict?: boolean } = {}
): Promise<NearbyItem[]> {
  const onFailure = () => (opts.strict ? [] : fallbackEstimates(lat, lng));
  if (!inUAE(lat, lng)) return onFailure();

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
    // HTTPS, not HTTP: the plain-http endpoint refuses connections from some
    // networks (it fails outright in local dev), which silently emptied the list.
    const url = `https://router.project-osrm.org/table/v1/driving/${coords}?sources=${sources}&destinations=${destinations}&annotations=duration`;
    const res = await fetch(url, {
      next: { revalidate: 86400 },
      headers: { "User-Agent": "Binayah-Properties/1.0" },
      // A hung public router must never hold up an ISR render.
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return onFailure();
    const data = await res.json();
    if (data.code !== "Ok" || !Array.isArray(data.durations?.[0])) return onFailure();

    const durations: (number | null)[] = data.durations[0];
    const items = candidates
      .map((poi, i) => {
        const secs = durations[i];
        if (typeof secs !== "number" || !Number.isFinite(secs) || secs <= 0) return null;
        const minutes = Math.round(secs / 60);
        // OSRM was queried on the `driving` profile, so the figure is a car
        // journey — never relabel it as a walk.
        if (minutes < 1) return null;
        return {
          name: poi.name,
          type: poi.type,
          distance: `${minutes} min drive`,
          minutes,
          mode: "drive" as const,
        };
      })
      .filter(Boolean) as NearbyItem[];
    if (items.length === 0) return onFailure();
    return items.sort((a, b) => (a.minutes ?? 0) - (b.minutes ?? 0));
  } catch {
    return onFailure();
  }
}

/**
 * Resolve real, routed drive times for a project.
 * Returns [] — never a guess — when there is no trustworthy origin coordinate
 * or the router is unreachable.
 *
 * Server-side only.
 */
export async function getProjectNearby(project?: NearbyOriginSource | null): Promise<NearbyItem[]> {
  const origin = resolveNearbyOrigin(project);
  if (!origin) return [];
  return fetchNearbyFree(origin[0], origin[1], { strict: true });
}

// Straight-line estimate fallback (only for non-strict callers, i.e. the public
// /api/nearby-places route's legacy behaviour). Marked `estimated` and given no
// `minutes`, so callers that require measured data can filter these out.
function fallbackEstimates(lat: number, lng: number): NearbyItem[] {
  return DUBAI_POIS
    .map((poi) => {
      const km = haversine(lat, lng, poi.lat, poi.lng);
      const mins = Math.round((km / 40) * 60); // assume 40km/h avg speed
      return { name: poi.name, type: poi.type, distance: `~${mins} min drive`, estimated: true };
    })
    .sort((a, b) => parseInt(a.distance.slice(1)) - parseInt(b.distance.slice(1)))
    .slice(0, 5);
}
