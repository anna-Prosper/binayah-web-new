"use client";

import { motion } from "framer-motion";
import { Building2, MapPin, ArrowRight } from "lucide-react";
import NextImage from "next/image";
// Locale-aware Link (next-intl): plain next/link emits bare hrefs, which
// localePrefix "as-needed" resolves to the DEFAULT locale — dropping non-English
// readers back into English. This variant prefixes hrefs with the active locale.
import { Link } from "@/navigation";
import type React from "react";

export interface SimilarItem {
  /** Unique key (slug, id, etc.). */
  key: string;
  /** Card title. */
  title: string;
  /** Location string shown below the title. */
  location?: string;
  /** Pre-formatted price string (or any short value text). */
  priceLabel: string;
  /** Optional eyebrow above the price, e.g. "From" / "От". */
  priceEyebrow?: string;
  /** Optional status pill text (e.g. "Off-Plan", "For sale"). */
  statusLabel?: string;
  /** Optional image URL — if absent, a placeholder Building icon is shown. */
  imageUrl?: string;
  /** Optional link destination — if set, the whole card becomes a Link. */
  href?: string;
}

export interface SimilarItemsCarouselProps {
  /** Section header — icon, eyebrow label and title. */
  icon?: React.ElementType;
  title: string;
  /** Optional small label/eyebrow shown above the title. */
  eyebrow?: string;
  items: SimilarItem[];
}

export function SimilarItemsCarousel({ icon: HeaderIcon = Building2, title, eyebrow, items }: SimilarItemsCarouselProps) {
  if (!items || items.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2.5 mb-5 sm:mb-6">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <HeaderIcon className="h-4 w-4 text-primary" />
        </div>
        <div>
          {eyebrow && <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-accent">{eyebrow}</p>}
          <h2 className="text-lg sm:text-xl font-bold text-foreground">{title}</h2>
        </div>
      </div>

      <div
        className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0"
        style={{ scrollbarWidth: "none" }}
      >
        {items.map((item, i) => {
          const card = (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="min-w-[260px] sm:min-w-[280px] flex-shrink-0 snap-start rounded-2xl border border-border/50 bg-card overflow-hidden group hover:border-primary/30 transition-colors h-full"
            >
              <div className="h-36 bg-muted/30 flex items-center justify-center relative overflow-hidden">
                {item.imageUrl ? (
                  <NextImage src={item.imageUrl} alt={item.title} fill className="object-cover" sizes="280px" />
                ) : (
                  <Building2 className="h-10 w-10 text-muted-foreground/20" />
                )}
                {item.statusLabel && (
                  <span
                    className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold text-white shadow-sm"
                    style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
                  >
                    {item.statusLabel}
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-sm font-bold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                  {item.title}
                </h3>
                {item.location && (
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-3">
                    <MapPin className="h-3 w-3 flex-shrink-0" /> {item.location}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    {item.priceEyebrow && (
                      <p className="text-xs text-muted-foreground">{item.priceEyebrow}</p>
                    )}
                    <p className="text-sm font-bold text-accent truncate">{item.priceLabel}</p>
                  </div>
                  <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <ArrowRight className="h-3.5 w-3.5 text-primary" />
                  </span>
                </div>
              </div>
            </motion.div>
          );

          return item.href ? (
            <Link key={item.key} href={item.href} className="block">
              {card}
            </Link>
          ) : (
            <div key={item.key}>{card}</div>
          );
        })}
      </div>
    </div>
  );
}
