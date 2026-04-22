"use client";

import { apiUrl } from "@/lib/api";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { TrendingUp, BarChart3, PieChart as PieIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

type Tab = "prices" | "yields" | "transactions";

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
  const t = useTranslations("marketDashboard");
  const [tab, setTab] = useState<Tab>("prices");
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiUrl("/api/market-stats"))
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
    <section className="py-10 sm:py-24 bg-muted/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-6 sm:mb-10">
          <motion.div initial={{ width: 0 }} whileInView={{ width: "3rem" }} viewport={{ once: true }} className="h-[2px] mx-auto mb-4 sm:mb-6" style={{ background: "linear-gradient(90deg, #D4A847, #B8922F)" }} />
          <p className="font-semibold tracking-[0.4em] uppercase text-[10px] sm:text-xs mb-2 sm:mb-4" style={{ color: "#D4A847" }}>{t("label")}</p>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-foreground">{t("dubaiMarket")} <span className="italic font-light">{t("title")}</span></h2>
          <p className="hidden sm:block mt-4 text-muted-foreground max-w-md mx-auto text-base">
            {t("dashboardSubtitle")}
          </p>
        </motion.div>

        {loading || !data ? (
          <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{t("loading")}</span>
          </div>
        ) : (
          <>
            {/* Key stats row */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="grid grid-cols-4 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-10">
              {[
                { label: t("avgPrice"), value: `AED ${formatNum(data.summary.avgPricePerSqft)}` },
                { label: t("transactions"), value: formatNum(data.summary.totalListings) },
                { label: t("rentalYield"), value: `${data.summary.avgYield}%` },
                { label: t("offPlan"), value: `${data.summary.offPlanShare}%` },
              ].map((s) => (
                <div key={s.label} className="bg-background rounded-lg sm:rounded-xl p-2 sm:p-5 border border-border/50 text-center sm:text-left">
                  <p className="text-[8px] sm:text-xs text-muted-foreground font-medium mb-0.5 sm:mb-1 truncate">{s.label}</p>
                  <p className="text-sm sm:text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-[8px] sm:text-xs font-semibold text-primary flex items-center justify-center sm:justify-start gap-0.5 sm:gap-1 mt-0.5 sm:mt-1">
                    <TrendingUp className="h-2 w-2 sm:h-3 sm:w-3" /> {t("liveData")}
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
                    { id: "prices" as Tab, label: t("tabPricePerSqft"), icon: BarChart3 },
                    { id: "yields" as Tab, label: t("tabRentalYields"), icon: PieIcon },
                    { id: "transactions" as Tab, label: t("tabByArea"), icon: TrendingUp },
                  ]).map((tab_item) => (
                    <button
                      key={tab_item.id}
                      onClick={() => setTab(tab_item.id)}
                      className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-semibold transition-all ${
                        tab === tab_item.id ? "text-white" : "text-muted-foreground hover:bg-secondary"
                      }`}
                      style={tab === tab_item.id ? { background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" } : undefined}
                    >
                      <tab_item.icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> {tab_item.label}
                    </button>
                  ))}
                </div>

                <div className="h-[200px] sm:h-[280px] pb-2 sm:pb-4">
                  {tab === "prices" && data.priceByArea.length > 0 && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.priceByArea} barSize={24}>
                        <XAxis dataKey="area" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip formatter={(v: number) => [`AED ${v.toLocaleString()}`, "Price/sqft"]} contentStyle={{ borderRadius: 12, border: "1px solid hsl(40,15%,88%)", fontSize: 12 }} />
                        <Bar dataKey="price" fill="hsl(168, 100%, 15%)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                  {tab === "prices" && data.priceByArea.length === 0 && (
                    <EmptyState message="Not enough listing data with size info to compute price/sqft." />
                  )}

                  {tab === "yields" && data.yieldByArea.length > 0 && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.yieldByArea} barSize={24} layout="vertical">
                        <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, "auto"]} />
                        <YAxis dataKey="area" type="category" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={75} />
                        <Tooltip formatter={(v: number) => [`${v}%`, "Rental Yield"]} contentStyle={{ borderRadius: 12, border: "1px solid hsl(40,15%,88%)", fontSize: 12 }} />
                        <Bar dataKey="yield" fill="hsl(43, 60%, 55%)" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                  {tab === "yields" && data.yieldByArea.length === 0 && (
                    <EmptyState message="Need both rental and sale listings in the same areas to compute yields." />
                  )}

                  {tab === "transactions" && data.volumeByArea.length > 0 && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.volumeByArea} barSize={24}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(40,15%,88%)" />
                        <XAxis dataKey="area" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip formatter={(v: number) => [v.toLocaleString(), "Properties"]} contentStyle={{ borderRadius: 12, border: "1px solid hsl(40,15%,88%)", fontSize: 12 }} />
                        <Bar dataKey="volume" fill="hsl(168, 100%, 15%)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </motion.div>

              {/* Segment */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-background rounded-2xl p-4 sm:p-6 border border-border/50">
                <h4 className="font-bold text-foreground mb-4 text-sm">{t("marketSegments")}</h4>

                {/* Mobile: horizontal stacked bar */}
                <div className="sm:hidden">
                  <div className="flex h-6 rounded-full overflow-hidden mb-4">
                    {data.segments.map((s) => (
                      <div key={s.name} className="h-full" style={{ width: `${s.value}%`, backgroundColor: s.color }} />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {data.segments.map((s) => (
                      <div key={s.name} className="flex items-center gap-2 text-xs">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                        <span className="text-muted-foreground">{s.name}</span>
                        <span className="font-semibold text-foreground ml-auto">{s.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Desktop: horizontal bar chart */}
                <div className="hidden sm:block">
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.segments} layout="vertical" barSize={20}>
                        <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 60]} />
                        <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
                        <Tooltip formatter={(v: number) => [`${v}%`, "Share"]} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                        <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                          {data.segments.map((entry, i) => (
                            <motion.rect key={i} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
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
                </div>
              </motion.div>
            </div>

            <p className="text-[10px] sm:text-[11px] text-muted-foreground text-center mt-6">
              {t("dataIndicative")}{" "}
              <Link href="/contact" className="underline hover:text-foreground transition-colors">{t("contactTeam")}</Link>{" "}{t("forPreciseAnalysis")}
            </p>
          </>
        )}
      </div>
    </section>
  );
};

const EmptyState = ({ message }: { message: string }) => (
  <div className="h-full flex items-center justify-center text-sm text-muted-foreground text-center px-8">
    {message}
  </div>
);

export default MarketDashboard;
