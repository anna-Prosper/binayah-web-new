"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Building, CalendarDays } from "lucide-react";
import Link from "next/link";


interface Project {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  developerName?: string;
  startingPrice?: number | null;
  handover?: string;
  completionDate?: string;
  status?: string;
  imageGallery?: string[];
  featuredImage?: string;
  currency?: string;
}

const OffPlanSection = ({ projects = [] }: { projects?: Project[] }) => {
  return (
    <section id="offplan" className="py-14 sm:py-24 bg-background scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 sm:mb-14 gap-4"
        >
          <div>
            <motion.div initial={{ width: 0 }} whileInView={{ width: "3rem" }} viewport={{ once: true }} className="h-[2px] mb-4 sm:mb-6" style={{ background: "linear-gradient(90deg, #D4A847, #B8922F)" }} />
            <p className="font-semibold tracking-[0.4em] uppercase text-[10px] sm:text-xs mb-2 sm:mb-4" style={{ color: "#D4A847" }}>Off Plan</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
              Trending <span className="italic font-light">Developments</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-lg">
              Explore Dubai's latest off-plan properties — promising investments yet to be completed, across prime locations.
            </p>
          </div>
          <Link href="/off-plan" className="group flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all">
            View All Projects <ArrowUpRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {(projects || []).filter(Boolean).map((p, i) => {
            const price = p.startingPrice
              ? p.startingPrice >= 1_000_000
                ? `${p.currency} ${(p.startingPrice / 1_000_000).toFixed(1)}M`
                : `${p.currency} ${(p.startingPrice / 1_000).toFixed(0)}K`
              : "Price on request";

            return (
              <motion.div
                key={p._id || p.id || p.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="h-full"
              >
                <Link href={p.slug === "__fallback__" ? "/off-plan" : `/project/${p.slug}`} className="group flex flex-col h-full bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-border/50 hover:border-primary/20">
                  <div className="relative overflow-hidden aspect-[4/3]">
                    <img
                      src={p.featuredImage || p.imageGallery?.[0] || p.imageGallery?.[0] || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600"}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-accent text-accent-foreground uppercase tracking-wider">
                      {p.status}
                    </span>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
                      <Building className="h-3 w-3" /> {p.developerName}
                    </p>
                    <h3 className="font-bold text-foreground mb-3 group-hover:text-primary transition-colors leading-snug">
                      {p.name}
                    </h3>
                    <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
                      <p className="text-sm font-bold text-primary">From {price}</p>
                      {p.completionDate && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" /> {(() => { try { const d = new Date(p.completionDate); return isNaN(d.getTime()) ? p.completionDate : d.getFullYear(); } catch { return p.completionDate; } })()}
                        </p>
                      )}
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

export default OffPlanSection;