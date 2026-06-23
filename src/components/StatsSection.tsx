"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";

const StatsSection = () => {
  const t = useTranslations("home.sections.stats");
  const stats = [
    { value: "3,000+", label: t("propertiesListed") },
    { value: "12,000+", label: t("happyClients") },
    { value: "19+", label: t("industryAwards") },
    { value: "60+", label: t("communitiesCovered") },
  ];

  return (
    <section className="py-14 sm:py-24 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0B3D2E 0%, #0e4f3a 100%)" }}>
      {/* Subtle dot grid */}
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "44px 44px" }} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left — text + stats */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "3rem" }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="h-[2px] mb-4"
              style={{ background: "linear-gradient(90deg, #D4A847, #B8922F)" }}
            />
            <p className="font-semibold tracking-[0.4em] uppercase text-[10px] sm:text-xs mb-3 sm:mb-4" style={{ color: "#D4A847" }}>
              {t("label")}
            </p>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 sm:mb-5">
              {t("title")}<br />
              <span className="font-light text-white/80">{t("titleItalic")}</span>
            </h2>
            <p className="text-white/50 text-sm sm:text-base leading-relaxed mb-10 max-w-md">
              {t("subtitle")}
            </p>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
                  className="rounded-2xl border border-white/10 px-5 py-4 hover:border-white/20 transition-colors"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  <p className="text-3xl sm:text-4xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-white/45 text-xs sm:text-sm font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right — photo */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/40"
            style={{ aspectRatio: "4/5" }}
          >
            <Image
              src="/assets/team.webp"
              alt="Binayah Properties team"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 600px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default StatsSection;
