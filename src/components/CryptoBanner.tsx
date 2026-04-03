"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
const cryptoBg = "/assets/crypto-banner.jpeg";

const CryptoBanner = () => (
  <section className="relative overflow-hidden my-2 sm:my-0">
    <div className="relative h-[130px] sm:h-[200px] lg:h-[240px]">
      {/* Background image */}
      <img
        src={cryptoBg}
        alt="Buy property with cryptocurrency"
        loading="lazy"
        width={1920}
        height={512}
        className="absolute inset-0 w-full h-full object-cover object-[center_25%]"
      />
      {/* Rich dual overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#3a2206]/80 via-[#5a3a10]/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-10 lg:px-16 flex items-center justify-between gap-4"
      >
        <div>
          <p className="text-white/60 text-[9px] sm:text-[11px] font-semibold tracking-[0.3em] uppercase mb-1 sm:mb-2">
            Now Accepting
          </p>
          <h2 className="text-white text-lg sm:text-3xl lg:text-[2.5rem] font-bold leading-[1.15]">
            Buy Property with
          </h2>
          <p className="text-white/80 text-base sm:text-2xl lg:text-[2rem] italic font-light leading-tight mt-0.5">
            Bitcoin & Crypto
          </p>
        </div>

        <motion.a
          href="https://wa.me/971504487540?text=Hi%2C%20I%E2%80%99m%20interested%20in%20buying%20property%20with%20cryptocurrency"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="hidden sm:inline-flex items-center gap-2.5 px-8 py-3.5 rounded-lg text-sm font-bold tracking-wide uppercase transition-all duration-300 shrink-0 hover:shadow-[0_6px_28px_rgba(212,168,71,0.5)] hover:brightness-110"
          style={{
            background: "linear-gradient(135deg, #D4A847 0%, #C49B35 50%, #B8922F 100%)",
            color: "#fff",
            boxShadow: "0 4px 20px rgba(212,168,71,0.35)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          Learn More
          <ArrowRight className="h-4 w-4" />
        </motion.a>
      </motion.div>

      {/* Mobile CTA */}
      <motion.a
        href="https://wa.me/971504487540?text=Hi%2C%20I%E2%80%99m%20interested%20in%20buying%20property%20with%20cryptocurrency"
        target="_blank"
        rel="noopener noreferrer"
        className="sm:hidden absolute bottom-4 right-4 z-10 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold text-white"
        style={{
          background: "linear-gradient(135deg, #D4A847, #B8922F)",
          boxShadow: "0 3px 16px rgba(212,168,71,0.3)",
        }}
      >
        Learn More
        <ArrowRight className="h-3.5 w-3.5" />
      </motion.a>
    </div>
  </section>
);

export default CryptoBanner;