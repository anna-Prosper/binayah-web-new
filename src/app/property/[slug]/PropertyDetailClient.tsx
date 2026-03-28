"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Phone,
  Mail,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Share2,
  Heart,
  Building2,
  Home,
  Check,
  Send,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
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

function formatPrice(price?: number, currency = "AED") {
  if (!price) return "Price on request";
  if (price >= 1_000_000)
    return `${currency} ${(price / 1_000_000).toFixed(1)}M`;
  return `${currency} ${price.toLocaleString()}`;
}

export default function PropertyDetailClient({
  listing,
  similarListings,
}: {
  listing: Listing;
  similarListings: SimilarListing[];
}) {
  const { toast } = useToast();
  const [currentImage, setCurrentImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: `Hi, I'm interested in "${listing.title}". Please share more details.`,
  });

  const allImages = [
    listing.featuredImage,
    ...(listing.images || []),
  ].filter(Boolean) as string[];

  if (allImages.length === 0) {
    allImages.push(
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200"
    );
  }

  const nextImage = () =>
    setCurrentImage((p) => (p + 1) % allImages.length);
  const prevImage = () =>
    setCurrentImage((p) => (p - 1 + allImages.length) % allImages.length);

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          propertySlug: listing.slug,
          propertyTitle: listing.title,
          type: "property-inquiry",
        }),
      });
      toast({
        title: "Inquiry Sent!",
        description: "Our team will get back to you shortly.",
      });
      setForm((f) => ({ ...f, name: "", email: "", phone: "" }));
    } catch {
      toast({
        title: "Inquiry Sent!",
        description: "Our team will get back to you shortly.",
      });
    }
  };

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "97154998811";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Hi, I'm interested in: ${listing.title}\n${typeof window !== "undefined" ? window.location.href : ""}`
  )}`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Breadcrumb */}
      <div className="pt-24 pb-4 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Properties
          </Link>
        </div>
      </div>

      {/* Image Gallery */}
      <section className="pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-3">
            {/* Main Image */}
            <div
              className="relative aspect-[16/10] rounded-2xl overflow-hidden cursor-pointer group"
              onClick={() => setLightboxOpen(true)}
            >
              <img
                src={allImages[currentImage]}
                alt={listing.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

              {/* Image counter */}
              {allImages.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg">
                  {currentImage + 1} / {allImages.length}
                </div>
              )}

              {/* Nav arrows */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Tags */}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-accent text-accent-foreground uppercase tracking-wider">
                  {listing.listingType === "Rent" ? "For Rent" : "For Sale"}
                </span>
                {listing.propertyType && (
                  <span className="text-[11px] font-medium px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-sm text-white">
                    {listing.propertyType}
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Grid (desktop) */}
            {allImages.length > 1 && (
              <div className="hidden lg:grid grid-cols-2 gap-3 auto-rows-min">
                {allImages.slice(0, 4).map((img, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setCurrentImage(i);
                    }}
                    className={`relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer group ${
                      currentImage === i
                        ? "ring-2 ring-primary"
                        : "hover:opacity-90"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${listing.title} ${i + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {i === 3 && allImages.length > 4 && (
                      <div
                        className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightboxOpen(true);
                        }}
                      >
                        <span className="text-white font-semibold text-sm">
                          +{allImages.length - 4} more
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mobile thumbnail strip */}
          {allImages.length > 1 && (
            <div className="flex lg:hidden gap-2 mt-3 overflow-x-auto pb-2">
              {allImages.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setCurrentImage(i)}
                  className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden cursor-pointer ${
                    currentImage === i
                      ? "ring-2 ring-primary"
                      : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">
            {/* Left — Details */}
            <div>
              {/* Title & Location */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 leading-snug">
                  {listing.title}
                </h1>
                {(listing.community || listing.address) && (
                  <p className="flex items-center gap-1.5 text-muted-foreground mb-6">
                    <MapPin className="h-4 w-4 text-primary" />
                    {listing.address ||
                      `${listing.community}${listing.areas?.[0] ? `, ${listing.areas?.[0]}` : ""}${listing.city ? `, ${listing.city}` : ""}`}
                  </p>
                )}

                {/* Price */}
                <div className="mb-8">
                  <p className="text-3xl font-bold text-primary">
                    {formatPrice(listing.price, listing.currency)}
                  </p>
                  {listing.listingType === "Rent" && (
                    <span className="text-sm text-muted-foreground">
                      / year
                    </span>
                  )}
                </div>

                {/* Key Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                  {listing.bedrooms != null && (
                    <div className="bg-card rounded-xl p-4 border border-border/50 text-center">
                      <BedDouble className="h-5 w-5 text-primary mx-auto mb-2" />
                      <p className="text-lg font-bold text-foreground">
                        {listing.bedrooms}
                      </p>
                      <p className="text-xs text-muted-foreground">Bedrooms</p>
                    </div>
                  )}
                  {listing.bathrooms != null && (
                    <div className="bg-card rounded-xl p-4 border border-border/50 text-center">
                      <Bath className="h-5 w-5 text-primary mx-auto mb-2" />
                      <p className="text-lg font-bold text-foreground">
                        {listing.bathrooms}
                      </p>
                      <p className="text-xs text-muted-foreground">Bathrooms</p>
                    </div>
                  )}
                  {listing.size != null && (
                    <div className="bg-card rounded-xl p-4 border border-border/50 text-center">
                      <Maximize className="h-5 w-5 text-primary mx-auto mb-2" />
                      <p className="text-lg font-bold text-foreground">
                        {listing.size.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {listing.sizeUnit || "sqft"}
                      </p>
                    </div>
                  )}
                  {listing.propertyType && (
                    <div className="bg-card rounded-xl p-4 border border-border/50 text-center">
                      <Home className="h-5 w-5 text-primary mx-auto mb-2" />
                      <p className="text-sm font-bold text-foreground">
                        {listing.propertyType}
                      </p>
                      <p className="text-xs text-muted-foreground">Type</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Description */}
              {listing.cleanDescription && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-10"
                >
                  <h2 className="text-xl font-bold text-foreground mb-4">
                    Description
                  </h2>
                  <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
                    {listing.cleanDescription
                      .split(/\n\n|\. (?=[A-Z])/)
                      .filter(Boolean)
                      .map((para, i) => (
                        <p key={i} className="mb-3">
                          {para.trim().endsWith(".") ? para.trim() : `${para.trim()}.`}
                        </p>
                      ))}
                  </div>
                </motion.div>
              )}

              {/* Property Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mb-10"
              >
                <h2 className="text-xl font-bold text-foreground mb-4">
                  Property Details
                </h2>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8 bg-card rounded-xl p-6 border border-border/50">
                  {listing.propertyId && (
                    <>
                      <span className="text-sm text-muted-foreground">
                        Reference
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {listing.propertyId}
                      </span>
                    </>
                  )}
                  <span className="text-sm text-muted-foreground">Type</span>
                  <span className="text-sm font-medium text-foreground">
                    {listing.listingType === "Rent" ? "For Rent" : "For Sale"}
                  </span>
                  {listing.propertyType && (
                    <>
                      <span className="text-sm text-muted-foreground">
                        Property
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {listing.propertyType}
                      </span>
                    </>
                  )}
                  {listing.community && (
                    <>
                      <span className="text-sm text-muted-foreground">
                        Community
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {listing.community}
                      </span>
                    </>
                  )}
                  {listing.areas?.[0] && (
                    <>
                      <span className="text-sm text-muted-foreground">
                        Area
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {listing.areas?.[0]}
                      </span>
                    </>
                  )}
                  {listing.city && (
                    <>
                      <span className="text-sm text-muted-foreground">
                        City
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {listing.city}
                      </span>
                    </>
                  )}
                </div>
              </motion.div>

              {/* Amenities */}
              {listing.features && listing.features.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-10"
                >
                  <h2 className="text-xl font-bold text-foreground mb-4">
                    Features
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {listing.features.map((a, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2.5 bg-card rounded-xl px-4 py-3 border border-border/50"
                      >
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm text-foreground">{a}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Map */}
              {listing.latitude &&
                listing.longitude &&
                listing.latitude !== 0 &&
                listing.longitude !== 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="mb-10"
                  >
                    <h2 className="text-xl font-bold text-foreground mb-4">
                      Location
                    </h2>
                    <div className="rounded-xl overflow-hidden border border-border/50 aspect-[16/9]">
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

            {/* Right — Contact Sidebar */}
            <div className="lg:sticky lg:top-24 space-y-6 self-start">
              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm"
              >
                <p className="text-lg font-bold text-foreground mb-1">
                  Interested in this property?
                </p>
                <p className="text-sm text-muted-foreground mb-5">
                  Get in touch with our team for viewings & more details.
                </p>

                <div className="space-y-3 mb-5">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] hover:bg-[#22c55e] text-white rounded-xl font-semibold text-sm transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                  <a
                    href="tel:+97154998811"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold text-sm transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    Call +971 54 998 8811
                  </a>
                  <a
                    href="mailto:info@binayah.com"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-card hover:bg-muted text-foreground border border-border rounded-xl font-semibold text-sm transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    Email Us
                  </a>
                </div>
              </motion.div>

              {/* Inquiry Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm"
              >
                <p className="text-lg font-bold text-foreground mb-4">
                  Send an Inquiry
                </p>
                <form onSubmit={handleInquiry} className="space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <textarea
                    rows={3}
                    value={form.message}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, message: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                  <button
                    type="submit"
                    className="w-full py-3 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Send Inquiry
                  </button>
                </form>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Similar Listings */}
      {similarListings.length > 0 && (
        <section className="py-20 bg-card">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl font-bold text-foreground mb-8">
              Similar Properties
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarListings.map((l, i) => (
                <motion.div
                  key={l._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    href={`/property/${l.slug}`}
                    className="group block bg-background rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-border/50 hover:border-primary/20"
                  >
                    <div className="relative overflow-hidden aspect-[4/3]">
                      <img
                        src={
                          l.featuredImage ||
                          l.images?.[0] ||
                          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600"
                        }
                        alt={l.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                      <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-accent text-accent-foreground uppercase tracking-wider">
                        {l.listingType === "Rent" ? "For Rent" : "For Sale"}
                      </span>
                    </div>
                    <div className="p-5">
                      {l.community && (
                        <p className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                          <MapPin className="h-3 w-3" /> {l.community}
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
                            {l.bedrooms} Bed
                          </span>
                        )}
                        {l.bathrooms != null && (
                          <span className="flex items-center gap-1">
                            <Bath className="h-3 w-3" />
                            {l.bathrooms} Bath
                          </span>
                        )}
                        {l.size != null && (
                          <span className="flex items-center gap-1">
                            <Maximize className="h-3 w-3" />
                            {l.size.toLocaleString()} {l.sizeUnit || "sqft"}
                          </span>
                        )}
                      </div>
                      <div className="border-t border-border pt-3">
                        <p className="text-sm font-bold text-primary">
                          {formatPrice(l.price, l.currency)}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lightbox */}
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

            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <img
              src={allImages[currentImage]}
              alt={listing.title}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            <div className="absolute bottom-6 text-white/60 text-sm">
              {currentImage + 1} / {allImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
