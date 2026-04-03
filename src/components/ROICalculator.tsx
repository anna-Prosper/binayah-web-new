"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, TrendingUp, Percent, ChevronDown, MessageCircle } from "lucide-react";
import Link from "next/link";

const ROICalculator = () => {
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
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8 sm:mb-14">
          <motion.div initial={{ width: 0 }} whileInView={{ width: "3rem" }} viewport={{ once: true }} className="h-[2px] mx-auto mb-4 sm:mb-6" style={{ background: "linear-gradient(90deg, #D4A847, #B8922F)" }} />
          <p className="font-semibold tracking-[0.4em] uppercase text-[10px] sm:text-xs mb-2 sm:mb-4" style={{ color: "#D4A847" }}>Investment Tool</p>
          <h2 className="text-xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            ROI <span className="italic font-light">Calculator</span>
          </h2>
          <p className="hidden sm:block mt-4 text-muted-foreground max-w-md mx-auto">
            Estimate your rental yield, capital gains, and total return on Dubai property investments.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Inputs */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-card rounded-xl sm:rounded-2xl p-5 sm:p-7 border border-border/50 shadow-sm">
            <h3 className="font-bold text-foreground mb-5 sm:mb-6 flex items-center gap-2 text-sm sm:text-base">
              <Calculator className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /> Input Parameters
            </h3>
            <div className="space-y-5 sm:space-y-6">
              <SliderInput label="Purchase Price" value={price} onChange={setPrice} min={500000} max={50000000} step={100000} prefix="AED " format={fmt} />
              <SliderInput label="Annual Rent" value={annualRent} onChange={setAnnualRent} min={20000} max={5000000} step={10000} prefix="AED " format={fmt} />
              <SliderInput label="Service Charges / yr" value={serviceCharge} onChange={setServiceCharge} min={0} max={500000} step={1000} prefix="AED " format={fmt} />
              <SliderInput label="Annual Appreciation" value={appreciation} onChange={setAppreciation} min={0} max={20} step={0.5} suffix="%" />
            </div>
          </motion.div>

          {/* Results */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-3 sm:space-y-4">
            {/* Mobile: compact 3-col + expandable projection */}
            <div className="sm:hidden">
              <div className="grid grid-cols-3 gap-2 mb-3">
                <ResultCardCompact label="Gross Yield" value={`${results.grossYield.toFixed(1)}%`} />
                <ResultCardCompact label="Net Yield" value={`${results.netYield.toFixed(1)}%`} />
                <ResultCardCompact label="5yr ROI" value={`${results.totalROI.toFixed(1)}%`} highlight />
              </div>
              <button onClick={() => setShowProjection(!showProjection)}
                className="w-full bg-card rounded-xl p-3.5 border border-border/50 shadow-sm flex items-center justify-between text-sm font-semibold text-foreground">
                <span className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> 5-Year Breakdown</span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${showProjection ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {showProjection && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                    <div className="bg-card rounded-b-xl px-4 pb-4 pt-2 border-x border-b border-border/50 space-y-2.5">
                      <ProjectionRow label="Property Value (Yr 5)" value={`AED ${fmt(results.year5Value)}`} />
                      <ProjectionRow label="Capital Appreciation" value={`AED ${fmt(results.year5Value - price)}`} />
                      <ProjectionRow label="Total Rental Income" value={`AED ${fmt(results.totalRent5)}`} />
                      <div className="border-t border-border pt-2.5 mt-2.5">
                        <ProjectionRow label="Total Return" value={`AED ${fmt(results.totalReturn5)}`} bold />
                        <ProjectionRow label="Total ROI" value={`${results.totalROI.toFixed(1)}%`} bold accent />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop layout */}
            <div className="hidden sm:block space-y-4">
              <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Your Results</p>
              <div className="grid grid-cols-2 gap-4">
                <ResultCard icon={Percent} label="Gross Yield" value={`${results.grossYield.toFixed(1)}%`} />
                <ResultCard icon={Percent} label="Net Yield" value={`${results.netYield.toFixed(1)}%`} />
              </div>
              <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
                <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> 5-Year Projection
                </h4>
                <div className="space-y-3">
                  <ProjectionRow label="Property Value (Year 5)" value={`AED ${fmt(results.year5Value)}`} />
                  <ProjectionRow label="Capital Appreciation" value={`AED ${fmt(results.year5Value - price)}`} />
                  <ProjectionRow label="Total Rental Income" value={`AED ${fmt(results.totalRent5)}`} />
                  <div className="border-t border-border pt-3 mt-3">
                    <ProjectionRow label="Total Return" value={`AED ${fmt(results.totalReturn5)}`} bold />
                    <ProjectionRow label="Total ROI" value={`${results.totalROI.toFixed(1)}%`} bold accent />
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[10px] sm:text-[11px] text-muted-foreground text-center pt-1">
              *Projections are estimates based on your inputs.{" "}
              <Link href="/contact" className="underline hover:text-foreground transition-colors inline-flex items-center gap-1">
                <MessageCircle className="h-2.5 w-2.5 inline" /> Get personalized advice
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const SliderInput = ({ label, value, onChange, min, max, step, prefix, suffix, format }: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step: number; prefix?: string; suffix?: string; format?: (n: number) => string;
}) => {
  const percent = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex justify-between items-center mb-2.5">
        <label className="text-[10px] sm:text-xs font-semibold tracking-wider text-muted-foreground uppercase">{label}</label>
        <motion.span key={value} initial={{ scale: 1.1, color: "hsl(168, 100%, 25%)" }} animate={{ scale: 1, color: "hsl(var(--foreground))" }} transition={{ duration: 0.3 }} className="text-xs sm:text-sm font-bold text-foreground">
          {prefix}{format ? format(value) : value}{suffix}
        </motion.span>
      </div>
      <div className="relative">
        <div className="h-2 rounded-full bg-border overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all duration-150" style={{ width: `${percent}%` }} />
        </div>
        <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" style={{ WebkitAppearance: "none", margin: 0 }} />
        <div className="absolute top-1/2 -translate-y-1/2 w-5 h-5 sm:w-4 sm:h-4 rounded-full bg-primary border-2 border-background shadow-md pointer-events-none transition-all duration-150"
          style={{ left: `calc(${percent}% - ${percent > 50 ? 10 : 8}px)` }} />
      </div>
    </div>
  );
};

const ResultCardCompact = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <div className={`rounded-xl p-3 border text-center ${highlight ? "bg-primary/10 border-primary/30" : "bg-card border-border/50"}`}>
    <motion.p key={value} initial={{ scale: 1.05 }} animate={{ scale: 1 }} transition={{ duration: 0.3 }} className={`text-lg font-bold mb-0.5 ${highlight ? "text-primary" : "text-foreground"}`}>{value}</motion.p>
    <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
  </div>
);

const ResultCard = ({ icon: Icon, label, value }: { icon: typeof Percent; label: string; value: string }) => (
  <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm text-center">
    <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center">
      <Icon className="h-5 w-5 text-primary" />
    </div>
    <motion.p key={value} initial={{ scale: 1.05 }} animate={{ scale: 1 }} transition={{ duration: 0.3 }} className="text-2xl font-bold text-foreground mb-1">{value}</motion.p>
    <p className="text-xs text-muted-foreground font-medium">{label}</p>
  </div>
);

const ProjectionRow = ({ label, value, bold, accent }: { label: string; value: string; bold?: boolean; accent?: boolean }) => (
  <div className="flex justify-between items-center">
    <span className={`text-xs sm:text-sm ${bold ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{label}</span>
    <motion.span key={value} initial={{ opacity: 0.5 }} animate={{ opacity: 1 }} className={`text-xs sm:text-sm font-bold ${accent ? "text-primary" : "text-foreground"}`}>{value}</motion.span>
  </div>
);

export default ROICalculator;