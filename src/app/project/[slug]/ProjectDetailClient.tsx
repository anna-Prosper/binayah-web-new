"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { apiUrl } from "@/lib/api";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, MapPin, Building2, Calendar, Wallet, Bed, Ruler, Shield,
  Phone, MessageCircle, Mail, ChevronRight, ChevronDown, Play, CheckCircle2,
  Star, Clock, Users, FileText, ExternalLink, Download, Image as ImageIcon,
  Home, Landmark, TrendingUp, CreditCard, Globe, Compass, Waves, X,
  Sparkles, Eye, ArrowRight, Dumbbell, Baby, Car, Lock, Flame,
  TreePine, Store, Smartphone, HeartPulse,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import AIChatWidget from "@/components/AIChatWidget";
import FloorPlanPlaceholder from "@/components/FloorPlanPlaceholder";
import NextImage from "next/image";
import ImageWithFallback from "@/components/ImageWithFallback";
import { formatPropertyTypeLabel } from "@/lib/property-types";
import { DetailActions } from "@/components/PropertyActions";
const amenitiesPlaceholder = "/assets/amenities-placeholder.webp";
const videoThumbnail = "/assets/video-thumbnail.webp";
import UnitImagePlaceholder from "@/components/UnitImagePlaceholder";
import { useState, useEffect } from "react";

type NearbyAttraction = { name: string; type: string; distance: string };
type FAQ = { question: string; answer: string };

interface ProjectDetailClientProps {
  serverProject: any;
}

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
  // Normalize: prices stored as decimal millions (e.g. 1.5 = AED 1.5M)
  const normalized = price < 1_000 ? price * 1_000_000 : price;
  const rate = CURRENCY_RATES[targetCurrency] || 1;
  const converted = normalized * rate;
  const symbol = CURRENCY_SYMBOLS[targetCurrency] || targetCurrency;
  if (converted >= 1_000_000) return `${symbol} ${(converted / 1_000_000).toFixed(1)}M`;
  if (converted >= 1_000) return `${symbol} ${(converted / 1_000).toFixed(0)}K`;
  return `${symbol} ${converted.toLocaleString()}`;
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


