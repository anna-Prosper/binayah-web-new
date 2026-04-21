"use client";

import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Clock, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

const pills = [
  { icon: TrendingUp, label: "Live market comps" },
  { icon: Clock, label: "Ready in 2 minutes" },
  { icon: Sparkles, label: "AI-powered estimate" },
];

const ValuationStrip = () => {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)",
        }}
      />
      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          background: "radial-gradient(ellipse at 20% 50%, hsl(43 60% 50%) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-10 lg:px-16 py-4 sm:py-8">
        {/* Feature pills - desktop only */}
        <div className="hidden sm:flex gap-2 mb-4 justify-start lg:justify-start">
          {pills.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium text-white/80 border border-white/15 bg-white/[0.06] backdrop-blur-sm whitespace-nowrap"
            >
              <Icon className="h-3 w-3 flex-shrink-0" style={{ color: "#D4A847" }} />
              {label}
            </span>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 lg:gap-10">
          {/* Icon + Copy */}
          <div className="flex items-start gap-2.5 sm:gap-4 flex-1 min-w-0">
            {/* Sparkle icon - desktop only */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="flex shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl items-center justify-center border border-white/10"
              style={{ background: "rgba(212,168,71,0.12)" }}
            >
              <Sparkles className="h-5 w-5" style={{ color: "#D4A847" }} />
            </motion.div>

            <div className="min-w-0">
              {/* Desktop label */}
              <p
                className="hidden sm:block text-[10px] font-semibold tracking-[0.25em] uppercase mb-0.5"
                style={{ color: "#D4A847" }}
              >
                Dubai Market · 2026
              </p>
              {/* Desktop headline */}
              <h3 className="hidden sm:block text-white text-lg font-bold leading-snug">
                Your UAE property could be worth more.{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: "linear-gradient(90deg, #D4A847, #C49B35)" }}
                >
                  Find out in 2 minutes.
                </span>
              </h3>
              {/* Mobile headline - no label, compact */}
              <h3 className="sm:hidden text-white text-base font-bold leading-snug tracking-tight">
                Your UAE property could be worth more.
              </h3>
              <p className="sm:hidden text-sm font-semibold mt-1 bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg, #D4A847, #C49B35)" }}>
                Find out in 2 minutes.
              </p>
              <p className="text-white/45 text-xs sm:text-sm leading-relaxed mt-1 hidden sm:block">
                With rates shifting and demand at record highs, owners are getting AI valuations before deciding to sell, hold, or refinance.
              </p>
            </div>
          </div>

          {/* CTA */}
          <motion.button
            onClick={() => router.push("/valuation")}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="group inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-full text-xs sm:text-sm font-bold tracking-wide whitespace-nowrap transition-all duration-300 shrink-0"
            style={{
              background: "linear-gradient(135deg, #D4A847 0%, #B8922F 100%)",
              color: "#0B3D2E",
              boxShadow: "0 4px 20px rgba(212,168,71,0.3)",
            }}
          >
            Get your valuation
            <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </motion.button>
        </div>

        {/* Mobile proof line - below CTA */}
        <p className="sm:hidden text-white/40 text-[9px] mt-2 tracking-wide">
          AI-powered · Live comps · Ready in 2 min
        </p>
      </div>
    </section>
  );
};

export default ValuationStrip;