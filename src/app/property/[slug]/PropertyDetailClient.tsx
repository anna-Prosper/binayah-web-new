"use client";

import { useTranslations } from "next-intl";
import { apiUrl } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, BedDouble, Bath, Maximize, Phone, Mail, MessageCircle,
  ChevronLeft, ChevronRight, X, Home, Check, Image as ImageIcon,
  Waves, Dumbbell, Car, Shield, Baby, Flame, TreePine, Store, Smartphone,
  Building2, Star, ChevronDown, Globe, ArrowRight, Zap, Wind,
  Calendar, CheckCircle2, Compass, FileText, TrendingUp,
} from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { formatPropertyTypeLabel } from "@/lib/property-types";
import { DetailActions, CardActions } from "@/components/PropertyActions";
import PropertyComparison from "@/components/PropertyComparison";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const USD_RATE = 0.2723;

interface Listing {
  _id: string;
  title: string;
  slug: string;
  propertyId?: string;
  description?: string;
  cleanDescription?: string;
  listingType?: string;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  size?: number;
  sizeUnit?: string;
  price?: number;
  currency?: string;
  community?: string;
  areas?: string[];
  city?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  featuredImage?: string;
  images?: string[];
  features?: string[];
  agent?: string;
  developer?: string;
  developerName?: string;
  developerSlug?: string;
  country?: string;
  parkingSpaces?: number;
  furnishing?: string;
  isFurnished?: string;
  completionStatus?: string;
  tenure?: string;
  view?: string;
  parking?: string;
  yearBuilt?: number;
  building?: string;
  propertySubtype?: string;
  sourceId?: string;
}

