"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Search, ChevronDown, Zap, X, Sparkles, MessageCircle } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRouter } from "next/navigation";
const heroImage = "/assets/dubai-hero.jpg";
import ParticleConstellation from "./ParticleConstellation";
import TypewriterHeadline from "./TypewriterHeadline";

const statusTabs = ["All", "Off-Plan", "Secondary"];
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
  { name: "Al Barari", city: "Dubai" },
  { name: "Al Reem Island", city: "Abu Dhabi" },
  { name: "Saadiyat Island", city: "Abu Dhabi" },
  { name: "Yas Island", city: "Abu Dhabi" },
  { name: "Villanova", city: "Dubai" },
  { name: "Arabian Ranches", city: "Dubai" },
  { name: "Tilal Al Ghaf", city: "Dubai" },
];
const locations = popularLocations.map((l) => l.name);
const bedroomOptions = ["Studio", "1", "2", "3", "4", "5", "6", "7", "7+"];
const bathroomOptions = ["1", "2", "3", "4", "5", "6", "7", "7+"];
const budgets = ["Up to 500K", "500K - 1M", "1M - 2M", "2M - 5M", "5M - 10M", "10M+"];

// ── Smart search parser ──
const areaKeywords: Record<string, string> = {
  downtown: "Downtown Dubai", "downtown dubai": "Downtown Dubai",
  marina: "Dubai Marina", "dubai marina": "Dubai Marina",
  palm: "Palm Jumeirah", "palm jumeirah": "Palm Jumeirah",
  "business bay": "Business Bay",
  jvc: "JVC", jvt: "JVT", "jumeirah village": "JVC",
  "dubai hills": "Dubai Hills Estate", hills: "Dubai Hills Estate",
  creek: "Creek Harbour", "creek harbour": "Creek Harbour",
  jbr: "JBR", "jumeirah beach": "JBR",
  difc: "DIFC",
  jumeirah: "Jumeirah",
  "mbr city": "MBR City", mbr: "MBR City", meydan: "MBR City",
  "al barari": "Al Barari", barari: "Al Barari",
  "dubai south": "Dubai South", expo: "Dubai South",
  "arabian ranches": "Arabian Ranches", ranches: "Arabian Ranches",
  "tilal al ghaf": "Tilal Al Ghaf", tilal: "Tilal Al Ghaf",
  villanova: "Villanova", mudon: "Mudon", serena: "Serena",
  "al reem": "Al Reem Island", "reem island": "Al Reem Island",
  saadiyat: "Saadiyat Island", yas: "Yas Island",
  "motor city": "Motor City", "sports city": "Sports City",
  "discovery gardens": "Discovery Gardens",
  "town square": "Town Square", "silicon oasis": "Silicon Oasis",
};
const typeKeywords: Record<string, string> = {
  apartment: "Apartment", apt: "Apartment", flat: "Apartment", "1br": "Apartment",
  villa: "Villa", villas: "Villa",
  townhouse: "Townhouse", townhome: "Townhouse",
  penthouse: "Penthouse", ph: "Penthouse",
  studio: "Studio",
  compound: "Compound",
  duplex: "Duplex",
};
const bedroomKeywords: Record<string, string> = {
  studio: "Studio",
  "1 bed": "1", "1br": "1", "1 bdr": "1", "1bed": "1", "1 bedroom": "1", "one bed": "1",
  "2 bed": "2", "2br": "2", "2 bdr": "2", "2bed": "2", "2 bedroom": "2", "two bed": "2",
  "3 bed": "3", "3br": "3", "3 bdr": "3", "3bed": "3", "3 bedroom": "3", "three bed": "3",
  "4 bed": "4", "4br": "4", "4 bdr": "4", "4bed": "4", "4 bedroom": "4",
  "5 bed": "5", "5br": "5", "5bed": "5",
};

// Detect if input is a general question vs property search
const questionPatterns = [
  /^(what|how|why|when|where|who|can you|tell me|explain|is it|should i|do you)/i,
  /\?$/,
  /^(hi|hello|hey|good morning|good evening)/i,
  /\b(advice|recommend|help me|suggest|compare|difference|best time|market|invest|roi|visa|mortgage|tax|legal)\b/i,
];

