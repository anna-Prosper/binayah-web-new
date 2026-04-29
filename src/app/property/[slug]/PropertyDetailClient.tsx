"use client";

import { useTranslations } from "next-intl";
import { apiUrl } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, BedDouble, Bath, Maximize, Phone, Mail, MessageCircle,
  ChevronLeft, ChevronRight, X, Home, Check, Send, Image as ImageIcon,
  Waves, Dumbbell, Car, Shield, Baby, Flame, TreePine, Store, Smartphone,
  Building2, Star, ChevronDown, Globe, ArrowRight, Zap, Wind,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { formatPropertyTypeLabel } from "@/lib/property-types";
import { DetailActions, CardActions } from "@/components/PropertyActions";
import PropertyComparison from "@/components/PropertyComparison";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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
  // Generic Dubai fallback
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

// ── Section heading ───────────────────────────────────────────────────────────
function SectionHeading({ label, title }: { label: string; title: string }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-4 h-px bg-accent" />
        <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-accent">{label}</p>
      </div>
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
    </div>
  );
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
      className="bg-card rounded-2xl p-4 border-l-[3px] border-l-accent border border-border/50 hover:shadow-md transition-shadow duration-300 flex flex-col justify-center min-h-[80px]"
    >
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className="h-4 w-4 text-accent" />
        <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-bold">{label}</p>
      </div>
      <p className="text-lg font-bold text-foreground leading-tight">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </motion.div>
  );
}

// ── Amenity card — icon-matched ───────────────────────────────────────────────
function AmenityCard({ label }: { label: string }) {
  const Icon = amenityIcon(label);
  return (
    <div className="flex items-center gap-3 bg-card rounded-xl px-4 py-3 border border-border/50 hover:border-accent/40 hover:bg-accent/5 transition-colors group">
      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/15 transition-colors">
        <Icon className="h-4 w-4 text-accent" />
      </div>
      <span className="text-sm text-foreground">{label}</span>
    </div>
  );
}

// ── Highlight card ────────────────────────────────────────────────────────────
function HighlightCard({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 bg-card rounded-xl p-4 border border-border/50 hover:border-accent/30 hover:shadow-sm transition-all group">
      <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-accent/15 transition-colors">
        <Star className="h-3.5 w-3.5 text-accent" />
      </div>
      <p className="text-sm font-medium text-foreground leading-snug">{text}</p>
    </div>
  );
}

