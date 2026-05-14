"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";

const communities = [
  { name: "Downtown Dubai", slug: "downtown-dubai", properties: "450+", image: "/assets/communities/downtown-dubai.webp" },
  { name: "Palm Jumeirah", slug: "palm-jumeirah", properties: "320+", image: "/assets/communities/palm-jumeirah.webp" },
  { name: "Dubai Marina", slug: "dubai-marina", properties: "580+", image: "/assets/communities/dubai-marina.webp" },
  { name: "Business Bay", slug: "business-bay", properties: "290+", image: "/assets/communities/business-bay.webp" },
];

const CommunitiesSection = () => {
  const t = useTranslations("home.sections.communities");
  return (
  <section id="communities" className="py-8 sm:py-20 bg-card scroll-mt-20">
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      {/* Mobile: compact inline header */}
      <div className="sm:hidden flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.3em] uppercase mb-1" style={{ color: "#A07924" }}>{t("label")}</p>
          <h2 className="text-sm font-bold text-foreground">{t("title")}</h2>
        </div>
        <Link href="/communities" className="group flex items-center gap-1 text-primary font-semibold text-xs">
          {t("viewAll")} <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Desktop: centered header with View All */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="hidden sm:block text-center mb-14 relative"
      >
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: "3rem" }}
          viewport={{ once: true }}
          className="h-[2px] mx-auto mb-6"
          style={{ background: "linear-gradient(90deg, #D4A847, #B8922F)" }}
        />
        <p className="font-semibold tracking-[0.4em] uppercase text-xs mb-4" style={{ color: "#D4A847" }}>
          {t("label")}
        </p>
        <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
          {t("title")} <span className="italic font-light">{t("titleItalic")}</span>
        </h2>
        <Link href="/communities" className="group absolute right-0 bottom-0 flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all">
          {t("viewAll")} <ArrowUpRight className="h-4 w-4" />
        </Link>
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
            className="flex-shrink-0 w-[72%] snap-center"
          >
            <Link href={`/communities/${c.slug}`} className="group block relative rounded-2xl overflow-hidden aspect-[4/3]">
              <Image src={c.image} alt={c.name} fill sizes="72vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-bold text-base mb-0.5">{c.name}</h3>
                <p className="text-white/70 text-xs">{c.properties} {t("properties")}</p>
                <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-white/90 px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                  {t("explore")} <ArrowUpRight className="h-2.5 w-2.5" />
                </span>
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
                  <p className="text-white/70 text-sm">{c.properties} {t("properties")}</p>
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
};

export default CommunitiesSection;
