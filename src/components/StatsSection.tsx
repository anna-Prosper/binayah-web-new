"use client";

import { motion } from "framer-motion";
import { Building2, Users, Award, MapPin } from "lucide-react";

const stats = [
  { icon: Building2, value: "2,500+", label: "Properties Listed" },
  { icon: Users, value: "1,200+", label: "Happy Clients" },
  { icon: Award, value: "15+", label: "Industry Awards" },
  { icon: MapPin, value: "50+", label: "Communities Covered" },
];

const StatsSection = () => (
  <section className="py-14 sm:py-24 bg-card relative overflow-hidden">
    {/* Subtle pattern */}
    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "40px 40px" }} />

    <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="text-center mb-10 sm:mb-16"
      >
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: "3rem" }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="h-[2px] bg-accent mx-auto mb-6"
        />
        <p className="text-accent font-semibold tracking-[0.4em] uppercase text-xs mb-4">
          Why Choose Us
        </p>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
          Award Winning Real Estate
          <br />
          <span className="italic font-light">Agency in Dubai</span>
        </h2>
        <p className="mt-5 text-muted-foreground max-w-lg mx-auto">
          With over a decade of experience, we've helped thousands of clients find their dream properties in Dubai's most sought-after communities.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.12 }}
            className="text-center group"
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-5 rounded-2xl bg-primary/8 border border-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-300">
              <stat.icon className="h-5 w-5 sm:h-7 sm:w-7 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
            </div>
            <p className="text-2xl sm:text-5xl font-bold text-foreground mb-1 sm:mb-2">
              {stat.value}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium tracking-wide">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default StatsSection;