interface SimilarListing {
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

function formatPrice(price?: number, currency = "AED", fallback = "Price on request") {
  if (!price) return fallback;
  if (price >= 1_000_000) return `${currency} ${(price / 1_000_000).toFixed(1)}M`;
  if (price >= 1_000) return `${currency} ${(price / 1_000).toFixed(0)}K`;
  return `${currency} ${price.toLocaleString()}`;
}

const sqftToSqm = (sqft: number) => `${Math.round(sqft * 0.0929).toLocaleString()} sqm`;

// ── Amenity icon matching (keyword → Lucide icon) ─────────────────────────────
function amenityIcon(label: string): React.ElementType {
  const l = label.toLowerCase();
  if (/pool|swim|jacuzzi/.test(l)) return Waves;
  if (/gym|fitness|workout/.test(l)) return Dumbbell;
  if (/parking|garage|car park/.test(l)) return Car;
  if (/security|guard|cctv|gated/.test(l)) return Shield;
  if (/kids|children|play|nursery/.test(l)) return Baby;
  if (/spa|sauna|steam/.test(l)) return Flame;
  if (/bbq|barbecue|grill/.test(l)) return Flame;
  if (/garden|park|green|landscap/.test(l)) return TreePine;
  if (/retail|shop|store|concierge/.test(l)) return Store;
  if (/smart|automation|iot/.test(l)) return Smartphone;
  if (/lobby|reception|building/.test(l)) return Building2;
  if (/beach|marina|waterfront/.test(l)) return Waves;
  if (/metro|transport|bus|tram/.test(l)) return ArrowRight;
  if (/air con|a\/c|hvac|cool/.test(l)) return Wind;
  if (/power|electric|generator/.test(l)) return Zap;
  if (/balcon|terrace|rooftop/.test(l)) return Home;
  return Check;
}

// ── Nearby attraction icon ────────────────────────────────────────────────────
function nearbyIcon(type: string): React.ElementType {
  const t = type.toLowerCase();
  if (/beach|marina|water/.test(t)) return Waves;
  if (/mall|retail|shop/.test(t)) return Store;
  if (/airport/.test(t)) return Globe;
  if (/park|garden|recreation/.test(t)) return TreePine;
  if (/metro|transport|bus/.test(t)) return ArrowRight;
  if (/school|university|education/.test(t)) return Building2;
  if (/hospital|clinic|medical/.test(t)) return Shield;
  return MapPin;
}

// ── Community-aware nearby defaults ──────────────────────────────────────────
interface NearbyItem { name: string; type: string; distance: string }

function buildNearby(community?: string): NearbyItem[] {
  const c = (community || "").toLowerCase();

  if (/marina/.test(c)) return [
    { name: "Dubai Marina Walk", type: "waterfront", distance: "2 min walk" },
    { name: "JBR Beach", type: "beach", distance: "5 min walk" },
    { name: "Marina Mall", type: "mall", distance: "8 min walk" },
    { name: "Dubai Metro (DMCC)", type: "metro", distance: "10 min walk" },
    { name: "Palm Jumeirah", type: "landmark", distance: "10 min drive" },
    { name: "Dubai International Airport", type: "airport", distance: "30 min drive" },
  ];
  if (/palm/.test(c)) return [
    { name: "Private Beach Access", type: "beach", distance: "On site" },
    { name: "Nakheel Mall", type: "mall", distance: "5 min drive" },
    { name: "The Pointe", type: "waterfront", distance: "5 min drive" },
    { name: "Dubai Marina", type: "landmark", distance: "15 min drive" },
    { name: "Al Maktoum International", type: "airport", distance: "40 min drive" },
    { name: "International Schools", type: "school", distance: "10 min drive" },
  ];
  if (/downtown|burj khalifa/.test(c)) return [
    { name: "Burj Khalifa", type: "landmark", distance: "5 min walk" },
    { name: "Dubai Mall", type: "mall", distance: "8 min walk" },
    { name: "Dubai Fountain", type: "landmark", distance: "5 min walk" },
    { name: "Dubai Metro (Burj Khalifa)", type: "metro", distance: "3 min walk" },
    { name: "Dubai Design District", type: "landmark", distance: "10 min drive" },
    { name: "Dubai International Airport", type: "airport", distance: "20 min drive" },
  ];
  if (/jvc|jumeirah village circle/.test(c)) return [
    { name: "Circle Mall", type: "mall", distance: "5 min drive" },
    { name: "Al Barsha Park", type: "park", distance: "10 min drive" },
    { name: "Mall of the Emirates", type: "mall", distance: "15 min drive" },
    { name: "International Schools", type: "school", distance: "5 min drive" },
    { name: "Dubai Metro (Mall of Emirates)", type: "metro", distance: "15 min drive" },
    { name: "Dubai International Airport", type: "airport", distance: "25 min drive" },
  ];
  if (/dubai hills|hills estate/.test(c)) return [
    { name: "Dubai Hills Mall", type: "mall", distance: "5 min drive" },
    { name: "Dubai Hills Golf Club", type: "park", distance: "5 min drive" },
    { name: "Dubai Hills Park", type: "park", distance: "3 min walk" },
    { name: "Mediclinic Dubai Hills", type: "hospital", distance: "5 min drive" },
    { name: "GEMS Schools Network", type: "school", distance: "5 min drive" },
    { name: "Dubai International Airport", type: "airport", distance: "25 min drive" },
  ];
  return [
    { name: "Nearest Metro Station", type: "metro", distance: "10 min drive" },
    { name: "Shopping Mall", type: "mall", distance: "10 min drive" },
    { name: "Beach & Waterfront", type: "beach", distance: "15 min drive" },
    { name: "International Schools", type: "school", distance: "10 min drive" },
    { name: "Parks & Recreation", type: "park", distance: "5 min drive" },
    { name: "Dubai International Airport", type: "airport", distance: "20–35 min drive" },
  ];
}

// ── Context-aware key highlights ──────────────────────────────────────────────
function buildHighlights(listing: Listing): string[] {
  const highlights: string[] = [];
  const isRent = listing.listingType === "Rent";

  if (listing.bedrooms != null && listing.propertyType) {
    const type = formatPropertyTypeLabel(listing.propertyType, listing.propertyType);
    highlights.push(`${listing.bedrooms} Bedroom ${type}`);
  }
  if (listing.size) {
    highlights.push(`${listing.size.toLocaleString()} sqft (${sqftToSqm(listing.size)})`);
  }
  if (listing.community) {
    highlights.push(`${listing.community} Community`);
  }
  if (isRent) {
    highlights.push("Flexible Lease Terms");
    highlights.push("RERA Registered Listing");
  } else {
    highlights.push("Freehold Title");
    if (listing.price && listing.price >= 2_000_000) {
      highlights.push("Golden Visa Eligible Property");
    } else {
      highlights.push("UAE Mortgage Ready");
    }
  }
  highlights.push("24/7 Community Security");
  highlights.push("Prime Dubai Location");

  return highlights.slice(0, 6);
}

// ── FAQ defaults (rent vs sale) ───────────────────────────────────────────────
interface FaqItem { question: string; answer: string }

function buildFaqs(isRent: boolean): FaqItem[] {
  if (isRent) return [
    {
      question: "How do I schedule a viewing?",
      answer: "Contact us via WhatsApp, phone, or the inquiry form. We offer flexible viewing slots 7 days a week, including same-day and virtual tours for international tenants.",
    },
    {
      question: "What documents are needed to rent?",
      answer: "You will typically need a valid passport, UAE residence visa (or proof of sponsorship), Emirates ID, and a recent salary certificate or employment letter. Some landlords may also request 3 months of bank statements.",
    },
    {
      question: "What utilities are included in the rent?",
      answer: "DEWA (electricity and water) is usually billed separately to the tenant. Some buildings include a chiller (district cooling) fee in the service charge. We will confirm exactly what is included for this property.",
    },
    {
      question: "Are there annual service charges?",
      answer: "Service charges cover maintenance of common areas, facilities, and building management. They are typically factored into the rent for rental properties. Our team can provide the exact annual service charge rate.",
    },
    {
      question: "Is this property RERA registered?",
      answer: "Yes. All Binayah listings are verified and registered with the Real Estate Regulatory Authority (RERA) in compliance with Dubai Law No. 26 of 2007.",
    },
    {
      question: "Are pets allowed?",
      answer: "Pet policies vary by building and community. We will confirm the specific pet policy for this property before you proceed. Many Dubai communities are pet-friendly with designated areas.",
    },
  ];

  return [
    {
      question: "How do I schedule a viewing?",
      answer: "Contact us via WhatsApp, phone, or the inquiry form. We offer flexible slots 7 days a week, including same-day and virtual tours for international buyers.",
    },
    {
      question: "What documents are needed to purchase?",
      answer: "You will need a valid passport, proof of funds or mortgage pre-approval, and a signed MOU (Memorandum of Understanding). For off-plan, a booking form and deposit cheque are required. Our team will guide you through each step.",
    },
    {
      question: "Can I get mortgage financing?",
      answer: "Yes. UAE banks offer mortgages to both residents and non-residents. Residents can typically borrow up to 80% LTV; non-residents up to 50%. We work with preferred banking partners and can connect you for a free pre-approval consultation.",
    },
    {
      question: "What are the transfer and purchase fees?",
      answer: "The Dubai Land Department (DLD) charges a 4% transfer fee on the purchase price, plus a small admin fee. Agency fees are typically 2% of the purchase price. Your solicitor can outline the full cost breakdown.",
    },
    {
      question: "Is this property eligible for the UAE Golden Visa?",
      answer: "Properties valued at AED 2 million or above qualify for the 10-year UAE Golden Visa, granting long-term residency. Our team can advise on eligibility and help initiate the application.",
    },
    {
      question: "Are there annual service charges?",
      answer: "Dubai communities levy annual service charges (per sqft) to maintain common areas, pools, gyms, and building management. Our team can provide the exact RERA-registered service charge rate for this property.",
    },
  ];
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon, label, value, sub, delay = 0,
}: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card rounded-2xl p-3 sm:p-4 border-l-[3px] border-l-accent border border-border/50 hover:shadow-md transition-shadow duration-300 flex flex-col justify-center min-h-[80px] sm:min-h-[92px]"
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-accent" />
        <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-bold">{label}</p>
      </div>
      <p className="text-[12px] sm:text-sm font-bold text-foreground leading-snug">{value}</p>
      {sub && <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </motion.div>
  );
}

