"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ImageWithFallback from "@/components/ImageWithFallback";
import { formatProjectPrice } from "@/lib/formatPrice";
import { motion } from "framer-motion";
import { Building2, CheckCircle2, ChevronRight, MapPin, Building, Wallet } from "lucide-react";
import Link from "next/link";
import type { CommunityInfoPage } from "@/lib/communityScraper";

interface Props {
  community: Omit<CommunityInfoPage, "scrapedAt">;
  locale: string;
}

export default function CommunityInfoDetailClient({ community, locale }: Props) {
  const {
    name,
    location,
    description,
    developerName,
    heroImage,
    amenities,
    priceRange,
    slug,
  } = community;

  const hasBody = description || location || developerName || priceRange;
  const hasAmenities = amenities && amenities.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ------------------------------------------------------------------ */}
      {/* HERO                                                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative h-[50vh] sm:h-[65vh] lg:h-[70vh] overflow-hidden">
        {/* Background: scraped hero image or brand-green gradient fallback */}
        {heroImage ? (
          <>
            <ImageWithFallback
              src={heroImage}
              alt={name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/60 to-foreground/30" />
          </>
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
          >
            <Building2 className="w-24 h-24 text-white/20" />
          </div>
        )}

        {/* Hero content */}
        <div className="relative h-full flex flex-col justify-end max-w-7xl mx-auto px-4 sm:px-6 pb-10 sm:pb-14">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-white/60 mb-5">
            <Link href={`/${locale}`} className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href={`/${locale}/communities`} className="hover:text-white transition-colors">
              Communities
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white">{name}</span>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Badge — the ONE signal that reframes this page as reference */}
            <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full mb-4 bg-accent text-accent-foreground">
              Community Information
            </span>

            {/* Community name */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-3">
              {name}
            </h1>

            {/* Location line — only if scraped */}
            {location && (
              <p className="flex items-center gap-2 text-white/70 text-lg">
                <MapPin className="h-5 w-5 flex-shrink-0" />
                {location}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* BODY SECTIONS                                                       */}
      {/* ------------------------------------------------------------------ */}
      {hasBody && (
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left column — description */}
              {description && (
                <motion.div
                  className="lg:col-span-2"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0 * 0.08 }}
                >
                  <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border/50 h-full">
                    {/* Eyebrow rule */}
                    <div className="h-[2px] w-8 rounded-full bg-gradient-to-r from-accent to-accent/60 mb-3" />
                    <p className="text-xs uppercase tracking-[0.3em] text-accent font-semibold mb-2">
                      About
                    </p>
                    <h2 className="text-2xl font-bold text-foreground mb-4">
                      {name}
                    </h2>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      {description}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Right sidebar — location, developer, price range */}
              {(location || developerName || priceRange) && (
                <motion.div
                  className={description ? "lg:col-span-1" : "lg:col-span-3"}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1 * 0.08 }}
                >
                  <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border/50 h-full space-y-6">
                    <div className="h-[2px] w-8 rounded-full bg-gradient-to-r from-accent to-accent/60" />

                    {location && (
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-accent font-semibold mb-2">
                          Location
                        </p>
                        <p className="flex items-center gap-2 text-foreground font-medium">
                          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          {location}
                        </p>
                      </div>
                    )}

                    {developerName && (
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-accent font-semibold mb-2">
                          Developer
                        </p>
                        <p className="flex items-center gap-2 text-foreground font-medium">
                          <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          {developerName}
                        </p>
                      </div>
                    )}

                    {priceRange && (
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-accent font-semibold mb-2">
                          Price Range
                        </p>
                        <p className="flex items-center gap-2 text-foreground font-medium">
                          <Wallet className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          {formatProjectPrice(priceRange.min, priceRange.currency)} &ndash;{" "}
                          {formatProjectPrice(priceRange.max, priceRange.currency)}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* AMENITIES (only if present)                                         */}
      {/* ------------------------------------------------------------------ */}
      {hasAmenities && (
        <section className="pb-12 sm:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 2 * 0.08 }}
            >
              <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border/50">
                <div className="h-[2px] w-8 rounded-full bg-gradient-to-r from-accent to-accent/60 mb-3" />
                <p className="text-xs uppercase tracking-[0.3em] text-accent font-semibold mb-2">
                  What&apos;s nearby
                </p>
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Amenities &amp; Features
                </h2>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {amenities!.map((amenity, i) => (
                    <motion.span
                      key={`${amenity}-${i}`}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.04 }}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-sm text-foreground"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-accent flex-shrink-0" />
                      {amenity}
                    </motion.span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* BOTTOM CTA — brand-green banner                                     */}
      {/* ------------------------------------------------------------------ */}
      <section
        className="py-16 sm:py-20"
        style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-accent font-semibold mb-4">
            Looking for a home here?
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Interested in similar properties?
          </h2>
          <p className="text-white/70 mb-8 text-base">
            Browse Binayah&apos;s verified listings nearby.
          </p>
          <Link
            href={location ? `/search?location=${encodeURIComponent(location)}` : "/properties"}
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-2xl"
            style={{
              background: "linear-gradient(to right, #D4A847, #B8922F)",
              boxShadow: "0 4px 20px rgba(212,168,71,0.3)",
            }}
          >
            Browse Properties
          </Link>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
