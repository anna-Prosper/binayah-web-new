"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Search, ChevronDown, Zap, X, Sparkles } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
const heroImage = "/assets/dubai-hero.jpg";
import ParticleConstellation from "./ParticleConstellation";
import TypewriterHeadline from "./TypewriterHeadline";

const statusTabs = ["All Status", "For Rent", "For Sale"];
const propertyTypes = ["Apartment", "Villa", "Townhouse", "Penthouse", "Studio"];
const locations = ["Downtown Dubai", "Dubai Marina", "Palm Jumeirah", "JBR", "Business Bay", "DIFC", "JVC / JVT", "Dubai Hills", "Creek Harbour"];
const bedrooms = ["Studio", "1 Bedroom", "2 Bedrooms", "3 Bedrooms", "4+ Bedrooms"];
const budgets = ["Up to 500K", "500K - 1M", "1M - 2M", "2M - 5M", "5M - 10M", "10M+"];

// ── Smart search parser ──
const areaKeywords: Record<string, string> = {
  downtown: "Downtown Dubai", marina: "Dubai Marina", palm: "Palm Jumeirah",
  "business bay": "Business Bay", jvc: "JVC / JVT", jvt: "JVC / JVT",
  "dubai hills": "Dubai Hills", hills: "Dubai Hills", creek: "Creek Harbour",
  jbr: "JBR", difc: "DIFC", jumeirah: "Palm Jumeirah",
};
const typeKeywords: Record<string, string> = {
  apartment: "Apartment", apt: "Apartment", flat: "Apartment",
  villa: "Villa", townhouse: "Townhouse", penthouse: "Penthouse", studio: "Studio",
};
const bedroomKeywords: Record<string, string> = {
  studio: "Studio", "1 bed": "1 Bedroom", "1br": "1 Bedroom", "1 bdr": "1 Bedroom", "1bed": "1 Bedroom",
  "2 bed": "2 Bedrooms", "2br": "2 Bedrooms", "2 bdr": "2 Bedrooms", "2bed": "2 Bedrooms",
  "3 bed": "3 Bedrooms", "3br": "3 Bedrooms", "3 bdr": "3 Bedrooms", "3bed": "3 Bedrooms",
  "4 bed": "4+ Bedrooms", "4br": "4+ Bedrooms", "4 bdr": "4+ Bedrooms",
  "5 bed": "4+ Bedrooms", "5br": "4+ Bedrooms",
};

function parseSmartSearch(input: string) {
  const lower = input.toLowerCase().trim();
  const tags: { label: string; value: string }[] = [];
  let location = "", type = "", bedroom = "", budget = "";

  // Area
  for (const [kw, val] of Object.entries(areaKeywords)) {
    if (lower.includes(kw)) { location = val; tags.push({ label: "Area", value: val }); break; }
  }
  // Type
  for (const [kw, val] of Object.entries(typeKeywords)) {
    if (lower.includes(kw)) { type = val; tags.push({ label: "Type", value: val }); break; }
  }
  // Bedrooms
  for (const [kw, val] of Object.entries(bedroomKeywords)) {
    if (lower.includes(kw)) { bedroom = val; tags.push({ label: "Beds", value: val }); break; }
  }
  // Budget
  const numMatch = lower.match(/(\d[\d,.]*)\s*(m|million|k)?/);
  if (numMatch) {
    let num = parseFloat(numMatch[1].replace(/,/g, ""));
    const unit = numMatch[2];
    if (unit === "m" || unit === "million") num *= 1_000_000;
    else if (unit === "k") num *= 1_000;
    else if (!unit && num < 100) num *= 1_000_000;

    if (num <= 500_000) budget = "Up to 500K";
    else if (num <= 1_000_000) budget = "500K - 1M";
    else if (num <= 2_000_000) budget = "1M - 2M";
    else if (num <= 5_000_000) budget = "2M - 5M";
    else if (num <= 10_000_000) budget = "5M - 10M";
    else budget = "10M+";
    tags.push({ label: "Budget", value: budget });
  }

  return { location, type, bedroom, budget, tags };
}

