"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { TrendingUp, BarChart3, PieChart as PieIcon } from "lucide-react";
import Link from "next/link";

const priceData = [
  { area: "Downtown", price: 2850 },
  { area: "Marina", price: 2200 },
  { area: "Palm", price: 3400 },
  { area: "JVC", price: 950 },
  { area: "Business Bay", price: 1850 },
  { area: "JBR", price: 2400 },
  { area: "Dubai Hills", price: 1650 },
  { area: "Creek Harbour", price: 2100 },
];

const yieldData = [
  { area: "Downtown", yield: 5.8 },
  { area: "Marina", yield: 6.2 },
  { area: "JVC", yield: 8.1 },
  { area: "Business Bay", yield: 6.5 },
  { area: "Dubai Hills", yield: 5.9 },
  { area: "Sports City", yield: 7.8 },
];

const transactionData = [
  { month: "Aug", volume: 12400 },
  { month: "Sep", volume: 11800 },
  { month: "Oct", volume: 13200 },
  { month: "Nov", volume: 14100 },
  { month: "Dec", volume: 15800 },
  { month: "Jan", volume: 16200 },
];

const segmentData = [
  { name: "Apartments", value: 52, color: "hsl(168, 100%, 15%)" },
  { name: "Villas", value: 23, color: "hsl(43, 60%, 55%)" },
  { name: "Townhouses", value: 15, color: "hsl(168, 80%, 30%)" },
  { name: "Commercial", value: 10, color: "hsl(43, 40%, 70%)" },
];

type Tab = "prices" | "yields" | "transactions";

const MarketDashboard = () => {
  const [tab, setTab] = useState<Tab>("prices");

  return (
    <section className="py-10 sm:py-24 bg-muted/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-6 sm:mb-14">
          <motion.div initial={{ width: 0 }} whileInView={{ width: "3rem" }} viewport={{ once: true }} className="h-[2px] mx-auto mb-3 sm:mb-6" style={{ background: "linear-gradient(90deg, #D4A847, #B8922F)" }} />
          <p className="font-semibold tracking-[0.4em] uppercase text-[10px] sm:text-xs mb-2 sm:mb-4" style={{ color: "#D4A847" }}>Market Intelligence</p>
          <h2 className="text-xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            Dubai Market <span className="italic font-light">Dashboard</span>
          </h2>
          <p className="hidden sm:block mt-4 text-muted-foreground max-w-md mx-auto text-base">
            Live insights on prices, rental yields, and transaction trends across Dubai's top areas.
          </p>
        </motion.div>

        {/* Key stats row */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="grid grid-cols-4 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-10">
          {[
            { label: "Avg Price/sqft", value: "AED 1,950", change: "+8.2%" },
            { label: "Transactions", value: "16,200", change: "+12.5%" },
            { label: "Rental Yield", value: "6.4%", change: "+0.3%" },
            { label: "Off-Plan", value: "42%", change: "+5.1%" },
          ].map((s) => (
            <div key={s.label} className="bg-background rounded-lg sm:rounded-xl p-2 sm:p-5 border border-border/50 text-center sm:text-left">
              <p className="text-[8px] sm:text-xs text-muted-foreground font-medium mb-0.5 sm:mb-1 truncate">{s.label}</p>
              <p className="text-sm sm:text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-[8px] sm:text-xs font-semibold text-primary flex items-center justify-center sm:justify-start gap-0.5 sm:gap-1 mt-0.5 sm:mt-1">
                <TrendingUp className="h-2 w-2 sm:h-3 sm:w-3" /> {s.change}
              </p>
            </div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main chart area */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="lg:col-span-2 bg-background rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-border/50">
            {/* Tabs */}
            <div className="flex gap-1 mb-4 sm:mb-6">
              {([
                { id: "prices" as Tab, label: "Price / sqft", icon: BarChart3 },
                { id: "yields" as Tab, label: "Rental Yields", icon: PieIcon },
                { id: "transactions" as Tab, label: "Transactions", icon: TrendingUp },
              ]).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-semibold transition-all ${
                    tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  <t.icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> {t.label}
                </button>
              ))}
            </div>

            <div className="h-[200px] sm:h-[280px] pb-2 sm:pb-4">
              {tab === "prices" && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priceData} barSize={24}>
                    <XAxis dataKey="area" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v: number) => [`AED ${v}`, "Price/sqft"]} contentStyle={{ borderRadius: 12, border: "1px solid hsl(40,15%,88%)", fontSize: 12 }} />
                    <Bar dataKey="price" fill="hsl(168, 100%, 15%)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
              {tab === "yields" && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yieldData} barSize={24} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 10]} />
                    <YAxis dataKey="area" type="category" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={75} />
                    <Tooltip formatter={(v: number) => [`${v}%`, "Rental Yield"]} contentStyle={{ borderRadius: 12, border: "1px solid hsl(40,15%,88%)", fontSize: 12 }} />
                    <Bar dataKey="yield" fill="hsl(43, 60%, 55%)" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
              {tab === "transactions" && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={transactionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(40,15%,88%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v: number) => [v.toLocaleString(), "Transactions"]} contentStyle={{ borderRadius: 12, border: "1px solid hsl(40,15%,88%)", fontSize: 12 }} />
                    <Line type="monotone" dataKey="volume" stroke="hsl(168, 100%, 15%)" strokeWidth={3} dot={{ fill: "hsl(168, 100%, 15%)", r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          {/* Segment - stacked bar on mobile, donut on desktop */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-background rounded-2xl p-4 sm:p-6 border border-border/50">
            <h4 className="font-bold text-foreground mb-4 text-sm">Market Segments</h4>
            
            {/* Mobile: horizontal stacked bar */}
            <div className="sm:hidden">
              <div className="flex h-6 rounded-full overflow-hidden mb-4">
                {segmentData.map((s) => (
                  <div key={s.name} className="h-full" style={{ width: `${s.value}%`, backgroundColor: s.color }} />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {segmentData.map((s) => (
                  <div key={s.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-muted-foreground">{s.name}</span>
                    <span className="font-semibold text-foreground ml-auto">{s.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop: donut chart */}
            <div className="hidden sm:block">
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={segmentData} layout="vertical" barSize={20}>
                    <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 60]} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
                    <Tooltip formatter={(v: number) => [`${v}%`, "Share"]} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                      {segmentData.map((entry, i) => (
                        <motion.rect key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-2">
                {segmentData.map((s) => (
                  <div key={s.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="text-muted-foreground">{s.name}</span>
                    </div>
                    <span className="font-semibold text-foreground">{s.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <p className="text-[10px] sm:text-[11px] text-muted-foreground text-center mt-6">
          *Data is indicative and based on recent market trends.{" "}
          <Link href="/contact" className="underline hover:text-foreground transition-colors">Contact our investment team</Link> for precise analysis.
        </p>
      </div>
    </section>
  );
};

export default MarketDashboard;