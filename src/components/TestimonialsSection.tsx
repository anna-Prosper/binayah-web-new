"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import type { GoogleReviewsData } from "@/lib/googleReviews";

const TestimonialsSection = ({ data }: { data?: GoogleReviewsData | null }) => {
  const t = useTranslations("home.sections.testimonials");
  const [active, setActive] = useState(0);

  // Real Google reviews only — no fabricated testimonials. If we have none yet
  // (Places API not configured), render nothing rather than fake social proof.
  const testimonials = (data?.reviews ?? []).map((r) => ({
    name: r.author,
    role: r.relativeTime ? `Google review · ${r.relativeTime}` : "Google review",
    text: r.text,
    rating: r.ratingValue,
  }));
  if (testimonials.length === 0) return null;

  const next = () => setActive((p) => (p + 1) % testimonials.length);
  const prev = () => setActive((p) => (p - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-8 sm:py-24 bg-foreground text-background relative overflow-hidden">
      {/* Review/AggregateRating JSON-LD is emitted server-side from the homepage
          (page.tsx) so it's in the crawlable SSR HTML — this section is
          lazy-mounted client-side, so its schema wouldn't be. */}
      {/* Decorative quote — desktop only */}
      <div className="absolute top-10 right-10 text-background/5 hidden sm:block">
        <Quote className="h-64 w-64" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative">
        {/* Desktop header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="hidden sm:block text-center mb-14"
        >
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "3rem" }}
            viewport={{ once: true }}
            className="h-[2px] mx-auto mb-6"
            style={{ background: "linear-gradient(90deg, #D4A847, #B8922F)" }}
          />
          <p className="font-semibold tracking-[0.4em] uppercase text-xs mb-4" style={{ color: "#D4A847" }}>
            {t("label")}
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold">
            {t("title")} <span className="font-light">{t("titleItalic")}</span>
          </h2>
        </motion.div>

        {/* Mobile: compact inline header */}
        <div className="sm:hidden flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-background">{t("label")}</h2>
          <span className="text-[10px] text-background/70">{active + 1} / {testimonials.length}</span>
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35 }}
              className="text-center max-w-3xl mx-auto"
            >
              {/* Stars on desktop, hidden on mobile (quote icon used instead) */}
              <div className="hidden sm:flex justify-center gap-1 mb-6">
                {Array.from({ length: testimonials[active].rating }).map((_, j) => (
                  <Star key={j} className="h-5 w-5 fill-[#D4A847] text-[#D4A847]" />
                ))}
              </div>

              {/* Mobile: compact quote mark */}
              <div className="sm:hidden flex justify-center mb-2">
                <Quote className="h-5 w-5" style={{ color: "#D4A847" }} />
              </div>

              <p className="text-sm sm:text-xl lg:text-2xl font-light leading-relaxed mb-4 sm:mb-8 text-background/80 px-2">
                "{testimonials[active].text}"
              </p>
              <div className="flex items-center justify-center gap-3 sm:block">
                <div
                  className="w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center sm:mx-auto sm:mb-2.5 border-2 border-[#D4A847]/30 text-sm sm:text-lg font-bold flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #0B5E41, #1A9068)", color: "#D4A847" }}
                >
                  {testimonials[active].name.charAt(0)}
                </div>
                <div className="sm:text-center">
                  <p className="font-semibold text-background text-sm sm:text-base">{testimonials[active].name}</p>
                  <p className="text-background/50 text-xs sm:text-sm">{testimonials[active].role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-3 mt-5 sm:mt-10">
            <button
              onClick={prev}
              className="sm:hidden w-8 h-8 rounded-full border border-background/20 flex items-center justify-center hover:border-background/40 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-3.5 w-3.5 text-background/60" />
            </button>

            <div className="flex items-center gap-2.5">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`Show testimonial ${i + 1}`}
                  aria-current={i === active ? "true" : undefined}
                  className={`transition-all duration-300 rounded-full ${
                    i === active ? "w-7 sm:w-10 h-2 sm:h-2.5" : "w-2 sm:w-2.5 h-2 sm:h-2.5 bg-background/20 hover:bg-background/40"
                  }`}
                  style={i === active ? { background: "linear-gradient(90deg, #D4A847, #B8922F)" } : {}}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="sm:hidden w-8 h-8 rounded-full border border-background/20 flex items-center justify-center hover:border-background/40 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-3.5 w-3.5 text-background/60" />
            </button>
          </div>

          {/* Google attribution (required when displaying Google reviews) */}
          {data?.placeUrl && (
            <div className="text-center mt-5 sm:mt-8">
              <a
                href={data.placeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[11px] sm:text-xs text-background/50 hover:text-background/80 transition-colors"
              >
                <Star className="h-3.5 w-3.5 fill-[#D4A847] text-[#D4A847]" />
                {data.rating.toFixed(1)} · {data.total.toLocaleString()} {t("googleReviews")}
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
