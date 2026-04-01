"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, BedDouble, MapPin, Ruler, Target, User, Phone, Mail,
  Sparkles, ArrowLeft, Copy, Check, ChevronRight,
  TrendingUp, TrendingDown, AlertTriangle, MessageCircle, PhoneCall,
  RefreshCw, Search, Lock, Unlock, FileUp, FileText, X,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

// ─── Location data  (City → Area → Buildings) ───────────────────────────────

type AreaData = { area: string; buildings: string[] };
type CityData = Record<string, AreaData[]>;

const LOCATION_DATA: CityData = {
  Dubai: [
    { area: "Downtown Dubai", buildings: [
        "Burj Khalifa","The Address Downtown","Fountain Views 1","Fountain Views 2","Fountain Views 3",
        "Opera Grand","Bellevue Tower 1","Bellevue Tower 2","Il Primo","Vida Residences Downtown",
        "Act One | Act Two","29 Boulevard","Standpoint Tower A","Standpoint Tower B",
        "The Lofts West","The Lofts East","8 Boulevard Walk","Boulevard Point","Claren Tower 1",
        "Claren Tower 2","South Ridge 1","South Ridge 2","The Address Residence Fountain Views",
        "Grande","St Regis Residences",
    ]},
    { area: "Dubai Marina", buildings: [
        "Marina Gate 1","Marina Gate 2","Marina Gate 3","Cayan Tower","Infinity Tower",
        "Princess Tower","Elite Residence","Marina Crown","Silverene Tower A","Silverene Tower B",
        "The Torch","Sulafa Tower","Marina Heights","Botanica Tower","Jumeirah Living Marina Gate",
        "Sparkle Tower 1","Sparkle Tower 2","Damac Heights","LIV Residence","1/JBR",
        "Marina Pinnacle","Horizon Tower","Paloma Tower","Al Mesk Tower","Ocean Heights",
        "Marina View Tower A","Marina View Tower B","Trident Grand Residence",
    ]},
    { area: "Jumeirah Beach Residence (JBR)", buildings: [
        "Murjan 1","Murjan 2","Murjan 3","Murjan 4","Murjan 5","Murjan 6",
        "Sadaf 1","Sadaf 2","Sadaf 3","Sadaf 4","Sadaf 5","Sadaf 6","Sadaf 7","Sadaf 8",
        "Rimal 1","Rimal 2","Rimal 3","Rimal 4","Rimal 5","Rimal 6",
        "Bahar 1","Bahar 2","Bahar 3","Bahar 4","Bahar 5","Bahar 6",
        "Shams 1","Shams 2","Shams 3","Shams 4","1 JBR",
    ]},
    { area: "Palm Jumeirah", buildings: [
        "Shoreline Apartments Block 1","Shoreline Apartments Block 2","Shoreline Apartments Block 3",
        "Shoreline Apartments Block 4","Shoreline Apartments Block 5","Shoreline Apartments Block 6",
        "Shoreline Apartments Block 7","Shoreline Apartments Block 8","Shoreline Apartments Block 9",
        "Shoreline Apartments Block 10","The 8","Tiara Residences","Oceana Atlantic",
        "Oceana Aegean","Oceana Baltic","Oceana Pacific","Signature Villas","Garden Homes",
        "One Palm","Palme Couture Residences","The Palm Tower","Five Palm Jumeirah",
        "Serenia Residences","Fairmont Residences North","Fairmont Residences South",
        "Balqis Residence","Kingdom of Sheba","Al Das","Al Msool",
    ]},
    { area: "Business Bay", buildings: [
        "Executive Towers Tower A","Executive Towers Tower B","Executive Towers Tower C",
        "Executive Towers Tower D","Executive Towers Tower E","Executive Towers Tower F",
        "Executive Towers Tower G","Damac Paramount Tower Hotel & Residences",
        "Churchill Residency","Bay's Edge","Merano Tower","Nobles Tower",
        "Capital Bay Tower A","Capital Bay Tower B","VVIP Residences","Majestine",
        "SLS Dubai","Aykon City Tower A","Aykon City Tower B","Peninsula One",
        "Peninsula Two","Peninsula Three","Peninsula Four","The Opus","Noura Tower",
        "Reva Residences","Sigma Tower 1","Sigma Tower 2",
    ]},
    { area: "DIFC", buildings: [
        "Index Tower","Central Park Tower","Park Towers A","Park Towers B",
        "Liberty House","Currency House","Burj Daman","Limestone House","Gate Village 1",
        "Gate Village 2","Gate Village 3","Gate Village 4","Gate Village 5",
        "Gate Village 6","Gate Village 7","Gate Village 8","Gate Village 10","Gate Village 11",
    ]},
    { area: "Jumeirah Village Circle (JVC)", buildings: [
        "Belgravia 1","Belgravia 2","Belgravia Heights 1","Belgravia Heights 2",
        "Seasons Community","Park Lane","Bloom Heights 1","Bloom Heights 2",
        "Ghalia by GGICO","Quality Star","Al Jawhara","Binghatti Terraces",
        "Oxford Terraces","Green Diamond","Plazzo Residence","The One At Jumeirah Village Circle",
        "Elite Sports Residence","Golf Views","Noor Townhouses",
    ]},
    { area: "Jumeirah Lake Towers (JLT)", buildings: [
        "Goldcrest Views 1","Goldcrest Views 2","Platinum Tower","HDS Tower",
        "Saba Tower 1","Saba Tower 2","Saba Tower 3","Lake City Tower","Madina Tower",
        "V3 Tower","Cluster A – Lake Almas East","Jumeirah Bay Tower X2","Jumeirah Bay Tower X3",
        "O2 Residence","MBL Residence","Indigo Tower","Bonnington Tower",
        "Fortune Executive Tower","Swiss Tower","Al Shera Tower",
    ]},
    { area: "Dubai Hills Estate", buildings: [
        "Park Heights 1","Park Heights 2","Mulberry 1","Mulberry 2",
        "Acacia A","Acacia B","Acacia C","Maple 1","Maple 2","Maple 3",
        "Golfville","Golf Suites","Executive Residences 1","Executive Residences 2",
        "Collective","Collective 2.0","Golf Grand","Vida Residences Dubai Hills",
        "Address Dubai Hills","Parkside 1","Parkside 2","Parkside 3",
    ]},
    { area: "Dubai Creek Harbour", buildings: [
        "Creekside 18 Tower A","Creekside 18 Tower B","Harbour Views 1","Harbour Views 2",
        "Island Park 1","Island Park 2","Address Harbour Point Tower 1","Address Harbour Point Tower 2",
        "Creek Horizon Tower 1","Creek Horizon Tower 2","Creek Gate Tower 1","Creek Gate Tower 2",
        "Cove Residences","Surf Residences","Lotus Residences","Orchid",
        "Vida Creek Harbour","Palace Residences",
    ]},
    { area: "Arabian Ranches", buildings: [
        "Palmera 1","Palmera 2","Palmera 3","Palmera 4",
        "Mirador","Mirador La Coleccion","Saheel 1","Saheel 2","Saheel 3",
        "Al Reem 1","Al Reem 2","Al Reem 3","Alvorada 1","Alvorada 2",
        "Alvorada 3","Alvorada 4","Alvorada 5","Rosa","Terra Nova","Hattan",
    ]},
    { area: "Arabian Ranches 2", buildings: [
        "Casa","Palma","La Nova","Yasmin","Rasha","Lila","Rosa","Azalea","Camelia",
    ]},
    { area: "Arabian Ranches 3", buildings: [
        "Sun","Joy","Spring","Caya","Ruba","Bliss","Elie Saab Villas",
    ]},
    { area: "Dubai Sports City", buildings: [
        "Elite Sports Residence 1","Elite Sports Residence 2","Elite Sports Residence 3",
        "Elite Sports Residence 4","Elite Sports Residence 5","Elite Sports Residence 6",
        "Elite Sports Residence 7","Elite Sports Residence 8","Elite Sports Residence 9",
        "Elite Sports Residence 10","Golf Tower 1","Golf Tower 2","Golf Tower 3",
        "Champions Tower 1","Champions Tower 2","Champions Tower 3","Panorama at The Views",
    ]},
    { area: "Al Barsha", buildings: [
        "Al Barsha 1 Villas","Al Barsha 2 Villas","Al Barsha 3 Villas",
        "Al Barsha South Villas","Topaz Residences","Al Barsha Heights (Tecom)",
    ]},
    { area: "Jumeirah Village Triangle (JVT)", buildings: [
        "District 1","District 2","District 3","District 4","District 5",
        "District 6","District 7","District 8","District 9","District 10",
    ]},
    { area: "Meydan / MBR City", buildings: [
        "The Polo Residence","The Polo Townhouses","Sobha Hartland","Residences at District One",
        "District One Villas","Mohammed Bin Rashid City Villas","Azizi Riviera","Waves",
        "Azizi Grand","Millennium Binghatti Residences",
    ]},
    { area: "Motor City", buildings: [
        "Unity Tower","Green Lakes Tower 1","Green Lakes Tower 2","Green Lakes Tower 3",
        "Green Community Villas","Arabian Homes",
    ]},
    { area: "International City", buildings: [
        "England Cluster","France Cluster","Greece Cluster","Italy Cluster","Morocco Cluster",
        "Persia Cluster","Spain Cluster","China Cluster","Russia Cluster","UAE Cluster",
    ]},
    { area: "Al Furjan", buildings: [
        "Azizi Pearl","Azizi Feirouz","Azizi Yasmin","Masakin Al Furjan","Sumansa Townhouses",
        "Nakheel Townhouses","Richmond Villas","Quortaj",
    ]},
    { area: "Dubai South / Expo City", buildings: [
        "The Pulse Residences","The Pulse Boulevard","Emaar South Golf Views",
        "Greenview","Parkside","Pulz by Damac","Urbana","Golf Links",
    ]},
    { area: "Al Quoz", buildings: [
        "Al Quoz 1 Villas","Al Quoz 2 Villas","Al Quoz 3 Villas","Al Quoz Industrial",
    ]},
    { area: "The Greens & The Views", buildings: [
        "The Greens Apartments","The Views – Golf Towers","The Links","Golf Towers",
        "The Fairways","The Lakes Villas","Al Ghaf","Al Alka","Al Jaz","Al Arta",
        "Al Samar","Al Dhafra","Al Nakheel","Al Seef",
    ]},
    { area: "City Walk", buildings: [
        "Central Park at City Walk Tower 1","Central Park at City Walk Tower 2",
        "Central Park at City Walk Tower 3","Central Park at City Walk Tower 4",
        "Eaton Place","Canopy by Hilton Dubai Al Seef Residences",
    ]},
    { area: "Bluewaters Island", buildings: [
        "Bluewaters Residences 1","Bluewaters Residences 2","Bluewaters Residences 3",
        "Bluewaters Residences 4","Bluewaters Residences 5","Bluewaters Residences 6",
        "Bluewaters Residences 7","Bluewaters Residences 8","Bluewaters Residences 9",
        "Bluewaters Residences 10","Ain Dubai Residences",
    ]},
    { area: "Damac Hills", buildings: [
        "Akoya by Damac Villas","Loreto A","Loreto B","Loreto C","Loreto D",
        "Golf Horizon A","Golf Horizon B","Golf Promenade","Astoria",
        "Trump Estates","Golf Vita","Millnaire",
    ]},
    { area: "Tilal Al Ghaf", buildings: [
        "Elan","Serenity Mansions","Plagette 32","Harmony Villas","Aura Gardens",
        "Lanai Islands","Lagoon Views","Iris","Elysian Mansions",
    ]},
  ],

  "Abu Dhabi": [
    { area: "Al Reem Island", buildings: [
        "The Gate Tower 1","The Gate Tower 2","The Gate Tower 3","Sun Tower","Sky Tower",
        "Shams Abu Dhabi","Marina Square","Arc Tower","Mangrove Place","Meera Tower",
        "SOHO Square","Reem Five","Sigma Tower","Le Grand Chateau","Leaf Tower",
        "Hydra Avenue","Al Maha Tower","Najmat Abu Dhabi","Pacific Ocean","Tamouh Tower",
    ]},
    { area: "Saadiyat Island", buildings: [
        "Saadiyat Beach Residences","Mamsha Al Saadiyat","Hidd Al Saadiyat",
        "Louvre Abu Dhabi Residences","Park View","The Collection","Soho Square Residences",
        "Villa Saadiyat","Saadiyat Beach Villas","Sea Shore Apartments",
    ]},
    { area: "Yas Island", buildings: [
        "Yas Acres","Ansam","Waters Edge","Lea","Noya","Mayan","West Yas","Reflection",
        "Yas Golf Collection","The Nook","Perla","Noya Luma","Yas Park Views",
    ]},
    { area: "Al Raha Beach", buildings: [
        "Al Raha Lofts","Al Muneera","Al Nada","Al Zeina","Al Bateen Residences",
        "Al Rahba","Lamar Residences","Al Raha Beach Hotel",
    ]},
    { area: "Corniche Road", buildings: [
        "Corniche Residence","Marina Square","Etihad Towers","The Corniche Towers",
        "Nation Towers","Al Nahyan Villas","Al Markaziyah",
    ]},
    { area: "Al Khalidiyah", buildings: [
        "Al Khalidiyah Villas","Khalidiyah Palace Rayhaan","Elite Tower",
    ]},
    { area: "Al Reef", buildings: [
        "Al Reef Downtown","Al Reef Villas","Desert Cluster","Arabian Cluster",
        "Contemporary Cluster","Mediterranean Cluster",
    ]},
  ],

  Sharjah: [
    { area: "Al Majaz", buildings: [
        "Al Majaz 1","Al Majaz 2","Al Majaz 3","Corniche Tower","Al Ghuwair",
    ]},
    { area: "Al Nahda", buildings: [
        "Sahara Complex","Al Nahda Residences","Pearl Tower Sharjah",
    ]},
    { area: "Al Khan", buildings: [
        "Al Khan Beach Residences","Naseej Tower",
    ]},
    { area: "Aljada", buildings: [
        "Madar","Naseej","Hayyan","Noor","Tiraz","Dhow","Sarab",
    ]},
    { area: "Muwaileh", buildings: [
        "Muwaileh Villas","Nasma Residences","Al Zahia",
    ]},
  ],

  Ajman: [
    { area: "Al Nuaimia", buildings: [
        "Al Nuaimia Towers","City Towers Ajman","Horizon Towers Ajman",
    ]},
    { area: "Emirates City", buildings: [
        "Lavender Tower","Jasmine Tower","Lilies Tower","Magnolia Tower",
    ]},
    { area: "Ajman Corniche", buildings: [
        "Ajman Pearl Towers","Conqueror Tower",
    ]},
  ],

  RAK: [
    { area: "Al Hamra Village", buildings: [
        "Al Hamra Village Villas","Royal Breeze Residences","Bayti Homes","Falcon Island",
    ]},
    { area: "Mina Al Arab", buildings: [
        "Gateway Residences","Lagoon Views","Mina Al Arab Townhouses",
    ]},
    { area: "Al Marjan Island", buildings: [
        "Pacific Polynesia","Bab Al Bahr","Rixos Residences","Wynn Al Marjan Island Residences",
    ]},
  ],
};

// Derived helpers
function getAreas(city: string): AreaData[] {
  return LOCATION_DATA[city] ?? [];
}

function getBuildings(city: string, area: string): string[] {
  return LOCATION_DATA[city]?.find((a) => a.area === area)?.buildings ?? [];
}

// ─── Types ─// ─── Smart search parser (valuation context) ─────────────────────────────────

const CITY_KEYWORDS: Record<string, string> = {
  dubai: "Dubai", "abu dhabi": "Abu Dhabi", abudhabi: "Abu Dhabi",
  sharjah: "Sharjah", ajman: "Ajman", rak: "RAK",
  "ras al khaimah": "RAK",
};

const AREA_KEYWORDS: Record<string, string> = {
  downtown: "Downtown Dubai", "downtown dubai": "Downtown Dubai",
  marina: "Dubai Marina", "dubai marina": "Dubai Marina",
  palm: "Palm Jumeirah", "palm jumeirah": "Palm Jumeirah",
  jbr: "Jumeirah Beach Residence (JBR)",
  "business bay": "Business Bay",
  difc: "DIFC",
  jvc: "Jumeirah Village Circle (JVC)",
  jlt: "Jumeirah Lake Towers (JLT)",
  "dubai hills": "Dubai Hills Estate", hills: "Dubai Hills Estate",
  creek: "Dubai Creek Harbour", "creek harbour": "Dubai Creek Harbour",
  bluewaters: "Bluewaters Island",
  "city walk": "City Walk",
  "arabian ranches": "Arabian Ranches",
  "al barsha": "Al Barsha",
  "al furjan": "Al Furjan",
  "al reem": "Al Reem Island", "reem island": "Al Reem Island",
  saadiyat: "Saadiyat Island",
  yas: "Yas Island",
  corniche: "Corniche Road",
  meydan: "Meydan / MBR City", "mbr city": "Meydan / MBR City",
  "damac hills": "Damac Hills",
  "damac hills 2": "Damac Hills 2 (Akoya Oxygen)", "akoya oxygen": "Damac Hills 2 (Akoya Oxygen)",
  villanova: "Villanova (Dubailand)", amaranta: "Villanova (Dubailand)",
  mudon: "Mudon",
  serena: "Serena (Dubailand)",
  "the valley": "The Valley",
  "emaar south": "Emaar South",
  "town square": "Town Square",
  "silicon oasis": "Silicon Oasis",
  "discovery gardens": "Discovery Gardens",
  jge: "Jumeirah Golf Estates", "jumeirah golf": "Jumeirah Golf Estates",
  dubailand: "Dubailand",
  "nad al sheba": "Nad Al Sheba",
  "dubai south": "Dubai South / Expo City",
  "motor city": "Motor City",
  "sports city": "Dubai Sports City",
  greens: "The Greens & The Views",
};

const VTYPE_KEYWORDS: Record<string, string> = {
  apartment: "Apartment", appartment: "Apartment", appartement: "Apartment", apt: "Apartment", flat: "Apartment",
  villa: "Villa", townhouse: "Townhouse", penthouse: "Penthouse", studio: "Studio",
};

