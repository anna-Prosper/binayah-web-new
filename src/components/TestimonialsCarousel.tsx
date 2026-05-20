"use client";

import { motion } from "framer-motion";
import { Star, MessageCircle } from "lucide-react";
import NextImage from "next/image";
import { useTranslations } from "next-intl";

export interface TestimonialItem {
  name: string;
  /** Buyer/renter role or unit description, e.g. "2 Bedroom buyer" or "Tenant in JVC". */
  role: string;
  rating: number;
  text: string;
  /** Optional avatar URL. If absent, the first letter is rendered in an accent circle. */
  avatarUrl?: string;
}

export interface TestimonialsCarouselProps {
  /** Section title — varies per page ("What Buyers Say" vs "What Clients Say"). */
  title: string;
  items: TestimonialItem[];
}

export function TestimonialsCarousel({ title, items }: TestimonialsCarouselProps) {
  // Eyebrow ("Testimonials"/"ОТЗЫВЫ") is the same on both detail pages — read internally.
  const tp = useTranslations("propertyDetail");
  if (!items || items.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2.5 mb-5 sm:mb-6">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: "rgba(212,168,71,0.12)" }}
        >
          <MessageCircle className="h-4 w-4" style={{ color: "#D4A847" }} />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] font-semibold mb-0.5" style={{ color: "#D4A847" }}>
            {tp("testimonialsLabel")}
          </p>
          <h2 className="text-lg sm:text-xl font-bold text-foreground">{title}</h2>
        </div>
      </div>

      <div className="flex sm:grid sm:grid-cols-3 gap-3 sm:gap-5 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 pb-2 sm:pb-0 snap-x snap-mandatory">
        {items.map((review, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex-shrink-0 w-[75%] sm:w-auto snap-start bg-card rounded-2xl border border-border/50 p-4 sm:p-6 flex flex-col"
          >
            <div className="flex items-center gap-0.5 mb-3">
              {Array.from({ length: 5 }).map((_, si) => (
                <Star
                  key={si}
                  className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${si < review.rating ? "fill-[#D4A847] text-[#D4A847]" : "text-border"}`}
                />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed flex-1 mb-4">
              &ldquo;{review.text}&rdquo;
            </p>
            <div className="flex items-center gap-3 pt-3 border-t border-border/50">
              {review.avatarUrl ? (
                <NextImage
                  src={review.avatarUrl}
                  alt={review.name}
                  width={36}
                  height={36}
                  className="rounded-full object-cover flex-shrink-0"
                  style={{ border: "2px solid rgba(212,168,71,0.2)" }}
                />
              ) : (
                <div
                  className="w-9 h-9 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0"
                  style={{ border: "2px solid rgba(212,168,71,0.2)" }}
                >
                  <span className="text-xs font-bold text-accent">{review.name.charAt(0)}</span>
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{review.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{review.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
