"use client";

import { motion } from "framer-motion";
import { MapPin, Compass, Map } from "lucide-react";
import { useTranslations } from "next-intl";
import type React from "react";

export interface NearbyAttraction {
  name: string;
  type: string;
  distance?: string;
}

export interface LocationSectionProps {
  community?: string;
  subCommunity?: string;
  city?: string;
  country?: string;
  building?: string;
  address?: string;
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
  community,
  subCommunity,
  city,
  country,
  building,
  address,
  mapEmbedSrc,
  description,
  externalMapUrl,
  nearby,
  iconForType,
}: LocationSectionProps) {
  // Both detail pages have the same keys in their respective namespaces with the same
  // values — picking propertyDetail keeps a single source of truth for this component.
  const t = useTranslations("propertyDetail");

  const cells = [
    subCommunity ? { label: t("subCommunityLabel"), value: subCommunity } : null,
    { label: t("communityLabel"), value: community },
    building ? { label: t("buildingLabel"), value: building } : null,
    { label: t("cityLabel"), value: city },
    { label: t("countryLabel"), value: country },
  ].filter(Boolean) as { label: string; value: string | undefined }[];

  const colClass =
    cells.length <= 3
      ? "grid-cols-3"
      : cells.length === 4
      ? "grid-cols-2 sm:grid-cols-4"
      : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5";

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* Location info + map */}
      <div className="bg-card rounded-2xl border border-border/50 p-4 sm:p-6 md:p-8">
        <div className="flex items-center gap-2.5 mb-4 sm:mb-6">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <MapPin className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground">{t("locationLabel")}</h2>
        </div>

        {address && (
          <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-5 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-accent" />
            {address}
          </p>
        )}

        {/* Data cells */}
        <div className={`grid ${colClass} gap-2 sm:gap-3 mb-3 sm:mb-5`}>
          {cells.map(({ label, value }) => (
            <div key={label} className="p-2.5 sm:p-4 bg-muted/50 rounded-xl">
              <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-0.5 sm:mb-1">
                {label}
              </p>
              <p className="text-xs sm:text-sm font-bold text-foreground truncate">{value || "-"}</p>
            </div>
          ))}
        </div>

        {description && (() => {
          const parts = description.split(/\s*[•●◦▪■]\s*/).map(s => s.trim()).filter(Boolean);
          if (parts.length <= 1) {
            return (
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4 sm:mb-5">
                {description}
              </p>
            );
          }
          const [intro, ...bullets] = parts;
          return (
            <div className="mb-4 sm:mb-5 space-y-2">
              {intro && (
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{intro}</p>
              )}
              <ul className="space-y-1.5">
                {bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0" />
                    <span className="leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })()}

        <div className="rounded-xl overflow-hidden mb-4 sm:mb-5 border border-border/30" style={{ aspectRatio: "16/9" }}>
          <iframe
            src={mapEmbedSrc}
            className="w-full h-full border-0"
            allowFullScreen
            loading="lazy"
            title="Location Map"
          />
        </div>

        {externalMapUrl && (
          <a
            href={externalMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl border border-primary/30 bg-primary/8 text-primary text-xs sm:text-sm font-semibold hover:bg-primary/15 hover:border-primary/50 transition-all"
          >
            <Map className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
            {t("viewOnGoogleMaps")}
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
            <h2 className="text-lg sm:text-xl font-bold text-foreground">{t("nearbyAttractions")}</h2>
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
