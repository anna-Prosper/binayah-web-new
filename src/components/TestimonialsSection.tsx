"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const testimonials = [
  {
    name: "Sarah Al-Maktoum",
    role: "Investor · Palm Jumeirah",
    text: "Binayah found me a 4BR villa in Palm Jumeirah under budget in just 10 days. They handled everything from viewing to handover — I didn't have to chase a single document.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "James Richardson",
    role: "Homeowner · Dubai Marina",
    text: "Relocating from London, I expected months of searching. Binayah shortlisted five Marina apartments that matched exactly what we needed — we signed within two weeks.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Fatima Hassan",
    role: "Developer Partner",
    text: "We've worked with many agencies but Binayah consistently brings qualified, ready-to-close buyers. They sold 80% of our JVC launch inventory in the first quarter.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
  },
];

const TestimonialsSection = () => {
  const [active, setActive] = useState(0);

  const next = () => setActive((p) => (p + 1) % testimonials.length);
  const prev = () => setActive((p) => (p - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-8 sm:py-24 bg-foreground text-background relative overflow-hidden">
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
            Client Stories
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold">
            What Our <span className="italic font-light">Clients Say</span>
          </h2>
        </motion.div>

        {/* Mobile: compact inline header */}
        <div className="sm:hidden flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-background">Client Stories</h2>
          <span className="text-[10px] text-background/40">{active + 1} / {testimonials.length}</span>
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
                <img
                  src={testimonials[active].image}
                  alt={testimonials[active].name}
                  className="w-10 h-10 sm:w-14 sm:h-14 rounded-full object-cover sm:mx-auto sm:mb-2.5 border-2 border-[#D4A847]/30"
                />
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
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
