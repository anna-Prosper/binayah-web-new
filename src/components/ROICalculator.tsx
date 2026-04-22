"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, TrendingUp, Percent, ChevronDown, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

const ROICalculator = () => {
  const t = useTranslations("roiCalculator");
  const [price, setPrice] = useState(2000000);
  const [annualRent, setAnnualRent] = useState(120000);
  const [serviceCharge, setServiceCharge] = useState(15000);
  const [appreciation, setAppreciation] = useState(5);
  const [showProjection, setShowProjection] = useState(false);

  const results = useMemo(() => {
    const netRent = annualRent - serviceCharge;
    const grossYield = (annualRent / price) * 100;
    const netYield = (netRent / price) * 100;
    const year5Value = price * Math.pow(1 + appreciation / 100, 5);
    const totalRent5 = netRent * 5;
    const totalReturn5 = (year5Value - price) + totalRent5;
    const totalROI = (totalReturn5 / price) * 100;
    return { grossYield, netYield, netRent, year5Value, totalRent5, totalReturn5, totalROI };
  }, [price, annualRent, serviceCharge, appreciation]);

  const fmt = (n: number) => new Intl.NumberFormat("en-AE").format(Math.round(n));

  return (
    <section className="py-12 sm:py-24 bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8 sm:mb-14">
          <motion.div initial={{ width: 0 }} whileInView={{ width: "3rem" }} viewport={{ once: true }} className="h-[2px] mx-auto mb-4 sm:mb-6" style={{ background: "linear-gradient(90deg, #D4A847, #B8922F)" }} />
          <p className="font-semibold tracking-[0.4em] uppercase text-[10px] sm:text-xs mb-2 sm:mb-4" style={{ color: "#D4A847" }}>{t("label")}</p>
          <h2 className="text-xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            {t("title")}
          </h2>
          <p className="hidden sm:block mt-4 text-muted-foreground max-w-md mx-auto">
            {t("subtitle")}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          {/* ── Inputs ── */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="rounded-2xl p-6 sm:p-8 border border-border/60 shadow-sm bg-card">
            <h3 className="font-bold text-foreground mb-6 flex items-center gap-2.5 text-sm sm:text-base">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(11,61,46,0.08), rgba(26,122,90,0.12))" }}>
                <Calculator className="h-4 w-4 text-primary" />
              </div>
              {t("inputParameters")}
            </h3>
            <div className="space-y-6 sm:space-y-7">
              <SliderInput label={t("purchasePrice")}       value={price}         onChange={setPrice}         min={500000}  max={50000000} step={100000} prefix="AED " format={fmt} />
              <SliderInput label={t("annualRent")}          value={annualRent}    onChange={setAnnualRent}    min={20000}   max={5000000}  step={10000}  prefix="AED " format={fmt} />
              <SliderInput label={t("serviceCharges")} value={serviceCharge} onChange={setServiceCharge} min={0}       max={500000}   step={1000}   prefix="AED " format={fmt} />
              <SliderInput label={t("annualAppreciation")}  value={appreciation}  onChange={setAppreciation}  min={0}       max={20}       step={0.5}    suffix="%" />
            </div>
          </motion.div>

          {/* ── Results ── */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-4">

            {/* Mobile: 3-col compact + accordion */}
            <div className="sm:hidden space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <ResultCardCompact label={t("grossYield")} value={`${results.grossYield.toFixed(1)}%`} />
                <ResultCardCompact label={t("netYield")}   value={`${results.netYield.toFixed(1)}%`} />
                <ResultCardCompact label={t("fiveYrROI")}     value={`${results.totalROI.toFixed(1)}%`} highlight />
              </div>
              <button onClick={() => setShowProjection(!showProjection)}
                className="w-full bg-card rounded-xl p-3.5 border border-border/60 flex items-center justify-between text-sm font-semibold text-foreground">
                <span className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> {t("fiveYearBreakdown")}</span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${showProjection ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {showProjection && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                    <div className="bg-card rounded-b-xl px-4 pb-4 pt-3 border-x border-b border-border/60 space-y-2.5">
                      <ProjectionRow label={t("propertyValueYear5")}  value={`AED ${fmt(results.year5Value)}`} />
                      <ProjectionRow label={t("capitalAppreciation")}    value={`AED ${fmt(results.year5Value - price)}`} />
                      <ProjectionRow label={t("totalRentalIncome")}     value={`AED ${fmt(results.totalRent5)}`} />
                      <div className="border-t border-border pt-2.5 mt-1">
                        <ProjectionRow label={t("totalReturn")} value={`AED ${fmt(results.totalReturn5)}`} bold />
                        <ProjectionRow label={t("totalROI")}    value={`${results.totalROI.toFixed(1)}%`} bold accent />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop: full layout */}
            <div className="hidden sm:block space-y-4">
              {/* Yield label */}
              <p className="text-[11px] font-bold tracking-[0.25em] uppercase text-muted-foreground">{t("yourResults")}</p>

              {/* Yield cards */}
              <div className="grid grid-cols-2 gap-4">
                <ResultCard icon={Percent} label={t("grossYield")} value={`${results.grossYield.toFixed(1)}%`} />
                <ResultCard icon={Percent} label={t("netYield")}   value={`${results.netYield.toFixed(1)}%`} />
              </div>

              {/* 5-year projection */}
              <div className="rounded-2xl p-6 border border-border/60 bg-card shadow-sm">
                <h4 className="font-bold text-foreground mb-5 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(11,61,46,0.08), rgba(26,122,90,0.12))" }}>
                    <TrendingUp className="h-3.5 w-3.5 text-primary" />
                  </div>
                  {t("fiveYearProjection")}
                </h4>
                <div className="space-y-3">
                  <ProjectionRow label={t("propertyValueYear5")} value={`AED ${fmt(results.year5Value)}`} />
                  <ProjectionRow label={t("capitalAppreciation")}    value={`AED ${fmt(results.year5Value - price)}`} />
                  <ProjectionRow label={t("totalRentalIncome")}     value={`AED ${fmt(results.totalRent5)}`} />
                  <div className="border-t border-border pt-3 mt-1">
                    <ProjectionRow label={t("totalReturn")} value={`AED ${fmt(results.totalReturn5)}`} bold />
                    <ProjectionRow label={t("totalROI")}    value={`${results.totalROI.toFixed(1)}%`} bold accent />
                  </div>
                </div>
              </div>
            </div>

            {/* Footnote */}
            <p className="text-[10px] sm:text-[11px] text-muted-foreground text-center">
              {t("footnoteLead")}{" "}
              <Link href="/contact" className="underline hover:text-foreground transition-colors inline-flex items-center gap-1">
                <MessageCircle className="h-2.5 w-2.5 inline" /> {t("getPersonalizedAdvice")}
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

/* ── Sub-components ── */

const SliderInput = ({
  label, value, onChange, min, max, step, prefix, suffix, format,
}: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step: number; prefix?: string; suffix?: string; format?: (n: number) => string;
}) => {
  const percent = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <label className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] text-muted-foreground uppercase">{label}</label>
        <motion.span
          key={value}
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.25 }}
          className="text-xs sm:text-sm font-bold text-foreground"
        >
          {prefix}{format ? format(value) : value}{suffix}
        </motion.span>
      </div>
      <div className="relative h-5 flex items-center">
        {/* Track bg */}
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-border" />
        {/* Filled track */}
        <div
          className="absolute left-0 h-1.5 rounded-full transition-all duration-150"
          style={{ width: `${percent}%`, background: "linear-gradient(90deg, #0B3D2E, #1A7A5A)" }}
        />
        {/* Hidden native range for interaction */}
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
        />
        {/* Custom thumb */}
        <div
          className="absolute w-5 h-5 rounded-full border-2 border-white shadow-md pointer-events-none transition-all duration-150"
          style={{
            left: `calc(${percent}% - 10px)`,
            background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)",
          }}
        />
      </div>
    </div>
  );
};

