"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Home, Key, TrendingUp, Wrench, Building2, Calculator } from "lucide-react";
import { useTranslations } from "next-intl";
const serviceBuy = "/assets/service-buy.webp";
const serviceRent = "/assets/service-rent.webp";
const serviceSell = "/assets/service-sell.webp";
const serviceOffplan = "/assets/service-offplan.webp";
const serviceManagement = "/assets/service-management.webp";

const WhatWeOffer = () => {
  const t = useTranslations("home.sections.whatWeOffer");
  const offerings = [
    { image: serviceSell, icon: Home, title: t("sellProperty"), desc: t("sellDesc"), link: "/list-your-property" },
    { image: serviceBuy, icon: Building2, title: t("buyProperty"), desc: t("buyDesc"), link: "/buy" },
    { image: serviceRent, icon: Key, title: t("rentProperty"), desc: t("rentDesc"), link: "/rent" },
    { image: serviceOffplan, icon: TrendingUp, title: t("offPlanInvestment"), desc: t("offPlanDesc"), link: "/off-plan" },
    { image: serviceManagement, icon: Wrench, title: t("propertyManagement"), desc: t("managementDesc"), link: "/services" },
    { image: serviceSell, icon: Calculator, title: t("valuation"), desc: t("valuationDesc"), link: "/valuation" },
  ];
  return (
  <section className="py-12 sm:py-24 text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
    <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "48px 48px" }} />

    <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-5 sm:mb-14">
        <motion.div initial={{ width: 0 }} whileInView={{ width: "3rem" }} viewport={{ once: true }} className="h-[2px] mx-auto mb-3 sm:mb-6" style={{ background: "linear-gradient(90deg, #D4A847, #B8922F)" }} />
        <p className="font-semibold tracking-[0.4em] uppercase text-[10px] sm:text-xs mb-2 sm:mb-4" style={{ color: "#D4A847" }}>{t("label")}</p>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold">
          <span className="sm:hidden">{t("title")}</span>
          <span className="hidden sm:inline">{t("titleDesktop")} <span className="italic font-light">{t("titleItalic")}</span></span>
        </h2>
        <p className="mt-3 sm:mt-5 text-white/60 max-w-lg mx-auto text-sm sm:text-base hidden sm:block">
          {t("subtitle")}
        </p>
      </motion.div>

      {/* Mobile: 2-column icon-card grid */}
      <div className="sm:hidden grid grid-cols-2 gap-2.5">
        {offerings.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div key={item.title} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
              <Link href={item.link} className="group block bg-white/5 border border-white/10 rounded-xl p-4 min-h-[44px]">
                <div className="bg-white/10 rounded-lg p-2 w-fit mb-2.5">
                  <Icon className="h-5 w-5 text-white" style={{ color: "#D4A847" }} />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1 leading-snug">{item.title}</h3>
                <p className="text-xs text-white/60 line-clamp-2 leading-snug">{item.desc}</p>
              </Link>
            </motion.div>
          );
        })}
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
          {t("viewAllServices")}
        </Link>
      </motion.div>
    </div>
  </section>
  );
};

export default WhatWeOffer;
