"use client";

import { motion } from "framer-motion";
import { Building2, Users, Award, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";

const StatsSection = () => {
  const t = useTranslations("home.sections.stats");
  const stats = [
    { icon: Building2, value: "2,500+", label: t("propertiesListed") },
    { icon: Users, value: "1,200+", label: t("happyClients") },
    { icon: Award, value: "15+", label: t("industryAwards") },
    { icon: MapPin, value: "50+", label: t("communitiesCovered") },
  ];
  return (
  <section className="py-10 sm:py-24 bg-card relative overflow-hidden">
    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "40px 40px" }} />

    <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="text-center mb-6 sm:mb-16"
      >
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: "3rem" }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="h-[2px] mx-auto mb-3 sm:mb-6"
          style={{ background: "linear-gradient(90deg, #D4A847, #B8922F)" }}
        />
        <p className="font-semibold tracking-[0.4em] uppercase text-[10px] sm:text-xs mb-2 sm:mb-4" style={{ color: "#D4A847" }}>
          {t("label")}
        </p>
        <h2 className="text-xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
          <span className="sm:hidden">{t("titleMobile")}</span>
          <span className="hidden sm:inline">{t("title")}<br /><span className="italic font-light">{t("titleItalic")}</span></span>
        </h2>
        <p className="mt-3 sm:mt-5 text-muted-foreground max-w-lg mx-auto text-sm sm:text-base hidden sm:block">
          {t("subtitle")}
        </p>
      </motion.div>

      {/* Mobile: compact stats with icons */}
      <div className="sm:hidden grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="flex items-center gap-3 rounded-xl px-3 py-3"
            style={{ background: "linear-gradient(135deg, rgba(11,61,46,0.05), rgba(26,122,90,0.08))" }}
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
              <stat.icon className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground leading-none">{stat.value}</p>
              <p className="text-[9px] text-muted-foreground font-medium mt-0.5 leading-tight">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Desktop: original card grid */}
      <div className="hidden sm:grid grid-cols-4 gap-6 lg:gap-10">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.12 }}
            className="text-center group"
          >
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-all duration-300 relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(11,61,46,0.08), rgba(26,122,90,0.12))" }}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }} />
              <stat.icon className="h-7 w-7 text-[#0B3D2E] group-hover:text-white transition-colors duration-300 relative z-10" />
            </div>
            <p className="text-5xl font-bold text-foreground mb-2">{stat.value}</p>
            <p className="text-sm text-muted-foreground font-medium tracking-wide">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
  );
};

export default StatsSection;