// ── Nearby item ───────────────────────────────────────────────────────────────
function NearbyItem({ item }: { item: { name: string; type: string; distance: string } }) {
  const Icon = nearbyIcon(item.type);
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border/40 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
        <Icon className="h-4 w-4 text-accent" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{item.name}</p>
        <p className="text-xs text-muted-foreground capitalize">{item.type}</p>
      </div>
      <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">{item.distance}</span>
    </div>
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
  const { toast } = useToast();
  const [currentImage, setCurrentImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: t("inquiryDefaultMessage", { title: listing.title }),
  });

  const allImages = [listing.featuredImage, ...(listing.images || [])].filter(Boolean) as string[];
  if (allImages.length === 0) allImages.push("/assets/amenities-placeholder.webp");

  const nextImage = () => setCurrentImage((p) => (p + 1) % allImages.length);
  const prevImage = () => setCurrentImage((p) => (p - 1 + allImages.length) % allImages.length);

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(apiUrl("/api/inquiries"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          propertySlug: listing.slug,
          propertyTitle: listing.title,
          type: "property-inquiry",
        }),
      });
    } catch {}
    toast({ title: t("inquirySent"), description: t("teamReply") });
    setForm((f) => ({ ...f, name: "", email: "", phone: "" }));
  };

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "97154998811";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Hi, I'm interested in: ${listing.title}\n${typeof window !== "undefined" ? window.location.href : ""}`
  )}`;

  const isRent = listing.listingType === "Rent";
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
          <img
            src={allImages[currentImage]}
            alt={listing.title}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
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
                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15] mb-2">{listing.title}</h1>
                  {(listing.community || listing.address) && (
                    <p className="text-white/75 flex items-center gap-1.5 text-sm mb-3">
                      <MapPin className="h-3.5 w-3.5 text-accent flex-shrink-0" />
                      {listing.address || `${listing.community}${listing.areas?.[0] ? `, ${listing.areas[0]}` : ""}${listing.city ? `, ${listing.city}` : ""}`}
                    </p>
                  )}
                  <DetailActions propertyId={listing.slug} slug={listing.slug} title={listing.title} />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }} className="hidden sm:flex flex-col items-start lg:items-end gap-2.5 pointer-events-auto flex-shrink-0">
                  <div className="lg:text-right">
                    <p className="text-white/60 text-[10px] uppercase tracking-widest font-semibold mb-0.5">{isRent ? t("perYear") : t("listedAt")}</p>
                    <p className="text-3xl lg:text-4xl font-bold text-white">{formatPrice(listing.price, listing.currency, t("priceOnRequest"))}</p>
                  </div>
                  {allImages.length > 1 && (
                    <div className="hidden lg:flex gap-2">
                      {allImages.slice(0, 4).map((img, i) => (
                        <button key={i} onClick={() => setCurrentImage(i)} className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${i === currentImage ? "border-accent shadow-lg shadow-accent/20 scale-110" : "border-white/20 opacity-70 hover:opacity-100 hover:border-white/50"}`}>
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                  <button onClick={() => setLightboxOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
                    <ImageIcon className="h-3.5 w-3.5" />
                    {t("gallery")} ({allImages.length})
                  </button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PHOTO GALLERY GRID ───────────────────────────────────────────── */}
      {allImages.length > 1 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-3 pb-1">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground">
              {allImages.length} {t("gallery")}
            </p>
            <button onClick={() => setLightboxOpen(true)} className="flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent/80 transition-colors">
              <ImageIcon className="h-3 w-3" />
              {t("gallery")} ({allImages.length})
            </button>
          </div>

          {/* Desktop — asymmetric 5-photo grid */}
          {allImages.length >= 3 ? (
            <div className="hidden sm:grid grid-cols-4 grid-rows-2 gap-2 h-[340px] rounded-2xl overflow-hidden">
              <button onClick={() => { setCurrentImage(0); setLightboxOpen(true); }} className="col-span-2 row-span-2 relative overflow-hidden group">
                <img src={allImages[0]} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </button>
              {allImages.slice(1, 5).map((img, i) => (
                <button key={i} onClick={() => { setCurrentImage(i + 1); setLightboxOpen(true); }} className="relative overflow-hidden group border-l border-t border-background/20">
                  <img src={img} alt={`${listing.title} ${i + 2}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  {i === 3 && allImages.length > 5 && (
                    <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">+{allImages.length - 5}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="hidden sm:grid grid-cols-2 gap-2 h-[240px] rounded-2xl overflow-hidden">
              {allImages.slice(0, 2).map((img, i) => (
                <button key={i} onClick={() => { setCurrentImage(i); setLightboxOpen(true); }} className="relative overflow-hidden group">
                  <img src={img} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </button>
              ))}
            </div>
          )}

          {/* Mobile — horizontal scroll strip */}
          <div className="sm:hidden flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-hide">
            {allImages.map((img, i) => (
              <button key={i} onClick={() => { setCurrentImage(i); setLightboxOpen(true); }} className={`relative flex-shrink-0 w-28 h-20 rounded-xl overflow-hidden snap-start ${i === currentImage ? "ring-2 ring-accent" : ""}`}>
                <img src={img} alt="" className="w-full h-full object-cover" loading={i > 0 ? "lazy" : undefined} />
              </button>
            ))}
            {allImages.length > 5 && (
              <button onClick={() => setLightboxOpen(true)} className="flex-shrink-0 w-28 h-20 rounded-xl bg-muted flex items-center justify-center snap-start">
                <span className="text-xs font-bold text-muted-foreground">+{allImages.length - 5}</span>
              </button>
            )}
          </div>
        </section>
      )}

      {/* ── QUICK STATS STRIP ────────────────────────────────────────────── */}
      <section className="py-4 sm:py-5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {listing.bedrooms != null && <StatCard icon={BedDouble} label={t("bedrooms")} value={listing.bedrooms} delay={0.1} />}
            {listing.bathrooms != null && <StatCard icon={Bath} label={t("bathrooms")} value={listing.bathrooms} delay={0.15} />}
            {listing.size != null && <StatCard icon={Maximize} label={t("size")} value={`${listing.size.toLocaleString()} ${listing.sizeUnit || "sqft"}`} sub={sqftToSqm(listing.size)} delay={0.2} />}
            {listing.propertyType && <StatCard icon={Home} label={t("type")} value={formatPropertyTypeLabel(listing.propertyType, listing.propertyType)} delay={0.25} />}
          </div>
        </div>
      </section>

      {/* ── CONTENT + SIDEBAR ────────────────────────────────────────────── */}
      <section className="pb-28 sm:pb-24 pt-2">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">

            {/* ── Left column ─────────────────────────────────────────── */}
            <div>

              {/* Description */}
              {listing.cleanDescription && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-10">
                  <SectionHeading label={t("overviewLabel")} title={t("description")} />
                  <div className="text-muted-foreground leading-relaxed space-y-3 text-sm">
                    {listing.cleanDescription.split(/\n\n|\. (?=[A-Z])/).filter(Boolean).map((para, i) => (
                      <p key={i}>{para.trim().endsWith(".") ? para.trim() : `${para.trim()}.`}</p>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── KEY HIGHLIGHTS ──────────────────────────────────────── */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="mb-10">
                <SectionHeading label={t("highlightsLabel")} title={t("highlightsTitle")} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {highlights.map((h, i) => <HighlightCard key={i} text={h} />)}
                </div>
              </motion.div>

              {/* Property details — divider list style */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-10">
                <SectionHeading label={t("quickFactsLabel")} title={t("propertyDetails")} />
                <div className="bg-card rounded-2xl border border-border/50 divide-y divide-border/50 overflow-hidden">
                  <div className="flex justify-between items-center px-5 py-3.5">
                    <span className="text-sm text-muted-foreground">{t("type")}</span>
                    <span className="text-sm font-semibold text-foreground">{isRent ? t("forRent") : t("forSale")}</span>
                  </div>
                  {listing.propertyType && (
                    <div className="flex justify-between items-center px-5 py-3.5">
                      <span className="text-sm text-muted-foreground">{t("property")}</span>
                      <span className="text-sm font-semibold text-foreground">{formatPropertyTypeLabel(listing.propertyType, listing.propertyType)}</span>
                    </div>
                  )}
                  {listing.community && (
                    <div className="flex justify-between items-center px-5 py-3.5">
                      <span className="text-sm text-muted-foreground">{t("community")}</span>
                      <span className="text-sm font-semibold text-foreground">{listing.community}</span>
                    </div>
                  )}
                  {listing.areas?.[0] && (
                    <div className="flex justify-between items-center px-5 py-3.5">
                      <span className="text-sm text-muted-foreground">{t("area")}</span>
                      <span className="text-sm font-semibold text-foreground">{listing.areas[0]}</span>
                    </div>
                  )}
                  {listing.city && (
                    <div className="flex justify-between items-center px-5 py-3.5">
                      <span className="text-sm text-muted-foreground">{t("city")}</span>
                      <span className="text-sm font-semibold text-foreground">{listing.city}</span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* ── AMENITIES with icon mapping ─────────────────────────── */}
              {listing.features && listing.features.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-10">
                  <SectionHeading label={t("amenitiesLabel")} title={t("features")} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {listing.features.map((feat, i) => <AmenityCard key={i} label={feat} />)}
                  </div>
                </motion.div>
              )}

              {/* ── LOCATION + MAP ──────────────────────────────────────── */}
              {hasMap && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mb-10">
                  <SectionHeading label={t("locationLabel")} title={t("location")} />
                  <div className="rounded-2xl overflow-hidden border border-border/50 aspect-[16/9]">
                    <iframe
                      src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${listing.latitude},${listing.longitude}&zoom=15`}
                      width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </motion.div>
              )}

              {/* ── NEARBY ATTRACTIONS ──────────────────────────────────── */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} className="mb-10">
                <SectionHeading label={t("nearbyLabel")} title={t("nearbyTitle")} />
                <div className="bg-card rounded-2xl border border-border/50 px-5 grid sm:grid-cols-2 sm:divide-x sm:divide-border/40">
                  <div className="sm:pr-6">
                    {nearbyItems.slice(0, 3).map((item, i) => <NearbyItem key={i} item={item} />)}
                  </div>
                  <div className="sm:pl-6">
                    {nearbyItems.slice(3, 6).map((item, i) => <NearbyItem key={i} item={item} />)}
                  </div>
                </div>
              </motion.div>

              {/* ── FAQ ACCORDION ───────────────────────────────────────── */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-10">
                <SectionHeading label={t("faqLabel")} title={t("faqTitle")} />
                <div className="bg-card rounded-2xl border border-border/50 px-5">
                  {faqs.map((faq, i) => (
                    <FaqAccordionItem
                      key={i}
                      faq={faq}
                      index={i}
                      open={openFaq === i}
                      onToggle={(idx) => setOpenFaq((prev) => prev === idx ? null : idx)}
                    />
                  ))}
                </div>
              </motion.div>

            </div>

            {/* ── Right sidebar ────────────────────────────────────────── */}
            <div className="lg:sticky lg:top-24 space-y-4 self-start">

              {/* Price card — green gradient header */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm">
                <div className="p-5 text-white" style={{ background: "linear-gradient(135deg, #0B3D2E 0%, #1A7A5A 100%)" }}>
                  <p className="text-white/60 text-[10px] uppercase tracking-widest font-semibold mb-0.5">{isRent ? t("perYear") : t("listedAt")}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white leading-tight">{formatPrice(listing.price, listing.currency, t("priceOnRequest"))}</p>
                  <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/15 text-white">{isRent ? t("forRent") : t("forSale")}</span>
                    {listing.propertyType && (
                      <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-white/10 text-white/80">{formatPropertyTypeLabel(listing.propertyType, listing.propertyType)}</span>
                    )}
                    {listing.community && (
                      <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-white/10 text-white/70 flex items-center gap-1">
                        <MapPin className="h-2.5 w-2.5" />{listing.community}
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-5 space-y-2.5">
                  <p className="text-base font-bold text-foreground mb-0.5">{t("interestedTitle")}</p>
                  <p className="text-sm text-muted-foreground mb-4">{t("interestedSubtitle")}</p>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] hover:bg-[#22c55e] text-white rounded-xl font-semibold text-sm transition-colors">
                    <MessageCircle className="h-4 w-4" />{t("whatsapp")}
                  </a>
                  <a href="tel:+97154998811" className="flex items-center justify-center gap-2 w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold text-sm transition-colors">
                    <Phone className="h-4 w-4" />{t("callUs")}
                  </a>
                  <a href="mailto:info@binayah.com" className="flex items-center justify-center gap-2 w-full py-3 bg-card hover:bg-muted text-foreground border border-border rounded-xl font-semibold text-sm transition-colors">
                    <Mail className="h-4 w-4" />{t("emailUs")}
                  </a>
                </div>
              </motion.div>

              {/* Inquiry form */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
                <SectionHeading label={t("inquiryLabel")} title={t("sendInquiry")} />
                <form onSubmit={handleInquiry} className="space-y-3">
                  <input type="text" required placeholder="Your Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  <input type="email" required placeholder="Email Address" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  <input type="tel" placeholder="Phone Number" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  <textarea rows={3} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
                  <button type="submit" className="w-full py-3 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                    <Send className="h-4 w-4" />{t("sendInquiryBtn")}
                  </button>
                </form>
              </motion.div>
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {similarListings.map((l, i) => (
                <motion.div key={l._id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                  <Link href={`/property/${l.slug}`} className="group block bg-background rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-border/50 hover:border-accent/25">
                    <div className="relative overflow-hidden aspect-[4/3]">
                      <img src={l.featuredImage || l.images?.[0] || "/assets/amenities-placeholder.webp"} alt={l.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
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
            </div>
          </div>
        </section>
      )}

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
            <img src={allImages[currentImage]} alt={listing.title} className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
            <div className="absolute bottom-6 text-white/60 text-sm">{currentImage + 1} / {allImages.length}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── STICKY MOBILE CTA ────────────────────────────────────────────── */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border px-4 py-3 flex gap-3">
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#25D366] hover:bg-[#22c55e] text-white rounded-xl font-semibold text-sm transition-colors">
          <MessageCircle className="h-4 w-4" />{t("whatsapp")}
        </a>
        <a href="tel:+97154998811" className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold text-sm transition-colors">
          <Phone className="h-4 w-4" />{t("callUs")}
        </a>
      </div>

      <Footer />
      <WhatsAppButton />
      <PropertyComparison />
    </div>
  );
}
