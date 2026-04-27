"use client";

import { apiUrl } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { CardActions } from "@/components/PropertyActions";
import { formatProjectPrice } from "@/lib/formatPrice";
import PropertyComparison from "@/components/PropertyComparison";
import { motion } from "framer-motion";
import { Bath, BedDouble, Building, Building2, CalendarDays, ChevronDown, Loader2, MapPin, Maximize, Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  formatPropertyTypeLabel,
  homeSearchPropertyTypeOptions,
  normalizePropertyType,
} from "@/lib/property-types";

type SearchIntent = "" | "buy" | "rent" | "off-plan";
type SearchStatus = "All" | "Off-Plan" | "Secondary";

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
  bathrooms?: number;
  bedrooms?: number;
  city?: string;
  community?: string;
  currency?: string;
  featuredImage?: string;
  images?: string[];
  listingType?: string;
  price?: number;
  propertyType?: string;
  size?: number;
  sizeUnit?: string;
  slug: string;
  title: string;
}

const statusTabs: SearchStatus[] = ["All", "Off-Plan", "Secondary"];
const secondaryModes: Array<{ label: string; value: SearchIntent }> = [
  { label: "Any Secondary", value: "" },
  { label: "Buy", value: "buy" },
  { label: "Rent", value: "rent" },
];
const propertyTypes = homeSearchPropertyTypeOptions;
const locations = ["Downtown Dubai", "Dubai Marina", "Palm Jumeirah", "JBR", "Business Bay", "DIFC", "JVC / JVT", "Dubai Hills Estate", "Creek Harbour", "MBR City"];
const bedrooms = ["Studio", "1", "2", "3", "4", "5", "6", "7+"];
const bathrooms = ["1", "2", "3", "4", "5", "6", "7+"];
const buyBudgets = ["Up to 500K", "500K - 1M", "1M - 2M", "2M - 5M", "5M - 10M", "10M+"];
const rentBudgets = ["Up to 100K", "100K - 200K", "200K - 350K", "350K - 500K", "500K+"];

function formatPrice(price?: number, currency = "AED", fallback = "Price on request") {
  if (!price) return fallback;
  if (price >= 1_000_000) return `${currency} ${(price / 1_000_000).toFixed(1)}M`;
  return `${currency} ${price.toLocaleString()}`;
}

