"use client";

import { motion } from "framer-motion";
import { ClipboardCheck, BarChart3, Wallet, Users, Wrench, ShieldCheck, Star } from "lucide-react";

const services = [
  { icon: ClipboardCheck, title: "Handover & Snagging", desc: "Thorough inspection and seamless handover process", popular: true },
  { icon: Wallet, title: "Rent Collection", desc: "Cheque tracking, deposits, and financial reporting", popular: true },
  { icon: BarChart3, title: "Marketing", desc: "Professional listing and exposure across top platforms" },
  { icon: Users, title: "Tenant Management", desc: "Screening, contracts, and ongoing tenant relations" },
  { icon: Wrench, title: "Maintenance", desc: "Repairs, upkeep, and 24/7 emergency support" },
  { icon: ShieldCheck, title: "Dispute Resolution", desc: "Expert mediation and legal support when needed" },
];

const ServicesSection = () => (
  <section id="services" className="py-10 sm:py-24 text-white relative overflow-hidden scroll-mt-20" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
    <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "48px 48px" }} />

    <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
      {/* Desktop header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="hidden sm:block text-center mb-16"
      >
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: "3rem" }}
          viewport={{ once: true }}
          className="h-[2px] mx-auto mb-6"
          style={{ background: "linear-gradient(90deg, #D4A847, #B8922F)" }}
        />
        <p className="font-semibold tracking-[0.4em] uppercase text-xs mb-4" style={{ color: "#D4A847" }}>
          Property Management
        </p>
        <h2 className="text-4xl lg:text-5xl font-bold">
          Complete Property <span className="italic font-light">Care</span>
        </h2>
        <p className="mt-5 text-white/60 max-w-lg mx-auto text-base">
          Comprehensive management ensuring your investment is protected.
        </p>
      </motion.div>

      {/* Mobile: inline label, no big header */}
      <div className="sm:hidden flex items-center gap-2 mb-4">
        <div className="h-[2px] w-6" style={{ background: "linear-gradient(90deg, #D4A847, #B8922F)" }} />
        <p className="font-semibold tracking-[0.3em] uppercase text-[10px]" style={{ color: "#D4A847" }}>
          Property Management
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-5">
        {services.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className={`group relative bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-6 transition-all duration-300 ${
              s.popular ? "sm:bg-white/[0.07]" : ""
            }`}
          >
            {/* Popular tag on mobile */}
            {s.popular && (
              <span className="sm:hidden absolute -top-1.5 right-2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[7px] font-bold uppercase tracking-wider bg-[#D4A847] text-[#0B3D2E]">
                <Star className="h-1.5 w-1.5 fill-current" /> Popular
              </span>
            )}
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-[#D4A847]/20 flex items-center justify-center mb-2 sm:mb-4 group-hover:scale-105 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)" }} />
              <s.icon className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-[#D4A847] group-hover:text-white transition-colors relative z-10" />
            </div>
            <h3 className="font-bold text-[11px] sm:text-lg mb-0.5 sm:mb-2 leading-snug">
              {s.title}
            </h3>
            <p className="text-[10px] sm:text-sm text-white/60 leading-snug line-clamp-2">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ServicesSection;