const VBED_KEYWORDS: Record<string, string> = {
  studio: "Studio",
  "1 bhk": "1", "1bhk": "1",
  "1 bed": "1", "1br": "1", "1 bdr": "1", "1bed": "1", "1 bedroom": "1",
  "2 bhk": "2", "2bhk": "2",
  "2 bed": "2", "2br": "2", "2 bdr": "2", "2bed": "2", "2 bedroom": "2",
  "3 bhk": "3", "3bhk": "3",
  "3 bed": "3", "3br": "3", "3 bdr": "3", "3bed": "3", "3 bedroom": "3",
  "4 bhk": "4", "4bhk": "4",
  "4 bed": "4", "4br": "4", "4bed": "4", "4 bedroom": "4",
  "5 bhk": "5", "5bhk": "5",
  "5 bed": "5", "5br": "5",
};

interface ParsedValuation {
  unit?: string;
  area?: string;
  city?: string;
  type?: string;
  beds?: string;
  maids?: string;
  size?: string;
}

// Areas that are predominantly villas/townhouses — used for type inference
const VILLA_AREAS = new Set([
  "Palm Jumeirah","Arabian Ranches","Arabian Ranches 2","Arabian Ranches 3",
  "Villanova (Dubailand)","Mudon","Serena (Dubailand)","The Valley",
  "Damac Hills","Damac Hills 2 (Akoya Oxygen)","Tilal Al Ghaf",
  "Jumeirah Golf Estates","Emaar South","Al Furjan","Al Barsha",
  "Nad Al Sheba","Dubailand","Reem (Arabian Ranches)","Jumeirah Village Triangle (JVT)",
  "Saadiyat Island","Yas Island",
]);

// Building name patterns that imply a type
const BUILDING_TYPE_HINTS: [RegExp, string][] = [
  [/\bvilla(s)?\b/i, "Villa"],
  [/\btownhouse(s)?\b/i, "Townhouse"],
  [/\bpenthouse(s)?\b/i, "Penthouse"],
  [/\bstudio\b/i, "Studio"],
  [/\btower\b|\bresidence(s)?\b|\bapartment(s)?\b|\bflat(s)?\b|\bheight(s)?\b|\bgate\b|\bpark\b|\bview(s)?\b/i, "Apartment"],
];

const GENERIC_BUILDING_TOKENS = new Set([
  "the", "tower", "towers", "residence", "residences",
  "apartment", "apartments", "villa", "villas",
  "townhouse", "townhouses", "building", "block", "phase",
]);

const SEARCH_TOKEN_ALIASES: Record<string, string> = {
  appartment: "apartment",
  appartements: "apartments",
  appartement: "apartment",
  appartments: "apartments",
  khilafa: "khalifa",
};

const UNIT_NOISE_TOKENS = new Set([
  "apartment", "apartments", "villa", "villas", "townhouse", "townhouses", "penthouse", "studio",
  "bed", "beds", "bedroom", "bedrooms", "br", "bdr", "bhk",
  "with", "without", "in", "at", "on", "for", "near", "and", "or",
  "pool", "gym", "parking", "furnished", "unfurnished", "upgraded", "vacant", "tenanted",
]);

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getSearchTokens(value: string): string[] {
  const tokens = value.toLowerCase().match(/[a-z0-9]+/g);
  return tokens
    ? tokens
      .map((token) => SEARCH_TOKEN_ALIASES[token] ?? token)
      .filter((token) => token.length > 1)
    : [];
}

function getMeaningfulSearchTokens(value: string): string[] {
  return getSearchTokens(value).filter((token) => !GENERIC_BUILDING_TOKENS.has(token));
}

function getNumericTokens(value: string): string[] {
  return getSearchTokens(value).filter((token) => /^\d+$/.test(token));
}

function normalizeParsedSizeUnit(rawUnit: string): string {
  return /\b(sqm|sq m|m2)\b/i.test(rawUnit) ? "sqm" : "sq ft";
}

function detectMaidsPreference(input: string): string | undefined {
  const lower = input.toLowerCase();

  if (/\b(?:no|without)\s+(?:maid(?:'s)?(?:\s*room)?|maids?(?:\s*room)?|staff\s*room|service\s*room|helper(?:'s)?\s*room)\b/i.test(lower)) {
    return "No";
  }

  if (/\b(?:with\s+)?maid(?:'s)?(?:\s*room)?\b/i.test(lower) ||
      /\bmaids?(?:\s*room)?\b/i.test(lower) ||
      /\bstaff\s*room\b/i.test(lower) ||
      /\bservice\s*room\b/i.test(lower) ||
      /\bhelper(?:'s)?\s*room\b/i.test(lower) ||
      /\+\s*maid(?:'s)?\b/i.test(lower)) {
    return "Yes";
  }

  return undefined;
}

function extractResidualUnitCandidate(input: string, locationKeywords: string[] = []): string | undefined {
  let residual = ` ${input} `;
  const removableKeywords = [
    ...locationKeywords.filter(Boolean),
    ...Object.keys(VTYPE_KEYWORDS),
    ...Object.keys(VBED_KEYWORDS),
  ];

  for (const keyword of [...new Set(removableKeywords)].sort((a, b) => b.length - a.length)) {
    residual = residual.replace(
      new RegExp(`(^|[\\s,\\/()-])${escapeRegExp(keyword)}(?=$|[\\s,\\/()-])`, "ig"),
      "$1",
    );
  }

  residual = residual
    .replace(/(\d[\d,.]*)\s*(?:sq\.?\s*ft|sqft|sf|m2|sqm|sq m)\b/giu, " ")
    .replace(/\b(?:no|without)\s+(?:maid(?:'s)?(?:\s*room)?|maids?(?:\s*room)?|staff\s*room|service\s*room|helper(?:'s)?\s*room)\b/giu, " ")
    .replace(/\b(?:with\s+)?maid(?:'s)?(?:\s*room)?\b/giu, " ")
    .replace(/\bmaids?(?:\s*room)?\b/giu, " ")
    .replace(/\bstaff\s*room\b/giu, " ")
    .replace(/\bservice\s*room\b/giu, " ")
    .replace(/\bhelper(?:'s)?\s*room\b/giu, " ")
    .replace(/\+\s*maid(?:'s)?\b/giu, " ")
    .replace(/\bwith\s+pool\b/giu, " ")
    .replace(/\b(?:pool|gym|parking|furnished|unfurnished|upgraded|vacant|tenanted)\b/giu, " ")
    .replace(/\b(?:near|close\s+to|next\s+to)\b/giu, " ")
    .replace(/\b(?:in|at|on|for|with|without|and|or)\b/giu, " ")
    .replace(/[\/,]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .trim();

  if (!residual || residual.length < 3) {
    return undefined;
  }

  if (/^(?:\d+|bed|beds|bath|baths|br|bdr|bhk|uae|and|or)$/i.test(residual)) {
    return undefined;
  }

  if (isLikelyNoisyUnitCandidate(residual)) {
    return undefined;
  }

  return residual;
}

function isLikelyNoisyUnitCandidate(value: string) {
  const tokens = getSearchTokens(value);
  if (!tokens.length) {
    return true;
  }

  const nonNoiseTokens = tokens.filter((token) => !UNIT_NOISE_TOKENS.has(token));
  if (!nonNoiseTokens.length) {
    return true;
  }

  const noiseTokens = tokens.length - nonNoiseTokens.length;
  return noiseTokens >= 3 && nonNoiseTokens.length <= 3;
}

function scoreBuildingCandidate(query: string, building: string) {
  const lowerQuery = query.toLowerCase().trim();
  const lowerBuilding = building.toLowerCase();
  const queryTokens = getMeaningfulSearchTokens(query);
  const buildingTokens = new Set(getMeaningfulSearchTokens(building));
  const matchedTokens = queryTokens.filter((token) => buildingTokens.has(token));
  const queryNumbers = getNumericTokens(query);
  const buildingNumbers = new Set(getNumericTokens(building));
  const numberMatches = queryNumbers.filter((token) => buildingNumbers.has(token));

  let score = 0;
  const containsFullName = lowerQuery.includes(lowerBuilding);
  const startsWithQuery = lowerBuilding.startsWith(lowerQuery);

  if (containsFullName) score += 120;
  if (startsWithQuery) score += 50;
  score += matchedTokens.reduce((total, token) => total + Math.min(24, token.length * 3), 0);
  score += numberMatches.length * 30;

  if (queryTokens.length > 0 && matchedTokens.length === queryTokens.length) {
    score += 20;
  }

  return {
    containsFullName,
    matchedTokens,
    numberMatches,
    score,
    startsWithQuery,
  };
}

function rankBuildingMatches(
  buildingPool: { b: string; a: string; c: string }[],
  query: string,
) {
  return buildingPool
    .map((candidate) => ({
      ...candidate,
      ...scoreBuildingCandidate(query, candidate.b),
    }))
    .filter((candidate) =>
      candidate.containsFullName ||
      candidate.startsWithQuery ||
      candidate.numberMatches.length > 0 ||
      candidate.matchedTokens.length >= 2
    )
    .filter((candidate) => candidate.score >= 30)
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return right.b.length - left.b.length;
    });
}

function inferTypeFromContext(buildingName: string, areaName: string): string | undefined {
  // Check explicit type words in building name first
  for (const [pattern, type] of BUILDING_TYPE_HINTS) {
    if (pattern.test(buildingName)) return type;
  }
  // Fall back to area-level inference
  if (VILLA_AREAS.has(areaName)) return "Villa";
  return undefined;
}

function resolveCity(area: string): string | undefined {
  // Search all cities for which one contains this area
  for (const [city, areas] of Object.entries(LOCATION_DATA)) {
    if (areas.some((a) => a.area === area)) return city;
  }
  return undefined;
}

function parseValuationSearch(input: string): ParsedValuation {
  const lower = input.toLowerCase().trim();
  const result: ParsedValuation = {};
  let matchedCityKeyword = "";
  let matchedAreaKeyword = "";

  // City — explicit keyword match first (longest first)
  const cityEntries = Object.entries(CITY_KEYWORDS).sort((a, b) => b[0].length - a[0].length);
  for (const [kw, val] of cityEntries) {
    if (lower.includes(kw)) {
      result.city = val;
      matchedCityKeyword = kw;
      break;
    }
  }

  // Area — longest match first
  const areaEntries = Object.entries(AREA_KEYWORDS).sort((a, b) => b[0].length - a[0].length);
  for (const [kw, val] of areaEntries) {
    if (lower.includes(kw)) {
      result.area = val;
      matchedAreaKeyword = kw;
      break;
    }
  }

  // If area found but no city yet, resolve city from area
  if (result.area && !result.city) {
    result.city = resolveCity(result.area) ?? "Dubai";
  }

  // Property type — explicit keyword first
  for (const [kw, val] of Object.entries(VTYPE_KEYWORDS)) {
    if (lower.includes(kw)) { result.type = val; break; }
  }

  // Bedrooms
  const bedEntries = Object.entries(VBED_KEYWORDS).sort((a, b) => b[0].length - a[0].length);
  for (const [kw, val] of bedEntries) {
    if (lower.includes(kw)) { result.beds = val; break; }
  }

  result.maids = detectMaidsPreference(input);

  // Size
  const sizeMatch = lower.match(/(\d[\d,.]*)\s*(sq\.?\s*ft|sqft|sf|m2|sqm|sq m)/);
  if (sizeMatch) {
    result.size = formatSizeValue(sizeMatch[1], normalizeParsedSizeUnit(sizeMatch[2]));
  }

  // Building — search known buildings across all cities if no city detected yet
  const cityKey = result.city || "Dubai";
  const searchCities = result.city ? [result.city] : Object.keys(LOCATION_DATA);
  const buildingSearchQuery = extractResidualUnitCandidate(input, [matchedAreaKeyword, matchedCityKeyword]) || input;
  const buildingSearchLower = buildingSearchQuery.toLowerCase();

  const buildAllAreas = (cities: string[]) =>
    cities.flatMap((c) => getAreas(c).flatMap((a) => a.buildings.map((b) => ({ b, a: a.area, c }))));

  const buildingPool = result.area
    ? getBuildings(cityKey, result.area).map((b) => ({ b, a: result.area!, c: cityKey }))
    : buildAllAreas(searchCities);

  // Exact substring match (longest first)
  const found = buildingPool
    .sort((x, y) => y.b.length - x.b.length)
    .find(({ b }) => buildingSearchLower.includes(b.toLowerCase()));

  if (found) {
    result.unit = found.b;
    if (!result.area)  result.area = found.a;
    if (!result.city)  result.city = found.c;
    // Infer type from building + area if not already set
    if (!result.type) result.type = inferTypeFromContext(found.b, found.a) ?? undefined;
    return result;
  }

  const rankedMatches = rankBuildingMatches(buildingPool, buildingSearchQuery);
  const partial = rankedMatches[0];
  if (partial) {
    result.unit = partial.b;
    if (!result.area) result.area = partial.a;
    if (!result.city) result.city = partial.c;
    if (!result.type) result.type = inferTypeFromContext(partial.b, partial.a) ?? undefined;
    return result;
  }

  // Type inference from area alone (even if no building matched)
  if (!result.type && result.area) {
    result.type = inferTypeFromContext("", result.area) ?? undefined;
  }

  const residualUnit = extractResidualUnitCandidate(input, [matchedAreaKeyword, matchedCityKeyword]);
  if (residualUnit) result.unit = residualUnit;

  return result;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = "form" | "processing" | "results";

interface FormData {
  unit: string;
  area: string;
  beds: string;
  maids: string;
  city: string;
  type: string;
  size: string;
}

const SMART_FIELD_KEYS = ["unit", "area", "city", "type", "beds", "maids", "size"] as const;

type SmartFieldKey = (typeof SMART_FIELD_KEYS)[number];
type SourceTrackedField = keyof FormData;
type FieldSource = "manual" | "smart" | "places" | "deed";
type FieldSourceMap = Partial<Record<SourceTrackedField, FieldSource>>;
type TrackedFormPatch = Partial<Record<SourceTrackedField, string>>;

interface FieldErrors {
  unit?: string;
  name?: string;
  contact?: string; // covers phone + email together
}

interface GateData {
  name: string;
  phone: string;
  email: string;
}

interface GateErrors {
  name?: string;
  contact?: string;
}

interface ValuationResult {
  leadId?: string;
  createdAt?: string;
  accessState?: "preview" | "unlocked";
  previewRanges?: PreviewRange[];
  sourceCount?: number;
  currency: string;
  community: string;
  city: string;
  country: string;
  tags: string[];
  fairValueLow: number | null;
  fairValueHigh: number | null;
  confidence: "High" | "Medium" | "Low";
  confidenceReason: string;
  fairValueExplanation: string;
  quickSaleLow: number | null;
  quickSaleHigh: number | null;
  suggestedListLow: number | null;
  suggestedListHigh: number | null;
  comparables: {
    type: "Sale" | "Listing";
    size: string;
    date: string;
    price: number | null;
    reason: string;
    visibility?: "full" | "teaser" | "locked";
  }[];
  marketRead: string;
  strategy: string;
  strategyBullets: string[];
  movingFactors: string[];
  movingFactorsLocked?: boolean;
  disclaimer: string;
  sources: { url: string; title: string }[];
}

interface ApiResponse {
  leadId: string;
  createdAt: string;
  accessState?: "preview" | "unlocked";
  currency: string;
  estimate_low: number;
  estimate_high: number;
  estimate_summary: string;
  confidence: "High" | "Medium" | "Low";
  confidence_reason: string;
  recommended_list_price: { low: number; high: number; note: string };
  quick_sale_range: { low: number; high: number; note: string };
  recommendation: string;
  market_read: string;
  disclaimer: string;
  sources: { url: string; title: string }[];
  transactions: { size: string; date: string; price: number; headline: string; notes: string }[];
  listings: { size: string; date: string; price: number; headline: string; notes: string }[];
}

interface PreviewRange {
  label: string;
  tone: "quick" | "fair" | "list";
  startPercent: number;
  widthPercent: number;
}

interface PreviewApiResponse {
  leadId: string;
  createdAt: string;
  accessState?: "preview";
  preview: {
    confidence: "High" | "Medium" | "Low";
    confidenceReason: string;
    quickSaleRange: {
      low: number | null;
      high: number | null;
    } | null;
    rangePreview: PreviewRange[];
    movingFactors?: string[];
    movingFactorsLocked?: boolean;
    sourceCount: number;
    hiddenComparableCount: number;
    comparableRows: {
      type: "Sale" | "Listing";
      size: string;
      date: string;
      price: number | null;
      whyItMatters: string;
      visibility: "teaser" | "locked";
    }[];
  };
}

interface DocumentExtractionResponse {
  inquiry?: {
    propertyName?: string;
    location?: string;
    city?: string;
    propertyType?: string;
    bedrooms?: string;
    maids?: string;
    size?: string;
    ownerName?: string;
    phone?: string;
    email?: string;
  };
  fileName?: string;
  mimeType?: string;
  documentType?: string;
  summary?: string;
  warnings?: string[];
  error?: string;
}

interface TurnstileConfig {
  enabled: boolean;
  configured: boolean;
  siteKey: string;
  action: string;
}

interface DocumentUploadConfig {
  enabled: boolean;
  configured: boolean;
  maxFileSizeBytes: number;
  accept: string;
  acceptedMimeTypes: string[];
}

interface PendingTurnstileRequest {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}

interface TurnstileApi {
  render(
    container: HTMLElement,
    options: {
      sitekey: string;
      action: string;
      appearance?: "always" | "execute" | "interaction-only";
      execution?: "render" | "execute";
      callback: (token: string) => void;
      "error-callback"?: () => void;
      "expired-callback"?: () => void;
      "timeout-callback"?: () => void;
    },
  ): string | number;
  execute(widgetId?: string | number): void;
  reset(widgetId?: string | number): void;
  remove(widgetId: string | number): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2500;
const STREAM_TIMEOUT_MS = 190_000;
const turnstileScriptUrl = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const defaultTurnstileConfig: TurnstileConfig = {
  enabled: false,
  configured: true,
  siteKey: "",
  action: "valuation_submit",
};
const defaultDocumentUploadConfig: DocumentUploadConfig = {
  enabled: true,
  configured: true,
  maxFileSizeBytes: 8 * 1024 * 1024,
  accept: ".pdf,.png,.jpg,.jpeg,.webp,.gif",
  acceptedMimeTypes: ["application/pdf", "image/png", "image/jpeg", "image/webp", "image/gif"],
};

let turnstileScriptPromise: Promise<TurnstileApi> | null = null;

const processingSteps = [
  { label: "Preparing",         desc: "Validating property details" },
  { label: "Searching market",  desc: "Reviewing live listings and sales" },
  { label: "Building estimate", desc: "Turning research into pricing guidance" },
  { label: "Ready to review",   desc: "Formatting your valuation report" },
];

const phaseMap: Record<string, number> = {
  started: 0,
  searching_web: 1,
  generating_estimate: 2,
  final: 3,
};

const BEDROOM_OPTIONS = ["Studio", "1", "2", "3", "4", "5", "6", "7", "7+"];
const MAIDS_OPTIONS = ["No", "Yes"];
const SIZE_OPTIONS = [
  500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1800, 2000,
  2200, 2400, 2600, 2800, 3000, 3200, 3400, 3600, 3800, 4200, 4600, 5000, 5400,
  5800, 6200, 6600, 7000, 7400, 7800, 8200, 9000,
];
const SIZE_UNIT_OPTIONS = ["sq ft", "sqm"];
const DEFAULT_SIZE_UNIT = "sq ft";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number | null | undefined, currency = "AED") =>
  n == null ? "—" : `${currency} ${Math.round(n).toLocaleString("en-US")}`;

function extractCommunity(unit: string): string {
  if (!unit) return "Your Property";
  return unit.split(",")[0]?.trim() || "Your Property";
}

function validateForm(form: FormData): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.unit.trim() || form.unit.trim().length < 5) {
    errors.unit = "Please enter the building or unit name (at least 5 characters).";
  }
  return errors;
}

function mapApiToResult(api: ApiResponse, form: FormData): ValuationResult {
  const defaultMovingFactors = DEED_DUMMY_RESULT.movingFactors;
  const community = extractCommunity(form.unit);
  const propType = form.type?.toLowerCase() || "property";

  const comparables = [
    ...(api.transactions ?? []).map((c) => ({
      type: "Sale" as const,
      size: c.size || "Not stated",
      date: c.date || "Not stated",
      price: c.price,
      reason: [c.headline, c.notes].filter(Boolean).join(". ") || "Relevant comparable.",
      visibility: "full" as const,
    })),
    ...(api.listings ?? []).map((c) => ({
      type: "Listing" as const,
      size: c.size || "Not stated",
      date: c.date || "Not stated",
      price: c.price,
      reason: [c.headline, c.notes].filter(Boolean).join(". ") || "Relevant comparable.",
      visibility: "full" as const,
    })),
  ];

  return {
    leadId: api.leadId,
    createdAt: api.createdAt,
    accessState: api.accessState || "unlocked",
    currency: api.currency || "AED",
    community,
    city: form.city || "Dubai",
    country: "UAE",
    tags: [form.type, community].filter(Boolean) as string[],
    fairValueLow: api.estimate_low,
    fairValueHigh: api.estimate_high,
    fairValueExplanation: api.estimate_summary,
    confidence: api.confidence,
    confidenceReason: api.confidence_reason,
    quickSaleLow: api.quick_sale_range?.low,
    quickSaleHigh: api.quick_sale_range?.high,
    suggestedListLow: api.recommended_list_price?.low,
    suggestedListHigh: api.recommended_list_price?.high,
    comparables,
    marketRead: api.market_read,
    strategy: api.recommendation,
    strategyBullets: [
      api.recommended_list_price?.note,
      api.quick_sale_range?.note,
    ].filter(Boolean) as string[],
    movingFactors: defaultMovingFactors.map((factor) =>
      factor.includes("Vacancy status")
        ? `Vacancy status — vacant ${propType}s typically command a 3–8% premium.`
        : factor,
    ),
    movingFactorsLocked: false,
    disclaimer: api.disclaimer || DEED_DUMMY_RESULT.disclaimer,
    sources: api.sources || [],
    sourceCount: Array.isArray(api.sources) ? api.sources.length : 0,
  };
}

function mapPreviewApiToResult(api: PreviewApiResponse, form: FormData): ValuationResult {
  const community = extractCommunity(form.unit);
  const previewRows: ValuationResult["comparables"] = (api.preview?.comparableRows ?? []).map((row) => ({
    type: row.type === "Listing" ? "Listing" : "Sale",
    size: row.size || "Not stated",
    date: row.date || "Not stated",
    price: row.visibility === "teaser" ? row.price ?? null : null,
    reason: row.whyItMatters || "Comparable detail unlocks with the full report.",
    visibility: row.visibility,
  }));

  return {
    leadId: api.leadId,
    createdAt: api.createdAt,
    accessState: "preview",
    previewRanges: api.preview?.rangePreview || [],
    sourceCount: Number(api.preview?.sourceCount || 0),
    currency: "AED",
    community,
    city: form.city || "Dubai",
    country: "UAE",
    tags: [form.type, community].filter(Boolean) as string[],
    fairValueLow: null,
    fairValueHigh: null,
    confidence: api.preview?.confidence || "Low",
    confidenceReason:
      api.preview?.confidenceReason ||
      "Confidence depends on how closely the available evidence matches this exact property.",
    fairValueExplanation: "Exact valuation figures unlock when you request the full report.",
    quickSaleLow: api.preview?.quickSaleRange?.low ?? null,
    quickSaleHigh: api.preview?.quickSaleRange?.high ?? null,
    suggestedListLow: null,
    suggestedListHigh: null,
    comparables: previewRows.length
      ? previewRows
      : [
          {
            type: "Sale" as const,
            size: "Not stated",
            date: "Not stated",
            price: null,
            reason: "Comparable detail unlocks with the full report.",
            visibility: "locked" as const,
          },
        ],
    marketRead: "Unlock the full report to reveal the market read for this property.",
    strategy: "Unlock the full report to reveal the recommended sale strategy.",
    strategyBullets: [
      "Suggested list pricing unlocks after the contact step.",
      "Quick-sale guidance unlocks after the contact step.",
    ],
    movingFactors:
      Array.isArray(api.preview?.movingFactors) && api.preview.movingFactors.length
        ? api.preview.movingFactors
        : DEED_DUMMY_RESULT.movingFactors,
    movingFactorsLocked:
      typeof api.preview?.movingFactorsLocked === "boolean"
        ? api.preview.movingFactorsLocked
        : true,
    disclaimer: "AI-assisted market snapshot. Not a formal appraisal.",
    sources: [],
  };
}

function getPreviewRange(result: ValuationResult | null, label: string) {
  const normalizedLabel = label.trim().toLowerCase();
  return result?.previewRanges?.find((range) => range.label.trim().toLowerCase() === normalizedLabel);
}

function getPriceComparisonBounds(result: ValuationResult | null) {
  if (!result) {
    return null;
  }

  const bounds = [
    result.quickSaleLow,
    result.quickSaleHigh,
    result.fairValueLow,
    result.fairValueHigh,
    result.suggestedListLow,
    result.suggestedListHigh,
  ]
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value)) as number[];

  if (!bounds.length) {
    return null;
  }

  let min = Math.min(...bounds);
  let max = Math.max(...bounds);

  if (min === max) {
    min *= 0.95;
    max *= 1.05;
  }

  return { min, max };
}

function normalizeTurnstileConfig(value: any): TurnstileConfig {
  const safeValue = value && typeof value === "object" ? value : {};

  return {
    enabled: Boolean(safeValue.enabled),
    configured:
      typeof safeValue.configured === "boolean" ? safeValue.configured : !safeValue.enabled,
    siteKey: String(safeValue.siteKey || "").trim(),
    action: String(safeValue.action || "").trim() || "valuation_submit",
  };
}

function normalizeDocumentUploadConfig(value: any): DocumentUploadConfig {
  const safeValue = value && typeof value === "object" ? value : {};
  const maxFileSizeBytes = Number(safeValue.maxFileSizeBytes);

  return {
    enabled:
      typeof safeValue.enabled === "boolean"
        ? safeValue.enabled
        : defaultDocumentUploadConfig.enabled,
    configured:
      typeof safeValue.configured === "boolean"
        ? safeValue.configured
        : defaultDocumentUploadConfig.configured,
    maxFileSizeBytes:
      Number.isFinite(maxFileSizeBytes) && maxFileSizeBytes > 0
        ? maxFileSizeBytes
        : defaultDocumentUploadConfig.maxFileSizeBytes,
    accept:
      typeof safeValue.accept === "string" && safeValue.accept.trim()
        ? safeValue.accept
        : defaultDocumentUploadConfig.accept,
    acceptedMimeTypes:
      Array.isArray(safeValue.acceptedMimeTypes) && safeValue.acceptedMimeTypes.length
        ? safeValue.acceptedMimeTypes.map((entry: unknown) => String(entry || "").trim()).filter(Boolean)
        : defaultDocumentUploadConfig.acceptedMimeTypes,
  };
}

function resolveDocumentMimeType(file: File) {
  const normalizedType = String(file.type || "").trim().toLowerCase();
  if (normalizedType) {
    return normalizedType;
  }

  const fileName = file.name.toLowerCase();
  if (fileName.endsWith(".pdf")) return "application/pdf";
  if (fileName.endsWith(".png")) return "image/png";
  if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) return "image/jpeg";
  if (fileName.endsWith(".webp")) return "image/webp";
  if (fileName.endsWith(".gif")) return "image/gif";
  return "";
}

async function readFileAsBase64(file: File) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("The selected file could not be read."));
    reader.onload = () => {
      const result = String(reader.result || "");
      const separatorIndex = result.indexOf(",");
      if (separatorIndex === -1) {
        reject(new Error("The selected file could not be read."));
        return;
      }

      resolve(result.slice(separatorIndex + 1));
    };
    reader.readAsDataURL(file);
  });
}

