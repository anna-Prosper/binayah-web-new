"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Home, Users, Building2, Shield } from "lucide-react";

const offerings = [
  {
    icon: Home,
    title: "Buy Property",
    desc: "Find your perfect home from premium residential listings across Dubai.",
    link: "/communities",
    color: "#D4A847",
  },
  {
    icon: Users,
    title: "Rent Property",
    desc: "Discover exceptional rental homes in prime locations.",
    link: "/communities",
    color: "#D4A847",
  },
  {
    icon: Building2,
    title: "Off-Plan Investment",
    desc: "Exclusive off-plan projects with high ROI potential.",
    link: "/off-plan",
    color: "#D4A847",
  },
  {
    icon: Shield,
    title: "Property Management",
    desc: "Complete management solutions to protect and grow your investment.",
    link: "/services",
    color: "#D4A847",
  },
];

const WhatWeOffer = () => (
  <section
    className="py-14 sm:py-24 text-white relative overflow-hidden"
    style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
  >
    <div
      className="absolute inset-0 opacity-[0.04]"
      style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "48px 48px" }}
    />

    <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10 sm:mb-14"
      >
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: "3rem" }}
          viewport={{ once: true }}
          className="h-[2px] mx-auto mb-6"
          style={{ background: "linear-gradient(90deg, #D4A847, #B8922F)" }}
        />
        <p className="font-semibold tracking-[0.4em] uppercase text-xs mb-4" style={{ color: "#D4A847" }}>
          What We Offer
        </p>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
          Comprehensive Real Estate{" "}
          <span className="italic font-light">Solutions</span>
        </h2>
        <p className="mt-5 text-white/60 max-w-lg mx-auto">
          From buying your dream home to maximising your investment returns, we provide end-to-end property services tailored to your goals.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {offerings.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Link
              href={item.link}
              className="group flex flex-col gap-4 p-6 sm:p-7 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 h-full"
              style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(8px)" }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                style={{ background: `${item.color}25`, border: `1px solid ${item.color}40` }}
              >
                <item.icon className="h-6 w-6" style={{ color: item.color, strokeWidth: 1.75 }} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white mb-2">{item.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mt-8 sm:mt-10"
      >
        <Link
          href="/services"
          className="inline-flex items-center px-8 py-3 rounded-full border border-[#D4A847]/50 font-semibold text-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-xl active:scale-[0.98] text-white"
          style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)" }}
        >
          View All Services
        </Link>
      </motion.div>
    </div>
  </section>
);

export default WhatWeOffer;