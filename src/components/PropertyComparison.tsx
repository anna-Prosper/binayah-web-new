"use client";

import { useState, useEffect } from "react";
import { X, Plus, ArrowLeftRight, BedDouble, Bath, Maximize, MapPin, Building2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCompare } from "./PropertyActions";
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
  const { ids, toggle, clear } = useCompare();
  const [properties, setProperties] = useState<Property[]>([]);
  const [open, setOpen] = useState(false);

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
            results.push(await res.json());
          }
        } catch {
          /* skip */
        }
      }
      setProperties(results);
    };
    fetchProperties();
  }, [ids]);

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

  return (
    <>
      {/* Floating bar */}
      {!open && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom">
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-full text-white text-sm font-medium shadow-xl"
            style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
          >
            <ArrowLeftRight className="h-4 w-4" />
            Compare ({ids.length})
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
                  {ids.length} of 3 properties selected
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
                  <p className="text-sm">Loading properties...</p>
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
                              Remove
                            </button>
                          </th>
                        ))}
                        {properties.length < 3 && (
                          <th className="p-2 text-center">
                            <div className="aspect-[4/3] rounded-xl border-2 border-dashed border-border flex items-center justify-center mb-3">
                              <Plus className="h-6 w-6 text-muted-foreground/30" />
                            </div>
                            <p className="text-xs text-muted-foreground">Add property</p>
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
                          {properties.length < 3 && <td className="p-3" />}
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
