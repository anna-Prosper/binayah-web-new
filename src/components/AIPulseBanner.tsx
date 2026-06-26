"use client";

import { useState, useEffect } from "react";
import { Crown, Building2, Users, TrendingUp, Award, CalendarDays, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/navigation";

const AIPulseBanner = () => {
  const t = useTranslations("home.sections.aiBanner");
  const pulseStats = [
    { icon: Building2, label: t("statListed"), value: "3,000", suffix: "+" },
    { icon: Users, label: t("statClients"), value: "11,200", suffix: "+" },
    { icon: TrendingUp, label: t("statSold"), value: "AED 2.1B", suffix: "+" },
    { icon: Award, label: t("statAwards"), value: "15", suffix: "+" },
    { icon: CalendarDays, label: t("statYears"), value: "19", suffix: "+" },
  ];
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % pulseStats.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [pulseStats.length]);

  return (
    <section className="relative overflow-hidden hidden sm:block" style={{ background: "#0B3D2E" }}>
      {/* Animated gold sweep line */}
      <div className="absolute top-0 left-0 right-0 h-[2px]">
        <div
          className="h-full bg-gradient-to-r from-transparent via-accent to-transparent animate-banner-sweep"
          style={{ width: "50%" }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between py-4 gap-4">

          {/* Brand mark */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="relative">
              <div className="w-9 h-9 rounded-lg bg-accent/20 flex items-center justify-center">
                <Crown className="h-[18px] w-[18px] text-accent" />
              </div>
              <div className="absolute inset-0 rounded-lg border border-accent/40 animate-banner-ping" />
            </div>
            <div>
              <p className="text-[11px] font-bold tracking-wider text-accent uppercase">{t("label")}</p>
              <p className="text-[10px] text-white/50">{t("sublabel")}</p>
            </div>
          </div>

          {/* Stats — all always visible, active one gets gold highlight */}
          <div className="flex items-center gap-10">
            {pulseStats.map((stat, i) => {
              const isActive = i === activeIndex;
              return (
                <div key={stat.label} className="flex items-center gap-2.5 flex-shrink-0">
                  <stat.icon className={`h-4 w-4 flex-shrink-0 transition-colors duration-500 ${isActive ? "text-accent" : "text-white/50"}`} />
                  <div>
                    <p
                      className="text-sm font-bold tabular-nums transition-colors duration-500"
                      style={{ color: isActive ? "#D4A847" : "#ffffff" }}
                    >
                      {stat.value}{stat.suffix}
                    </p>
                    <p className="text-[10px] text-white/50 hidden lg:block whitespace-nowrap">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Subtle About link */}
          <Link
            href="/about"
            className="flex items-center gap-1.5 flex-shrink-0 text-[11px] font-semibold text-white/50 hover:text-accent transition-colors duration-200 whitespace-nowrap group"
          >
            {t("aboutLink")}
            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform duration-200" />
          </Link>
        </div>
      </div>

      {/* Mobile */}
      <div className="sm:hidden max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-2.5">
          <div className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-accent" />
            <span className="text-[11px] font-bold text-white tabular-nums">3,000+</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-white/50" />
            <span className="text-[11px] font-bold text-white tabular-nums">11,200+</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-accent" />
            {/* eslint-disable-next-line i18next/no-literal-string -- numeric stat, not translatable copy */}
            <span className="text-[11px] font-bold text-white tabular-nums">AED 2.1B+</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-white/50" />
            <span className="text-[11px] font-bold text-white tabular-nums">19+</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIPulseBanner;
