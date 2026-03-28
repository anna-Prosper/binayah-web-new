// @ts-nocheck
"use client";


import Link from "next/link";

import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, MapPin, Building2, Calendar, Wallet, Bed, Ruler, Shield,
  Phone, MessageCircle, Mail, ChevronRight, ChevronDown, Play, CheckCircle2,
  Star, Clock, Users, FileText, ExternalLink, Download, Image as ImageIcon,
  Home, Landmark, TrendingUp, CreditCard, Banknote, Globe, Languages, Compass, Waves, X,
  Sparkles, Eye, ArrowRight, Dumbbell, Baby, Car, Lock, Flame,
  TreePine, Store, Smartphone, HeartPulse,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import AIChatWidget from "@/components/AIChatWidget";
import FloorPlanPlaceholder from "@/components/FloorPlanPlaceholder";
const amenitiesPlaceholder = "/assets/amenities-placeholder.jpg";
const videoThumbnail = "/assets/video-thumbnail.jpg";
import UnitImagePlaceholder from "@/components/UnitImagePlaceholder";
import { useState, useEffect } from "react";

type NearbyAttraction = { name: string; type: string; distance: string };
type FAQ = { question: string; answer: string };

const CURRENCY_RATES: Record<string, number> = {
  AED: 1,
  USD: 0.2723,
  EUR: 0.2512,
  GBP: 0.2155,
  CNY: 1.9788,
  RUB: 24.89,
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  AED: "AED",
  USD: "USD",
  EUR: "EUR",
  GBP: "GBP",
  CNY: "CNY",
  RUB: "RUB",
};

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ar", label: "العربية", flag: "🇦🇪" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
];

const formatPrice = (price: number | null, baseCurrency = "AED", targetCurrency = "AED") => {
  if (!price) return "Price on Request";
  const rate = CURRENCY_RATES[targetCurrency] || 1;
  const converted = price * rate;
  const symbol = CURRENCY_SYMBOLS[targetCurrency] || targetCurrency;
  if (converted >= 1_000_000) return `${symbol} ${(converted / 1_000_000).toFixed(1)}M`;
  if (converted >= 1_000) return `${symbol} ${(converted / 1_000).toFixed(0)}K`;
  return `${symbol} ${converted.toLocaleString()}`;
};

const formatPriceFull = (price: number | null, baseCurrency = "AED", targetCurrency = "AED") => {
  if (!price) return null;
  const rate = CURRENCY_RATES[targetCurrency] || 1;
  const converted = Math.round(price * rate);
  const symbol = CURRENCY_SYMBOLS[targetCurrency] || targetCurrency;
  return `${symbol} ${converted.toLocaleString()}`;
};

const formatHandover = (date: string | null | undefined) => {
  if (!date) return "TBA";
  // If it's already a readable string like "Q4 2027", "2026", "December 2025" — use as-is
  if (/^(Q[1-4]|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(date)) return date;
  if (/^\d{4}$/.test(date)) return date; // Just a year
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return date; // Return raw string if can't parse
    return d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
  } catch {
    return date;
  }
};

const statusColor = (status: string) => {
  switch (status) {
    case "Ready":
    case "Completed":
      return "bg-emerald-500/90 text-white";
    case "Off-Plan":
      return "bg-primary text-primary-foreground";
    case "New Launch":
      return "bg-accent text-accent-foreground";
    default:
      return "bg-accent/80 text-accent-foreground";
  }
};

const attractionIcon = (type: string) => {
  const t = type?.toLowerCase() || "";
  if (t.includes("beach") || t.includes("marina")) return Waves;
  if (t.includes("mall") || t.includes("retail")) return Home;
  if (t.includes("airport")) return Globe;
  if (t.includes("landmark")) return Landmark;
  if (t.includes("park") || t.includes("garden")) return Compass;
  if (t.includes("transport") || t.includes("metro")) return ArrowRight;
  return MapPin;
};

