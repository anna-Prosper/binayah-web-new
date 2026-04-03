"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Search, ChevronDown, Zap, X, Sparkles, MapPin } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRouter } from "next/navigation";
import ParticleConstellation from "./ParticleConstellation";
import TypewriterHeadline from "./TypewriterHeadline";

const heroImage = "/assets/dubai-hero.png";

const statusTabs = ["Buy", "Rent", "Off-Plan"];
const mobileTabs = ["Buy", "Rent", "Off-Plan"];
const propertyTypes = ["Apartment", "Villa", "Townhouse", "Penthouse", "Studio", "Compound", "Duplex", "Hotel Apartment"];
const popularLocations = [
  { name: "Dubai Marina", city: "Dubai" },
  { name: "Downtown Dubai", city: "Dubai" },
  { name: "Business Bay", city: "Dubai" },
  { name: "Palm Jumeirah", city: "Dubai" },
  { name: "JBR", city: "Dubai" },
  { name: "Dubai Hills Estate", city: "Dubai" },
  { name: "Creek Harbour", city: "Dubai" },
  { name: "JVC", city: "Dubai" },
  { name: "DIFC", city: "Dubai" },
  { name: "MBR City", city: "Dubai" },
  { name: "Jumeirah", city: "Dubai" },
  { name: "Arabian Ranches", city: "Dubai" },
  { name: "Al Reem Island", city: "Abu Dhabi" },
  { name: "Saadiyat Island", city: "Abu Dhabi" },
  { name: "Yas Island", city: "Abu Dhabi" },
];
const bedroomOptions = ["Studio", "1", "2", "3", "4", "5", "6", "7", "7+"];
const bathroomOptions = ["1", "2", "3", "4", "5", "6", "7", "7+"];
const budgets = ["Up to 500K", "500K - 1M", "1M - 2M", "2M - 5M", "5M - 10M", "10M+"];

const areaKeywords: Record<string, string> = {
  downtown: "Downtown Dubai", "downtown dubai": "Downtown Dubai",
  marina: "Dubai Marina", "dubai marina": "Dubai Marina",
  palm: "Palm Jumeirah", "palm jumeirah": "Palm Jumeirah",
  "business bay": "Business Bay", jvc: "JVC", jvt: "JVC",
  "dubai hills": "Dubai Hills Estate", hills: "Dubai Hills Estate",
  creek: "Creek Harbour", "creek harbour": "Creek Harbour",
  jbr: "JBR", difc: "DIFC", jumeirah: "Jumeirah",
  "mbr city": "MBR City", mbr: "MBR City",
};
const typeKeywords: Record<string, string> = {
  apartment: "Apartment", apt: "Apartment", flat: "Apartment",
  villa: "Villa", townhouse: "Townhouse", penthouse: "Penthouse", studio: "Studio",
};
const bedroomKeywords: Record<string, string> = {
  studio: "Studio", "1 bed": "1", "1br": "1", "1bed": "1",
  "2 bed": "2", "2br": "2", "2bed": "2",
  "3 bed": "3", "3br": "3", "3bed": "3",
  "4 bed": "4", "4br": "4", "5 bed": "5", "5br": "5",
};
const questionPatterns = [
  /^(what|how|why|when|where|who|can you|tell me|explain|is it|should i|do you)/i,
  /\?$/,
  /^(hi|hello|hey)/i,
  /\b(advice|recommend|help me|suggest|compare|difference|best time|market|invest|roi|visa|mortgage|tax|legal|golden visa)\b/i,
];
function isGeneralQuestion(input: string): boolean {
  const trimmed = input.trim();
  if (trimmed.length < 5) return false;
  return questionPatterns.some((p) => p.test(trimmed));
}