function isGeneralQuestion(input: string): boolean {
  const trimmed = input.trim();
  if (trimmed.length < 5) return false;
  return questionPatterns.some((p) => p.test(trimmed));
}

interface ParsedSearch {
  location: string; type: string; bedroom: string;
  budget: string; status: string;
  tags: { key: string; label: string; value: string }[];
}

function parseSmartSearch(input: string): ParsedSearch {
  const lower = input.toLowerCase().trim();
  const tags: { key: string; label: string; value: string }[] = [];
  let location = "", type = "", bedroom = "", budget = "", status = "";

  // Status
  if (/off[\s-]?plan|new[\s-]?launch|under[\s-]?construction|offplan/i.test(lower)) {
    status = "Off-Plan"; tags.push({ key: "status", label: "Status", value: "Off-Plan" });
  } else if (/ready|secondary|completed|handover|resale|\brent\b|rental/i.test(lower)) {
    status = "Secondary"; tags.push({ key: "status", label: "Status", value: "Secondary" });
  }

  // Area — longest match first
  const areaEntries = Object.entries(areaKeywords).sort((a, b) => b[0].length - a[0].length);
  for (const [kw, val] of areaEntries) {
    if (lower.includes(kw)) { location = val; tags.push({ key: "location", label: "Area", value: val }); break; }
  }
  // Type — longest first
  const typeEntries = Object.entries(typeKeywords).sort((a, b) => b[0].length - a[0].length);
  for (const [kw, val] of typeEntries) {
    if (lower.includes(kw)) { type = val; tags.push({ key: "type", label: "Type", value: val }); break; }
  }
  // Bedrooms — longest first
  const bedEntries = Object.entries(bedroomKeywords).sort((a, b) => b[0].length - a[0].length);
  for (const [kw, val] of bedEntries) {
    if (lower.includes(kw)) { bedroom = val; tags.push({ key: "bedroom", label: "Beds", value: val === "Studio" ? "Studio" : `${val} BR` }); break; }
  }
  // Budget — AED amounts or shorthand
  const numMatch = lower.match(/(\d[\d,.]*)\s*(m|million|mn|k|aed)?(?=\s|$|[^\d])/);
  if (numMatch) {
    let num = parseFloat(numMatch[1].replace(/,/g, ""));
    const unit = numMatch[2];
    if (unit === "m" || unit === "million" || unit === "mn") num *= 1_000_000;
    else if (unit === "k") num *= 1_000;
    else if (!unit && num < 1000 && num > 0) num *= 1_000_000; // e.g. "2.5" = 2.5M
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

// Live autocomplete suggestions as user types
function getSuggestions(input: string): string[] {
  if (input.trim().length < 2) return [];
  const lower = input.toLowerCase();
  const suggestions: string[] = [];

  // Area matches
  popularLocations.forEach(({ name }) => {
    if (name.toLowerCase().includes(lower) && !suggestions.includes(name)) {
      suggestions.push(`${name} properties`);
    }
  });

  // Type + area combos
  const typeMatch = Object.entries(typeKeywords).find(([kw]) => lower.includes(kw));
  const areaMatch = Object.entries(areaKeywords).find(([kw]) => lower.includes(kw));
  if (typeMatch && areaMatch) {
    suggestions.unshift(`${typeMatch[1]} in ${areaMatch[1]}`);
  }

  return suggestions.slice(0, 4);
}

const searchPlaceholders = [
  '"2BR apartment in Marina under 2M"',
  '"Off-plan villa in Dubai Hills"',
  '"Secondary apartment in Downtown"',
  '"What\'s the best area to invest?"',
  '"3 bed townhouse in MBR City"',
];

const HeroSection = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("All");
  const [smartSearch, setSmartSearch] = useState("");
  const [parsedTags, setParsedTags] = useState<{ key: string; label: string; value: string }[]>([]);
  const [isQuestion, setIsQuestion] = useState(false);
  const [selLocation, setSelLocation] = useState("");
  const [selType, setSelType] = useState("");
  const [selBedroom, setSelBedroom] = useState("");
  const [selBathroom, setSelBathroom] = useState("");
  const [selBudget, setSelBudget] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [placeSuggestions, setPlaceSuggestions] = useState<{description:string;area:string;city:string;placeId:string}[]>([]);
  const placesTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % searchPlaceholders.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const removeTag = (key: string) => {
    setParsedTags((prev) => prev.filter((t) => t.key !== key));
    if (key === "location") setSelLocation("");
    if (key === "type") setSelType("");
    if (key === "bedroom") setSelBedroom("");
    if (key === "budget") setSelBudget("");
    if (key === "status") setActiveTab("All");
  };

  const handleSmartInput = useCallback((val: string) => {
    setSmartSearch(val);
    const isQ = isGeneralQuestion(val);
    setIsQuestion(isQ);
    setShowSuggestions(val.trim().length >= 2);

    // Parse filters regardless — even a question might contain location/type clues
    if (val.trim().length > 1) {
      if (!isQ) {
        const { location, type, bedroom, budget, status, tags } = parseSmartSearch(val);
        setParsedTags(tags);
        setSuggestions(getSuggestions(val));
        if (location) setSelLocation(location);
        if (type) setSelType(type);
        if (bedroom) setSelBedroom(bedroom);
        if (budget) setSelBudget(budget);
        if (status && status !== activeTab) setActiveTab(status);
      } else {
        setParsedTags([]);
        setSuggestions([]);
      }

      // Always fetch Places suggestions — works for both searches and questions
      // (e.g. "golden visa in Dubai Marina" → still shows Marina as a location suggestion)
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
      setSuggestions([]);
      setPlaceSuggestions([]);
      if (placesTimerRef.current) clearTimeout(placesTimerRef.current);
    }
  }, [activeTab]);

  const clearSmartSearch = () => {
    setSmartSearch("");
    setParsedTags([]);
    setIsQuestion(false);
    setSelLocation("");
    setSelType("");
    setSelBedroom("");
    setSelBudget("");
  };

  const handleSearch = () => {
    // If it's a general question, open AI chat with the question
    if (isQuestion && smartSearch.trim()) {
      window.dispatchEvent(
        new CustomEvent("open-ai-chat", { detail: { question: smartSearch.trim() } })
      );
      return;
    }

    // Build search URL params
    const params = new URLSearchParams();
    if (activeTab && activeTab !== "All") params.set("status", activeTab);
    if (selType) params.set("type", selType);
    if (selLocation) params.set("location", selLocation);
    if (selBedroom) params.set("bedrooms", selBedroom);
    if (selBathroom) params.set("bathrooms", selBathroom);
    if (selBudget) params.set("budget", selBudget);
    if (smartSearch.trim() && !isQuestion) params.set("q", smartSearch.trim());

    const query = params.toString();
    router.push(`/search${query ? `?${query}` : ""}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 sm:pt-0">
      {/* Parallax Background */}
      <motion.div className="absolute inset-0" style={{ y: imageY }}>
        <img src={heroImage} alt="Dubai skyline at golden hour" className="h-[120%] w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />
      </motion.div>

      {/* Particle constellation */}
      <ParticleConstellation />

      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
        <div className="absolute top-1/4 left-8 w-px h-32 bg-gradient-to-b from-transparent via-accent/30 to-transparent hidden lg:block" />
        <div className="absolute top-1/3 right-8 w-px h-24 bg-gradient-to-b from-transparent via-white/20 to-transparent hidden lg:block" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-24 pb-6 sm:pb-12">
        {/* Headline fades + moves on scroll */}
        <motion.div style={{ y: textY, opacity }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-8 sm:mb-14"
        >
          <motion.div initial={{ width: 0 }} animate={{ width: "3rem" }} transition={{ duration: 0.8, delay: 0.3 }} className="h-[2px] bg-accent mx-auto mb-4 sm:mb-6" />
          <p className="text-accent font-medium tracking-[0.4em] uppercase text-[10px] sm:text-sm mb-3 sm:mb-5">Binayah Properties</p>
          <h1 className="text-3xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-[0.95] mb-4 sm:mb-6">
            <TypewriterHeadline /><br /><span className="italic font-light">Sale & Rent</span>
          </h1>
          <p className="text-white/60 text-sm sm:text-lg max-w-xl mx-auto font-light px-4 sm:px-0">
            Your trusted partner for buying, selling & renting properties in Dubai
          </p>
        </motion.div>

        </motion.div>{/* end headline fade wrapper */}

        {/* Search Card — never fades, always fully opaque */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-5xl mx-auto"
        >
          {/* Tabs */}
          <div className="flex justify-center gap-0.5 mb-0">
            {statusTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-4 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm font-medium rounded-t-xl transition-all duration-300 ${
                  activeTab === tab
                    ? "text-white shadow-lg"
                    : "bg-white/10 text-white/80 hover:bg-white/20 backdrop-blur-sm hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="bg-card/95 backdrop-blur-md rounded-b-2xl rounded-tr-2xl shadow-2xl shadow-black/20 border border-border/50">
            {/* Smart search bar */}
            <div className="px-5 sm:px-7 pt-5 sm:pt-6">
              <div className="relative">
                {/* Gradient border glow on focus */}
                <div className="relative group">
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm"
                    style={{ background: "linear-gradient(135deg, rgba(11,61,46,0.3), rgba(212,168,71,0.2))" }} />
                  <div className="relative flex items-center">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none z-10">
                      <Sparkles className="h-4 w-4" style={{ color: "#D4A847" }} />
                      <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:block" style={{ color: "#D4A847" }}>AI Search</span>
                    </div>
                    <input
                      value={smartSearch}
                      onChange={(e) => handleSmartInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onFocus={() => setShowSuggestions(smartSearch.trim().length >= 2)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                      placeholder={searchPlaceholders[placeholderIndex]}
                      className="w-full pl-24 sm:pl-28 pr-12 py-4 bg-background border-2 border-border rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 transition-all"
                    />
                    {smartSearch ? (
                      <button onClick={clearSmartSearch} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    ) : (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/50 hidden sm:block">⌘K</div>
                    )}
                  </div>
                </div>

                {/* Suggestions dropdown — Places locations + local combos, always shown when typing */}
                {showSuggestions && (placeSuggestions.length > 0 || suggestions.length > 0) && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card rounded-xl border border-border shadow-lg z-50 overflow-hidden max-h-72 overflow-y-auto">

                    {/* Google Places location results */}
                    {placeSuggestions.length > 0 && (
                      <>
                        <p className="px-4 pt-2.5 pb-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Locations</p>
                        {placeSuggestions.slice(0, 5).map((p, i) => (
                          <button key={`place-${i}`}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              // Fill location from Places result
                              const loc = p.area || p.description.split(",")[0].trim();
                              setSelLocation(loc);
                              setSmartSearch((prev) => {
                                // Append location to existing query if not already there
                                const lower = prev.toLowerCase();
                                return lower.includes(loc.toLowerCase()) ? prev : `${prev} in ${loc}`.trim();
                              });
                              setPlaceSuggestions([]);
                              setShowSuggestions(false);
                            }}
                            className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors border-b border-border/20 last:border-0">
                            <div className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center flex-shrink-0">
                              <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{p.area || p.description.split(",")[0]}</p>
                              <p className="text-xs text-muted-foreground truncate">{[p.city, "UAE"].filter(Boolean).join(", ")}</p>
                            </div>
                          </button>
                        ))}
                      </>
                    )}

                    {/* Local smart combos */}
                    {suggestions.length > 0 && (
                      <>
                        {placeSuggestions.length > 0 && <div className="h-px bg-border/50 mx-4" />}
                        <p className="px-4 pt-2.5 pb-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Suggestions</p>
                        {suggestions.map((s, i) => (
                          <button key={`sugg-${i}`}
                            onMouseDown={(e) => { e.preventDefault(); handleSmartInput(s); setShowSuggestions(false); }}
                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors flex items-center gap-2.5 border-b border-border/20 last:border-0">
                            <Search className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                            <span>{s}</span>
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Parsed tags with remove buttons */}
              {isQuestion && smartSearch.trim() ? (
                <div className="flex items-center gap-2 mt-2.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium text-white" style={{ background: "linear-gradient(135deg, rgba(212,168,71,0.9), rgba(184,146,47,0.9))" }}>
                    <MessageCircle className="h-3 w-3" />
                    Question detected — will open AI Chat
                  </span>
                </div>
              ) : parsedTags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mt-2.5 items-center">
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Detected:</span>
                  {parsedTags.map((tag) => (
                    <motion.span
                      key={tag.key}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full text-[11px] font-semibold text-white"
                      style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
                    >
                      <span className="opacity-70">{tag.label}:</span>
                      <span>{tag.value}</span>
                      <button onClick={() => removeTag(tag.key)} className="ml-0.5 w-4 h-4 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors">
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </motion.span>
                  ))}
                </div>
              ) : smartSearch.trim().length >= 2 ? (
                <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1.5">
                  <Zap className="h-3 w-3 text-accent" />
                  Try: <span className="font-medium text-foreground">"2BR villa in Arabian Ranches"</span> or <span className="font-medium text-foreground">"off-plan under 2M"</span>
                </p>
              ) : (
                <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" style={{ color: "#D4A847" }} />
                  Type naturally — AI fills the filters automatically
                </p>
              )}
            </div>

            {/* Filter dropdowns */}
            <div className="p-5 sm:p-7 pt-4">
              <div ref={dropdownRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 relative">

                {/* Location */}
                <div className="relative">
                  <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase block mb-1.5">Location</label>
                  <button
                    onClick={() => setOpenDropdown(openDropdown === "location" ? null : "location")}
                    className="w-full bg-secondary/50 border border-border rounded-xl px-3.5 py-[11px] text-sm text-left flex items-center justify-between hover:bg-secondary/80 transition-all focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <span className={selLocation ? "text-foreground" : "text-muted-foreground"}>{selLocation || "All Locations"}</span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openDropdown === "location" ? "rotate-180" : ""}`} />
                  </button>
                  {openDropdown === "location" && (
                    <div className="absolute top-full left-0 mt-2 w-72 bg-card rounded-2xl shadow-2xl border border-border z-50 overflow-hidden">
                      <div className="p-3 border-b border-border">
                        <input
                          value={locationSearch}
                          onChange={(e) => setLocationSearch(e.target.value)}
                          placeholder="Search areas..."
                          className="w-full px-3 py-2 text-sm bg-secondary/50 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
                          autoFocus
                        />
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        <p className="px-4 pt-3 pb-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">Popular locations</p>
                        {popularLocations
                          .filter((l) => !locationSearch || l.name.toLowerCase().includes(locationSearch.toLowerCase()))
                          .map((loc) => (
                          <button
                            key={loc.name}
                            onMouseDown={(e) => { e.preventDefault(); setSelLocation(loc.name); setLocationSearch(""); setOpenDropdown(null); }}
                            className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted/60 transition-colors ${selLocation === loc.name ? "bg-primary/5" : ""}`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                              <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
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
                  <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase block mb-1.5">Property type</label>
                  <button
                    onClick={() => setOpenDropdown(openDropdown === "type" ? null : "type")}
                    className="w-full bg-secondary/50 border border-border rounded-xl px-3.5 py-[11px] text-sm text-left flex items-center justify-between hover:bg-secondary/80 transition-all focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <span className={selType ? "text-foreground" : "text-muted-foreground"}>{selType || "Property type"}</span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openDropdown === "type" ? "rotate-180" : ""}`} />
                  </button>
                  {openDropdown === "type" && (
                    <div className="absolute top-full left-0 mt-2 w-52 bg-card rounded-2xl shadow-2xl border border-border z-50 overflow-hidden">
                      <div className="p-1.5">
                        <div className="px-3 py-2.5 text-sm font-semibold text-primary bg-primary/5 rounded-xl mb-1">Property type</div>
                        {propertyTypes.map((t) => (
                          <button
                            key={t}
                            onMouseDown={(e) => { e.preventDefault(); setSelType(selType === t ? "" : t); setOpenDropdown(null); }}
                            className={`w-full text-left px-3 py-3 text-sm rounded-xl hover:bg-muted/60 transition-colors ${selType === t ? "font-semibold text-primary" : "text-foreground"}`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Beds & Baths */}
                <div className="relative">
                  <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase block mb-1.5">Beds & Baths</label>
                  <button
                    onClick={() => setOpenDropdown(openDropdown === "beds" ? null : "beds")}
                    className="w-full bg-secondary/50 border border-border rounded-xl px-3.5 py-[11px] text-sm text-left flex items-center justify-between hover:bg-secondary/80 transition-all focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <span className={(selBedroom || selBathroom) ? "text-foreground" : "text-muted-foreground"}>
                      {[selBedroom && `${selBedroom} bed`, selBathroom && `${selBathroom} bath`].filter(Boolean).join(", ") || "Beds & Baths"}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openDropdown === "beds" ? "rotate-180" : ""}`} />
                  </button>
                  {openDropdown === "beds" && (
                    <div className="absolute top-full left-0 mt-2 w-72 bg-card rounded-2xl shadow-2xl border border-border z-50 p-4">
                      <div className="mb-4">
                        <p className="text-sm font-bold text-foreground mb-2.5">Bedrooms</p>
                        <div className="flex flex-wrap gap-2">
                          {bedroomOptions.map((b) => (
                            <button
                              key={b}
                              onMouseDown={(e) => { e.preventDefault(); setSelBedroom(selBedroom === b ? "" : b); }}
                              className={`min-w-[36px] h-9 px-2.5 rounded-lg text-xs font-medium border transition-all ${
                                selBedroom === b
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border bg-secondary/50 text-foreground hover:border-primary/40"
                              }`}
                            >
                              {b}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground mb-2.5">Bathrooms</p>
                        <div className="flex flex-wrap gap-2">
                          {bathroomOptions.map((b) => (
                            <button
                              key={b}
                              onMouseDown={(e) => { e.preventDefault(); setSelBathroom(selBathroom === b ? "" : b); }}
                              className={`min-w-[36px] h-9 px-2.5 rounded-lg text-xs font-medium border transition-all ${
                                selBathroom === b
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border bg-secondary/50 text-foreground hover:border-primary/40"
                              }`}
                            >
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
                  <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase block mb-1.5">Your Budget</label>
                  <button
                    onClick={() => setOpenDropdown(openDropdown === "budget" ? null : "budget")}
                    className="w-full bg-secondary/50 border border-border rounded-xl px-3.5 py-[11px] text-sm text-left flex items-center justify-between hover:bg-secondary/80 transition-all focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <span className={selBudget ? "text-foreground" : "text-muted-foreground"}>{selBudget || "Max. Price"}</span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openDropdown === "budget" ? "rotate-180" : ""}`} />
                  </button>
                  {openDropdown === "budget" && (
                    <div className="absolute top-full left-0 mt-2 w-52 bg-card rounded-2xl shadow-2xl border border-border z-50 overflow-hidden">
                      <div className="p-1.5">
                        {budgets.map((b) => (
                          <button
                            key={b}
                            onMouseDown={(e) => { e.preventDefault(); setSelBudget(selBudget === b ? "" : b); setOpenDropdown(null); }}
                            className={`w-full text-left px-3 py-3 text-sm rounded-xl hover:bg-muted/60 transition-colors ${selBudget === b ? "font-semibold text-primary" : "text-foreground"}`}
                          >
                            AED {b}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Search button */}
                <div className="flex flex-col justify-end">
                  <button
                    onClick={handleSearch}
                    className="w-full py-[13px] rounded-xl font-semibold flex items-center justify-center gap-2.5 transition-all hover:shadow-lg hover:-translate-y-0.5 text-sm text-white"
                    style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)", boxShadow: "0 4px 16px rgba(212,168,71,0.3)" }}
                  >
                    {isQuestion && smartSearch.trim() ? (
                      <><MessageCircle className="h-4 w-4" />Ask AI</>
                    ) : (
                      <><Search className="h-4 w-4" />Search</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center pt-2"
        >
          <div className="w-1 h-2 rounded-full bg-white/60" />
        </motion.div>
      </motion.div>
    </section>
  );
};


export default HeroSection;