function normalizeStatus(status: string | null, intent: SearchIntent): SearchStatus {
  if (status === "Off-Plan" || intent === "off-plan") return "Off-Plan";
  if (status === "Secondary" || intent === "buy" || intent === "rent") return "Secondary";
  return "All";
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = searchParams ?? new URLSearchParams();
  const initialIntent = (params.get("intent") as SearchIntent) || "";

  const [status, setStatus] = useState<SearchStatus>(normalizeStatus(params.get("status"), initialIntent));
  const [intent, setIntent] = useState<SearchIntent>(initialIntent);

  // Sync tab when URL params change (e.g. nav links between Buy/Rent/Off-Plan)
  useEffect(() => {
    const urlIntent = (params.get("intent") as SearchIntent) || "";
    const urlStatus = params.get("status");
    setIntent(urlIntent);
    setStatus(normalizeStatus(urlStatus, urlIntent));
  }, [searchParams]);
  const [type, setType] = useState(() => String(normalizePropertyType(params.get("type") || "", "")));
  const [location, setLocation] = useState(params.get("location") || "");
  const [beds, setBeds] = useState(params.get("bedrooms") || "");
  const [baths, setBaths] = useState(params.get("bathrooms") || "");
  const [budget, setBudget] = useState(params.get("budget") || "");
  const [developer, setDeveloper] = useState(params.get("developer") || "");
  const [q, setQ] = useState(params.get("q") || "");

  const t = useTranslations("search");
  const [projects, setProjects] = useState<Project[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [projectCount, setProjectCount] = useState(0);
  const [listingCount, setListingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [communityInfo, setCommunityInfo] = useState<{ name: string; slug: string } | null>(null);

  const budgetOptions = intent === "rent" ? rentBudgets : buyBudgets;

  useEffect(() => {
    if (status === "Off-Plan" && intent !== "off-plan") setIntent("off-plan");
    if (status === "Secondary" && intent === "off-plan") setIntent("buy");
    if (status === "All" && intent === "off-plan") setIntent("");
  }, [intent, status]);

  useEffect(() => {
    if (budget && !budgetOptions.includes(budget)) setBudget("");
  }, [budget, budgetOptions]);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status !== "All") params.set("status", status);
    if (intent) params.set("intent", intent);
    if (type) params.set("type", String(normalizePropertyType(type, type)));
    if (location) params.set("location", location);
    if (beds) params.set("bedrooms", beds);
    if (baths) params.set("bathrooms", baths);
    if (budget) params.set("budget", budget);
    if (developer) params.set("developer", developer);
    if (q) params.set("q", q);

    try {
      const response = await fetch(apiUrl(`/api/search?${params.toString()}`));
      if (!response.ok) throw new Error("Search failed");
      const data = await response.json();
      setProjects(data.projects || []);
      setListings(data.listings || []);
      setProjectCount(data.projectCount || 0);
      setListingCount(data.listingCount || 0);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  }, [baths, beds, budget, developer, intent, location, q, status, type]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (status !== "All") params.set("status", status);
    if (intent) params.set("intent", intent);
    if (type) params.set("type", String(normalizePropertyType(type, type)));
    if (location) params.set("location", location);
    if (beds) params.set("bedrooms", beds);
    if (baths) params.set("bathrooms", baths);
    if (budget) params.set("budget", budget);
    if (developer) params.set("developer", developer);
    if (q) params.set("q", q);
    const query = params.toString();
    router.replace(`/search${query ? `?${query}` : ""}`, { scroll: false });
  }, [baths, beds, budget, developer, intent, location, q, router, status, type]);

  const clearFilters = () => {
    setStatus("All");
    setIntent("");
    setType("");
    setLocation("");
    setBeds("");
    setBaths("");
    setBudget("");
    setDeveloper("");
    setQ("");
  };

  const activeFilters = [
    status !== "All" ? status : "",
    intent === "buy" ? "Buy" : intent === "rent" ? "Rent" : "",
    type ? formatPropertyTypeLabel(type, type) : "",
    location,
    beds ? `${beds} bed` : "",
    baths ? `${baths} bath` : "",
    budget ? `AED ${budget}` : "",
    developer,
  ].filter(Boolean);
  const totalResults = projectCount + listingCount;

  useEffect(() => {
    if (!loading && totalResults === 0 && q.trim().length >= 3) {
      fetch(`/api/community-info?q=${encodeURIComponent(q.trim())}`)
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          if (data?.exists && data?.data?.name && data?.data?.slug) {
            setCommunityInfo({ name: data.data.name, slug: data.data.slug });
          } else {
            setCommunityInfo(null);
          }
        })
        .catch(() => setCommunityInfo(null));
    } else {
      setCommunityInfo(null);
    }
  }, [loading, totalResults, q]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-24 pb-6 bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input value={q} onChange={(event) => setQ(event.target.value)} onKeyDown={(event) => event.key === "Enter" && fetchResults()} placeholder={t("title")} className="w-full pl-11 pr-4 py-3 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all" />
            </div>
            <button onClick={() => setFiltersOpen(!filtersOpen)} className="px-4 py-3 rounded-xl bg-background border border-border text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2 lg:hidden">
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>

          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {statusTabs.map((tab) => (
              <button key={tab} onClick={() => setStatus(tab)} className={`px-5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${status === tab ? "text-white shadow-sm" : "bg-background text-muted-foreground hover:text-foreground border border-border"}`} style={status === tab ? { background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" } : undefined}>
                {tab === "All" ? t("tabAll") : tab === "Off-Plan" ? t("tabOffPlan") : t("tabSecondary")}
              </button>
            ))}
          </div>

          {status !== "Off-Plan" && (
            <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
              {secondaryModes.map((mode) => (
                <button key={mode.value || "any"} onClick={() => { setStatus(mode.value ? "Secondary" : "All"); setIntent(mode.value); }} className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-[0.12em] whitespace-nowrap transition-all ${(intent || "") === mode.value && (status === "Secondary" || mode.value === "") ? "text-primary bg-primary/10 border border-primary/20" : "text-muted-foreground border border-border hover:text-foreground"}`}>
                  {mode.value === "" ? t("tabAnySecondary") : mode.value === "buy" ? t("buy") : t("rent")}
                </button>
              ))}
            </div>
          )}

          <div className={`grid grid-cols-2 lg:grid-cols-6 gap-3 ${filtersOpen ? "block" : "hidden lg:grid"}`}>
            <FilterSelect placeholder={t("propertyType")} value={type} onChange={setType} options={propertyTypes} />
            <FilterSelect placeholder={t("community")} value={location} onChange={setLocation} options={locations} />
            <FilterSelect placeholder={t("bedrooms")} value={beds} onChange={setBeds} options={bedrooms} />
            <FilterSelect placeholder={t("bedrooms")} value={baths} onChange={setBaths} options={bathrooms} />
            <FilterSelect placeholder={t("minPrice")} value={budget} onChange={setBudget} options={budgetOptions} />
            <input value={developer} onChange={(event) => setDeveloper(event.target.value)} placeholder={t("community")} className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>

          <div className="flex flex-col gap-3 mt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">{loading ? t("noResults") : t("results", { count: totalResults })}</p>
            {activeFilters.length > 0 && (
              <button onClick={clearFilters} className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors">
                <X className="h-3 w-3" /> {t("clearFilters")}
              </button>
            )}
          </div>

          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {activeFilters.map((filter) => (
                <span key={filter} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-primary/8 text-primary border border-primary/10">
                  {filter}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /><span>{t("noResults")}</span></div>
          ) : totalResults === 0 ? (
            <div className="text-center py-20">
              <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">{t("noResults")}</h3>
              <p className="text-muted-foreground mb-6">{t("clearFilters")}</p>
              {communityInfo ? (
                <div className="mt-6 mb-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    We found community information for <span className="font-semibold text-foreground">{communityInfo.name}</span>
                  </p>
                  <Link
                    href={`/community/${communityInfo.slug}`}
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-white rounded-xl font-semibold text-sm transition-all hover:shadow-lg"
                    style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
                  >
                    <MapPin className="h-4 w-4" />
                    View {communityInfo.name} Community Guide
                  </Link>
                </div>
              ) : (
                <button onClick={clearFilters} className="px-6 py-2.5 text-white rounded-xl font-semibold text-sm transition-all hover:shadow-lg" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
                  {t("clearFilters")}
                </button>
              )}
            </div>
          ) : (
            <>
              {projects.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" />{t("offPlanProjects")}<span className="text-sm font-normal text-muted-foreground">({projectCount})</span></h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {projects.map((project, index) => (
                      <motion.div key={project._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.05, 0.3) }}>
                        <Link href={`/project/${project.slug}`} className="group block bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-border/50 hover:border-primary/20">
                          <div className="relative overflow-hidden aspect-[4/3]">
                            <Image src={project.featuredImage || project.imageGallery?.[0] || "/assets/amenities-placeholder.webp"} alt={project.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover group-hover:scale-110 transition-transform duration-700" />
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
                              <p className="text-xs font-bold text-primary">{formatProjectPrice(project.startingPrice, project.currency)}</p>
                              {project.completionDate && <p className="text-[10px] text-muted-foreground flex items-center gap-1"><CalendarDays className="h-2.5 w-2.5" />{(() => { try { const date = new Date(project.completionDate || ""); return Number.isNaN(date.getTime()) ? project.completionDate : date.getFullYear(); } catch { return project.completionDate; } })()}</p>}
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {listings.length > 0 && (
                <div>
                  {(status === "All" || status === "Off-Plan") && projects.length > 0 && (
                    <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2"><Building className="h-5 w-5 text-primary" />{t("secondaryProperties")}<span className="text-sm font-normal text-muted-foreground">({listingCount})</span></h2>
                  )}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {listings.map((listing, index) => (
                      <motion.div key={listing._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.05, 0.3) }}>
                        <Link href={`/property/${listing.slug}`} className="group block bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-border/50 hover:border-primary/20">
                          <div className="relative overflow-hidden aspect-[4/3]">
                            <Image src={listing.featuredImage || listing.images?.[0] || "/assets/amenities-placeholder.webp"} alt={listing.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                            <div className="absolute top-3 left-3 flex gap-2">
                              <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-accent text-accent-foreground uppercase tracking-wider">{listing.listingType === "Rent" ? "For Rent" : "For Sale"}</span>
                            </div>
                            <CardActions propertyId={listing.slug} slug={listing.slug} title={listing.title} />
                          </div>
                          <div className="p-4">
                            {listing.community && <p className="flex items-center gap-1 text-xs text-muted-foreground mb-1.5"><MapPin className="h-3 w-3" />{listing.community}{listing.city ? `, ${listing.city}` : ""}</p>}
                            <h3 className="font-bold text-sm text-foreground mb-2 group-hover:text-primary transition-colors leading-snug line-clamp-2">{listing.title}</h3>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                              {listing.bedrooms != null && <span className="flex items-center gap-1"><BedDouble className="h-3 w-3" />{listing.bedrooms}</span>}
                              {listing.bathrooms != null && <span className="flex items-center gap-1"><Bath className="h-3 w-3" />{listing.bathrooms}</span>}
                              {listing.size != null && <span className="flex items-center gap-1"><Maximize className="h-3 w-3" />{listing.size.toLocaleString()} {listing.sizeUnit || "sqft"}</span>}
                            </div>
                            <div className="border-t border-border pt-2.5"><p className="text-xs font-bold text-primary">{formatPrice(listing.price, listing.currency, t("priceOnRequest"))}</p></div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
      <PropertyComparison />
    </div>
  );
}

function FilterSelect({
  placeholder,
  options,
  value,
  onChange,
}: {
  placeholder: string;
  options: Array<string | { label: string; value: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all">
        <option value="">{placeholder}</option>
        {options.map((option) => {
          const optionValue = typeof option === "string" ? option : option.value;
          const optionLabel = typeof option === "string" ? option : option.label;
          return <option key={optionValue} value={optionValue}>{optionLabel}</option>;
        })}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
    </div>
  );
}

export default function SearchPageClient() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
