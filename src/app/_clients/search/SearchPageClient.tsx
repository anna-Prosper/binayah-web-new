/* eslint-disable i18next/no-literal-string -- search client uses many industry terms and status values */
"use client";

import { apiUrl, proxyUrl } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { CardActions } from "@/components/PropertyActions";
import { useCurrency } from "@/context/CurrencyContext";
import PropertyComparison from "@/components/PropertyComparison";
import { motion } from "framer-motion";
import { ArrowRight, Bath, BedDouble, Building, Building2, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Loader2, MapPin, Maximize, Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import CardImageCarousel from "@/components/CardImageCarousel";
import SearchAutocomplete from "@/components/SearchAutocomplete";
import MultiSelectFilter from "@/components/MultiSelectFilter";
import PriceRangeFilter from "@/components/PriceRangeFilter";
import PriceFilter from "@/components/PriceFilter";
import DeveloperFilter from "@/components/DeveloperFilter";
import FilterSheet from "@/components/FilterSheet";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  formatPropertyTypeLabel,
  homeSearchPropertyTypeOptions,
  normalizePropertyType,
} from "@/lib/property-types";

type SearchIntent = "" | "buy" | "rent" | "off-plan";
type SearchStatus = "All" | "Off-Plan" | "Secondary";
type SortKey = "newest" | "price_asc" | "price_desc" | "featured" | "ppsf_asc" | "ppsf_desc";
const VALID_SORTS: ReadonlySet<SortKey> = new Set(["newest", "price_asc", "price_desc", "featured", "ppsf_asc", "ppsf_desc"]);

interface Project {
  _id: string;
  community?: string;
  completionDate?: string;
  developerName?: string;
  featuredImage?: string;
  imageGallery?: string[];
  name: string;
  propertyType?: string;
  slug: string;
  startingPrice?: number;
  currency?: string;
  status?: string;
}

interface Listing {
  _id: string;
  title: string;
  slug: string;
  listingType?: string;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  size?: number;
  sizeUnit?: string;
  plotArea?: number;
  price?: number;
  priceUsd?: number;
  currency?: string;
  community?: string;
  city?: string;
  country?: string;
  featuredImage?: string;
  images?: string[];
  flags?: { featured?: boolean; offplan?: boolean; exclusive?: boolean };
  offplan?: string | number;  // 1 or "1" = off-plan
  completionStatus?: string;  // "off_plan" | "completed_property"
  agentName?: string;
  whatsappNumber?: string;
  _source?: string;
}

interface InitialSearchData {
  projects: Project[];
  listings: Listing[];
  projectCount: number;
  listingCount: number;
  projectTotalPages?: number;
  listingTotalPages?: number;
  facets?: { community: unknown[]; propertyType: unknown[]; bedrooms: unknown[] };
}

const statusTabs: SearchStatus[] = ["All", "Off-Plan", "Secondary"];
const secondaryModes: Array<{ value: SearchIntent }> = [
  { value: "" },
  { value: "buy" },
  { value: "rent" },
];
const PAGE_SIZE = 24;
const propertyTypes = homeSearchPropertyTypeOptions;
const locationOptions = ["Downtown Dubai", "Dubai Marina", "Palm Jumeirah", "JBR", "Business Bay", "DIFC", "JVC / JVT", "Dubai Hills Estate", "Creek Harbour", "MBR City", "Arabian Ranches", "Dubai South", "Al Barari", "Jumeirah"];
const bedrooms = ["Studio", "1", "2", "3", "4", "5", "6", "7+"];
const bathrooms = ["1", "2", "3", "4", "5", "6", "7+"];

// Furnishing values must match what the API accepts (case-insensitive
// regex on listing.furnishing). Labels are localised at render time.
const FURNISHING_VALUES = ["furnished", "unfurnished", "partial"] as const;

// Handover year — current year through current year + 5. Generated at
// module load; the dashboard typically loads fresh per nav so a stale
// generation isn't a concern.
const completionYears: string[] = (() => {
  const now = new Date().getUTCFullYear();
  return Array.from({ length: 6 }, (_, i) => String(now + i));
})();

function toFacetMap(rows: unknown): Record<string, number> {
  if (!Array.isArray(rows)) return {};
  const out: Record<string, number> = {};
  for (const row of rows as Array<{ value?: unknown; count?: unknown }>) {
    if (row && row.value != null) out[String(row.value)] = Number(row.count) || 0;
  }
  return out;
}

const PRICE_BOUNDS = {
  buy: { min: 0, max: 100_000_000, step: 50_000 },
  rent: { min: 0, max: 1_000_000, step: 5_000 },
} as const;

function formatPrice(price?: number, currency = "AED", fallback = "Price on request") {
  if (!price) return fallback;
  return `${currency} ${Math.round(price).toLocaleString()}`;
}

function normalizeStatus(status: string | null, intent: SearchIntent): SearchStatus {
  if (status === "Off-Plan" || intent === "off-plan") return "Off-Plan";
  if (status === "Secondary") return "Secondary";
  // All tab is authoritative — intent (buy/rent) only filters secondary sub-mode
  return "All";
}

