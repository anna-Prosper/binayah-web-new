"use client";

import { apiUrl } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { CardActions } from "@/components/PropertyActions";
import PropertyComparison from "@/components/PropertyComparison";
import FavoritesDrawer from "@/components/FavoritesDrawer";
import { motion } from "framer-motion";
import { BedDouble, MapPin, Loader2, Tag } from "lucide-react";
import Link from "next/link";
import ImageWithFallback from "@/components/ImageWithFallback";
import { useState, useEffect, useRef, useCallback } from "react";

interface Listing {
  _id: string;
  name: string;
  slug: string;
  listingType?: string;
  propertyType?: string;
  bedrooms?: string | number;
  bathrooms?: string | number;
  size?: number;
  sizeUnit?: string;
  price?: number;
  currency?: string;
  community?: string;
  city?: string;
  featuredImage?: string;
  imageGallery?: string[];
}

const BATCH_SIZE = 9;

export default function ListingsPageClient({
  initialListings,
  totalCount,
  listingType,
  title,
  subtitle,
}: {
  initialListings: Listing[];
  totalCount: number;
  listingType: "Rent" | "Sale";
  title: string;
  subtitle: string;
}) {
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialListings.length < totalCount);
  const loaderRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await fetch(
        apiUrl(`/api/listings?listingType=${listingType}&limit=${BATCH_SIZE}&skip=${listings.length}`)
      );
      const newListings: Listing[] = await res.json();
      if (newListings.length === 0) {
        setHasMore(false);
      } else {
        setListings((prev) => [...prev, ...newListings]);
        if (listings.length + newListings.length >= totalCount) setHasMore(false);
      }
    } catch {
      console.error("Failed to load more listings");
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, listings.length, totalCount, listingType]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && hasMore && !loading) loadMore(); },
      { rootMargin: "600px" }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loadMore, hasMore, loading]);

  const formatPrice = (listing: Listing) => {
    if (!listing.price) return "Price on request";
    const p = listing.price;
    if (p >= 1_000_000) return `AED ${(p / 1_000_000).toFixed(1)}M`;
    if (p >= 1_000) return `AED ${(p / 1_000).toFixed(0)}K`;
    return `AED ${p.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section
        className="relative pt-32 pb-20 text-white overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0B3D2E 0%, #145C3F 40%, #1A7A5A 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-accent font-semibold tracking-[0.4em] uppercase text-xs mb-4">
              {listingType === "Rent" ? "Rentals" : "Secondary Market"}
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              {title.split(" ").slice(0, -1).join(" ")}{" "}
              <span className="italic font-light">{title.split(" ").slice(-1)}</span>
            </h1>
            <p className="text-primary-foreground/70 max-w-2xl text-lg">
              {subtitle} — {totalCount} properties available.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {listings.length === 0 ? (
            <p className="text-center text-muted-foreground py-20">No listings found.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((l, i) => (
                <motion.div
                  key={l._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(i * 0.05, 0.3) }}
                  className="h-full"
                >
                  <Link
                    href={`/property/${l.slug}`}
                    className="group flex flex-col h-full bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-border/50 hover:border-primary/20"
                  >
                    <div className="relative overflow-hidden aspect-[4/3]">
                      <ImageWithFallback
                        src={l.featuredImage || l.imageGallery?.[0] || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600"}
                        alt={l.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-accent text-accent-foreground uppercase tracking-wider">
                        {l.listingType === "Rent" ? "For Rent" : "For Sale"}
                      </span>
                      <CardActions propertyId={l.slug} slug={l.slug} title={l.name} />
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                        {l.community && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {l.community}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-foreground mb-3 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                        {l.name}
                      </h3>
                      <div className="flex gap-3 text-xs text-muted-foreground mb-3">
                        {l.bedrooms && (
                          <span className="flex items-center gap-1">
                            <BedDouble className="h-3 w-3" /> {l.bedrooms} Bed
                          </span>
                        )}
                        {l.size && (
                          <span className="flex items-center gap-1">
                            <Tag className="h-3 w-3" /> {l.size.toLocaleString()} {l.sizeUnit || "sqft"}
                          </span>
                        )}
                      </div>
                      <div className="mt-auto border-t border-border pt-3">
                        <p className="text-sm font-bold text-primary">
                          {formatPrice(l)}
                          {l.listingType === "Rent" && <span className="text-xs font-normal text-muted-foreground"> / year</span>}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          <div ref={loaderRef} className="mt-12 text-center">
            {loading && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Loading more...</span>
              </div>
            )}
            {hasMore && !loading && (
              <button
                onClick={loadMore}
                className="px-8 py-3 text-white rounded-xl font-semibold transition-all hover:shadow-lg"
                style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
              >
                Load More
              </button>
            )}
            {!hasMore && listings.length > BATCH_SIZE && (
              <p className="text-sm text-muted-foreground">
                Showing all {listings.length} properties
              </p>
            )}
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
      <PropertyComparison />
      <FavoritesDrawer />
    </div>
  );
}
