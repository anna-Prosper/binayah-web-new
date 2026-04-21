"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Heart, X, Trash2, ExternalLink, Building2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useFavorites } from "./PropertyActions";

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

export default function FavoritesDrawer() {
  const { ids, toggle, clear } = useFavorites();
  const [open, setOpen] = useState(false);

  // Allow other components to open the drawer via a custom window event
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-favorites-drawer", handler);
    return () => window.removeEventListener("open-favorites-drawer", handler);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["favorites-hydrate", ids],
    queryFn: async () => {
      if (ids.length === 0) return { properties: [], stale: [] };
      const res = await fetch("/api/favorites/hydrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error("hydrate failed");
      return res.json() as Promise<{ properties: FavProperty[]; stale: string[] }>;
    },
    enabled: open && ids.length > 0,
    staleTime: 2 * 60 * 1000,
  });

  const properties = data?.properties ?? [];
  const loading = isLoading;

  // Remove stale favorites (404 from both listing + project endpoints)
  useEffect(() => {
    data?.stale?.forEach((id) => toggle(id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.stale]);

  return (
    <>

      {/* Drawer backdrop */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setOpen(false)}>
          {/* Drawer panel */}
          <div
            className="absolute right-0 top-0 h-full w-full max-w-md bg-background shadow-2xl flex flex-col animate-in slide-in-from-right duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500 fill-current" />
                <h2 className="text-lg font-bold text-foreground">
                  Saved Properties
                </h2>
                <span className="text-xs text-muted-foreground">({ids.length})</span>
              </div>
              <div className="flex items-center gap-2">
                {ids.length > 0 && (
                  <button
                    onClick={clear}
                    className="text-xs text-muted-foreground hover:text-red-500 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" /> Clear all
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {ids.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Heart className="h-12 w-12 text-muted-foreground/20 mb-4" />
                  <p className="text-sm font-medium text-foreground mb-1">No saved properties</p>
                  <p className="text-xs text-muted-foreground">
                    Tap the heart icon on any property to save it here
                  </p>
                </div>
              ) : loading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {properties.map((p) => {
                    const displayTitle = p.title || p.name || "Property";
                    const displayPrice = formatPrice(p.price || p.startingPrice, p.currency);
                    const image = p.featuredImage || p.imageGallery?.[0];
                    const href = p.title ? `/property/${p.slug}` : `/project/${p.slug}`;

                    return (
                      <div
                        key={p._id}
                        className="flex gap-3 bg-card rounded-xl border border-border/50 p-3 group"
                      >
                        {/* Thumbnail */}
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                          {image ? (
                            <Image
                              src={image}
                              alt={displayTitle}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Building2 className="h-6 w-6 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <Link
                            href={href}
                            onClick={() => setOpen(false)}
                            className="text-sm font-medium text-foreground hover:text-primary transition-colors line-clamp-2 leading-tight"
                          >
                            {displayTitle}
                          </Link>
                          {p.community && (
                            <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                              {p.community}
                            </p>
                          )}
                          <p className="text-xs font-bold text-primary mt-1">{displayPrice}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col items-end gap-1">
                          <button
                            onClick={() => toggle(p.slug)}
                            className="w-7 h-7 rounded-lg border border-border flex items-center justify-center hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all text-muted-foreground"
                            title="Remove from favorites"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <Link
                            href={href}
                            onClick={() => setOpen(false)}
                            className="w-7 h-7 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
                            title="View details"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer CTA */}
            {ids.length > 0 && (
              <div className="p-4 border-t border-border">
                <a
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "971549988811"}?text=${encodeURIComponent(`Hi, I'd like to inquire about ${ids.length} saved properties on your website.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] hover:bg-[#22c55e] text-white rounded-xl font-semibold text-sm transition-colors"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Inquire About Saved Properties
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
