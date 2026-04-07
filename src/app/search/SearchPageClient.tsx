"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { motion } from "framer-motion";
import {
  Search, Building, Building2, MapPin, BedDouble, Bath, Maximize,
  CalendarDays, Loader2, SlidersHorizontal, X, ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, Suspense } from "react";

interface Project {
  _id: string;
  name: string;
  slug: string;
  developerName?: string;
  community?: string;
  status?: string;
  startingPrice?: number;
  completionDate?: string;
  featuredImage?: string;
  images?: string[];
  propertyType?: string;
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
  price?: number;
  currency?: string;
  community?: string;
  city?: string;
  featuredImage?: string;
  images?: string[];
}

const statusTabs = ["All", "Off-Plan", "Secondary"];
const propertyTypes = ["Apartment", "Villa", "Townhouse", "Penthouse", "Studio"];
const locations = [
  "Downtown Dubai", "Dubai Marina", "Palm Jumeirah", "JBR", "Business Bay",
  "DIFC", "JVC / JVT", "Dubai Hills", "Creek Harbour",
];
const bedroomOptions = ["Studio", "1 Bedroom", "2 Bedrooms", "3 Bedrooms", "4+ Bedrooms"];
const budgetOptions = ["Up to 500K", "500K - 1M", "1M - 2M", "2M - 5M", "5M - 10M", "10M+"];