function SearchContent({ defaultStatus, defaultIntent, defaultType, defaultLocations, syncUrl = true, sidebarSlot, initialData }: { defaultStatus?: SearchStatus; defaultIntent?: SearchIntent; defaultType?: string; defaultLocations?: string[]; syncUrl?: boolean; sidebarSlot?: ReactNode; initialData?: InitialSearchData | null } = {}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = searchParams ?? new URLSearchParams();
  const initialIntent = (params.get("intent") as SearchIntent) || defaultIntent || "";

  const [status, setStatus] = useState<SearchStatus>(normalizeStatus(params.get("status") || defaultStatus || null, initialIntent));
  const [intent, setIntent] = useState<SearchIntent>(initialIntent);

  // Sync filters when URL params change (e.g. nav links between Buy/Rent/Off-Plan/type/area)
  useEffect(() => {
    const urlIntent = (params.get("intent") as SearchIntent) || "";
    const urlStatus = params.get("status");
    const urlType = String(normalizePropertyType(params.get("type") || defaultType || "", ""));
    const urlLocs = (params.get("locations") || params.get("location") || "").split(",").map(s => s.trim()).filter(Boolean);
    setIntent(urlIntent || (defaultIntent ?? "") as SearchIntent);
    setStatus(normalizeStatus(urlStatus, urlIntent || defaultIntent || ""));
    setType(urlType);
    setSelectedLocations(urlLocs.length ? urlLocs : (defaultLocations ?? []));
  }, [searchParams]);
  const [type, setType] = useState(() => String(normalizePropertyType(params.get("type") || defaultType || "", "")));
  const initialLocations = (() => {
    const raw = params.get("locations") || params.get("location") || "";
    const fromUrl = raw.split(",").map((s) => s.trim()).filter(Boolean);
    return fromUrl.length ? fromUrl : (defaultLocations ?? []);
  })();
  const [selectedLocations, setSelectedLocations] = useState<string[]>(initialLocations);
  const [beds, setBeds] = useState(params.get("bedrooms") || "");
  const [baths, setBaths] = useState(params.get("bathrooms") || "");
  const [priceMin, setPriceMin] = useState<number | null>(() => {
    const raw = params.get("budgetMin");
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? n : null;
  });
  const [priceMax, setPriceMax] = useState<number | null>(() => {
    const raw = params.get("budgetMax");
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? n : null;
  });
  const [developer, setDeveloper] = useState(params.get("developer") || "");
  const [furnishing, setFurnishing] = useState(params.get("furnishing") || "");
  const [completionYear, setCompletionYear] = useState(params.get("completionYear") || "");
  const [q, setQ] = useState(params.get("q") || "");
  const initialSort = (params.get("sort") as SortKey) || "newest";
  const [sort, setSort] = useState<SortKey>(VALID_SORTS.has(initialSort) ? initialSort : "newest");

  // Developer dropdown options, loaded once from the DB.
  const [developerOptions, setDeveloperOptions] = useState<string[]>([]);
  useEffect(() => {
    let active = true;
    fetch(apiUrl("/api/developers?limit=1000"))
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (!active) return;
        const list = Array.isArray(data) ? data : (data.developers ?? data.data ?? []);
        const names = Array.from(new Set(list.map((d: any) => d?.name).filter(Boolean))).sort((a, b) =>
          (a as string).localeCompare(b as string)
        );
        setDeveloperOptions(names as string[]);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const t = useTranslations("search");
  const tEnum = useTranslations("enums");
  const { format: fmtCurrency } = useCurrency();
  const localizedPropertyTypes = [
    { value: "Apartment", label: t("typeApartment") },
    { value: "Villa", label: t("typeVilla") },
    { value: "Commercial", label: t("typeCommercial") },
    { value: "Plot", label: t("typePlot") },
  ];
  const furnishingOptions = FURNISHING_VALUES.map((v) => ({
    value: v,
    label: v === "furnished" ? t("furnishingFurnished")
      : v === "unfurnished" ? t("furnishingUnfurnished")
      : t("furnishingPartial"),
  }));
  const initialProjectsPage = (() => { const n = parseInt(params.get("projectsPage") || params.get("page") || "1", 10); return Number.isFinite(n) && n >= 1 ? n : 1; })();
  const initialListingsPage = (() => { const n = parseInt(params.get("listingsPage") || params.get("page") || "1", 10); return Number.isFinite(n) && n >= 1 ? n : 1; })();
  const [projectsPage, setProjectsPage] = useState(initialProjectsPage);
  const [listingsPage, setListingsPage] = useState(initialListingsPage);
  const [projectTotalPages, setProjectTotalPages] = useState(initialData?.projectTotalPages ?? 1);
  const [listingTotalPages, setListingTotalPages] = useState(initialData?.listingTotalPages ?? 1);
  const [facets, setFacets] = useState<{ community: Record<string, number>; propertyType: Record<string, number>; bedrooms: Record<string, number> }>(() =>
    !initialData?.facets
      ? { community: {}, propertyType: {}, bedrooms: {} }
      : { community: toFacetMap(initialData.facets.community), propertyType: toFacetMap(initialData.facets.propertyType), bedrooms: toFacetMap(initialData.facets.bedrooms) }
  );
  const [projects, setProjects] = useState<Project[]>(initialData?.projects ?? []);
  const [listings, setListings] = useState<Listing[]>(initialData?.listings ?? []);
  const [projectCount, setProjectCount] = useState(initialData?.projectCount ?? 0);
  const [listingCount, setListingCount] = useState(initialData?.listingCount ?? 0);
  const [loading, setLoading] = useState(!initialData);
  const projectsSectionRef = useRef<HTMLDivElement | null>(null);
  const listingsSectionRef = useRef<HTMLDivElement | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [communityInfo, setCommunityInfo] = useState<{ name: string; slug: string; heroImage?: string; description?: string } | null>(null);
  const [communityLoading, setCommunityLoading] = useState(false);
  const [dldBuilding, setDldBuilding] = useState<{ name: string; area: string; areaSlug: string } | null>(null);
  const [relaxed, setRelaxed] = useState<{ field: string; from: string; to: string } | null>(null);

  const priceBounds = intent === "rent" ? PRICE_BOUNDS.rent : PRICE_BOUNDS.buy;
  const locationsKey = selectedLocations.join("|");

  // The DB's bedroom value for "Studio" is 0; our UI option string is "Studio".
  // The "7+" UI bucket aggregates everything >= 7.
  const bedroomCounts: Record<string, number> = (() => {
    const map: Record<string, number> = {};
    let sevenPlus = 0;
    for (const [k, v] of Object.entries(facets.bedrooms)) {
      const n = Number(k);
      if (!Number.isFinite(n)) continue;
      if (n === 0) map["Studio"] = v;
      else if (n >= 7) sevenPlus += v;
      else map[String(n)] = v;
    }
    if (sevenPlus > 0) map["7+"] = sevenPlus;
    return map;
  })();

  // Coerce intent to be compatible with the selected status tab.
  // Run only when status changes so we don't loop (intent change → effect → intent change).
  useEffect(() => {
    if (status === "Off-Plan") { if (intent !== "off-plan") setIntent("off-plan"); }
    else if (status === "Secondary") { if (intent === "off-plan") setIntent("buy"); }
    else if (status === "All") { if (intent === "off-plan") setIntent(""); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const skipInitialFetch = useRef(!!initialData);

  // Reset pagination whenever a filter changes (skip first render so URL-seeded pages survive).
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setProjectsPage(1);
    setListingsPage(1);
  }, [status, intent, type, locationsKey, beds, baths, priceMin, priceMax, developer, furnishing, completionYear, q, sort]);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status !== "All") params.set("status", status);
    if (intent) params.set("intent", intent);
    if (type) params.set("type", String(normalizePropertyType(type, type)));
    if (selectedLocations.length > 0) params.set("locations", selectedLocations.join(","));
    if (beds) params.set("bedrooms", beds);
    if (baths) params.set("bathrooms", baths);
    if (priceMin != null) params.set("budgetMin", String(priceMin));
    if (priceMax != null) params.set("budgetMax", String(priceMax));
    if (developer) params.set("developer", developer);
    if (furnishing) params.set("furnishing", furnishing);
    if (completionYear) params.set("completionYear", completionYear);
    if (q) params.set("q", q);
    if (sort && sort !== "newest") params.set("sort", sort);
    params.set("pageSize", String(PAGE_SIZE));
    if (projectsPage > 1) params.set("projectsPage", String(projectsPage));
    if (listingsPage > 1) params.set("listingsPage", String(listingsPage));

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25_000); // 25s, covers Render cold-start wake-up (~15s)
      const response = await fetch(apiUrl(`/api/search?${params.toString()}`), { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error("Search failed");
      const data = await response.json();
      setProjects(data.projects || []);
      setListings(data.listings || []);
      setProjectCount(data.projectCount || 0);
      setListingCount(data.listingCount || 0);
      setRelaxed(data.relaxed ?? null);
      setProjectTotalPages(Math.max(1, Number(data.projectTotalPages) || 1));
      setListingTotalPages(Math.max(1, Number(data.listingTotalPages) || 1));
      const incoming = data.facets || {};
      setFacets({
        community: toFacetMap(incoming.community),
        propertyType: toFacetMap(incoming.propertyType),
        bedrooms: toFacetMap(incoming.bedrooms),
      });
    } catch (error) {
      console.warn("Search error:", error);
    } finally {
      setLoading(false);
    }
  }, [baths, beds, completionYear, developer, furnishing, intent, listingsPage, locationsKey, priceMax, priceMin, projectsPage, q, sort, status, type]);

  useEffect(() => {
    if (skipInitialFetch.current) { skipInitialFetch.current = false; return; }
    const t = setTimeout(fetchResults, 50);
    return () => clearTimeout(t);
  }, [fetchResults]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (status !== "All") params.set("status", status);
    if (intent) params.set("intent", intent);
    if (type) params.set("type", String(normalizePropertyType(type, type)));
    if (selectedLocations.length > 0) params.set("locations", selectedLocations.join(","));
    if (beds) params.set("bedrooms", beds);
    if (baths) params.set("bathrooms", baths);
    if (priceMin != null) params.set("budgetMin", String(priceMin));
    if (priceMax != null) params.set("budgetMax", String(priceMax));
    if (developer) params.set("developer", developer);
    if (furnishing) params.set("furnishing", furnishing);
    if (completionYear) params.set("completionYear", completionYear);
    if (q) params.set("q", q);
    if (sort && sort !== "newest") params.set("sort", sort);
    if (projectsPage > 1) params.set("projectsPage", String(projectsPage));
    if (listingsPage > 1) params.set("listingsPage", String(listingsPage));
    const query = params.toString();
    if (syncUrl) router.replace(`/search${query ? `?${query}` : ""}`, { scroll: false });
  }, [baths, beds, completionYear, developer, furnishing, intent, listingsPage, locationsKey, priceMax, priceMin, projectsPage, q, router, selectedLocations, sort, status, syncUrl, type]);

  const clearFilters = () => {
    setStatus("All");
    setIntent("");
    setType("");
    setSelectedLocations([]);
    setBeds("");
    setBaths("");
    setPriceMin(null);
    setPriceMax(null);
    setDeveloper("");
    setFurnishing("");
    setCompletionYear("");
    setQ("");
    setSort("newest");
    setProjectsPage(1);
    setListingsPage(1);
  };

  const goToProjectsPage = (next: number) => {
    const clamped = Math.max(1, Math.min(projectTotalPages, next));
    if (syncUrl && status === "All") {
      // In "All" mode on the standalone search page, navigate to a dedicated
      // Off-Plan page so the user sees only projects (not the split view).
      const p = new URLSearchParams();
      p.set("status", "Off-Plan");
      if (type) p.set("type", String(normalizePropertyType(type, type)));
      if (selectedLocations.length > 0) p.set("locations", selectedLocations.join(","));
      if (beds) p.set("bedrooms", beds);
      if (baths) p.set("bathrooms", baths);
      if (priceMin != null) p.set("budgetMin", String(priceMin));
      if (priceMax != null) p.set("budgetMax", String(priceMax));
      if (developer) p.set("developer", developer);
      if (completionYear) p.set("completionYear", completionYear);
      if (q) p.set("q", q);
      if (sort && sort !== "newest") p.set("sort", sort);
      if (clamped > 1) p.set("projectsPage", String(clamped));
      router.push(`/search?${p.toString()}`);
      return;
    }
    setProjectsPage(clamped);
    projectsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const goToListingsPage = (next: number) => {
    const clamped = Math.max(1, Math.min(listingTotalPages, next));
    if (syncUrl && status === "All") {
      // In "All" mode on the standalone search page, navigate to a dedicated
      // Secondary page so the user sees only listings (not the split view).
      const p = new URLSearchParams();
      p.set("status", "Secondary");
      if (intent && intent !== "off-plan") p.set("intent", intent);
      if (type) p.set("type", String(normalizePropertyType(type, type)));
      if (selectedLocations.length > 0) p.set("locations", selectedLocations.join(","));
      if (beds) p.set("bedrooms", beds);
      if (baths) p.set("bathrooms", baths);
      if (priceMin != null) p.set("budgetMin", String(priceMin));
      if (priceMax != null) p.set("budgetMax", String(priceMax));
      if (developer) p.set("developer", developer);
      if (furnishing) p.set("furnishing", furnishing);
      if (completionYear) p.set("completionYear", completionYear);
      if (q) p.set("q", q);
      if (sort && sort !== "newest") p.set("sort", sort);
      if (clamped > 1) p.set("listingsPage", String(clamped));
      router.push(`/search?${p.toString()}`);
      return;
    }
    setListingsPage(clamped);
    listingsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const priceChip = (() => {
    if (priceMin == null && priceMax == null) return "";
    const fmt = (n: number) => Math.round(n).toLocaleString();
    if (priceMin != null && priceMax != null) return `AED ${fmt(priceMin)}-${fmt(priceMax)}`;
    if (priceMin != null) return `AED ${fmt(priceMin)}+`;
    return `Up to AED ${fmt(priceMax!)}`;
  })();
  const furnishingChip = furnishing === "furnished" ? t("furnishingFurnished")
    : furnishing === "unfurnished" ? t("furnishingUnfurnished")
    : furnishing === "partial" ? t("furnishingPartial")
    : "";
  const typeLabels: Record<string, string> = {
    Apartment: t("typeApartment"),
    "Villa / Townhouse": t("typeVilla"),
    Commercial: t("typeCommercial"),
    Plot: t("typePlot"),
  };
  const activeFilters = [
    status !== "All" ? status : "",
    intent === "buy" ? t("forSale") : intent === "rent" ? t("forRent") : "",
    type ? (typeLabels[formatPropertyTypeLabel(type, type)] ?? formatPropertyTypeLabel(type, type)) : "",
    ...selectedLocations,
    beds ? `${beds} bed` : "",
    baths ? `${baths} bath` : "",
    priceChip,
    developer,
    furnishingChip,
    completionYear ? `${t("handoverYear")}: ${completionYear}` : "",
  ].filter(Boolean);
  const totalResults = projectCount + listingCount;

  useEffect(() => {
    if (!loading && totalResults === 0 && q.trim().length >= 3) {
      setCommunityInfo(null);
      setDldBuilding(null);
      setCommunityLoading(true);
      fetch(`/api/community-info?q=${encodeURIComponent(q.trim())}`)
        .then((r) => r.ok ? r.json() : null)
        .then(async (data) => {
          if (data?.exists && data?.data?.name && data?.data?.slug) {
            setCommunityInfo({ name: data.data.name, slug: data.data.slug, heroImage: data.data.heroImage, description: data.data.description });
            setDldBuilding(null);
          } else {
            setCommunityInfo(null);
            // Fallback: try DLD buildings search
            try {
              const bRes = await fetch(proxyUrl(`/api/dld/buildings?q=${encodeURIComponent(q.trim())}&limit=1`));
              if (bRes.ok) {
                const bData = await bRes.json() as { results?: Array<{ name: string; area: string; slug: string }> };
                const hit = bData.results?.[0];
                if (hit?.name && hit?.area) {
                  // Convert area name to slug: lowercase, spaces to dashes
                  const areaSlug = hit.area.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
                  setDldBuilding({ name: hit.name, area: hit.area, areaSlug });
                } else {
                  setDldBuilding(null);
                }
              } else {
                setDldBuilding(null);
              }
            } catch {
              setDldBuilding(null);
            }
          }
        })
        .catch(() => {
          setCommunityInfo(null);
          setDldBuilding(null);
        })
        .finally(() => setCommunityLoading(false));
    } else {
      setCommunityInfo(null);
      setDldBuilding(null);
      setCommunityLoading(false);
    }
  }, [loading, totalResults, q]);

  return (
    <div className={syncUrl ? "min-h-screen bg-background" : "bg-background"}>
      {syncUrl && <Navbar />}

      <section className={`${syncUrl ? "pt-24" : "pt-5"} pb-5 bg-background border-b border-border/60`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          {/* Search bar + mobile filter trigger */}
          <div className="flex gap-3 mb-5">
            <SearchAutocomplete
              value={q}
              onChange={setQ}
              onSubmit={() => fetchResults()}
              placeholder={t("title")}
              tab={status === "Off-Plan" ? "Off-Plan" : intent === "rent" ? "Rent" : intent === "buy" ? "Buy" : "All"}
            />
            <button onClick={() => setFiltersOpen(true)} className="relative px-4 py-3 rounded-xl bg-muted/60 border border-border/60 text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2 lg:hidden">
              <SlidersHorizontal className="h-4 w-4" />
              {activeFilters.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center">
                  {activeFilters.length}
                </span>
              )}
            </button>
          </div>

          {/* Status + intent tabs on one line */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            {/* Segmented control: All / Off-Plan / Secondary */}
            <div className="inline-flex items-center bg-muted rounded-xl p-1 gap-0.5">
              {statusTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatus(tab)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    status === tab
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab === "All" ? t("tabAll") : tab === "Off-Plan" ? t("tabOffPlan") : t("tabSecondary")}
                </button>
              ))}
            </div>

            {/* Divider */}
            {status !== "Off-Plan" && <div className="h-5 w-px bg-border/60" />}

            {/* Segmented control: All / Buy / Rent */}
            {status !== "Off-Plan" && (
              <div className="inline-flex items-center bg-muted rounded-xl p-1 gap-0.5">
                {secondaryModes.map((mode) => (
                  <button
                    key={mode.value || "any"}
                    onClick={() => { setIntent(mode.value); if (!mode.value) setStatus(status); }}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                      (intent || "") === mode.value
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {mode.value === "" ? t("tabAll") : mode.value === "buy" ? t("forSale") : t("forRent")}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop filter row */}
          <div className="hidden lg:flex flex-wrap items-center gap-x-2 gap-y-2 bg-muted/40 rounded-2xl px-3 py-2.5 border border-border/40">
            <FilterSelect placeholder={t("propertyType")} value={type} onChange={setType} options={localizedPropertyTypes} counts={facets.propertyType} />
            <MultiSelectFilter placeholder={t("community")} value={selectedLocations} onChange={setSelectedLocations} options={locationOptions} counts={facets.community} />
            <FilterSelect placeholder={t("bedrooms")} value={beds} onChange={setBeds} options={bedrooms} counts={bedroomCounts} />
            <FilterSelect placeholder={t("bathrooms")} value={baths} onChange={setBaths} options={bathrooms} />
            <PriceFilter
              min={priceBounds.min}
              max={priceBounds.max}
              value={[priceMin, priceMax]}
              onChange={([lo, hi]) => { setPriceMin(lo); setPriceMax(hi); }}
              priceLabel={t("price")}
              minLabel={t("minPrice")}
              maxLabel={t("maxPrice")}
              resetLabel={t("reset")}
            />
            {status === "Off-Plan" || intent === "off-plan" ? (
              <FilterSelect placeholder={t("handoverYear")} value={completionYear} onChange={setCompletionYear} options={completionYears} />
            ) : (
              <FilterSelect placeholder={t("furnishing")} value={furnishing} onChange={setFurnishing} options={furnishingOptions} />
            )}
            <DeveloperFilter
              value={developer}
              onChange={setDeveloper}
              options={developerOptions}
              placeholder={t("developer")}
              searchPlaceholder={t("searchDeveloper")}
              anyLabel={t("anyDeveloper")}
            />
          </div>

          <FilterSheet
            open={filtersOpen}
            onClose={() => setFiltersOpen(false)}
            title={t("filters")}
            applyLabel={t("applyFilters")}
            clearLabel={activeFilters.length > 0 ? t("clearFilters") : undefined}
            onClear={activeFilters.length > 0 ? clearFilters : undefined}
            resultsLabel={loading ? undefined : t("results", { count: totalResults })}
          >
            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{t("propertyType")}</p>
                <FilterSelect placeholder={t("propertyType")} value={type} onChange={setType} options={localizedPropertyTypes} counts={facets.propertyType} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{t("community")}</p>
                <MultiSelectFilter placeholder={t("community")} value={selectedLocations} onChange={setSelectedLocations} options={locationOptions} counts={facets.community} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{t("bedrooms")}</p>
                <ChipGroup options={bedrooms} value={beds} onChange={setBeds} counts={bedroomCounts} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{t("bathrooms")}</p>
                <ChipGroup options={bathrooms} value={baths} onChange={setBaths} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{t("minPrice")}</p>
                <PriceRangeFilter
                  min={priceBounds.min}
                  max={priceBounds.max}
                  step={priceBounds.step}
                  value={[priceMin, priceMax]}
                  onChange={([lo, hi]) => { setPriceMin(lo); setPriceMax(hi); }}
                />
              </div>
              {status === "Off-Plan" || intent === "off-plan" ? (
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{t("handoverYear")}</p>
                  <FilterSelect placeholder={t("handoverYear")} value={completionYear} onChange={setCompletionYear} options={completionYears} />
                </div>
              ) : (
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{t("furnishing")}</p>
                  <FilterSelect placeholder={t("furnishing")} value={furnishing} onChange={setFurnishing} options={furnishingOptions} />
                </div>
              )}
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{t("developer")}</p>
                <DeveloperFilter
                  value={developer}
                  onChange={setDeveloper}
                  options={developerOptions}
                  placeholder={t("developer")}
                  searchPlaceholder={t("searchDeveloper")}
                  anyLabel={t("anyDeveloper")}
                />
              </div>
            </div>
          </FilterSheet>

          {/* Results bar */}
          <div className="flex items-center justify-between mt-4 gap-3">
            <p className="text-sm text-muted-foreground">
              {loading ? t("searching") : (
                <>{t("results", { count: totalResults })}</>
              )}
            </p>
            <div className="flex items-center gap-3">
              <div className="relative flex items-center gap-2">
                <span className="text-xs text-muted-foreground hidden sm:inline">{t("sortBy")}</span>
                <select
                  id="search-sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="bg-muted/60 border border-border/60 rounded-lg pl-3 pr-7 py-1.5 text-sm text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <option value="newest">{t("newest")}</option>
                  <option value="price_asc">{t("priceAsc")}</option>
                  <option value="price_desc">{t("priceDesc")}</option>
                  <option value="ppsf_asc">{t("ppsfAsc")}</option>
                  <option value="ppsf_desc">{t("ppsfDesc")}</option>
                  <option value="featured">{t("sortFeatured")}</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              </div>
              {activeFilters.length > 0 && (
                <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-foreground font-medium flex items-center gap-1 transition-colors border border-border/60 rounded-lg px-2.5 py-1.5 hover:bg-muted/60">
                  <X className="h-3 w-3" /> {t("clearFilters")}
                </button>
              )}
            </div>
          </div>

          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {activeFilters.map((filter) => (
                <span key={filter} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/8 text-primary border border-primary/15">
                  {filter}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-10">
        <div className={`max-w-6xl mx-auto px-4 sm:px-6${sidebarSlot ? " lg:grid lg:grid-cols-[1fr_320px] lg:gap-8 lg:items-start" : ""}`}>
          <div className="min-w-0">
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /><span>{t("searching")}</span></div>
          ) : totalResults === 0 ? (
            <div className="flex flex-col items-center py-16">
              <Search className="h-10 w-10 text-muted-foreground/25 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-1">{t("noResults")}</h3>
              <button onClick={clearFilters} className="text-sm text-muted-foreground hover:text-primary transition-colors mb-10">{t("clearFilters")}</button>

              {communityLoading && (
                <div className="w-full max-w-sm animate-pulse">
                  <div className="h-3 w-52 bg-muted rounded-full mx-auto mb-5" />
                  <div className="bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm">
                    <div className="aspect-[4/3] bg-muted" />
                    <div className="p-5 space-y-3">
                      <div className="h-3 bg-muted rounded-full w-full" />
                      <div className="h-3 bg-muted rounded-full w-4/5" />
                      <div className="h-3 bg-muted rounded-full w-3/5" />
                      <div className="h-10 bg-muted rounded-xl mt-4" />
                    </div>
                  </div>
                </div>
              )}

              {!communityLoading && communityInfo && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="w-full max-w-sm"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-4 text-center">
                    {t("communityInfoFound", { name: communityInfo.name })}
                  </p>
                  <Link href={`/communities/${communityInfo.slug}`} className="group block bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border border-border/40 hover:border-primary/30 hover:-translate-y-0.5">
                    <div className="relative overflow-hidden aspect-[4/3]">
                      <Image
                        src={communityInfo.heroImage || "/assets/amenities-placeholder.webp"}
                        alt={communityInfo.name}
                        fill
                        sizes="384px"
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 25%, rgba(11,61,46,0.55) 65%, rgba(11,61,46,0.97) 100%)" }} />
                      <div className="absolute top-3 left-3">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/90 backdrop-blur-sm text-white uppercase tracking-wider shadow-sm">
                          {t("communityGuide")}
                        </span>
                      </div>
                      <div className="absolute bottom-5 left-5 right-5">
                        <p className="flex items-center gap-1.5 text-white/60 text-xs mb-1.5">
                          <MapPin className="h-3 w-3" /> {t("dubaiUAE")}
                        </p>
                        <h3 className="text-white font-extrabold text-2xl leading-tight tracking-tight">{communityInfo.name}</h3>
                      </div>
                    </div>
                    <div className="p-5">
                      {communityInfo.description && (
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-5 leading-relaxed">
                          {communityInfo.description}
                        </p>
                      )}
                      <div className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white text-sm font-semibold transition-all group-hover:shadow-lg group-hover:brightness-110" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
                        <MapPin className="h-4 w-4" />
                        {t("viewCommunityGuide", { name: communityInfo.name })}
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}

              {!communityLoading && !communityInfo && dldBuilding && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="w-full max-w-sm"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-4 text-center">
                    {t("buildingInfoFound", { name: dldBuilding.name })}
                  </p>
                  <Link href={`/communities/${dldBuilding.areaSlug}`} className="group block bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border border-border/40 hover:border-primary/30 hover:-translate-y-0.5">
                    <div className="relative overflow-hidden aspect-[4/3] bg-muted flex items-center justify-center">
                      <Image
                        src="/assets/amenities-placeholder.webp"
                        alt={dldBuilding.name}
                        fill
                        sizes="384px"
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 25%, rgba(11,61,46,0.55) 65%, rgba(11,61,46,0.97) 100%)" }} />
                      <div className="absolute top-3 left-3">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary/90 backdrop-blur-sm text-white uppercase tracking-wider shadow-sm">
                          {t("buildingMarketData")}
                        </span>
                      </div>
                      <div className="absolute bottom-5 left-5 right-5">
                        <p className="flex items-center gap-1.5 text-white/60 text-xs mb-1.5">
                          <MapPin className="h-3 w-3" /> {dldBuilding.area}
                        </p>
                        <h3 className="text-white font-extrabold text-2xl leading-tight tracking-tight">{dldBuilding.name}</h3>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                        {t("buildingAreaDescription", { building: dldBuilding.name, area: dldBuilding.area })}
                      </p>
                      <div className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white text-sm font-semibold transition-all group-hover:shadow-lg group-hover:brightness-110" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
                        <MapPin className="h-4 w-4" />
                        {t("viewAreaGuide", { area: dldBuilding.area })}
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}
            </div>
          ) : (
            <>
              {!loading && relaxed && (
                <div className="mx-4 lg:mx-0 mb-4 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2">
                  <span className="text-amber-500">~</span>
                  <span>{t("relaxedResults", { from: relaxed.from, to: relaxed.to })}</span>
                  <button
                    type="button"
                    onClick={() => setRelaxed(null)}
                    className="ml-auto text-amber-500 hover:text-amber-700 transition-colors"
                    aria-label={t("clearFilters")}
                  >
                    ×
                  </button>
                </div>
              )}
              {/* When the user lands on the Buy nav link (intent=buy on the
                  All tab), surface actual for-sale listings before off-plan
                  projects, buyers want move-in-ready stock first. */}
              <div className="flex flex-col">
              {projects.length > 0 && (
                <div
                  ref={projectsSectionRef}
                  className={`mb-12 scroll-mt-24 ${status === "All" && intent === "buy" && !q ? "order-2" : "order-1"}`}
                >
                  <h2 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" />{t("offPlanProjects")}<span className="text-sm font-normal text-muted-foreground">({projectCount})</span></h2>
                  {projectCount > PAGE_SIZE && (
                    <p className="text-xs text-muted-foreground mb-4">
                      {t("showingRange", { from: (projectsPage - 1) * PAGE_SIZE + 1, to: Math.min(projectsPage * PAGE_SIZE, projectCount), count: projectCount })}
                    </p>
                  )}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {projects.map((project, index) => (
                      <motion.div key={project._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.05, 0.3) }}>
                        <Link href={`/project/${project.slug}`} className="group block bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-border/50 hover:border-primary/20">
                          <div className="relative overflow-hidden aspect-[4/3]">
                            <CardImageCarousel
                              images={[project.featuredImage, ...(project.imageGallery || [])]}
                              alt={project.name}
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              priority={index < 3}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                            <div className="absolute top-3 left-3 flex gap-2">
                              <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-accent text-accent-foreground uppercase tracking-wider">{project.status || "Off-Plan"}</span>
                            </div>
                            <CardActions propertyId={project.slug} slug={project.slug} title={project.name} type="project" />
                          </div>
                          <div className="p-4">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                              {project.developerName && <span className="flex items-center gap-1"><Building className="h-3 w-3" />{project.developerName}</span>}
                              {project.community && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{project.community}</span>}
                            </div>
                            <h3 className="font-bold text-sm text-foreground mb-2 group-hover:text-primary transition-colors leading-snug line-clamp-2">{project.name}</h3>
                            <div className="flex items-center justify-between border-t border-border pt-2.5">
                              <p className="text-xs font-bold text-primary">{fmtCurrency(project.startingPrice, { isProject: true })}</p>
                              {project.completionDate && <p className="text-[10px] text-muted-foreground flex items-center gap-1"><CalendarDays className="h-2.5 w-2.5" />{(() => { try { const date = new Date(project.completionDate || ""); return Number.isNaN(date.getTime()) ? project.completionDate : date.getFullYear(); } catch { return project.completionDate; } })()}</p>}
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                  <Pagination page={projectsPage} totalPages={projectTotalPages} onChange={goToProjectsPage} />
                </div>
              )}

              {status !== "Off-Plan" && listings.length > 0 && (
                <div
                  ref={listingsSectionRef}
                  className={`scroll-mt-24 ${status === "All" && intent === "buy" && !q ? "order-1 mb-12" : "order-2"}`}
                >
                  {status === "All" && projects.length > 0 && (
                    <>
                      <h2 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2"><Building className="h-5 w-5 text-primary" />{t("secondaryProperties")}<span className="text-sm font-normal text-muted-foreground">({listingCount})</span></h2>
                      {listingCount > PAGE_SIZE && (
                        <p className="text-xs text-muted-foreground mb-4">
                          {t("showingRange", { from: (listingsPage - 1) * PAGE_SIZE + 1, to: Math.min(listingsPage * PAGE_SIZE, listingCount), count: listingCount })}
                        </p>
                      )}
                    </>
                  )}
                  {!(status === "All" && projects.length > 0) && listingCount > PAGE_SIZE && (
                    <p className="text-xs text-muted-foreground mb-4">
                      {t("showingRange", { from: (listingsPage - 1) * PAGE_SIZE + 1, to: Math.min(listingsPage * PAGE_SIZE, listingCount), count: listingCount })}
                    </p>
                  )}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {listings.map((listing, index) => (
                      <motion.div key={listing._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.05, 0.3) }}>
                        <Link href={`/property/${listing.slug}`} className="group block bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-border/50 hover:border-primary/20">
                          <div className="relative overflow-hidden aspect-[4/3]">
                            <CardImageCarousel
                              images={[listing.featuredImage, ...(listing.images || [])]}
                              alt={listing.title}
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              priority={index < 3}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                              <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-accent text-accent-foreground uppercase tracking-wider">{listing.listingType === "Rent" ? t("forRent") : t("forSale")}</span>
                              {(String(listing.offplan) === "1" || listing.completionStatus === "off_plan") && (
                                <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg text-white uppercase tracking-wider" style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)" }}>
                                  {tEnum("offPlan")}
                                </span>
                              )}
                            </div>
                            <CardActions propertyId={listing.slug} slug={listing.slug} title={listing.title} />
                          </div>
                          <div className="p-4">
                            {listing.community && <p className="flex items-center gap-1 text-xs text-muted-foreground mb-1.5"><MapPin className="h-3 w-3" />{listing.community}{listing.city ? `, ${listing.city}` : ""}</p>}
                            <h3 className="font-bold text-sm text-foreground mb-2 group-hover:text-primary transition-colors leading-snug line-clamp-2">{listing.title}</h3>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                              {listing.bedrooms != null && <span className="flex items-center gap-1"><BedDouble className="h-3 w-3" />{listing.bedrooms === 0 ? "Studio" : listing.bedrooms}</span>}
                              {listing.bathrooms != null && <span className="flex items-center gap-1"><Bath className="h-3 w-3" />{listing.bathrooms}</span>}
                              {listing.size != null && <span className="flex items-center gap-1"><Maximize className="h-3 w-3" />{listing.size.toLocaleString()} {listing.sizeUnit || "sqft"}</span>}
                            </div>
                            <div className="border-t border-border pt-2.5"><p className="text-xs font-bold text-primary">{fmtCurrency(listing.price, { fallback: t("priceOnRequest") })}</p></div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                  <Pagination page={listingsPage} totalPages={listingTotalPages} onChange={goToListingsPage} />
                </div>
              )}
              </div>
            </>
          )}
          </div>
          {sidebarSlot && (
            <aside className="mt-12 lg:mt-0 lg:sticky lg:top-24 self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:hidden">
              {sidebarSlot}
            </aside>
          )}
        </div>
      </section>

      {syncUrl && <Footer />}
      {syncUrl && <WhatsAppButton />}
      <PropertyComparison />
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (next: number) => void;
}) {
  if (totalPages <= 1) return null;

  const set = new Set<number>();
  for (const p of [1, totalPages, page - 1, page, page + 1]) {
    if (p >= 1 && p <= totalPages) set.add(p);
  }
  const sorted = Array.from(set).sort((a, b) => a - b);
  const items: Array<number | "ellipsis"> = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) items.push("ellipsis");
    items.push(p);
  });

  const baseBtn = "inline-flex items-center justify-center min-w-[2.25rem] h-9 px-3 rounded-lg text-sm font-medium transition-all border";

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1.5 mt-8 flex-wrap">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className={`${baseBtn} bg-background border-border text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-background`}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {items.map((item, idx) =>
        item === "ellipsis" ? (
          <span key={`e-${idx}`} className="px-1 text-muted-foreground select-none">…</span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            aria-current={item === page ? "page" : undefined}
            disabled={item === page}
            className={
              item === page
                ? `${baseBtn} border-transparent text-white shadow-sm cursor-default`
                : `${baseBtn} bg-background border-border text-foreground hover:bg-muted`
            }
            style={item === page ? { background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" } : undefined}
          >
            {item}
          </button>
        )
      )}
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className={`${baseBtn} bg-background border-border text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-background`}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