const searchPlaceholders = [
  '"3 bed villa in Palm under 5M"',
  '"Studio in JVC for investment"',
  '"2BR Marina apartment with sea view"',
  '"Family townhouse in Dubai Hills"',
  '"Off-plan in Creek Harbour"',
];

const HeroSection = () => {
  const [activeTab, setActiveTab] = useState("All Status");
  const [smartSearch, setSmartSearch] = useState("");
  const [parsedTags, setParsedTags] = useState<{ label: string; value: string }[]>([]);
  const [selLocation, setSelLocation] = useState("");
  const [selType, setSelType] = useState("");
  const [selBedroom, setSelBedroom] = useState("");
  const [selBudget, setSelBudget] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const ref = useRef<HTMLDivElement>(null);
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

  const handleSmartInput = useCallback((val: string) => {
    setSmartSearch(val);
    if (val.trim().length > 1) {
      const { location, type, bedroom, budget, tags } = parseSmartSearch(val);
      setParsedTags(tags);
      if (location) setSelLocation(location);
      if (type) setSelType(type);
      if (bedroom) setSelBedroom(bedroom);
      if (budget) setSelBudget(budget);
    } else {
      setParsedTags([]);
    }
  }, []);

  const clearSmartSearch = () => {
    setSmartSearch("");
    setParsedTags([]);
    setSelLocation("");
    setSelType("");
    setSelBedroom("");
    setSelBudget("");
  };

  const handleSearch = () => {
    // Scroll to PropertyMatcher section with pre-filled data
    const matcher = document.getElementById("property-matcher");
    if (matcher) matcher.scrollIntoView({ behavior: "smooth" });
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
      <motion.div
        className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-24 pb-6 sm:pb-12"
        style={{ y: textY, opacity }}
      >
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

        {/* Search Card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-5xl mx-auto"
        >
          <div className="flex justify-center gap-0.5 mb-0">
            {statusTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-4 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm font-medium rounded-t-xl transition-all duration-300 ${
                  activeTab === tab
                    ? "bg-primary text-primary-foreground shadow-lg"
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
                <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-accent" />
                <input
                  value={smartSearch}
                  onChange={(e) => handleSmartInput(e.target.value)}
                  placeholder={`Try: ${searchPlaceholders[placeholderIndex]} — AI fills the filters`}
                  className="w-full pl-10 pr-10 py-3 bg-secondary/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
                />
                {smartSearch && (
                  <button onClick={clearSmartSearch} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              {parsedTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {parsedTags.map((tag, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-lg text-[11px] font-medium">
                      <Zap className="h-2.5 w-2.5" />
                      <span className="opacity-60">{tag.label}:</span> {tag.value}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Filter dropdowns */}
            <div className="p-5 sm:p-7 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                <FilterSelect label="Looking For" placeholder="Property Type" options={propertyTypes} value={selType} onChange={setSelType} />
                <FilterSelect label="Location" placeholder="All Locations" options={locations} value={selLocation} onChange={setSelLocation} />
                <FilterSelect label="Property Size" placeholder="Bedrooms" options={bedrooms} value={selBedroom} onChange={setSelBedroom} />
                <FilterSelect label="Your Budget" placeholder="Max. Price" options={budgets} value={selBudget} onChange={setSelBudget} />
                <div className="flex flex-col justify-end">
                  <button
                    onClick={handleSearch}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-[13px] rounded-xl font-semibold flex items-center justify-center gap-2.5 transition-all hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 text-sm"
                  >
                    <Search className="h-4 w-4" />
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

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

const FilterSelect = ({
  label, placeholder, options, value, onChange,
}: {
  label: string; placeholder: string; options: string[]; value: string; onChange: (v: string) => void;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-secondary/50 border border-border rounded-xl px-3.5 py-[11px] text-sm text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all hover:bg-secondary/80"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
    </div>
  </div>
);

export default HeroSection;
