"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator, TrendingUp, Percent, DollarSign } from "lucide-react";

const ROICalculator = () => {
  const [price, setPrice] = useState(2000000);
  const [annualRent, setAnnualRent] = useState(120000);
  const [serviceCharge, setServiceCharge] = useState(15000);
  const [appreciation, setAppreciation] = useState(5);

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
    <section className="py-24 bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <motion.div initial={{ width: 0 }} whileInView={{ width: "3rem" }} viewport={{ once: true }} className="h-[2px] bg-accent mx-auto mb-6" />
          <p className="text-accent font-semibold tracking-[0.4em] uppercase text-xs mb-4">Investment Tool</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            ROI <span className="italic font-light">Calculator</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-md mx-auto">
            Estimate your rental yield, capital gains, and total return on Dubai property investments.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Inputs */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-card rounded-2xl p-7 border border-border/50 shadow-sm">
            <h3 className="font-bold text-foreground mb-6 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" /> Input Parameters
            </h3>
            <div className="space-y-6">
              <SliderInput label="Purchase Price" value={price} onChange={setPrice} min={500000} max={50000000} step={100000} prefix="AED " format={fmt} />
              <SliderInput label="Annual Rent" value={annualRent} onChange={setAnnualRent} min={20000} max={5000000} step={10000} prefix="AED " format={fmt} />
              <SliderInput label="Service Charges / yr" value={serviceCharge} onChange={setServiceCharge} min={0} max={500000} step={1000} prefix="AED " format={fmt} />
              <SliderInput label="Annual Appreciation" value={appreciation} onChange={setAppreciation} min={0} max={20} step={0.5} suffix="%" />
            </div>
          </motion.div>

          {/* Results */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <ResultCard icon={Percent} label="Gross Yield" value={`${results.grossYield.toFixed(1)}%`} color="primary" />
              <ResultCard icon={Percent} label="Net Yield" value={`${results.netYield.toFixed(1)}%`} color="accent" />
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
            <p className="text-[11px] text-muted-foreground text-center">
              *Projections are estimates based on your inputs. Actual returns may vary. Contact our team for personalized advice.
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
}) => (
  <div>
    <div className="flex justify-between items-center mb-2">
      <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{label}</label>
      <span className="text-sm font-bold text-foreground">{prefix}{format ? format(value) : value}{suffix}</span>
    </div>
    <input
      type="range"
      min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-2 rounded-full appearance-none cursor-pointer bg-border accent-primary"
    />
  </div>
);

const ResultCard = ({ icon: Icon, label, value, color }: { icon: typeof Percent; label: string; value: string; color: string }) => (
  <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm text-center">
    <div className={`w-10 h-10 mx-auto mb-3 rounded-xl bg-${color}/10 flex items-center justify-center`}>
      <Icon className={`h-5 w-5 text-${color}`} />
    </div>
    <p className="text-2xl font-bold text-foreground mb-1">{value}</p>
    <p className="text-xs text-muted-foreground font-medium">{label}</p>
  </div>
);

const ProjectionRow = ({ label, value, bold, accent }: { label: string; value: string; bold?: boolean; accent?: boolean }) => (
  <div className="flex justify-between items-center">
    <span className={`text-sm ${bold ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{label}</span>
    <span className={`text-sm font-bold ${accent ? "text-primary" : "text-foreground"}`}>{value}</span>
  </div>
);

export default ROICalculator;
