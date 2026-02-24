"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useState } from "react";

const testimonials = [
  {
    name: "Sarah Al-Maktoum",
    role: "Investor",
    text: "Binayah helped me find the perfect villa in Palm Jumeirah. Their understanding of the market is unmatched. The entire process was seamless from start to finish.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "James Richardson",
    role: "Homeowner",
    text: "Moving to Dubai from London was daunting, but Binayah made it effortless. They found us a stunning apartment in Marina within our budget. Truly exceptional service.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Fatima Hassan",
    role: "Property Developer",
    text: "As a developer, I need a partner who understands the market deeply. Binayah consistently delivers qualified buyers and provides invaluable market insights.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
  },
];

const TestimonialsSection = () => {
  const [active, setActive] = useState(0);

  return (
    <section className="py-24 bg-foreground text-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-10 right-10 text-background/5">
        <Quote className="h-64 w-64" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "3rem" }}
            viewport={{ once: true }}
            className="h-[2px] bg-accent mx-auto mb-6"
          />
          <p className="text-accent font-semibold tracking-[0.4em] uppercase text-xs mb-4">
            Client Stories
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
            What Our <span className="italic font-light">Clients Say</span>
          </h2>
        </motion.div>

        <div className="relative">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="flex justify-center gap-1 mb-6">
              {Array.from({ length: testimonials[active].rating }).map((_, j) => (
                <Star key={j} className="h-5 w-5 fill-accent text-accent" />
              ))}
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-light leading-relaxed mb-8 text-background/80">
              "{testimonials[active].text}"
            </p>
            <img
              src={testimonials[active].image}
              alt={testimonials[active].name}
              className="w-14 h-14 rounded-full object-cover mx-auto mb-3 border-2 border-accent/30"
            />
            <p className="font-semibold text-background">{testimonials[active].name}</p>
            <p className="text-background/50 text-sm">{testimonials[active].role}</p>
          </motion.div>

          <div className="flex justify-center gap-3 mt-10">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`transition-all duration-300 rounded-full ${
                  i === active ? "w-10 h-2.5 bg-accent" : "w-2.5 h-2.5 bg-background/20 hover:bg-background/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
