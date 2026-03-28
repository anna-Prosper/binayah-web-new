"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from "recharts";
import { BarChart3, PieChart as PieIcon, Building2, Loader2 } from "lucide-react";

type Tab = "prices" | "yields" | "volume";

interface MarketData {
  summary: {
    avgPricePerSqft: number;
    totalListings: number;
    avgYield: number;
    offPlanShare: number;
    offPlanCount: number;
    secondaryCount: number;
  };
  priceByArea: { area: string; price: number; count: number }[];
  yieldByArea: { area: string; yield: number; avgRent: number; avgSale: number }[];
  volumeByArea: { area: string; volume: number }[];
  segments: { name: string; value: number; count: number; color: string }[];
}

const MarketDashboard = () => {
  const [tab, setTab] = useState<Tab>("prices");
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/market-stats")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatNum = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return n.toLocaleString();
    return String(n);
  };

  return (
    <section className="py-24 bg-card">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <motion.div initial={{ width: 0 }} whileInView={{ width: "3rem" }} viewport={{ once: true }} className="h-[2px] bg-accent mx-auto mb-6" />
          <p className="text-accent font-semibold tracking-[0.4em] uppercase text-xs mb-4">Market Intelligence</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            Dubai Market <span className="italic font-light">Dashboard</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-md mx-auto">
            Live insights on prices, rental yields, and property trends across Dubai&apos;s top areas.
          </p>
        </motion.div>

        {loading || !data ? (
          <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading market data...</span>
          </div>
        ) : (
          <>
            {/* Key stats row */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              <StatCard label="Avg Price/sqft" value={`AED ${formatNum(data.summary.avgPricePerSqft)}`} />
              <StatCard label="Active Listings" value={formatNum(data.summary.totalListings)} />
              <StatCard label="Avg Rental Yield" value={`${data.summary.avgYield}%`} />
              <StatCard label="Off-Plan Share" value={`${data.summary.offPlanShare}%`} />
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main chart area */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="lg:col-span-2 bg-background rounded-2xl p-6 border border-border/50">
                <div className="flex gap-1 mb-6">
                  {([
                    { id: "prices" as Tab, label: "Price / sqft", icon: BarChart3 },
                    { id: "yields" as Tab, label: "Rental Yields", icon: PieIcon },
                    { id: "volume" as Tab, label: "By Area", icon: Building2 },
                  ]).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                        tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      <t.icon className="h-3.5 w-3.5" /> {t.label}
                    </button>
                  ))}
                </div>

                <div className="h-[280px]">
                  {tab === "prices" && data.priceByArea.length > 0 && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.priceByArea} barSize={32}>
                        <XAxis dataKey="area" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          formatter={(v: number) => [`AED ${v.toLocaleString()}`, "Avg Price/sqft"]}
                          contentStyle={{ borderRadius: 12, border: "1px solid hsl(40,15%,88%)", fontSize: 12 }}
                        />
                        <Bar dataKey="price" fill="hsl(168, 100%, 15%)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                  {tab === "prices" && data.priceByArea.length === 0 && (
                    <EmptyState message="Not enough listing data with size info to compute price/sqft." />
                  )}

                  {tab === "yields" && data.yieldByArea.length > 0 && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.yieldByArea} barSize={32} layout="vertical">
                        <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, "auto"]} />
                        <YAxis dataKey="area" type="category" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
                        <Tooltip
                          formatter={(v: number) => [`${v}%`, "Rental Yield"]}
                          contentStyle={{ borderRadius: 12, border: "1px solid hsl(40,15%,88%)", fontSize: 12 }}
                        />
                        <Bar dataKey="yield" fill="hsl(43, 60%, 55%)" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                  {tab === "yields" && data.yieldByArea.length === 0 && (
                    <EmptyState message="Need both rental and sale listings in the same areas to compute yields." />
                  )}

                  {tab === "volume" && data.volumeByArea.length > 0 && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.volumeByArea} barSize={32}>
                        <XAxis dataKey="area" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          formatter={(v: number) => [v.toLocaleString(), "Properties"]}
                          contentStyle={{ borderRadius: 12, border: "1px solid hsl(40,15%,88%)", fontSize: 12 }}
                        />
                        <Bar dataKey="volume" fill="hsl(168, 80%, 25%)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </motion.div>

              {/* Segment pie */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-background rounded-2xl p-6 border border-border/50">
                <h4 className="font-bold text-foreground mb-4 text-sm">Property Segments</h4>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={data.segments} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                        {data.segments.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v: number) => [`${v}%`, "Share"]}
                        contentStyle={{ borderRadius: 12, fontSize: 12 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-2">
                  {data.segments.map((s) => (
                    <div key={s.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                        <span className="text-muted-foreground">{s.name}</span>
                      </div>
                      <span className="font-semibold text-foreground">{s.value}%</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            <p className="text-[11px] text-muted-foreground text-center mt-6">
              *Based on current market data across Dubai&apos;s key communities.
            </p>
          </>
        )}
      </div>
    </section>
  );
};

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-background rounded-xl p-5 border border-border/50">
    <p className="text-xs text-muted-foreground font-medium mb-1">{label}</p>
    <p className="text-2xl font-bold text-foreground">{value}</p>
    <p className="text-xs font-semibold text-primary flex items-center gap-1 mt-1">
      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12c2-3 5-8 10-3s8 0 10-3" /></svg>
      Live data
    </p>
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="h-full flex items-center justify-center text-sm text-muted-foreground text-center px-8">
    {message}
  </div>
);

export default MarketDashboard;