function parseSmartSearch(input: string) {
  const lower = input.toLowerCase().trim();
  const tags: { key: string; label: string; value: string }[] = [];
  let location = "", type = "", bedroom = "", budget = "", status = "";

  if (/off[\s-]?plan|offplan|new[\s-]?launch/i.test(lower)) {
    status = "Off-Plan"; tags.push({ key: "status", label: "Status", value: "Off-Plan" });
  } else if (/ready|secondary|resale|\brent\b|rental/i.test(lower)) {
    status = "Rent"; tags.push({ key: "status", label: "Status", value: "Rent" });
  }
  const areaEntries = Object.entries(areaKeywords).sort((a, b) => b[0].length - a[0].length);
  for (const [kw, val] of areaEntries) {
    if (lower.includes(kw)) { location = val; tags.push({ key: "location", label: "Area", value: val }); break; }
  }
  const typeEntries = Object.entries(typeKeywords).sort((a, b) => b[0].length - a[0].length);
  for (const [kw, val] of typeEntries) {
    if (lower.includes(kw)) { type = val; tags.push({ key: "type", label: "Type", value: val }); break; }
  }
  const bedEntries = Object.entries(bedroomKeywords).sort((a, b) => b[0].length - a[0].length);
  for (const [kw, val] of bedEntries) {
    if (lower.includes(kw)) { bedroom = val; tags.push({ key: "bedroom", label: "Beds", value: val === "Studio" ? "Studio" : `${val} BR` }); break; }
  }
  const numMatch = lower.match(/(\d[\d,.]*)\s*(m|million|mn|k|aed)?(?=\s|$|[^\d])/);
  if (numMatch) {
    let num = parseFloat(numMatch[1].replace(/,/g, ""));
    const unit = numMatch[2];
    if (unit === "m" || unit === "million" || unit === "mn") num *= 1_000_000;
    else if (unit === "k") num *= 1_000;
    else if (!unit && num < 1000 && num > 0) num *= 1_000_000;
    if (num > 0) {
      if (num <= 500_000) budget = "Up to 500K";
      else if (num <= 1_000_000) budget = "500K - 1M";
      else if (num <= 2_000_000) budget = "1M - 2M";
      else if (num <= 5_000_000) budget = "2M - 5M";
      else if (num <= 10_000_000) budget = "5M - 10M";
      else budget = "10M+";
      tags.push({ key: "budget", label: "Budget", value: budget });
    }
  }
  return { location, type, bedroom, budget, status, tags };
}

const searchPlaceholders = [
  '"3 bed villa in Palm under 5M"',
  '"Studio in JVC for investment"',
  '"2BR Marina apartment"',
  '"Family townhouse in Dubai Hills"',
  '"Off-plan in Creek Harbour"',
];

