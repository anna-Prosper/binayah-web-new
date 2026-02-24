"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Building2 } from "lucide-react";
import Link from "next/link";

const TOP_DEVELOPERS = [
  { name: "Emaar Properties", slug: "emaar-properties" },
  { name: "Damac Properties", slug: "damac-properties" },
  { name: "Nakheel Developers", slug: "nakheel-developers" },
  { name: "Sobha Realty", slug: "sobha-realty" },
  { name: "Meraas", slug: "meraas" },
  { name: "AZIZI Developments", slug: "azizi-developments" },
  { name: "Binghatti Developers", slug: "binghatti-developers" },
  { name: "Danube Properties", slug: "danube-properties" },
  { name: "Ellington Properties", slug: "ellington-properties" },
  { name: "Dubai Properties Group", slug: "dubai-properties-group" },
  { name: "Omniyat Developers", slug: "omniyat-developers" },
  { name: "Select Group", slug: "select-group" },
];

const DevelopersSection = ({ logos }: { logos?: Record<string, string> }) => {
  return (
    <section id="developers" className="py-14 sm:py-24 bg-background scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 sm:mb-14 gap-4"
        >
          <div>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "3rem" }}
              viewport={{ once: true }}
              className="h-[2px] bg-accent mb-6"
            />
            <p className="text-accent font-semibold tracking-[0.4em] uppercase text-xs mb-4">
              Trusted Partners
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
              Top <span className="italic font-light">Developers</span>
            </h2>
          </div>
          <Link
            href="/developers"
            className="group flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all"
          >
            View All Developers <ArrowUpRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {TOP_DEVELOPERS.map((dev, i) => {
            const logoUrl = logos?.[dev.slug];
            return (
              <motion.div
                key={dev.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <Link
                  href={`/developers/${dev.slug}`}
                  className="group flex flex-col items-center bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-primary/20 hover:shadow-xl transition-all duration-500 p-5 sm:p-6 text-center"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 mb-4 rounded-xl bg-primary/[0.06] flex items-center justify-center overflow-hidden border border-primary/10 group-hover:border-primary/25 group-hover:bg-primary/[0.10] transition-all">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt={dev.name}
                        className="w-full h-full object-contain p-2 developer-logo-green opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                    ) : (
                      <Building2 className="h-6 w-6 sm:h-7 sm:w-7 text-primary/60 group-hover:text-primary transition-colors" />
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {dev.name}
                  </h3>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* CSS filter to tint logos green/teal */}
      <style jsx global>{`
        .developer-logo-green {
          filter: brightness(0) saturate(100%) invert(22%) sepia(85%) saturate(600%) hue-rotate(140deg) brightness(95%);
        }
        .group:hover .developer-logo-green {
          filter: brightness(0) saturate(100%) invert(22%) sepia(85%) saturate(800%) hue-rotate(140deg) brightness(100%);
        }
      `}</style>
    </section>
  );
};

export default DevelopersSection;
