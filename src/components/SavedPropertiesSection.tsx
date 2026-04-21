"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Heart, X, Building2, MapPin, Bed } from "lucide-react";
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
    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-muted" />
      <div className="p-5 space-y-2.5">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="h-5 bg-muted rounded w-1/3 mt-3" />
      </div>
    </div>
  );
}

interface SavedPropertiesSectionProps {
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
    const storedId = ids.find((id) => id === p._id || id === p.slug) ?? p.slug;
    toggle(storedId);
    if (onCountChange) onCountChange(ids.length - 1);
  };

  if (!isLoading && ids.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-5">
          <Heart className="h-7 w-7 text-muted-foreground/30" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No saved properties</h3>
        <p className="text-sm text-muted-foreground mb-7 max-w-xs leading-relaxed">
          Tap the heart icon on any property to save it here for quick access.
        </p>
        <Link
          href="/search"
          className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-xl hover:-translate-y-0.5"
          style={{ background: "linear-gradient(to right, #D4A847, #B8922F)", boxShadow: "0 4px 15px rgba(212,168,71,0.3)" }}
        >
          Browse Properties
        </Link>
      </div>
    );
  }

  if (isLoading && ids.length > 0) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

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
        const isProject = !p.title;
        const isForRent = p.listingType?.toLowerCase().includes("rent");

        return (
          <div
            key={p._id}
            className="group relative bg-card border border-border/60 rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            {/* Image — 4:3 */}
            <Link href={href} className="block relative aspect-[4/3] overflow-hidden bg-muted">
              {image ? (
                <>
                  <Image
                    src={image}
                    alt={displayTitle}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Building2 className="h-12 w-12 text-muted-foreground/20" />
                </div>
              )}

              {/* Type badge — top left */}
              {(isProject || isForRent) && (
                <span
                  className={`absolute top-3 left-3 text-[10px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm border ${
                    isProject
                      ? "bg-[#0B3D2E]/80 text-white border-white/20"
                      : "bg-blue-600/80 text-white border-blue-400/30"
                  }`}
                >
                  {isProject ? "Off-Plan" : "For Rent"}
                </span>
              )}

              {/* Bedrooms — bottom left over gradient */}
              {p.bedrooms && (
                <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[10px] font-medium text-white/90">
                  <Bed className="h-3 w-3" />
                  {p.bedrooms} bed
                </div>
              )}
            </Link>

            {/* Remove button — visible on hover */}
            <button
              onClick={() => handleRemove(p)}
              title="Remove from saved"
              aria-label="Remove from saved"
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/90 text-foreground/60 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all shadow-sm opacity-0 group-hover:opacity-100 z-10"
            >
              <X className="h-3 w-3" />
            </button>

            {/* Card body */}
            <div className="p-4">
              <Link
                href={href}
                className="text-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-2 leading-snug block mb-1.5"
              >
                {displayTitle}
              </Link>
              {p.community && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  {p.community}
                </p>
              )}
              <p className="text-base font-bold" style={{ color: "#D4A847" }}>
                {displayPrice}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
