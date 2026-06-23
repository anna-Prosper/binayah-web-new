"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/navigation";
import { ArrowRight } from "lucide-react";

const StatsSection = () => {
  const t = useTranslations("home.sections.team");
  const ts = useTranslations("home.sections.stats");

  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left — label + heading + photo */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="h-[2px] w-8 flex-shrink-0" style={{ background: "linear-gradient(90deg, #D4A847, #B8922F)" }} />
              <p className="text-[11px] font-bold tracking-[0.4em] uppercase" style={{ color: "#D4A847" }}>{t("label")}</p>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-bold text-foreground leading-[1.15] mb-5">
              {t("heading")}<br />
              <span style={{ color: "#1A7A5A" }}>{t("headingAccent")}</span> {t("headingEnd")}
            </h2>

            <div className="h-[2px] w-10 mb-8" style={{ background: "linear-gradient(90deg, #D4A847, #B8922F)" }} />

            {/* Team photo */}
            <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-[4/3]">
              <Image
                src="/assets/team.webp"
                alt="Binayah Properties team"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 600px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: "#D4A847" }} />
                <span className="text-white text-[11px] font-semibold tracking-[0.2em] uppercase">{t("photoBadge")}</span>
              </div>
              <p className="absolute bottom-4 left-4 right-4 text-white text-sm font-medium leading-snug">
                {t("photoCaption")}
              </p>
            </div>
          </motion.div>

          {/* Right — quote + text + stats + CTAs */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="flex flex-col gap-6"
          >
            {/* Quote */}
            <div className="pl-5 border-l-[3px]" style={{ borderColor: "#D4A847" }}>
              <p className="text-lg sm:text-xl italic text-foreground/75 leading-relaxed font-light">
                {t("quote")}
              </p>
            </div>

            {/* Body */}
            <div className="space-y-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
              <p>{t("p1")}</p>
              <p>{t("p2")}</p>
              <p>{t("p3")}</p>
            </div>

            {/* Mini stats */}
            <div className="grid grid-cols-4 gap-3 py-5 border-y border-border/50">
              {[
                { value: "3,000+", label: ts("propertiesListed") },
                { value: "12,000+", label: ts("happyClients") },
                { value: "19+", label: ts("industryAwards") },
                { value: "60+", label: ts("communitiesCovered") },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 leading-tight">{s.label}</p>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex gap-3 flex-wrap">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold text-sm transition-all hover:shadow-lg hover:brightness-110"
                style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
              >
                {t("cta1")} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/buy"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm border-2 transition-all hover:bg-accent/5"
                style={{ borderColor: "#D4A847", color: "#B8922F" }}
              >
                {t("cta2")} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default StatsSection;
