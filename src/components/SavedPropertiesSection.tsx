"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Heart, X, Building2, MapPin, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useFavorites } from "./PropertyActions";
import { apiUrl } from "@/lib/api";

interface FavProperty {
  _id: string;
  title?: string;
  name?: string;
  slug: string;
  featuredImage?: string;
  imageGallery?: string[];
  price?: number;
  startingPrice?: number;
  currency?: string;
  community?: string;
  bedrooms?: number;
  listingType?: string;
}

function formatPrice(price?: number, currency = "AED") {
  if (!price) return "Price on request";
  if (price >= 1_000_000) return `${currency} ${(price / 1_000_000).toFixed(1)}M`;
  if (price >= 1_000) return `${currency} ${(price / 1_000).toFixed(0)}K`;
  return `${currency} ${price.toLocaleString()}`;
}

function SkeletonCard() {
  return (
    <div className="bg-card border border-border/50 rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-video bg-muted" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="h-3 bg-muted rounded w-1/3" />
      </div>
    </div>
  );
}

interface SavedPropertiesSectionProps {
  /** Called when a property is removed so the parent can decrement counters */
  onCountChange?: (newCount: number) => void;
}

export default function SavedPropertiesSection({ onCountChange }: SavedPropertiesSectionProps) {
  const { ids, toggle } = useFavorites();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["favorites-hydrate", ids],
    queryFn: async () => {
      if (ids.length === 0) return { properties: [], stale: [] };

      const res = await fetch("/api/favorites/hydrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });

      if (res.status === 401) {
        // Anonymous fallback — fetch each item from the public Fastify API
        const results = await Promise.allSettled(
          ids.map(async (id) => {
            const [listingRes, projectRes] = await Promise.allSettled([
              fetch(apiUrl(`/api/listings/${id}`)),
              fetch(apiUrl(`/api/projects/${id}`)),
            ]);
            if (listingRes.status === "fulfilled" && listingRes.value.ok) {
              return (await listingRes.value.json()) as FavProperty;
            }
            if (projectRes.status === "fulfilled" && projectRes.value.ok) {
              return (await projectRes.value.json()) as FavProperty;
            }
            return null;
          })
        );
        const properties: FavProperty[] = [];
        const stale: string[] = [];
        results.forEach((result, i) => {
          if (result.status === "fulfilled") {
            if (result.value !== null) properties.push(result.value);
            else stale.push(ids[i]);
          }
        });
        return { properties, stale };
      }

      if (!res.ok) throw new Error("hydrate failed");
      return res.json() as Promise<{ properties: FavProperty[]; stale: string[] }>;
    },
    enabled: ids.length > 0,
    staleTime: 2 * 60 * 1000,
  });

  // Auto-remove stale ids — must be in useEffect to avoid calling toggle during render
  useEffect(() => {
    data?.stale?.forEach((id) => toggle(id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.stale]);

  const properties = data?.properties ?? [];

  const handleRemove = (p: FavProperty) => {
    // Use the stored identifier (may be _id for older saves, slug for newer)
    const storedId = ids.find((id) => id === p._id || id === p.slug) ?? p.slug;
    toggle(storedId);
    if (onCountChange) onCountChange(ids.length - 1);
  };

  // Empty state
  if (!isLoading && ids.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Heart className="h-7 w-7 text-muted-foreground/40" />
        </div>
        <h3 className="font-semibold text-foreground mb-1">No saved properties</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-xs">
          Tap the heart icon on any property to save it here for easy access.
        </p>
        <Link
          href="/search"
          className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:shadow-lg hover:-translate-y-0.5"
          style={{ background: "linear-gradient(to right, #D4A847, #B8922F)", boxShadow: "0 4px 15px rgba(212,168,71,0.3)" }}
        >
          Browse Properties
        </Link>
      </div>
    );
  }

  // Loading state — 3 skeleton cards
  if (isLoading && ids.length > 0) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm font-medium text-foreground mb-1">Could not load saved properties</p>
        <p className="text-xs text-muted-foreground">Please refresh the page to try again.</p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
      {properties.map((p) => {
        const displayTitle = p.title || p.name || "Property";
        const displayPrice = formatPrice(p.price || p.startingPrice, p.currency);
        const image = p.featuredImage || p.imageGallery?.[0];
        const href = p.title ? `/property/${p.slug}` : `/project/${p.slug}`;

        return (
          <div
            key={p._id}
            className="group bg-card border border-border/50 rounded-xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            {/* Thumbnail — 16:9 */}
            <div className="relative aspect-video overflow-hidden bg-muted">
              {image ? (
                <Image
                  src={image}
                  alt={displayTitle}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Building2 className="h-10 w-10 text-muted-foreground/20" />
                </div>
              )}
              {/* Remove button overlay */}
              <button
                onClick={() => handleRemove(p)}
                title="Remove from saved"
                aria-label="Remove from saved"
                className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-white/90 text-foreground/70 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all shadow-sm opacity-0 group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>

            {/* Card body */}
            <div className="p-4">
              <Link
                href={href}
                className="text-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-2 leading-snug block mb-1"
              >
                {displayTitle}
              </Link>
              {p.community && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  {p.community}
                </p>
              )}
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/40">
                <p className="text-xs font-bold text-primary">{displayPrice}</p>
                <Link
                  href={href}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  View <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
