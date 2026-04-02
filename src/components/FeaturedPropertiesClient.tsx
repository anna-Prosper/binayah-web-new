"use client";

import { motion } from "framer-motion";
import { Bed, Maximize, MapPin, ArrowUpRight, Building } from "lucide-react";
import Link from "next/link";

interface Project {
  _id: string;
  name: string;
  slug: string;
  developerName?: string;
  startingPrice?: number | null;
  community?: string;
  city?: string;
  status?: string;
  propertyType?: string;
  unitTypes?: string[];
  unitSizeMin?: number | null;
  unitSizeMax?: number | null;
  imageGallery?: string[];
  currency?: string;
}

const FeaturedPropertiesClient = ({ listings = [] }: { listings?: Project[] }) => {
  const fmt = (p: Project) => {
    if (!p.startingPrice) return "Price on request";
    const cur = p.currency || "AED";
    return p.startingPrice >= 1_000_000
      ? `${cur} ${(p.startingPrice / 1_000_000).toFixed(1)}M`
      : `${cur} ${(p.startingPrice / 1_000).toFixed(0)}K`;
  };

  return (
    <section id="sale" className="py-12 sm:py-24 bg-background scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-6 sm:mb-14 gap-3">
          <div>
            <motion.div initial={{ width: 0 }} whileInView={{ width: "3rem" }} viewport={{ once: true }} className="h-[2px] mb-4 sm:mb-6" style={{ background: "linear-gradient(90deg, #D4A847, #B8922F)" }} />
            <p className="font-semibold tracking-[0.4em] uppercase text-[10px] sm:text-xs mb-2 sm:mb-4" style={{ color: "#D4A847" }}>Featured Listings</p>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-foreground">
              Handpicked <span className="italic font-light">Properties</span>
            </h2>
          </div>
          <Link href="/off-plan" className="group flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all">
            View All Properties <ArrowUpRight className="h-4 w-4" />
          </Link>
        </motion.div>

        {/* Mobile: swipable */}
        <div className="sm:hidden -mx-4 px-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide flex gap-3 pb-2">
          {listings.map((p, i) => (
            <motion.div key={p._id} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="flex-shrink-0 w-[260px] snap-start">
              <Link href={`/project/${p.slug}`} className="group block bg-card rounded-xl overflow-hidden shadow-sm border border-border/50">
                <div className="relative overflow-hidden aspect-[3/2]">
                  <img src={p.imageGallery?.[0] || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600"} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                  <span className={`absolute top-2 left-2 text-[8px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide ${p.status === "Off-Plan" ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"}`}>{p.status}</span>
                </div>
                <div className="p-3">
                  <div className="flex items-center gap-1 text-muted-foreground text-[9px] mb-1 uppercase tracking-wider">
                    <MapPin className="h-2.5 w-2.5" />{p.community || p.city}
                  </div>
                  <h3 className="text-xs font-bold text-foreground mb-1 leading-snug line-clamp-1">{p.name}</h3>
                  <div className="border-t border-border pt-2 flex items-center justify-between mt-1">
                    <p className="text-xs font-bold text-primary">{fmt(p)}</p>
                    <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Desktop grid */}
        <div className="hidden sm:grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-7">
          {listings.map((p, i) => {
            const sizeRange = p.unitSizeMin && p.unitSizeMax ? `${p.unitSizeMin}–${p.unitSizeMax} sqft` : null;
            return (
              <motion.div key={p._id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.5 }}>
                <Link href={`/project/${p.slug}`} className="group flex flex-col h-full bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-border/50 hover:border-primary/20">
                  <div className="relative overflow-hidden aspect-[4/3]">
                    <img src={p.imageGallery?.[0] || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600"} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className={`absolute top-4 left-4 text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wide ${p.status === "Off-Plan" ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"}`}>{p.status}</span>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-2.5 uppercase tracking-wider">
                      <MapPin className="h-3 w-3" />{p.community || p.city}
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors leading-snug">{p.name}</h3>
                    <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5">
                      <Building className="h-3 w-3" /> {p.developerName}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-5 flex-wrap">
                      {p.unitTypes?.length ? <span className="flex items-center gap-1.5"><Bed className="h-4 w-4" />{p.unitTypes.join(", ")}</span> : null}
                      {sizeRange && <span className="flex items-center gap-1.5"><Maximize className="h-4 w-4" />{sizeRange}</span>}
                    </div>
                    <div className="border-t border-border pt-4 flex items-center justify-between mt-auto">
                      <p className="text-xl font-bold text-primary">{fmt(p)}</p>
                      <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors uppercase tracking-wider flex items-center gap-1">Details <ArrowUpRight className="h-3 w-3" /></span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedPropertiesClient;