// Core streaming fetch — throws on failure, returns ApiResponse on success
async function fetchValuation(payload: object): Promise<ApiResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), STREAM_TIMEOUT_MS);

  try {
    const res = await fetch("/api/valuation/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      if (res.status === 429) {
        const retry = errData?.retryAfterSeconds;
        throw new Error(
          retry
            ? `Service at capacity. Retrying in ${retry} seconds…`
            : (errData?.error ?? "Too many requests.")
        );
      }
      throw new Error(errData?.error ?? `Request failed (${res.status}).`);
    }

    if (!res.body) throw new Error("Streaming not supported in this browser.");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let finalData: ApiResponse | null = null;

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.trim()) continue;
        let evt: { event: string; data?: ApiResponse; error?: string };
        try { evt = JSON.parse(line); } catch { continue; }

        if (evt.event === "error") throw new Error(evt.error ?? "Valuation failed.");
        if (evt.event === "final" && evt.data) finalData = evt.data;
      }
    }

    if (!finalData) throw new Error("Stream ended before a result was returned.");
    return finalData;

  } finally {
    clearTimeout(timeout);
  }
}

// ─── Field error component ────────────────────────────────────────────────────

const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
      <AlertTriangle className="h-3 w-3 flex-shrink-0" />
      {message}
    </p>
  ) : null;

// ─── Deed demo result ────────────────────────────────────────────────────────

const DEED_DUMMY_RESULT: ValuationResult = {
  currency: "AED",
  community: "Marina Gate 1",
  city: "Dubai",
  country: "UAE",
  tags: ["Apartment", "Dubai Marina", "Thinking of selling"],
  fairValueLow: 2_750_000,
  fairValueHigh: 2_950_000,
  fairValueExplanation: "Based on 14 comparable transactions in Marina Gate 1 and surrounding Dubai Marina towers over the last 12 months, a 2-bedroom unit of this size is valued in the AED 2.75M–2.95M range, assuming standard finishes and a mid-range floor.",
  confidence: "High",
  confidenceReason: "Strong volume of recent comparable sales within the same building and community, with consistent price-per-sqft data available.",
  quickSaleLow: 2_550_000,
  quickSaleHigh: 2_700_000,
  suggestedListLow: 2_900_000,
  suggestedListHigh: 3_050_000,
  comparables: [
    { type: "Sale",    size: "1,210 sqft", date: "Jan 2026", price: 2_800_000, reason: "Same building, floor 18, standard finish. Sold in 23 days at AED 2,314/sqft." },
    { type: "Sale",    size: "1,310 sqft", date: "Dec 2025", price: 2_950_000, reason: "Marina Gate 1, floor 22, upgraded kitchen and sea view." },
    { type: "Listing", size: "1,247 sqft", date: "Mar 2026", price: 3_100_000, reason: "Current ask, same building. Listed 18 days ago, no offers reported yet." },
    { type: "Sale",    size: "1,190 sqft", date: "Nov 2025", price: 2_680_000, reason: "Lower floor, community view. Useful quick-sale floor reference." },
    { type: "Listing", size: "1,280 sqft", date: "Feb 2026", price: 2_950_000, reason: "Marina Gate 2 — closest comparable building, similar age and spec." },
  ],
  marketRead: "Dubai Marina continues to attract strong end-user and investor demand in Q1 2026. Marina Gate has outperformed the broader Marina average by ~4% over the past 12 months, driven by newer build quality and proximity to the Marina Walk. Average time-on-market for 2BR units is 28 days. Rental yields remain competitive at 5.8–6.4% gross.",
  strategy: "Given the current demand and your intent to sell, listing at AED 2.9M–3.05M positions the unit competitively while leaving negotiation room. Price slightly below the most recent comparable listing to attract early offers. Vacant access will materially improve buyer interest and speed up the transaction.",
  strategyBullets: [
    "Stage for photography and enable flexible viewings — this building transacts faster with vacant access.",
    "List at AED 2,950,000 and treat AED 2,800,000+ as a strong outcome.",
    "If urgency is high, AED 2,650,000–2,700,000 targets cash buyers and should close in under 30 days.",
  ],
  movingFactors: [
    "Exact floor level and view — sea or Marina views command a 5–10% premium.",
    "Finish quality — renovated kitchens and bathrooms add AED 80,000–150,000.",
    "Furnishing — fully furnished units achieve 3–8% higher asking prices.",
    "Vacancy status — vacant units transact 20–30% faster.",
    "Service charge exposure — buyers factor annual charges into offers.",
  ],
  movingFactorsLocked: false,
  disclaimer: "This is a simulated demo result. For a live AI-powered estimate using real market data, use the smart search or fill the fields manually.",
  sources: [
    { url: "https://www.propertyfinder.ae", title: "Property Finder — Marina Gate listings" },
    { url: "https://www.bayut.com",          title: "Bayut — Dubai Marina transactions" },
    { url: "https://www.dubailand.gov.ae",   title: "DLD — transaction records" },
  ],
};

// ─── Component ────────────────────────────────────────────────────────────────

