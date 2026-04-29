"use client";

import { useTranslations } from "next-intl";
import { apiUrl } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, BedDouble, Bath, Maximize, Phone, Mail, MessageCircle,
  ChevronLeft, ChevronRight, X, Home, Check, Send, Image as ImageIcon,
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

// ── Section heading — eyebrow rule + h2 ──────────────────────────────────────
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

// ── Stat card — left accent border, matches project template ─────────────────
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── HERO — full-bleed image with gradient overlay ────────────────── */}
      <section className="relative">
        <div className="relative h-[55vh] sm:h-[65vh] min-h-[380px] overflow-hidden">
          {/* Image */}
          <img
            src={allImages[currentImage]}
            alt={listing.title}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/25 to-transparent pointer-events-none" />

          {/* Breadcrumb */}
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

          {/* Nav arrows */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors z-10"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors z-10"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Hero content */}
          <div className="absolute bottom-0 left-0 right-0 z-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-6 sm:pb-8">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3 sm:gap-6">

                {/* Left: badges + title + location + actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="pointer-events-auto"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold text-white shadow-lg"
                      style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
                    >
                      {isRent ? t("forRent") : t("forSale")}
                    </span>
                    {listing.propertyType && (
                      <span className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-white/15 backdrop-blur-md text-white border border-white/20 shadow-lg">
                        {formatPropertyTypeLabel(listing.propertyType, listing.propertyType)}
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15] mb-2">
                    {listing.title}
                  </h1>
                  {(listing.community || listing.address) && (
                    <p className="text-white/75 flex items-center gap-1.5 text-sm mb-3">
                      <MapPin className="h-3.5 w-3.5 text-accent flex-shrink-0" />
                      {listing.address || `${listing.community}${listing.areas?.[0] ? `, ${listing.areas[0]}` : ""}${listing.city ? `, ${listing.city}` : ""}`}
                    </p>
                  )}
                  <DetailActions propertyId={listing.slug} slug={listing.slug} title={listing.title} />
                </motion.div>

                {/* Right: price + thumbnail strip + gallery button (desktop) */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="hidden sm:flex flex-col items-start lg:items-end gap-2.5 pointer-events-auto flex-shrink-0"
                >
                  <div className="lg:text-right">
                    <p className="text-white/60 text-[10px] uppercase tracking-widest font-semibold mb-0.5">
                      {isRent ? t("perYear") : t("listedAt")}
                    </p>
                    <p className="text-3xl lg:text-4xl font-bold text-white">
                      {formatPrice(listing.price, listing.currency, t("priceOnRequest"))}
                    </p>
                  </div>
                  {allImages.length > 1 && (
                    <div className="hidden lg:flex gap-2">
                      {allImages.slice(0, 4).map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentImage(i)}
                          className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                            i === currentImage
                              ? "border-accent shadow-lg shadow-accent/20 scale-110"
                              : "border-white/20 opacity-70 hover:opacity-100 hover:border-white/50"
                          }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => setLightboxOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
                    style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                    {t("gallery")} ({allImages.length})
                  </button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile gallery button */}
      <div className="sm:hidden px-4 py-3">
        <button
          onClick={() => setLightboxOpen(true)}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-bold text-white shadow-md active:scale-[0.97] transition-all"
          style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
        >
          <ImageIcon className="h-3.5 w-3.5" />
          {t("gallery")} ({allImages.length})
        </button>
      </div>

      {/* ── QUICK STATS STRIP ────────────────────────────────────────────── */}
      <section className="py-4 sm:py-5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {listing.bedrooms != null && (
              <StatCard icon={BedDouble} label={t("bedrooms")} value={listing.bedrooms} delay={0.1} />
            )}
            {listing.bathrooms != null && (
              <StatCard icon={Bath} label={t("bathrooms")} value={listing.bathrooms} delay={0.15} />
            )}
            {listing.size != null && (
              <StatCard
                icon={Maximize}
                label={t("size")}
                value={`${listing.size.toLocaleString()} ${listing.sizeUnit || "sqft"}`}
                sub={sqftToSqm(listing.size)}
                delay={0.2}
              />
            )}
            {listing.propertyType && (
              <StatCard
                icon={Home}
                label={t("type")}
                value={formatPropertyTypeLabel(listing.propertyType, listing.propertyType)}
                delay={0.25}
              />
            )}
          </div>
        </div>
      </section>

      {/* ── CONTENT + SIDEBAR ────────────────────────────────────────────── */}
      {/* pb-28 on mobile leaves room for the sticky CTA bar */}
      <section className="pb-28 sm:pb-24 pt-2">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">

            {/* ── Left column ─────────────────────────────────────────── */}
            <div>
              {/* Description */}
              {listing.cleanDescription && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-10"
                >
                  <SectionHeading label={t("overviewLabel")} title={t("description")} />
                  <div className="text-muted-foreground leading-relaxed space-y-3 text-sm">
                    {listing.cleanDescription
                      .split(/\n\n|\. (?=[A-Z])/)
                      .filter(Boolean)
                      .map((para, i) => (
                        <p key={i}>{para.trim().endsWith(".") ? para.trim() : `${para.trim()}.`}</p>
                      ))}
                  </div>
                </motion.div>
              )}

              {/* Property details — divider list style */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mb-10"
              >
                <SectionHeading label={t("quickFactsLabel")} title={t("propertyDetails")} />
                <div className="bg-card rounded-2xl border border-border/50 divide-y divide-border/50 overflow-hidden">
                  {listing.propertyId && (
                    <div className="flex justify-between items-center px-5 py-3.5">
                      <span className="text-sm text-muted-foreground">{t("reference")}</span>
                      <span className="text-sm font-semibold text-foreground font-mono tracking-wide">{listing.propertyId}</span>
                    </div>
                  )}
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

              {/* Features / Amenities */}
              {listing.features && listing.features.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-10"
                >
                  <SectionHeading label={t("amenitiesLabel")} title={t("features")} />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {listing.features.map((feat, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2.5 bg-card rounded-xl px-4 py-3 border border-border/50 hover:border-accent/40 hover:bg-accent/5 transition-colors"
                      >
                        <Check className="h-4 w-4 text-accent flex-shrink-0" />
                        <span className="text-sm text-foreground">{feat}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Map */}
              {listing.latitude && listing.longitude && listing.latitude !== 0 && listing.longitude !== 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="mb-10"
                >
                  <SectionHeading label={t("locationLabel")} title={t("location")} />
                  <div className="rounded-2xl overflow-hidden border border-border/50 aspect-[16/9]">
                    <iframe
                      src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${listing.latitude},${listing.longitude}&zoom=15`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {/* ── Right sidebar ────────────────────────────────────────── */}
            <div className="lg:sticky lg:top-24 space-y-4 self-start">

              {/* Price card — green gradient header like project sidebar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm"
              >
                {/* Green gradient header */}
                <div
                  className="p-5 text-white"
                  style={{ background: "linear-gradient(135deg, #0B3D2E 0%, #1A7A5A 100%)" }}
                >
                  <p className="text-white/60 text-[10px] uppercase tracking-widest font-semibold mb-0.5">
                    {isRent ? t("perYear") : t("listedAt")}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                    {formatPrice(listing.price, listing.currency, t("priceOnRequest"))}
                  </p>
                  <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/15 text-white">
                      {isRent ? t("forRent") : t("forSale")}
                    </span>
                    {listing.propertyType && (
                      <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-white/10 text-white/80">
                        {formatPropertyTypeLabel(listing.propertyType, listing.propertyType)}
                      </span>
                    )}
                    {listing.community && (
                      <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-white/10 text-white/70 flex items-center gap-1">
                        <MapPin className="h-2.5 w-2.5" />
                        {listing.community}
                      </span>
                    )}
                  </div>
                </div>

                {/* Contact buttons */}
                <div className="p-5 space-y-2.5">
                  <p className="text-base font-bold text-foreground mb-0.5">{t("interestedTitle")}</p>
                  <p className="text-sm text-muted-foreground mb-4">{t("interestedSubtitle")}</p>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] hover:bg-[#22c55e] text-white rounded-xl font-semibold text-sm transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    {t("whatsapp")}
                  </a>
                  <a
                    href="tel:+97154998811"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold text-sm transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    {t("callUs")}
                  </a>
                  <a
                    href="mailto:info@binayah.com"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-card hover:bg-muted text-foreground border border-border rounded-xl font-semibold text-sm transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    {t("emailUs")}
                  </a>
                </div>
              </motion.div>

              {/* Inquiry form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm"
              >
                <SectionHeading label={t("inquiryLabel")} title={t("sendInquiry")} />
                <form onSubmit={handleInquiry} className="space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <textarea
                    rows={3}
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                  <button
                    type="submit"
                    className="w-full py-3 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {t("sendInquiryBtn")}
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
                <motion.div
                  key={l._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link
                    href={`/property/${l.slug}`}
                    className="group block bg-background rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-border/50 hover:border-accent/25"
                  >
                    <div className="relative overflow-hidden aspect-[4/3]">
                      <img
                        src={l.featuredImage || l.images?.[0] || "/assets/amenities-placeholder.webp"}
                        alt={l.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                      <span
                        className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-lg text-white uppercase tracking-wider"
                        style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
                      >
                        {l.listingType === "Rent" ? t("forRent") : t("forSale")}
                      </span>
                      <CardActions propertyId={l.slug} slug={l.slug} title={l.title} />
                    </div>
                    <div className="p-5">
                      {l.community && (
                        <p className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                          <MapPin className="h-3 w-3 text-accent" /> {l.community}
                          {l.city ? `, ${l.city}` : ""}
                        </p>
                      )}
                      <h3 className="font-bold text-foreground mb-3 group-hover:text-primary transition-colors leading-snug line-clamp-2 text-sm">
                        {l.title}
                      </h3>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                        {l.bedrooms != null && (
                          <span className="flex items-center gap-1">
                            <BedDouble className="h-3 w-3" />
                            {l.bedrooms} {t("bed")}
                          </span>
                        )}
                        {l.bathrooms != null && (
                          <span className="flex items-center gap-1">
                            <Bath className="h-3 w-3" />
                            {l.bathrooms} {t("bath")}
                          </span>
                        )}
                        {l.size != null && (
                          <span className="flex items-center gap-1">
                            <Maximize className="h-3 w-3" />
                            {l.size.toLocaleString()} {l.sizeUnit || "sqft"}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between border-t border-border pt-3">
                        <p className="text-sm font-bold text-primary">
                          {formatPrice(l.price, l.currency, t("priceOnRequest"))}
                        </p>
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>
            {allImages.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
            <img
              src={allImages[currentImage]}
              alt={listing.title}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-6 text-white/60 text-sm">
              {currentImage + 1} / {allImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── STICKY MOBILE CTA BAR ────────────────────────────────────────── */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border px-4 py-3 flex gap-3">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#25D366] hover:bg-[#22c55e] text-white rounded-xl font-semibold text-sm transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          {t("whatsapp")}
        </a>
        <a
          href="tel:+97154998811"
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold text-sm transition-colors"
        >
          <Phone className="h-4 w-4" />
          {t("callUs")}
        </a>
      </div>

      <Footer />
      <WhatsAppButton />
      <PropertyComparison />
    </div>
  );
}
