"use client";

import { motion } from "framer-motion";
import { BedDouble, Bath, Maximize, MapPin } from "lucide-react";
import Link from "next/link";

interface Listing {
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
  images?: string[];
}

function formatPrice(price?: number, currency = "AED") {
  if (!price) return "Price on request";
  if (price >= 1_000_000) return `${currency} ${(price / 1_000_000).toFixed(1)}M`;
  return `${currency} ${price.toLocaleString()}`;
}

export default function FeaturedPropertiesClient({ listings }: { listings: Listing[] }) {
  return (
    <section id="featured" className="py-24 bg-background scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <motion.div initial={{ width: 0 }} whileInView={{ width: "3rem" }} viewport={{ once: true }} className="h-[2px] bg-accent mb-6 mx-auto" />
          <p className="text-accent font-semibold tracking-[0.4em] uppercase text-xs mb-4">Featured</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            Handpicked <span className="italic font-light">Properties</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((l, i) => (
            <motion.div key={l._id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="h-full">
              <Link href={`/property/${l.slug}`} className="group flex flex-col h-full bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-border/50 hover:border-primary/20">
                <div className="relative overflow-hidden aspect-[4/3]">
                  <img src={l.featuredImage || l.images?.[0] || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600"} alt={l.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-accent text-accent-foreground uppercase tracking-wider">
                    {l.listingType === "Rent" ? "For Rent" : "For Sale"}
                  </span>
                  {l.propertyType && (
                    <span className="absolute top-3 right-3 text-[10px] font-medium px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-sm text-white">
                      {l.propertyType}
                    </span>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  {l.community && (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                      <MapPin className="h-3 w-3" /> {l.community}{l.city && l.city !== l.community ? `, ${l.city}` : ""}
                    </p>
                  )}
                  <h3 className="font-bold text-foreground mb-3 group-hover:text-primary transition-colors leading-snug line-clamp-2">{l.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    {l.bedrooms != null && <span className="flex items-center gap-1"><BedDouble className="h-3 w-3" />{l.bedrooms} Bed</span>}
                    {l.bathrooms != null && <span className="flex items-center gap-1"><Bath className="h-3 w-3" />{l.bathrooms} Bath</span>}
                    {l.size != null && <span className="flex items-center gap-1"><Maximize className="h-3 w-3" />{l.size.toLocaleString()} {l.sizeUnit || "sqft"}</span>}
                  </div>
                  <div className="mt-auto border-t border-border pt-3">
                    <p className="text-sm font-bold text-primary">{formatPrice(l.price, l.currency)}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