const HeroSection = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Buy");
  const [mobileTab, setMobileTab] = useState("Buy");
  const [smartSearch, setSmartSearch] = useState("");
  const [parsedTags, setParsedTags] = useState<{ key: string; label: string; value: string }[]>([]);
  const [isQuestion, setIsQuestion] = useState(false);
  const [selLocation, setSelLocation] = useState("");
  const [selType, setSelType] = useState("");
  const [selBedroom, setSelBedroom] = useState("");
  const [selBathroom, setSelBathroom] = useState("");
  const [selBudget, setSelBudget] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [locationSearch, setLocationSearch] = useState("");
  const [placeSuggestions, setPlaceSuggestions] = useState<{description:string;area:string;city:string}[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const placesTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const opacity = useTransform(scrollYProgress, [0.3, 0.7], [1, 0]);

  useEffect(() => {
    const interval = setInterval(() => setPlaceholderIndex((p) => (p + 1) % searchPlaceholders.length), 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpenDropdown(null);
      setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSmartInput = useCallback((val: string) => {
    setSmartSearch(val);
    const isQ = isGeneralQuestion(val);
    setIsQuestion(isQ);
    setShowSuggestions(val.trim().length >= 2);
    if (val.trim().length > 1) {
      if (!isQ) {
        const { location, type, bedroom, budget, status, tags } = parseSmartSearch(val);
        setParsedTags(tags);
        if (location) setSelLocation(location);
        if (type) setSelType(type);
        if (bedroom) setSelBedroom(bedroom);
        if (budget) setSelBudget(budget);
        if (status) setActiveTab(status === "Off-Plan" ? "Off-Plan" : status === "Rent" ? "Rent" : activeTab);
      } else {
        setParsedTags([]);
      }
      if (placesTimerRef.current) clearTimeout(placesTimerRef.current);
      placesTimerRef.current = setTimeout(async () => {
        try {
          const res = await fetch(`/api/places?q=${encodeURIComponent(val)}`);
          const data = await res.json();
          setPlaceSuggestions(data.predictions ?? []);
        } catch { setPlaceSuggestions([]); }
      }, 300);
    } else {
      setParsedTags([]);
      setPlaceSuggestions([]);
    }
  }, [activeTab]);

  const clearSmartSearch = () => {
    setSmartSearch(""); setParsedTags([]); setIsQuestion(false);
    setSelLocation(""); setSelType(""); setSelBedroom(""); setSelBudget(""); setPlaceSuggestions([]);
  };

  const handleSearch = () => {
    if (isQuestion && smartSearch.trim()) {
      window.dispatchEvent(new CustomEvent("open-ai-chat", { detail: { question: smartSearch.trim() } }));
      return;
    }
    const params = new URLSearchParams();
    if (activeTab === "Rent") params.set("intent", "rent");
    else if (activeTab === "Off-Plan") { router.push("/off-plan"); return; }
    else params.set("intent", "buy");
    if (selType) params.set("type", selType);
    if (selLocation) params.set("location", selLocation);
    if (selBedroom) params.set("bedrooms", selBedroom);
    if (selBathroom) params.set("bathrooms", selBathroom);
    if (selBudget) params.set("budget", selBudget);
    if (smartSearch.trim() && !isQuestion) params.set("q", smartSearch.trim());
    router.push(`/search?${params.toString()}`);
  };

  const handleMobileSearch = () => {
    if (mobileTab === "Off-Plan") { router.push("/off-plan"); return; }
    router.push(`/search?intent=${mobileTab === "Buy" ? "buy" : "rent"}`);
  };

  return (
    <section ref={ref} className="relative min-h-[auto] sm:min-h-screen flex items-end sm:items-center justify-center pt-16 pb-8 sm:pt-0 sm:pb-0">
      <motion.div className="absolute inset-0" style={{ y: imageY }}>
        <img src={heroImage} alt="Dubai skyline" className="h-[120%] w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />
      </motion.div>

      <div className="hidden sm:block"><ParticleConstellation /></div>

      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
        <div className="absolute top-1/4 left-8 w-px h-32 bg-gradient-to-b from-transparent via-accent/30 to-transparent hidden lg:block" />
        <div className="absolute top-1/3 right-8 w-px h-24 bg-gradient-to-b from-transparent via-white/20 to-transparent hidden lg:block" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-24 pb-6 sm:pb-12">
        <motion.div style={{ y: textY, opacity }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} className="text-center mb-8 sm:mb-14">
            <motion.div initial={{ width: 0 }} animate={{ width: "3rem" }} transition={{ duration: 0.8, delay: 0.3 }} className="h-[2px] bg-accent mx-auto mb-4 sm:mb-6" />
            <p className="hidden sm:block text-accent font-medium tracking-[0.4em] uppercase text-[10px] sm:text-sm mb-3 sm:mb-5">Binayah Properties</p>
            <h1 className="text-3xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-[0.95] mb-4 sm:mb-6">
              <TypewriterHeadline /><br /><span className="italic font-light">in Dubai</span>
            </h1>
            <p className="hidden sm:block text-white/60 text-sm sm:text-lg max-w-xl mx-auto font-light px-4 sm:px-0">
              Your trusted partner for buying, selling & renting properties in Dubai
            </p>
            <p className="sm:hidden text-white/50 text-xs font-light">2,500+ listings across 50+ communities</p>
          </motion.div>
        </motion.div>

        {/* Mobile Search */}
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }} className="sm:hidden w-full">
          <div className="flex gap-0.5 mb-0">
            {mobileTabs.map((tab) => (
              <button key={tab} onClick={() => setMobileTab(tab)}
                className={`flex-1 py-2 text-[10px] font-bold tracking-[0.15em] uppercase rounded-t-xl transition-all duration-300 ${mobileTab === tab ? "text-white shadow-lg" : "bg-white/8 text-white/60 backdrop-blur-sm border-t border-x border-white/10"}`}
                style={mobileTab === tab ? { background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" } : undefined}>
                {tab}
              </button>
            ))}
          </div>
          <div className="backdrop-blur-2xl rounded-b-2xl shadow-2xl border border-white/20 p-3.5"
            style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.08) 100%)" }}>
            <button onClick={handleMobileSearch}
              className="w-full flex items-center gap-3 bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-left active:scale-[0.98] transition-transform">
              <Search className="h-4 w-4 text-accent flex-shrink-0" />
              <span className="text-white/40 text-sm truncate">
                {mobileTab === "Off-Plan" ? "Browse off-plan projects..." : "Search by community, project, or developer..."}
              </span>
            </button>
          </div>
        </motion.div>

        {/* Desktop Search */}
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }} className="hidden sm:block w-full max-w-5xl mx-auto">
          <div className="flex justify-center gap-px mb-0">
            {statusTabs.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`relative px-5 sm:px-8 py-2.5 sm:py-3 text-[11px] sm:text-xs font-semibold tracking-[0.15em] uppercase rounded-t-xl transition-all duration-300 ${activeTab === tab ? "text-white shadow-lg" : "bg-white/8 text-white/70 hover:bg-white/15 backdrop-blur-sm hover:text-white border-t border-x border-white/10"}`}
                style={activeTab === tab ? { background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" } : undefined}>
                {tab}
              </button>
            ))}
          </div>

          <div className="backdrop-blur-2xl rounded-b-2xl rounded-tr-2xl shadow-2xl border border-white/20 overflow-visible"
            style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.08) 100%)" }}>
            <div className="px-5 sm:px-7 pt-5 sm:pt-6">
              <div className="relative">
                <div className="flex items-center">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none z-10">
                    <Sparkles className="h-4 w-4" style={{ color: "#D4A847" }} />
                    <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:block" style={{ color: "#D4A847" }}>AI Search</span>
                  </div>
                  <input value={smartSearch} onChange={(e) => handleSmartInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    onFocus={() => setShowSuggestions(smartSearch.trim().length >= 2)}
                    placeholder={`Try: ${searchPlaceholders[placeholderIndex]}`}
                    className="w-full pl-24 sm:pl-28 pr-12 py-4 bg-white border border-white/30 rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50 transition-all shadow-sm" />
                  {smartSearch ? (
                    <button onClick={clearSmartSearch} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white">
                      <X className="h-4 w-4" />
                    </button>
                  ) : (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-white/30 hidden sm:block">⌘K</div>
                  )}
                </div>

                {/* Suggestions dropdown */}
                {showSuggestions && placeSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card rounded-xl border border-border shadow-lg z-50 overflow-hidden max-h-64 overflow-y-auto">
                    <p className="px-4 pt-2.5 pb-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Locations</p>
                    {placeSuggestions.slice(0, 5).map((p, i) => (
                      <button key={i} onMouseDown={(e) => {
                        e.preventDefault();
                        const loc = p.area || p.description.split(",")[0].trim();
                        setSelLocation(loc);
                        setSmartSearch(loc);
                        setPlaceSuggestions([]);
                        setShowSuggestions(false);
                      }} className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors border-b border-border/20 last:border-0">
                        <div className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{p.area || p.description.split(",")[0]}</p>
                          <p className="text-xs text-muted-foreground truncate">{p.city || "UAE"}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {isQuestion && smartSearch.trim() ? (
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-accent border border-accent/20" style={{ background: "rgba(212,168,71,0.1)" }}>
                    <Search className="h-3 w-3" /> This looks like a question — Search will open AI Chat
                  </span>
                </div>
              ) : parsedTags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {parsedTags.map((tag, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-accent border border-accent/20" style={{ background: "rgba(212,168,71,0.1)" }}>
                      <Zap className="h-2.5 w-2.5" />
                      <span className="opacity-60">{tag.label}:</span> {tag.value}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="px-5 sm:px-7 pb-5 sm:pb-7 pt-3">
              <div ref={dropdownRef} className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 relative" style={{ overflow: "visible" }}>

                {/* Location */}
                <div className="relative">
                  <label className="text-[11px] font-semibold tracking-[0.15em] text-white/70 uppercase block mb-1.5">Location</label>
                  <button onClick={() => setOpenDropdown(openDropdown === "location" ? null : "location")}
                    className="w-full bg-white/90 hover:bg-white border border-white/50 rounded-xl px-3.5 py-[11px] text-sm text-left flex items-center justify-between transition-all focus:outline-none shadow-sm backdrop-blur-sm">
                    <span className={selLocation ? "text-foreground font-medium" : "text-muted-foreground"}>{selLocation || "All Locations"}</span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openDropdown === "location" ? "rotate-180" : ""}`} />
                  </button>
                  {openDropdown === "location" && (
                    <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-border/30 z-[9999] overflow-hidden">
                      <div className="p-3 border-b border-border">
                        <input value={locationSearch} onChange={(e) => setLocationSearch(e.target.value)}
                          placeholder="Search areas..." autoFocus
                          className="w-full px-3 py-2 text-sm bg-secondary/50 rounded-lg border border-border focus:outline-none" />
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        <p className="px-4 pt-3 pb-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">Popular locations</p>
                        {popularLocations.filter((l) => !locationSearch || l.name.toLowerCase().includes(locationSearch.toLowerCase())).map((loc) => (
                          <button key={loc.name} onMouseDown={(e) => { e.preventDefault(); setSelLocation(loc.name); setLocationSearch(""); setOpenDropdown(null); }}
                            className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted/60 transition-colors ${selLocation === loc.name ? "bg-primary/5" : ""}`}>
                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{loc.name}</p>
                              <p className="text-xs text-muted-foreground">{loc.city}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Property Type */}
                <div className="relative">
                  <label className="text-[11px] font-semibold tracking-[0.15em] text-white/70 uppercase block mb-1.5">Property type</label>
                  <button onClick={() => setOpenDropdown(openDropdown === "type" ? null : "type")}
                    className="w-full bg-white/90 hover:bg-white border border-white/50 rounded-xl px-3.5 py-[11px] text-sm text-left flex items-center justify-between transition-all focus:outline-none shadow-sm backdrop-blur-sm">
                    <span className={selType ? "text-foreground font-medium" : "text-muted-foreground"}>{selType || "Property type"}</span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openDropdown === "type" ? "rotate-180" : ""}`} />
                  </button>
                  {openDropdown === "type" && (
                    <div className="absolute top-full left-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-border/30 z-[9999] overflow-hidden">
                      <div className="p-1.5">
                        {propertyTypes.map((t) => (
                          <button key={t} onMouseDown={(e) => { e.preventDefault(); setSelType(selType === t ? "" : t); setOpenDropdown(null); }}
                            className={`w-full text-left px-4 py-3.5 text-sm rounded-xl hover:bg-muted/50 transition-colors ${selType === t ? "font-semibold text-primary bg-primary/5" : "text-foreground"}`}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Beds & Baths */}
                <div className="relative">
                  <label className="text-[11px] font-semibold tracking-[0.15em] text-white/70 uppercase block mb-1.5">Beds & Baths</label>
                  <button onClick={() => setOpenDropdown(openDropdown === "beds" ? null : "beds")}
                    className="w-full bg-white/90 hover:bg-white border border-white/50 rounded-xl px-3.5 py-[11px] text-sm text-left flex items-center justify-between transition-all focus:outline-none shadow-sm backdrop-blur-sm">
                    <span className={(selBedroom || selBathroom) ? "text-foreground font-medium" : "text-muted-foreground"}>
                      {[selBedroom && `${selBedroom} bed`, selBathroom && `${selBathroom} bath`].filter(Boolean).join(", ") || "Beds & Baths"}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openDropdown === "beds" ? "rotate-180" : ""}`} />
                  </button>
                  {openDropdown === "beds" && (
                    <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-border/30 z-[9999] p-5">
                      <div className="mb-4">
                        <p className="text-base font-bold text-foreground mb-3">Bedrooms</p>
                        <div className="flex flex-wrap gap-2">
                          {bedroomOptions.map((b) => (
                            <button key={b} onMouseDown={(e) => { e.preventDefault(); setSelBedroom(selBedroom === b ? "" : b); }}
                              className={`min-w-[44px] h-11 px-3 rounded-2xl text-sm font-medium border-2 transition-all ${selBedroom === b ? "border-primary bg-primary text-primary-foreground" : "border-border/60 bg-[#f5f0e8] text-foreground hover:border-primary/40"}`}>
                              {b}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-base font-bold text-foreground mb-3">Bathrooms</p>
                        <div className="flex flex-wrap gap-2">
                          {bathroomOptions.map((b) => (
                            <button key={b} onMouseDown={(e) => { e.preventDefault(); setSelBathroom(selBathroom === b ? "" : b); }}
                              className={`min-w-[44px] h-11 px-3 rounded-2xl text-sm font-medium border-2 transition-all ${selBathroom === b ? "border-primary bg-primary text-primary-foreground" : "border-border/60 bg-[#f5f0e8] text-foreground hover:border-primary/40"}`}>
                              {b}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Budget */}
                <div className="relative">
                  <label className="text-[11px] font-semibold tracking-[0.15em] text-white/70 uppercase block mb-1.5">Your Budget</label>
                  <button onClick={() => setOpenDropdown(openDropdown === "budget" ? null : "budget")}
                    className="w-full bg-white/90 hover:bg-white border border-white/50 rounded-xl px-3.5 py-[11px] text-sm text-left flex items-center justify-between transition-all focus:outline-none shadow-sm backdrop-blur-sm">
                    <span className={selBudget ? "text-foreground font-medium" : "text-muted-foreground"}>{selBudget || "Max. Price"}</span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openDropdown === "budget" ? "rotate-180" : ""}`} />
                  </button>
                  {openDropdown === "budget" && (
                    <div className="absolute top-full left-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-border/30 z-[9999] overflow-hidden">
                      <div className="p-1.5">
                        {budgets.map((b) => (
                          <button key={b} onMouseDown={(e) => { e.preventDefault(); setSelBudget(selBudget === b ? "" : b); setOpenDropdown(null); }}
                            className={`w-full text-left px-4 py-3.5 text-sm rounded-xl hover:bg-muted/50 transition-colors ${selBudget === b ? "font-semibold text-primary bg-primary/5" : "text-foreground"}`}>
                            AED {b}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Search */}
                <div className="flex flex-col justify-end col-span-2 lg:col-span-1">
                  <button onClick={handleSearch}
                    className="w-full text-white py-[13px] rounded-xl font-bold flex items-center justify-center gap-2.5 transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] text-sm tracking-wide uppercase"
                    style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)", boxShadow: "0 4px 20px rgba(212,168,71,0.3)" }}>
                    <Search className="h-4 w-4" />
                    {isQuestion && smartSearch.trim() ? "Ask AI" : "Search"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden sm:block" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center pt-2">
          <div className="w-1 h-2 rounded-full bg-white/60" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;