const ProjectDetailClient = ({ serverProject }: ProjectDetailClientProps) => {
  const project = {
    ...serverProject,
    unitTypes: Array.isArray(serverProject.unitTypes) ? serverProject.unitTypes : [],
    propertyTypes: Array.isArray(serverProject.propertyTypes) ? serverProject.propertyTypes : [],
  };
  const [activeImage, setActiveImage] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "payment" | "faq" | "location">("overview");
  const [currency, setCurrency] = useState("AED");
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [activeUnitTab, setActiveUnitTab] = useState(0);
  const [activeFloorPlanTab, setActiveFloorPlanTab] = useState(0);
  const [activePropertyType, setActivePropertyType] = useState<string>(() => project.propertyTypes?.[0] ?? "");
  const [enquiryForm, setEnquiryForm] = useState({ name: "", email: "", phone: "", countryCode: "+971", unitType: "", message: "", contactMethod: "whatsapp" as "whatsapp" | "email" | "phone" });
  const [enquirySubmitted, setEnquirySubmitted] = useState(false);
  const [showMoreEnquiry, setShowMoreEnquiry] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  // QR code: use permitUrl from DB if available, otherwise project page URL
  const qrUrl = project.permitUrl || (origin ? `${origin}/project/${project.slug}` : `/project/${project.slug}`);

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(apiUrl("/api/inquiries"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: enquiryForm.name,
          email: enquiryForm.email,
          phone: `${enquiryForm.countryCode} ${enquiryForm.phone}`,
          type: "project-enquiry",
          message: enquiryForm.message || `Interested in ${project.name}. Please share pricing and availability.`,
          source: `project-detail:${project.slug}`,
          unitType: enquiryForm.unitType,
          contactMethod: enquiryForm.contactMethod,
        }),
      });
    } catch {}
    setEnquirySubmitted(true);
    setEnquiryForm({ name: "", email: "", phone: "", countryCode: "+971", unitType: "", message: "", contactMethod: "whatsapp" });
  };





  const images = project.imageGallery?.length ? project.imageGallery : [
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
  const hasPaymentInfo = project.downPayment || project.paymentPlanSummary || project.paymentPlanDetails;


  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ───── HERO SECTION ───── */}
      <section className="relative">
        {/* Full-width hero image */}
        <div className="relative h-[50vh] sm:h-[65vh] lg:h-[70vh] overflow-hidden">
          {/* Mobile: horizontal scroll carousel */}
          <div className="sm:hidden w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide flex"
            onScroll={(e) => {
              const el = e.currentTarget;
              const idx = Math.round(el.scrollLeft / el.clientWidth);
              if (idx !== activeImage) setActiveImage(idx);
            }}
          >
            {images.map((img, i) => (
              <div key={i} className="relative w-full h-full flex-shrink-0 snap-center overflow-hidden"
                onClick={() => { setActiveImage(i); setShowGallery(true); }}
              >
                <ImageWithFallback
                  src={img}
                  alt={`${project.name} ${i + 1}`}
                  fill
                  sizes="100vw"
                  className="object-cover object-center"
                  priority={i === 0}
                />
              </div>
            ))}
          </div>
          {/* Mobile image counter */}
          <div className="sm:hidden absolute bottom-5 right-4 z-30 bg-black/60 backdrop-blur-sm text-white text-[13px] font-bold px-3 py-1 rounded-lg tracking-wide">
            {activeImage + 1}/{images.length}
          </div>
          {/* Desktop: single image */}
          <div className="hidden sm:block w-full h-full cursor-pointer" onClick={() => setShowGallery(true)}>
            <ImageWithFallback
              key={activeImage}
              src={images[activeImage]}
              alt={project.name}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          </div>

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/15 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/15 to-transparent pointer-events-none" />

          {/* Breadcrumb - top left below navbar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute top-14 sm:top-24 left-0 right-0 z-20"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex items-center gap-1.5 text-[11px] sm:text-sm text-white/50 flex-wrap">
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                <ChevronRight className="h-3 w-3" />
                <Link href="/off-plan" className="hover:text-white transition-colors">Projects</Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-white/80 truncate max-w-[180px]">{project.name}</span>
              </div>
            </div>
          </motion.div>

          {/* Hero content at bottom */}
          <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-6 sm:pb-8">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3 sm:gap-6">
                {/* Left: Project info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="pointer-events-auto flex-shrink-0"
                >
                  {/* Badges */}
                  <div className="flex items-center gap-1.5 mb-2 sm:mb-2">
                    <span
                      className="px-3 py-1 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold shadow-lg text-white"
                      style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
                    >
                      {project.status}
                    </span>
                    <span className="px-3 py-1 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-white/15 backdrop-blur-md text-white border border-white/20 shadow-lg">
                      {formatPropertyTypeLabel(project.propertyType, project.propertyType)}
                    </span>
                  </div>
                  {/* Developer name – hidden on mobile */}
                  <p className="hidden sm:flex text-white text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 items-center gap-1.5">
                    by <span className="text-white font-semibold">{project.developerName}</span>
                  </p>
                  {/* Project title */}
                  <h1 className="text-[22px] sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15]">
                    {project.name}
                  </h1>
                  {/* Location with QR */}
                  <div className="flex items-center gap-2 sm:gap-3 mt-1.5 sm:mt-3">
                    <button
                      onClick={() => setShowQrModal(true)}
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-white/90 p-0.5 shadow-sm hover:shadow-md active:scale-95 transition-all cursor-pointer flex-shrink-0"
                      title="Regulatory Permit"
                    >
                      <NextImage
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(qrUrl)}&bgcolor=ffffff&color=0B3D2E&margin=1`}
                        alt="Regulatory Permit QR"
                        width={80}
                        height={80}
                        className="w-full h-full rounded-sm"
                      />
                    </button>
                    <p className="text-white/80 flex items-center gap-1.5 text-[12px] sm:text-base">
                      <MapPin className="h-3.5 w-3.5 text-accent flex-shrink-0" />
                      <span>{project.community}, {project.city}, {project.country}</span>
                    </p>
                  </div>
                  {/* Save / Share actions */}
                  <div className="mt-3">
                    <DetailActions
                      propertyId={project.slug}
                      slug={project.slug}
                      title={project.name}
                      type="project"
                      variant="hero"
                    />
                  </div>
                </motion.div>

                {/* Right: Price above thumbnails (desktop only) */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="hidden sm:flex flex-col items-start lg:items-end gap-2 sm:gap-3 pointer-events-auto flex-shrink-0"
                >
                  <div className="flex flex-col gap-0.5 lg:items-end">
                    <span className="hidden sm:inline text-white/70 text-[11px] sm:text-xs uppercase tracking-widest font-semibold">Starting from</span>
                    <span className="text-xl sm:text-3xl lg:text-4xl font-bold text-white">{formatPrice(project.startingPrice, project.currency, currency)}</span>
                    {currency === "AED" && project.startingPrice && (
                      <span className="text-white/60 text-xs sm:text-sm lg:text-right">~{formatPrice(project.startingPrice, "AED", "USD")}</span>
                    )}
                  </div>

                  {images.length > 1 && (
                    <div className="hidden lg:flex gap-2 items-end">
                      {images.slice(0, 4).map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImage(i)}
                          className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                            i === activeImage
                              ? "border-accent shadow-lg shadow-accent/20 scale-110"
                              : "border-white/20 opacity-70 hover:opacity-100 hover:border-white/50"
                          }`}
                        >
                          <ImageWithFallback src={img} alt="" fill sizes="64px" className="object-cover" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Watch Tour + Photos + Brochure inline */}
                  <div className="hidden sm:flex items-center gap-2 flex-wrap">
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
                      className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-white transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
                      style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
                    >
                      <ImageIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Gallery
                    </button>
                    <a
                      href={project.brochureUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-white transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
                      style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)" }}
                    >
                      <Download className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Brochure
                    </a>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Gallery + Brochure buttons — moved out of hero */}
      <div className="sm:hidden px-4 py-3 flex gap-2 items-center">
        <button
          onClick={() => setShowGallery(true)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-[12px] font-bold text-white shadow-md active:scale-[0.97] transition-all"
          style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
        >
          <ImageIcon className="h-3.5 w-3.5" /> Gallery ({images.length})
        </button>
        <a
          href={project.brochureUrl || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-[12px] font-bold text-white shadow-md active:scale-[0.97] transition-all"
          style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)" }}
        >
          <Download className="h-3.5 w-3.5" /> Brochure
        </a>
      </div>

      {/* ───── QUICK STATS CARDS ───── */}
      <section className="py-4 sm:py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-2.5 sm:gap-3">
            {(() => {
              const isReady = ["Ready", "Completed"].includes(project.status);
              const handoverValue = isReady
                ? "Ready to Move In"
                : project.completionDate
                  ? new Date(project.completionDate).toLocaleDateString("en-GB", { month: "short", year: "numeric" })
                  : "TBA";
              const handoverIcon = isReady ? CheckCircle2 : Calendar;

              const sqftToSqm = (sqft: number) => Math.round(sqft * 0.0929);
              const sizeValue = project.unitSizeMin && project.unitSizeMax
                ? `${Number(project.unitSizeMin).toLocaleString()} – ${Number(project.unitSizeMax).toLocaleString()} sqft`
                : "—";
              const sizeSub = project.unitSizeMin && project.unitSizeMax
                ? `${sqftToSqm(Number(project.unitSizeMin)).toLocaleString()} – ${sqftToSqm(Number(project.unitSizeMax)).toLocaleString()} sqm`
                : null;
              const currencyKeys = Object.keys(CURRENCY_RATES);

              return [
                { icon: Building2, label: "Developer", value: project.developerName || "—", sub: null },
                { icon: Wallet, label: "Starting Price", value: formatPrice(project.startingPrice, project.currency, currency), sub: currency === "AED" && project.startingPrice ? `~${formatPrice(project.startingPrice, "AED", "USD")}` : null, isCurrency: true },
                { icon: Bed, label: "Unit Types", value: project.unitTypes?.join(" · ") || "—", sub: null },
                { icon: Ruler, label: "Size Range", value: sizeValue, sub: sizeSub },
                { icon: handoverIcon, label: isReady ? "Status" : "Handover", value: handoverValue, sub: null },
                { icon: CreditCard, label: "Payment Plan", value: project.paymentPlanSummary || project.downPayment ? `${project.downPayment || "20%"} Down` : "Flexible Plan", sub: project.paymentPlanSummary || "Easy Installments", isPaymentPlan: true },
              ].map(({ icon: StatIcon, label, value, sub, isPaymentPlan, isCurrency }, idx) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * idx + 0.2 }}
                  className="bg-card rounded-2xl p-3 sm:p-4 border-l-[3px] border-l-accent border border-border/50 hover:shadow-md transition-shadow duration-300 min-h-[80px] sm:min-h-[92px] flex flex-col justify-center"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <StatIcon className="h-4 w-4 text-accent" />
                    <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-bold">{label}</p>
                    {isCurrency && (
                      <div className="ml-auto relative">
                        <button
                          onClick={(e) => { e.stopPropagation(); setShowCurrencyDropdown(!showCurrencyDropdown); }}
                          className="flex items-center gap-1 text-[10px] font-bold text-accent border border-accent/30 bg-accent/5 px-2 py-1 rounded-lg shadow-sm hover:bg-accent/10 transition-colors"
                        >
                          {currency}
                          <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${showCurrencyDropdown ? "rotate-180" : ""}`} />
                        </button>
                        <AnimatePresence>
                          {showCurrencyDropdown && (
                            <motion.div
                              initial={{ opacity: 0, y: -4, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -4, scale: 0.95 }}
                              transition={{ duration: 0.15 }}
                              className="absolute right-0 top-full mt-1.5 bg-card border border-border/60 rounded-xl shadow-lg z-50 min-w-[100px] overflow-hidden backdrop-blur-xl"
                            >
                              {currencyKeys.map((c) => (
                                <button
                                  key={c}
                                  onClick={(e) => { e.stopPropagation(); setCurrency(c); setShowCurrencyDropdown(false); }}
                                  className={`w-full text-left px-3 py-2 text-[11px] font-semibold transition-colors ${c === currency ? "bg-accent/10 text-accent" : "text-foreground/70 hover:bg-muted/60 hover:text-foreground"}`}
                                >
                                  {c}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                  {isPaymentPlan ? (
                  <div>
                      <p className="text-[12px] sm:text-sm font-bold text-foreground leading-snug">10% – 70% – 20%</p>
                      <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">Booking – Construction – Handover</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-[12px] sm:text-sm font-bold text-foreground leading-snug">{value}</p>
                      {sub && <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
                    </>
                  )}
                </motion.div>
              ));
            })()}
          </div>
        </div>
      </section>

      {/* ───── MAIN CONTENT ───── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-10 lg:gap-12">

          {/* ═══ LEFT COLUMN ═══ */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-8">

            {/* Tab Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex gap-1 sm:gap-1.5 bg-muted/50 p-1 sm:p-1.5 rounded-2xl border border-border/50"
            >
              {(["overview", "location", "payment", "faq"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 relative px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                    activeTab === tab
                      ? "text-white shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                  }`}
                  style={activeTab === tab ? { background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" } : undefined}
                >
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
                  className="space-y-4 sm:space-y-8"
                >
                  {/* Overview */}
                  <div className="space-y-4">
                    <div>
                      <div className="h-[2px] w-8 rounded-full bg-gradient-to-r from-accent to-accent/60 mb-3" />
                      <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-accent mb-1.5">About the Project</p>
                      <h2 className="text-lg sm:text-2xl font-bold text-foreground">Project Overview</h2>
                    </div>
                    {project.shortOverview && (
                      <p className="text-base sm:text-lg text-foreground/90 leading-relaxed font-medium">{project.shortOverview}</p>
                    )}
                    {project.fullDescription && (() => {
                      const clean = project.fullDescription.replace(/<[^>]*>/g, " ").replace(/\s{2,}/g, " ").trim();
                      return clean ? <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{clean}</p> : null;
                    })()}
                  </div>

                  {/* Available Units */}
                  {((project.unitTypes?.length ?? 0) > 0 || ((project.propertyTypes?.length ?? 0) > 1 && (project.priceByType?.length ?? 0) > 0)) && (() => {
                    // Multi-type: derive unit data from priceByType filtered by activePropertyType
                    const hasMultiplePropertyTypes = (project.propertyTypes?.length ?? 0) > 1;
                    const filteredPriceByType: any[] = hasMultiplePropertyTypes
                      ? (project.priceByType || []).filter((p: any) => p.propertyType === activePropertyType)
                      : [];

                    const unitData = hasMultiplePropertyTypes && filteredPriceByType.length > 0
                      ? filteredPriceByType.map((p: any, idx: number) => {
                          const ut: string = p.type || "";
                          const bedroomMatch = ut.match(/(\d+)/);
                          const bedrooms = bedroomMatch ? parseInt(bedroomMatch[1]) : ut.toLowerCase() === "studio" ? 0 : ut.toLowerCase() === "penthouse" ? 4 : 1;
                          const bathrooms = Math.max(1, bedrooms);
                          const rawMin = p.priceMin || 0;
                          const rawMax = p.priceMax || 0;
                          const minPrice = rawMin < 1_000 ? rawMin * 1_000_000 : rawMin;
                          const maxPrice = rawMax < 1_000 ? rawMax * 1_000_000 : rawMax;
                          const sizeStr: string = p.size || "";
                          const sizeParts = sizeStr.split("-").map((s: string) => parseInt(s.replace(/[^0-9]/g, ""))).filter(Boolean);
                          const minSize = sizeParts[0] || 0;
                          const maxSize = sizeParts[1] || minSize;
                          const features = [
                            "Built-in Wardrobes",
                            bedrooms >= 2 ? "Maid's Room" : null,
                            idx % 2 === 0 ? "Sea View" : "City View",
                            "Balcony",
                            bedrooms >= 3 ? "Private Terrace" : null,
                            "Central A/C",
                            ut.toLowerCase().includes("penthouse") ? "Private Pool" : null,
                          ].filter(Boolean) as string[];
                          return { name: ut, minPrice, maxPrice, minSize, maxSize, bedrooms, bathrooms, features, available: true };
                        })
                      : project.unitTypes.map((ut: string, idx: number) => {
                          const totalTypes = project.unitTypes!.length;
                          const rawPrice = project.startingPrice || 0;
                          const basePrice = rawPrice < 1_000 ? rawPrice * 1_000_000 : rawPrice;
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

                    const clampedUnitTab = Math.min(activeUnitTab, Math.max(0, unitData.length - 1));
                    const activeUnit = unitData[clampedUnitTab];
                    return (
                      <div className="rounded-3xl overflow-hidden">
                        {/* Section header */}
                        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Home className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-accent">Browse Units</p>
                            <h2 className="text-lg sm:text-2xl font-bold text-foreground">Available Units</h2>
                          </div>
                        </div>

                        {/* Primary property type tabs — segmented control */}
                        {hasMultiplePropertyTypes && (
                          <div className="mb-5">
                            <p className="text-xs uppercase tracking-widest font-bold text-foreground/70 mb-2.5 pl-0.5">Property Type</p>
                            <div className="inline-flex w-full gap-1.5 p-1.5 bg-muted/50 rounded-2xl border border-border/30">
                              {(project.propertyTypes as string[]).map((pt) => (
                                <button
                                  key={pt}
                                  onClick={() => { setActivePropertyType(pt); setActiveUnitTab(0); }}
                                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap focus:outline-none focus-visible:outline-none ${
                                    activePropertyType === pt
                                      ? "bg-white text-primary shadow-md shadow-black/8 border border-border/20"
                                      : "text-muted-foreground hover:text-foreground"
                                  }`}
                                >
                                  {pt.toLowerCase().includes("villa") || pt.toLowerCase().includes("townhouse") ? (
                                    <Home className="w-3.5 h-3.5 flex-shrink-0" />
                                  ) : pt.toLowerCase().includes("penthouse") ? (
                                    <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                                  ) : (
                                    <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                                  )}
                                  <span className="truncate">{pt}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Secondary bedroom type tabs */}
                        <div className="flex gap-2 overflow-x-auto pb-3 sm:pb-5 scrollbar-hide">
                          {unitData.map((unit, i) => (
                            <button
                              key={unit.name}
                              onClick={() => setActiveUnitTab(i)}
                              className={`flex-shrink-0 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap focus:outline-none focus-visible:outline-none ${
                                clampedUnitTab === i
                                  ? "text-white shadow-md shadow-primary/20"
                                  : "bg-transparent text-muted-foreground border border-border hover:border-primary/40 hover:text-foreground"
                              }`}
                              style={clampedUnitTab === i ? { background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" } : undefined}
                            >
                              {unit.name}
                            </button>
                          ))}
                        </div>

                        {/* Unit detail card */}
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={`${activePropertyType}-${clampedUnitTab}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            className="bg-card rounded-3xl border border-border/50 overflow-hidden shadow-sm"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
                              {/* Floor plan side */}
                              <div className="md:col-span-2 relative bg-muted/20 flex items-center justify-center p-4 sm:p-4 min-h-[180px] sm:min-h-[280px] md:min-h-[420px]">
                                {(hasMultiplePropertyTypes
                                    ? project.floorPlans?.find((fp: any) => fp.propertyType === activePropertyType && fp.type === filteredPriceByType[clampedUnitTab]?.type)?.image
                                    : project.floor_plans?.[clampedUnitTab]
                                ) ? (
                                  <NextImage
                                    src={(hasMultiplePropertyTypes
                                      ? project.floorPlans?.find((fp: any) => fp.propertyType === activePropertyType && fp.type === filteredPriceByType[clampedUnitTab]?.type)?.image
                                      : project.floor_plans?.[clampedUnitTab]) as string}
                                    alt={`${activeUnit?.name} floor plan`}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 40vw"
                                    className="object-contain"
                                  />
                                ) : (
                                  <UnitImagePlaceholder
                                    bedrooms={activeUnit?.bedrooms || 0}
                                    unitName={activeUnit?.name || ""}
                                  />
                                )}
                                <div className="absolute bottom-4 left-4">
                                  <span className="inline-flex px-3 py-1.5 rounded-full text-xs font-bold bg-white/90 text-primary backdrop-blur-sm shadow-sm border border-border/30">
                                    {activeUnit?.name} Floor Plan
                                  </span>
                                </div>
                              </div>

                              {/* Info side */}
                              <div className="md:col-span-3 p-4 sm:p-6 md:p-8 flex flex-col justify-between gap-3 sm:gap-6">
                                {/* Top: Title + status */}
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <h3 className="text-lg sm:text-3xl font-bold text-foreground">{activeUnit?.name}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">{project.name}</p>
                                  </div>
                                  <span className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Available
                                  </span>
                                </div>

                                {/* Price card */}
                                <div className="rounded-2xl p-4 sm:p-5 text-white shadow-lg shadow-accent/20" style={{ background: "linear-gradient(to right, #D4A847, #B8922F)" }}>
                                  <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-white/70 font-bold">Price Range</p>
                                  <p className="text-xl sm:text-3xl font-bold mt-1 sm:mt-1">
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
                                    { icon: Users, value: activeUnit?.bathrooms, label: "Baths" },
                                    { icon: Ruler, value: `${activeUnit?.minSize?.toLocaleString()}`, label: "Sq. Ft." },
                                  ].map(({ icon: StatIcon, value, label }) => (
                                    <div key={label} className="bg-muted/40 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center border border-border/30 hover:border-primary/20 transition-all hover:shadow-sm group">
                                      <StatIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary/60 group-hover:text-primary mx-auto mb-1.5 transition-colors" />
                                      <p className="text-base sm:text-lg font-bold text-foreground">{value}</p>
                                      <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">{label}</p>
                                    </div>
                                  ))}
                                </div>

                                {/* Features */}
                                <div>
                                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-3">Key Features</p>
                                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                    {activeUnit?.features.map((f, fi) => (
                                      <motion.span
                                        key={fi}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: fi * 0.04 }}
                                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-muted/50 text-foreground/80 rounded-full text-[11px] sm:text-xs font-medium border border-border/40 hover:border-primary/25 hover:bg-primary/[0.05] transition-all cursor-default"
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
                    className="flex items-center gap-3 sm:gap-4 rounded-2xl sm:rounded-full p-4 sm:p-6 group transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.99]"
                    style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
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
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-card to-accent/[0.03]" />
                      <div className="relative p-4 sm:p-8">
                         <div className="flex items-center gap-2 sm:gap-3 mb-5 sm:mb-8">
                          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-accent">Why This Project</p>
                            <h2 className="text-lg sm:text-2xl font-bold text-foreground">Key Highlights</h2>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4">
                          {project.keyHighlights.map((h: string, i: number) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 16 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                              whileHover={{ scale: 1.02, y: -2 }}
                              className="group relative"
                            >
                              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
                              <div className="relative flex items-center gap-2.5 sm:gap-4 p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-card/80 backdrop-blur-sm border border-border/60 group-hover:border-primary/30 group-hover:shadow-lg group-hover:shadow-primary/[0.06] transition-all duration-500">
                                <div className="w-8 h-8 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary/10 to-primary/80/10 flex items-center justify-center flex-shrink-0 group-hover:from-primary/20 group-hover:to-primary/80/20 transition-all duration-500">
                                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-accent fill-accent/30 group-hover:fill-accent/60 transition-all duration-300" />
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
                    <div className="relative aspect-video group cursor-pointer">
                      <NextImage
                        src={project.imageGallery?.[0] || videoThumbnail}
                        alt={`${project.name} video overview`}
                        fill
                        sizes="(max-width: 768px) 100vw, 60vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
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

                  {/* ───── PHOTO GALLERY ───── */}
                  {images.length > 1 && (
                    <div className="bg-card rounded-2xl border border-border/50 p-4 sm:p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-accent/15 flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-accent" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-accent">Media</p>
                            <h2 className="text-base sm:text-lg font-bold text-foreground">Gallery</h2>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowGallery(true)}
                          className="text-xs text-accent font-semibold hover:underline flex items-center gap-1"
                        >
                          View All ({images.length}) <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Mobile: horizontal scroll strip */}
                      <div className="sm:hidden -mx-4 px-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide flex gap-2.5 pb-1">
                        {images.slice(0, 6).map((img, i) => (
                          <motion.button
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.04 }}
                            onClick={() => { setActiveImage(i); setShowGallery(true); }}
                            className="relative flex-shrink-0 w-[70%] aspect-[3/2] rounded-xl overflow-hidden border border-border/50 snap-center"
                          >
                            <ImageWithFallback src={img} alt={`${project.name} - ${i + 1}`} fill sizes="70vw" className="object-cover" />
                            {i === 5 && images.length > 6 && (
                              <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center">
                                <span className="text-white font-bold text-base">+{images.length - 6}</span>
                              </div>
                            )}
                          </motion.button>
                        ))}
                      </div>

                      {/* Desktop: straight row of 4 */}
                      <div className="hidden sm:grid grid-cols-4 gap-3">
                        {images.slice(0, 4).map((img, i) => (
                          <motion.button
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => { setActiveImage(i); setShowGallery(true); }}
                            className="relative group aspect-[4/3] rounded-2xl overflow-hidden border border-border/50 hover:border-accent/30 transition-all"
                          >
                            <ImageWithFallback src={img} alt={`${project.name} - ${i + 1}`} fill sizes="25vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors duration-300 flex items-center justify-center">
                              <Eye className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                            {i === 3 && images.length > 4 && (
                              <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center rounded-2xl">
                                <span className="text-white font-bold text-lg">+{images.length - 4}</span>
                              </div>
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Floor Plans - Dedicated Section */}
                  {project.unitTypes && project.unitTypes.length > 0 && (() => {
                    const floorPlanUnits = project.unitTypes.map((ut: string, idx: number) => {
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
                        <div className="mb-4 sm:mb-8">
                          <div className="flex items-center gap-2.5 mb-2">
                            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                              <FileText className="h-4.5 w-4.5 text-primary" />
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-accent">Layouts</p>
                              <h2 className="text-lg sm:text-xl font-bold text-foreground">Floor Plans</h2>
                            </div>
                          </div>
                        </div>

                        {/* Unit type tabs */}
                        <div className="flex gap-2 overflow-x-auto pb-3 sm:pb-4 mb-4 sm:mb-8 scrollbar-hide -mx-2 px-2">
                          {floorPlanUnits.map((unit, i) => (
                            <button
                              key={unit.name}
                              onClick={() => setActiveFloorPlanTab(i)}
                              className={`flex-shrink-0 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                                activeFloorPlanTab === i
                                  ? "text-white shadow-md"
                                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                              }`}
                              style={activeFloorPlanTab === i ? { background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" } : undefined}
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
                              {project.floor_plans && project.floor_plans[activeFloorPlanTab] ? (
                                <NextImage
                                  src={project.floor_plans[activeFloorPlanTab]}
                                  alt={`${project.name} ${floorPlanUnits[activeFloorPlanTab]?.name} Floor Plan`}
                                  fill
                                  sizes="(max-width: 768px) 100vw, 60vw"
                                  className="object-contain rounded-2xl"
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
                            <div className="grid grid-cols-3 gap-1.5 sm:gap-3 mt-3 sm:mt-4 mb-4 sm:mb-6">
                              <div className="p-2 sm:p-3.5 bg-muted/40 rounded-lg sm:rounded-xl text-center">
                                <Ruler className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary mx-auto mb-1" />
                                <p className="text-xs sm:text-sm font-bold text-foreground">{floorPlanUnits[activeFloorPlanTab]?.unitSize.toLocaleString()}</p>
                                <p className="text-[8px] sm:text-[10px] text-muted-foreground uppercase tracking-wider">sqft</p>
                              </div>
                              <div className="p-2 sm:p-3.5 bg-muted/40 rounded-lg sm:rounded-xl text-center">
                                <Bed className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary mx-auto mb-1" />
                                <p className="text-xs sm:text-sm font-bold text-foreground">{floorPlanUnits[activeFloorPlanTab]?.bedrooms === 0 ? "Studio" : floorPlanUnits[activeFloorPlanTab]?.bedrooms}</p>
                                <p className="text-[8px] sm:text-[10px] text-muted-foreground uppercase tracking-wider">Beds</p>
                              </div>
                              <div className="p-2 sm:p-3.5 bg-muted/40 rounded-lg sm:rounded-xl text-center">
                                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary mx-auto mb-1" />
                                <p className="text-xs sm:text-sm font-bold text-foreground">{floorPlanUnits[activeFloorPlanTab]?.bathrooms}</p>
                                <p className="text-[8px] sm:text-[10px] text-muted-foreground uppercase tracking-wider">Baths</p>
                              </div>
                            </div>
                            {/* Total area bar */}
                            <div className="flex items-center justify-between bg-muted/30 rounded-xl px-3 py-2 sm:px-4 sm:py-3 mb-4 sm:mb-6">
                              <div className="flex items-center gap-2">
                                <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                                <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">Total Area</span>
                              </div>
                              <span className="text-sm sm:text-base font-bold text-foreground">{floorPlanUnits[activeFloorPlanTab]?.totalArea.toLocaleString()} sqft</span>
                            </div>

                            {/* Download button */}
                            <button className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-semibold text-primary border-2 border-primary/25 transition-all duration-300 hover:bg-gradient-to-r hover:from-primary hover:to-primary/80 hover:text-white hover:border-transparent hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] group">
                              <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:translate-y-0.5 transition-transform" />
                              <span className="hidden sm:inline">Download Floor Plan PDF — {floorPlanUnits[activeFloorPlanTab]?.name}</span>
                              <span className="sm:hidden">Download {floorPlanUnits[activeFloorPlanTab]?.name} PDF</span>
                            </button>
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    );
                  })()}


                  {/* Payment Plan Visual Timeline */}
                  {project.unitTypes && project.unitTypes.length > 0 && (() => {
                    const rawPrice = project.startingPrice || 0;
                    const basePrice = rawPrice < 1_000 ? rawPrice * 1_000_000 : rawPrice;
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
                      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
                        {/* Header with gradient */}
                        <div className="p-3.5 sm:p-5 flex items-center justify-between" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 flex items-center justify-center">
                              <CreditCard className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <h2 className="text-base sm:text-xl font-bold text-white">Payment Plan</h2>
                              <p className="text-[10px] sm:text-xs text-white/60">
                                For {project.unitTypes![activeUnitTab]} · {formatPrice(unitPrice, "AED", currency)}
                              </p>
                            </div>
                          </div>
                          {planSummary && (
                            <span className="px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-bold bg-white/15 text-white border border-white/20">
                              {planSummary}
                            </span>
                          )}
                        </div>

                        <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6">
                          {/* Progress bar */}
                          <div className="flex rounded-full overflow-hidden h-2.5 sm:h-3 bg-muted/50">
                            {milestones.map((m, i) => (
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

                          {/* Timeline steps — compact on mobile */}
                          <div className="relative">
                            <div className="absolute left-[11px] sm:left-[15px] top-3 bottom-3 w-[2px] bg-border rounded-full" />
                            <div className="space-y-0">
                              {milestones.map((m, i) => {
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
                                    className="flex items-center gap-2.5 sm:gap-4 py-2.5 sm:py-4 relative"
                                  >
                                    {/* Node */}
                                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full ${m.color} flex items-center justify-center flex-shrink-0 z-10 shadow-md`}>
                                      <MIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
                                      <div className="min-w-0">
                                        <p className="text-xs sm:text-sm font-bold text-foreground">{m.label}</p>
                                        <p className="text-[9px] sm:text-[11px] text-muted-foreground">Step {i + 1} · {cumulativePct}% paid</p>
                                      </div>
                                      <div className="flex items-baseline gap-1.5 sm:gap-2 flex-shrink-0">
                                        <span className="text-sm sm:text-lg font-bold text-foreground">{m.pct}%</span>
                                        <div className="flex flex-col items-end">
                                          <span className="text-[11px] sm:text-sm font-semibold text-foreground">{formatPrice(amount, "AED", currency)}</span>
                                          {currency === "AED" && (
                                            <span className="text-[9px] sm:text-[10px] text-muted-foreground">~{formatPrice(amount, "AED", "USD")}</span>
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
                          <div className="pt-3 sm:pt-4 border-t border-border/50 flex items-center justify-between">
                            <p className="text-xs sm:text-sm font-semibold text-muted-foreground">Total</p>
                            <div className="text-right">
                              <p className="text-base sm:text-lg font-bold text-foreground">{formatPrice(unitPrice, "AED", currency)}</p>
                              {currency === "AED" && (
                                <p className="text-[10px] sm:text-[11px] text-muted-foreground">~{formatPrice(unitPrice, "AED", "USD")}</p>
                              )}
                            </div>
                          </div>

                          {project.paymentPlanDetails && (
                            <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed bg-muted/30 rounded-xl p-2.5 sm:p-3 border border-border/30">{project.paymentPlanDetails}</p>
                          )}
                        </div>
                      </div>
                    );
                  })()}


                  {/* Location & Nearby */}
                   <div className="bg-card rounded-2xl border border-border/50 p-4 sm:p-8 overflow-hidden">
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
                      if (project.mapUrl) {
                        // If it's already an embed URL, use directly; otherwise convert
                        embedSrc = project.mapUrl.includes("/embed/")
                          ? project.mapUrl
                          : project.mapUrl.replace("/maps/", "/maps/embed/");
                      } else if (project.latitude && project.longitude) {
                        embedSrc = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${project.latitude},${project.longitude}&zoom=15`;
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
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                          {items.map((item, i) => {
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
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 sm:gap-3 mb-4 sm:mb-6">
                          {stats.map((s, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 8 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: i * 0.1 }}
                              className="rounded-xl border border-border/50 p-2 sm:p-3 text-center bg-muted/20"
                            >
                              <s.icon className={`h-4 w-4 ${s.iconClass} mx-auto mb-1`} />
                              <p className="text-base sm:text-xl font-bold text-foreground">{s.value}</p>
                              <p className="text-[8px] sm:text-[10px] font-semibold text-muted-foreground">{s.label}</p>
                              <p className="text-[7px] sm:text-[9px] text-muted-foreground/70 hidden sm:block">{s.sub}</p>
                            </motion.div>
                          ))}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {reasons.map((reason, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -6 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: i * 0.05 }}
                              className="flex items-center gap-2.5 rounded-xl border border-border/50 p-2.5 sm:p-3 bg-muted/10 hover:bg-muted/30 transition-colors"
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
                            <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-accent">Lifestyle</p>
                            <h2 className="text-xl font-bold text-foreground">Amenities & Facilities</h2>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 sm:gap-3">
                          {amenities.map((amenity, i) => {
                            const AIcon = getIcon(amenity);
                            return (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.03 }}
                                className="rounded-lg sm:rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors p-2 sm:p-3 flex flex-col items-center text-center gap-1.5 sm:gap-2"
                              >
                                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center">
                                  <AIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                                </div>
                                <span className="text-[10px] sm:text-[11px] font-semibold text-foreground leading-tight">{amenity}</span>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* FAQ Section */}
                  <div className="bg-card rounded-2xl border border-border/50 p-4 sm:p-8">
                    <div className="flex items-center gap-2.5 mb-6">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <FileText className="h-4.5 w-4.5 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-accent">Common Questions</p>
                        <h2 className="text-lg sm:text-xl font-bold text-foreground">Frequently Asked Questions</h2>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {faqs.map((faq, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 8 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.05 }}
                          className="border border-border/50 rounded-xl overflow-hidden"
                        >
                          <button
                            onClick={() => setOpenFaq(openFaq === i ? null : i)}
                            className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
                          >
                            <span className="text-sm font-semibold text-foreground pr-4">{faq.question}</span>
                            <ChevronDown className={`h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`} />
                          </button>
                          <AnimatePresence>
                            {openFaq === i && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <div className="px-4 pb-4">
                                  <div className="w-12 h-px bg-accent/30 mb-3" />
                                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))}
                    </div>
                  </div>


                  {/* About the Developer */}
                  {project.developerName && (
                    <div className="relative bg-card rounded-2xl border border-border/50 overflow-hidden">
                      <div className="h-1.5 bg-gradient-to-r from-primary via-primary/60 to-accent" />
                      <div className="p-4 sm:p-6 md:p-8">
                        {/* Header */}
                        <div className="flex items-center gap-2.5 mb-5 sm:mb-6">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-4.5 w-4.5 text-primary" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-accent">Developer</p>
                            <h2 className="text-lg sm:text-xl font-bold text-foreground">About the Developer</h2>
                          </div>
                        </div>

                        {/* Developer name + description */}
                        <div className="flex items-start gap-4 mb-5 sm:mb-6">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-border/50 flex items-center justify-center flex-shrink-0 shadow-sm">
                            <span className="text-xl font-black text-primary/60">{project.developerName.split(" ").map((w: string) => w[0]).join("").slice(0, 2)}</span>
                          </div>
                          <div>
                            <h3 className="text-base sm:text-lg font-bold text-foreground mb-1">{project.developerName}</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                              {project.developerName} is a leading real estate developer in the UAE, known for delivering iconic residential and commercial projects across prime locations in Dubai.
                            </p>
                          </div>
                        </div>

                        {/* Stats row */}
                        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5 sm:mb-6">
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
                                className="flex flex-col items-center text-center rounded-xl border border-border/50 bg-muted/20 py-3 sm:py-4 px-2 hover:border-primary/20 hover:shadow-sm transition-all duration-300"
                              >
                                <StatIcon className="h-4 w-4 text-primary/60 mb-1.5" />
                                <p className="text-base sm:text-xl font-bold text-foreground">{stat.value}</p>
                                <p className="text-[9px] sm:text-[11px] text-muted-foreground font-medium mt-0.5 leading-tight">{stat.label}</p>
                              </motion.div>
                            );
                          })}
                        </div>

                        {/* CTA */}
                        <Link href={`/developers/${project.developerSlug || (project.developerName ? project.developerName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") : "")}`} className="inline-flex items-center gap-2 text-sm font-bold text-foreground border border-border/60 hover:border-primary/30 hover:bg-primary/5 px-5 py-2.5 rounded-full transition-all duration-300 group">
                          View Developer Profile <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Enquiry Form — hidden on mobile (shown inline below price card in right column) */}
                   <div className="hidden sm:block bg-card rounded-2xl border border-border/50 p-4 sm:p-8">
                    <div className="flex items-center gap-2.5 mb-5 sm:mb-6">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-accent/15 flex items-center justify-center">
                        <Mail className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-accent" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-accent">Get in Touch</p>
                        <h2 className="text-base sm:text-xl font-bold text-foreground">Enquire About This Project</h2>
                        <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">Get detailed pricing and availability</p>
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
                        onSubmit={handleEnquirySubmit}
                        className="space-y-3 sm:space-y-4"
                      >
                        {/* Core fields — always visible */}
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
                          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Phone Number *</label>
                          <div className="flex gap-2">
                            <select
                              value={enquiryForm.countryCode}
                              onChange={(e) => setEnquiryForm(f => ({ ...f, countryCode: e.target.value }))}
                              className="h-11 rounded-xl bg-muted/30 border border-border/50 px-3 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all appearance-none"
                            >
                              <option value="+971">🇦🇪 +971</option>
                              <option value="+44">🇬🇧 +44</option>
                              <option value="+1">🇺🇸 +1</option>
                              <option value="+91">🇮🇳 +91</option>
                              <option value="+86">🇨🇳 +86</option>
                              <option value="+7">🇷🇺 +7</option>
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

                        {/* Pre-filled message */}
                        <div className="bg-muted/20 rounded-xl px-3.5 py-2.5 border border-border/30">
                          <p className="text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground/70">Message:</span> I'm interested in {project.name}. Please share pricing and availability.
                          </p>
                        </div>

                        {/* Optional expander — mobile-first */}
                        <div>
                          <button
                            type="button"
                            onClick={() => setShowMoreEnquiry(!showMoreEnquiry)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                          >
                            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showMoreEnquiry ? "rotate-180" : ""}`} />
                            {showMoreEnquiry ? "Hide details" : "Add more details (optional)"}
                          </button>

                          {showMoreEnquiry && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="space-y-3 mt-3 overflow-hidden"
                            >
                              <div>
                                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Email</label>
                                <input
                                  type="email"
                                  value={enquiryForm.email}
                                  onChange={(e) => setEnquiryForm(f => ({ ...f, email: e.target.value }))}
                                  className="w-full h-11 rounded-xl bg-muted/30 border border-border/50 px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
                                  placeholder="your@email.com"
                                />
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
                                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Custom Message</label>
                                <textarea
                                  rows={2}
                                  value={enquiryForm.message}
                                  onChange={(e) => setEnquiryForm(f => ({ ...f, message: e.target.value }))}
                                  className="w-full rounded-xl bg-muted/30 border border-border/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all resize-none"
                                  placeholder="Any specific requirements..."
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
                                            ? "text-white shadow-md"
                                            : "bg-muted/50 text-muted-foreground hover:bg-muted border border-border/50"
                                        }`}
                                        style={enquiryForm.contactMethod === method.key
                                          ? { background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }
                                          : undefined
                                        }
                                      >
                                        <MIcon className="h-3.5 w-3.5" />
                                        {method.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </div>

                        <button
                          type="submit"
                          className="w-full h-12 rounded-full text-white font-bold text-sm transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]"
                          style={{ background: "linear-gradient(to right, #D4A847, #B8922F)", boxShadow: "0 4px 20px rgba(212,168,71,0.3)" }}
                        >
                          Send Quick Enquiry
                        </button>

                        <p className="text-[10px] text-muted-foreground text-center">We'll get back to you within 2 hours</p>
                      </form>
                    )}
                  </div>

                  {/* Schedule Video Consultation */}
                  <a
                    href="#schedule-call"
                    className="block rounded-2xl p-[2px] bg-gradient-to-r from-primary via-primary/60 to-accent transition-all duration-300 group hover:shadow-lg hover:shadow-primary/15 hover:scale-[1.01]"
                  >
                    <div className="rounded-[14px] bg-card/95 backdrop-blur-xl p-4 sm:p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/15 flex items-center justify-center flex-shrink-0 group-hover:from-primary/20 transition-all">
                          <Calendar className="h-4.5 w-4.5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-primary">Schedule a Video Consultation</h3>
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">Book a free video call with our property consultant — no obligations</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-primary/40 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </div>
                    </div>
                  </a>

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
                  className="space-y-4 sm:space-y-8"
                >
                  {/* Pricing & Ownership — full card on desktop, just facts on mobile */}
                  <div className="hidden sm:block bg-card rounded-2xl border border-border/50 overflow-hidden">
                    <div className="p-4 sm:p-6 md:p-8" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
                      <p className="text-primary-foreground/60 text-[10px] sm:text-xs uppercase tracking-[0.15em] font-semibold">Starting Price</p>
                      <p className="text-2xl sm:text-4xl font-bold text-primary-foreground mt-1">{formatPrice(project.startingPrice, project.currency, currency)}</p>
                      {currency === "AED" && project.startingPrice && (
                        <p className="text-primary-foreground/40 text-xs sm:text-sm mt-1">~{formatPrice(project.startingPrice, "AED", "USD")}</p>
                      )}
                      {project.priceRange && <p className="text-primary-foreground/50 text-xs sm:text-sm mt-1 sm:mt-2">{project.priceRange}</p>}
                    </div>
                    <div className="p-3.5 sm:p-6 md:p-8">
                      <div className="grid grid-cols-2 gap-2 sm:gap-4">
                        <div className="p-3 sm:p-4 bg-muted/50 rounded-xl">
                          <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-1">Title Type</p>
                          <p className="text-sm sm:text-base font-bold text-foreground">{project.titleType || "Freehold"}</p>
                        </div>
                        <div className="p-3 sm:p-4 bg-muted/50 rounded-xl">
                          <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-1">Ownership</p>
                          <p className="text-sm sm:text-base font-bold text-foreground">{project.ownershipEligibility || "All Nationalities"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Mobile-only: just Title Type + Ownership */}
                  <div className="sm:hidden grid grid-cols-2 gap-2">
                    <div className="p-3 bg-muted/50 rounded-xl border border-border/50">
                      <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-1">Title Type</p>
                      <p className="text-sm font-bold text-foreground">{project.titleType || "Freehold"}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-xl border border-border/50">
                      <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-1">Ownership</p>
                      <p className="text-sm font-bold text-foreground">{project.ownershipEligibility || "All Nationalities"}</p>
                    </div>
                  </div>

                  {/* Payment Plan Visual Timeline */}
                  {(() => {
                    const downPct = parseInt(project.downPayment || "0") || 20;
                    const duringPct = 100 - downPct > 40 ? Math.round((100 - downPct) * 0.6) : 100 - downPct - 20;
                    const handoverPct = 100 - downPct - (duringPct > 0 ? duringPct : 0);
                    const milestones = [
                      { label: "On Booking", pct: downPct, desc: "Down Payment", icon: Wallet, color: "from-accent to-accent/80" },
                      ...(duringPct > 0 ? [{ label: "During Construction", pct: duringPct, desc: "Progress-linked installments", icon: Building2, color: "from-primary to-primary/80" }] : []),
                      ...(handoverPct > 0 ? [{ label: "On Handover", pct: handoverPct, desc: "Balance on completion", icon: Home, color: "from-primary to-[#145C42]" }] : []),
                    ];
                    return (
                      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
                        <div className="p-3.5 sm:p-6 flex items-center gap-2.5 sm:gap-3" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/10 flex items-center justify-center">
                            <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                          <div>
                            <h2 className="text-base sm:text-xl font-bold text-white">Payment Plan</h2>
                            {project.paymentPlanSummary && (
                              <p className="text-white/60 text-xs sm:text-sm">{project.paymentPlanSummary}</p>
                            )}
                          </div>
                        </div>

                        <div className="p-3.5 sm:p-8 space-y-4 sm:space-y-6">
                          {/* Progress bar */}
                          <div className="relative">
                            <div className="flex rounded-full overflow-hidden h-2.5 sm:h-3 bg-muted/50">
                              {milestones.map((m, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${m.pct}%` }}
                                  transition={{ delay: 0.3 + i * 0.2, duration: 0.6, ease: "easeOut" }}
                                  className={`bg-gradient-to-r ${m.color} ${i === 0 ? "rounded-l-full" : ""} ${i === milestones.length - 1 ? "rounded-r-full" : ""}`}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Milestone cards */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
                            {milestones.map((m, i) => {
                              const MIcon = m.icon;
                              return (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, y: 15 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.2 + i * 0.1 }}
                                  className="relative bg-card rounded-xl border-l-[3px] border-l-accent border border-border/50 p-3 sm:p-5 hover:shadow-md transition-shadow"
                                >
                                  <div className="flex items-center justify-between sm:block">
                                    <div className="flex items-center gap-2 sm:mb-3">
                                      <MIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent" />
                                      <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-semibold">{m.label}</p>
                                    </div>
                                    <p className="text-xl sm:text-3xl font-bold text-foreground">{m.pct}%</p>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">{m.desc}</p>
                                  {project.startingPrice && (
                                    <p className="text-sm font-semibold text-accent mt-2">
                                      {formatPrice(Math.round((project.startingPrice < 1_000 ? project.startingPrice * 1_000_000 : project.startingPrice) * m.pct / 100), "AED", currency)}
                                    </p>
                                  )}
                                </motion.div>
                              );
                            })}
                          </div>

                          {/* Payment details */}
                          {project.paymentPlanDetails && (
                            <div className="p-3 sm:p-4 bg-muted/30 rounded-xl border border-border/30">
                              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{project.paymentPlanDetails}</p>
                            </div>
                          )}

                          {/* Accepted methods */}
                          {project.acceptedPaymentMethods && project.acceptedPaymentMethods.length > 0 && (
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-3">Accepted Methods</p>
                              <div className="flex flex-wrap gap-2">
                                {project.acceptedPaymentMethods.map((m: string, i: number) => (
                                  <span key={i} className="text-[11px] sm:text-xs px-3 sm:px-4 py-2 sm:py-2.5 bg-card border border-border rounded-xl text-foreground font-semibold hover:border-primary/30 transition-colors">
                                    {m}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}


                  {/* Units Information */}
                  <div className="bg-card rounded-2xl border border-border/50 p-4 sm:p-6 md:p-8">
                    <div className="flex items-center gap-2.5 mb-4 sm:mb-6">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Bed className="h-4.5 w-4.5 text-primary" />
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-foreground">Units Information</h2>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-4">
                      {[
                        { label: "Unit Types", value: project.unitTypes?.join(", ") || "—", icon: Bed },
                        { label: "Size Range", value: project.unitSizeMin && project.unitSizeMax ? `${Number(project.unitSizeMin).toLocaleString()} – ${Number(project.unitSizeMax).toLocaleString()} sqft` : "—", icon: Ruler },
                        { label: "Total Units", value: project.totalUnits?.toLocaleString() || "—", icon: Building2 },
                      ].map(({ label, value, icon: Icon }) => (
                        <div key={label} className="p-3 sm:p-5 bg-muted/40 rounded-xl text-center hover:bg-muted/60 transition-colors">
                          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary mx-auto mb-1.5 sm:mb-2" />
                          <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-0.5 sm:mb-1">{label}</p>
                          <p className="text-xs sm:text-sm font-bold text-foreground">{value}</p>
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
                  className="space-y-4 sm:space-y-8"
                >
                  {faqs.length > 0 ? (
                    <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
                      <div className="flex items-center gap-2.5 p-3.5 sm:p-6 pb-0 sm:pb-0 mb-3 sm:mb-4">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                          <MessageCircle className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 text-primary" />
                        </div>
                        <h2 className="text-base sm:text-xl font-bold text-foreground">Frequently Asked Questions</h2>
                      </div>
                      <div className="px-3.5 sm:px-6 pb-3.5 sm:pb-6 space-y-2 sm:space-y-3">
                        {faqs.map((faq, i) => (
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
                              className="w-full flex items-center justify-between p-3 sm:p-5 text-left gap-3"
                            >
                              <span className="text-xs sm:text-sm font-semibold text-foreground">{faq.question}</span>
                              <ChevronDown className={`h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${openFaq === i ? "rotate-180 text-primary" : ""}`} />
                            </button>
                            <AnimatePresence>
                              {openFaq === i && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.25, ease: "easeOut" as const }}
                                >
                                  <div className="px-3 sm:px-5 pb-3 sm:pb-5">
                                    <div className="w-10 h-px bg-primary/20 mb-2 sm:mb-3" />
                                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
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
                  className="space-y-4 sm:space-y-8"
                >
                  {/* Location Info */}
                  <div className="bg-card rounded-2xl border border-border/50 p-4 sm:p-6 md:p-8">
                    <div className="flex items-center gap-2.5 mb-4 sm:mb-6">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <MapPin className="h-4.5 w-4.5 text-primary" />
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-foreground">Location</h2>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-5">
                      <div className="p-2.5 sm:p-4 bg-muted/50 rounded-xl">
                        <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-0.5 sm:mb-1">Community</p>
                        <p className="text-xs sm:text-base font-bold text-foreground">{project.community || "—"}</p>
                      </div>
                      <div className="p-2.5 sm:p-4 bg-muted/50 rounded-xl">
                        <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-0.5 sm:mb-1">City</p>
                        <p className="text-xs sm:text-base font-bold text-foreground">{project.city}</p>
                      </div>
                      <div className="p-2.5 sm:p-4 bg-muted/50 rounded-xl">
                        <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-0.5 sm:mb-1">Country</p>
                        <p className="text-xs sm:text-base font-bold text-foreground">{project.country}</p>
                      </div>
                    </div>
                    {project.locationDescription && (
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4 sm:mb-5">{project.locationDescription}</p>
                    )}
                    {/* Google Maps Embed */}
                    {(() => {
                      let mapSrc = "";
                      if (project.mapUrl) {
                        // Try to convert standard Google Maps link to embed
                        const placeMatch = project.mapUrl.match(/place\/([^/]+)/);
                        if (placeMatch) {
                          mapSrc = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(placeMatch[1].replace(/\+/g, ' '))}`;
                        }
                      }
                      if (!mapSrc && project.latitude && project.longitude) {
                        mapSrc = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${project.latitude},${project.longitude}`;
                      }
                      if (!mapSrc) {
                        mapSrc = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent((project.community || '') + ', ' + project.city + ', ' + project.country)}`;
                      }
                      return (
                        <div className="rounded-xl overflow-hidden mb-4 sm:mb-5 border border-border/30" style={{ aspectRatio: "16/9" }}>
                          <iframe
                            src={mapSrc}
                            className="w-full h-full border-0"
                            allowFullScreen
                            loading="lazy"
                            title="Location Map"
                          />
                        </div>
                      );
                    })()}
                    {project.mapUrl && (
                      <a href={project.mapUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-primary text-primary-foreground rounded-xl text-xs sm:text-sm font-semibold hover:bg-primary/90 transition-colors">
                        <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> View on Google Maps
                      </a>
                    )}
                  </div>

                  {/* Nearby Attractions */}
                  {nearby.length > 0 && (
                    <div className="bg-card rounded-2xl border border-border/50 p-4 sm:p-6 md:p-8">
                      <div className="flex items-center gap-2.5 mb-4 sm:mb-6">
                        <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
                          <Compass className="h-4.5 w-4.5 text-accent" />
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold text-foreground">Nearby Attractions</h2>
                      </div>
                      <div className="space-y-2 sm:space-y-3">
                        {nearby.map((a, i) => {
                          const AttrIcon = attractionIcon(a.type);
                          return (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -8 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: i * 0.06 }}
                              className="flex items-center justify-between p-3 sm:p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors group"
                            >
                              <div className="flex items-center gap-2.5 sm:gap-3.5">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                                  <AttrIcon className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 text-primary" />
                                </div>
                                <div>
                                  <p className="text-xs sm:text-sm font-semibold text-foreground">{a.name}</p>
                                  <p className="text-[10px] sm:text-xs text-muted-foreground">{a.type}</p>
                                </div>
                              </div>
                              {a.distance && (
                                <span className="text-[10px] sm:text-xs font-bold text-primary bg-primary/10 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg">{a.distance}</span>
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

            {/* Mobile-only: Quick Enquiry — after tab content */}
            <div className="sm:hidden space-y-0 mt-4">
              <div className="rounded-2xl rounded-b-none overflow-hidden shadow-lg shadow-foreground/5">
                <div className="relative p-5 overflow-hidden" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
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
                <div className="px-4 pb-2 pt-2 bg-card border-x border-border/50">
                  <p className="text-[11px] text-muted-foreground text-center">
                    Have questions? <span className="font-semibold text-foreground/70">Fill in below</span> ↓
                  </p>
                </div>
              </div>
              <div className="bg-card rounded-2xl rounded-t-none border border-border/50 border-t-0 p-4">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Quick Enquiry</p>
                {enquirySubmitted ? (
                  <div className="text-center py-6">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                    <p className="text-sm font-bold text-foreground">Sent!</p>
                    <p className="text-xs text-muted-foreground">We'll call you within 2 hours.</p>
                    <button onClick={() => { setEnquirySubmitted(false); setEnquiryForm({ name: "", email: "", phone: "", countryCode: "+971", unitType: "", message: "", contactMethod: "whatsapp" }); }} className="mt-2 text-xs text-primary font-semibold">Send another</button>
                  </div>
                ) : (
                  <form onSubmit={handleEnquirySubmit} className="space-y-3">
                    <input
                      type="text" required
                      value={enquiryForm.name}
                      onChange={(e) => setEnquiryForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full h-11 rounded-xl bg-muted/30 border border-border/50 px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
                      placeholder="Your name"
                    />
                    <div className="flex gap-2">
                      <select
                        value={enquiryForm.countryCode}
                        onChange={(e) => setEnquiryForm(f => ({ ...f, countryCode: e.target.value }))}
                        className="h-11 rounded-xl bg-muted/30 border border-border/50 px-2.5 text-sm text-foreground outline-none appearance-none"
                      >
                        <option value="+971">🇦🇪 +971</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+91">🇮🇳 +91</option>
                      </select>
                      <input
                        type="tel" required
                        value={enquiryForm.phone}
                        onChange={(e) => setEnquiryForm(f => ({ ...f, phone: e.target.value }))}
                        className="flex-1 h-11 rounded-xl bg-muted/30 border border-border/50 px-4 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
                        placeholder="50 123 4567"
                      />
                    </div>
                    <div className="bg-muted/20 rounded-xl px-3 py-2 border border-border/30">
                      <p className="text-[11px] text-muted-foreground"><span className="font-semibold text-foreground/70">Re:</span> {project.name} — pricing & availability</p>
                    </div>
                    <button
                      type="submit"
                      className="w-full h-11 rounded-full text-white font-bold text-sm active:scale-[0.98] transition-all"
                      style={{ background: "linear-gradient(to right, #D4A847, #B8922F)" }}
                    >
                      Send Quick Enquiry
                    </button>
                    <p className="text-[10px] text-muted-foreground text-center">We'll get back within 2 hours</p>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* ═══ RIGHT COLUMN — STICKY SIDEBAR ═══ */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-5 -mt-2 sm:mt-0">

              {/* CTA Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="hidden sm:block bg-card rounded-2xl border border-border/50 overflow-hidden shadow-lg shadow-foreground/5 sm:rounded-b-2xl rounded-b-none"
              >
                <div className="relative p-6 overflow-hidden" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
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
                {/* Desktop: full CTA buttons */}
                <div className="hidden sm:block p-5 space-y-3">
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
                    className="w-full flex items-center justify-center gap-2 py-3.5 text-white rounded-full text-sm font-bold transition-all duration-300 shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/40 hover:scale-[1.02] active:scale-[0.98]"
                    style={{ background: "linear-gradient(to right, #D4A847, #B8922F)" }}
                  >
                    <Phone className="h-4 w-4" /> Call Now
                  </a>
                  <a
                    href="#live-chat"
                    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-primary/30 text-primary rounded-full text-sm font-semibold transition-all duration-300 hover:bg-gradient-to-r hover:from-primary hover:to-primary/80 hover:text-white hover:border-transparent hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <MessageCircle className="h-4 w-4" /> Live Chat
                  </a>
                </div>
                {/* Mobile: compact nudge instead of duplicate buttons */}
                <div className="sm:hidden px-4 pb-4 pt-2">
                  <p className="text-[11px] text-muted-foreground text-center">
                    Have questions? <span className="font-semibold text-foreground/70">Tap below</span> to reach us instantly ↓
                  </p>
                </div>
              </motion.div>



              {/* Quick Facts — desktop only */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="hidden sm:block bg-card rounded-2xl border border-border/50 p-5"
              >
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em] mb-4">Project Details</h3>
                <div className="divide-y divide-border/40">
                  {[
                    { label: "Developer", value: project.developerName },
                    { label: "Community", value: project.community },
                    { label: "City", value: `${project.city}, ${project.country}` },
                    { label: "Property Type", value: formatPropertyTypeLabel(project.propertyType, project.propertyType) },
                    ...(project.propertyTypes?.length > 0 ? [{ label: "Property Types", value: project.propertyTypes?.join(" · ") }] : []),
                    { label: "Project Type", value: project.projectType },
                    { label: "Status", value: project.status },
                    { label: "Title", value: project.titleType },
                    { label: "Eligibility", value: project.ownershipEligibility },
                    { label: "Total Units", value: project.totalUnits?.toLocaleString() },
                    { label: "Availability", value: project.availabilityStatus },
                  ].filter(f => f.value).map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center py-3.5 sm:py-3 text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="text-foreground font-semibold text-right max-w-[55%]">{value}</span>
                    </div>
                  ))}
                </div>
                {/* QR Code row */}
                <div className="mt-4 pt-4 border-t border-border/40 flex items-center gap-3">
                  <button
                    onClick={() => setShowQrModal(true)}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white border border-border/50 p-1 shadow-sm hover:shadow-md hover:border-primary/30 active:scale-95 transition-all cursor-pointer flex-shrink-0"
                    title="Scan QR Code"
                  >
                    <NextImage
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(qrUrl)}&bgcolor=ffffff&color=0B3D2E&margin=1`}
                      alt="QR Code"
                      width={100}
                      height={100}
                      className="w-full h-full rounded-sm"
                    />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground">Regulatory Permit</p>
                  </div>
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
                    {project.targetBuyers.map((b: string, i: number) => {
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

      {/* ───── SIMILAR PROJECTS ───── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
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
          ].map((p, i) => (
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
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
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

      {/* ───── WHAT BUYERS SAY ───── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-12">
        <div className="flex items-center gap-2.5 mb-5 sm:mb-6">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(212,168,71,0.12)" }}>
            <MessageCircle className="h-4.5 w-4.5" style={{ color: "#D4A847" }} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] font-semibold mb-0.5" style={{ color: "#D4A847" }}>Testimonials</p>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">What Buyers Say</h2>
          </div>
        </div>

        <div className="flex sm:grid sm:grid-cols-3 gap-3 sm:gap-5 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 pb-2 sm:pb-0 snap-x snap-mandatory">
          {[
            { name: "Ahmed R.", unit: "2 Bedroom", rating: 5, text: "Exceptional quality and a prime location. The payment plan made it very accessible. The team at Binayah guided me through every step seamlessly.", avatar: "https://i.pravatar.cc/80?img=12" },
            { name: "Sarah L.", unit: "3 Bedroom", rating: 5, text: "We fell in love with the views and the amenities. It's the perfect family home with everything you need within walking distance.", avatar: "https://i.pravatar.cc/80?img=32" },
            { name: "James K.", unit: "1 Bedroom", rating: 4, text: "Great investment opportunity with strong rental yields. The developer has an excellent track record and the build quality is superb.", avatar: "https://i.pravatar.cc/80?img=53" },
          ].map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="flex-shrink-0 w-[75%] sm:w-auto snap-start bg-card rounded-2xl border border-border/50 p-4 sm:p-6 flex flex-col"
            >
              <div className="flex items-center gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star key={si} className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${si < review.rating ? "fill-[#D4A847] text-[#D4A847]" : "text-border"}`} />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed flex-1 mb-4">&ldquo;{review.text}&rdquo;</p>
              <div className="flex items-center gap-3 pt-3 border-t border-border/50">
                <NextImage src={review.avatar} alt={review.name} width={36} height={36} className="rounded-full object-cover" style={{ border: "2px solid rgba(212,168,71,0.2)" }} />
                <div>
                  <p className="text-sm font-bold text-foreground">{review.name}</p>
                  <p className="text-[11px] text-muted-foreground">{review.unit} Buyer</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>



      {/* ───── BUYER'S GUIDE ───── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-12">
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
              <FileText className="h-4.5 w-4.5 text-accent" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground">Buyer&apos;s Guide & Resources</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">Essential reading for property buyers</p>
            </div>
          </div>
          <Link href="/guides" className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:text-accent/80 transition-colors">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 items-stretch">
          {[
            { title: "How to Buy Property in the UAE", desc: "Step-by-step guide to purchasing real estate in the UAE", icon: Home },
            { title: "Golden Visa Through Property", desc: "Learn how your property investment can qualify you for residency", icon: Shield },
            { title: "Off-Plan vs Ready Properties", desc: "Compare the pros and cons of each investment type", icon: TrendingUp },
            { title: "Dubai Marina Living Guide", desc: "Everything you need to know about living in Dubai Marina", icon: Compass },
            { title: "Understanding Payment Plans", desc: "A breakdown of how developer payment plans work", icon: CreditCard },
            { title: "First-Time Buyer Tips", desc: "Expert advice for making your first property investment", icon: Star },
          ].map((guide, i) => (
            <motion.a
              key={i}
              href="#"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3 rounded-xl border border-border/50 bg-card p-3 sm:p-4 hover:border-primary/30 hover:bg-primary/[0.02] transition-all group h-full"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                <guide.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{guide.title}</p>
                <p className="hidden sm:block text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{guide.desc}</p>
              </div>
            </motion.a>
          ))}
        </div>
        <div className="sm:hidden text-center mt-3">
          <Link href="/guides" className="inline-flex items-center gap-1.5 text-xs font-bold text-accent border border-accent/30 rounded-full px-4 py-2 hover:bg-accent/5 transition-colors">
            View All Guides <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* ───── FULL GALLERY MODAL ───── */}
      <AnimatePresence>
        {showGallery && (() => {
          const galleryImages = images;
          const handleSwipe = (dir: number) => {
            if (dir < 0) setActiveImage(activeImage < galleryImages.length - 1 ? activeImage + 1 : 0);
            else setActiveImage(activeImage > 0 ? activeImage - 1 : galleryImages.length - 1);
          };
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-black flex flex-col"
            >
              {/* Top bar */}
              <div className="flex items-center justify-between px-4 py-3 sm:py-4 flex-shrink-0 bg-black/80 backdrop-blur-sm relative z-10">
                <span className="text-white/70 text-sm font-semibold">{activeImage + 1} / {galleryImages.length}</span>
                <p className="text-white text-sm font-bold truncate max-w-[50%] hidden sm:block">{project.name}</p>
                <button
                  onClick={() => setShowGallery(false)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>

              {/* Main image area — swipeable on mobile */}
              <div
                className="flex-1 flex items-center justify-center relative min-h-0 touch-pan-y"
                onTouchStart={(e) => {
                  const touch = e.touches[0];
                  (e.currentTarget as any)._touchStartX = touch.clientX;
                  (e.currentTarget as any)._touchStartY = touch.clientY;
                }}
                onTouchEnd={(e) => {
                  const startX = (e.currentTarget as any)._touchStartX;
                  const startY = (e.currentTarget as any)._touchStartY;
                  if (startX == null) return;
                  const endX = e.changedTouches[0].clientX;
                  const endY = e.changedTouches[0].clientY;
                  const diffX = endX - startX;
                  const diffY = endY - startY;
                  if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                    handleSwipe(diffX > 0 ? 1 : -1);
                  }
                }}
              >
                {/* Desktop nav arrows */}
                <button
                  onClick={() => handleSwipe(1)}
                  className="hidden sm:flex absolute left-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 items-center justify-center transition-all hover:scale-110"
                >
                  <ChevronRight className="h-6 w-6 text-white rotate-180" />
                </button>

                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImage}
                    src={galleryImages[activeImage]}
                    alt={`${project.name} ${activeImage + 1}`}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.2 }}
                    className="max-h-[85vh] w-auto max-w-[90vw] sm:max-w-[85vw] object-contain select-none"
                    draggable={false}
                  />
                </AnimatePresence>

                <button
                  onClick={() => handleSwipe(-1)}
                  className="hidden sm:flex absolute right-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 items-center justify-center transition-all hover:scale-110"
                >
                  <ChevronRight className="h-6 w-6 text-white" />
                </button>

                {/* Mobile swipe hint */}
                <div className="sm:hidden absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
                  {galleryImages.map((_, i) => (
                    <button key={i} onClick={() => setActiveImage(i)}
                      className={`rounded-full transition-all ${i === activeImage ? "w-6 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/30"}`} />
                  ))}
                </div>
              </div>

              {/* Desktop thumbnail strip */}
              <div className="hidden sm:flex justify-center gap-2 px-4 pb-4 flex-shrink-0 overflow-x-auto scrollbar-hide bg-black/80">
                {galleryImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                      i === activeImage
                        ? "border-accent shadow-lg shadow-accent/30 scale-105"
                        : "border-transparent opacity-50 hover:opacity-80"
                    }`}
                  >
                    <ImageWithFallback src={img} alt="" fill sizes="80px" className="object-cover" />
                  </button>
                ))}
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ───── STICKY MOBILE CTA BAR ───── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-background/95 backdrop-blur-md border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex gap-2 px-4 py-2.5 max-w-lg mx-auto">
          <a
            href={`https://wa.me/${(project.whatsappNumber || project.contactPhone || '+971500000000').replace(/[^0-9]/g, '')}?text=Hi, I'm interested in ${encodeURIComponent(project.name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full bg-gradient-to-r from-[#25D366] to-[#1DA851] text-white font-bold text-[13px] transition-all duration-300 shadow-md shadow-[#25D366]/20 active:scale-[0.97]"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
          <a
            href={`tel:${project.contactPhone || '+971500000000'}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-white font-bold text-[13px] transition-all duration-300 shadow-md shadow-accent/20 active:scale-[0.97]"
            style={{ background: "linear-gradient(to right, #D4A847, #B8922F)" }}
          >
            <Phone className="h-4 w-4" />
            Call
          </a>
          <a
            href="#live-chat"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full border-2 border-primary/30 text-primary font-bold text-[13px] transition-all duration-300 active:scale-[0.97]"
          >
            <MessageCircle className="h-4 w-4" />
            Live Chat
          </a>
        </div>
      </div>
      {/* Add bottom padding on mobile so content isn't hidden behind sticky bar */}
      <div className="h-24 lg:hidden" />

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQrModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setShowQrModal(false)}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col items-center gap-3 max-w-[280px] sm:max-w-xs"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-48 h-48 sm:w-56 sm:h-56">
                <NextImage
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrUrl)}&bgcolor=ffffff&color=0B3D2E&margin=2`}
                  alt="QR Code"
                  width={400}
                  height={400}
                  className="w-full h-full"
                />
              </div>
              <p className="text-sm font-semibold text-foreground text-center">{project.name}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Regulatory Permit</p>
              <button
                onClick={() => setShowQrModal(false)}
                className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Tap anywhere to close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
      <div className="hidden lg:block">
        <WhatsAppButton />
        <AIChatWidget />
      </div>
    </div>
  );
};

export default ProjectDetailClient;
