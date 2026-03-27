"use client";

import { motion } from "framer-motion";
import { Target, TrendingUp, Sparkles, ArrowRight, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

const stats = [
  { value: "48h", label: "Average turnaround" },
  { value: "AED", label: "Accurate to ±3%" },
  { value: "Free", label: "No obligation" },
];

export default function ValuationBanner() {
  const router = useRouter();

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, #0B3D2E 0%, #1A7A5A 50%, #0B3D2E 100%)" }} />

      {/* Dot texture */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)", backgroundSize: "28px 28px" }} />

      {/* Gold accent top */}
      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: "linear-gradient(90deg, transparent, #D4A847, #B8922F, #D4A847, transparent)" }} />

      {/* Gold accent bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{ background: "linear-gradient(90deg, transparent, #D4A847, #B8922F, #D4A847, transparent)" }} />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left — copy */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)" }}>
                <Target className="h-4 w-4 text-white" />
              </div>
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-white/60">
                AI Property Valuation
              </p>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.1] mb-5">
              Know your property's{" "}
              <span style={{ background: "linear-gradient(to right, #D4A847, #F0C960)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                true value
              </span>
              {" "}in minutes.
            </h2>

            <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-lg">
              Our AI analyses recent sales, active listings, and market trends to give you a data-backed valuation — not a guess.
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap gap-6 mb-10">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-white/50 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push("/valuation")}
                className="inline-flex items-center gap-2.5 px-7 py-4 rounded-full font-bold text-white text-sm transition-all shadow-lg"
                style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)", boxShadow: "0 8px 24px -4px rgba(212,168,71,0.4)" }}
              >
                <Sparkles className="h-4 w-4" />
                Get Free Valuation
                <ArrowRight className="h-4 w-4" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push("/valuation")}
                className="inline-flex items-center gap-2.5 px-7 py-4 rounded-full font-bold text-white/80 text-sm border border-white/20 hover:border-white/40 hover:text-white transition-all"
              >
                <FileText className="h-4 w-4" />
                Upload Title Deed
              </motion.button>
            </div>
          </motion.div>

          {/* Right — feature cards */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {[
              {
                icon: TrendingUp,
                title: "Live market data",
                desc: "Pulls from DLD transactions, current listings on Property Finder and Bayut, updated in real-time.",
                color: "#D4A847",
              },
              {
                icon: Target,
                title: "Three-number breakdown",
                desc: "Fair value, suggested list price, and quick-sale range — so you know exactly where to price.",
                color: "#1A7A5A",
              },
              {
                icon: Sparkles,
                title: "Expert strategy included",
                desc: "Every report includes comparable evidence, market read, and a recommended pricing strategy.",
                color: "#D4A847",
              },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                viewport={{ once: true }}
                className="flex gap-4 p-5 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300"
                style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(8px)" }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: `${card.color}22`, border: `1px solid ${card.color}33` }}>
                  <card.icon className="h-5 w-5" style={{ color: card.color }} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm mb-1">{card.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{card.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}