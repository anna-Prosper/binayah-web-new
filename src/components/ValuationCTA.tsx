"use client";

import { motion } from "framer-motion";
import { ArrowRight, Clock, BarChart3, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

const stats = [
  { icon: Clock, value: "60s", label: "Average Time" },
  { icon: BarChart3, value: "12+", label: "Data Points" },
  { icon: Shield, value: "100%", label: "Free & Private" },
];

const ValuationCTA = () => {
  const router = useRouter();

  return (
    <section className="relative py-10 sm:py-32 overflow-hidden">
      {/* Charcoal gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #1A1F2E 0%, #0F1218 50%, #0D1015 100%)",
        }}
      />

      {/* Animated accent glows */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.06, 0.1, 0.06] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(168 100% 20%) 0%, transparent 70%)",
        }}
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.04, 0.08, 0.04] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(43 60% 40%) 0%, transparent 70%)",
        }}
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-10 lg:px-16">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-20 items-center">
          {/* Left – Copy */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Mobile: differentiated as "Detailed Report" vs the strip's "Quick Estimate" */}
            <p
              className="text-[10px] sm:text-[11px] font-semibold tracking-[0.35em] uppercase mb-2 sm:mb-4"
              style={{ color: "hsl(43 60% 55%)" }}
            >
              <span className="sm:hidden">Detailed Property Report</span>
              <span className="hidden sm:inline">Free Instant Estimate</span>
            </p>
            <h2 className="text-white text-xl sm:text-4xl lg:text-[2.75rem] font-bold leading-[1.15] mb-2 sm:mb-5">
              What's Your Property{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(90deg, #D4A847, #B8922F)",
                }}
              >
                Really Worth?
              </span>
            </h2>
            <p className="text-white/55 text-xs sm:text-lg leading-relaxed max-w-lg mb-4 sm:mb-8">
              Get an AI-driven valuation in under 60 seconds — completely free.
            </p>

            {/* Stats row only (pills removed) */}
            <div className="flex gap-4 sm:gap-8 mb-5 sm:mb-10">
              {stats.map(({ icon: Icon, value, label }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 * i }}
                  className="flex items-center gap-2"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center bg-white/[0.06] border border-white/[0.08]">
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/50" />
                  </div>
                  <div>
                    <p className="text-white text-xs sm:text-sm font-bold leading-none">{value}</p>
                    <p className="text-white/35 text-[9px] sm:text-[10px] tracking-wider uppercase mt-0.5">{label}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <motion.button
              onClick={() => router.push("/valuation")}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="group inline-flex items-center gap-2.5 px-6 py-3 sm:px-8 sm:py-4 rounded-xl text-xs sm:text-sm font-bold tracking-wide text-white transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #0B3D2E 0%, #1A7A5A 100%)",
                boxShadow: "0 6px 28px rgba(11,61,46,0.4)",
              }}
            >
              Get Your Free Valuation
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </motion.button>
          </motion.div>

          {/* Right – Visual card (desktop only) */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden lg:block"
          >
            <div
              className="rounded-2xl p-8 sm:p-10 border border-white/[0.08] backdrop-blur-sm"
              style={{ background: "rgba(255,255,255,0.025)" }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-white/40 text-xs font-medium tracking-wider uppercase">
                    Sample Valuation
                  </span>
                </div>
                <span
                  className="text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full"
                  style={{
                    color: "hsl(168 80% 40%)",
                    background: "hsla(168, 80%, 40%, 0.1)",
                    border: "1px solid hsla(168, 80%, 40%, 0.2)",
                  }}
                >
                  High Confidence
                </span>
              </div>

              <div className="flex items-center gap-3 mb-5 pb-5 border-b border-white/[0.06]">
                <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-white/40" />
                </div>
                <div>
                  <p className="text-white/70 text-sm font-medium">2BR Apartment · Downtown Dubai</p>
                  <p className="text-white/30 text-xs">1,250 sqft · Tower A · Floor 24</p>
                </div>
              </div>

              <p className="text-white/50 text-sm mb-1">Estimated Fair Value</p>
              <p className="text-white text-3xl sm:text-5xl font-bold tracking-tight mb-4 sm:mb-6">
                AED 2.4
                <span className="text-2xl sm:text-3xl text-white/60 font-normal">M</span>
                <span className="text-white/30 text-lg font-normal mx-2">–</span>
                2.8
                <span className="text-2xl sm:text-3xl text-white/60 font-normal">M</span>
              </p>

              <div className="flex rounded-full overflow-hidden h-3 mb-2">
                <motion.div
                  className="flex-1"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                  style={{ background: "linear-gradient(90deg, #D4A847, #B8922F)", transformOrigin: "left" }}
                />
                <motion.div
                  className="flex-1"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                  style={{ background: "#0B3D2E", transformOrigin: "left" }}
                />
                <motion.div
                  className="flex-1"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
                  style={{ background: "#1A7A5A", transformOrigin: "left" }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-white/40 font-medium tracking-wider uppercase mb-8">
                <span>Quick Sale</span>
                <span>Fair Value</span>
                <span>Suggested List</span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Comparables", value: "12" },
                  { label: "Avg AED/sqft", value: "1,420" },
                  { label: "YoY Growth", value: "+8.3%" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.6 + 0.1 * i }}
                    className="text-center rounded-xl py-3 bg-white/[0.03] border border-white/[0.06]"
                  >
                    <p className="text-white text-lg font-bold">{stat.value}</p>
                    <p className="text-white/35 text-[10px] tracking-wider uppercase">
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div
              className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full opacity-20 blur-3xl pointer-events-none"
              style={{ background: "hsl(168 100% 20%)" }}
            />
            <div
              className="absolute -top-6 -left-6 w-32 h-32 rounded-full opacity-10 blur-3xl pointer-events-none"
              style={{ background: "hsl(43 60% 50%)" }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ValuationCTA;