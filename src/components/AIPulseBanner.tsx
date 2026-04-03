"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, TrendingUp, BarChart3, Zap, Activity } from "lucide-react";

const pulseStats = [
  { icon: Brain, label: "AI Models Active", value: "3", suffix: "" },
  { icon: BarChart3, label: "Listings Analyzed", value: "30,847", suffix: "+" },
  { icon: TrendingUp, label: "Market Signals", value: "1,245", suffix: "" },
  { icon: Activity, label: "Price Updates", value: "Live", suffix: "" },
  { icon: Zap, label: "Match Accuracy", value: "96", suffix: "%" },
];

const AIPulseBanner = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % pulseStats.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative bg-foreground overflow-hidden hidden sm:block">
      {/* Animated gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[2px]">
        <motion.div
          className="h-full bg-gradient-to-r from-transparent via-accent to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          style={{ width: "50%" }}
        />
      </div>

      {/* Desktop: full scrollable row */}
      <div className="hidden sm:block max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between py-4 gap-4">
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="relative">
              <div className="w-9 h-9 rounded-lg bg-accent/20 flex items-center justify-center">
                <Brain className="h-4.5 w-4.5 text-accent" />
              </div>
              <motion.div
                className="absolute inset-0 rounded-lg border border-accent/40"
                animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div>
              <p className="text-[11px] font-bold tracking-wider text-accent uppercase">AI-Powered</p>
              <p className="text-[10px] text-background/40">Real-time analysis</p>
            </div>
          </div>

          <div className="flex items-center gap-10">
            {pulseStats.map((stat, i) => {
              const isActive = i === activeIndex;
              return (
                <motion.div
                  key={stat.label}
                  className="flex items-center gap-2.5 flex-shrink-0"
                  animate={{ opacity: isActive ? 1 : 0.4 }}
                  transition={{ duration: 0.5 }}
                >
                  <stat.icon className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-accent" : "text-background/30"}`} />
                  <div>
                    <p className={`text-sm font-bold tabular-nums ${isActive ? "text-background" : "text-background/40"}`}>
                      {stat.value}{stat.suffix}
                    </p>
                    <p className="text-[10px] text-background/30 hidden lg:block whitespace-nowrap">{stat.label}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <motion.div
              className="w-2 h-2 rounded-full bg-accent"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-[11px] font-semibold text-background/50 uppercase tracking-wider">Live</span>
          </div>
        </div>
      </div>

      {/* Mobile: fixed row, no scroll, only key stats */}
      <div className="sm:hidden max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-2.5">
          <div className="flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5 text-accent" />
            <span className="text-[11px] font-bold text-background/80 tabular-nums">30,847+</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-background/40" />
            <span className="text-[11px] font-bold text-background/50 tabular-nums">1,245</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-background/40" />
            <span className="text-[11px] font-bold text-background/50">Live</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-accent" />
            <span className="text-[11px] font-bold text-background/80 tabular-nums">96%</span>
          </div>
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-accent"
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </div>
    </section>
  );
};

export default AIPulseBanner;