const ProjectDetailPage = ({ serverProject }: { serverProject: any }) => {
  const [activeImage, setActiveImage] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "payment" | "faq" | "location">("overview");
  const [currency, setCurrency] = useState("AED");
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [language, setLanguage] = useState("en");
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [activeUnitTab, setActiveUnitTab] = useState(0);
  const [activeFloorPlanTab, setActiveFloorPlanTab] = useState(0);
  const [calcDownPct, setCalcDownPct] = useState(20);
  const [calcTerm, setCalcTerm] = useState(3);
  const [enquiryForm, setEnquiryForm] = useState({ name: "", email: "", phone: "", countryCode: "+971", unitType: "", message: "", contactMethod: "whatsapp" as "whatsapp" | "email" | "phone" });
  const [enquirySubmitted, setEnquirySubmitted] = useState(false);

const project = normalizeProject(serverProject);
  const isLoading = false;
  const error = null;

  function normalizeProject(serverProject: any) {
  const p = { ...(serverProject || {}) };

  // aliases
  p.googleMapsUrl = p.googleMapsUrl || p.mapUrl || "";
  p.videoUrl = p.videoUrl || p.videos?.[0]?.url || p.videos?.[0] || "";

  // empty strings -> safer defaults
  p.community = p.community || "";
  p.city = p.city || "Dubai";
  p.country = p.country || "UAE";

  // derive unitTypes from floorPlans if missing
  if ((!p.unitTypes || p.unitTypes.length === 0) && Array.isArray(p.floorPlans)) {
    const set = new Set<string>();
    for (const fp of p.floorPlans) {
      const b = fp?.bedrooms || "";
      if (/studio/i.test(b)) set.add("Studio");
      const m = b.match(/(\d+)\s*Bedroom/i);
      if (m) set.add(`${m[1]} Bedroom`);
    }
    p.unitTypes = [...set].sort((a, b) => {
      const ra = a === "Studio" ? 0 : Number(a.match(/\d+/)?.[0] || 99);
      const rb = b === "Studio" ? 0 : Number(b.match(/\d+/)?.[0] || 99);
      return ra - rb;
    });
  }

  // derive size range from floorPlans if missing
  if ((!p.unitSizeMin || !p.unitSizeMax) && Array.isArray(p.floorPlans)) {
    const sizes: number[] = [];
    for (const fp of p.floorPlans) {
      const s = String(fp?.size || "");
      for (const m of s.matchAll(/(\d{3,5})/g)) sizes.push(Number(m[1]));
    }
    if (sizes.length) {
      p.unitSizeMin = p.unitSizeMin || Math.min(...sizes);
      p.unitSizeMax = p.unitSizeMax || Math.max(...sizes);
    }
  }

  // fallback starting price from description if still null
  if (!p.startingPrice && typeof p.fullDescription === "string") {
    const txt = p.fullDescription.replace(/<[^>]+>/g, " ");
    const m = txt.match(/AED\s*([\d,]+)/i);
    if (m) p.startingPrice = Number(m[1].replace(/,/g, ""));
  }

  // amenities fallback
  if (!Array.isArray(p.amenities) || p.amenities.length === 0) {
    const txt = (p.fullDescription || "").replace(/<[^>]+>/g, " ");
    const known = ["Central AC","Gym","Children Pool","Beach Access","Waterfront","CCTV Cameras","Covered Parking","Children Play Area","Landmark View","Security","Shared Pool"];
    p.amenities = known.filter(a => new RegExp(a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(txt));
  }

  return p;
}

  useEffect(() => {
    if (project) {
      document.title = project.metaTitle || `${project.name} | Binayah Real Estate`;
    }
    return () => { document.title = "Binayah Real Estate"; };
  }, [project]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <div className="relative">
            <div className="w-14 h-14 border-2 border-primary/20 rounded-full" />
            <div className="w-14 h-14 border-2 border-primary border-t-transparent rounded-full animate-spin absolute inset-0" />
          </div>
          <p className="text-muted-foreground text-sm animate-pulse">Loading property details…</p>
        </div>
      </div>
    );
  }

  if (!project || error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-32 text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Building2 className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">Project Not Found</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">The project you're looking for doesn't exist or may have been removed from our listings.</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const images = project.imageGallery?.length ? project.imageGallery :
    project.featuredImage ? [project.featuredImage] : [
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200",
  ];
  const nearby = (project.nearbyAttractions as NearbyAttraction[] | null) || [];
  const dbFaqs = (project.faqs as FAQ[] | null) || [];
  const faqs = dbFaqs.length > 0 ? dbFaqs : [
    { question: "What is the payment plan?", answer: `${project.name} offers a flexible payment plan designed to suit both end-users and investors. Typically this includes a down payment on booking, installments during construction, and the remaining balance on handover. Contact us for the detailed payment schedule.` },
    { question: "Is this eligible for Golden Visa?", answer: "Yes, purchasing a property valued at AED 2 million or above qualifies for the UAE Golden Visa, granting a 10-year renewable residency. Our team can guide you through the application process." },
    { question: "What are the estimated service charges?", answer: "Service charges vary by unit type and size, typically ranging from AED 12-18 per sq.ft annually. These cover maintenance of common areas, facilities, security, and building management." },
    { question: "Can I rent out my unit?", answer: "Absolutely. Owners are free to rent out their units either on a long-term or short-term basis. The area offers strong rental yields, making it an excellent investment opportunity." },
    { question: "What is the expected handover date?", answer: project.completionDate ? `The expected handover date is ${project.completionDate}. Timelines are subject to construction progress and regulatory approvals.` : "Please contact our team for the latest handover timeline and construction updates." },
    { question: "Are pets allowed?", answer: "Pet policies are determined by the building management and community guidelines. Many developments in Dubai are pet-friendly with designated areas. We recommend confirming specific pet policies with the developer." },
    { question: "What are the nearby schools?", answer: "The area is well-served by reputable schools and nurseries within a short driving distance. Our team can provide a detailed list of nearby educational institutions based on your preferences." },
    { question: "Is there a mortgage option available?", answer: "Yes, mortgage financing is available through major UAE banks for both residents and non-residents. Typical loan-to-value ratios range from 50-80% depending on residency status. We can connect you with our banking partners for pre-approval." },
  ];
const hasPaymentInfo =
  project.downPayment ||
  project.paymentPlanSummary ||
  project.paymentPlanDetails ||
  project.paymentPlan;
  

  return (
    <div className="min-h-screen bg-background">
      <Navbar extraItems={
        <div className="flex items-center gap-2">
          {/* Currency Selector */}
          <div className="relative">
            <button
              onClick={() => { setShowCurrencyDropdown(!showCurrencyDropdown); setShowLangDropdown(false); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-md transition-all border border-white/10"
            >
              <Banknote className="h-3.5 w-3.5" />
              {currency}
              <ChevronDown className={`h-3 w-3 transition-transform ${showCurrencyDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showCurrencyDropdown && (
              <div className="absolute right-0 top-full mt-2 bg-foreground border border-white/10 rounded-lg shadow-2xl z-[100] py-1 min-w-[110px]">
                {Object.keys(CURRENCY_RATES).map((c) => (
                  <button
                    key={c}
                    onClick={() => { setCurrency(c); setShowCurrencyDropdown(false); }}
                    className={`w-full text-left px-3.5 py-2 text-xs hover:bg-white/10 transition-colors ${c === currency ? "text-accent font-bold" : "text-white/80"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => { setShowLangDropdown(!showLangDropdown); setShowCurrencyDropdown(false); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-md transition-all border border-white/10"
            >
              <Languages className="h-3.5 w-3.5" />
              {LANGUAGES.find(l => l.code === language)?.flag}
              <ChevronDown className={`h-3 w-3 transition-transform ${showLangDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showLangDropdown && (
              <div className="absolute right-0 top-full mt-2 bg-foreground border border-white/10 rounded-lg shadow-2xl z-[100] py-1 min-w-[140px]">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => { setLanguage(lang.code); setShowLangDropdown(false); }}
                    className={`w-full text-left px-3.5 py-2 text-xs hover:bg-white/10 transition-colors flex items-center gap-2 ${lang.code === language ? "text-accent font-bold" : "text-white/80"}`}
                  >
                    <span>{lang.flag}</span> {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      } />

      {/* ───── HERO SECTION ───── */}
      <section className="relative">
        {/* Full-width hero image */}
        <div className="relative h-[45vh] sm:h-[65vh] lg:h-[70vh] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={activeImage}
              src={images[activeImage]}
              alt={project.name}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full h-full object-cover"
            />
          </AnimatePresence>

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/30 to-transparent" />



          {/* Hero content at bottom */}
          <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 pb-4 sm:pb-8">
              {/* Breadcrumb */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-1.5 text-[11px] sm:text-sm text-white/60 mb-2 sm:mb-4 pointer-events-auto flex-wrap"
              >
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                <ChevronRight className="h-3 w-3" />
                <Link href="/off-plan" className="hover:text-white transition-colors">Projects</Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-white/90">{project.name}</span>
              </motion.div>

              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3 sm:gap-6">
                {/* Left: Project info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="pointer-events-auto flex-shrink-0"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold shadow-lg ${statusColor(project.status)}`}>
                      {project.status}
                    </span>
                    <span className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/20 shadow-lg">
                      {project.propertyType}
                    </span>
                  </div>
                  <p className="text-white/60 text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 flex items-center gap-1.5">
                    by <span className="text-accent font-semibold">{project.developerName}</span>
                  </p>
                  <h1 className="text-xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.1]">
                    {project.name}
                  </h1>
                  <p className="text-white/70 mt-1.5 sm:mt-3 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-base">
                    <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent" />
                    {project.community}, {project.city}, {project.country}
                  </p>
                </motion.div>

                {/* Right: Price above thumbnails */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="flex flex-col items-start lg:items-end gap-2 sm:gap-3 pointer-events-auto flex-shrink-0"
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-white/50 text-xs sm:text-sm">Starting from</span>
                      <span className="text-xl sm:text-3xl lg:text-4xl font-bold text-white">{formatPrice(project.startingPrice, project.currency, currency)}</span>
                    </div>
                    {currency === "AED" && project.startingPrice && (
                      <span className="text-white/40 text-xs sm:text-sm lg:text-right">~{formatPrice(project.startingPrice, "AED", "USD")}</span>
                    )}
                  </div>

                  {images.length > 1 && (
                    <div className="hidden lg:flex gap-2">
                      {images.slice(0, 4).map((img: any, i: number) => (
                        <button
                          key={i}
                          onClick={() => setActiveImage(i)}
                          className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                            i === activeImage
                              ? "border-accent shadow-lg shadow-accent/20 scale-110"
                              : "border-white/20 opacity-70 hover:opacity-100 hover:border-white/50"
                          }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Watch Tour + Photos inline */}
                  <div className="flex items-center gap-2">
                    {project.videoUrl && (
                      <a
                        href={project.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs sm:text-sm font-semibold text-white hover:bg-white/20 transition-all"
                      >
                        <Play className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-accent fill-accent" /> Watch Tour
                      </a>
                    )}
                    <button
                      onClick={() => setShowGallery(true)}
                      className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs sm:text-sm font-semibold text-white hover:bg-white/20 transition-all"
                    >
                      <ImageIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white/70" /> {images.length} Photos
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ───── QUICK STATS CARDS ───── */}
      <section className="py-4 sm:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
            {[
              { icon: Wallet, label: "Starting Price", value: formatPrice(project.startingPrice, project.currency, currency), sub: currency === "AED" && project.startingPrice ? `~${formatPrice(project.startingPrice, "AED", "USD")}` : null },
              { icon: Bed, label: "Unit Types", value: project.unitTypes?.join(" · ") || "—", sub: null },
              { icon: Ruler, label: "Size Range", value: project.unitSizeMin && project.unitSizeMax ? `${Number(project.unitSizeMin).toLocaleString()} – ${Number(project.unitSizeMax).toLocaleString()} sqft` : "—", sub: null },
              { icon: Calendar, label: "Handover", value: formatHandover(project.completionDate), sub: null },
              { icon: Shield, label: "Ownership", value: project.titleType || "Freehold", sub: project.ownershipEligibility || "All Nationalities" },
            ].map(({ icon: StatIcon, label, value, sub }, idx) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * idx + 0.2 }}
                className="bg-card rounded-xl p-3 sm:p-4 border-l-[3px] border-l-accent border border-border/50 hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex items-center gap-2 mb-2">
                  <StatIcon className="h-3.5 w-3.5 text-accent" />
                  <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-semibold">{label}</p>
                </div>
                <p className="text-sm font-bold text-foreground leading-snug">{value}</p>
                {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── MAIN CONTENT ───── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10 lg:gap-12">

          {/* ═══ LEFT COLUMN ═══ */}
          <div className="lg:col-span-2 space-y-5 sm:space-y-8">

            {/* Tab Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex gap-1 sm:gap-1.5 bg-muted/50 p-1 sm:p-1.5 rounded-2xl border border-border/50 overflow-x-auto scrollbar-hide"
            >
              {(["overview", "location", "payment", "faq"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 relative px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all capitalize whitespace-nowrap ${
                    activeTab === tab
                      ? "bg-card text-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                  }`}
                >
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTabBg"
                      className="absolute inset-0 bg-card rounded-xl shadow-md"
                      transition={{ type: "spring", duration: 0.4 }}
                    />
                  )}
                  <span className="relative z-10 uppercase">{tab === "faq" ? "FAQ" : tab}</span>
                </button>
              ))}
            </motion.div>

            {/* ─── OVERVIEW TAB ─── */}
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5 sm:space-y-8"
                >
                  {/* Overview */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-1 h-6 rounded-full bg-accent" />
                      <h2 className="text-lg sm:text-2xl font-bold text-foreground">Project Overview</h2>
                    </div>
                    {project.shortOverview && (
                      <p className="text-base sm:text-lg text-foreground/90 leading-relaxed font-medium">{project.shortOverview}</p>
                    )}
                    {project.fullDescription && (
                      <div
                        className="text-sm sm:text-base text-muted-foreground leading-relaxed prose prose-sm max-w-none
                          prose-headings:text-foreground prose-headings:font-bold prose-headings:mt-4 prose-headings:mb-2
                          prose-p:mb-3 prose-li:mb-1 prose-strong:text-foreground prose-a:text-primary"
                        dangerouslySetInnerHTML={{ __html: project.fullDescription }}
                      />
                    )}
                  </div>

                  {/* Available Units */}
                  {project.unitTypes && project.unitTypes.length > 0 && (() => {
                    const unitData = project.unitTypes.map((ut: any, idx: number) => {
                      const totalTypes = project.unitTypes!.length;
                      const basePrice = project.startingPrice || 0;
                      const priceMultiplier = 1 + idx * 0.35;
                      const minPrice = Math.round(basePrice * priceMultiplier);
                      const maxPrice = Math.round(minPrice * 1.3);
                      const baseSize = Number(project.unitSizeMin) || 400;
                      const maxSize = Number(project.unitSizeMax) || 2500;
                      const sizeStep = totalTypes > 1 ? (maxSize - baseSize) / (totalTypes - 1) : 0;
                      const unitMinSize = Math.round(baseSize + sizeStep * idx);
                      const unitMaxSize = Math.round(unitMinSize + sizeStep * 0.8) || unitMinSize + 200;
                      const bedroomMatch = ut.match(/(\d+)/);
                      const bedrooms = bedroomMatch ? parseInt(bedroomMatch[1]) : ut.toLowerCase() === "studio" ? 0 : ut.toLowerCase() === "penthouse" ? 4 : 1;
                      const bathrooms = Math.max(1, bedrooms);
                      const features = [
                        "Built-in Wardrobes",
                        bedrooms >= 2 ? "Maid's Room" : null,
                        idx % 2 === 0 ? "Sea View" : "City View",
                        "Balcony",
                        bedrooms >= 3 ? "Private Terrace" : null,
                        "Central A/C",
                        ut.toLowerCase().includes("penthouse") ? "Private Pool" : null,
                      ].filter(Boolean) as string[];
                      return { name: ut, minPrice, maxPrice, minSize: unitMinSize, maxSize: unitMaxSize, bedrooms, bathrooms, features, available: true };
                    });
                    const activeUnit = unitData[activeUnitTab];
                    return (
                      <div className="rounded-3xl overflow-hidden">
                        {/* Section header */}
                        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#0B3D2E] to-[#1A7A5A] flex items-center justify-center shadow-md">
                            <Home className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                          <h2 className="text-lg sm:text-2xl font-bold text-foreground">Available Units</h2>
                        </div>

                        {/* Unit type tabs */}
                        <div className="flex gap-2 overflow-x-auto pb-3 sm:pb-5 scrollbar-hide">
                          {unitData.map((unit: any, i: number) => (
                            <button
                              key={unit.name}
                              onClick={() => setActiveUnitTab(i)}
                              className={`flex-shrink-0 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                                activeUnitTab === i
                                  ? "bg-gradient-to-r from-[#0B3D2E] to-[#1A7A5A] text-white shadow-lg shadow-[#0B3D2E]/25 scale-[1.02]"
                                  : "bg-card text-muted-foreground hover:text-foreground border border-border hover:border-[#0B3D2E]/30 hover:shadow-sm"
                              }`}
                            >
                              {unit.name}
                            </button>
                          ))}
                        </div>

                        {/* Unit detail card */}
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={activeUnitTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            className="bg-card rounded-3xl border border-border/50 overflow-hidden shadow-sm"
                          >
                            <div className="grid md:grid-cols-5 gap-0">
                              {/* Floor plan side */}
                              <div className="md:col-span-2 relative bg-muted/20 flex items-center justify-center p-3 sm:p-4 min-h-[200px] sm:min-h-[280px] md:min-h-[420px]">
                                {project.floorPlans?.[activeUnitTab] ? (
                                  <img
                                    src={project.floorPlans[activeUnitTab]}
                                    alt={`${activeUnit?.name} floor plan`}
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <UnitImagePlaceholder
                                    bedrooms={activeUnit?.bedrooms || 0}
                                    unitName={activeUnit?.name || ""}
                                  />
                                )}
                                <div className="absolute bottom-4 left-4">
                                  <span className="inline-flex px-3 py-1.5 rounded-full text-xs font-bold bg-white/90 text-[#0B3D2E] backdrop-blur-sm shadow-sm border border-border/30">
                                    {activeUnit?.name} Floor Plan
                                  </span>
                                </div>
                              </div>

                              {/* Info side */}
                              <div className="md:col-span-3 p-3.5 sm:p-6 md:p-8 flex flex-col justify-between gap-3 sm:gap-6">
                                {/* Top: Title + status */}
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <h3 className="text-xl sm:text-3xl font-bold text-foreground">{activeUnit?.name}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">{project.name}</p>
                                  </div>
                                  <span className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Available
                                  </span>
                                </div>

                                {/* Price card */}
                                <div className="bg-gradient-to-br from-[#D4A847] via-[#C9A83E] to-[#B8922F] rounded-xl sm:rounded-2xl p-3 sm:p-5 text-white shadow-lg shadow-[#D4A847]/20">
                                  <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-white/70 font-bold">Price Range</p>
                                  <p className="text-lg sm:text-3xl font-bold mt-0.5 sm:mt-1">
                                    {formatPrice(activeUnit?.minPrice, "AED", currency)} – {formatPrice(activeUnit?.maxPrice, "AED", currency)}
                                  </p>
                                  {currency === "AED" && (
                                    <p className="text-sm text-white/60 mt-1">
                                      ~{formatPrice(activeUnit?.minPrice, "AED", "USD")} – {formatPrice(activeUnit?.maxPrice, "AED", "USD")}
                                    </p>
                                  )}
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                  {[
                                    { icon: Bed, value: activeUnit?.bedrooms === 0 ? "Studio" : activeUnit?.bedrooms, label: "Bedrooms" },
                                    { icon: Users, value: activeUnit?.bathrooms, label: "Bathrooms" },
                                    { icon: Ruler, value: `${activeUnit?.minSize?.toLocaleString()}`, label: "Sq. Ft." },
                                  ].map(({ icon: StatIcon, value, label }) => (
                                    <div key={label} className="bg-muted/40 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 text-center border border-border/30 hover:border-[#0B3D2E]/20 transition-all hover:shadow-sm group">
                                      <StatIcon className="h-5 w-5 text-[#0B3D2E]/60 group-hover:text-[#0B3D2E] mx-auto mb-2 transition-colors" />
                                      <p className="text-base sm:text-lg font-bold text-foreground">{value}</p>
                                      <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">{label}</p>
                                    </div>
                                  ))}
                                </div>

                                {/* Features */}
                                <div>
                                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-3">Key Features</p>
                                  <div className="flex flex-wrap gap-2">
                                    {activeUnit?.features.map((f, fi) => (
                                      <motion.span
                                        key={fi}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: fi * 0.04 }}
                                        className="px-4 py-2 bg-muted/50 text-foreground/80 rounded-full text-xs font-medium border border-border/40 hover:border-[#0B3D2E]/25 hover:bg-[#0B3D2E]/[0.05] transition-all cursor-default"
                                      >
                                        {f}
                                      </motion.span>
                                    ))}
                                  </div>
                                </div>

                                {/* CTA */}
                                <a
                                  href={`https://wa.me/${project.whatsappNumber || "971543048"}?text=I'm interested in ${activeUnit?.name} at ${project.name}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-full bg-gradient-to-r from-[#25D366] to-[#1DA851] text-white font-semibold text-sm shadow-lg shadow-[#25D366]/20 hover:shadow-xl hover:shadow-[#25D366]/30 hover:scale-[1.02] transition-all duration-300"
                                >
                                  <MessageCircle className="h-4 w-4" />
                                  Enquire About This Unit
                                </a>
                              </div>
                            </div>
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    );
                  })()}

                  {/* Download Brochure CTA */}
                  <a
                    href={project.brochureUrl || "#download-brochure"}
                    className="flex items-center gap-3 sm:gap-4 rounded-2xl sm:rounded-full bg-gradient-to-r from-[#0B3D2E] to-[#1A7A5A] p-4 sm:p-6 group transition-all duration-300 shadow-lg shadow-[#0B3D2E]/20 hover:shadow-xl hover:shadow-[#0B3D2E]/30 hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-white">Download Project Brochure</p>
                      <p className="text-[10px] sm:text-[11px] text-white/70">Get the full {project.name} brochure with floor plans & pricing</p>
                    </div>
                    <Download className="h-5 w-5 text-white/60 group-hover:translate-y-0.5 transition-transform flex-shrink-0" />
                  </a>

                  {/* Key Highlights */}
                  {project.keyHighlights && project.keyHighlights.length > 0 && (
                    <div className="relative rounded-3xl overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#0B3D2E]/[0.03] via-card to-[#D4A847]/[0.03]" />
                      <div className="relative p-4 sm:p-8">
                         <div className="flex items-center gap-2 sm:gap-3 mb-5 sm:mb-8">
                          <div className="relative">
                            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-[#0B3D2E] to-[#1A7A5A] flex items-center justify-center shadow-lg shadow-[#0B3D2E]/20">
                              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                            </div>
                            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-accent rounded-full animate-pulse" />
                          </div>
                          <div>
                            <h2 className="text-lg sm:text-2xl font-bold text-foreground">Key Highlights</h2>
                            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">What makes this project stand out</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          {project.keyHighlights.map((h: any, i: number) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 16 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                              whileHover={{ scale: 1.02, y: -2 }}
                              className="group relative"
                            >
                              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#0B3D2E]/10 to-[#D4A847]/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
                              <div className="relative flex items-center gap-3 sm:gap-4 p-3.5 sm:p-5 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/60 group-hover:border-[#0B3D2E]/30 group-hover:shadow-lg group-hover:shadow-[#0B3D2E]/[0.06] transition-all duration-500">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#0B3D2E]/10 to-[#1A7A5A]/10 flex items-center justify-center flex-shrink-0 group-hover:from-[#0B3D2E]/20 group-hover:to-[#1A7A5A]/20 transition-all duration-500">
                                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-[#D4A847] fill-[#D4A847]/30 group-hover:fill-[#D4A847]/60 transition-all duration-300" />
                                </div>
                                <span className="text-xs sm:text-sm font-medium text-foreground/80 group-hover:text-foreground leading-relaxed transition-colors duration-300">{h}</span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Project Video Overview */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-card rounded-2xl border border-border/50 overflow-hidden"
                  >
                    <div className="relative group cursor-pointer">
                      <img
                        src={project.imageGallery?.[0] || videoThumbnail}
                        alt={`${project.name} video overview`}
                        className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10 group-hover:from-black/80 transition-all duration-500" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/30 transition-all duration-500 shadow-2xl">
                          <Play className="h-8 w-8 text-white fill-white ml-1" />
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2.5 py-1 rounded-full bg-accent/90 text-accent-foreground text-[10px] font-bold uppercase tracking-wider">Video Tour</span>
                        </div>
                        <h3 className="text-lg font-bold text-white">Discover {project.name}</h3>
                        <p className="text-white/60 text-xs mt-1">Take an immersive virtual tour of the development</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Floor Plans - Dedicated Section */}
                  {project.unitTypes && project.unitTypes.length > 0 && (() => {
                    const floorPlanUnits = project.unitTypes.map((ut: any, idx: number) => {
                      const bedroomMatch = ut.match(/(\d+)/);
                      const bedrooms = bedroomMatch ? parseInt(bedroomMatch[1]) : ut.toLowerCase() === "studio" ? 0 : ut.toLowerCase() === "penthouse" ? 4 : 1;
                      const bathrooms = Math.max(1, bedrooms);
                      const baseSize = Number(project.unitSizeMin) || 400;
                      const maxSize = Number(project.unitSizeMax) || 2500;
                      const totalTypes = project.unitTypes!.length;
                      const sizeStep = totalTypes > 1 ? (maxSize - baseSize) / (totalTypes - 1) : 0;
                      const unitSize = Math.round(baseSize + sizeStep * idx);
                      const balconyArea = Math.round(unitSize * 0.08);
                      const totalArea = unitSize + balconyArea;
                      return { name: ut, bedrooms, bathrooms, unitSize, balconyArea, totalArea };
                    });
                    return (
                      <div className="bg-card rounded-2xl border border-border/50 p-4 sm:p-8">
                        <div className="mb-8">
                          <div className="flex items-center gap-2.5 mb-2">
                            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                              <FileText className="h-4.5 w-4.5 text-primary" />
                            </div>
                            <h2 className="text-xl font-bold text-foreground">Floor Plans</h2>
                          </div>
                          <p className="text-sm text-muted-foreground ml-[46px]">Explore detailed layouts for each unit type</p>
                        </div>

                        {/* Unit type tabs */}
                        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide -mx-2 px-2">
                          {floorPlanUnits.map((unit: any, i: number) => (
                            <button
                              key={unit.name}
                              onClick={() => setActiveFloorPlanTab(i)}
                              className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                                activeFloorPlanTab === i
                                  ? "bg-primary text-primary-foreground shadow-md"
                                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                              }`}
                            >
                              {unit.name}
                            </button>
                          ))}
                        </div>

                        <AnimatePresence mode="wait">
                          <motion.div
                            key={activeFloorPlanTab}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.25 }}
                          >
                            {/* Large floor plan / unit image area */}
                            <div
                              className="w-full aspect-[4/3] sm:aspect-[16/10] rounded-2xl overflow-hidden border border-border/50"
                              role="img"
                              aria-label={`${project.name} ${floorPlanUnits[activeFloorPlanTab]?.name} Floor Plan`}
                            >
                              {project.floorPlans && project.floorPlans[activeFloorPlanTab] ? (
                                <img
                                  src={project.floorPlans[activeFloorPlanTab]?.imageUrl}
                                  alt={`${project.name} ${floorPlanUnits[activeFloorPlanTab]?.name} Floor Plan`}
                                  className="w-full h-full object-contain rounded-2xl"
                                />
                              ) : (
                                <FloorPlanPlaceholder
                                  bedrooms={floorPlanUnits[activeFloorPlanTab]?.bedrooms || 0}
                                  unitName={floorPlanUnits[activeFloorPlanTab]?.name || ""}
                                  sqft={floorPlanUnits[activeFloorPlanTab]?.unitSize || 0}
                                />
                              )}
                            </div>

                            {/* Details row */}
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                              <div className="p-3.5 bg-muted/40 rounded-xl text-center">
                                <Ruler className="h-4 w-4 text-primary mx-auto mb-1.5" />
                                <p className="text-sm font-bold text-foreground">{floorPlanUnits[activeFloorPlanTab]?.unitSize.toLocaleString()} sqft</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Unit Size</p>
                              </div>
                              <div className="p-3.5 bg-muted/40 rounded-xl text-center">
                                <Bed className="h-4 w-4 text-primary mx-auto mb-1.5" />
                                <p className="text-sm font-bold text-foreground">{floorPlanUnits[activeFloorPlanTab]?.bedrooms === 0 ? "Studio" : floorPlanUnits[activeFloorPlanTab]?.bedrooms}</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Bedrooms</p>
                              </div>
                              <div className="p-3.5 bg-muted/40 rounded-xl text-center">
                                <Users className="h-4 w-4 text-primary mx-auto mb-1.5" />
                                <p className="text-sm font-bold text-foreground">{floorPlanUnits[activeFloorPlanTab]?.bathrooms}</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Bathrooms</p>
                              </div>
                              <div className="p-3.5 bg-muted/40 rounded-xl text-center">
                                <Compass className="h-4 w-4 text-primary mx-auto mb-1.5" />
                                <p className="text-sm font-bold text-foreground">{floorPlanUnits[activeFloorPlanTab]?.balconyArea.toLocaleString()} sqft</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Balcony</p>
                              </div>
                              <div className="p-3.5 bg-muted/40 rounded-xl text-center col-span-2 sm:col-span-1">
                                <Home className="h-4 w-4 text-primary mx-auto mb-1.5" />
                                <p className="text-sm font-bold text-foreground">{floorPlanUnits[activeFloorPlanTab]?.totalArea.toLocaleString()} sqft</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Total Area</p>
                              </div>
                            </div>

                            {/* Download button */}
                            <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-full text-sm font-semibold text-[#134E3A] border-2 border-[#134E3A]/25 transition-all duration-300 hover:bg-gradient-to-r hover:from-[#0B3D2E] hover:to-[#1A7A5A] hover:text-white hover:border-transparent hover:shadow-lg hover:shadow-[#134E3A]/20 hover:scale-[1.02] active:scale-[0.98] group">
                              <Download className="h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
                              Download Floor Plan PDF — {floorPlanUnits[activeFloorPlanTab]?.name}
                            </button>
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    );
                  })()}


                  {/* Payment Plan Visual Timeline */}
                  {project.unitTypes && project.unitTypes.length > 0 && (() => {
                    const basePrice = project.startingPrice || 0;
                    const priceMultiplier = 1 + activeUnitTab * 0.35;
                    const unitPrice = Math.round(basePrice * priceMultiplier);

                    const milestones = [
                      { pct: 10, label: "On Booking", icon: Wallet, color: "bg-accent" },
                      { pct: 10, label: "After 3 Months", icon: Calendar, color: "bg-primary" },
                      { pct: 10, label: "After 6 Months", icon: Clock, color: "bg-primary" },
                      { pct: 30, label: "During Construction", icon: Building2, color: "bg-primary/70" },
                      { pct: 40, label: "On Handover", icon: CheckCircle2, color: "bg-emerald-500" },
                    ];

                    // Use project payment plan data if available
                    const planSummary = project.paymentPlanSummary;

                    return (
                      <div className="bg-card rounded-2xl border border-border/50 p-4 sm:p-8">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
                              <CreditCard className="h-4.5 w-4.5 text-accent" />
                            </div>
                            <div>
                              <h2 className="text-lg sm:text-xl font-bold text-foreground">Payment Plan</h2>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                For {project.unitTypes![activeUnitTab]} · {formatPrice(unitPrice, "AED", currency)}
                              </p>
                            </div>
                          </div>
                          {planSummary && (
                            <span className="hidden sm:inline-flex px-3 py-1 rounded-full text-[10px] font-bold bg-accent/15 text-accent border border-accent/20">
                              {planSummary}
                            </span>
                          )}
                        </div>

                        {/* Progress bar overview */}
                        <div className="flex rounded-full overflow-hidden h-3 mb-8 bg-muted/50">
                          {milestones.map((m: any, i: number) => (
                            <motion.div
                              key={i}
                              initial={{ width: 0 }}
                              whileInView={{ width: `${m.pct}%` }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.15 * i + 0.3, duration: 0.5 }}
                              className={`${m.color} ${i === 0 ? "rounded-l-full" : ""} ${i === milestones.length - 1 ? "rounded-r-full" : ""} relative`}
                              style={{ minWidth: "2%" }}
                            >
                              {i < milestones.length - 1 && (
                                <div className="absolute right-0 top-0 bottom-0 w-px bg-background" />
                              )}
                            </motion.div>
                          ))}
                        </div>

                        {/* Timeline steps */}
                        <div className="relative">
                          <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-border rounded-full" />
                          <div className="space-y-0">
                            {milestones.map((m: any, i: number) => {
                              const amount = Math.round(unitPrice * m.pct / 100);
                              const MIcon = m.icon;
                              const cumulativePct = milestones.slice(0, i + 1).reduce((sum, ms) => sum + ms.pct, 0);
                              return (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, x: -10 }}
                                  whileInView={{ opacity: 1, x: 0 }}
                                  viewport={{ once: true }}
                                  transition={{ delay: 0.1 * i + 0.2 }}
                                  className="flex items-start gap-4 py-4 relative"
                                >
                                  {/* Node */}
                                  <div className={`w-8 h-8 rounded-full ${m.color} flex items-center justify-center flex-shrink-0 z-10 shadow-md`}>
                                    <MIcon className="h-3.5 w-3.5 text-white" />
                                  </div>

                                  {/* Content */}
                                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 min-w-0">
                                    <div className="min-w-0">
                                      <p className="text-sm font-bold text-foreground">{m.label}</p>
                                      <p className="text-[11px] text-muted-foreground">Step {i + 1} of {milestones.length} · {cumulativePct}% total paid</p>
                                    </div>
                                    <div className="flex items-baseline gap-2 flex-shrink-0">
                                      <span className="text-lg font-bold text-foreground">{m.pct}%</span>
                                      <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-foreground">{formatPrice(amount, "AED", currency)}</span>
                                        {currency === "AED" && (
                                          <span className="text-[10px] text-muted-foreground">~{formatPrice(amount, "AED", "USD")}</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Total summary */}
                        <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                          <p className="text-sm font-semibold text-muted-foreground">Total</p>
                          <div className="text-right">
                            <p className="text-lg font-bold text-foreground">{formatPrice(unitPrice, "AED", currency)}</p>
                            {currency === "AED" && (
                              <p className="text-[11px] text-muted-foreground">~{formatPrice(unitPrice, "AED", "USD")}</p>
                            )}
                          </div>
                        </div>

                        {project.paymentPlanDetails && (
                          <p className="mt-4 text-xs text-muted-foreground leading-relaxed bg-muted/30 rounded-xl p-3 border border-border/30">{project.paymentPlanDetails}</p>
                        )}
                      </div>
                    );
                  })()}

                  {/* Location & Nearby */}
                   <div className="bg-card rounded-2xl border border-border/50 p-4 sm:p-8">
                    <div className="flex items-center gap-2.5 mb-6">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <MapPin className="h-4.5 w-4.5 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-foreground">Location & Nearby</h2>
                        {project.locationDescription && (
                          <p className="text-xs text-muted-foreground mt-0.5">{project.locationDescription}</p>
                        )}
                      </div>
                    </div>

                    {/* Map embed */}
                    {(() => {
                      let embedSrc = "";
                      if (project.googleMapsUrl) {
                        // If it's already an embed URL, use directly; otherwise convert
                        embedSrc = project.googleMapsUrl.includes("/embed/")
                          ? project.googleMapsUrl
                          : project.googleMapsUrl.replace("/maps/", "/maps/embed/");
                      } else if (project.latitude && project.longitude) {
                        embedSrc = `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3000!2d${project.longitude}!3d${project.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sae!4v1`;
                      } else {
                        // Fallback: search by project name + community
                        const query = encodeURIComponent(`${project.name}, ${project.community || project.city}, ${project.country}`);
                        embedSrc = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${query}`;
                      }
                      return (
                        <div className="rounded-xl overflow-hidden border border-border/50 mb-6 aspect-[16/9]">
                          <iframe
                            src={embedSrc}
                            className="w-full h-full border-0"
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title={`${project.name} location`}
                          />
                        </div>
                      );
                    })()}

                    {/* Nearby amenities */}
                    {(() => {
                      const nearby: NearbyAttraction[] = (project.nearbyAttractions as NearbyAttraction[] | null) || [];
                      const fallback: NearbyAttraction[] = [
                        { name: "Dubai Marina Mall", type: "mall", distance: "5 min walk" },
                        { name: "JBR Beach", type: "beach", distance: "8 min walk" },
                        { name: "Metro Station", type: "transport", distance: "3 min walk" },
                        { name: "Dubai Airport", type: "airport", distance: "25 min drive" },
                        { name: "Palm Jumeirah", type: "landmark", distance: "10 min drive" },
                        { name: "Marina Walk", type: "park", distance: "2 min walk" },
                      ];
                      const items = nearby.length > 0 ? nearby : fallback;
                      return (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {items.map((item: any, i: number) => {
                            const AIcon = attractionIcon(item.type);
                            return (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 6 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                className="rounded-xl border border-border/50 p-3 bg-muted/20 hover:bg-muted/40 transition-colors"
                              >
                                <div className="flex items-center gap-2 mb-1.5">
                                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <AIcon className="h-3.5 w-3.5 text-primary" />
                                  </div>
                                  <span className="text-xs font-bold text-foreground truncate">{item.name}</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground ml-9">{item.distance}</p>
                              </motion.div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Investment Highlights */}
                  {(() => {
                    const highlights = project.investmentHighlights || [];
                    const defaultReasons = [
                      "Prime waterfront location",
                      "High rental demand area",
                      "Golden Visa eligible",
                      "Tax-free returns",
                      "Strong capital appreciation",
                      "World-class amenities",
                    ];
                    const reasons = highlights.length > 0 ? highlights : defaultReasons;
                    const stats = [
                      { label: "Est. Rental Yield", value: "7-9%", sub: "Annual ROI", icon: TrendingUp, iconClass: "text-emerald-500" },
                      { label: "Capital Growth", value: "12-15%", sub: "Year-on-Year", icon: Sparkles, iconClass: "text-accent" },
                      { label: "Occupancy Rate", value: "90%+", sub: "Area Average", icon: Users, iconClass: "text-primary" },
                    ];
                    return (
                      <div className="bg-card rounded-2xl border border-border/50 p-4 sm:p-8">
                        <div className="flex items-center gap-2.5 mb-6">
                          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                            <TrendingUp className="h-4.5 w-4.5 text-emerald-500" />
                          </div>
                          <div>
                            <h2 className="text-lg sm:text-xl font-bold text-foreground">Investment Highlights</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">Why invest in {project.name}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
                          {stats.map((s: any, i: number) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 8 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: i * 0.1 }}
                              className="rounded-xl border border-border/50 p-2.5 sm:p-3 text-center bg-muted/20"
                            >
                              <s.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${s.iconClass} mx-auto mb-1 sm:mb-1.5`} />
                              <p className="text-lg sm:text-xl font-bold text-foreground">{s.value}</p>
                              <p className="text-[9px] sm:text-[10px] font-semibold text-muted-foreground">{s.label}</p>
                              <p className="text-[8px] sm:text-[9px] text-muted-foreground/70">{s.sub}</p>
                            </motion.div>
                          ))}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {reasons.map((reason, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -6 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: i * 0.05 }}
                              className="flex items-center gap-2.5 rounded-xl border border-border/50 p-3 bg-muted/10 hover:bg-muted/30 transition-colors"
                            >
                              <div className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                              </div>
                              <span className="text-xs font-semibold text-foreground">{reason}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* About the Developer */}
                  {project.developerName && (
                    <div className="relative bg-card rounded-2xl border border-border/50 overflow-hidden">
                      {/* Subtle gradient accent bar */}
                      <div className="h-1.5 bg-gradient-to-r from-[#0B3D2E] via-[#1A7A5A] to-[#D4A847]" />
                      <div className="p-6 sm:p-8">
                        <div className="flex items-center gap-2.5 mb-8">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-4.5 w-4.5 text-primary" />
                          </div>
                          <h2 className="text-xl font-bold text-foreground">About the Developer</h2>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6">
                          {/* Developer logo placeholder */}
                          <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-border/50 flex items-center justify-center flex-shrink-0 shadow-sm">
                            <span className="text-2xl font-black text-primary/60">{project.developerName.split(" ").map(w => w[0]).join("").slice(0, 2)}</span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1 sm:mb-2">{project.developerName}</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4 sm:mb-6">
                              {project.developerName} is a leading real estate developer in the UAE, known for delivering iconic residential and commercial projects across prime locations in Dubai.
                            </p>

                            {/* Stats with icons */}
                            <div className="grid grid-cols-3 gap-2 mb-4 sm:mb-6">
                              {[
                                { value: "50+", label: "Projects Delivered", icon: Building2 },
                                { value: "20+", label: "Years Experience", icon: Clock },
                                { value: "10K+", label: "Units Completed", icon: Home },
                              ].map((stat, i) => {
                                const StatIcon = stat.icon;
                                return (
                                  <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="text-center rounded-xl border border-border/50 bg-gradient-to-b from-muted/30 to-transparent py-3 sm:py-4 px-2 sm:px-3 hover:border-primary/20 hover:shadow-md transition-all duration-300"
                                  >
                                    <StatIcon className="h-4 w-4 text-primary/60 mx-auto mb-2" />
                                    <p className="text-lg sm:text-xl font-bold text-foreground">{stat.value}</p>
                                    <p className="text-[9px] sm:text-[10px] text-muted-foreground font-medium mt-0.5">{stat.label}</p>
                                  </motion.div>
                                );
                              })}
                            </div>

                            <a href="#developer-profile" className="inline-flex items-center gap-2 text-sm font-bold text-primary bg-primary/5 hover:bg-primary/10 px-4 py-2 rounded-full transition-all duration-300 group">
                              View Developer Profile <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Amenities & Facilities */}
                  {(() => {
                    const amenityIcons: Record<string, React.ElementType> = {
                      "swimming pool": Waves, "pool": Waves,
                      "gymnasium": Dumbbell, "gym": Dumbbell, "fitness": Dumbbell,
                      "kids": Baby, "children": Baby, "play area": Baby,
                      "concierge": Star, "lobby": Star,
                      "parking": Car, "valet": Car,
                      "security": Lock, "cctv": Lock,
                      "spa": HeartPulse, "sauna": HeartPulse,
                      "bbq": Flame, "barbeque": Flame,
                      "jogging": TrendingUp, "running": TrendingUp, "track": TrendingUp,
                      "retail": Store, "shop": Store,
                      "garden": TreePine, "landscape": TreePine, "park": TreePine,
                      "smart": Smartphone, "home automation": Smartphone,
                    };
                    const getIcon = (name: string) => {
                      const lower = name.toLowerCase();
                      for (const [key, icon] of Object.entries(amenityIcons)) {
                        if (lower.includes(key)) return icon;
                      }
                      return Shield;
                    };
                    const amenities = project.amenities && project.amenities.length > 0
                      ? project.amenities
                      : ["Swimming Pool", "Gymnasium", "Kids Play Area", "Concierge Service", "Parking", "24/7 Security", "Spa & Sauna", "BBQ Area", "Jogging Track", "Retail Outlets", "Landscaped Gardens", "Smart Home Features"];

                    return (
                      <div className="bg-card rounded-2xl border border-border/50 p-4 sm:p-8">
                        <div className="flex items-center gap-2.5 mb-6">
                          <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
                            <Star className="h-4.5 w-4.5 text-accent" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-foreground">Amenities & Facilities</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">{amenities.length} world-class amenities</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                          {amenities.map((amenity, i) => {
                            const AIcon = getIcon(amenity);
                            return (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.03 }}
                                className="rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors p-3 flex flex-col items-center text-center gap-2"
                              >
                                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                                  <AIcon className="h-4 w-4 text-primary" />
                                </div>
                                <span className="text-[11px] font-semibold text-foreground leading-tight">{amenity}</span>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* FAQ */}
                  {faqs.length > 0 && (
                    <div className="bg-card rounded-2xl border border-border/50 p-4 sm:p-8">
                      <div className="flex items-center gap-2.5 mb-6">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                          <MessageCircle className="h-4.5 w-4.5 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Frequently Asked Questions</h2>
                      </div>
                      <div className="space-y-3">
                        {faqs.map((faq: any, i: number) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05 }}
                            className={`rounded-xl overflow-hidden transition-colors ${openFaq === i ? "bg-primary/5 border border-primary/15" : "border border-border/50 hover:border-border"}`}
                          >
                            <button
                              onClick={() => setOpenFaq(openFaq === i ? null : i)}
                              className="w-full flex items-center justify-between p-4 sm:p-5 text-left"
                            >
                              <span className="text-sm font-semibold text-foreground pr-4">{faq.question}</span>
                              <ChevronDown className={`h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${openFaq === i ? "rotate-180 text-primary" : ""}`} />
                            </button>
                            <AnimatePresence>
                              {openFaq === i && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.25, ease: "easeOut" as const }}
                                >
                                  <div className="px-4 sm:px-5 pb-5">
                                    <div className="w-12 h-px bg-primary/20 mb-3" />
                                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Enquiry Form */}
                   <div className="bg-card rounded-2xl border border-border/50 p-4 sm:p-8">
                    <div className="flex items-center gap-2.5 mb-6">
                      <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
                        <Mail className="h-4.5 w-4.5 text-accent" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-foreground">Enquire About This Project</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">Get detailed pricing and availability from our team</p>
                      </div>
                    </div>

                    {enquirySubmitted ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-10"
                      >
                        <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
                          <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-1">Thank You!</h3>
                        <p className="text-sm text-muted-foreground">Our team will contact you shortly via your preferred method.</p>
                        <button
                          onClick={() => { setEnquirySubmitted(false); setEnquiryForm({ name: "", email: "", phone: "", countryCode: "+971", unitType: "", message: "", contactMethod: "whatsapp" }); }}
                          className="mt-4 text-xs font-semibold text-primary hover:underline"
                        >
                          Submit another enquiry
                        </button>
                      </motion.div>
                    ) : (
                      <form
                        onSubmit={(e) => { e.preventDefault(); setEnquirySubmitted(true); }}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Full Name *</label>
                            <input
                              type="text"
                              required
                              value={enquiryForm.name}
                              onChange={(e) => setEnquiryForm(f => ({ ...f, name: e.target.value }))}
                              className="w-full h-11 rounded-xl bg-muted/30 border border-border/50 px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
                              placeholder="Your full name"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Email *</label>
                            <input
                              type="email"
                              required
                              value={enquiryForm.email}
                              onChange={(e) => setEnquiryForm(f => ({ ...f, email: e.target.value }))}
                              className="w-full h-11 rounded-xl bg-muted/30 border border-border/50 px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
                              placeholder="your@email.com"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Phone Number *</label>
                          <div className="flex gap-2">
                            <select
                              value={enquiryForm.countryCode}
                              onChange={(e) => setEnquiryForm(f => ({ ...f, countryCode: e.target.value }))}
                              className="h-11 rounded-xl bg-muted/30 border border-border/50 px-3 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all appearance-none"
                            >
                              <option value="+971">AE +971</option>
                              <option value="+44">UK +44</option>
                              <option value="+1">US +1</option>
                              <option value="+91">IN +91</option>
                              <option value="+86">CN +86</option>
                              <option value="+7">RU +7</option>
                            </select>
                            <input
                              type="tel"
                              required
                              value={enquiryForm.phone}
                              onChange={(e) => setEnquiryForm(f => ({ ...f, phone: e.target.value }))}
                              className="flex-1 h-11 rounded-xl bg-muted/30 border border-border/50 px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
                              placeholder="50 123 4567"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Preferred Unit Type</label>
                          <select
                            value={enquiryForm.unitType}
                            onChange={(e) => setEnquiryForm(f => ({ ...f, unitType: e.target.value }))}
                            className="w-full h-11 rounded-xl bg-muted/30 border border-border/50 px-4 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all appearance-none"
                          >
                            <option value="">Select a unit type</option>
                            {project.unitTypes?.map((ut) => (
                              <option key={ut} value={ut}>{ut}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Message</label>
                          <textarea
                            rows={3}
                            value={enquiryForm.message}
                            onChange={(e) => setEnquiryForm(f => ({ ...f, message: e.target.value }))}
                            className="w-full rounded-xl bg-muted/30 border border-border/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all resize-none"
                            placeholder={`I'm interested in ${project.name}. Please share more details...`}
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Preferred Contact Method</label>
                          <div className="flex gap-2">
                            {([
                              { key: "whatsapp" as const, label: "WhatsApp", icon: MessageCircle },
                              { key: "email" as const, label: "Email", icon: Mail },
                              { key: "phone" as const, label: "Phone", icon: Phone },
                            ]).map((method) => {
                              const MIcon = method.icon;
                              return (
                                <button
                                  key={method.key}
                                  type="button"
                                  onClick={() => setEnquiryForm(f => ({ ...f, contactMethod: method.key }))}
                                  className={`flex-1 h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                                    enquiryForm.contactMethod === method.key
                                      ? "bg-primary text-primary-foreground shadow-md"
                                      : "bg-muted/50 text-muted-foreground hover:bg-muted border border-border/50"
                                  }`}
                                >
                                  <MIcon className="h-3.5 w-3.5" />
                                  {method.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full h-12 rounded-full bg-gradient-to-r from-[#D4A847] via-[#C4963F] to-[#B8922F] text-white font-bold text-sm transition-all duration-500 shadow-[0_0_20px_rgba(212,168,71,0.3)] hover:shadow-[0_0_30px_rgba(212,168,71,0.5)] hover:scale-[1.02] active:scale-[0.98]"
                        >
                          Submit Enquiry
                        </button>

                        <p className="text-[10px] text-muted-foreground text-center">By submitting, you agree to be contacted regarding this property.</p>
                      </form>
                    )}
                  </div>

                  {/* Schedule Video Consultation */}
                  <a
                    href="#schedule-call"
                    className="block rounded-2xl p-[2px] bg-gradient-to-r from-[#0B3D2E] via-[#1A7A5A] to-[#D4A847] transition-all duration-300 group hover:shadow-xl hover:shadow-[#134E3A]/15 hover:scale-[1.01]"
                  >
                    <div className="rounded-[14px] bg-card/95 backdrop-blur-xl p-6 sm:p-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0B3D2E]/10 to-[#1A7A5A]/10 border border-[#134E3A]/15 flex items-center justify-center flex-shrink-0 group-hover:from-[#0B3D2E]/20 group-hover:to-[#1A7A5A]/20 transition-all">
                          <Calendar className="h-5 w-5 text-[#134E3A]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-bold text-foreground group-hover:text-[#134E3A] transition-colors">Schedule a Video Consultation</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">Book a free video call with our property consultant — no obligations</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-[#134E3A]/40 group-hover:text-[#134E3A] group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                    </div>
                  </a>

                  {/* What Buyers Say */}
                  <div className="bg-card rounded-2xl border border-border/50 p-6 sm:p-8">
                    <div className="flex items-center gap-2.5 mb-6">
                      <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
                        <MessageCircle className="h-4.5 w-4.5 text-accent" />
                      </div>
                      <h2 className="text-xl font-bold text-foreground">What Buyers Say</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { name: "Ahmed R.", unit: "2 Bedroom", rating: 5, text: "Exceptional quality and a prime location. The payment plan made it very accessible. The team at Binayah guided me through every step seamlessly.", avatar: "https://i.pravatar.cc/80?img=12" },
                        { name: "Sarah L.", unit: "3 Bedroom", rating: 5, text: "We fell in love with the views and the amenities. It's the perfect family home with everything you need within walking distance.", avatar: "https://i.pravatar.cc/80?img=32" },
                        { name: "James K.", unit: "1 Bedroom", rating: 4, text: "Great investment opportunity with strong rental yields. The developer has an excellent track record and the build quality is superb.", avatar: "https://i.pravatar.cc/80?img=53" },
                      ].map((review, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 8 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1 }}
                          className="rounded-xl border border-border/50 bg-muted/20 p-4 flex flex-col"
                        >
                          <span className="text-3xl text-accent/30 font-serif leading-none mb-2">"</span>
                          <p className="text-xs text-muted-foreground leading-relaxed flex-1 mb-3">{review.text}</p>
                          <div className="flex items-center gap-0.5 mb-2">
                            {Array.from({ length: 5 }).map((_, si) => (
                              <Star key={si} className={`h-3.5 w-3.5 ${si < review.rating ? "text-accent fill-accent" : "text-border"}`} />
                            ))}
                          </div>
                          <div className="flex items-center gap-2.5">
                            <img src={review.avatar} alt={review.name} className="w-8 h-8 rounded-full object-cover border border-border/50" />
                            <div>
                              <p className="text-xs font-bold text-foreground">{review.name}</p>
                              <p className="text-[10px] text-muted-foreground">{review.unit} Buyer</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ─── PAYMENT TAB ─── */}
              {activeTab === "payment" && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  {/* Pricing & Ownership */}
                  <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
                    <div className="bg-gradient-to-r from-[#0B3D2E] to-[#1A7A5A] p-6 sm:p-8">
                      <p className="text-primary-foreground/60 text-xs uppercase tracking-[0.15em] font-semibold">Starting Price</p>
                      <p className="text-4xl font-bold text-primary-foreground mt-1">{formatPrice(project.startingPrice, project.currency, currency)}</p>
                      {currency === "AED" && project.startingPrice && (
                        <p className="text-primary-foreground/40 text-sm mt-1">~{formatPrice(project.startingPrice, "AED", "USD")}</p>
                      )}
                      {project.priceRange && <p className="text-primary-foreground/50 text-sm mt-2">{project.priceRange}</p>}
                    </div>
                    <div className="p-6 sm:p-8">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-muted/50 rounded-xl">
                          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-1">Title Type</p>
                          <p className="text-base font-bold text-foreground">{project.titleType || "Freehold"}</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-xl">
                          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-1">Ownership Eligibility</p>
                          <p className="text-base font-bold text-foreground">{project.ownershipEligibility || "All Nationalities"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Plan */}
                  {hasPaymentInfo && (
                    <div className="bg-card rounded-2xl border border-border/50 p-6 sm:p-8">
                      <div className="flex items-center gap-2.5 mb-6">
                        <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
                          <CreditCard className="h-4.5 w-4.5 text-accent" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Payment Plan</h2>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4 mb-5">
                        {project.downPayment && (
                          <div className="p-5 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/15">
                            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-2">Down Payment</p>
                            <p className="text-3xl font-bold text-accent">{project.downPayment}</p>
                          </div>
                        )}
                        {project.paymentPlanSummary && (
                          <div className="p-5 rounded-xl bg-muted/50">
                            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-2">Plan Summary</p>
                            <p className="text-base font-bold text-foreground">{project.paymentPlanSummary}</p>
                          </div>
                        )}
                      </div>
                      {project.paymentPlanDetails && (
                        <div className="p-4 bg-muted/30 rounded-xl border border-border/30 mb-5">
                          <p className="text-sm text-muted-foreground leading-relaxed">{project.paymentPlanDetails}</p>
                        </div>
                      )}
                      {project.acceptedPaymentMethods && project.acceptedPaymentMethods.length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-3">Accepted Methods</p>
                          <div className="flex flex-wrap gap-2">
                            {project.acceptedPaymentMethods.map((m: any, i: number) => (
                              <span key={i} className="text-xs px-4 py-2.5 bg-card border border-border rounded-xl text-foreground font-semibold hover:border-primary/30 transition-colors">
                                {m}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Units Information */}
                  <div className="bg-card rounded-2xl border border-border/50 p-6 sm:p-8">
                    <div className="flex items-center gap-2.5 mb-6">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Bed className="h-4.5 w-4.5 text-primary" />
                      </div>
                      <h2 className="text-xl font-bold text-foreground">Units Information</h2>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                      {[
                        { label: "Unit Types", value: project.unitTypes?.join(", ") || "—", icon: Bed },
                        { label: "Size Range", value: project.unitSizeMin && project.unitSizeMax ? `${Number(project.unitSizeMin).toLocaleString()} – ${Number(project.unitSizeMax).toLocaleString()} sqft` : "—", icon: Ruler },
                        { label: "Total Units", value: project.totalUnits?.toLocaleString() || "—", icon: Building2 },
                      ].map(({ label, value, icon: Icon }) => (
                        <div key={label} className="p-5 bg-muted/40 rounded-xl text-center hover:bg-muted/60 transition-colors">
                          <Icon className="h-5 w-5 text-primary mx-auto mb-2" />
                          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-1">{label}</p>
                          <p className="text-sm font-bold text-foreground">{value}</p>
                        </div>
                      ))}
                    </div>
                    {project.availabilityStatus && (
                      <div className="mt-5 flex items-center gap-2.5 p-3 bg-emerald-500/8 rounded-xl border border-emerald-500/15">
                        <span className={`w-2.5 h-2.5 rounded-full ${project.availabilityStatus === "Available" ? "bg-emerald-500 animate-pulse" : "bg-accent"}`} />
                        <span className="text-sm font-semibold text-foreground">{project.availabilityStatus}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ─── FAQ TAB ─── */}
              {activeTab === "faq" && (
                <motion.div
                  key="faq"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  {faqs.length > 0 ? (
                    <div className="bg-card rounded-2xl border border-border/50 p-4 sm:p-8">
                      <div className="flex items-center gap-2.5 mb-6">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                          <MessageCircle className="h-4.5 w-4.5 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Frequently Asked Questions</h2>
                      </div>
                      <div className="space-y-3">
                        {faqs.map((faq: any, i: number) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05 }}
                            className={`rounded-xl overflow-hidden transition-colors ${openFaq === i ? "bg-primary/5 border border-primary/15" : "border border-border/50 hover:border-border"}`}
                          >
                            <button
                              onClick={() => setOpenFaq(openFaq === i ? null : i)}
                              className="w-full flex items-center justify-between p-4 sm:p-5 text-left"
                            >
                              <span className="text-sm font-semibold text-foreground pr-4">{faq.question}</span>
                              <ChevronDown className={`h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${openFaq === i ? "rotate-180 text-primary" : ""}`} />
                            </button>
                            <AnimatePresence>
                              {openFaq === i && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.25, ease: "easeOut" as const }}
                                >
                                  <div className="px-4 sm:px-5 pb-5">
                                    <div className="w-12 h-px bg-primary/20 mb-3" />
                                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-card rounded-2xl border border-border/50 p-6 text-center">
                      <MessageCircle className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">No FAQs available for this project yet.</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ─── LOCATION TAB ─── */}
              {activeTab === "location" && (
                <motion.div
                  key="location"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  {/* Location Info */}
                  <div className="bg-card rounded-2xl border border-border/50 p-6 sm:p-8">
                    <div className="flex items-center gap-2.5 mb-6">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <MapPin className="h-4.5 w-4.5 text-primary" />
                      </div>
                      <h2 className="text-xl font-bold text-foreground">Location</h2>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4 mb-5">
                      <div className="p-4 bg-muted/50 rounded-xl">
                        <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-1">Community</p>
                        <p className="text-base font-bold text-foreground">{project.community || "—"}</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-xl">
                        <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-1">City</p>
                        <p className="text-base font-bold text-foreground">{project.city}</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-xl">
                        <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-1">Country</p>
                        <p className="text-base font-bold text-foreground">{project.country}</p>
                      </div>
                    </div>
                    {project.locationDescription && (
                      <p className="text-sm text-muted-foreground leading-relaxed mb-5">{project.locationDescription}</p>
                    )}
                    {project.googleMapsUrl && (
                      <a href={project.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
                        <ExternalLink className="h-4 w-4" /> View on Google Maps
                      </a>
                    )}
                  </div>

                  {/* Nearby Attractions */}
                  {nearby.length > 0 && (
                    <div className="bg-card rounded-2xl border border-border/50 p-6 sm:p-8">
                      <div className="flex items-center gap-2.5 mb-6">
                        <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
                          <Compass className="h-4.5 w-4.5 text-accent" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Nearby Attractions</h2>
                      </div>
                      <div className="space-y-3">
                        {nearby.map((a: any, i: number) => {
                          const AttrIcon = attractionIcon(a.type);
                          return (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -8 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: i * 0.06 }}
                              className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors group"
                            >
                              <div className="flex items-center gap-3.5">
                                <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                                  <AttrIcon className="h-4.5 w-4.5 text-primary" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-foreground">{a.name}</p>
                                  <p className="text-xs text-muted-foreground">{a.type}</p>
                                </div>
                              </div>
                              {a.distance && (
                                <span className="text-xs font-bold text-primary bg-primary/10 px-3.5 py-2 rounded-lg">{a.distance}</span>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ═══ RIGHT COLUMN — STICKY SIDEBAR ═══ */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-5">

              {/* CTA Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-lg shadow-foreground/5"
              >
                <div className="relative bg-gradient-to-br from-[#0B3D2E] via-[#134E3A] to-[#1A7A5A] p-6 overflow-hidden">
                  <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-accent/20 blur-2xl" />
                  <p className="text-primary-foreground/60 text-xs uppercase tracking-[0.15em] font-semibold mb-1 relative z-10">
                    {project.ctaHeadline || "Interested?"}
                  </p>
                  <p className="text-3xl font-bold text-primary-foreground relative z-10">{formatPrice(project.startingPrice, project.currency, currency)}</p>
                  {currency === "AED" && project.startingPrice && (
                    <p className="text-primary-foreground/40 text-sm mt-0.5 relative z-10">~{formatPrice(project.startingPrice, "AED", "USD")}</p>
                  )}
                  {project.priceRange && (
                    <p className="text-primary-foreground/50 text-sm mt-1.5 relative z-10">{project.priceRange}</p>
                  )}
                </div>
                <div className="p-5 space-y-3">
                  {project.ctaSubheadline && (
                    <p className="text-sm text-muted-foreground mb-1">{project.ctaSubheadline}</p>
                  )}
                  <a
                    href={`https://wa.me/${project.whatsappNumber?.replace(/\+/g, "")}?text=Hi, I'm interested in ${encodeURIComponent(project.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#25D366] to-[#1DA851] text-white rounded-full text-sm font-bold transition-all duration-300 shadow-lg shadow-[#25D366]/25 hover:shadow-xl hover:shadow-[#25D366]/35 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <MessageCircle className="h-4 w-4" /> WhatsApp Inquiry
                  </a>
                  <a
                    href={`tel:${project.contactPhone}`}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#D4A847] via-[#C9A83E] to-[#B8922F] text-white rounded-full text-sm font-bold transition-all duration-300 shadow-lg shadow-[#D4A847]/25 hover:shadow-xl hover:shadow-[#D4A847]/40 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Phone className="h-4 w-4" /> Call Now
                  </a>
                  <a
                    href="#live-chat"
                    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-[#134E3A]/30 text-[#134E3A] rounded-full text-sm font-semibold transition-all duration-300 hover:bg-gradient-to-r hover:from-[#0B3D2E] hover:to-[#1A7A5A] hover:text-white hover:border-transparent hover:shadow-lg hover:shadow-[#134E3A]/20 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <MessageCircle className="h-4 w-4" /> Live Chat
                  </a>
                </div>
                {(project.brochureUrl || project.masterPlanUrl) && (
                  <div className="px-5 pb-5 grid grid-cols-2 gap-2">
                    {project.brochureUrl && (
                      <a href={project.brochureUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-semibold text-[#134E3A] border border-[#134E3A]/25 transition-all duration-300 hover:bg-gradient-to-r hover:from-[#0B3D2E] hover:to-[#1A7A5A] hover:text-white hover:border-transparent hover:shadow-md">
                        <Download className="h-3.5 w-3.5" /> Brochure
                      </a>
                    )}
                    {project.masterPlanUrl && (
                      <a href={project.masterPlanUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-semibold text-[#134E3A] border border-[#134E3A]/25 transition-all duration-300 hover:bg-gradient-to-r hover:from-[#0B3D2E] hover:to-[#1A7A5A] hover:text-white hover:border-transparent hover:shadow-md">
                        <FileText className="h-3.5 w-3.5" /> Master Plan
                      </a>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Quick Facts */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="bg-card rounded-2xl border border-border/50 p-5"
              >
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em] mb-4">Project Details</h3>
                <div className="space-y-0">
                  {[
                    { label: "Developer", value: project.developerName },
                    { label: "Community", value: project.community },
                    { label: "City", value: `${project.city}, ${project.country}` },
                    { label: "Property Type", value: project.propertyType },
                    { label: "Project Type", value: project.projectType },
                    { label: "Status", value: project.status },
                    { label: "Title", value: project.titleType },
                    { label: "Eligibility", value: project.ownershipEligibility },
                    { label: "Total Units", value: project.totalUnits?.toLocaleString() },
                    { label: "Availability", value: project.availabilityStatus },
                  ].filter(f => f.value).map(({ label, value }, idx) => (
                    <div key={label} className={`flex justify-between items-center py-3 text-sm ${idx > 0 ? "border-t border-border/30" : ""}`}>
                      <span className="text-muted-foreground">{label}</span>
                      <span className="text-foreground font-semibold text-right max-w-[55%]">{value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Target Buyers */}
              {project.targetBuyers && project.targetBuyers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl border border-primary/10 p-5"
                >
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-primary" /> Ideal For
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.targetBuyers.map((b: any, i: number) => {
                      const buyerIcons: Record<string, React.ElementType> = {
                        "End Users": Home,
                        "Investors": TrendingUp,
                        "Families": Users,
                        "Couples": HeartPulse,
                        "First-Time Buyers": Star,
                      };
                      const BuyerIcon = buyerIcons[b] || Users;
                      return (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.7 + i * 0.1 }}
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-card text-foreground rounded-xl text-xs font-bold border border-border/50 shadow-sm hover:border-primary/30 hover:shadow-md transition-all duration-300"
                        >
                          <BuyerIcon className="h-3.5 w-3.5 text-primary" />
                          {b}
                        </motion.span>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ───── PAYMENT CALCULATOR (Standalone) ───── */}
      {project.startingPrice && project.unitTypes && project.unitTypes.length > 0 && (() => {
        const basePrice = project.startingPrice || 0;
        const priceMultiplier = 1 + activeUnitTab * 0.35;
        const totalPrice = Math.round(basePrice * priceMultiplier);

        const downPayment = Math.round(totalPrice * calcDownPct / 100);
        const constructionPct = 30;
        const constructionAmount = Math.round(totalPrice * constructionPct / 100);
        const handoverPct = 100 - calcDownPct - constructionPct;
        const handoverAmount = Math.round(totalPrice * handoverPct / 100);
        const monthlyPayment = calcTerm > 0 ? Math.round(handoverAmount / (calcTerm * 12)) : 0;

        const breakdownItems = [
          { label: "Down Payment", pct: calcDownPct, amount: downPayment, color: "bg-accent" },
          { label: "Construction Installments", pct: constructionPct, amount: constructionAmount, color: "bg-primary" },
          { label: "Post-Handover", pct: handoverPct, amount: handoverAmount, color: "bg-emerald-500" },
        ];

        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-card rounded-2xl border border-border/50 p-6 sm:p-8">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-4.5 w-4.5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Payment Calculator</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Plan your budget — estimate your payment breakdown</p>
                </div>
              </div>

              {/* Unit selector + Total */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Unit Type</label>
                  <select
                    value={activeUnitTab}
                    onChange={(e) => setActiveUnitTab(Number(e.target.value))}
                    className="w-full h-10 rounded-xl bg-muted/50 border border-border/50 px-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {project.unitTypes!.map((ut, i) => (
                      <option key={i} value={i}>{ut}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Total Price</label>
                  <div className="h-10 rounded-xl bg-muted/50 border border-border/50 px-3 flex items-center">
                    <span className="text-sm font-bold text-foreground">{formatPrice(totalPrice, "AED", currency)}</span>
                    {currency === "AED" && (
                      <span className="text-[10px] text-muted-foreground ml-2">~{formatPrice(totalPrice, "AED", "USD")}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Down payment slider */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-muted-foreground">Down Payment</label>
                  <span className="text-sm font-bold text-accent">{calcDownPct}% · {formatPrice(downPayment, "AED", currency)}</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={50}
                  step={5}
                  value={calcDownPct}
                  onChange={(e) => setCalcDownPct(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer bg-muted/50 accent-accent"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>5%</span>
                  <span>25%</span>
                  <span>50%</span>
                </div>
              </div>

              {/* Post-handover term */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-muted-foreground">Post-Handover Term</label>
                  <span className="text-sm font-bold text-foreground">{calcTerm} {calcTerm === 1 ? "Year" : "Years"}</span>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((yr) => (
                    <button
                      key={yr}
                      onClick={() => setCalcTerm(yr)}
                      className={`flex-1 h-9 rounded-lg text-xs font-bold transition-all ${
                        calcTerm === yr
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted border border-border/50"
                      }`}
                    >
                      {yr}Y
                    </button>
                  ))}
                </div>
              </div>

              {/* Visual breakdown bar */}
              <div className="flex rounded-full overflow-hidden h-4 mb-4 bg-muted/50">
                {breakdownItems.map((item: any, i: number) => (
                  <div
                    key={i}
                    className={`${item.color} relative transition-all duration-500`}
                    style={{ width: `${item.pct}%` }}
                  >
                    {i < breakdownItems.length - 1 && (
                      <div className="absolute right-0 top-0 bottom-0 w-px bg-background" />
                    )}
                    {item.pct >= 15 && (
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white">{item.pct}%</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Breakdown cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                {breakdownItems.map((item: any, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="rounded-xl border border-border/50 p-3 bg-muted/20"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                      <span className="text-[11px] font-semibold text-muted-foreground">{item.label}</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{formatPrice(item.amount, "AED", currency)}</p>
                    <p className="text-[10px] text-muted-foreground">{item.pct}% of total</p>
                  </motion.div>
                ))}
              </div>

              {/* Monthly highlight */}
              <div className="rounded-xl bg-primary/5 border border-primary/15 p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Est. Monthly Post-Handover</p>
                  <p className="text-[10px] text-muted-foreground">{calcTerm} years · {calcTerm * 12} payments</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{formatPrice(monthlyPayment, "AED", currency)}</p>
                  {currency === "AED" && (
                    <p className="text-[10px] text-muted-foreground">~{formatPrice(monthlyPayment, "AED", "USD")}/mo</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ───── SIMILAR PROJECTS ───── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Building2 className="h-4.5 w-4.5 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Similar Projects</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory" style={{ scrollbarWidth: "none" }}>
          {[
            { name: "Marina Vista by Emaar", price: 2100000, location: "Dubai Marina", status: "Off-Plan" },
            { name: "Bluewaters Residences", price: 2500000, location: "Bluewaters Island", status: "Ready" },
            { name: "Palm Beach Towers", price: 3200000, location: "Palm Jumeirah", status: "Off-Plan" },
            { name: "Dubai Creek Harbour", price: 1500000, location: "Creek Harbour", status: "Off-Plan" },
          ].map((p: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="min-w-[260px] sm:min-w-[280px] flex-shrink-0 snap-start rounded-2xl border border-border/50 bg-card overflow-hidden group hover:border-primary/30 transition-colors"
            >
              <div className="h-36 bg-muted/30 flex items-center justify-center relative">
                <Building2 className="h-10 w-10 text-muted-foreground/20" />
                <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold ${p.status === "Ready" ? "bg-emerald-500/90 text-white" : "bg-primary text-primary-foreground"}`}>
                  {p.status}
                </span>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{p.name}</h3>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-3">
                  <MapPin className="h-3 w-3" /> {p.location}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Starting from</p>
                    <p className="text-sm font-bold text-accent">{formatPrice(p.price, "AED", currency)}</p>
                  </div>
                  <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center cursor-pointer">
                    <ArrowRight className="h-3.5 w-3.5 text-primary" />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ───── BUYER'S GUIDE ───── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-8 sm:pb-12">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
            <FileText className="h-4.5 w-4.5 text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Buyer's Guide & Resources</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Essential reading for property buyers</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: "How to Buy Property in the UAE", desc: "Step-by-step guide to purchasing real estate in the UAE", icon: Home },
            { title: "Golden Visa Through Property", desc: "Learn how your property investment can qualify you for residency", icon: Shield },
            { title: "Off-Plan vs Ready Properties", desc: "Compare the pros and cons of each investment type", icon: TrendingUp },
            { title: "Dubai Marina Living Guide", desc: "Everything you need to know about living in Dubai Marina", icon: Compass },
            { title: "Understanding Payment Plans", desc: "A breakdown of how developer payment plans work", icon: CreditCard },
            { title: "First-Time Buyer Tips", desc: "Expert advice for making your first property investment", icon: Star },
          ].map((guide: any, i: number) => (
            <motion.a
              key={i}
              href="#"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3 rounded-xl border border-border/50 bg-card p-4 hover:border-primary/30 hover:bg-primary/[0.02] transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                <guide.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{guide.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{guide.desc}</p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>

      {/* ───── FULL GALLERY MODAL ───── */}
      <AnimatePresence>
        {showGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/95 backdrop-blur-xl"
          >
            <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
              <span className="text-white/60 text-sm">{images.length} photos</span>
              <button
                onClick={() => setShowGallery(false)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
            <div className="h-full overflow-y-auto py-16 px-4">
              <div className="max-w-5xl mx-auto columns-1 sm:columns-2 gap-3 space-y-3">
                {images.map((img: any, i: number) => (
                  <motion.img
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    src={img}
                    alt={`${project.name} ${i + 1}`}
                    className="w-full rounded-xl cursor-pointer hover:opacity-90 transition-opacity break-inside-avoid"
                    onClick={() => { setActiveImage(i); setShowGallery(false); }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ───── STICKY MOBILE CTA BAR ───── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-background/95 backdrop-blur-md border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <div className="flex gap-2 px-3 py-3 max-w-lg mx-auto">
          <a
            href={`https://wa.me/${(project.whatsappNumber || project.contactPhone || '+971500000000').replace(/[^0-9]/g, '')}?text=Hi, I'm interested in ${encodeURIComponent(project.name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-full bg-gradient-to-r from-[#25D366] to-[#1DA851] text-white font-semibold text-sm transition-all duration-300 shadow-md shadow-[#25D366]/20 hover:shadow-lg hover:shadow-[#25D366]/30 active:scale-[0.97]"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
          <a
            href={`tel:${project.contactPhone || '+971500000000'}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-full bg-gradient-to-r from-[#D4A847] via-[#C9A83E] to-[#B8922F] text-white font-semibold text-sm transition-all duration-300 shadow-md shadow-[#D4A847]/20 hover:shadow-lg hover:shadow-[#D4A847]/30 active:scale-[0.97]"
          >
            <Phone className="h-4 w-4" />
            Call
          </a>
          <a
            href="#live-chat"
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-full border-2 border-[#134E3A]/30 text-[#134E3A] font-semibold text-sm transition-all duration-300 hover:bg-gradient-to-r hover:from-[#0B3D2E] hover:to-[#1A7A5A] hover:text-white hover:border-transparent hover:shadow-md active:scale-[0.97]"
          >
            <MessageCircle className="h-4 w-4" />
            Live Chat
          </a>
        </div>
      </div>
      {/* Add bottom padding on mobile so content isn't hidden behind sticky bar */}
      <div className="h-20 lg:hidden" />

      <Footer />
      <WhatsAppButton />
      <AIChatWidget />
    </div>
  );
};

export default ProjectDetailPage;
