"use client";

import { motion } from "framer-motion";
import {
  Star, Waves, Dumbbell, Baby, Car, Lock, HeartPulse, Flame, TrendingUp,
  Store, TreePine, Smartphone, Shield, Building2, Wind, Zap, Home, ArrowRight, Check,
} from "lucide-react";

const KEYWORD_ICONS: Array<[RegExp, React.ElementType]> = [
  [/pool|swim|jacuzzi/, Waves],
  [/gym|fitness|workout/, Dumbbell],
  [/kids|children|play|nursery/, Baby],
  [/concierge|lobby|reception/, Star],
  [/parking|valet|garage|car park/, Car],
  [/security|guard|cctv|gated|24x7|24\/7/, Lock],
  [/spa|sauna|steam|massage|wellness/, HeartPulse],
  [/bbq|barbecue|barbeque|grill/, Flame],
  [/jogging|running|track/, TrendingUp],
  [/retail|shop|store/, Store],
  [/garden|landscape|park|green/, TreePine],
  [/smart|automation|iot|home automation/, Smartphone],
  [/beach|marina|waterfront/, Waves],
  [/metro|transport|bus|tram/, ArrowRight],
  [/air ?con|a\/c|hvac|cool/, Wind],
  [/power|electric|generator/, Zap],
  [/balcon|terrace|rooftop/, Home],
  [/building|tower/, Building2],
];

function pickIcon(label: string): React.ElementType {
  const l = label.toLowerCase();
  for (const [re, Icon] of KEYWORD_ICONS) if (re.test(l)) return Icon;
  return Shield;
}

export interface AmenitiesSectionProps {
  amenities: string[];
  eyebrow: string;
  title: string;
  /** Optional wrapper className for outer card spacing. */
  className?: string;
}

export function AmenitiesSection({ amenities, eyebrow, title, className = "" }: AmenitiesSectionProps) {
  if (!amenities || amenities.length === 0) return null;

  return (
    <div className={`bg-card rounded-2xl border border-border/50 p-4 sm:p-8 ${className}`}>
      <div className="flex items-center gap-2.5 mb-5 sm:mb-6">
        <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center flex-shrink-0">
          <Star className="h-4 w-4 text-accent" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-accent">{eyebrow}</p>
          <h2 className="text-base sm:text-xl font-bold text-foreground">{title}</h2>
        </div>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 sm:gap-3">
        {amenities.map((amenity, i) => {
          const AIcon = pickIcon(amenity);
          return (
            <motion.div
              key={`${i}-${amenity}`}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(i * 0.03, 0.4) }}
              className="rounded-lg sm:rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors p-2 sm:p-3 flex flex-col items-center text-center gap-1.5 sm:gap-2"
            >
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center">
                <AIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-foreground leading-tight">{amenity}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
