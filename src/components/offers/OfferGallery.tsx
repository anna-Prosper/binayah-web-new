"use client";

/* eslint-disable i18next/no-literal-string -- English-only offer pages */
/* eslint-disable @next/next/no-img-element -- verified real-estate CDN images */

import { useState } from "react";
import { Expand } from "lucide-react";
import { GalleryModal } from "@/components/GalleryModal";

export interface OfferGalleryImage {
  src: string;
  alt: string;
}

/**
 * Mosaic photo strip for an offer landing page: one large tile plus a row of
 * smaller ones, all opening the shared GalleryModal lightbox at the clicked
 * index. Caps the visible grid at 5 tiles and folds the rest behind a
 * "+N more" overlay on the last one, same convention as a property gallery.
 */
export default function OfferGallery({ images, title }: { images: OfferGalleryImage[]; title?: string }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images.length) return null;

  const VISIBLE = 5;
  const shown = images.slice(0, VISIBLE);
  const hiddenCount = images.length - shown.length;

  const launch = (i: number) => {
    setActiveIndex(i);
    setOpen(true);
  };

  return (
    <>
      {/* 4 cols x 2 rows. Big tile takes the left 2x2 block (4 cells); the
          remaining 2x2 block on the right holds the 4 small tiles at
          col-span-1 row-span-1 each — NOT col-span-2, which would only leave
          room for 2 of them and push the rest into an overflowing implicit
          row. */}
      <div className="grid h-[320px] grid-cols-4 grid-rows-2 gap-2.5 sm:h-[440px] sm:gap-3">
        <button
          onClick={() => launch(0)}
          className="group relative col-span-4 row-span-2 overflow-hidden rounded-2xl bg-muted sm:col-span-2"
        >
          <img
            src={shown[0].src}
            alt={shown[0].alt}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        </button>

        {shown.slice(1).map((img, i) => {
          const idx = i + 1;
          const isLast = idx === shown.length - 1;
          return (
            <button
              key={img.src}
              onClick={() => launch(idx)}
              className="group relative col-span-1 row-span-1 hidden overflow-hidden rounded-2xl bg-muted sm:block"
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {isLast && hiddenCount > 0 && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-sm font-bold text-white backdrop-blur-[1px] sm:text-lg">
                  +{hiddenCount} more
                </span>
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => launch(0)}
        className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-foreground transition-colors hover:text-primary sm:hidden"
      >
        <Expand className="h-4 w-4" /> View all {images.length} photos
      </button>

      <GalleryModal
        open={open}
        onClose={() => setOpen(false)}
        images={images.map((i) => i.src)}
        activeIndex={activeIndex}
        onChange={setActiveIndex}
        title={title}
      />
    </>
  );
}
