"use client";

import { motion } from "framer-motion";
import { Building, CalendarDays, MapPin, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Project {
  _id: string;
  name: string;
  slug: string;
  developerName?: string;
  community?: string;
  startingPrice?: number;
  completionDate?: string;
  status?: string;
  featuredImage?: string;
  imageGallery?: string[];
}

export default function OffPlanSectionClient({ projects }: { projects: Project[] }) {
  return (
    <section id="offplan" className="py-24 bg-card scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-14 gap-4">
          <div>
            <motion.div initial={{ width: 0 }} whileInView={{ width: "3rem" }} viewport={{ once: true }} className="h-[2px] bg-accent mb-6" />
            <p className="text-accent font-semibold tracking-[0.4em] uppercase text-xs mb-4">New Launches</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">Off-Plan <span className="italic font-light">Projects</span></h2>
          </div>
          <Link href="/off-plan" className="group flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all">
            View All <ArrowUpRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {projects.map((p, i) => (
            <motion.div key={p._id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="h-full">
              <Link href={`/project/${p.slug}`} className="group flex flex-col h-full bg-background rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-border/50 hover:border-primary/20">
                <div className="relative overflow-hidden aspect-[4/3]">
                  <Image src={p.featuredImage || p.imageGallery?.[0] || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600"} alt={p.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover group-hover:scale-110 transition-transform duration-700" />
                  <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-accent text-accent-foreground uppercase tracking-wider">{p.status}</span>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                    <span className="flex items-center gap-1"><Building className="h-3 w-3" />{p.developerName}</span>
                    {p.community && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{p.community}</span>}
                  </div>
                  <h3 className="font-bold text-sm text-foreground mb-2 group-hover:text-primary transition-colors leading-snug">{p.name}</h3>
                  <div className="mt-auto flex items-center justify-between border-t border-border pt-2.5">
                    <p className="text-xs font-bold text-primary">{p.startingPrice ? `From AED ${(p.startingPrice / 1_000_000).toFixed(1)}M` : "Price on request"}</p>
                    {p.completionDate && <p className="text-[10px] text-muted-foreground flex items-center gap-1"><CalendarDays className="h-2.5 w-2.5" />{(() => { try { const d = new Date(p.completionDate); return isNaN(d.getTime()) ? p.completionDate : d.getFullYear(); } catch { return p.completionDate; } })()}</p>}
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
