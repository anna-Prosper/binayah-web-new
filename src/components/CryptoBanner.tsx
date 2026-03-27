"use client";

import { motion } from "framer-motion";
import { ArrowRight, Bitcoin } from "lucide-react";

const CryptoBanner = () => (
  <section className="relative overflow-hidden">
    {/* Background image */}
    <img
      src="/assets/crypto-banner.jpeg"
      alt="Buy property with cryptocurrency"
      className="absolute inset-0 w-full h-full object-cover object-[center_25%]"
    />
    {/* Rich dual overlay — matches reference */}
    <div className="absolute inset-0 bg-gradient-to-r from-[#3a2206]/80 via-[#5a3a10]/40 to-transparent" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

    <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-10 sm:py-14">
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
      >
        <div className="flex items-center gap-5">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/10"
            style={{ background: "rgba(212,168,71,0.15)" }}
          >
            <Bitcoin className="h-7 w-7" style={{ color: "#D4A847" }} />
          </div>

          <div>
            <p className="text-white/50 text-[10px] sm:text-[11px] font-semibold tracking-[0.35em] uppercase mb-1">
              Now Accepting
            </p>
            <h2 className="text-white text-xl sm:text-2xl lg:text-3xl font-bold leading-tight">
              Buy Property with{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(90deg, #D4A847, #F0C960)" }}
              >
                Bitcoin &amp; Crypto
              </span>
            </h2>
            <p className="text-white/45 text-sm mt-1 hidden sm:block">
              BTC, ETH, USDT and more — seamless, secure property transactions.
            </p>
          </div>
        </div>

        <motion.a
          href="https://wa.me/971504487540?text=Hi%2C%20I%E2%80%99m%20interested%20in%20buying%20property%20with%20cryptocurrency"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-300"
          style={{
            background: "linear-gradient(135deg, #D4A847 0%, #C49B35 50%, #B8922F 100%)",
            color: "#1a0f00",
            boxShadow: "0 4px 20px rgba(212,168,71,0.4)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          Inquire Now
          <ArrowRight className="h-4 w-4" />
        </motion.a>
      </motion.div>
    </div>
  </section>
);

export default CryptoBanner;