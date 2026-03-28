"use client";

import { motion } from "framer-motion";
import { Target, ArrowRight, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";

const pills = [
  { icon: TrendingUp, text: "Live market comps" },
  { icon: Clock,      text: "Ready in 2 minutes" },
  { icon: Target,     text: "AI-powered estimate" },
];

const ValuationBanner = () => (
  <section className="relative bg-[#004e41] overflow-hidden">
    {/* Subtle animated grain / texture */}
    <div
      className="absolute inset-0 opacity-[0.04] pointer-events-none"
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
        backgroundSize: "28px 28px",
      }}
    />

    {/* Gold accent line at top */}
    <div className="absolute top-0 left-0 right-0 h-[2px]">
      <motion.div
        className="h-full bg-gradient-to-r from-transparent via-[#d1ae4a] to-transparent"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        style={{ width: "40%" }}
      />
    </div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">

        {/* Left — copy */}
        <div className="flex items-start sm:items-center gap-4">
          {/* Icon */}
          <div className="relative flex-shrink-0 mt-0.5 sm:mt-0">
            <div className="w-10 h-10 rounded-xl bg-[#d1ae4a]/20 flex items-center justify-center">
              <Target className="h-5 w-5 text-[#d1ae4a]" />
            </div>
            <motion.div
              className="absolute inset-0 rounded-xl border border-[#d1ae4a]/40"
              animate={{ scale: [1, 1.45], opacity: [0.5, 0] }}
              transition={{ duration: 2.2, repeat: Infinity }}
            />
          </div>

          <div>
            {/* Urgency eyebrow */}
            <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#d1ae4a] mb-1">
              Dubai Market · 2026
            </p>
            <p className="text-white font-bold text-base sm:text-lg leading-snug">
              Own a property in the UAE?{" "}
              <span className="text-[#d1ae4a]">Find out what it&apos;s worth today.</span>
            </p>
            <p className="text-white/50 text-xs sm:text-sm mt-1 max-w-md leading-relaxed">
              With rates shifting and demand at record highs, owners are getting
              AI valuations before deciding to sell, hold, or refinance.
            </p>
          </div>
        </div>

        {/* Right — pills + CTA */}
        <div className="flex flex-col items-start sm:items-end gap-3 sm:flex-shrink-0">
          {/* Feature pills */}
          <div className="flex flex-wrap gap-2">
            {pills.map(({ icon: Icon, text }) => (
              <span
                key={text}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/8 border border-white/10 text-white/60 text-[11px] font-semibold"
              >
                <Icon className="h-3 w-3 text-[#d1ae4a]" />
                {text}
              </span>
            ))}
          </div>

          {/* CTA */}
          <Link
            href="/valuation"
            className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-full font-bold text-sm text-[#004e41] bg-accent hover:bg-[#d1ae4a]/90 transition-all duration-200 hover:shadow-lg hover:shadow-[#d1ae4a]/20 hover:-translate-y-px active:translate-y-0 whitespace-nowrap"
          >
            Get free valuation
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  </section>
);

export default ValuationBanner;
