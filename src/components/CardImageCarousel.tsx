"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

interface Props {
  images: Array<string | undefined | null>;
  alt: string;
  sizes: string;
  /** Max slides to render — extra images are dropped. */
  limit?: number;
  /** Fallback shown when `images` resolves to an empty list. */
  fallback?: string;
  /** Pass true for cards in the first viewport row to improve LCP. */
  priority?: boolean;
}

const DEFAULT_FALLBACK = "/assets/property-placeholder-v2.webp";

export default function CardImageCarousel({
  images,
  alt,
  sizes,
  limit = 6,
  fallback = DEFAULT_FALLBACK,
  priority = false,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const seen = new Set<string>();
  const slides: string[] = [];
  for (const src of images) {
    if (!src || seen.has(src)) continue;
    seen.add(src);
    slides.push(src);
    if (slides.length >= limit) break;
  }
  if (slides.length === 0) slides.push(fallback);

  const goTo = (idx: number, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: el.clientWidth * idx, behavior: "smooth" });
  };

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / Math.max(el.clientWidth, 1));
    if (idx !== active) setActive(idx);
  };

  const hasMany = slides.length > 1;

  return (
    <>
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="absolute inset-0 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
      >
        {slides.map((src, i) => (
          <div key={`${i}-${src}`} className="relative shrink-0 w-full h-full snap-start">
            <Image
              src={src}
              alt={alt}
              fill
              sizes={sizes}
              priority={priority && i === 0}
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
          </div>
        ))}
      </div>

      {hasMany && (
        <>
          {active > 0 && (
            <button
              type="button"
              onClick={(event) => goTo(active - 1, event)}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white items-center justify-center hidden md:group-hover:flex transition-opacity"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          {active < slides.length - 1 && (
            <button
              type="button"
              onClick={(event) => goTo(active + 1, event)}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white items-center justify-center hidden md:group-hover:flex transition-opacity"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex gap-1 pointer-events-none">
            {slides.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === active ? "w-4 bg-white" : "w-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}
