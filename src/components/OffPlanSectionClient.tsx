"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Building, CalendarDays } from "lucide-react";
import Link from "next/link";

interface Project {
  _id: string;
  name: string;
  slug: string;
  developerName?: string;
  startingPrice?: number | null;
  completionDate?: string;
  handover?: string;
  status?: string;
  imageGallery?: string[];
  currency?: string;
}

const OffPlanSectionClient = ({ projects = [] }: { projects?: Project[] }) => {
  const fmt = (p: Project) => {
    if (!p.startingPrice) return "Price on request";
    const cur = p.currency || "AED";
    return p.startingPrice >= 1_000_000
      ? `${cur} ${(p.startingPrice / 1_000_000).toFixed(1)}M`
      : `${cur} ${(p.startingPrice / 1_000).toFixed(0)}K`;
  };

  const year = (p: Project) => {
    const d = p.handover || p.completionDate;
    if (!d) return null;
    const y = parseInt(d);
    return isNaN(y) ? d : y;
  };

  return (
    <section id="offplan" className="py-12 sm:py-24 bg-muted/40 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-6 sm:mb-14 gap-3">
          <div>
            <motion.div initial={{ width: 0 }} whileInView={{ width: "3rem" }} viewport={{ once: true }} className="h-[2px] mb-4 sm:mb-6" style={{ background: "linear-gradient(90deg, #D4A847, #B8922F)" }} />
            <p className="font-semibold tracking-[0.4em] uppercase text-[10px] sm:text-xs mb-2 sm:mb-4" style={{ color: "#D4A847" }}>Off Plan</p>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-foreground">
              Trending <span className="italic font-light">Developments</span>
            </h2>
            <p className="hidden sm:block mt-3 sm:mt-4 text-muted-foreground max-w-lg text-sm sm:text-base">
              Explore Dubai's latest off-plan properties — promising investments yet to be completed.
            </p>
          </div>
          <Link href="/off-plan" className="group flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all">
            View All Projects <ArrowUpRight className="h-4 w-4" />
          </Link>
        </motion.div>

        {/* Mobile */}
        <div className="sm:hidden -mx-4 px-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide flex gap-3 pb-2">
          {projects.map((p, i) => (
            <motion.div key={p._id} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="flex-shrink-0 w-[240px] snap-start">
              <Link href={`/project/${p.slug}`} className="group block bg-card rounded-xl overflow-hidden shadow-sm border border-border/50">
                <div className="relative overflow-hidden aspect-[3/2]">
                  <img src={p.imageGallery?.[0] || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600"} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                  <span className="absolute top-2 left-2 text-[8px] font-bold px-2 py-0.5 rounded-md bg-accent text-accent-foreground uppercase tracking-wider">{p.status}</span>
                </div>
                <div className="p-3">
                  <p className="text-[9px] text-muted-foreground flex items-center gap-1 mb-0.5"><Building className="h-2.5 w-2.5" /> {p.developerName}</p>
                  <h3 className="font-bold text-xs text-foreground mb-1.5 leading-snug line-clamp-1">{p.name}</h3>
                  <div className="flex items-center justify-between border-t border-border pt-2">
                    <p className="text-xs font-bold text-primary">From {fmt(p)}</p>
                    {year(p) && <p className="text-[9px] text-muted-foreground flex items-center gap-0.5"><CalendarDays className="h-2.5 w-2.5" /> {year(p)}</p>}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Desktop grid */}
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {projects.map((p, i) => (
            <motion.div key={p._id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }} className="h-full">
              <Link href={`/project/${p.slug}`} className="group flex flex-col h-full bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-border/50 hover:border-primary/20">
                <div className="relative overflow-hidden aspect-[4/3]">
                  <img src={p.imageGallery?.[0] || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600"} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-accent text-accent-foreground uppercase tracking-wider">{p.status}</span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2"><Building className="h-3 w-3" /> {p.developerName}</p>
                  <h3 className="font-bold text-foreground mb-3 group-hover:text-primary transition-colors leading-snug">{p.name}</h3>
                  <div className="flex items-center justify-between border-t border-border pt-3 mt-auto">
                    <p className="text-sm font-bold text-primary">From {fmt(p)}</p>
                    {year(p) && <p className="text-xs text-muted-foreground flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {year(p)}</p>}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OffPlanSectionClient;
