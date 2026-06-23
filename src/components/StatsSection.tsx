"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/navigation";
import { ArrowRight } from "lucide-react";

const StatsSection = () => {
  const t = useTranslations("home.sections.team");
  const ts = useTranslations("home.sections.stats");

  const stats = [
    { value: "3,000+", label: ts("propertiesListed") },
    { value: "11,200+", label: ts("happyClients") },
    { value: "AED 2.1B+", label: ts("sold") },
    { value: "15+", label: ts("industryAwards") },
    { value: "19+", label: ts("yearsExperience") },
  ];

  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Top: content left, photo right */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-16 items-center">

          {/* LEFT — label + heading + copy + CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="h-[2px] w-8 flex-shrink-0" style={{ background: "linear-gradient(90deg, #D4A847, #B8922F)" }} />
              <p className="text-[11px] font-bold tracking-[0.4em] uppercase" style={{ color: "#D4A847" }}>{t("label")}</p>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-bold text-foreground leading-[1.15] mb-6">
              {t("heading")} <span style={{ color: "#1A7A5A" }}>{t("headingAccent")}</span> {t("headingEnd")}
            </h2>

            <div className="space-y-4 text-muted-foreground text-sm sm:text-base leading-relaxed mb-8">
              <p>{t("p1")}</p>
              <p>{t("p2")}</p>
              <p>{t("p3")}</p>
            </div>

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

          {/* RIGHT — team photo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            {/* offset gold accent for depth */}
            <div className="absolute -bottom-3 -right-3 w-24 h-24 rounded-2xl -z-0 hidden sm:block" style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)", opacity: 0.18 }} />
            <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[4/3] z-10">
              <Image
                src="/assets/team.webp"
                alt="Binayah Properties team"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 560px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
              <p className="absolute bottom-5 left-5 right-5 text-white text-sm font-medium leading-snug">
                {t("photoCaption")}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Stats strip — full-width band, 5 across */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-14 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px rounded-2xl overflow-hidden border border-border/50 bg-border/40"
        >
          {stats.map((s) => (
            <div key={s.label} className="bg-background px-4 py-6 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{s.value}</p>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-1.5 tracking-[0.12em] uppercase leading-tight">{s.label}</p>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default StatsSection;
