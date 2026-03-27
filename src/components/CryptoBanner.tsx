"use client";

import { motion } from "framer-motion";
import { ArrowRight, Bitcoin } from "lucide-react";

const cryptoIcons = ["₿", "Ξ", "◎", "✦"];

const CryptoBanner = () => (
  <section className="relative overflow-hidden">
    <div
      className="absolute inset-0"
      style={{ background: "linear-gradient(135deg, #1a0f00 0%, #3a2206 40%, #5a3a10 70%, #2a1800 100%)" }}
    />
    {/* Gold shimmer overlay */}
    <div
      className="absolute inset-0 opacity-20"
      style={{ background: "radial-gradient(ellipse at 30% 50%, #D4A847 0%, transparent 60%)" }}
    />
    {/* Dot texture */}
    <div
      className="absolute inset-0 opacity-[0.06]"
      style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #D4A847 1px, transparent 0)", backgroundSize: "32px 32px" }}
    />

    {/* Floating crypto symbols */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {cryptoIcons.map((icon, i) => (
        <motion.span
          key={i}
          className="absolute text-white/5 font-bold select-none"
          style={{
            fontSize: `${80 + i * 30}px`,
            top: `${10 + i * 20}%`,
            right: `${5 + i * 8}%`,
          }}
          animate={{ y: [0, -12, 0], rotate: [0, 3, 0] }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 }}
        >
          {icon}
        </motion.span>
      ))}
    </div>

    <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-10 sm:py-14">
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
      >
        <div className="flex items-center gap-5">
          {/* Icon */}
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

        <div className="flex items-center gap-3 flex-shrink-0">
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
        </div>
      </motion.div>
    </div>
  </section>
);

export default CryptoBanner;