"use client";

import { motion } from "framer-motion";
import { ClipboardCheck, BarChart3, Wallet, Users, Wrench, ShieldCheck } from "lucide-react";

const services = [
  { icon: ClipboardCheck, title: "Property Handover & Snagging", desc: "Thorough inspection and seamless handover process" },
  { icon: BarChart3, title: "Marketing", desc: "Professional listing and exposure across top platforms" },
  { icon: Wallet, title: "Money Management", desc: "Rent collection, cheque tracking and financial reporting" },
  { icon: Users, title: "Tenant Management", desc: "Screening, contracts, and ongoing tenant relations" },
  { icon: Wrench, title: "Maintenance Services", desc: "Repairs, upkeep, and 24/7 emergency support" },
  { icon: ShieldCheck, title: "Dispute Resolution", desc: "Expert mediation and legal support when needed" },
];

const ServicesSection = () => (
  <section id="services" className="py-14 sm:py-24 bg-primary text-primary-foreground relative overflow-hidden scroll-mt-20">
    {/* Background pattern */}
    <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "48px 48px" }} />

    <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10 sm:mb-16"
      >
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: "3rem" }}
          viewport={{ once: true }}
          className="h-[2px] bg-accent mx-auto mb-6"
        />
        <p className="text-accent font-semibold tracking-[0.4em] uppercase text-xs mb-4">
          Property Management
        </p>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
          Complete Property <span className="italic font-light">Care</span>
        </h2>
        <p className="mt-5 text-primary-foreground/60 max-w-lg mx-auto">
          Our comprehensive management program ensures your investment is protected and performing at its best.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {services.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="group bg-primary-foreground/5 hover:bg-primary-foreground/10 border border-primary-foreground/10 rounded-2xl p-6 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4 group-hover:bg-accent group-hover:scale-110 transition-all duration-300">
              <s.icon className="h-5 w-5 text-accent group-hover:text-accent-foreground transition-colors" />
            </div>
            <h3 className="font-bold text-lg mb-2">
              {s.title}
            </h3>
            <p className="text-sm text-primary-foreground/60 leading-relaxed">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ServicesSection;
