"use client";

import Link from "next/link";
import { CheckCircle2, ArrowRight, Zap, Users, Camera, HeadphonesIcon, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

const PORTALS = [
  { name: "Property Finder", color: "#E84043", bg: "rgba(232,64,67,0.12)" },
  { name: "Dubizzle", color: "#FF6B35", bg: "rgba(255,107,53,0.12)" },
  { name: "Bayut", color: "#D4A017", bg: "rgba(212,160,23,0.12)" },
  { name: "Houza", color: "#6366F1", bg: "rgba(99,102,241,0.12)" },
];

const BENEFITS = [
  { Icon: Zap, text: "Live on all portals within 24 hours" },
  { Icon: Camera, text: "Professional photography & listing copy included" },
  { Icon: HeadphonesIcon, text: "One dedicated agent handles every enquiry" },
  { Icon: Users, text: "Reach 2M+ active buyers and renters in the UAE" },
  { Icon: CheckCircle2, text: "Zero upfront fees — commission only on completion" },
  { Icon: BarChart3, text: "Real-time dashboard: views, leads, and performance" },
];

export default function ListYourPropertySection() {
  return (
    <section className="py-16 sm:py-24 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">

          {/* ── Left: copy ── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-5">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-primary">Sell or Rent With Us</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4">
              Your property,{" "}
              <span style={{ background: "linear-gradient(to right, #0B3D2E, #1A7A5A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                everywhere at once.
              </span>
            </h2>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-7">
              One listing goes live on the UAE&apos;s top portals simultaneously. No juggling multiple accounts — your dedicated agent does it all.
            </p>

            {/* Portal chips */}
            <div className="flex flex-wrap gap-2.5 mb-8">
              {PORTALS.map(({ name, color, bg }) => (
                <span
                  key={name}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border"
                  style={{ color, background: bg, borderColor: `${color}30` }}
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                  {name}
                </span>
              ))}
            </div>

            {/* Benefits */}
            <ul className="space-y-3 mb-9">
              {BENEFITS.map(({ Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm text-foreground/80">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  {text}
                </li>
              ))}
            </ul>

            <Link
              href="/list-your-property"
              className="inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl text-white font-bold text-base transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] group"
              style={{ background: "linear-gradient(to right, #D4A847, #B8922F)", boxShadow: "0 8px 30px rgba(212,168,71,0.35)" }}
            >
              List My Property
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* ── Right: stats card ── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
            className="relative"
          >
            {/* Main card */}
            <div
              className="relative rounded-3xl overflow-hidden p-8 sm:p-10"
              style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
            >
              {/* Texture */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.018) 0px, rgba(255,255,255,0.018) 1px, transparent 1px, transparent 55px)" }}
              />
              {/* Gold glow */}
              <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none blur-3xl" style={{ background: "radial-gradient(circle, rgba(212,168,71,0.2), transparent 65%)" }} />

              <div className="relative">
                {/* Header */}
                <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: "#D4A847" }}>
                  Binayah Multi-Portal Listing
                </p>
                <p className="text-2xl font-bold text-white mb-8">Your property reaches:</p>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[
                    { value: "2M+", label: "Active buyers" },
                    { value: "3+", label: "Top portals" },
                    { value: "24h", label: "Time to live" },
                  ].map(({ value, label }) => (
                    <div key={label} className="text-center p-4 rounded-2xl bg-white/5 border border-white/8">
                      <p className="text-2xl sm:text-3xl font-bold text-white">{value}</p>
                      <p className="text-[11px] text-white/45 mt-1 leading-tight">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Portal live indicators */}
                <div className="space-y-2.5">
                  {PORTALS.map(({ name, color }) => (
                    <div key={name} className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/5 border border-white/8">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: color }} />
                        <span className="text-sm font-semibold text-white/80">{name}</span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-400">● Live</span>
                    </div>
                  ))}
                </div>

                {/* CTA hint */}
                <div className="mt-6 pt-5 border-t border-white/10 text-center">
                  <p className="text-xs text-white/35">One submission. We handle the rest.</p>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div
              className="absolute -bottom-4 -left-4 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border border-white/10"
              style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)" }}
            >
              <CheckCircle2 className="h-5 w-5 text-white flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">Zero upfront fees</p>
                <p className="text-[10px] text-white/70">Commission only on completion</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
