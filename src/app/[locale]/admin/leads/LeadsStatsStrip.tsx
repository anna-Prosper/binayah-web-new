"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { LeadStats } from "@/lib/leads/stats";
import type { LeadStatus } from "@/lib/leads/types";

function formatDuration(ms: number | null): string {
  if (ms == null) return "—";
  const minutes = ms / 60_000;
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = minutes / 60;
  if (hours < 48) return `${hours.toFixed(1)} h`;
  const days = hours / 24;
  return `${days.toFixed(1)} d`;
}

function formatPct(v: number | undefined): string {
  if (v == null) return "—";
  return `${(v * 100).toFixed(0)}%`;
}

const STAGE_COLOR: Record<LeadStatus, string> = {
  new: "bg-blue-500",
  contacted: "bg-yellow-500",
  qualified: "bg-violet-500",
  meeting: "bg-orange-500",
  won: "bg-emerald-500",
  lost: "bg-gray-400",
};

export default function LeadsStatsStrip() {
  const [expanded, setExpanded] = useState(false);

  const { data: stats, isLoading } = useQuery<LeadStats>({
    queryKey: ["admin", "leads", "stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/leads/stats");
      if (!res.ok) throw new Error("stats failed");
      return res.json();
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const maxDay = stats ? Math.max(1, ...stats.byDay.map((d) => d.count)) : 1;
  const maxFunnel = stats ? Math.max(1, stats.funnel.stages[0]?.count ?? 1) : 1;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-4">
      {/* Top KPI row (always visible) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-gray-200">
        <Kpi label="Open" value={stats?.open ?? null} loading={isLoading} accent="text-emerald-700" />
        <Kpi label="New this week" value={stats?.last7Days ?? null} loading={isLoading} accent="text-blue-700" />
        <Kpi
          label="Avg first response"
          value={stats ? formatDuration(stats.avgTimeToContactMs) : null}
          loading={isLoading}
          accent="text-violet-700"
        />
        <Kpi
          label="New → Qualified"
          value={stats ? formatPct(stats.funnel.rates.contacted ? stats.funnel.rates.contacted * (stats.funnel.rates.qualified ?? 0) : undefined) : null}
          loading={isLoading}
          accent="text-amber-700"
        />
      </div>

      {/* Toggle */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-t border-gray-200 transition"
      >
        {expanded ? "Hide insights ▲" : "Show insights ▼"}
      </button>

      {/* Expanded panel */}
      {expanded && stats && (
        <div className="px-4 py-4 grid grid-cols-1 lg:grid-cols-3 gap-6 border-t border-gray-200">
          {/* Last-30-days sparkline */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Last 30 days
            </h4>
            <div className="flex items-end gap-0.5 h-20">
              {stats.byDay.map((d) => (
                <div
                  key={d.date}
                  className="flex-1 bg-emerald-500/70 rounded-t hover:bg-emerald-600 transition"
                  style={{ height: `${(d.count / maxDay) * 100}%`, minHeight: d.count > 0 ? 2 : 0 }}
                  title={`${d.date}: ${d.count}`}
                />
              ))}
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-gray-400">
              <span>{stats.byDay[0]?.date}</span>
              <span>{stats.byDay[stats.byDay.length - 1]?.date}</span>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {stats.last30Days} leads in last 30 days · {stats.last90Days} in last 90
            </p>
          </div>

          {/* Funnel */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Pipeline funnel
            </h4>
            <ul className="space-y-2">
              {stats.funnel.stages.map((s) => {
                const width = (s.count / maxFunnel) * 100;
                const rate = stats.funnel.rates[s.status];
                return (
                  <li key={s.status} className="text-xs">
                    <div className="flex justify-between mb-0.5">
                      <span className="text-gray-700 capitalize">{s.status}</span>
                      <span className="text-gray-500">
                        {s.count}
                        {rate != null && <span className="text-gray-400 ml-1">({formatPct(rate)})</span>}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded overflow-hidden">
                      <div className={`h-full ${STAGE_COLOR[s.status]}`} style={{ width: `${width}%` }} />
                    </div>
                  </li>
                );
              })}
              {stats.byStatus.lost > 0 && (
                <li className="text-xs pt-2 border-t border-gray-100">
                  <div className="flex justify-between">
                    <span className="text-gray-400">lost (dead-end)</span>
                    <span className="text-gray-400">{stats.byStatus.lost}</span>
                  </div>
                </li>
              )}
            </ul>
          </div>

          {/* Top communities + top properties */}
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Top communities (by lead volume)
              </h4>
              {stats.topCommunities.length === 0 ? (
                <p className="text-xs text-gray-400">No community data yet.</p>
              ) : (
                <ul className="space-y-1">
                  {stats.topCommunities.slice(0, 5).map((c) => (
                    <li key={c.name} className="flex justify-between text-xs">
                      <span className="text-gray-700 truncate">{c.name}</span>
                      <span className="text-gray-500 ml-2">{c.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Most-inquired properties
              </h4>
              {stats.topProperties.length === 0 ? (
                <p className="text-xs text-gray-400">No property inquiries yet.</p>
              ) : (
                <ul className="space-y-1">
                  {stats.topProperties.slice(0, 5).map((p) => (
                    <li key={p.slug} className="flex justify-between text-xs">
                      <a
                        href={`/property/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 hover:underline truncate"
                      >
                        {p.title}
                      </a>
                      <span className="text-gray-500 ml-2">{p.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Kpi({
  label,
  value,
  loading,
  accent,
}: {
  label: string;
  value: number | string | null;
  loading: boolean;
  accent: string;
}) {
  return (
    <div className="bg-white p-4">
      <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-xl sm:text-2xl font-bold ${accent}`}>
        {loading ? <span className="text-gray-300">…</span> : typeof value === "number" ? value.toLocaleString() : value ?? "—"}
      </p>
    </div>
  );
}
