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
        style={{ background: "linear-gradient(135deg, #0B3D2E 0%, #0D4A36 40%, #1A7A5A 100%)" }}
      />
      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{ background: "radial-gradient(ellipse at 20% 50%, hsl(43, 60%, 50%) 0%, transparent 60%)" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-7 sm:py-8">
        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 mb-4 justify-center lg:justify-start">
          {pills.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium text-white/80 border border-white/15 bg-white/[0.06] backdrop-blur-sm whitespace-nowrap"
            >
              <Icon className="h-3 w-3" style={{ color: "#D4A847" }} />
              {label}
            </span>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-10">
          {/* Icon + Copy */}
          <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center border border-white/10"
              style={{ background: "rgba(212,168,71,0.12)" }}
            >
              <Sparkles className="h-5 w-5" style={{ color: "#D4A847" }} />
            </motion.div>

            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-[0.3em] uppercase mb-1" style={{ color: "#D4A847" }}>
                Dubai Market · 2026
              </p>
              <h3 className="text-white text-base sm:text-lg font-bold leading-snug">
                Own a property in the UAE?{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: "linear-gradient(90deg, #D4A847, #C49B35)" }}
                >
                  Find out what it&apos;s worth today.
                </span>
              </h3>
              <p className="text-white/45 text-sm leading-relaxed mt-1 hidden sm:block">
                With rates shifting and demand at record highs, owners are getting AI valuations before deciding to sell, hold, or refinance.
              </p>
            </div>
          </div>

          {/* CTA */}
          <motion.button
            onClick={() => router.push("/valuation")}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-sm font-bold tracking-wide whitespace-nowrap transition-all duration-300 shrink-0"
            style={{
              background: "linear-gradient(135deg, #D4A847 0%, #B8922F 100%)",
              color: "#0B3D2E",
              boxShadow: "0 4px 20px rgba(212,168,71,0.3)",
            }}
          >
            Get free valuation
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default ValuationStrip;