function formatPrice(price?: number, currency = "AED") {
  if (!price) return "Price on request";
  if (price >= 1_000_000) return `${currency} ${(price / 1_000_000).toFixed(1)}M`;
  return `${currency} ${price.toLocaleString()}`;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState(searchParams.get("status") || "All");
  const [type, setType] = useState(searchParams.get("type") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [bedrooms, setBedrooms] = useState(searchParams.get("bedrooms") || "");
  const [budget, setBudget] = useState(searchParams.get("budget") || "");
  const [q, setQ] = useState(searchParams.get("q") || "");

  const [projects, setProjects] = useState<Project[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [projectCount, setProjectCount] = useState(0);
  const [listingCount, setListingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status && status !== "All") params.set("status", status);
    if (type) params.set("type", type);
    if (location) params.set("location", location);
    if (bedrooms) params.set("bedrooms", bedrooms);
    if (budget) params.set("budget", budget);
    if (q) params.set("q", q);

    try {
      const res = await fetch(`/api/search?${params.toString()}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setProjects(data.projects || []);
      setListings(data.listings || []);
      setProjectCount(data.projectCount || 0);
      setListingCount(data.listingCount || 0);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  }, [status, type, location, bedrooms, budget, q]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Update URL when filters change
  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (status && status !== "All") params.set("status", status);
    if (type) params.set("type", type);
    if (location) params.set("location", location);
    if (bedrooms) params.set("bedrooms", bedrooms);
    if (budget) params.set("budget", budget);
    if (q) params.set("q", q);
    const query = params.toString();
    router.replace(`/search${query ? `?${query}` : ""}`, { scroll: false });
  }, [status, type, location, bedrooms, budget, q, router]);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  const clearFilters = () => {
    setStatus("All");
    setType("");
    setLocation("");
    setBedrooms("");
    setBudget("");
    setQ("");
  };

  const hasFilters = type || location || bedrooms || budget || q;
  const totalResults = projectCount + listingCount;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="pt-24 pb-6 bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Search bar */}
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search properties, projects, communities..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchResults()}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
              />
            </div>
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="px-4 py-3 rounded-xl bg-background border border-border text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2 lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>

          {/* Status Tabs */}
          <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
            {statusTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setStatus(tab)}
                className={`px-5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  status === tab
                    ? "text-white shadow-sm"
                    : "bg-background text-muted-foreground hover:text-foreground border border-border"
                }`}
                style={status === tab ? { background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" } : undefined}
              >
                {tab}
                {tab === "Off-Plan" && projectCount > 0 && (
                  <span className="ml-1.5 text-xs opacity-70">({projectCount})</span>
                )}
                {tab === "Secondary" && listingCount > 0 && (
                  <span className="ml-1.5 text-xs opacity-70">({listingCount})</span>
                )}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 ${filtersOpen ? "block" : "hidden lg:grid"}`}>
            <FilterSelect placeholder="Property Type" options={propertyTypes} value={type} onChange={setType} />
            <FilterSelect placeholder="Location" options={locations} value={location} onChange={setLocation} />
            <FilterSelect placeholder="Bedrooms" options={bedroomOptions} value={bedrooms} onChange={setBedrooms} />
            <FilterSelect placeholder="Budget" options={budgetOptions} value={budget} onChange={setBudget} />
          </div>

          {/* Results count & clear */}
          <div className="flex items-center justify-between mt-5">
            <p className="text-sm text-muted-foreground">
              {loading ? "Searching..." : `${totalResults.toLocaleString()} properties found`}
            </p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
              >
                <X className="h-3 w-3" /> Clear filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Searching properties...</span>
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-20">
              <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No properties found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your filters or search terms.</p>
              <button
                onClick={clearFilters}
                className="px-6 py-2.5 text-white rounded-xl font-semibold text-sm transition-all hover:shadow-lg"
                style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              {/* Off-Plan Projects */}
              {projects.length > 0 && (
                <div className="mb-12">
                  {(status === "All" || status === "") && listings.length > 0 && (
                    <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      Off-Plan Projects
                      <span className="text-sm font-normal text-muted-foreground">({projectCount})</span>
                    </h2>
                  )}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {projects.map((p, i) => (
                      <motion.div
                        key={p._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(i * 0.05, 0.3) }}
                      >
                        <Link
                          href={`/project/${p.slug}`}
                          className="group block bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-border/50 hover:border-primary/20"
                        >
                          <div className="relative overflow-hidden aspect-[4/3]">
                            <img
                              src={p.featuredImage || p.images?.[0] || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600"}
                              alt={p.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                            <div className="absolute top-3 left-3 flex gap-2">
                              <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-accent text-accent-foreground uppercase tracking-wider">
                                {p.status || "Off-Plan"}
                              </span>
                              <span className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-primary/80 text-white backdrop-blur-sm">
                                Off-Plan
                              </span>
                            </div>
                          </div>
                          <div className="p-4">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                              {p.developerName && (
                                <span className="flex items-center gap-1"><Building className="h-3 w-3" />{p.developerName}</span>
                              )}
                              {p.community && (
                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{p.community}</span>
                              )}
                            </div>
                            <h3 className="font-bold text-sm text-foreground mb-2 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                              {p.name}
                            </h3>
                            <div className="flex items-center justify-between border-t border-border pt-2.5">
                              <p className="text-xs font-bold text-primary">
                                {p.startingPrice ? `From AED ${(p.startingPrice / 1_000_000).toFixed(1)}M` : "Price on request"}
                              </p>
                              {p.completionDate && (
                                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                  <CalendarDays className="h-2.5 w-2.5" />
                                  {(() => { try { const d = new Date(p.completionDate); return isNaN(d.getTime()) ? p.completionDate : d.getFullYear(); } catch { return p.completionDate; } })()}
                                </p>
                              )}
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Secondary Listings */}
              {listings.length > 0 && (
                <div>
                  {(status === "All" || status === "") && projects.length > 0 && (
                    <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
                      <Building className="h-5 w-5 text-primary" />
                      {"Secondary Properties"}
                      <span className="text-sm font-normal text-muted-foreground">({listingCount})</span>
                    </h2>
                  )}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {listings.map((l, i) => (
                      <motion.div
                        key={l._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(i * 0.05, 0.3) }}
                      >
                        <Link
                          href={`/property/${l.slug}`}
                          className="group block bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-border/50 hover:border-primary/20"
                        >
                          <div className="relative overflow-hidden aspect-[4/3]">
                            <img
                              src={l.featuredImage || l.images?.[0] || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600"}
                              alt={l.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                            <div className="absolute top-3 left-3 flex gap-2">
                              <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-accent text-accent-foreground uppercase tracking-wider">
                                {l.listingType === "Rent" ? "For Rent" : "For Sale"}
                              </span>
                              {l.propertyType && (
                                <span className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-sm text-white">
                                  {l.propertyType}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="p-4">
                            {l.community && (
                              <p className="flex items-center gap-1 text-xs text-muted-foreground mb-1.5">
                                <MapPin className="h-3 w-3" /> {l.community}{l.city ? `, ${l.city}` : ""}
                              </p>
                            )}
                            <h3 className="font-bold text-sm text-foreground mb-2 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                              {l.title}
                            </h3>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                              {l.bedrooms != null && <span className="flex items-center gap-1"><BedDouble className="h-3 w-3" />{l.bedrooms}</span>}
                              {l.bathrooms != null && <span className="flex items-center gap-1"><Bath className="h-3 w-3" />{l.bathrooms}</span>}
                              {l.size != null && <span className="flex items-center gap-1"><Maximize className="h-3 w-3" />{l.size.toLocaleString()} {l.sizeUnit || "sqft"}</span>}
                            </div>
                            <div className="border-t border-border pt-2.5">
                              <p className="text-xs font-bold text-primary">{formatPrice(l.price, l.currency)}</p>
                            </div>
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
    </div>
  );
}

const FilterSelect = ({
  placeholder, options, value, onChange,
}: {
  placeholder: string; options: string[]; value: string; onChange: (v: string) => void;
}) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
  </div>
);

export default function SearchPageClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
