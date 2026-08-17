"use client";

import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Clock, Sparkles } from "lucide-react";
// Locale-aware router: next/navigation's router.push takes a bare path, which
// localePrefix "as-needed" resolves to the DEFAULT locale, kicking non-English
// users into English mid-flow. This variant keeps them in their locale.
import { useRouter } from "@/navigation";
import { useTranslations } from "next-intl";

const ValuationStrip = () => {
  const router = useRouter();
  const t = useTranslations("home.sections.valuation");
  const pills = [
    { icon: TrendingUp, label: t("pillMarketComps") },
    { icon: Clock, label: t("pillReady") },
    { icon: Sparkles, label: t("pillAiEstimate") },
  ];

  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)",
        }}
      />
      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          background: "radial-gradient(ellipse at 20% 50%, hsl(43 60% 50%) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-10 lg:px-16 py-3 sm:py-8">
        {/* Feature pills - desktop only */}
        <div className="hidden sm:flex gap-2 mb-4 justify-start lg:justify-start">
          {pills.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium text-white/80 border border-white/15 bg-white/[0.06] backdrop-blur-sm whitespace-nowrap"
            >
              <Icon className="h-3 w-3 flex-shrink-0" style={{ color: "#D4A847" }} />
              {label}
            </span>
          ))}
        </div>

        {/* Mobile: single compact row */}
        <div className="flex sm:hidden items-center gap-2">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="flex shrink-0 w-8 h-8 rounded-lg items-center justify-center border border-white/10"
            style={{ background: "rgba(212,168,71,0.12)" }}
          >
            <Sparkles className="h-4 w-4" style={{ color: "#D4A847" }} />
          </motion.div>

          {/* Title + subtitle stacked */}
          <div className="flex-1 min-w-0">
            <h2 className="text-white text-sm font-bold leading-tight">
              {t("headlineStart")}{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(90deg, #D4A847, #C49B35)" }}
              >
                {t("headlineGold")}
              </span>
            </h2>
            <p className="text-white/50 text-[10px] leading-snug mt-0.5">
              {t("stripSubtitle")}
            </p>
          </div>

          {/* Compact CTA */}
          <motion.button
            onClick={() => router.push("/valuation")}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="group inline-flex items-center gap-1 px-3 py-2 rounded-full text-xs font-bold tracking-wide whitespace-nowrap transition-all duration-300 shrink-0 min-h-[44px]"
            style={{
              background: "linear-gradient(135deg, #D4A847 0%, #B8922F 100%)",
              color: "#ffffff",
              boxShadow: "0 4px 20px rgba(212,168,71,0.3)",
            }}
          >
            {t("ctaMobile")}
            <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
          </motion.button>
        </div>

        {/* Desktop: original layout */}
        <div className="hidden sm:flex sm:flex-row items-start sm:items-center gap-3 sm:gap-6 lg:gap-10">
          {/* Icon + Copy */}
          <div className="flex items-start gap-2.5 sm:gap-4 flex-1 min-w-0">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="flex shrink-0 w-11 h-11 rounded-xl items-center justify-center border border-white/10"
              style={{ background: "rgba(212,168,71,0.12)" }}
            >
              <Sparkles className="h-5 w-5" style={{ color: "#D4A847" }} />
            </motion.div>

            <div className="min-w-0">
              <p
                className="text-[10px] font-semibold tracking-[0.25em] uppercase mb-0.5"
                style={{ color: "#D4A847" }}
              >
                {t("marketYear")}
              </p>
              <h2 className="text-white text-lg font-bold leading-snug">
                {t("headlineStart")}{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: "linear-gradient(90deg, #D4A847, #C49B35)" }}
                >
                  {t("headlineGold")}
                </span>
              </h2>
              <p className="text-white/45 text-sm leading-relaxed mt-1">
                {t("stripSubtitle")}
              </p>
            </div>
          </div>

          {/* CTA */}
          <motion.button
            onClick={() => router.push("/valuation")}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold tracking-wide whitespace-nowrap transition-all duration-300 shrink-0"
            style={{
              background: "linear-gradient(135deg, #D4A847 0%, #B8922F 100%)",
              color: "#ffffff",
              boxShadow: "0 4px 20px rgba(212,168,71,0.3)",
            }}
          >
            {t("cta")}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default ValuationStrip;