const ValuationPage = () => {
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState<FormData>({
    unit: "", area: "", beds: "", maids: "No", city: "Dubai",
    type: "", size: "",
  });
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [activeProcessStep, setActiveProcessStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showAreaSuggestions, setShowAreaSuggestions] = useState(false);
  const [showBuildingSuggestions, setShowBuildingSuggestions] = useState(false);
  const [showSmartSuggestions, setShowSmartSuggestions] = useState(false);
  const [smartQuery, setSmartQuery] = useState("");
  const [smartParsed, setSmartParsed] = useState<ParsedValuation>({});
  const [fieldSources, setFieldSources] = useState<FieldSourceMap>({ city: "manual", maids: "manual" });
  const [smartSnapshot, setSmartSnapshot] = useState<Partial<Record<SmartFieldKey, string>>>({});
  const [deedFile, setDeedFile] = useState<File | null>(null);
  const [deedParsing, setDeedParsing] = useState(false);
  const [deedParsed, setDeedParsed] = useState(false);
  const [useDeedResult, setUseDeedResult] = useState(false);
  const deedInputRef = useRef<HTMLInputElement>(null);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetIdRef = useRef<string | number | null>(null);
  const turnstileWidgetPromiseRef = useRef<Promise<TurnstileApi> | null>(null);
  const turnstilePendingRef = useRef<PendingTurnstileRequest | null>(null);
  const turnstileConfigRef = useRef<TurnstileConfig>(defaultTurnstileConfig);
  const documentUploadConfigRef = useRef<DocumentUploadConfig>(defaultDocumentUploadConfig);
  const [showPlaces, setShowPlaces] = useState(false);
  const smartInputRef = useRef<HTMLInputElement>(null);
  const smartSuggestionsRef = useRef<HTMLDivElement>(null);
  const placesRef = useRef<HTMLDivElement>(null);
  const smartPlacesQuery = smartParsed.unit && !isLikelyNoisyUnitCandidate(smartParsed.unit)
    ? smartParsed.unit
    : smartQuery || smartParsed.area || smartParsed.unit || "";
  const { results: smartPlacesResults, loading: smartPlacesLoading } = usePlacesSearch(smartPlacesQuery, showSmartSuggestions);
  const { results: placesResults, loading: placesLoading } = usePlacesSearch(form.unit, showPlaces);
  const [unlocked, setUnlocked] = useState(false);
  const [gate, setGate] = useState<GateData>({ name: "", phone: "", email: "" });
  const [gateErrors, setGateErrors] = useState<GateErrors>({});
  const [gateSubmitting, setGateSubmitting] = useState(false);
  const [unlockHighlight, setUnlockHighlight] = useState(false);
  const [turnstileState, setTurnstileState] = useState<"idle" | "verifying" | "ready" | "error">("idle");
  const topRef = useRef<HTMLDivElement>(null);
  const unlockSectionRef = useRef<HTMLDivElement>(null);
  const unlockHighlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unitInputRef = useRef<HTMLInputElement>(null);
  const areaSuggestionsRef = useRef<HTMLDivElement>(null);
  const buildingSuggestionsRef = useRef<HTMLDivElement>(null);
  const hasSmartAutofill = SMART_FIELD_KEYS.some((key) => fieldSources[key] === "smart");
  const localSmartSuggestions = buildSmartSuggestions(smartQuery, smartParsed, smartPlacesResults);
  const {
    suggestion: aiSmartParseSuggestion,
    loading: smartAIParseLoading,
  } = useValuationAISuggestion(smartQuery, smartParsed, localSmartSuggestions);
  const smartSuggestions = mergeSmartSuggestions(localSmartSuggestions, aiSmartParseSuggestion);

  const setTrackedValues = useCallback((values: TrackedFormPatch, source: FieldSource) => {
    const entries = (Object.entries(values) as [SourceTrackedField, string | undefined][])
      .filter((entry): entry is [SourceTrackedField, string] => typeof entry[1] === "string");

    if (!entries.length) {
      return;
    }

    setForm((current) => {
      const next = { ...current };
      for (const [key, value] of entries) {
        next[key] = value;
      }
      return next;
    });

    setFieldSources((current) => {
      const next = { ...current };
      for (const [key, value] of entries) {
        if (value.trim()) next[key] = source;
        else delete next[key];
      }
      return next;
    });

    // Live validation after first submit attempt
    if (submitAttempted && Object.prototype.hasOwnProperty.call(values, "unit")) {
      const unitValue = typeof values.unit === "string" ? values.unit : "";
      setFieldErrors((prev) => {
        const next = { ...prev };
        if (unitValue.trim().length >= 5) delete next.unit;
        else next.unit = "Please enter the building or unit name (at least 5 characters).";
        return next;
      });
    }
  }, [submitAttempted]);

  const updateField = useCallback((key: SourceTrackedField, val: string, source: FieldSource = "manual") => {
    setTrackedValues({ [key]: val } as TrackedFormPatch, source);
  }, [setTrackedValues]);

  const applySmartSuggestion = useCallback((parsed: ParsedValuation) => {
    const entries = SMART_FIELD_KEYS
      .map((key) => [key, parsed[key]] as const)
      .filter((entry): entry is [SmartFieldKey, string] => typeof entry[1] === "string" && entry[1].trim().length > 0);

    if (!entries.length) {
      return;
    }

    const nextSmartKeys = new Set(entries.map(([key]) => key));
    const restorePatch = SMART_FIELD_KEYS.reduce<TrackedFormPatch>((acc, key) => {
      if (fieldSources[key] === "smart" && !nextSmartKeys.has(key)) {
        acc[key] = smartSnapshot[key] ?? "";
      }

      return acc;
    }, {});

    setSmartSnapshot((current) => {
      const next = { ...current };
      for (const [key] of entries) {
        if (fieldSources[key] !== "smart") {
          next[key] = form[key];
        }
      }

      for (const key of SMART_FIELD_KEYS) {
        if (!nextSmartKeys.has(key)) {
          delete next[key];
        }
      }

      return next;
    });

    if (Object.keys(restorePatch).length > 0) {
      setTrackedValues(restorePatch, "manual");
    }

    setTrackedValues(Object.fromEntries(entries) as TrackedFormPatch, "smart");
    setSmartParsed(parsed);
    setShowSmartSuggestions(false);
  }, [fieldSources, form, setTrackedValues, smartSnapshot]);

  const clearSmartAutofill = useCallback(() => {
    const smartKeys = SMART_FIELD_KEYS.filter((key) => fieldSources[key] === "smart");
    if (!smartKeys.length) {
      return;
    }

    const restorePatch = smartKeys.reduce<TrackedFormPatch>((acc, key) => {
      acc[key] = smartSnapshot[key] ?? "";
      return acc;
    }, {});

    setTrackedValues(restorePatch, "manual");
    setSmartSnapshot((current) => {
      const next = { ...current };
      for (const key of smartKeys) {
        delete next[key];
      }
      return next;
    });
  }, [fieldSources, smartSnapshot, setTrackedValues]);

  const handleSmartInputChange = useCallback((value: string) => {
    setSmartQuery(value);

    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setSmartParsed({});
      setShowSmartSuggestions(false);
      return;
    }

    setSmartParsed(parseValuationSearch(value));
    setShowSmartSuggestions(true);
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (smartSuggestionsRef.current && !smartSuggestionsRef.current.contains(target) &&
          smartInputRef.current && !smartInputRef.current.contains(target)) {
        setShowSmartSuggestions(false);
      }
      if (areaSuggestionsRef.current && !areaSuggestionsRef.current.contains(target)) {
        setShowAreaSuggestions(false);
      }
      if (buildingSuggestionsRef.current && !buildingSuggestionsRef.current.contains(target) &&
          unitInputRef.current && !unitInputRef.current.contains(target)) {
        setShowBuildingSuggestions(false);
      }
      if (placesRef.current && !placesRef.current.contains(target) &&
          unitInputRef.current && !unitInputRef.current.contains(target)) {
        setShowPlaces(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const { turnstileConfig } = await loadValuationConfig();
        if (!cancelled && turnstileConfig.enabled && turnstileConfig.configured) {
          await ensureTurnstileWidget(turnstileConfig);
        }
      } catch {}
    })();

    return () => {
      cancelled = true;
      if (unlockHighlightTimeoutRef.current) {
        clearTimeout(unlockHighlightTimeoutRef.current);
      }
      rejectPendingTurnstileRequest("Security verification was interrupted.");
      removeTurnstileWidget();
    };
  }, []);

  const scrollToUnlockSection = useCallback(() => {
    if (unlocked) {
      return;
    }

    unlockSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setUnlockHighlight(true);

    if (unlockHighlightTimeoutRef.current) {
      clearTimeout(unlockHighlightTimeoutRef.current);
    }

    unlockHighlightTimeoutRef.current = setTimeout(() => {
      setUnlockHighlight(false);
    }, 1800);
  }, [unlocked]);

  const getUnlockCardProps = useCallback(
    (
      enabled: boolean,
      label: string,
    ): {
      "aria-label"?: string;
      className?: string;
      onClick?: () => void;
      onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
      role?: "button";
      tabIndex?: number;
    } => {
      if (!enabled) {
        return {};
      }

      return {
        "aria-label": label,
        className: "cursor-pointer transition-transform duration-300 hover:-translate-y-0.5",
        onClick: scrollToUnlockSection,
        onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            scrollToUnlockSection();
          }
        },
        role: "button" as const,
        tabIndex: 0,
      };
    },
    [scrollToUnlockSection],
  );

  const runValuation = useCallback(async (payload: object, attempt: number) => {
    try {
      const data = await fetchValuation(payload);

      // Update phase to final on success
      setActiveProcessStep(3);
      setResult(mapApiToResult(data as ApiResponse, form));
      setStep("results");
      topRef.current?.scrollIntoView({ behavior: "smooth" });

    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      console.error(`[ValuationPage] attempt ${attempt}:`, err);

      // Detect abort = timeout
      const isTimeout = err instanceof Error && err.name === "AbortError";
      const isRetryable = isTimeout || (
        !msg.includes("Too many requests") &&
        !msg.includes("capacity") &&
        attempt < MAX_RETRIES
      );

      if (isRetryable) {
        const nextAttempt = attempt + 1;
        setRetryCount(nextAttempt);
        setActiveProcessStep(0); // reset progress
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        await runValuation(payload, nextAttempt);
      } else {
        setGlobalError(
          isTimeout
            ? "The request timed out after multiple attempts. Please try again."
            : msg
        );
        setStep("form");
        topRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [form]);

  const handleDeedUpload = async (file: File) => {
    setDeedFile(file);
    setDeedParsing(true);
    setDeedParsed(false);

    try {
      setGlobalError(null);
      setUseDeedResult(false);

      const { turnstileConfig, documentUploadConfig } = await loadValuationConfig();
      const mimeType = resolveDocumentMimeType(file);

      if (!mimeType || !documentUploadConfig.acceptedMimeTypes.includes(mimeType)) {
        throw new Error("Unsupported file format. Upload PDF, PNG, JPG/JPEG, WEBP, or GIF.");
      }

      if (file.size > documentUploadConfig.maxFileSizeBytes) {
        throw new Error("The selected file is too large for document extraction.");
      }

      const fileData = await readFileAsBase64(file);
      const turnstileToken = turnstileConfig.enabled ? await requestTurnstileToken() : "";

      const response = await fetch("/api/valuation/document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          mimeType,
          fileData,
          ...(turnstileToken ? { turnstileToken } : {}),
        }),
      });

      const data = await response.json().catch(() => null) as DocumentExtractionResponse | null;
      if (!response.ok) {
        throw new Error(data?.error || "Could not extract property details from the uploaded file.");
      }

      const inquiry = data?.inquiry || {};
      setTrackedValues({
        ...(inquiry.propertyName ? { unit: inquiry.propertyName } : {}),
        ...(inquiry.location ? { area: inquiry.location } : {}),
        ...(inquiry.city ? { city: inquiry.city } : {}),
        ...(inquiry.propertyType ? { type: inquiry.propertyType } : {}),
        ...(inquiry.bedrooms ? { beds: inquiry.bedrooms } : {}),
        ...(inquiry.maids ? { maids: inquiry.maids } : {}),
        ...(inquiry.size ? { size: inquiry.size } : {}),
      }, "deed");
      setGate((current) => ({
        name: current.name || inquiry.ownerName || current.name,
        phone: current.phone || inquiry.phone || current.phone,
        email: current.email || inquiry.email || current.email,
      }));
      setDeedParsed(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not read the deed.";
      setGlobalError(msg);
      setDeedFile(null);
      setDeedParsed(false);
    } finally {
      setDeedParsing(false);
      resetTurnstileWidget();
    }
  };

  const scrollToFirstFormError = useCallback((errors: FieldErrors) => {
    if (errors.unit) {
      const target = smartInputRef.current ?? unitInputRef.current;
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
      target?.focus();
      return;
    }
  }, []);

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);

    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      scrollToFirstFormError(errors);
      return;
    }

    setFieldErrors({});
    setGlobalError(null);
    setRetryCount(0);
    setStep("processing");
    setActiveProcessStep(0);
    topRef.current?.scrollIntoView({ behavior: "smooth" });

    try {
      const { turnstileConfig } = await loadValuationConfig();
      const turnstileToken = turnstileConfig.enabled ? await requestTurnstileToken() : "";
      const apiPayload = {
        propertyName: form.unit,
        location: form.area,
        city: form.city,
        propertyType: form.type,
        bedrooms: form.beds,
        maids: form.maids,
        size: form.size,
        ...(turnstileToken ? { turnstileToken } : {}),
      };

      await runValuationWithPhases(apiPayload, 1);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Security verification failed.";
      setGlobalError(msg);
      setStep("form");
    }
  };

  // Separate function that also tracks phases (keeps runValuation clean for retries)
  const runValuationWithPhases = async (payload: object, attempt: number) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), STREAM_TIMEOUT_MS);

    try {
      const res = await fetch("/api/valuation/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        if (res.status === 429) {
          const retry = errData?.retryAfterSeconds;
          throw new Error(
            retry
              ? `Service at capacity. Please try again in ${retry} seconds.`
              : (errData?.error ?? "Too many requests.")
          );
        }
        throw new Error(errData?.error ?? `Request failed (${res.status}).`);
      }

      if (!res.body) throw new Error("Streaming not supported in this browser.");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finalData: PreviewApiResponse | null = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          let evt: { event: string; data?: PreviewApiResponse; error?: string };
          try { evt = JSON.parse(line); } catch { continue; }

          if (evt.event === "error") throw new Error(evt.error ?? "Valuation failed.");
          if (evt.event in phaseMap) setActiveProcessStep(phaseMap[evt.event]);
          if (evt.event === "final" && evt.data) finalData = evt.data;
        }
      }

      if (!finalData) throw new Error("Stream ended before a result was returned.");

      setResult(mapPreviewApiToResult(finalData, form));
      setUnlocked(false);
      setUseDeedResult(false);
      setStep("results");
      topRef.current?.scrollIntoView({ behavior: "smooth" });

    } catch (err) {
      clearTimeout(timeout);
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      const isTimeout = err instanceof Error && err.name === "AbortError";
      const isRetryable = (isTimeout || !msg.includes("Too many requests")) && attempt < MAX_RETRIES;

      console.error(`[ValuationPage] attempt ${attempt}:`, err);

      if (isRetryable) {
        setRetryCount(attempt);
        setActiveProcessStep(0);
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        await runValuationWithPhases(payload, attempt + 1);
      } else {
        setGlobalError(
          isTimeout
            ? "The valuation timed out. Please try again."
            : msg
        );
        setStep("form");
        topRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    } finally {
      clearTimeout(timeout);
      resetTurnstileWidget();
    }
  };

  const loadValuationConfig = useCallback(async () => {
    const response = await fetch("/api/valuation/config", {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    const responseText = await response.text();
    let data: {
      error?: string;
      turnstile?: TurnstileConfig;
      documentUpload?: DocumentUploadConfig;
    } | null = null;

    if (responseText) {
      try {
        data = JSON.parse(responseText) as {
          error?: string;
          turnstile?: TurnstileConfig;
          documentUpload?: DocumentUploadConfig;
        };
      } catch {
        data = null;
      }
    }

    if (!response.ok) {
      const detail =
        typeof data?.error === "string" && data.error.trim().length > 0
          ? data.error.trim()
          : responseText.trim();
      throw new Error(
        detail
          ? `Could not load the valuation form settings. ${detail}`
          : "Could not load the valuation form settings.",
      );
    }

    const configData = data as {
      turnstile?: TurnstileConfig;
      documentUpload?: DocumentUploadConfig;
    } | null;
    const nextTurnstileConfig = normalizeTurnstileConfig(configData?.turnstile);
    const nextDocumentUploadConfig = normalizeDocumentUploadConfig(configData?.documentUpload);
    turnstileConfigRef.current = nextTurnstileConfig;
    documentUploadConfigRef.current = nextDocumentUploadConfig;

    return {
      turnstileConfig: nextTurnstileConfig,
      documentUploadConfig: nextDocumentUploadConfig,
    };
  }, []);

  const ensureTurnstileWidget = useCallback(async (config: TurnstileConfig) => {
    if (!config.enabled) {
      return null;
    }

    if (!config.configured) {
      throw new Error("Security verification is temporarily unavailable. Please try again later.");
    }

    if (!turnstileContainerRef.current) {
      throw new Error("Security verification is not ready yet. Please try again.");
    }

    if (turnstileWidgetIdRef.current !== null) {
      const turnstile = await loadTurnstileScript();
      setTurnstileState("ready");
      return turnstile;
    }

    if (!turnstileWidgetPromiseRef.current) {
      turnstileWidgetPromiseRef.current = (async () => {
        const turnstile = await loadTurnstileScript();
        if (turnstileWidgetIdRef.current === null && turnstileContainerRef.current) {
          turnstileWidgetIdRef.current = turnstile.render(turnstileContainerRef.current, {
            sitekey: config.siteKey,
            action: config.action,
            appearance: "execute",
            execution: "execute",
            callback(token) {
              const pending = turnstilePendingRef.current;
              if (!pending) return;
              turnstilePendingRef.current = null;
              setTurnstileState("ready");
              pending.resolve(token);
            },
            "error-callback": () => rejectPendingTurnstileRequest("Security verification failed. Please try again."),
            "expired-callback": () => rejectPendingTurnstileRequest("Security verification expired. Please try again."),
            "timeout-callback": () => rejectPendingTurnstileRequest("Security verification timed out. Please try again."),
          });
        }

        setTurnstileState("ready");
        return turnstile;
      })();
    }

    try {
      return await turnstileWidgetPromiseRef.current;
    } finally {
      turnstileWidgetPromiseRef.current = null;
    }
  }, []);

  const requestTurnstileToken = useCallback(async () => {
    const config = turnstileConfigRef.current.enabled || turnstileConfigRef.current.siteKey
      ? turnstileConfigRef.current
      : (await loadValuationConfig()).turnstileConfig;

    if (!config.enabled) {
      return "";
    }

    const turnstile = await ensureTurnstileWidget(config);
    if (!turnstile || turnstileWidgetIdRef.current === null) {
      throw new Error("Security verification is not ready yet. Please try again.");
    }

    setTurnstileState("verifying");

    return await new Promise<string>((resolve, reject) => {
      rejectPendingTurnstileRequest("Security verification was interrupted.");
      turnstilePendingRef.current = { resolve, reject };

      try {
        turnstile.reset(turnstileWidgetIdRef.current);
        turnstile.execute(turnstileWidgetIdRef.current);
      } catch {
        rejectPendingTurnstileRequest("Security verification could not start. Please try again.");
      }
    });
  }, [ensureTurnstileWidget, loadValuationConfig]);

  const resetTurnstileWidget = useCallback(() => {
    if (!window.turnstile || turnstileWidgetIdRef.current === null) return;

    try {
      window.turnstile.reset(turnstileWidgetIdRef.current);
      if (turnstileConfigRef.current.enabled && turnstileConfigRef.current.configured) {
        setTurnstileState("ready");
      }
    } catch {}
  }, []);

  const removeTurnstileWidget = useCallback(() => {
    turnstileWidgetPromiseRef.current = null;

    if (!window.turnstile || turnstileWidgetIdRef.current === null) {
      turnstileWidgetIdRef.current = null;
      return;
    }

    try {
      window.turnstile.remove(turnstileWidgetIdRef.current);
    } catch {}

    turnstileWidgetIdRef.current = null;
  }, []);

  const rejectPendingTurnstileRequest = useCallback((message: string) => {
    const pending = turnstilePendingRef.current;
    if (!pending) return;
    turnstilePendingRef.current = null;
    setTurnstileState("error");
    pending.reject(new Error(message));
  }, []);

  const copySummary = () => {
    if (!result) return;
    const c = result.currency;
    const text = [
      `Valuation for ${result.community}, ${result.city}`,
      `Fair Value: ${fmt(result.fairValueLow, c)} – ${fmt(result.fairValueHigh, c)}`,
      `Suggested List: ${fmt(result.suggestedListLow, c)} – ${fmt(result.suggestedListHigh, c)}`,
      `Quick Sale: ${fmt(result.quickSaleLow, c)} – ${fmt(result.quickSaleHigh, c)}`,
    ].join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const showLockedFairValuePreview = !unlocked && result?.accessState === "preview";
  const priceComparisonBounds = getPriceComparisonBounds(result);
  const lockedPriceComparisonCardProps = getUnlockCardProps(!unlocked, "Unlock the full report");
  const lockedComparableEvidenceCardProps = getUnlockCardProps(!unlocked, "Unlock the full report to reveal comparable evidence");
  const lockedMarketReadCardProps = getUnlockCardProps(!unlocked, "Unlock the full report to reveal market read");
  const lockedStrategyCardProps = getUnlockCardProps(!unlocked, "Unlock the full report to reveal recommended strategy");
  const lockedMovingFactorsCardProps = getUnlockCardProps(Boolean(result?.movingFactorsLocked), "Unlock the full report to reveal what can move this estimate");
  const currentProcessingStep = Math.min(activeProcessStep + 1, processingSteps.length);
  const processingProgress = `${(currentProcessingStep / processingSteps.length) * 100}%`;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div ref={topRef} className="h-16 sm:h-20" />

      <AnimatePresence mode="wait">

        {/* ── Form ── */}
        {step === "form" && (
          <motion.div key="form"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
          >
            {/* Hero */}
            <section className="mx-auto max-w-7xl px-4 pt-4 pb-8 sm:px-6 sm:pt-12">
              <div className="grid items-start gap-8 lg:grid-cols-5 lg:gap-12">
                <div className="lg:col-span-3">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0B3D2E] to-[#1A7A5A] flex items-center justify-center shadow-md">
                      <Target className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase"
                      style={{ background: "linear-gradient(to right, #D4A847, #B8922F)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                      Owner-Ready Valuation
                    </p>
                  </div>
                  <h1 className="mb-6 text-3xl font-bold leading-[1.08] sm:text-5xl lg:text-6xl">
                    Understand your property&apos;s{" "}
                    <span style={{ background: "linear-gradient(to right, #D4A847, #B8922F)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                      value
                    </span>{" "}in minutes.
                  </h1>
                  <p className="mb-6 max-w-xl text-base text-muted-foreground sm:text-lg">
                    A refined estimate based on recent transactions, active listings, and comparable homes in the same market.
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {["Recent sales", "Live asking prices", "Expert guidance"].map((t) => (
                      <span key={t} className="inline-flex items-center gap-2 px-4 py-2.5 bg-card text-foreground rounded-xl text-xs font-bold border border-border/50 shadow-sm hover:border-primary/30 hover:shadow-md transition-all duration-300">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <div className="space-y-5 rounded-2xl border border-border/50 bg-card p-5 shadow-sm sm:p-6">
                    <div className="flex items-center gap-2.5">
                      <div className="w-1 h-6 rounded-full" style={{ background: "linear-gradient(to bottom, #D4A847, #B8922F)" }} />
                      <p className="text-[10px] font-bold tracking-[0.2em] uppercase"
                        style={{ background: "linear-gradient(to right, #D4A847, #B8922F)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                        What You Get
                      </p>
                    </div>
                    {[
                      { icon: TrendingUp, title: "Sharper fair value range",    desc: "Built from same-building sales, nearby comparables, and current asking prices." },
                      { icon: Target,     title: "Actionable pricing guidance", desc: "See fair value, suggested list price, and quick-sale range in one snapshot." },
                      { icon: Sparkles,   title: "Expert follow-up",            desc: "Our valuation team reviews your report and reaches out with tailored advice." },
                    ].map((item) => (
                      <div key={item.title} className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#0B3D2E]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <item.icon className="h-4 w-4 text-[#0B3D2E]" />
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground text-sm">{item.title}</h3>
                          <p className="text-muted-foreground text-sm mt-0.5 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Global error banner */}
            {globalError && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-4">
                <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-6 py-4 text-sm text-destructive font-medium flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{globalError}</span>
                </div>
              </div>
            )}

            {/* Form */}
            <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20">
              <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm sm:p-10">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0B3D2E] to-[#1A7A5A] flex items-center justify-center shadow-md">
                    <Building2 className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold sm:text-3xl">Tell us about the property</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">All the core details in one screen. The more precise, the tighter the estimate.</p>
                  </div>
                </div>
                <div className="h-px bg-border/50 my-6" />

                <form onSubmit={handleSubmit} noValidate className="space-y-5 sm:space-y-6">

                  {/* Smart search bar */}
                  <div>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none z-10" />
                      <input
                        ref={smartInputRef}
                        value={smartQuery}
                        onChange={(e) => handleSmartInputChange(e.target.value)}
                        onFocus={() => {
                          if (smartQuery.trim().length >= 2) {
                            setShowSmartSuggestions(true);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") {
                            setShowSmartSuggestions(false);
                            return;
                          }

                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (smartSuggestions.length > 0) {
                              applySmartSuggestion(smartSuggestions[0].parsed);
                            }
                          }
                        }}
                        placeholder='Try "Marina Gate 1, Dubai Marina, 2BR" or "3 bed villa Dubai Hills"'
                        className="h-14 w-full rounded-2xl border-2 border-[#0B3D2E]/20 bg-background pl-12 pr-20 text-[15px] transition-all placeholder:text-muted-foreground/50 focus:outline-none focus:border-[#0B3D2E]/40 focus:ring-2 focus:ring-[#0B3D2E]/10 sm:pr-16"
                      />
                      {(smartQuery || hasSmartAutofill) && (
                        <button type="button"
                          onClick={() => {
                            setSmartQuery("");
                            setSmartParsed({});
                            setShowSmartSuggestions(false);
                            clearSmartAutofill();
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground sm:right-4 sm:text-xs">
                          Clear
                        </button>
                      )}

                      {showSmartSuggestions && smartQuery.trim().length >= 2 && (
                        <div
                          ref={smartSuggestionsRef}
                          className="absolute top-full left-0 right-0 mt-1 z-50 rounded-2xl border border-border bg-card shadow-lg overflow-hidden"
                        >
                          <div className="border-b border-border/40 bg-muted/20 px-4 py-2">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/70">
                              Smart matches
                            </p>
                          </div>

                          {smartSuggestions.length > 0 ? (
                            <div className="max-h-72 overflow-y-auto">
                              {smartSuggestions.map((suggestion) => (
                                <button
                                  key={suggestion.id}
                                  type="button"
                                  className="flex w-full items-start gap-3 border-b border-border/30 px-4 py-3 text-left text-sm transition-colors hover:bg-muted/40 last:border-0"
                                  onClick={() => {
                                    applySmartSuggestion(suggestion.parsed);
                                  }}
                                  onMouseDown={(event) => {
                                    event.preventDefault();
                                    applySmartSuggestion(suggestion.parsed);
                                  }}
                                >
                                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                                    suggestion.kind === "ai"
                                      ? "bg-[#1A7A5A]/12"
                                      : suggestion.kind === "detected"
                                        ? "bg-[#0B3D2E]/10"
                                        : "bg-[#D4A847]/12"
                                  }`}>
                                    {suggestion.kind === "places"
                                      ? <MapPin className="h-4 w-4 text-[#B8922F]" />
                                      : <Sparkles className={`h-4 w-4 ${
                                          suggestion.kind === "ai" ? "text-[#1A7A5A]" : "text-[#0B3D2E]"
                                        }`} />}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <p className="truncate font-semibold text-foreground">{suggestion.title}</p>
                                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] ${
                                        suggestion.kind === "ai"
                                          ? "bg-[#1A7A5A]/12 text-[#1A7A5A]"
                                          : suggestion.kind === "detected"
                                            ? "bg-[#0B3D2E]/8 text-[#0B3D2E]"
                                            : "bg-[#D4A847]/14 text-[#B8922F]"
                                      }`}>
                                        {suggestion.kind === "ai" ? "AI" : suggestion.kind === "detected" ? "Detected" : "Live"}
                                      </span>
                                      {suggestion.needsConfirmation && (
                                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                                          Review
                                        </span>
                                      )}
                                      {typeof suggestion.confidence === "number" && suggestion.kind === "ai" && !suggestion.needsConfirmation && (
                                        <span className="rounded-full bg-[#0B3D2E]/8 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#0B3D2E]">
                                          {Math.round(suggestion.confidence * 100)}%
                                        </span>
                                      )}
                                    </div>
                                    <p className="mt-1 truncate text-xs text-muted-foreground">
                                      {suggestion.subtitle}
                                    </p>
                                  </div>
                                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                </button>
                              ))}
                              {smartAIParseLoading && (
                                <div className="flex items-center gap-2 border-t border-border/30 px-4 py-2.5 text-xs text-muted-foreground">
                                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                  AI is refining the match…
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="px-4 py-3 text-sm text-muted-foreground">
                              {smartPlacesLoading || smartAIParseLoading
                                ? "Looking up buildings and communities…"
                                : "No confident match yet. Keep typing or fill the fields below."}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {Object.keys(smartParsed).length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2.5">
                        {smartParsed.city  && <SmartTag label="City"     value={smartParsed.city} />}
                        {smartParsed.area  && <SmartTag label="Area"     value={smartParsed.area} />}
                        {smartParsed.unit  && <SmartTag label="Building" value={smartParsed.unit} />}
                        {smartParsed.type  && <SmartTag label="Type"     value={smartParsed.type} />}
                        {smartParsed.beds  && <SmartTag label="Beds"     value={smartParsed.beds} />}
                        {smartParsed.maids && <SmartTag label="Maid's room" value={smartParsed.maids} />}
                        {smartParsed.size  && <SmartTag label="Size"     value={smartParsed.size} />}
                      </div>
                    )}
                  </div>

                  {/* Or divider + deed upload */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-border/50" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">or</span>
                    <div className="flex-1 h-px bg-border/50" />
                  </div>

                  {/* ── Title deed upload ── */}
                  <div>
                    <input
                      ref={deedInputRef}
                      type="file"
                      accept={documentUploadConfigRef.current.accept}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleDeedUpload(file);
                        e.target.value = "";
                      }}
                    />
                    {!deedFile ? (
                      <button type="button"
                        onClick={() => deedInputRef.current?.click()}
                        className="group flex w-full flex-col items-start gap-3 rounded-2xl border-2 border-dashed border-[#0B3D2E]/20 px-5 py-4 text-left text-muted-foreground transition-all duration-200 hover:border-[#0B3D2E]/40 hover:bg-[#0B3D2E]/5 hover:text-[#0B3D2E] sm:flex-row sm:items-center sm:justify-center sm:px-6">
                        <FileUp className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        <div className="text-left">
                          <p className="text-sm font-semibold">Upload title deed</p>
                          <p className="text-xs opacity-70">PDF, PNG, JPG, WEBP or GIF — we&apos;ll extract the property details automatically</p>
                        </div>
                        <span className="rounded-full bg-[#0B3D2E]/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0B3D2E] sm:ml-auto">Optional</span>
                      </button>
                    ) : (
                      <div className={`flex flex-col gap-3 rounded-2xl border px-4 py-4 transition-all duration-300 sm:flex-row sm:items-center sm:px-5 ${
                        deedParsing ? "border-[#D4A847]/30 bg-[#D4A847]/5" :
                        deedParsed  ? "border-[#0B3D2E]/25 bg-[#0B3D2E]/5" :
                        "border-border bg-muted/30"
                      }`}>
                        <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          deedParsing ? "bg-[#D4A847]/15" : deedParsed ? "bg-[#0B3D2E]/10" : "bg-muted"
                        }`}>
                          {deedParsing
                            ? <RefreshCw className="h-4 w-4 text-[#D4A847] animate-spin" />
                            : deedParsed
                            ? <FileText className="h-4 w-4 text-[#0B3D2E]" />
                            : <FileUp className="h-4 w-4 text-muted-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{deedFile.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {deedParsing ? "Reading deed and extracting property details…" :
                             deedParsed  ? "Fields filled from deed — review and adjust below" :
                             "Ready to process"}
                          </p>
                        </div>
                        {!deedParsing && (
                          <button type="button"
                            onClick={() => { setDeedFile(null); setDeedParsed(false); setUseDeedResult(false); }}
                            className="self-end p-1 text-muted-foreground transition-colors hover:text-foreground sm:self-auto">
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Row 1 — City → Area → Building (cascading, Property Finder style) */}
                  <div className="grid sm:grid-cols-3 gap-4">

                    {/* City */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 flex items-center gap-1">
                        City
                        <span className="text-[9px] bg-gradient-to-r from-[#D4A847] to-[#B8922F] text-white px-1.5 py-0.5 rounded-full font-bold">Required</span>
                      </label>
                      <Select value={form.city} onValueChange={(v) => {
                        setTrackedValues({ city: v, area: "", unit: "" }, "manual");
                        if (submitAttempted) setFieldErrors((prev) => {
                          const next = { ...prev };
                          delete (next as any).city;
                          return next;
                        });
                      }}>
                        <SelectTrigger className={`h-12 bg-background ${(fieldErrors as any).city ? "border-destructive" : ""}`}>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <SelectValue placeholder="Select city" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(LOCATION_DATA).map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {(fieldErrors as any).city && (
                        <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 flex-shrink-0" />{(fieldErrors as any).city}
                        </p>
                      )}
                    </div>

                    {/* Area / Community — searchable */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">Area / Community</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
                        <input
                          value={form.area}
                          onChange={(e) => {
                            setTrackedValues({ area: e.target.value, unit: "" }, "manual");
                            setShowAreaSuggestions(true);
                          }}
                          onFocus={() => setShowAreaSuggestions(true)}
                          onKeyDown={(e) => { if (e.key === "Escape") setShowAreaSuggestions(false); }}
                          placeholder={form.city ? `Search in ${form.city}…` : "Select city first"}
                          autoComplete="off"
                          disabled={!form.city}
                          className="w-full pl-10 h-12 bg-background rounded-xl border border-border px-3 text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E]/40 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        {showAreaSuggestions && form.city && (() => {
                          const q = form.area.trim().toLowerCase();
                          const matches = getAreas(form.city)
                            .filter((a) => !q || a.area.toLowerCase().includes(q))
                            .slice(0, 8);
                          return matches.length > 0 ? (
                            <div ref={areaSuggestionsRef}
                              className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border border-border bg-card shadow-lg overflow-hidden max-h-56 overflow-y-auto">
                              {matches.map((a) => (
                                <button key={a.area} type="button"
                                  className="w-full text-left px-4 py-3 text-sm hover:bg-muted/50 transition-colors flex items-center gap-2.5 border-b border-border/30 last:border-0"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    setTrackedValues({ area: a.area, unit: "" }, "manual");
                                    setShowAreaSuggestions(false);
                                  }}>
                                  <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                  <span>{a.area}</span>
                                  <span className="ml-auto text-[10px] text-muted-foreground/60">{a.buildings.length} buildings</span>
                                </button>
                              ))}
                            </div>
                          ) : null;
                        })()}
                      </div>
                    </div>

                    {/* Building + Unit — Google Places live search with local fallback */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 flex items-center gap-1">
                        Building / Unit
                        <span className="text-[9px] bg-gradient-to-r from-[#D4A847] to-[#B8922F] text-white px-1.5 py-0.5 rounded-full font-bold">Required</span>
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
                        {placesLoading && (
                          <RefreshCw className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground animate-spin z-10 pointer-events-none" />
                        )}
                        <input
                          ref={unitInputRef}
                          value={form.unit}
                          onChange={(e) => {
                            updateField("unit", e.target.value);
                            setShowBuildingSuggestions(true);
                            setShowPlaces(true);
                          }}
                          onFocus={() => { setShowBuildingSuggestions(true); setShowPlaces(true); }}
                          onKeyDown={(e) => {
                            if (e.key === "Escape") { setShowBuildingSuggestions(false); setShowPlaces(false); }
                          }}
                          placeholder={form.area ? `Search in ${form.area}…` : "Search any building, community, villa…"}
                          autoComplete="off"
                          className={`w-full pl-10 h-12 bg-background rounded-xl border px-3 text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 ${
                            fieldErrors.unit ? "border-destructive" : "border-border focus:border-[#0B3D2E]/40"
                          }`}
                        />

                        {/* Google Places results — shown when available */}
                        {showPlaces && placesResults.length > 0 && (
                          <div ref={placesRef}
                            className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border border-border bg-card shadow-lg overflow-hidden max-h-64 overflow-y-auto">
                            <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 bg-muted/30 border-b border-border/30">
                              Live results
                            </p>
                            {placesResults.map((p) => (
                              <button key={p.placeId} type="button"
                                className="w-full text-left px-4 py-3 text-sm hover:bg-muted/50 transition-colors flex items-start gap-2.5 border-b border-border/30 last:border-0"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  const placeCity = Object.prototype.hasOwnProperty.call(LOCATION_DATA, p.city) ? p.city : form.city;
                                  setTrackedValues({
                                    unit: p.building || p.description.split(",")[0].trim(),
                                    ...(p.area ? { area: p.area } : {}),
                                    ...(placeCity ? { city: placeCity } : {}),
                                  }, "places");
                                  setShowPlaces(false);
                                  setShowBuildingSuggestions(false);
                                  unitInputRef.current?.blur();
                                }}>
                                <MapPin className="h-3.5 w-3.5 text-[#0B3D2E] flex-shrink-0 mt-0.5" />
                                <div className="min-w-0">
                                  <p className="font-medium text-foreground truncate">
                                    {p.building || p.description.split(",")[0]}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                                    {[p.area, p.city, "UAE"].filter(Boolean).join(", ")}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Local fallback — shown when no Places results yet */}
                        {showBuildingSuggestions && placesResults.length === 0 && !placesLoading && (() => {
                          const q = form.unit.trim().toLowerCase();
                          const pool = form.city && form.area
                            ? getBuildings(form.city, form.area)
                            : form.city
                            ? getAreas(form.city).flatMap((a) => a.buildings)
                            : [];
                          const matches = q.length >= 1
                            ? pool.filter((b) => b.toLowerCase().includes(q)).slice(0, 7)
                            : pool.slice(0, 7);
                          return matches.length > 0 ? (
                            <div ref={buildingSuggestionsRef}
                              className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border border-border bg-card shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                              <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 bg-muted/30 border-b border-border/30">
                                Suggestions
                              </p>
                              {matches.map((b) => (
                                <button key={b} type="button"
                                  className="w-full text-left px-4 py-3 text-sm hover:bg-muted/50 transition-colors flex items-center gap-2.5 border-b border-border/30 last:border-0"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    updateField("unit", b);
                                    setShowBuildingSuggestions(false);
                                    unitInputRef.current?.blur();
                                  }}>
                                  <Building2 className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                  <span>{b}</span>
                                </button>
                              ))}
                            </div>
                          ) : null;
                        })()}
                      </div>
                      <FieldError message={fieldErrors.unit} />
                    </div>
                  </div>

                                    {/* Row 2 — Type / Beds / Size */}
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">Type</label>
                      <Select value={form.type} onValueChange={(v) => updateField("type", v)}>
                        <SelectTrigger className="h-12 bg-background"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {["Apartment", "Villa", "Townhouse", "Penthouse", "Studio"].map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">Beds</label>
                      <BedroomPicker
                        maids={form.maids}
                        onChange={(value) => updateField("beds", value)}
                        onMaidsChange={(value) => updateField("maids", value)}
                        value={form.beds}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">Size</label>
                      <SizePicker
                        onChange={(value) => updateField("size", value)}
                        value={form.size}
                      />
                    </div>
                  </div>



                  <div>
                    <button type="submit"
                      className="inline-flex w-full items-center justify-center gap-2.5 rounded-full px-8 py-4 font-bold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] sm:w-auto"
                      style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)", boxShadow: "0 4px 20px rgba(11,61,46,0.3)" }}>
                      <Sparkles className="h-4 w-4" />
                      Get Quick Valuation
                    </button>
                    <p className="text-xs text-muted-foreground mt-3">
                      Views, upgrades, floor, vacancy, furnishings, and condition help refine the estimate.
                    </p>
                  </div>
                </form>
              </div>
            </section>
          </motion.div>
        )}

        {/* ── Processing ── */}
        {step === "processing" && (
          <motion.div key="processing"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
            className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20"
          >
            <div className="rounded-[28px] border border-[#0B3D2E]/10 bg-[linear-gradient(180deg,#FFFFFF_0%,#FCFBF7_100%)] p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-12">
              <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "#D4A847" }}>Valuation Snapshot</p>
              <h2 className="mb-2 text-2xl font-bold sm:text-3xl">{extractCommunity(form.unit)}</h2>
              <p className="text-muted-foreground mb-3">Key pricing guidance first, then comparable sales, and supporting sources.</p>
              <span className="inline-block px-3 py-1 rounded-full border border-border text-sm font-medium">{form.city}</span>

              {/* Retry notice */}
              {retryCount > 0 && (
                <div className="mt-4 flex items-center gap-2 text-sm text-[#D4A847]">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Retrying… attempt {retryCount + 1} of {MAX_RETRIES + 1}
                </div>
              )}

              <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#0B3D2E]/10">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#0B3D2E_0%,#1A7A5A_100%)] transition-all duration-700"
                    style={{ width: processingProgress }}
                  />
                </div>
                <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.18em] text-[#0B3D2E]/65">
                  Step {currentProcessingStep} of {processingSteps.length}
                </span>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {processingSteps.map((ps, i) => {
                  const isDone = i < activeProcessStep;
                  const isActive = i === activeProcessStep;

                  return (
                    <div
                      key={ps.label}
                      className={`relative overflow-hidden rounded-[24px] border p-5 transition-all duration-500 sm:p-6 ${
                        isDone
                          ? "border-[#0B3D2E]/18 bg-white shadow-[0_18px_45px_rgba(11,61,46,0.08)]"
                          : isActive
                            ? "border-[#0B3D2E]/28 bg-[linear-gradient(180deg,rgba(11,61,46,0.08)_0%,rgba(255,255,255,0.96)_100%)] shadow-[0_22px_55px_rgba(11,61,46,0.14)]"
                            : "border-border/80 bg-white/70"
                      }`}
                    >
                      <div
                        className={`absolute inset-x-0 top-0 h-1 transition-colors duration-500 ${
                          isDone || isActive ? "bg-[linear-gradient(90deg,#0B3D2E_0%,#1A7A5A_100%)]" : "bg-transparent"
                        }`}
                      />

                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-1 h-3 w-3 shrink-0 rounded-full border transition-all duration-500 ${
                            isDone
                              ? "border-[#0B3D2E] bg-[#0B3D2E]"
                              : isActive
                                ? "border-[#0B3D2E] bg-[#0B3D2E] ring-4 ring-[#0B3D2E]/12"
                                : "border-muted-foreground/20 bg-muted-foreground/25"
                          } ${isActive ? "animate-pulse" : ""}`}
                        />

                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground/70">
                            Phase {i + 1}
                          </p>
                          <h3 className="mt-2 text-xl font-bold leading-tight text-foreground">
                            {ps.label}
                          </h3>
                        </div>
                      </div>

                      <p className="mt-5 text-sm leading-6 text-muted-foreground">
                        {ps.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 space-y-4">
                {[1, 2].map((n) => (
                  <div key={n} className="rounded-[22px] border border-[#0B3D2E]/8 bg-white/80 p-6 space-y-3 animate-pulse shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
                    <div className="h-4 w-1/3 bg-[#0B3D2E]/10 rounded" />
                    <div className="h-3 w-2/3 bg-[#0B3D2E]/5 rounded" />
                    <div className="h-3 w-1/2 bg-[#0B3D2E]/5 rounded" />
                    <div className="h-3 w-3/4 bg-[#0B3D2E]/5 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Results ── */}
        {step === "results" && result && (
          <motion.div key="results"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
            className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12"
          >
            {/* Demo banner */}
            {useDeedResult && (
              <div className="mb-4 flex items-start gap-3 rounded-2xl border border-[#D4A847]/30 bg-[#D4A847]/8 px-4 py-3.5 sm:px-6">
                <FileText className="h-4 w-4 text-[#B8922F] flex-shrink-0" />
                <p className="text-sm text-[#B8922F] font-medium">
                  <strong>Demo result</strong> — this is simulated data from the deed upload. Use the search or fill the form for a live AI valuation.
                </p>
              </div>
            )}

            {/* Header */}
            <div className="mb-4 rounded-2xl border border-border/50 bg-card p-5 shadow-sm sm:p-8">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-gradient-to-br from-[#0B3D2E] to-[#1A7A5A] shadow-[0_10px_24px_rgba(11,61,46,0.18)]">
                    <Target className="h-4.5 w-4.5 text-white" />
                  </div>
                  <p className="text-[0.78rem] font-bold uppercase tracking-[0.28em] text-[#B8922F]">
                    Valuation Snapshot
                  </p>
                </div>
                <button
                  onClick={() => { setStep("form"); setResult(null); setUnlocked(false); setGate({ name: "", phone: "", email: "" }); setUseDeedResult(false); }}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-[#0B3D2E]/12 bg-[#0B3D2E]/[0.03] px-4 text-[0.82rem] font-semibold text-[#0B3D2E] transition-all duration-300 hover:border-[#0B3D2E]/22 hover:bg-[#0B3D2E]/[0.06] sm:w-auto"
                  type="button"
                >
                  <ArrowLeft className="h-4 w-4" />
                  New Search
                </button>
              </div>
              <h2 className="mb-2 text-2xl font-bold sm:text-4xl">{result.community}, {result.city}, {result.country}</h2>
              <p className="text-muted-foreground mb-4">Key pricing guidance first, then comparable sales and market context.</p>
              <div className="flex flex-wrap gap-2">
                {result.tags.map((t) => (
                  <span key={t} className="rounded-full px-3.5 py-1.5 text-xs font-medium text-foreground sm:px-4 sm:text-sm"
                    style={{ background: "linear-gradient(135deg, rgba(11,61,46,0.08), rgba(26,122,90,0.12))", border: "1px solid rgba(11,61,46,0.15)" }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Price section — numbers blurred until unlocked ── */}
            <div className="relative">
              {/* Fair Value + Confidence */}
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div
                  aria-label={showLockedFairValuePreview ? "Unlock the full report to reveal fair value" : undefined}
                  className={`rounded-2xl overflow-hidden shadow-sm ${showLockedFairValuePreview ? "cursor-pointer transition-transform duration-300 hover:-translate-y-0.5" : ""}`}
                  onClick={showLockedFairValuePreview ? scrollToUnlockSection : undefined}
                  onKeyDown={showLockedFairValuePreview ? (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      scrollToUnlockSection();
                    }
                  } : undefined}
                  role={showLockedFairValuePreview ? "button" : undefined}
                  tabIndex={showLockedFairValuePreview ? 0 : undefined}
                >
                  <div className="relative overflow-hidden bg-gradient-to-br from-[#D4A847] via-[#C9A83E] to-[#B8922F] p-5 text-white sm:p-8">
                    <div className="pointer-events-none absolute inset-0 opacity-40" style={{ background: "radial-gradient(circle at top right, rgba(255,255,255,0.24), transparent 42%), radial-gradient(circle at bottom left, rgba(255,255,255,0.12), transparent 46%)" }} />
                    <div className="relative">
                      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-white/75 font-bold">Fair Value</p>
                        {showLockedFairValuePreview && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
                            <Lock className="h-3 w-3" />
                            Exact range ready
                          </span>
                        )}
                      </div>

                      {showLockedFairValuePreview ? (
                        <div className="grid gap-4">
                          <div className="inline-flex max-w-full items-center rounded-2xl border border-white/18 bg-white/10 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-sm">
                            <HiddenRangeValue currency={result.currency} />
                          </div>
                          <p className="max-w-xl text-sm leading-relaxed text-white/90">
                            Comparable-backed fair value is prepared. Unlock the report to reveal the exact range and the reasoning behind it.
                          </p>
                        </div>
                      ) : (
                        <>
                          <p className={`text-2xl sm:text-3xl font-bold transition-all duration-500 select-none ${!unlocked ? "blur-md" : ""}`}>
                            {fmt(result.fairValueLow, result.currency)} – {fmt(result.fairValueHigh, result.currency)}
                          </p>
                          <p className={`text-sm text-white/80 mt-3 leading-relaxed transition-all duration-500 ${!unlocked ? "blur-sm opacity-60" : ""}`}>{result.fairValueExplanation}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-border/50 bg-card p-5 border-l-[3px] border-l-[#0B3D2E] shadow-sm sm:p-8">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">Confidence</p>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className={`h-5 w-5 ${
                      result.confidence === "High" ? "text-[#0B3D2E]"
                        : result.confidence === "Medium" ? "text-[#D4A847]"
                        : "text-destructive"
                    }`} />
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                      result.confidence === "High" ? "bg-[#0B3D2E]/10 text-[#0B3D2E]"
                        : result.confidence === "Medium" ? "bg-[#D4A847]/15 text-[#B8922F]"
                        : "bg-destructive/10 text-destructive"
                    }`}>
                      {result.confidence}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{result.confidenceReason}</p>
                </div>
              </div>

              {/* Price bars */}
              <div
                {...lockedPriceComparisonCardProps}
                className={`mb-4 rounded-2xl border border-border/50 bg-card p-5 shadow-sm sm:p-8 ${lockedPriceComparisonCardProps.className || ""}`}
              >
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="w-1 h-6 rounded-full bg-gradient-to-b from-[#D4A847] to-[#B8922F]" />
                  <p className="text-sm font-semibold text-foreground">Price Comparison</p>
                  {!unlocked && (
                    <button
                      aria-label="Unlock the full report"
                      className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                      onClick={scrollToUnlockSection}
                      type="button"
                    >
                      <Lock className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <div className="space-y-4 sm:grid sm:min-w-0 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:gap-x-3 sm:gap-y-4 sm:space-y-0">
                  <PriceBar label="Quick sale"     low={result.quickSaleLow}     high={result.quickSaleHigh}     min={priceComparisonBounds?.min ?? result.quickSaleLow} max={priceComparisonBounds?.max ?? result.suggestedListHigh} rangePreview={getPreviewRange(result, "Quick sale")} color="#D4A847" currency={result.currency} blurred={false} fixedWidthPct={null} />
                  <PriceBar label="Fair value"     low={result.fairValueLow}     high={result.fairValueHigh}     min={priceComparisonBounds?.min ?? result.quickSaleLow} max={priceComparisonBounds?.max ?? result.suggestedListHigh} rangePreview={getPreviewRange(result, "Fair value")} color="#0B3D2E" currency={result.currency} blurred={!unlocked} maskedPreview={!unlocked && result.accessState === "preview"} fixedWidthPct={null} />
                  <PriceBar label="Suggested list" low={result.suggestedListLow} high={result.suggestedListHigh} min={priceComparisonBounds?.min ?? result.quickSaleLow} max={priceComparisonBounds?.max ?? result.suggestedListHigh} rangePreview={getPreviewRange(result, "Suggested list")} color="#1A7A5A" currency={result.currency} blurred={!unlocked} maskedPreview={!unlocked && result.accessState === "preview"} fixedWidthPct={null} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-4 bg-muted/30 rounded-xl p-3 border border-border/30">{result.disclaimer}</p>
              </div>

              {/* Suggested + Quick sale cards */}
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div
                  aria-label={!unlocked && result.accessState === "preview" ? "Unlock the full report to reveal suggested list price" : undefined}
                  className={`rounded-2xl border border-border/50 bg-card p-5 border-l-[3px] border-l-[#0B3D2E] shadow-sm sm:p-6 ${!unlocked && result.accessState === "preview" ? "cursor-pointer transition-transform duration-300 hover:-translate-y-0.5" : ""}`}
                  onClick={!unlocked && result.accessState === "preview" ? scrollToUnlockSection : undefined}
                  onKeyDown={!unlocked && result.accessState === "preview" ? (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      scrollToUnlockSection();
                    }
                  } : undefined}
                  role={!unlocked && result.accessState === "preview" ? "button" : undefined}
                  tabIndex={!unlocked && result.accessState === "preview" ? 0 : undefined}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-[#0B3D2E]/10 flex items-center justify-center">
                      <TrendingUp className="h-3.5 w-3.5 text-[#0B3D2E]" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Suggested List Price</p>
                  </div>
                  {!unlocked && result.accessState === "preview" ? (
                    <div className="grid gap-1.5">
                      <MaskedInlineRange currency={result.currency} />
                      <p className="text-xs text-muted-foreground/80">
                        Exact range unlocks with the full report.
                      </p>
                    </div>
                  ) : (
                    <p className={`text-xl font-bold transition-all duration-500 select-none ${!unlocked ? "blur-md" : ""}`}>
                      {fmt(result.suggestedListLow, result.currency)} – {fmt(result.suggestedListHigh, result.currency)}
                    </p>
                  )}
                </div>
                <div className="rounded-2xl border border-border/50 bg-card p-5 border-l-[3px] border-l-[#D4A847] shadow-sm sm:p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-[#D4A847]/10 flex items-center justify-center">
                      <TrendingDown className="h-3.5 w-3.5 text-[#D4A847]" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Quick Sale Range</p>
                  </div>
                  <p className="text-xl font-bold">
                    {fmt(result.quickSaleLow, result.currency)} – {fmt(result.quickSaleHigh, result.currency)}
                  </p>
                </div>
              </div>

              {/* Copy — only shown when unlocked */}
              {unlocked && (
                <div className="mb-4 flex justify-start sm:justify-end">
                  <button onClick={copySummary} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied!" : "Copy summary"}
                  </button>
                </div>
              )}
            </div>

            {/* ── Comparables — price + reasoning blurred until unlocked ── */}
            <div
              {...lockedComparableEvidenceCardProps}
              className={`mb-4 rounded-2xl border border-border/50 bg-card p-5 shadow-sm sm:p-8 ${lockedComparableEvidenceCardProps.className || ""}`}
            >
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0B3D2E] to-[#1A7A5A] flex items-center justify-center shadow-md">
                  <Building2 className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-xl font-bold">Comparable evidence</h3>
                {!unlocked && <Lock className="h-3.5 w-3.5 text-muted-foreground ml-auto" />}
              </div>
              <p className="mb-6 text-sm text-muted-foreground sm:ml-[46px]">Strongest sales and active listings used in the estimate</p>
              <div className="grid gap-3 sm:hidden">
                {result.comparables.map((c, i) => {
                  const isLockedPreviewRow = !unlocked && c.visibility === "locked";
                  return (
                    <div key={i} className="rounded-2xl border border-border/50 bg-background/60 p-4">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          c.type === "Sale" ? "bg-[#0B3D2E]/10 text-[#0B3D2E]" : "bg-[#D4A847]/15 text-[#B8922F]"
                        }`}>{c.type}</span>
                        <div className="text-right">
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Price</p>
                          <div className="mt-1 text-sm font-bold transition-all duration-500 select-none">
                            {isLockedPreviewRow ? (
                              <MaskedComparablePrice currency={result.currency} />
                            ) : (
                              fmt(c.price, result.currency)
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mb-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="rounded-full bg-muted px-2.5 py-1">{c.size}</span>
                        <span className="rounded-full bg-muted px-2.5 py-1">{c.date}</span>
                      </div>
                      <p className={`text-sm leading-relaxed text-muted-foreground transition-all duration-500 select-none ${isLockedPreviewRow ? "blur-sm" : ""}`}>
                        {c.reason}
                      </p>
                    </div>
                  );
                })}
              </div>
              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-muted-foreground border-b border-border">
                      <th className="pb-3 pr-4">Type</th>
                      <th className="pb-3 pr-4">Size</th>
                      <th className="pb-3 pr-4">Date</th>
                      <th className="pb-3 pr-4">Price</th>
                      <th className="pb-3">Why It Matters</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.comparables.map((c, i) => {
                      const isLockedPreviewRow = !unlocked && c.visibility === "locked";
                      return (
                      <tr key={i} className="border-b border-border/50 last:border-0">
                        <td className="py-3 pr-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            c.type === "Sale" ? "bg-[#0B3D2E]/10 text-[#0B3D2E]" : "bg-[#D4A847]/15 text-[#B8922F]"
                          }`}>{c.type}</span>
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">{c.size}</td>
                        <td className="py-3 pr-4 text-muted-foreground">{c.date}</td>
                        <td className="py-3 pr-4 font-bold transition-all duration-500 select-none">
                          {isLockedPreviewRow ? (
                            <MaskedComparablePrice currency={result.currency} />
                          ) : (
                            fmt(c.price, result.currency)
                          )}
                        </td>
                        <td className={`py-3 text-muted-foreground max-w-xs transition-all duration-500 select-none ${isLockedPreviewRow ? "blur-sm" : ""}`}>
                          {c.reason}
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Gate card — inline unlock prompt ── */}
            {!unlocked && (
              <div ref={unlockSectionRef}>
                <GateCard
                  highlight={unlockHighlight}
                  gate={gate}
                  gateErrors={gateErrors}
                  gateSubmitting={gateSubmitting}
                  onChange={(field, val) => {
                    setGate((g) => ({ ...g, [field]: val }));
                    setGateErrors((prev) => {
                      const next = { ...prev };
                      if (field === "name") { if (val.trim().length >= 2) delete next.name; }
                      if (field === "phone" || field === "email") {
                        const phone = field === "phone" ? val : gate.phone;
                        const email = field === "email" ? val : gate.email;
                        if (phone.trim().length > 5 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) delete next.contact;
                      }
                      return next;
                    });
                  }}
                  onUnlock={async () => {
                    const errs: GateErrors = {};
                    if (!gate.name.trim() || gate.name.trim().length < 2) errs.name = "Your name is required.";
                    const hasPhone = gate.phone.trim().length > 5;
                    const hasEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(gate.email.trim());
                    if (!hasPhone && !hasEmail) errs.contact = "Please add a phone or email so we can follow up.";
                    if (Object.keys(errs).length) { setGateErrors(errs); return; }
                    if (!result?.leadId) {
                      setGateErrors({ contact: "The valuation preview is missing. Please run the valuation again." });
                      return;
                    }

                    setGateSubmitting(true);
                    setGlobalError(null);

                    try {
                      const { turnstileConfig } = await loadValuationConfig();
                      const turnstileToken = turnstileConfig.enabled ? await requestTurnstileToken() : "";
                      const response = await fetch("/api/valuation/unlock", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          leadId: result.leadId,
                          ownerName: gate.name,
                          phone: gate.phone,
                          email: gate.email,
                          ...(turnstileToken ? { turnstileToken } : {}),
                        }),
                      });

                      const data = await response.json().catch(() => null) as ApiResponse | { error?: string } | null;
                      if (!response.ok) {
                        throw new Error((data as { error?: string } | null)?.error || "Could not unlock the full report.");
                      }

                      setResult(mapApiToResult(data as ApiResponse, form));
                      setUnlocked(true);
                      setUseDeedResult(false);
                    } catch (err) {
                      const msg = err instanceof Error ? err.message : "Could not unlock the full report.";
                      setGateErrors({ contact: msg });
                    } finally {
                      setGateSubmitting(false);
                      resetTurnstileWidget();
                    }
                  }}
                />
              </div>
            )}

            {/* ── Market read — body blurred ── */}
            <div
              {...lockedMarketReadCardProps}
              className={`mb-4 rounded-2xl border border-border/50 bg-card p-5 shadow-sm sm:p-8 ${lockedMarketReadCardProps.className || ""}`}
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-1 h-6 rounded-full" style={{ background: "linear-gradient(to bottom, #D4A847, #B8922F)" }} />
                <h3 className="text-xl font-bold">Market read</h3>
                {!unlocked && <Lock className="h-3.5 w-3.5 text-muted-foreground ml-auto" />}
              </div>
              <p className={`text-muted-foreground leading-relaxed transition-all duration-500 select-none ${!unlocked ? "blur-sm" : ""}`}>
                {result.marketRead}
              </p>
            </div>

            {/* ── Strategy — text + bullets blurred ── */}
            <div
              {...lockedStrategyCardProps}
              className={`mb-4 rounded-2xl border border-border/50 bg-card p-5 shadow-sm sm:p-8 ${lockedStrategyCardProps.className || ""}`}
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-xl bg-[#0B3D2E]/10 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-[#0B3D2E]" />
                </div>
                <h3 className="text-xl font-bold">Recommended strategy</h3>
                {!unlocked && <Lock className="h-3.5 w-3.5 text-muted-foreground ml-auto" />}
              </div>
              <p className={`text-muted-foreground leading-relaxed mb-4 transition-all duration-500 select-none ${!unlocked ? "blur-sm" : ""}`}>
                {result.strategy}
              </p>
              <ul className="space-y-2.5">
                {result.strategyBullets.map((b, i) => (
                  <li key={i} className={`flex items-start gap-2.5 text-muted-foreground text-sm transition-all duration-500 select-none ${!unlocked ? "blur-sm" : ""}`}>
                    <ChevronRight className="h-4 w-4 mt-0.5 text-[#0B3D2E] flex-shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Moving factors — blurred in preview, visible after unlock ── */}
            <div
              {...lockedMovingFactorsCardProps}
              className={`mb-8 rounded-2xl border border-border/50 bg-card p-5 shadow-sm sm:p-8 ${lockedMovingFactorsCardProps.className || ""}`}
            >
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-9 h-9 rounded-xl bg-[#D4A847]/10 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-[#D4A847]" />
                </div>
                <h3 className="text-xl font-bold">What can move this estimate</h3>
                {result.movingFactorsLocked ? <Lock className="h-3.5 w-3.5 text-muted-foreground ml-auto" /> : null}
              </div>
              <p className="mb-4 text-sm text-muted-foreground sm:ml-[46px]">Common reasons real-world pricing can shift</p>
              <ul className="space-y-2.5">
                {result.movingFactors.map((f, i) => (
                  <li
                    key={i}
                    className={`flex items-start gap-2.5 text-muted-foreground text-sm transition-all duration-500 select-none ${
                      result.movingFactorsLocked ? "blur-sm" : ""
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full mt-1.5 flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)" }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="relative mb-10 overflow-hidden rounded-3xl border border-border/30 p-6 text-center sm:mb-12 sm:p-14"
              style={{ background: "linear-gradient(160deg, hsl(40,20%,96%), hsl(43,40%,95%))" }}>
              <div className="absolute top-0 left-0 w-full h-[2px]"
                style={{ background: "linear-gradient(90deg, transparent, #D4A847, #B8922F, #D4A847, transparent)" }} />
              <div className="absolute inset-0 opacity-[0.04]"
                style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(212,168,71,0.4) 1px, transparent 0)", backgroundSize: "28px 28px" }} />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg"
                  style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)", boxShadow: "0 8px 24px -4px rgba(212,168,71,0.3)" }}>
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-3 text-foreground">Want a detailed appraisal?</h3>
                <p className="mx-auto mb-8 max-w-lg leading-relaxed text-muted-foreground sm:mb-10">
                  Our RERA-certified valuation experts can provide a formal appraisal with an on-site inspection. Get a precise figure you can use for selling, financing, or legal purposes.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a href="https://wa.me/971549988811?text=Hi%2C%20I%20just%20used%20the%20online%20valuation%20tool%20and%20would%20like%20a%20detailed%20appraisal."
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-3 w-full sm:w-64 py-4 rounded-full font-bold text-white transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl active:scale-[0.98] text-[15px] shadow-lg"
                    style={{ background: "linear-gradient(to right, #25D366, #1DA851)", boxShadow: "0 8px 24px -4px rgba(37,211,102,0.3)" }}>
                    <MessageCircle className="h-5 w-5" />
                    WhatsApp Inquiry
                  </a>
                  <a href="tel:+971549988811"
                    className="inline-flex items-center justify-center gap-3 w-full sm:w-64 py-4 rounded-full font-bold text-white transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl active:scale-[0.98] text-[15px] shadow-lg"
                    style={{ background: "linear-gradient(to right, #D4A847, #B8922F)", boxShadow: "0 8px 24px -4px rgba(212,168,71,0.3)" }}>
                    <PhoneCall className="h-5 w-5" />
                    Call Now
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={turnstileContainerRef} className="h-0 overflow-hidden" />
      <Footer />
    </div>
  );
};


// ─── Google Places hook ───────────────────────────────────────────────────────

interface PlacePrediction {
  placeId: string;
  description: string;
  building: string;
  area: string;
  city: string;
}

interface SmartSuggestion {
  id: string;
  confidence?: number;
  kind: "ai" | "detected" | "places";
  needsConfirmation?: boolean;
  parsed: ParsedValuation;
  reasoning?: string;
  subtitle: string;
  title: string;
}

interface AIValuationSuggestionPayload {
  ambiguities: string[];
  confidence: number;
  needsConfirmation: boolean;
  parsed: ParsedValuation;
  reasoning: string;
}

function hasSmartParsedValue(parsed: ParsedValuation): boolean {
  return SMART_FIELD_KEYS.some((key) => typeof parsed[key] === "string" && parsed[key]!.trim().length > 0);
}

function formatSmartSuggestionSubtitle(parsed: ParsedValuation): string {
  const location = [parsed.area, parsed.city].filter(Boolean).join(", ");
  const details = [
    parsed.type,
    parsed.beds ? (parsed.beds === "Studio" ? "Studio" : `${parsed.beds} BR`) : "",
    parsed.maids === "Yes" ? "maid's room" : parsed.maids === "No" ? "no maid's room" : "",
    parsed.size,
  ].filter(Boolean).join(" · ");

  return [location, details].filter(Boolean).join(" · ");
}

function buildSmartSuggestions(
  query: string,
  parsed: ParsedValuation,
  placesResults: PlacePrediction[],
): SmartSuggestion[] {
  const trimmedQuery = query.trim();
  if (trimmedQuery.length < 2) {
    return [];
  }

  const suggestions: SmartSuggestion[] = [];
  const seen = new Set<string>();

  if (hasSmartParsedValue(parsed)) {
    const title = parsed.unit || parsed.area || parsed.city || trimmedQuery;
    const subtitle = formatSmartSuggestionSubtitle(parsed) || "Apply the detected property details";
    const key = `${title.toLowerCase()}__${subtitle.toLowerCase()}`;

    seen.add(key);
    suggestions.push({
      id: `detected:${key}`,
      kind: "detected",
      parsed,
      subtitle,
      title,
    });
  }

  for (const place of placesResults) {
    const placeTitle = place.building || place.description.split(",")[0].trim();
    const placeCity = Object.prototype.hasOwnProperty.call(LOCATION_DATA, place.city) ? place.city : parsed.city;
    const placeParsed: ParsedValuation = {
      ...parsed,
      unit: placeTitle || parsed.unit,
      area: place.area || parsed.area,
      city: placeCity,
      type: parsed.type || inferTypeFromContext(placeTitle, place.area),
    };
    const subtitle = formatSmartSuggestionSubtitle(placeParsed) || place.description;
    const key = `${placeTitle.toLowerCase()}__${subtitle.toLowerCase()}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    suggestions.push({
      id: `place:${place.placeId}`,
      kind: "places",
      parsed: placeParsed,
      subtitle,
      title: placeTitle,
    });
  }

  return suggestions.slice(0, 6);
}

function countParsedSmartFields(parsed: ParsedValuation) {
  return SMART_FIELD_KEYS.filter((key) => typeof parsed[key] === "string" && parsed[key]!.trim().length > 0).length;
}

function areParsedValuationsEquivalent(left: ParsedValuation, right: ParsedValuation) {
  return SMART_FIELD_KEYS.every((key) => normalizeSmartComparableValue(left[key]) === normalizeSmartComparableValue(right[key]));
}

function shouldRequestAIValuationParse(
  query: string,
  parsed: ParsedValuation,
  candidates: SmartSuggestion[],
) {
  const trimmedQuery = query.trim();
  const queryTokens = getSearchTokens(trimmedQuery);
  if (trimmedQuery.length < 6 || queryTokens.length < 2) {
    return false;
  }

  const firstCandidate = candidates[0];
  const exactDetectedMatch = Boolean(
    firstCandidate &&
    firstCandidate.kind === "detected" &&
    parsed.unit &&
    firstCandidate.parsed.unit === parsed.unit &&
    trimmedQuery.toLowerCase().includes(parsed.unit.toLowerCase()) &&
    parsed.area &&
    parsed.city,
  );

  if (exactDetectedMatch && countParsedSmartFields(parsed) >= 4) {
    return false;
  }

  const missingCoreFields = !parsed.unit || !parsed.area || !parsed.type || !parsed.beds;
  const hasMultipleCandidates = candidates.length > 1;
  const hasComplexModifiers = /\b(with|without|near|vacant|tenanted|upgraded|furnished|unfurnished|view|floor|maid|staff|helper|service)\b/i.test(trimmedQuery);

  return missingCoreFields || hasMultipleCandidates || hasComplexModifiers || countParsedSmartFields(parsed) <= 2;
}

function normalizeAIValuationSuggestionPayload(value: any): AIValuationSuggestionPayload | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const parsedValue = value.parsed && typeof value.parsed === "object" ? value.parsed : {};
  const parsed: ParsedValuation = {
    unit: typeof parsedValue.unit === "string" ? parsedValue.unit.trim() : undefined,
    area: typeof parsedValue.area === "string" ? parsedValue.area.trim() : undefined,
    city: typeof parsedValue.city === "string" ? parsedValue.city.trim() : undefined,
    type: typeof parsedValue.type === "string" ? parsedValue.type.trim() : undefined,
    beds: typeof parsedValue.beds === "string" ? parsedValue.beds.trim() : undefined,
    maids: typeof parsedValue.maids === "string" ? parsedValue.maids.trim() : undefined,
    size: typeof parsedValue.size === "string" ? parsedValue.size.trim() : undefined,
  };

  if (!hasSmartParsedValue(parsed)) {
    return null;
  }

  const confidence = Number(value.confidence);
  return {
    ambiguities: Array.isArray(value.ambiguities)
      ? value.ambiguities.map((item: unknown) => String(item || "").trim()).filter(Boolean).slice(0, 4)
      : [],
    confidence: Number.isFinite(confidence) ? Math.max(0, Math.min(1, confidence)) : 0,
    needsConfirmation: Boolean(value.needsConfirmation),
    parsed,
    reasoning: typeof value.reasoning === "string" ? value.reasoning.trim() : "",
  };
}

function buildAISmartSuggestion(
  aiSuggestion: AIValuationSuggestionPayload | null,
  query: string,
): SmartSuggestion | null {
  if (!aiSuggestion || !hasSmartParsedValue(aiSuggestion.parsed)) {
    return null;
  }

  if (aiSuggestion.confidence < 0.68 && !aiSuggestion.needsConfirmation) {
    return null;
  }

  const title = aiSuggestion.parsed.unit || aiSuggestion.parsed.area || aiSuggestion.parsed.city || query.trim();
  const confidenceLabel = aiSuggestion.needsConfirmation
    ? "Review before applying"
    : aiSuggestion.confidence >= 0.9
      ? "High confidence"
      : `${Math.round(aiSuggestion.confidence * 100)}% confidence`;
  const subtitle = [formatSmartSuggestionSubtitle(aiSuggestion.parsed), confidenceLabel]
    .filter(Boolean)
    .join(" · ");

  return {
    confidence: aiSuggestion.confidence,
    id: `ai:${title.toLowerCase()}__${confidenceLabel.toLowerCase()}`,
    kind: "ai",
    needsConfirmation: aiSuggestion.needsConfirmation,
    parsed: aiSuggestion.parsed,
    reasoning: aiSuggestion.reasoning,
    subtitle,
    title,
  };
}

function mergeSmartSuggestions(
  localSuggestions: SmartSuggestion[],
  aiSuggestion: SmartSuggestion | null,
) {
  if (!aiSuggestion) {
    return localSuggestions;
  }

  const duplicateIndex = localSuggestions.findIndex((candidate) =>
    areParsedValuationsEquivalent(candidate.parsed, aiSuggestion.parsed),
  );

  if (duplicateIndex >= 0) {
    const duplicate = localSuggestions[duplicateIndex];
    const aiFieldCount = countParsedSmartFields(aiSuggestion.parsed);
    const duplicateFieldCount = countParsedSmartFields(duplicate.parsed);

    if (
      aiFieldCount > duplicateFieldCount ||
      (aiFieldCount === duplicateFieldCount && aiSuggestion.kind === "ai")
    ) {
      const withoutDuplicate = localSuggestions.filter((_, index) => index !== duplicateIndex);
      return [aiSuggestion, ...withoutDuplicate].slice(0, 6);
    }

    return localSuggestions;
  }

  if (aiSuggestion.confidence && aiSuggestion.confidence >= 0.85 && !aiSuggestion.needsConfirmation) {
    return [aiSuggestion, ...localSuggestions].slice(0, 6);
  }

  return [...localSuggestions, aiSuggestion].slice(0, 6);
}

function useValuationAISuggestion(
  query: string,
  parserResult: ParsedValuation,
  candidates: SmartSuggestion[],
) {
  const [suggestion, setSuggestion] = useState<SmartSuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const requestCandidates = candidates.slice(0, 5).map((candidate) => ({
    kind: candidate.kind,
    parsed: candidate.parsed,
    subtitle: candidate.subtitle,
    title: candidate.title,
  }));
  const requestKey = JSON.stringify({
    candidates: requestCandidates,
    parserResult,
    query,
  });

  useEffect(() => {
    if (!shouldRequestAIValuationParse(query, parserResult, candidates)) {
      setSuggestion(null);
      setLoading(false);
      return;
    }

    setSuggestion(null);
    setLoading(false);

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);

      try {
        const response = await fetch("/api/valuation/parse", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            candidates: requestCandidates,
            parserResult,
            query,
          }),
          signal: controller.signal,
        });

        const data = await response.json().catch(() => null);
        if (controller.signal.aborted) {
          return;
        }

        const nextSuggestion = buildAISmartSuggestion(normalizeAIValuationSuggestionPayload(data?.suggestion), query);
        setSuggestion(nextSuggestion);
      } catch {
        if (!controller.signal.aborted) {
          setSuggestion(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 700);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [requestKey]);

  return { loading, suggestion };
}

function normalizeSmartComparableValue(value: unknown) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function usePlacesSearch(query: string, enabled: boolean) {
  const [results, setResults] = useState<PlacePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled || query.trim().length < 2) { setResults([]); return; }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/places?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.predictions ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300); // debounce 300ms

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query, enabled]);

  return { results, loading };
}

// ─── SmartTag ────────────────────────────────────────────────────────────────

const SmartTag = ({ label, value }: { label: string; value: string }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#0B3D2E]/8 text-[#0B3D2E] border border-[#0B3D2E]/15">
    <span className="opacity-50 font-normal">{label}:</span>
    {value}
  </span>
);

const BedroomPicker = ({
  maids,
  onChange,
  onMaidsChange,
  value,
}: {
  maids: string;
  onChange: (value: string) => void;
  onMaidsChange: (value: string) => void;
  value: string;
}) => {
  const [open, setOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (pickerRef.current && !pickerRef.current.contains(target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleSelect = (nextValue: string) => {
    onChange(nextValue);
    setOpen(false);
  };

  const handleMaidsSelect = (nextValue: string) => {
    onMaidsChange(nextValue);
  };

  const triggerLabel = (() => {
    if (!value && !maids) {
      return "Select bedrooms";
    }

    const bedroomLabel =
      value === "Studio"
        ? "Studio"
        : value
          ? `${value} bed${value === "1" ? "" : "s"}`
          : "";

    const maidsLabel = maids === "Yes" ? "maid's room" : "";

    return [bedroomLabel, maidsLabel].filter(Boolean).join(" · ") || "Select bedrooms";
  })();

  return (
    <div className="relative" ref={pickerRef}>
      <button
        aria-expanded={open}
        aria-haspopup="dialog"
        className="flex h-12 w-full items-center justify-between gap-3 rounded-xl border border-input bg-background px-3 text-left text-sm text-foreground transition-colors hover:border-muted-foreground/30"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span className={`truncate ${value || maids ? "text-foreground" : "text-muted-foreground"}`}>
          {triggerLabel}
        </span>
        <svg
          aria-hidden="true"
          className={`h-4 w-4 flex-none text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 12 8"
        >
          <path
            d="M1 1.5 6 6.5l5-5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
          />
        </svg>
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-50 mt-2 w-full rounded-2xl border border-border bg-card p-3 shadow-[0_20px_40px_rgba(15,23,42,0.12)] sm:w-[min(380px,calc(100vw-2rem))] sm:max-w-[calc(100vw-2rem)] sm:p-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <span className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Bedrooms
              </span>
              <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
                {BEDROOM_OPTIONS.map((option) => {
                  const selected = value === option;
                  return (
                    <button
                      aria-pressed={selected}
                      className={`inline-flex min-w-0 items-center justify-center rounded-full border px-3 py-2 text-sm font-medium transition sm:min-w-[54px] sm:px-4 ${
                        selected
                          ? "border-[#0B3D2E] bg-[#0B3D2E] text-white shadow-[0_8px_18px_rgba(11,61,46,0.18)]"
                          : "border-border bg-background text-foreground hover:border-muted-foreground/30 hover:bg-muted/30"
                      }`}
                      key={option}
                      onClick={() => handleSelect(option)}
                      type="button"
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid gap-2 border-t border-border/60 pt-3">
              <span className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Maid&apos;s room
              </span>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                {MAIDS_OPTIONS.map((option) => {
                  const selected = maids === option;
                  return (
                    <button
                      aria-pressed={selected}
                      className={`inline-flex min-w-0 items-center justify-center rounded-full border px-3 py-2 text-sm font-medium transition sm:min-w-[64px] sm:px-4 ${
                        selected
                          ? "border-[#0B3D2E] bg-[#0B3D2E] text-white shadow-[0_8px_18px_rgba(11,61,46,0.18)]"
                          : "border-border bg-background text-foreground hover:border-muted-foreground/30 hover:bg-muted/30"
                      }`}
                      key={option}
                      onClick={() => handleMaidsSelect(option)}
                      type="button"
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const SizePicker = ({
  onChange,
  value,
}: {
  onChange: (value: string) => void;
  value: string;
}) => {
  const [open, setOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const parsedValue = parseSizeValue(value);
  const normalizedValue = normalizeSizeOptionValue(parsedValue.amount);
  const [selectedUnit, setSelectedUnit] = useState(parsedValue.unit);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (pickerRef.current && !pickerRef.current.contains(target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!value) {
      return;
    }

    setSelectedUnit(parseSizeValue(value).unit);
  }, [value]);

  const handleSelect = (option: number) => {
    onChange(formatSizeValue(option.toLocaleString("en-US"), selectedUnit));
    setOpen(false);
  };

  const handleUnitChange = (nextUnit: string) => {
    setSelectedUnit(nextUnit);
    onChange(formatSizeValue(parsedValue.amount, nextUnit));
  };

  return (
    <div className="relative" ref={pickerRef}>
      <button
        aria-expanded={open}
        aria-haspopup="dialog"
        className="flex h-12 w-full items-center justify-between gap-3 rounded-xl border border-input bg-background px-3 text-left text-sm text-foreground transition-colors hover:border-muted-foreground/30"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span className={`truncate ${value ? "text-foreground" : "text-muted-foreground"}`}>
          {value || "Select or enter size"}
        </span>
        <svg
          aria-hidden="true"
          className={`h-4 w-4 flex-none text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 12 8"
        >
          <path
            d="M1 1.5 6 6.5l5-5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
          />
        </svg>
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-50 mt-2 w-full rounded-2xl border border-border bg-card p-3 shadow-[0_20px_40px_rgba(15,23,42,0.12)] sm:w-[min(380px,calc(100vw-2rem))] sm:max-w-[calc(100vw-2rem)] sm:p-4">
          <div className="grid gap-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_112px]">
              <div className="relative">
                <Ruler className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  autoFocus
                  className="h-11 bg-background pl-10"
                  onChange={(event) => onChange(formatSizeValue(event.target.value, selectedUnit))}
                  placeholder="Type any size"
                  value={parsedValue.amount}
                />
              </div>
              <div>
                <div className="relative">
                  <select
                    className="h-11 w-full appearance-none rounded-xl border border-input bg-background px-3 pr-9 text-sm text-foreground outline-none transition-colors hover:border-muted-foreground/30 focus:border-[#0B3D2E]/40"
                    onChange={(event) => handleUnitChange(event.target.value)}
                    value={selectedUnit}
                  >
                    {SIZE_UNIT_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <svg
                    aria-hidden="true"
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 12 8"
                  >
                    <path
                      d="M1 1.5 6 6.5l5-5"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.75"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <span className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Presets
              </span>
              <div className="grid max-h-[216px] grid-cols-2 gap-2 overflow-y-auto pr-1 sm:flex sm:flex-wrap">
                {SIZE_OPTIONS.map((option) => {
                  const selected = normalizedValue === String(option);
                  return (
                    <button
                      aria-pressed={selected}
                      className={`inline-flex items-center justify-center rounded-full border px-3.5 py-2 text-sm font-medium transition ${
                        selected
                          ? "border-[#0B3D2E] bg-[#0B3D2E] text-white shadow-[0_8px_18px_rgba(11,61,46,0.18)]"
                          : "border-border bg-background text-foreground hover:border-muted-foreground/30 hover:bg-muted/30"
                      }`}
                      key={option}
                      onClick={() => handleSelect(option)}
                      type="button"
                    >
                      {option.toLocaleString("en-US")}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

function formatSizeValue(amount: string, unit = DEFAULT_SIZE_UNIT): string {
  const normalizedAmount = stripSizeUnit(amount).trim();
  if (!normalizedAmount) {
    return "";
  }

  return `${normalizedAmount} ${unit}`;
}

function normalizeSizeOptionValue(value: string): string {
  return stripSizeUnit(value)
    .toLowerCase()
    .replace(/,/g, "")
    .trim();
}

function parseSizeValue(value: string): { amount: string; unit: string } {
  const rawValue = String(value || "").trim();
  if (!rawValue) {
    return { amount: "", unit: DEFAULT_SIZE_UNIT };
  }

  const normalizedValue = rawValue.toLowerCase();
  if (/\s*(sqm|sq m|m2)$/u.test(normalizedValue)) {
    return {
      amount: rawValue.replace(/\s*(sqm|sq m|m2)$/iu, "").trim(),
      unit: "sqm",
    };
  }

  if (/\s*(sq\.?\s*ft|sqft|sf)$/u.test(normalizedValue)) {
    return {
      amount: rawValue.replace(/\s*(sq\.?\s*ft|sqft|sf)$/iu, "").trim(),
      unit: "sq ft",
    };
  }

  return { amount: rawValue, unit: DEFAULT_SIZE_UNIT };
}

function stripSizeUnit(value: string): string {
  return String(value || "")
    .replace(/\s*(sq\.?\s*ft|sqft|sf|sqm|sq m|m2)$/iu, "")
    .trim();
}

// ─── GateCard ─────────────────────────────────────────────────────────────────

const GateCard = ({
  gate, gateErrors, gateSubmitting, highlight = false, onChange, onUnlock,
}: {
  gate: GateData;
  gateErrors: GateErrors;
  gateSubmitting: boolean;
  highlight?: boolean;
  onChange: (field: keyof GateData, val: string) => void;
  onUnlock: () => void;
}) => (
  <div className="mb-8">
    {/* Unlock card */}
    <div className={`relative overflow-hidden rounded-2xl border-2 bg-card p-5 shadow-lg transition-all duration-500 sm:p-8 ${
      highlight
        ? "border-[#D4A847]/55 shadow-[0_18px_44px_rgba(212,168,71,0.18)] ring-4 ring-[#D4A847]/10"
        : "border-[#0B3D2E]/20"
    }`}>
      {/* Gold top line */}
      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: "linear-gradient(90deg, transparent, #D4A847, #B8922F, #D4A847, transparent)" }} />

      <div className="mb-2 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0B3D2E] to-[#1A7A5A] flex items-center justify-center shadow-md flex-shrink-0">
          <Lock className="h-4.5 w-4.5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-foreground text-lg leading-tight">Unlock the full report</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Comparables, market read, and strategy — free</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
        Enter your name and a contact to reveal the exact figures and get the full report.
        No spam — just one call or message if you want it.
      </p>

      <div className="grid sm:grid-cols-3 gap-4 mb-4">
        {/* Name */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 flex items-center gap-1">
            Name
            <span className="text-[9px] bg-gradient-to-r from-[#D4A847] to-[#B8922F] text-white px-1.5 py-0.5 rounded-full font-bold">Required</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={gate.name} onChange={(e) => onChange("name", e.target.value)}
              placeholder="Your name" autoComplete="name"
              className={`w-full pl-10 h-12 bg-background rounded-xl border px-3 text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 ${
                gateErrors.name ? "border-destructive" : "border-border focus:border-[#0B3D2E]/40"
              }`} />
          </div>
          {gateErrors.name && (
            <p className="text-xs text-destructive mt-1 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 flex-shrink-0" />{gateErrors.name}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 flex items-center gap-1">
            Phone
            <span className="text-[9px] text-muted-foreground/60 font-normal normal-case tracking-normal">or email</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={gate.phone} onChange={(e) => onChange("phone", e.target.value)}
              placeholder="+971 50 000 0000" autoComplete="tel"
              className={`w-full pl-10 h-12 bg-background rounded-xl border px-3 text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 ${
                gateErrors.contact ? "border-destructive" : "border-border focus:border-[#0B3D2E]/40"
              }`} />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 flex items-center gap-1">
            Email
            <span className="text-[9px] text-muted-foreground/60 font-normal normal-case tracking-normal">or phone</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={gate.email} onChange={(e) => onChange("email", e.target.value)}
              placeholder="owner@example.com" type="email" autoComplete="email"
              className={`w-full pl-10 h-12 bg-background rounded-xl border px-3 text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 ${
                gateErrors.contact ? "border-destructive" : "border-border focus:border-[#0B3D2E]/40"
              }`} />
          </div>
        </div>
      </div>

      {gateErrors.contact && (
        <p className="text-xs text-destructive mb-4 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3 flex-shrink-0" />{gateErrors.contact}
        </p>
      )}

      <button onClick={onUnlock} disabled={gateSubmitting}
        className="inline-flex w-full items-center justify-center gap-2.5 rounded-full px-8 py-4 font-bold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] disabled:cursor-wait disabled:opacity-70 sm:w-auto"
        style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)", boxShadow: "0 4px 20px rgba(11,61,46,0.3)" }}>
        {gateSubmitting ? (
          <><RefreshCw className="h-4 w-4 animate-spin" /> Unlocking…</>
        ) : (
          <><Unlock className="h-4 w-4" /> See full report</>
        )}
      </button>
    </div>
  </div>
);

const HiddenRangeValue = ({ currency = "AED" }: { currency?: string }) => {
  return (
    <div className="max-w-full text-white">
      <span className="inline-block max-w-full text-2xl font-bold tracking-[0.02em] text-white/95 blur-[3px] sm:text-3xl">
        {currency} range available after unlock
      </span>
    </div>
  );
};

const MaskedInlineRange = ({ currency = "AED" }: { currency?: string }) => {
  return (
    <span className="inline-flex max-w-full items-baseline gap-2 text-foreground">
      <span className="text-base font-semibold tracking-[0.08em] text-foreground">
        {currency}
      </span>
      <span className="inline-block text-xl font-semibold tracking-[-0.04em] text-foreground/70 blur-[1.5px] select-none">
        range available after unlock
      </span>
    </span>
  );
};

const MaskedComparablePrice = ({ currency = "AED" }: { currency?: string }) => {
  return (
    <span className="inline-flex items-baseline gap-2 text-foreground">
      <span className="text-[0.98rem] font-semibold tracking-[0.08em] text-foreground">
        {currency}
      </span>
      <span className="inline-block text-[1.02rem] font-semibold tracking-[0.02em] text-foreground/68 blur-[1.55px] select-none">
        price available after unlock
      </span>
    </span>
  );
};

async function loadTurnstileScript() {
  if (typeof window === "undefined") {
    throw new Error("Security verification is not available in this browser.");
  }

  if (window.turnstile) {
    return window.turnstile;
  }

  if (!turnstileScriptPromise) {
    turnstileScriptPromise = new Promise<TurnstileApi>((resolve, reject) => {
      const resolveTurnstile = () => {
        if (window.turnstile) {
          resolve(window.turnstile);
          return;
        }

        reject(new Error("Security verification could not load. Please try again."));
      };

      const existingScript = document.querySelector(`script[src="${turnstileScriptUrl}"]`) as HTMLScriptElement | null;
      if (existingScript) {
        existingScript.addEventListener("load", resolveTurnstile, { once: true });
        existingScript.addEventListener(
          "error",
          () => reject(new Error("Security verification could not load. Please try again.")),
          { once: true },
        );
        return;
      }

      const script = document.createElement("script");
      script.src = turnstileScriptUrl;
      script.async = true;
      script.defer = true;
      script.onload = resolveTurnstile;
      script.onerror = () =>
        reject(new Error("Security verification could not load. Please try again."));
      document.head.appendChild(script);
    }).catch((error) => {
      turnstileScriptPromise = null;
      throw error;
    });
  }

  return await turnstileScriptPromise;
}

// ─── PriceBar ─────────────────────────────────────────────────────────────────

const PriceBar = ({
  label, low, high, min, max, rangePreview, color, currency = "AED", blurred = false, textOverride, maskedPreview = false, fixedWidthPct = 18,
}: {
  label: string;
  low: number | null;
  high: number | null;
  min: number | null;
  max: number | null;
  rangePreview?: PreviewRange;
  color: string;
  currency?: string;
  blurred?: boolean;
  textOverride?: string;
  maskedPreview?: boolean;
  fixedWidthPct?: number | null;
}) => {
  const range = (max ?? 0) - (min ?? 0) || 1;
  const startValue = Math.min(low ?? min ?? 0, high ?? low ?? 0);
  const endValue = Math.max(high ?? low ?? max ?? 0, low ?? min ?? 0);
  const previewStartPct = rangePreview
    ? rangePreview.startPercent
    : null;
  const previewWidthPct = rangePreview
    ? rangePreview.widthPercent
    : null;
  const naturalStartPct =
    previewStartPct !== null
      ? previewStartPct
      : ((startValue - (min ?? 0)) / range) * 100;
  const naturalWidthPct =
    previewWidthPct !== null
      ? previewWidthPct
      : ((endValue - startValue) / range) * 100;
  const clampedStartPct = Math.min(Math.max(naturalStartPct, 0), 100);
  const fixedWidthEnabled = Number.isFinite(fixedWidthPct as number) && (fixedWidthPct as number) > 0;
  const safeWidthPct = fixedWidthEnabled
    ? Math.min(Math.max(fixedWidthPct as number, 0), 100)
    : Math.min(Math.max(naturalWidthPct, 0), 100 - clampedStartPct);
  const leftPct = Math.min(clampedStartPct, 100 - safeWidthPct);
  const widthPct = Math.min(safeWidthPct, 100 - leftPct);
  const text = textOverride || `${fmt(low, currency)} – ${fmt(high, currency)}`;
  const valueClass =
    "text-sm leading-snug text-muted-foreground transition-all duration-500 select-none sm:justify-self-start sm:text-left sm:whitespace-nowrap";
  const valueMarkup = maskedPreview ? (
    <span className={valueClass}>
      <span>{currency}</span>
      <span className="ml-2 inline-block blur-[1.6px] text-foreground/70">range available after unlock</span>
    </span>
  ) : (
    <span className={`${valueClass} ${blurred ? "blur-md" : ""}`}>
      {text}
    </span>
  );

  return (
    <div className="grid gap-2 sm:contents">
      <div className="flex items-center justify-between gap-3 sm:block">
        <span className="text-sm font-medium sm:pr-4">{label}</span>
        <div className="text-right sm:hidden">
          {valueMarkup}
        </div>
      </div>
      <div className="h-3 min-w-0 bg-muted rounded-full relative overflow-hidden">
        <div className="h-3 rounded-full absolute top-0"
          style={{ left: `${leftPct}%`, width: `${widthPct}%`, backgroundColor: color }} />
      </div>
      <div className="hidden sm:block">
        {valueMarkup}
      </div>
    </div>
  );
};

export default ValuationPage;