// ── FAQ accordion item ────────────────────────────────────────────────────────
function FaqAccordionItem({
  faq, index, open, onToggle,
}: {
  faq: FaqItem; index: number; open: boolean; onToggle: (i: number) => void;
}) {
  return (
    <div className="border-b border-border/50 last:border-0">
      <button
        type="button"
        onClick={() => onToggle(index)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left group"
      >
        <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
          {faq.question}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <p className="text-sm text-muted-foreground leading-relaxed pb-4 pr-8">{faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function PropertyDetailClient({
  listing,
  similarListings,
}: {
  listing: Listing;
  similarListings: SimilarListing[];
}) {
  const t = useTranslations("propertyDetail");
  const tProject = useTranslations("projectDetail");
  const { toast } = useToast();
  const [currentImage, setCurrentImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "location" | "faq">("overview");
  const [currency, setCurrency] = useState<"AED" | "USD">("AED");
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [enquirySubmitted, setEnquirySubmitted] = useState(false);
  const [showMoreEnquiry, setShowMoreEnquiry] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [fetchedDeveloper, setFetchedDeveloper] = useState<{name: string; slug: string} | null>(null);
  const [developerStats, setDeveloperStats] = useState<{
    projectsDelivered: number | null;
    foundedYear: number | null;
    totalUnits: number | null;
  }>({ projectsDelivered: null, foundedYear: null, totalUnits: null });
  const [enquiryForm, setEnquiryForm] = useState({
    name: "",
    phone: "",
    countryCode: "+971",
    message: "",
    email: "",
  });

  useEffect(() => {
    if (listing.developer || !listing.community) return;
    fetch(apiUrl(`/api/projects?q=${encodeURIComponent(listing.community)}&limit=1`))
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const project = data?.projects?.[0] ?? data?.[0];
        if (project?.developerName) {
          setFetchedDeveloper({ name: project.developerName, slug: project.developerSlug || project.developerName.toLowerCase().replace(/[^a-z0-9]+/g, "-") });
        }
      })
      .catch(() => {});
  }, [listing.community, listing.developer]);

  // Pull live developer stats (project count, founded year, total units) from API.
  const developerSlugForStats = listing.developerSlug || fetchedDeveloper?.slug || null;
  useEffect(() => {
    if (!developerSlugForStats) return;
    fetch(apiUrl(`/api/developers/${developerSlugForStats}`))
      .then(r => r.ok ? r.json() : null)
      .then((data: any) => {
        if (!data?.developer) return;
        setDeveloperStats({
          projectsDelivered: Array.isArray(data.projects) ? data.projects.length : null,
          foundedYear: data.developer.foundedYear ?? null,
          totalUnits: data.developer.totalUnits ?? null,
        });
      })
      .catch(() => {});
  }, [developerSlugForStats]);

  const allImages = [listing.featuredImage, ...(listing.images || [])].filter(Boolean) as string[];
  if (allImages.length === 0) allImages.push("/assets/amenities-placeholder.webp");

  const nextImage = () => setCurrentImage((p) => (p + 1) % allImages.length);
  const prevImage = () => setCurrentImage((p) => (p - 1 + allImages.length) % allImages.length);

  const formattedPrice = (() => {
    if (!listing.price) return t("priceOnRequest");
    if (currency === "USD") {
      const usd = listing.price * USD_RATE;
      if (usd >= 1_000_000) return `USD ${(usd / 1_000_000).toFixed(1)}M`;
      if (usd >= 1_000) return `USD ${(usd / 1_000).toFixed(0)}K`;
      return `USD ${usd.toLocaleString()}`;
    }
    return formatPrice(listing.price, "AED", t("priceOnRequest"));
  })();

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(apiUrl("/api/inquiries"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: enquiryForm.name,
          phone: `${enquiryForm.countryCode}${enquiryForm.phone}`,
          email: enquiryForm.email,
          message: enquiryForm.message || t("enquireInterestedIn", { title: listing.title }),
          propertySlug: listing.slug,
          propertyTitle: listing.title,
          type: "property-inquiry",
        }),
      });
    } catch {}
    setEnquirySubmitted(true);
    toast({ title: t("inquirySent"), description: t("teamReply") });
  };

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "97154998811";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Hi, I'm interested in: ${listing.title}\n${typeof window !== "undefined" ? window.location.href : ""}`
  )}`;

  const isRent = listing.listingType === "Rent";
  const developerName = listing.developerName || listing.developer || fetchedDeveloper?.name || null;
  const developerSlug = listing.developerSlug || fetchedDeveloper?.slug || null;
  const NON_AMENITY = /^(vacant|furnished|semi.furnished|unfurnished|tenanted|rented|investment|new|occupied|ready)$/i;
  const highlights = buildHighlights(listing);
  const nearbyItems = buildNearby(listing.community);
  const faqs = buildFaqs(isRent);
  const hasMap = !!(listing.latitude && listing.longitude && listing.latitude !== 0 && listing.longitude !== 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative">
        <div className="relative h-[55vh] sm:h-[65vh] min-h-[380px] overflow-hidden">
          <NextImage
            src={allImages[currentImage]}
            alt={listing.title}
            fill
            className="object-cover transition-opacity duration-500"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/25 to-transparent pointer-events-none" />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute top-20 sm:top-24 left-0 right-0 z-20"
          >
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-white/50 flex-wrap">
                <Link href="/" className="hover:text-white transition-colors">{t("breadcrumbHome")}</Link>
                <ChevronRight className="h-3 w-3" />
                <Link href={isRent ? "/rent" : "/buy"} className="hover:text-white transition-colors">
                  {isRent ? t("forRent") : t("forSale")}
                </Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-white/80 truncate max-w-[200px]">{listing.title}</span>
              </div>
            </div>
          </motion.div>

          {allImages.length > 1 && (
            <>
              <button onClick={prevImage} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors z-10">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={nextImage} className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors z-10">
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          <div className="absolute bottom-0 left-0 right-0 z-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-6 sm:pb-8">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3 sm:gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }} className="pointer-events-auto">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold text-white shadow-lg" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
                      {isRent ? t("forRent") : t("forSale")}
                    </span>
                    {listing.propertyType && (
                      <span className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-white/15 backdrop-blur-md text-white border border-white/20 shadow-lg">
                        {formatPropertyTypeLabel(listing.propertyType, listing.propertyType)}
                      </span>
                    )}
                  </div>
                  {developerName && (
                    <p className="hidden sm:flex text-white text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 items-center gap-1.5">
                      <span className="text-white/70">{tProject("byDeveloper")}</span> <span className="text-white font-semibold">{developerName}</span>
                    </p>
                  )}
                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15] mb-2">{listing.title}</h1>
                  {(listing.community || listing.address) && (
                    <p className="text-white/75 flex items-center gap-1.5 text-sm mb-3">
                      <MapPin className="h-3.5 w-3.5 text-accent flex-shrink-0" />
                      {listing.address || `${listing.community}${listing.areas?.[0] ? `, ${listing.areas[0]}` : ""}${listing.city ? `, ${listing.city}` : ""}`}
                    </p>
                  )}
                  <DetailActions propertyId={listing.slug} slug={listing.slug} title={listing.title} variant="hero" />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }} className="hidden sm:flex flex-col items-start lg:items-end gap-2 sm:gap-3 pointer-events-auto flex-shrink-0">
                  <div className="flex flex-col gap-0.5 lg:items-end">
                    <span className="hidden sm:inline text-white/70 text-[11px] sm:text-xs uppercase tracking-widest font-semibold">
                      {isRent ? t("perYear") : t("listedAt")}
                    </span>
                    <span className="text-xl sm:text-3xl lg:text-4xl font-bold text-white">{formattedPrice}</span>
                    {currency === "AED" && listing.price && (
                      <span className="text-white/60 text-xs sm:text-sm lg:text-right">{t("approxUsd", { amount: Math.round(listing.price * USD_RATE / 1000) })}</span>
                    )}
                  </div>

                  {allImages.length > 1 && (
                    <div className="hidden lg:flex gap-2 items-end">
                      {allImages.slice(0, 4).map((img, i) => (
                        <button key={i} onClick={() => setCurrentImage(i)} className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${i === currentImage ? "border-accent shadow-lg shadow-accent/20 scale-110" : "border-white/20 opacity-70 hover:opacity-100 hover:border-white/50"}`}>
                          <NextImage src={img} alt="" fill className="object-cover" sizes="64px" />
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="hidden sm:flex items-center gap-2 flex-wrap">
                    <button onClick={() => setLightboxOpen(true)}
                      className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-white transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
                      style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
                      <ImageIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> {t("gallery")} ({allImages.length})
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MOBILE GALLERY STRIP ─────────────────────────────────────────── */}
      {allImages.length > 1 && (
        <div className="sm:hidden px-4 py-3 flex gap-2 items-center">
          <button
            onClick={() => setLightboxOpen(true)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-[12px] font-bold text-white shadow-md active:scale-[0.97] transition-all"
            style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
          >
            <ImageIcon className="h-3.5 w-3.5" /> {t("gallery")} ({allImages.length})
          </button>
        </div>
      )}

      {/* ── QUICK STATS STRIP ────────────────────────────────────────────── */}
      <section className="py-4 sm:py-5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className={`grid grid-cols-2 sm:grid-cols-3 ${developerName ? "lg:grid-cols-6" : "lg:grid-cols-5"} gap-2.5 sm:gap-3`}>
            {listing.price && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-card rounded-2xl p-3 sm:p-4 border-l-[3px] border-l-accent border border-border/50 hover:shadow-md transition-shadow min-h-[80px] sm:min-h-[92px] flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-bold">{isRent ? t("perYear") : t("listedAt")}</p>
                  <div className="ml-auto relative">
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowCurrencyDropdown(!showCurrencyDropdown); }}
                      className="flex items-center gap-1 text-[10px] font-bold text-accent border border-accent/30 bg-accent/5 px-2 py-1 rounded-lg shadow-sm hover:bg-accent/10 transition-colors"
                    >
                      {currency} <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${showCurrencyDropdown ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {showCurrencyDropdown && (
                        <motion.div initial={{ opacity: 0, y: -4, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.95 }} transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-1.5 bg-card border border-border/60 rounded-xl shadow-lg z-50 min-w-[100px] overflow-hidden backdrop-blur-xl">
                          {(["AED", "USD"] as const).map((c) => (
                            <button key={c} onClick={(e) => { e.stopPropagation(); setCurrency(c); setShowCurrencyDropdown(false); }}
                              className={`w-full text-left px-3 py-2 text-[11px] font-semibold transition-colors ${c === currency ? "bg-accent/10 text-accent" : "text-foreground/70 hover:bg-muted/60 hover:text-foreground"}`}>
                              {c}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <p className="text-[12px] sm:text-sm font-bold text-foreground leading-snug">{formattedPrice}</p>
                {currency === "AED" && <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">{t("approxUsd", { amount: Math.round(listing.price * USD_RATE / 1000) })}</p>}
              </motion.div>
            )}
            {listing.size != null && <StatCard icon={Maximize} label={t("size")} value={`${listing.size.toLocaleString()} ${listing.sizeUnit || "sqft"}`} sub={sqftToSqm(listing.size)} delay={0.15} />}
            {developerName && (
              <StatCard
                icon={Building2}
                label={tProject("developer")}
                value={developerName}
                sub={developerStats.projectsDelivered ? `${developerStats.projectsDelivered}+ ${tProject("projectsDelivered")}` : undefined}
                delay={0.2}
              />
            )}
            {listing.bedrooms != null && <StatCard icon={BedDouble} label={t("bedrooms")} value={listing.bedrooms} delay={0.25} />}
            {listing.bathrooms != null && <StatCard icon={Bath} label={t("bathrooms")} value={listing.bathrooms} delay={0.3} />}
            {listing.propertyType && <StatCard icon={Home} label={t("type")} value={formatPropertyTypeLabel(listing.propertyType, listing.propertyType)} delay={0.35} />}
          </div>

          {/* Tab bar */}
          <div className="mt-4 bg-muted/50 p-1 sm:p-1.5 rounded-2xl flex gap-1 sm:gap-1.5 border border-border/50">
            {(["overview", "location", "faq"] as const).map((tab) => (
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
                <span className="relative z-10 uppercase">
                  {tab === "overview" ? t("overviewTab") : tab === "location" ? t("locationTab") : t("faqTab")}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTENT + SIDEBAR ────────────────────────────────────────────── */}
      <section className="pb-28 sm:pb-24 pt-2">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">

            {/* ── Left column ─────────────────────────────────────────── */}
            <div>
              {/* ═══ OVERVIEW TAB ═══ */}
              {activeTab === "overview" && (
                <>
                  {/* Description */}
                  {listing.cleanDescription && (() => {
                    const decoded = listing.cleanDescription
                      .replace(/&mdash;/g, "—").replace(/&ndash;/g, "–").replace(/&amp;/g, "&")
                      .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ")
                      .replace(/&#8211;/g, "–").replace(/&#8212;/g, "—").replace(/&#160;/g, " ")
                      .replace(/&[a-z]+;/gi, " ");
                    const sentences = decoded.replace(/<[^>]*>/g, " ").replace(/\s{2,}/g, " ").trim().split(/(?<=[.!?])\s+(?=[A-Z])/).filter(Boolean);
                    const paragraphs: string[] = [];
                    for (let i = 0; i < sentences.length; i += 3) paragraphs.push(sentences.slice(i, i + 3).join(" "));
                    if (paragraphs.length === 0) return null;
                    const hasMore = paragraphs.length > 1;
                    return (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-10">
                        <div className="mb-5">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-4 h-px bg-accent" />
                            <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-accent">{t("overviewLabel")}</p>
                          </div>
                          <h2 className="text-xl font-bold text-foreground">{t("description")}</h2>
                        </div>
                        <div className="space-y-3">
                          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{paragraphs[0]}</p>
                          {hasMore && descExpanded && paragraphs.slice(1).map((para, i) => (
                            <p key={i} className="text-sm sm:text-base text-muted-foreground leading-relaxed">{para}</p>
                          ))}
                          {hasMore && (
                            <button
                              type="button"
                              onClick={() => setDescExpanded(v => !v)}
                              className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors mt-1"
                            >
                              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${descExpanded ? "rotate-180" : ""}`} />
                              {descExpanded ? t("readLess") : t("readMore")}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })()}

                  {/* Key Highlights */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="mb-10">
                    <div className="mb-5">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-4 h-px bg-accent" />
                        <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-accent">{t("highlightsLabel")}</p>
                      </div>
                      <h2 className="text-xl font-bold text-foreground">{t("highlightsTitle")}</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {highlights.map((h, i) => (
                        <div key={i} className="flex items-start gap-3 bg-card rounded-xl p-4 border border-border/50 hover:border-accent/30 hover:shadow-sm transition-all group">
                          <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-accent/15 transition-colors">
                            <Star className="h-3.5 w-3.5 text-accent" />
                          </div>
                          <p className="text-sm font-medium text-foreground leading-snug">{h}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* About the Developer */}
                  {developerName && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }} className="mb-10">
                      <div className="bg-card rounded-2xl border border-border/50 p-5 sm:p-8">
                        <div className="flex items-center gap-2.5 mb-5 sm:mb-6">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-accent/15 flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-accent" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-accent">{tProject("developer")}</p>
                            <h2 className="text-base sm:text-xl font-bold text-foreground">{tProject("aboutDeveloper")}</h2>
                          </div>
                        </div>
                        {/* Developer identity */}
                        <div className="flex items-start gap-4 mb-5">
                          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center flex-shrink-0">
                            <span className="text-base font-bold text-foreground/60">
                              {developerName.split(" ").slice(0,2).map((w: string) => w[0]).join("").toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-foreground">{developerName}</h3>
                            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                              {developerName} {tProject("developerBlurb")}
                            </p>
                          </div>
                        </div>
                        {/* Stat cards — pulled live from /api/developers/:slug; render only what we have */}
                        {(() => {
                          const currentYear = new Date().getFullYear();
                          const cards = [
                            developerStats.projectsDelivered != null
                              ? { icon: Building2, value: `${developerStats.projectsDelivered}+`, label: tProject("projectsDelivered") }
                              : null,
                            developerStats.foundedYear
                              ? { icon: Calendar, value: `${currentYear - developerStats.foundedYear}+`, label: tProject("yearsExperience") }
                              : null,
                            developerStats.totalUnits
                              ? { icon: Home, value: developerStats.totalUnits >= 1000 ? `${Math.floor(developerStats.totalUnits / 1000)}K+` : `${developerStats.totalUnits}+`, label: tProject("unitsCompleted") }
                              : null,
                          ].filter(Boolean) as { icon: React.ElementType; value: string; label: string }[];
                          if (cards.length === 0) return null;
                          return (
                            <div className={`grid gap-3 mb-5 ${cards.length === 1 ? "grid-cols-1" : cards.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                              {cards.map(({ icon: Icon, value, label }) => (
                                <div key={label} className="p-3 sm:p-4 bg-muted/40 rounded-xl text-center">
                                  <Icon className="h-4 w-4 text-muted-foreground mx-auto mb-1.5" />
                                  <p className="text-lg sm:text-xl font-bold text-foreground">{value}</p>
                                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{label}</p>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                        {developerSlug && (
                          <Link href={`/developers/${developerSlug}`}
                            className="inline-flex items-center gap-2 text-sm font-bold text-foreground border border-border/60 hover:border-primary/30 hover:bg-primary/5 px-5 py-2.5 rounded-full transition-all group">
                            {tProject("viewDeveloperProfile")} <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Gallery — 4-card horizontal strip */}
                  {allImages.length > 1 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className="mb-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-accent" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-accent">{t("mediaLabel")}</p>
                            <h2 className="text-base font-bold text-foreground">{t("gallery")}</h2>
                          </div>
                        </div>
                        <button
                          onClick={() => setLightboxOpen(true)}
                          className="text-sm font-semibold text-accent hover:text-accent/80 transition-colors"
                        >
                          {t("viewAllArrow", { count: allImages.length })}
                        </button>
                      </div>
                      {/* Mobile: horizontal scroll */}
                      <div className="sm:hidden -mx-4 px-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide flex gap-2.5 pb-1">
                        {allImages.slice(0, 6).map((img, i) => (
                          <button key={i} onClick={() => { setCurrentImage(i); setLightboxOpen(true); }}
                            className="relative flex-shrink-0 w-[70%] aspect-[3/2] rounded-xl overflow-hidden border border-border/50 snap-center">
                            <NextImage src={img} alt={`${listing.title} - ${i + 1}`} fill sizes="70vw" className="object-cover" />
                          </button>
                        ))}
                      </div>
                      {/* Desktop: 4-col grid */}
                      <div className="hidden sm:grid grid-cols-4 gap-3">
                        {allImages.slice(0, 4).map((img, i) => (
                          <button key={i} onClick={() => { setCurrentImage(i); setLightboxOpen(true); }}
                            className="relative group aspect-[4/3] rounded-2xl overflow-hidden border border-border/50 hover:border-accent/30 transition-all">
                            <NextImage src={img} alt={`${listing.title} - ${i + 1}`} fill sizes="25vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                            {i === 3 && allImages.length > 4 && (
                              <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center rounded-2xl">
                                <span className="text-white font-bold text-lg">+{allImages.length - 4}</span>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Amenities & Facilities */}
                  {listing.features && listing.features.filter(f => !NON_AMENITY.test(f.trim())).length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="mb-10">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
                          <Star className="h-4 w-4 text-accent" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-accent">{t("lifestyleLabel")}</p>
                          <h2 className="text-base font-bold text-foreground">{t("amenitiesTitle")}</h2>
                        </div>
                      </div>
                      <div className="rounded-2xl bg-card border border-border/30 p-5">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {listing.features.filter(f => !NON_AMENITY.test(f.trim())).map((feat, i) => {
                            const AIcon = amenityIcon(feat);
                            return (
                              <div key={i} className="flex flex-col items-center gap-2 text-center">
                                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                                  <AIcon className="h-5 w-5 text-accent" />
                                </div>
                                <span className="text-xs text-foreground font-medium leading-snug">{feat}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </>
              )}

              {/* ═══ LOCATION TAB ═══ */}
              {activeTab === "location" && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="space-y-6">
                  {/* Location info card */}
                  <div className="bg-card rounded-2xl border border-border/50 p-5 sm:p-6">
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-foreground">{t("locationLabel")}</h2>
                    </div>
                    {/* Community / City / Country cards */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
                      <div className="p-2.5 sm:p-4 bg-muted/50 rounded-xl">
                        <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-0.5 sm:mb-1">{t("communityLabel")}</p>
                        <p className="text-xs sm:text-base font-bold text-foreground">{listing.community || "—"}</p>
                      </div>
                      <div className="p-2.5 sm:p-4 bg-muted/50 rounded-xl">
                        <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-0.5 sm:mb-1">{t("cityLabel")}</p>
                        <p className="text-xs sm:text-base font-bold text-foreground">{listing.city || "Dubai"}</p>
                      </div>
                      <div className="p-2.5 sm:p-4 bg-muted/50 rounded-xl">
                        <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-0.5 sm:mb-1">{t("countryLabel")}</p>
                        <p className="text-xs sm:text-base font-bold text-foreground">{listing.country || "UAE"}</p>
                      </div>
                    </div>
                    {/* Map */}
                    <div className="rounded-xl overflow-hidden mb-4 border border-border/30" style={{ aspectRatio: "16/9" }}>
                      <iframe
                        src={hasMap
                          ? `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${listing.latitude},${listing.longitude}&zoom=15`
                          : `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent((listing.community || "") + ", " + (listing.city || "Dubai") + ", UAE")}`}
                        className="w-full h-full border-0"
                        allowFullScreen
                        loading="lazy"
                        title="Location Map"
                      />
                    </div>
                  </div>

                  {/* Nearby attractions */}
                  {nearbyItems.length > 0 && (
                    <div className="bg-card rounded-2xl border border-border/50 p-5 sm:p-6">
                      <div className="flex items-center gap-2.5 mb-4">
                        <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
                          <Compass className="h-4 w-4 text-accent" />
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold text-foreground">{t("nearbyAttractions")}</h2>
                      </div>
                      <div className="space-y-2 sm:space-y-3">
                        {nearbyItems.map((item, i) => {
                          const NIcon = nearbyIcon(item.type);
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
                                  <NIcon className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 text-primary" />
                                </div>
                                <div>
                                  <p className="text-xs sm:text-sm font-semibold text-foreground">{item.name}</p>
                                  <p className="text-[10px] sm:text-xs text-muted-foreground">{item.type}</p>
                                </div>
                              </div>
                              {item.distance && (
                                <span className="text-[10px] sm:text-xs font-bold text-primary bg-primary/10 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg">{item.distance}</span>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ═══ FAQ TAB ═══ */}
              {activeTab === "faq" && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="space-y-4 sm:space-y-8">
                  <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
                    <div className="flex items-center gap-2.5 p-4 sm:p-6 pb-0 mb-3 sm:mb-4">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                      </div>
                      <h2 className="text-base sm:text-xl font-bold text-foreground">{tProject("faqLabel")}</h2>
                    </div>
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-2 sm:space-y-3">
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
                </motion.div>
              )}

              {/* ── Enquiry form — below tab content (like project template) ── */}
              {/* Mobile-only compact enquiry */}
              <div className="sm:hidden mt-6 space-y-0">
                <div className="rounded-2xl rounded-b-none overflow-hidden shadow-lg">
                  <div className="relative p-5 overflow-hidden" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
                    <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-accent/20 blur-2xl" />
                    <p className="text-white/60 text-xs uppercase tracking-[0.15em] font-semibold mb-1 relative z-10">{t("bookConsultation")}</p>
                    <p className="text-3xl font-bold text-white relative z-10">{formattedPrice}</p>
                    {currency === "AED" && listing.price && (
                      <p className="text-white/40 text-sm mt-0.5 relative z-10">{t("approxUsd", { amount: Math.round(listing.price * USD_RATE / 1000) })}</p>
                    )}
                  </div>
                  <div className="px-4 pb-2 pt-2 bg-card border-x border-border/50">
                    <p className="text-[11px] text-muted-foreground text-center">
                      {t("speakToExperts")} ↓
                    </p>
                  </div>
                </div>
                <div className="bg-card rounded-2xl rounded-t-none border border-border/50 border-t-0 p-4">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">{t("enquireLabel")}</p>
                  {enquirySubmitted ? (
                    <div className="py-4 text-center space-y-2">
                      <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto" />
                      <p className="text-sm font-bold text-foreground">{t("thankYouTitle")}</p>
                      <p className="text-xs text-muted-foreground">{t("teamReply")}</p>
                    </div>
                  ) : (
                    <form onSubmit={handleEnquirySubmit} className="space-y-3">
                      <input type="text" required value={enquiryForm.name} onChange={e => setEnquiryForm(f => ({...f, name: e.target.value}))}
                        className="w-full h-11 rounded-xl bg-muted/30 border border-border/50 px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 outline-none"
                        placeholder={t("fullName")} />
                      <div className="flex gap-2">
                        <select value={enquiryForm.countryCode} onChange={e => setEnquiryForm(f => ({...f, countryCode: e.target.value}))}
                          className="h-11 rounded-xl bg-muted/30 border border-border/50 px-3 text-sm text-foreground outline-none appearance-none">
                          <option value="+971">+971</option><option value="+44">+44</option><option value="+1">+1</option><option value="+91">+91</option>
                        </select>
                        <input type="tel" required value={enquiryForm.phone} onChange={e => setEnquiryForm(f => ({...f, phone: e.target.value}))}
                          className="flex-1 h-11 rounded-xl bg-muted/30 border border-border/50 px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 outline-none"
                          placeholder="50 123 4567" />
                      </div>
                      <button type="submit" className="w-full h-12 rounded-full text-white font-bold text-sm"
                        style={{ background: "linear-gradient(to right, #D4A847, #B8922F)" }}>
                        {t("sendQuickEnquiry")}
                      </button>
                      <p className="text-[10px] text-muted-foreground text-center">{t("responseTime")}</p>
                    </form>
                  )}
                </div>
              </div>

              {/* Desktop enquiry form */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="hidden sm:block mt-8 bg-card rounded-2xl border border-border/50 p-4 sm:p-8">
                <div className="flex items-center gap-2.5 mb-5 sm:mb-6">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-accent/15 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-accent">{t("getInTouch")}</p>
                    <h2 className="text-base sm:text-xl font-bold text-foreground">{t("enquireLabel")}</h2>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{t("enquireDesc")}</p>
                  </div>
                </div>

                {enquirySubmitted ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-8 space-y-6">
                    <div className="text-center">
                      <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-1">{t("thankYouTitle")}</h3>
                      <p className="text-sm text-muted-foreground">{t("thankYouDesc")}</p>
                    </div>
                    <button
                      onClick={() => { setEnquirySubmitted(false); setEnquiryForm({ name: "", phone: "", countryCode: "+971", message: "", email: "" }); }}
                      className="text-xs font-semibold text-primary hover:underline block mx-auto"
                    >
                      {t("submitAnotherEnquiry")}
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleEnquirySubmit} className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">{t("fullName")} *</label>
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
                      <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">{t("phoneNumber")} *</label>
                      <div className="flex gap-2">
                        <select
                          value={enquiryForm.countryCode}
                          onChange={(e) => setEnquiryForm(f => ({ ...f, countryCode: e.target.value }))}
                          className="h-11 rounded-xl bg-muted/30 border border-border/50 px-3 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all appearance-none"
                        >
                          <option value="+971">+971</option>
                          <option value="+44">+44</option>
                          <option value="+1">+1</option>
                          <option value="+91">+91</option>
                          <option value="+86">+86</option>
                          <option value="+7">+7</option>
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
                    <div className="bg-muted/20 rounded-xl px-3.5 py-2.5 border border-border/30">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground/70">{t("messageLabel")}:</span>{" "}
                        {t("enquireInterestedIn", { title: listing.title })}
                      </p>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => setShowMoreEnquiry(!showMoreEnquiry)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                      >
                        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showMoreEnquiry ? "rotate-180" : ""}`} />
                        {showMoreEnquiry ? t("hideDetails") : t("addMoreDetails")}
                      </button>
                      {showMoreEnquiry && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="space-y-3 mt-3 overflow-hidden"
                        >
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">{t("messageLabel")}</label>
                            <textarea
                              rows={3}
                              value={enquiryForm.message}
                              onChange={(e) => setEnquiryForm(f => ({ ...f, message: e.target.value }))}
                              className="w-full rounded-xl bg-muted/30 border border-border/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all resize-none"
                              placeholder="Any specific requirements..."
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">{t("emailLabel")}</label>
                            <input
                              type="email"
                              value={enquiryForm.email}
                              onChange={(e) => setEnquiryForm(f => ({ ...f, email: e.target.value }))}
                              className="w-full h-11 rounded-xl bg-muted/30 border border-border/50 px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
                              placeholder="your@email.com"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">{t("preferredContact")}</label>
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
                                    className="flex-1 h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-muted/50 text-muted-foreground hover:bg-muted border border-border/50 transition-all"
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
                      {t("sendQuickEnquiry")}
                    </button>
                    <p className="text-[10px] text-muted-foreground text-center">{t("responseTime")}</p>
                  </form>
                )}
              </motion.div>

              {/* Schedule Video Consultation — below enquiry form */}
              <a
                href="#schedule-call"
                className="mt-4 block rounded-2xl p-[2px] bg-gradient-to-r from-primary via-primary/60 to-accent transition-all duration-300 group hover:shadow-lg hover:shadow-primary/15 hover:scale-[1.01]"
              >
                <div className="rounded-[14px] bg-card/95 backdrop-blur-xl p-4 sm:p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/15 flex items-center justify-center flex-shrink-0 group-hover:from-primary/20 transition-all">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-primary">{t("scheduleCall")}</h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{t("scheduleCallDesc")}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-primary/40 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                </div>
              </a>
            </div>

            {/* ── Right sidebar — sticky CTA + property details only ──────── */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-5">

              {/* CTA Card */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}
                className="hidden sm:block bg-card rounded-2xl border border-border/50 overflow-hidden shadow-lg shadow-foreground/5">
                <div className="relative p-6 overflow-hidden" style={{ background: "linear-gradient(135deg,#0B3D2E,#1A7A5A)" }}>
                  <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-accent/20 blur-2xl" />
                  <div className="flex items-center gap-2 mb-1 relative z-10">
                    <p className="text-white/60 text-xs uppercase tracking-[0.15em] font-semibold">
                      {t("bookConsultation")}
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-white relative z-10">{formattedPrice}</p>
                  {currency === "AED" && listing.price && (
                    <p className="text-white/40 text-sm mt-0.5 relative z-10">{t("approxUsd", { amount: Math.round(listing.price * USD_RATE / 1000) })}</p>
                  )}
                  {listing.price && (
                    <p className="text-white/50 text-sm mt-1.5 relative z-10">{listing.price.toLocaleString()} AED</p>
                  )}
                </div>
                <div className="hidden sm:block p-5 space-y-3">
                  <p className="text-sm text-muted-foreground mb-1">{t("speakToExperts")}</p>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-white font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                    style={{ background: "linear-gradient(to right,#25D366,#1DA851)" }}>
                    <MessageCircle className="h-4 w-4" /> {t("whatsappInquiry")}
                  </a>
                  <a href="tel:+97154998811"
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-white font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                    style={{ background: "linear-gradient(to right,#D4A847,#B8922F)" }}>
                    <Phone className="h-4 w-4" /> {t("callNow")}
                  </a>
                  <a href="#live-chat"
                    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-primary/30 text-primary rounded-full text-sm font-semibold hover:bg-primary hover:text-white hover:border-transparent transition-all">
                    <MessageCircle className="h-4 w-4" /> {t("liveChat")}
                  </a>
                </div>
              </motion.div>

              {/* Property Details card */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }}
                className="hidden sm:block bg-card rounded-2xl border border-border/50 p-5">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em] mb-4">
                  {t("propertyDetailsLabel")}
                </h3>
                <div className="divide-y divide-border/40">
                  {[
                    { label: t("community"), value: listing.community },
                    { label: t("city"), value: listing.city },
                    { label: t("property"), value: listing.propertyType ? formatPropertyTypeLabel(listing.propertyType, listing.propertyType) : null },
                    { label: t("type"), value: isRent ? t("forRent") : t("forSale") },
                    { label: t("titleTypeLabel"), value: isRent ? t("leaseholdTitle") : t("freeholdTitle") },
                    { label: t("ownershipLabel"), value: t("allNationalities") },
                  ].filter((f): f is { label: string; value: string } => !!f.value).map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center py-3 text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="text-foreground font-semibold text-right max-w-[55%]">{value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SIMILAR LISTINGS ─────────────────────────────────────────────── */}
      {similarListings.length > 0 && (
        <section className="py-16 bg-muted/30 border-t border-border/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-px bg-accent" />
                <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-accent">{t("similarLabel")}</p>
              </div>
              <h2 className="text-2xl font-bold text-foreground">{t("similarProperties")}</h2>
            </div>
            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
            >
              {similarListings.map((l, i) => (
                <motion.div
                  key={l._id}
                  variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } } }}
                >
                  <Link href={`/property/${l.slug}`} className="group block bg-background rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-border/50 hover:border-accent/25">
                    <div className="relative overflow-hidden aspect-[4/3]">
                      <NextImage src={l.featuredImage || l.images?.[0] || "/assets/amenities-placeholder.webp"} alt={l.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" sizes="(max-width:768px) 100vw, 33vw" />
                      <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-lg text-white uppercase tracking-wider" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
                        {l.listingType === "Rent" ? t("forRent") : t("forSale")}
                      </span>
                      <CardActions propertyId={l.slug} slug={l.slug} title={l.title} />
                    </div>
                    <div className="p-5">
                      {l.community && (
                        <p className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                          <MapPin className="h-3 w-3 text-accent" /> {l.community}{l.city ? `, ${l.city}` : ""}
                        </p>
                      )}
                      <h3 className="font-bold text-foreground mb-3 group-hover:text-primary transition-colors leading-snug line-clamp-2 text-sm">{l.title}</h3>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                        {l.bedrooms != null && <span className="flex items-center gap-1"><BedDouble className="h-3 w-3" />{l.bedrooms} {t("bed")}</span>}
                        {l.bathrooms != null && <span className="flex items-center gap-1"><Bath className="h-3 w-3" />{l.bathrooms} {t("bath")}</span>}
                        {l.size != null && <span className="flex items-center gap-1"><Maximize className="h-3 w-3" />{l.size.toLocaleString()} {l.sizeUnit || "sqft"}</span>}
                      </div>
                      <div className="flex items-center justify-between border-t border-border pt-3">
                        <p className="text-sm font-bold text-primary">{formatPrice(l.price, l.currency, t("priceOnRequest"))}</p>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ── WHAT BUYERS/RENTERS SAY ──────────────────────────────────────── */}
      {(() => {
        const testimonials = isRent
          ? [
              { name: "Aisha M.", role: "Tenant in Dubai Marina", rating: 5, text: "The whole rental process took less than a week — viewing, paperwork, Ejari registration. Binayah's team made what could have been stressful incredibly smooth." },
              { name: "Ravi K.", role: "Tenant in JVC", rating: 5, text: "I was relocating from London and Binayah arranged a virtual tour, then handled everything before I even arrived. Walked into a fully furnished apartment ready to move in." },
              { name: "Sophie L.", role: "Tenant in Downtown", rating: 4, text: "Honest about the building's strengths and quirks. No hidden fees, no surprises. The post-move-in support has been excellent — they actually pick up when I call." },
            ]
          : [
              { name: "Ahmed R.", role: "Buyer · 2 BR Apartment", rating: 5, text: "Exceptional knowledge of the Dubai market and the legal process. Binayah handled DLD registration, mortgage coordination, and snagging — I just signed the papers." },
              { name: "Sarah L.", role: "Buyer · 3 BR Villa", rating: 5, text: "We saw twelve properties before settling on this one. Our agent never pushed, never rushed — just gave us honest assessments and let us decide. That trust is rare." },
              { name: "James K.", role: "Investor · 1 BR Studio", rating: 4, text: "Strong rental yield analysis and realistic ROI projections — none of the inflated numbers other agencies threw at me. Bought sight-unseen based on their report." },
            ];
        return (
          <section className="py-12 sm:py-16 border-t border-border/50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(212,168,71,0.12)" }}>
                  <MessageCircle className="h-4 w-4" style={{ color: "#D4A847" }} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] font-semibold mb-0.5" style={{ color: "#D4A847" }}>
                    {t("testimonialsLabel")}
                  </p>
                  <h2 className="text-lg sm:text-xl font-bold text-foreground">{t("whatClientsSay")}</h2>
                </div>
              </div>
              <div className="flex sm:grid sm:grid-cols-3 gap-3 sm:gap-5 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 pb-2 sm:pb-0 snap-x snap-mandatory">
                {testimonials.map((review, i) => (
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
                      <div className="w-9 h-9 rounded-full bg-accent/15 flex items-center justify-center" style={{ border: "2px solid rgba(212,168,71,0.2)" }}>
                        <span className="text-xs font-bold text-accent">{review.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{review.name}</p>
                        <p className="text-[11px] text-muted-foreground">{review.role}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        );
      })()}

      {/* ── PROPERTY GUIDES ──────────────────────────────────────────────── */}
      {(() => {
        const guides = isRent
          ? [
              { title: t("guideRentTenantRightsTitle"), desc: t("guideRentTenantRightsDesc"), icon: Shield, href: "/guides" },
              { title: t("guideRentEjariTitle"), desc: t("guideRentEjariDesc"), icon: FileText, href: "/guides" },
              { title: t("guideRentDewaTitle"), desc: t("guideRentDewaDesc"), icon: Zap, href: "/guides" },
              { title: t("guideRentRentIncreaseTitle"), desc: t("guideRentRentIncreaseDesc"), icon: TrendingUp, href: "/guides" },
              { title: t("guideRentMovingTitle"), desc: t("guideRentMovingDesc"), icon: Home, href: "/guides" },
              { title: t("guideRentCommunityTitle"), desc: t("guideRentCommunityDesc"), icon: Compass, href: "/guides" },
            ]
          : [
              { title: t("guideSaleHowToBuyTitle"), desc: t("guideSaleHowToBuyDesc"), icon: Home, href: "/guides" },
              { title: t("guideSaleGoldenVisaTitle"), desc: t("guideSaleGoldenVisaDesc"), icon: Shield, href: "/guides" },
              { title: t("guideSaleDldTitle"), desc: t("guideSaleDldDesc"), icon: FileText, href: "/guides" },
              { title: t("guideSaleMortgageTitle"), desc: t("guideSaleMortgageDesc"), icon: TrendingUp, href: "/guides" },
              { title: t("guideSaleOffPlanTitle"), desc: t("guideSaleOffPlanDesc"), icon: Compass, href: "/guides" },
              { title: t("guideSaleFirstTimerTitle"), desc: t("guideSaleFirstTimerDesc"), icon: Star, href: "/guides" },
            ];
        return (
          <section className="py-12 sm:py-16 border-t border-border/50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-foreground">{t("propertyGuides")}</h2>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{t("propertyGuidesDesc")}</p>
                  </div>
                </div>
                <Link href="/guides" className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:text-accent/80 transition-colors">
                  {t("viewAll")} <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 items-stretch">
                {guides.map((guide, i) => (
                  <motion.a
                    key={i}
                    href={guide.href}
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
                  {t("viewAllGuides")} <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </section>
        );
      })()}

      {/* ── LIGHTBOX ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
            <button onClick={() => setLightboxOpen(false)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-10">
              <X className="h-5 w-5" />
            </button>
            {allImages.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors">
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors">
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={allImages[currentImage]} alt={listing.title} className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
            <div className="absolute bottom-6 text-white/60 text-sm">{currentImage + 1} / {allImages.length}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── STICKY MOBILE CTA ────────────────────────────────────────────── */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border px-4 py-3 flex gap-3">
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3 text-white rounded-xl font-semibold text-sm transition-colors" style={{ background: "linear-gradient(to right,#25D366,#1DA851)" }}>
          <MessageCircle className="h-4 w-4" />{t("whatsappInquiry")}
        </a>
        <a href="tel:+97154998811" className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold text-sm transition-colors">
          <Phone className="h-4 w-4" />{t("callNow")}
        </a>
      </div>

      {/* ── STICKY MOBILE CTA BAR ─────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-background/95 backdrop-blur-md border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex gap-2 px-4 py-2.5 max-w-lg mx-auto">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full bg-gradient-to-r from-[#25D366] to-[#1DA851] text-white font-bold text-[13px] shadow-md active:scale-[0.97] transition-all">
            <MessageCircle className="h-4 w-4" /> {t("whatsappInquiry")}
          </a>
          <a href="tel:+97154998811"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-white font-bold text-[13px] shadow-md active:scale-[0.97] transition-all"
            style={{ background: "linear-gradient(to right, #D4A847, #B8922F)" }}>
            <Phone className="h-4 w-4" /> {t("callNow")}
          </a>
        </div>
      </div>
      <div className="h-20 lg:hidden" />

      <Footer />
      <div className="hidden lg:block">
        <WhatsAppButton />
      </div>
      <PropertyComparison />
    </div>
  );
}
