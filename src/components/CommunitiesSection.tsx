"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const communities = [
  { name: "Downtown Dubai", slug: "downtown-dubai", properties: "450+", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=800&fit=crop" },
  { name: "Palm Jumeirah", slug: "palm-jumeirah", properties: "320+", image: "https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?w=600&h=800&fit=crop" },
  { name: "Dubai Marina", slug: "dubai-marina", properties: "580+", image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=600&h=800&fit=crop" },
  { name: "Business Bay", slug: "business-bay", properties: "290+", image: "https://images.unsplash.com/photo-1546412414-e1885259563a?w=600&h=800&fit=crop" },
];

const CommunitiesSection = () => (
  <section id="communities" className="py-12 sm:py-24 bg-card scroll-mt-20">
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-6 sm:mb-14"
      >
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: "3rem" }}
          viewport={{ once: true }}
          className="h-[2px] mx-auto mb-4 sm:mb-6"
          style={{ background: "linear-gradient(90deg, #D4A847, #B8922F)" }}
        />
        <p className="font-semibold tracking-[0.4em] uppercase text-[10px] sm:text-xs mb-2 sm:mb-4" style={{ color: "#D4A847" }}>
          Explore Dubai
        </p>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-foreground">
          Premier <span className="italic font-light">Communities</span>
        </h2>
      </motion.div>

      {/* Mobile: horizontal scroll */}
      <div className="sm:hidden -mx-4 px-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide flex gap-3 pb-2">
        {communities.map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="flex-shrink-0 w-[60%] snap-center"
          >
            <Link href={`/communities/${c.slug}`} className="group block relative rounded-2xl overflow-hidden aspect-[3/4]">
              <Image src={c.image} alt={c.name} fill sizes="100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-bold text-base mb-0.5">{c.name}</h3>
                <p className="text-white/70 text-xs">{c.properties} properties</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Desktop grid */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {communities.map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Link href={`/communities/${c.slug}`} className="group block relative rounded-2xl overflow-hidden aspect-[3/4]">
              <Image src={c.image} alt={c.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="text-white font-bold text-lg mb-1">{c.name}</h3>
                <div className="flex items-center justify-between">
                  <p className="text-white/70 text-sm">{c.properties} properties</p>
                  <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                    <ArrowUpRight className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default CommunitiesSection;