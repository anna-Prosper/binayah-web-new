"use client";

import { motion } from "framer-motion";
import { MapPin, Compass, ExternalLink } from "lucide-react";
import type React from "react";

export interface LocationLabels {
  title: string;
  community: string;
  city: string;
  country: string;
  /** Used for the "View on Google Maps" button. Optional — if omitted the button is hidden. */
  viewOnMaps?: string;
  /** Section title for the nearby attractions card. */
  nearby: string;
}

export interface NearbyAttraction {
  name: string;
  type: string;
  distance?: string;
}

export interface LocationSectionProps {
  labels: LocationLabels;
  community?: string;
  city?: string;
  country?: string;
  /** Pre-built map embed URL (with API key + query). Component does not construct it. */
  mapEmbedSrc: string;
  /** Optional descriptive paragraph shown between the cells grid and the map. */
  description?: string;
  /** Optional external link shown as a button below the map. */
  externalMapUrl?: string;
  /** Nearby attractions list — card is hidden if empty. */
  nearby: NearbyAttraction[];
  /** Resolves an icon from a nearby item's `type`. */
  iconForType: (type: string) => React.ElementType;
}

export function LocationSection({
  labels,
  community,
  city,
  country,
  mapEmbedSrc,
  description,
  externalMapUrl,
  nearby,
  iconForType,
}: LocationSectionProps) {
  return (
    <div className="space-y-4 sm:space-y-8">
      {/* Location info + map */}
      <div className="bg-card rounded-2xl border border-border/50 p-4 sm:p-6 md:p-8">
        <div className="flex items-center gap-2.5 mb-4 sm:mb-6">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <MapPin className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground">{labels.title}</h2>
        </div>

        {/* Community / City / Country cells */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-5">
          {[
            { label: labels.community, value: community },
            { label: labels.city, value: city },
            { label: labels.country, value: country },
          ].map(({ label, value }) => (
            <div key={label} className="p-2.5 sm:p-4 bg-muted/50 rounded-xl">
              <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-0.5 sm:mb-1">
                {label}
              </p>
              <p className="text-xs sm:text-base font-bold text-foreground">{value || "—"}</p>
            </div>
          ))}
        </div>

        {description && (
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4 sm:mb-5">
            {description}
          </p>
        )}

        <div className="rounded-xl overflow-hidden mb-4 sm:mb-5 border border-border/30" style={{ aspectRatio: "16/9" }}>
          <iframe
            src={mapEmbedSrc}
            className="w-full h-full border-0"
            allowFullScreen
            loading="lazy"
            title="Location Map"
          />
        </div>

        {externalMapUrl && labels.viewOnMaps && (
          <a
            href={externalMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-primary text-primary-foreground rounded-xl text-xs sm:text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> {labels.viewOnMaps}
          </a>
        )}
      </div>

      {/* Nearby attractions */}
      {nearby.length > 0 && (
        <div className="bg-card rounded-2xl border border-border/50 p-4 sm:p-6 md:p-8">
          <div className="flex items-center gap-2.5 mb-4 sm:mb-6">
            <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
              <Compass className="h-4 w-4 text-accent" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">{labels.nearby}</h2>
          </div>
          <div className="space-y-2 sm:space-y-3">
            {nearby.map((item, i) => {
              const Icon = iconForType(item.type);
              return (
                <motion.div
                  key={`${item.name}-${i}`}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center justify-between p-3 sm:p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3.5">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-foreground">{item.name}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">{item.type}</p>
                    </div>
                  </div>
                  {item.distance && (
                    <span className="text-[10px] sm:text-xs font-bold text-primary bg-primary/10 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg">
                      {item.distance}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