const ResultCardCompact = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <div className={`rounded-xl p-3 border text-center ${highlight ? "border-primary/30" : "bg-card border-border/60"}`}
    style={highlight ? { background: "linear-gradient(135deg, rgba(11,61,46,0.06), rgba(26,122,90,0.10))" } : {}}>
    <motion.p key={value} initial={{ scale: 1.05 }} animate={{ scale: 1 }} transition={{ duration: 0.3 }}
      className={`text-lg font-bold mb-0.5 ${highlight ? "text-primary" : "text-foreground"}`}>
      {value}
    </motion.p>
    <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wide">{label}</p>
  </div>
);

const ResultCard = ({ icon: Icon, label, value }: { icon: typeof Percent; label: string; value: string }) => (
  <div className="bg-card rounded-2xl p-6 border border-border/60 shadow-sm text-center">
    <div className="w-10 h-10 mx-auto mb-3 rounded-xl flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, rgba(11,61,46,0.08), rgba(26,122,90,0.12))" }}>
      <Icon className="h-5 w-5 text-primary" />
    </div>
    <motion.p key={value} initial={{ scale: 1.05 }} animate={{ scale: 1 }} transition={{ duration: 0.3 }}
      className="text-3xl font-bold text-foreground mb-1">
      {value}
    </motion.p>
    <p className="text-xs text-muted-foreground font-medium">{label}</p>
  </div>
);

const ProjectionRow = ({ label, value, bold, accent }: { label: string; value: string; bold?: boolean; accent?: boolean }) => (
  <div className="flex justify-between items-center">
    <span className={`text-xs sm:text-sm ${bold ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{label}</span>
    <motion.span key={value} initial={{ opacity: 0.5 }} animate={{ opacity: 1 }}
      className={`text-xs sm:text-sm font-bold ${accent ? "text-primary" : "text-foreground"}`}>
      {value}
    </motion.span>
  </div>
);

export default ROICalculator;