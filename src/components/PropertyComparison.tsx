"use client";

import { useState, useEffect } from "react";
import { X, Plus, ArrowLeftRight, BedDouble, Bath, Maximize, MapPin, Building2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCompare } from "./PropertyActions";
import { useFavorites } from "@/context/FavoritesContext";
import { apiUrl } from "@/lib/api";
import { formatPropertyTypeLabel } from "@/lib/property-types";
import { useTranslations } from "next-intl";

interface Property {
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
  amenities?: string[];
  parking?: number;
  furnishing?: string;
}

function formatPrice(price?: number, currency = "AED") {
  if (!price) return "Price on request";
  return `${currency} ${new Intl.NumberFormat("en-AE").format(price)}`;
}

export default function PropertyComparison() {
  const t = useTranslations("propertyComparison");
  const tProp = useTranslations("propertyDetail");
  const { ids, toggle, clear } = useCompare();
  const { ids: favIds } = useFavorites();
  const [properties, setProperties] = useState<Property[]>([]);
  const [open, setOpen] = useState(false);
  const [favProperties, setFavProperties] = useState<Property[]>([]);

  useEffect(() => {
    if (ids.length === 0) {
      setProperties([]);
      setOpen(false);
      return;
    }
    const fetchProperties = async () => {
      const results: Property[] = [];
      for (const id of ids) {
        try {
          const res = await fetch(apiUrl(`/api/listings/${id}`));
          if (res.ok) {
            const data = await res.json();
            results.push(data?.listing ?? data);
          }
        } catch {
          /* skip */
        }
      }
      setProperties(results);
    };
    fetchProperties();
  }, [ids]);

  // Fetch favorites not already in compare
  useEffect(() => {
    const favNotInCompare = favIds.filter(id => !ids.includes(id));
    if (favNotInCompare.length === 0) {
      setFavProperties([]);
      return;
    }
    const fetchFavs = async () => {
      const results: Property[] = [];
      for (const id of favNotInCompare.slice(0, 6)) {
        try {
          const res = await fetch(apiUrl(`/api/listings/${id}`));
          if (res.ok) {
            const data = await res.json();
            results.push(data?.listing ?? data);
          }
        } catch {
          /* skip */
        }
      }
      setFavProperties(results);
    };
    fetchFavs();
  }, [favIds, ids]);

  if (ids.length === 0) return null;

  const rows: { label: string; icon: React.ReactNode; key: string }[] = [
    { label: t("price"), icon: null, key: "priceFormatted" },
    { label: t("type"), icon: <Building2 className="h-3.5 w-3.5" />, key: "propertyType" },
    { label: t("bedrooms"), icon: <BedDouble className="h-3.5 w-3.5" />, key: "bedrooms" },
    { label: t("bathrooms"), icon: <Bath className="h-3.5 w-3.5" />, key: "bathrooms" },
    { label: t("area"), icon: <Maximize className="h-3.5 w-3.5" />, key: "size" },
    { label: t("community"), icon: <MapPin className="h-3.5 w-3.5" />, key: "community" },
    { label: "Furnishing", icon: null, key: "furnishing" },
    { label: "Parking", icon: null, key: "parking" },
  ];

  const getValue = (p: Property, key: string): string => {
    if (key === "priceFormatted") return formatPrice(p.price, p.currency);
    if (key === "size") return p.size ? `${new Intl.NumberFormat("en-AE").format(p.size)} ${p.sizeUnit || "sqft"}` : "-";
    if (key === "propertyType") return p.propertyType ? formatPropertyTypeLabel(p.propertyType, p.propertyType) : "-";
    const val = (p as unknown as Record<string, unknown>)[key];
    if (val == null) return "-";
    return String(val);
  };

  const canAddMore = properties.length < 3;
  const favNotInCompare = favIds.filter(id => !ids.includes(id));

  return (
    <>
      {/* Floating bar — sits above sticky mobile CTA (which is ~60px tall) */}
      {!open && (
        <div className="fixed bottom-[72px] sm:bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom">
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-full text-white text-sm font-semibold shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all"
            style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
          >
            <ArrowLeftRight className="h-4 w-4" />
            {t("compareCount")} ({ids.length})
          </button>
        </div>
      )}

      {/* Comparison modal */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-6" onClick={() => setOpen(false)}>
          <div className="bg-background w-full max-w-4xl max-h-[85vh] rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
              <div>
                <h3 className="text-lg font-bold text-foreground">{t("title")}</h3>
                <p className="text-xs text-muted-foreground">
                  {t("selectedCount", { count: ids.length })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { clear(); setOpen(false); }}
                  className="text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 border border-border rounded-lg transition-colors"
                >
                  {t("clear")}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-auto flex-1 p-4 sm:p-6">
              {properties.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ArrowLeftRight className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">{t("loading")}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px]">
                    <thead>
                      <tr>
                        <th className="text-left text-xs text-muted-foreground font-normal p-2 w-28" />
                        {properties.map((p) => (
                          <th key={p._id} className="p-2 text-center">
                            <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-muted">
                              {p.featuredImage ? (
                                <Image src={p.featuredImage} alt={p.title} fill className="object-cover" sizes="200px" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Building2 className="h-8 w-8 text-muted-foreground/30" />
                                </div>
                              )}
                            </div>
                            <Link href={`/property/${p.slug}`} className="text-sm font-medium text-foreground line-clamp-2 hover:text-primary transition-colors">
                              {p.title}
                            </Link>
                            <button
                              onClick={() => toggle(p._id)}
                              className="mt-1 text-[10px] text-red-400 hover:text-red-500 transition-colors"
                            >
                              {t("remove")}
                            </button>
                          </th>
                        ))}
                        {canAddMore && (
                          <th className="p-2 text-center align-top">
                            {favNotInCompare.length === 0 ? (
                              <div className="flex flex-col items-center gap-2">
                                <div className="aspect-[4/3] w-full rounded-xl border-2 border-dashed border-border flex items-center justify-center mb-1 min-h-[80px]">
                                  <Plus className="h-6 w-6 text-muted-foreground/30" />
                                </div>
                                <p className="text-xs text-muted-foreground">{tProp("saveFirstToCompare")}</p>
                                <Link href="/buy" className="text-xs font-semibold text-primary hover:underline">
                                  {tProp("browseProperties")} →
                                </Link>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-2">
                                <p className="text-xs text-muted-foreground mb-1">{t("addProperty")}</p>
                                <div className="flex flex-col gap-1.5 max-h-[180px] overflow-y-auto">
                                  {favProperties.map((fp) => (
                                    <button
                                      key={fp._id}
                                      onClick={() => toggle(fp._id)}
                                      className="flex items-center gap-2 p-2 rounded-xl border border-border/50 hover:border-primary/40 hover:bg-muted/30 transition-all text-left"
                                    >
                                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                        {fp.featuredImage ? (
                                          <img src={fp.featuredImage} alt={fp.title} className="w-full h-full object-cover" />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center">
                                            <Building2 className="h-4 w-4 text-muted-foreground/30" />
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-foreground line-clamp-2 leading-snug">{fp.title}</p>
                                        {fp.price && (
                                          <p className="text-[10px] text-primary font-semibold mt-0.5">
                                            {fp.currency || "AED"} {new Intl.NumberFormat("en-AE").format(fp.price)}
                                          </p>
                                        )}
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.key} className="border-t border-border/50">
                          <td className="p-3 text-xs text-muted-foreground font-medium">
                            <span className="flex items-center gap-1.5">
                              {row.icon}
                              {row.label}
                            </span>
                          </td>
                          {properties.map((p) => (
                            <td key={p._id} className="p-3 text-sm text-foreground text-center font-medium">
                              {getValue(p, row.key)}
                            </td>
                          ))}
                          {canAddMore && <td className="p-3" />}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
