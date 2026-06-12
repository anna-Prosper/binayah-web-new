"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Bed, Bath, Maximize, MapPin, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import ImageWithFallback from "@/components/ImageWithFallback";
import { CardActions } from "@/components/PropertyActions";
import { useTranslations } from "next-intl";
import { AedPrice } from "@/components/AedPrice";

interface SecondaryListing {
  _id: string;
  title?: string;
  name?: string;
  slug: string;
  listingType?: string;
  propertyType?: string;
  offplan?: string | number;
  completionStatus?: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  size?: number | null;
  sizeUnit?: string;
  price?: number | null;
  currency?: string;
  community?: string;
  city?: string;
  featuredImage?: string;
  imageGallery?: string[];
}


function getLabel(p: SecondaryListing): string {
  return p.title || p.name || p.slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function getImage(p: SecondaryListing): string {
  return p.featuredImage || p.imageGallery?.[0] || "/assets/amenities-placeholder.webp";
}

const FeaturedPropertiesClient = ({
  saleListings = [],
  rentalListings = [],
}: {
  saleListings?: SecondaryListing[];
  rentalListings?: SecondaryListing[];
}) => {
  const t = useTranslations("home.sections.featured");
  const tEnum = useTranslations("enums");
  const [tab, setTab] = useState<"sale" | "rent">("sale");

  const isOffPlan = (p: SecondaryListing) =>
    String(p.offplan) === "1" || p.completionStatus === "off_plan";

  const listings = (tab === "sale" ? saleListings : rentalListings).slice(0, 3);
  const viewAllHref = tab === "sale" ? "/buy" : "/rent";

  return (
    <section id="sale" className="py-8 sm:py-20 bg-background scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-4 sm:mb-10 gap-3"
        >
          <div>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "3rem" }}
              viewport={{ once: true }}
              className="h-[2px] mb-4 sm:mb-6"
              style={{ background: "linear-gradient(90deg, #D4A847, #B8922F)" }}
            />
            <p className="font-semibold tracking-[0.4em] uppercase text-[10px] sm:text-xs mb-2 sm:mb-4" style={{ color: "#D4A847" }}>
              {t("label")}
            </p>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-foreground">
              {t("title")} <span className="font-light">{t("titleItalic")}</span>
            </h2>

            {/* Tab pills */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setTab("sale")}
                className={`px-4 py-2 rounded-full text-sm font-semibold min-h-[44px] flex items-center transition-all ${
                  tab === "sale"
                    ? "text-white"
                    : "border border-border text-muted-foreground bg-background hover:bg-muted"
                }`}
                style={tab === "sale" ? { background: "linear-gradient(135deg, #D4A847, #B8922F)" } : {}}
              >
                {t("forSale")}
              </button>
              <button
                onClick={() => setTab("rent")}
                className={`px-4 py-2 rounded-full text-sm font-semibold min-h-[44px] flex items-center transition-all ${
                  tab === "rent"
                    ? "text-white"
                    : "border border-border text-muted-foreground bg-background hover:bg-muted"
                }`}
                style={tab === "rent" ? { background: "linear-gradient(135deg, #D4A847, #B8922F)" } : {}}
              >
                {t("forRent")}
              </button>
            </div>
          </div>
          <Link href={viewAllHref} className="group flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all">
            {t("viewAll")} <ArrowUpRight className="h-4 w-4" />
          </Link>
        </motion.div>

        {listings.length === 0 && (
          <div className="text-center py-10">
            <p className="text-muted-foreground text-sm mb-4">{t("rentEmptyText")}</p>
            <Link
              href={viewAllHref}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors min-h-[44px]"
            >
              {t("rentEmptyCta")} <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* Mobile: horizontal swipe */}
        {listings.length > 0 && (
          <div className="sm:hidden -mx-4 px-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide flex gap-3 pb-2">
            {listings.map((p, i) => (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex-shrink-0 w-[260px] snap-start"
              >
                <Link href={`/property/${p.slug}`} className="group block bg-card rounded-xl overflow-hidden shadow-sm border border-border/50">
                  <div className="relative overflow-hidden aspect-[3/2]">
                    <ImageWithFallback src={getImage(p)} alt={getLabel(p)} fill sizes="260px" priority={i === 0} className="object-cover" />
                    {isOffPlan(p) && (
                      <span className="absolute top-2 left-2 text-[8px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide text-white" style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)" }}>
                        {tEnum("offPlan")}
                      </span>
                    )}
                    {p.propertyType && (
                      <span className={`absolute top-2 ${isOffPlan(p) ? "right-2" : "left-2"} text-[8px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide text-white`} style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
                        {p.propertyType}
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="flex items-center gap-1 text-muted-foreground text-[9px] mb-1 uppercase tracking-wider">
                      <MapPin className="h-2.5 w-2.5" />{p.community || p.city}
                    </div>
                    <h3 className="text-xs font-bold text-foreground mb-1 leading-snug line-clamp-1">{getLabel(p)}</h3>
                    {(p.bedrooms != null || p.size) && (
                      <div className="flex items-center gap-2 text-[9px] text-muted-foreground mb-1">
                        {p.bedrooms != null && <span className="flex items-center gap-0.5"><Bed className="h-2.5 w-2.5" />{p.bedrooms === 0 ? "Studio" : `${p.bedrooms} BR`}</span>}
                        {p.size && <span className="flex items-center gap-0.5"><Maximize className="h-2.5 w-2.5" />{p.size} {p.sizeUnit || "sqft"}</span>}
                      </div>
                    )}
                    <div className="border-t border-border pt-2 flex items-center justify-between mt-1">
                      <p className="text-xs font-bold text-primary"><AedPrice value={p.price} currency={p.currency} /></p>
                      <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Desktop grid */}
        {listings.length > 0 && (
          <div className="hidden sm:grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-7">
            {listings.map((p, i) => (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
              >
                <Link href={`/property/${p.slug}`} className="group flex flex-col h-full bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-border/50 hover:border-primary/20">
                  <div className="relative overflow-hidden aspect-[4/3]">
                    <ImageWithFallback src={getImage(p)} alt={getLabel(p)} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    {isOffPlan(p) && (
                      <span className="absolute top-4 left-4 text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wide text-white" style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)" }}>
                        {tEnum("offPlan")}
                      </span>
                    )}
                    {p.propertyType && (
                      <span className={`absolute top-4 ${isOffPlan(p) ? "right-4" : "left-4"} text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wide text-white`} style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
                        {p.propertyType}
                      </span>
                    )}
                    <CardActions propertyId={p.slug} slug={p.slug} title={getLabel(p)} type="property" />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-2.5 uppercase tracking-wider">
                      <MapPin className="h-3 w-3" />{p.community || p.city}
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-3 group-hover:text-primary transition-colors leading-snug">{getLabel(p)}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-5 flex-wrap">
                      {p.bedrooms != null && <span className="flex items-center gap-1.5"><Bed className="h-4 w-4" />{p.bedrooms === 0 ? "Studio" : `${p.bedrooms} ${t("bed")}`}</span>}
                      {p.bathrooms != null && <span className="flex items-center gap-1.5"><Bath className="h-4 w-4" />{p.bathrooms} {t("bath")}</span>}
                      {p.size && <span className="flex items-center gap-1.5"><Maximize className="h-4 w-4" />{p.size} {p.sizeUnit || "sqft"}</span>}
                    </div>
                    <div className="border-t border-border pt-4 flex items-center justify-between mt-auto">
                      <p className="text-xl font-bold text-primary"><AedPrice value={p.price} currency={p.currency} /></p>
                      <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors uppercase tracking-wider flex items-center gap-1">
                        {t("details")} <ArrowUpRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedPropertiesClient;
