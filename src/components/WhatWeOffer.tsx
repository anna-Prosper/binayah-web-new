"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
const serviceBuy = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop";
const serviceRent = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop";
const serviceSell = "https://images.unsplash.com/photo-1560520031-3a4dc4e9de0c?w=600&h=400&fit=crop";
const serviceOffplan = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop";
const serviceManagement = "https://images.unsplash.com/photo-1582407947304-fd86f28320c5?w=600&h=400&fit=crop";

const offerings = [
  { image: serviceSell, title: "Sell Property", desc: "Expert valuation, marketing, and negotiation to maximize your return.", link: "/valuation" },
  { image: serviceBuy, title: "Buy Property", desc: "Find your perfect home from premium residential listings across Dubai.", link: "/search?intent=buy" },
  { image: serviceRent, title: "Rent Property", desc: "Discover exceptional rental homes in prime locations.", link: "/search?intent=rent" },
  { image: serviceOffplan, title: "Off-Plan Investment", desc: "Exclusive off-plan projects with high ROI potential.", link: "/off-plan" },
  { image: serviceManagement, title: "Property Management", desc: "Complete management solutions to protect your investment.", link: "/services" },
];

const WhatWeOffer = () => (
  <section className="py-12 sm:py-24 text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
    <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "48px 48px" }} />

    <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-5 sm:mb-14">
        <motion.div initial={{ width: 0 }} whileInView={{ width: "3rem" }} viewport={{ once: true }} className="h-[2px] mx-auto mb-3 sm:mb-6" style={{ background: "linear-gradient(90deg, #D4A847, #B8922F)" }} />
        <p className="font-semibold tracking-[0.4em] uppercase text-[10px] sm:text-xs mb-2 sm:mb-4" style={{ color: "#D4A847" }}>What We Offer</p>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold">
          <span className="sm:hidden">Our Services</span>
          <span className="hidden sm:inline">Comprehensive Real Estate <span className="italic font-light">Solutions</span></span>
        </h2>
        <p className="mt-3 sm:mt-5 text-white/60 max-w-lg mx-auto text-sm sm:text-base hidden sm:block">
          From buying your dream home to maximizing your investment returns, we provide end-to-end property services tailored to your goals.
        </p>
      </motion.div>

      {/* Mobile: horizontal swipable row */}
      <div className="sm:hidden flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4 no-scrollbar">
        {offerings.map((item, i) => (
          <motion.div key={item.title} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="snap-start flex-shrink-0 w-[62%]">
            <Link href={item.link} className="group block rounded-xl overflow-hidden bg-white/[0.06] border border-white/10">
              <div className="relative h-[130px]">
                <Image src={item.image} alt={item.title} fill sizes="62vw" className="object-cover transition-transform duration-500 group-active:scale-105" />
              </div>
              <div className="p-3">
                <h3 className="font-bold text-sm text-white mb-0.5">{item.title}</h3>
                <p className="text-white/50 text-[11px] leading-snug line-clamp-2">{item.desc}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Desktop: 5-column grid */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-5 gap-4">
        {offerings.map((item, i) => (
          <motion.div key={item.title} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
            <Link href={item.link} className="group block relative h-[280px] lg:h-[300px] rounded-2xl overflow-hidden">
              <Image src={item.image} alt={item.title} fill sizes="(max-width: 1024px) 50vw, 20vw" className="object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-bold text-base lg:text-lg text-white mb-1">{item.title}</h3>
                <p className="text-white/70 text-xs leading-relaxed line-clamp-2">{item.desc}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mt-6 sm:mt-10 hidden sm:block">
        <Link href="/services" className="inline-flex items-center px-8 py-3 rounded-full border border-[#D4A847]/50 font-semibold text-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-xl active:scale-[0.98] text-white" style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)" }}>
          View All Services
        </Link>
      </motion.div>
    </div>
  </section>
);

export default WhatWeOffer;