// Tappable chip row used in the mobile FilterSheet for fast bed/bath
// selection — fewer taps than opening a dropdown and easier to hit on
// touch screens. Clicking the active chip clears the filter.
function ChipGroup({
  options,
  value,
  onChange,
  counts,
}: {
  options: string[];
  value: string;
  onChange: (next: string) => void;
  counts?: Record<string, number>;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const active = value === opt;
        const count = counts?.[opt];
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(active ? "" : opt)}
            className={`min-w-[44px] px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
              active
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-foreground border-border hover:border-primary/30"
            }`}
          >
            {opt}
            {typeof count === "number" && !active && <span className="ml-1 text-[10px] text-muted-foreground">({count})</span>}
          </button>
        );
      })}
    </div>
  );
}

function FilterSelect({
  placeholder,
  options,
  value,
  onChange,
  counts,
}: {
  placeholder: string;
  options: Array<string | { label: string; value: string }>;
  value: string;
  onChange: (value: string) => void;
  counts?: Record<string, number>;
}) {
  return (
    <div className="relative min-w-[110px]">
      <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full bg-transparent border-0 pl-2 pr-7 py-2 text-sm text-foreground appearance-none cursor-pointer focus:outline-none whitespace-nowrap hover:text-foreground/80 transition-colors">
        <option value="">{placeholder}</option>
        {options.map((option) => {
          const optionValue = typeof option === "string" ? option : option.value;
          const optionLabel = typeof option === "string" ? option : option.label;
          const count = counts?.[optionValue];
          const labelWithCount = typeof count === "number" ? `${optionLabel} (${count})` : optionLabel;
          return <option key={optionValue} value={optionValue}>{labelWithCount}</option>;
        })}
      </select>
      <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
    </div>
  );
}

export default function SearchPageClient({ defaultStatus, defaultIntent, defaultType, defaultLocations, syncUrl = true, sidebarSlot, initialData }: { defaultStatus?: SearchStatus; defaultIntent?: SearchIntent; defaultType?: string; defaultLocations?: string[]; syncUrl?: boolean; sidebarSlot?: ReactNode; initialData?: InitialSearchData | null } = {}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}>
      <SearchContent defaultStatus={defaultStatus} defaultIntent={defaultIntent} defaultType={defaultType} defaultLocations={defaultLocations} syncUrl={syncUrl} sidebarSlot={sidebarSlot} initialData={initialData} />
    </Suspense>
  );
}
