"use client";

import { apiUrl } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { CardActions } from "@/components/PropertyActions";
import PropertyComparison from "@/components/PropertyComparison";
import { motion } from "framer-motion";
import { BedDouble, MapPin, Loader2, Tag } from "lucide-react";
import Link from "next/link";
import ImageWithFallback from "@/components/ImageWithFallback";
import { useEffect, useRef, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useInfiniteQuery } from "@tanstack/react-query";

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
  const t = useTranslations("rent");
  const loaderRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["listings", listingType],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await fetch(
        apiUrl(`/api/listings?listingType=${listingType}&limit=${BATCH_SIZE}&skip=${pageParam}`)
      );
      if (!res.ok) throw new Error("fetch failed");
      return res.json() as Promise<Listing[]>;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.flat().length;
      if (loaded >= totalCount) return undefined;
      if (lastPage.length === 0) return undefined;
      return loaded;
    },
    initialData: { pages: [initialListings], pageParams: [0] },
    staleTime: 60 * 1000,
  });

  const listings = useMemo(() => data?.pages.flat() ?? initialListings, [data, initialListings]);

  // Stable observer — fires fetchNextPage when sentinel enters viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "400px" }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

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
        style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
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
              {listingType === "Rent" ? t("rentalsLabel") : t("secondaryMarketLabel")}
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              {title.split(" ").slice(0, -1).join(" ")}{" "}
              <span className="italic font-light">{title.split(" ").slice(-1)}</span>
            </h1>
            <p className="text-primary-foreground/70 max-w-2xl text-lg">
              {t("subtitleWithCount", { subtitle, count: totalCount })}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {listings.length === 0 ? (
            <p className="text-center text-muted-foreground py-20">{t("noListings")}</p>
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
                        src={l.featuredImage || l.imageGallery?.[0] || "/assets/amenities-placeholder.webp"}
                        alt={l.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-accent text-accent-foreground uppercase tracking-wider">
                        {l.listingType === "Rent" ? t("forRent") : t("forSale")}
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
                            <BedDouble className="h-3 w-3" /> {`${l.bedrooms} ${t("bed")}`}
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
                          {l.listingType === "Rent" && <span className="text-xs font-normal text-muted-foreground">{" "}{t("perYear")}</span>}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          <div ref={loaderRef} className="mt-12 text-center">
            {isFetchingNextPage && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">{t("loadingMore")}</span>
              </div>
            )}
            {hasNextPage && !isFetchingNextPage && (
              <button
                onClick={() => fetchNextPage()}
                className="px-8 py-3 text-white rounded-xl font-semibold transition-all hover:shadow-lg"
                style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
              >
                {t("loadMore")}
              </button>
            )}
            {!hasNextPage && listings.length > BATCH_SIZE && (
              <p className="text-sm text-muted-foreground">
                {t("showingAll", { count: listings.length })}
              </p>
            )}
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
      <PropertyComparison />
    </div>
  );
}
