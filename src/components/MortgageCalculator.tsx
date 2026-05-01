"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator, TrendingUp, Banknote, Calendar } from "lucide-react";
import { useTranslations } from "next-intl";

function formatNumber(n: number) {
  return new Intl.NumberFormat("en-AE").format(Math.round(n));
}

interface MortgageCalculatorProps {
  initialPrice?: number;
  embedded?: boolean;
}

export default function MortgageCalculator({ initialPrice, embedded }: MortgageCalculatorProps) {
  const t = useTranslations("mortgageCalculator");
  const clampedInitial = initialPrice
    ? Math.min(50000000, Math.max(300000, initialPrice))
    : 2000000;
  const [price, setPrice] = useState(clampedInitial);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [rate, setRate] = useState(4.5);
  const [years, setYears] = useState(25);

  const result = useMemo(() => {
    const downPayment = price * (downPaymentPct / 100);
    const loanAmount = price - downPayment;
    const monthlyRate = rate / 100 / 12;
    const numPayments = years * 12;

    if (monthlyRate === 0) {
      const monthly = loanAmount / numPayments;
      return {
        monthlyPayment: monthly,
        totalPayment: loanAmount,
        totalInterest: 0,
        loanAmount,
        downPayment,
      };
    }

    const monthly =
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);
    const totalPayment = monthly * numPayments;
    const totalInterest = totalPayment - loanAmount;

    return { monthlyPayment: monthly, totalPayment, totalInterest, loanAmount, downPayment };
  }, [price, downPaymentPct, rate, years]);

  if (embedded) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
            <Calculator className="h-4 w-4 text-accent" />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-accent">{t("label")}</p>
            <h2 className="text-base font-bold text-foreground">{t("title")}</h2>
          </div>
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border/50 rounded-2xl p-5 space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">{t("propertyPrice")}</label>
                <span className="text-sm font-semibold text-foreground">AED {formatNumber(price)}</span>
              </div>
              <input type="range" min={300000} max={50000000} step={100000} value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full accent-[#1A7A5A]" />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>{t("minPrice")}</span><span>{t("maxPrice")}</span></div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">{t("downPayment")}</label>
                <span className="text-sm font-semibold text-foreground">{`${downPaymentPct}% (AED ${formatNumber(result.downPayment)})`}</span>
              </div>
              <input type="range" min={5} max={80} step={1} value={downPaymentPct} onChange={(e) => setDownPaymentPct(Number(e.target.value))} className="w-full accent-[#1A7A5A]" />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>5%</span><span>80%</span></div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">{t("interestRate")}</label>
                <span className="text-sm font-semibold text-foreground">{rate}%</span>
              </div>
              <input type="range" min={1} max={12} step={0.1} value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full accent-[#1A7A5A]" />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>1%</span><span>12%</span></div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">{t("loanTerm")}</label>
                <span className="text-sm font-semibold text-foreground">{years} {t("years")}</span>
              </div>
              <input type="range" min={5} max={25} step={1} value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full accent-[#1A7A5A]" />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>{t("minYears")}</span><span>{t("maxYears")}</span></div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="rounded-2xl p-5 text-white" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
              <p className="text-white/60 text-xs uppercase tracking-widest mb-1">{t("monthlyPayment")}</p>
              <p className="text-3xl font-bold">AED {formatNumber(result.monthlyPayment)}</p>
              <p className="text-white/50 text-xs mt-1">{t("perMonth")}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card border border-border/50 rounded-xl p-4">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center mb-2"><Banknote className="h-4 w-4 text-accent" /></div>
                <p className="text-[10px] text-muted-foreground mb-0.5">{t("loanAmount")}</p>
                <p className="text-sm font-bold text-foreground">AED {formatNumber(result.loanAmount)}</p>
              </div>
              <div className="bg-card border border-border/50 rounded-xl p-4">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center mb-2"><TrendingUp className="h-4 w-4 text-accent" /></div>
                <p className="text-[10px] text-muted-foreground mb-0.5">{t("totalInterest")}</p>
                <p className="text-sm font-bold text-foreground">AED {formatNumber(result.totalInterest)}</p>
              </div>
              <div className="bg-card border border-border/50 rounded-xl p-4">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center mb-2"><Calculator className="h-4 w-4 text-accent" /></div>
                <p className="text-[10px] text-muted-foreground mb-0.5">{t("totalPayment")}</p>
                <p className="text-sm font-bold text-foreground">AED {formatNumber(result.totalPayment)}</p>
              </div>
              <div className="bg-card border border-border/50 rounded-xl p-4">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center mb-2"><Calendar className="h-4 w-4 text-accent" /></div>
                <p className="text-[10px] text-muted-foreground mb-0.5">{t("downPayment")}</p>
                <p className="text-sm font-bold text-foreground">AED {formatNumber(result.downPayment)}</p>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground/60 leading-relaxed">{t("disclaimer")}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div
            className="h-[2px] w-12 mx-auto mb-6"
            style={{ background: "linear-gradient(90deg, #D4A847, #B8922F)" }}
          />
          <p
            className="font-semibold tracking-[0.4em] uppercase text-xs mb-4"
            style={{ color: "#D4A847" }}
          >
            {t("label")}
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            {t("title")}
          </h2>
          <p className="text-muted-foreground mt-3 text-sm max-w-lg mx-auto">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="bg-card border border-border/50 rounded-2xl p-6 sm:p-8 space-y-6">
            {/* Property Price */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">{t("propertyPrice")}</label>
                <span className="text-sm font-semibold text-foreground">
                  AED {formatNumber(price)}
                </span>
              </div>
              <input
                type="range"
                min={300000}
                max={50000000}
                step={100000}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full accent-[#1A7A5A]"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>{t("minPrice")}</span>
                <span>{t("maxPrice")}</span>
              </div>
            </div>

            {/* Down Payment */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">{t("downPayment")}</label>
                <span className="text-sm font-semibold text-foreground">
                  {`${downPaymentPct}% (AED ${formatNumber(result.downPayment)})`}
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={80}
                step={1}
                value={downPaymentPct}
                onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                className="w-full accent-[#1A7A5A]"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>5%</span>
                <span>80%</span>
              </div>
            </div>

            {/* Interest Rate */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">{t("interestRate")}</label>
                <span className="text-sm font-semibold text-foreground">{rate}%</span>
              </div>
              <input
                type="range"
                min={1}
                max={12}
                step={0.1}
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full accent-[#1A7A5A]"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>1%</span>
                <span>12%</span>
              </div>
            </div>

            {/* Loan Term */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">{t("loanTerm")}</label>
                <span className="text-sm font-semibold text-foreground">{years} {t("years")}</span>
              </div>
              <input
                type="range"
                min={5}
                max={25}
                step={1}
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full accent-[#1A7A5A]"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>{t("minYears")}</span>
                <span>{t("maxYears")}</span>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl p-6 sm:p-8 text-white"
              style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
            >
              <p className="text-white/60 text-xs uppercase tracking-widest mb-2">
                {t("monthlyPayment")}
              </p>
              <p className="text-3xl sm:text-4xl font-bold">
                AED {formatNumber(result.monthlyPayment)}
              </p>
              <p className="text-white/50 text-xs mt-1">{t("perMonth")}</p>
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border border-border/50 rounded-xl p-5">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
                  <Banknote className="h-5 w-5 text-accent" />
                </div>
                <p className="text-xs text-muted-foreground mb-1">{t("loanAmount")}</p>
                <p className="text-lg font-bold text-foreground">
                  AED {formatNumber(result.loanAmount)}
                </p>
              </div>
              <div className="bg-card border border-border/50 rounded-xl p-5">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
                  <TrendingUp className="h-5 w-5 text-accent" />
                </div>
                <p className="text-xs text-muted-foreground mb-1">{t("totalInterest")}</p>
                <p className="text-lg font-bold text-foreground">
                  AED {formatNumber(result.totalInterest)}
                </p>
              </div>
              <div className="bg-card border border-border/50 rounded-xl p-5">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
                  <Calculator className="h-5 w-5 text-accent" />
                </div>
                <p className="text-xs text-muted-foreground mb-1">{t("totalPayment")}</p>
                <p className="text-lg font-bold text-foreground">
                  AED {formatNumber(result.totalPayment)}
                </p>
              </div>
              <div className="bg-card border border-border/50 rounded-xl p-5">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
                  <Calendar className="h-5 w-5 text-accent" />
                </div>
                <p className="text-xs text-muted-foreground mb-1">{t("downPayment")}</p>
                <p className="text-lg font-bold text-foreground">
                  AED {formatNumber(result.downPayment)}
                </p>
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
              {t("disclaimer")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
