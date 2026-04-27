"use client";

import { motion } from "framer-motion";
import {
  Target, TrendingUp, TrendingDown, BarChart3, ArrowRight, Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

const steps = [
  {
    icon: Target,
    title: "Describe your unit",
    desc: "Building, floor, size, and any notes on condition or view.",
  },
  {
    icon: BarChart3,
    title: "AI searches the market",
    desc: "Live comps, active listings, and recent market transactions.",
  },
  {
    icon: Sparkles,
    title: "Get your snapshot",
    desc: "Fair value, suggested list price, and quick-sale range.",
  },
];

const outputs = [
  { icon: TrendingUp,   label: "Fair value range",      tone: "primary" },
  { icon: TrendingUp,   label: "Suggested list price",  tone: "accent"  },
  { icon: TrendingDown, label: "Quick-sale range",       tone: "muted"   },
  { icon: BarChart3,    label: "Comparable evidence",   tone: "muted"   },
];

const ValuationEntry = () => {
  const t = useTranslations("valuationEntry");
  return (
  <section className="py-24 bg-background">
    <div className="max-w-6xl mx-auto px-4 sm:px-6">

      {/* Section header — same pattern as ROICalculator / MarketDashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: "3rem" }}
          viewport={{ once: true }}
          className="h-[2px] bg-accent mx-auto mb-6"
        />
        <p className="text-accent font-semibold tracking-[0.4em] uppercase text-xs mb-4">{t("ownerTool")}</p>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
          {t("instantProperty")}{" "}
          <span className="italic font-light">{t("valuationItalic")}</span>
        </h2>
        <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
          {t("subtitle")}
        </p>
      </motion.div>

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-2 gap-8 items-center">

        {/* Left — how it works */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-4"
        >
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="flex items-start gap-4 p-5 rounded-2xl bg-card border border-border/50 shadow-sm"
            >
              <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center mt-0.5">
                <step.icon className="h-4.5 w-4.5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-accent tracking-widest uppercase">
                    {`${t("step")} ${i + 1}`}
                  </span>
                </div>
                <p className="font-bold text-foreground text-sm">{step.title}</p>
                <p className="text-muted-foreground text-sm leading-relaxed mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Right — output preview card + CTA */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex flex-col gap-5"
        >
          {/* Mock result card */}
          <div className="rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden">
            {/* Card header */}
            <div className="bg-primary px-6 py-5">
              <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-accent mb-1">
                {t("valuationSnapshot")}
              </p>
              <p className="text-white font-bold text-lg leading-snug">
                {t("demoAddress")}
              </p>
              <p className="text-white/50 text-xs mt-1">
                {t("demoSpec")}
              </p>
            </div>

            {/* Output rows */}
            <div className="divide-y divide-border/50">
              {[
                { label: "Fair value",         value: "AED 2,850,000 – 3,100,000", highlight: true  },
                { label: "Suggested list",     value: "AED 2,950,000 – 3,150,000", highlight: false },
                { label: "Quick-sale range",   value: "AED 2,650,000 – 2,850,000", highlight: false },
                { label: "Confidence",         value: "High",                       highlight: false },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between px-6 py-3.5">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {row.label}
                  </span>
                  <span className={`text-sm font-bold ${row.highlight ? "text-primary" : "text-foreground"}`}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Disclaimer */}
            <div className="px-6 py-3 bg-muted/40 border-t border-border/50">
              <p className="text-[10px] text-muted-foreground">
                {t("demoDisclaimer")}
              </p>
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/valuation"
            className="group flex items-center justify-between gap-4 px-7 py-5 rounded-2xl font-bold text-primary-foreground transition-all duration-200 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-px active:translate-y-0"
            style={{ background: "linear-gradient(135deg, hsl(168,100%,15%), hsl(168,80%,22%))" }}
          >
            <div>
              <p className="text-base font-bold">{t("ctaTitle")}</p>
              <p className="text-white/60 text-xs font-normal mt-0.5">
                {t("ctaSub")}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white/15 transition-colors">
              <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  </section>
  );
};

export default ValuationEntry;
