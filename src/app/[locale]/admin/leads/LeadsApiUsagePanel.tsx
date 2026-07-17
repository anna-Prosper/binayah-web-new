"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { AuditQueryResult } from "@/lib/leads/audit";

type AuditResponse = AuditQueryResult & { labels: Record<string, string> };

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = ms / 60_000;
  if (m < 1) return "just now";
  if (m < 60) return `${Math.round(m)}m ago`;
  const h = m / 60;
  if (h < 24) return `${Math.round(h)}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

function keyName(keyId: string, labels: Record<string, string>): string {
  if (keyId === "session") return "Dashboard (admin session)";
  if (keyId === "-") return "Anonymous / no key";
  return labels[keyId] ? `${labels[keyId]} (${keyId})` : keyId;
}

const REASON_STYLE: Record<string, string> = {
  ok: "bg-emerald-100 text-emerald-700",
  "no-auth": "bg-gray-100 text-gray-600",
  "invalid-key": "bg-red-100 text-red-700",
  "insufficient-scope": "bg-amber-100 text-amber-700",
  "rate-limited": "bg-orange-100 text-orange-700",
};

export default function LeadsApiUsagePanel() {
  const [expanded, setExpanded] = useState(false);
  const [days, setDays] = useState(30);

  const { data, isLoading, isError, refetch, isFetching } = useQuery<AuditResponse>({
    queryKey: ["admin", "leads", "audit", days],
    queryFn: async () => {
      const res = await fetch(`/api/admin/leads/audit?days=${days}`);
      if (!res.ok) throw new Error("audit failed");
      return res.json();
    },
    enabled: expanded,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });

  const labels = data?.labels ?? {};

  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">API key usage &amp; access log</span>
          <span className="text-xs text-gray-500">— who pulled leads, from which IPs</span>
        </div>
        <span className="text-gray-400 text-sm">{expanded ? "Hide ▲" : "Show ▼"}</span>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 py-4">
          {/* Controls */}
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xs text-gray-500">Window:</span>
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  days === d ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {d}d
              </button>
            ))}
            <button
              onClick={() => refetch()}
              className="ml-auto rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200"
            >
              {isFetching ? "Refreshing…" : "Refresh"}
            </button>
          </div>

          {isLoading && <p className="py-6 text-center text-sm text-gray-400">Loading…</p>}
          {isError && <p className="py-6 text-center text-sm text-red-500">Failed to load audit log.</p>}

          {data && (
            <>
              {/* Per-key summary */}
              <div className="mb-6 overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
                      <th className="py-2 pr-3 font-medium">Caller</th>
                      <th className="py-2 pr-3 font-medium">Scope</th>
                      <th className="py-2 pr-3 font-medium">Requests</th>
                      <th className="py-2 pr-3 font-medium">Allowed / Denied</th>
                      <th className="py-2 pr-3 font-medium">Source IPs</th>
                      <th className="py-2 pr-3 font-medium">Last used</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.byKey.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-gray-400">
                          No API activity in the last {data.windowDays} days.
                        </td>
                      </tr>
                    )}
                    {data.byKey.map((k) => (
                      <tr key={k.keyId} className="border-b border-gray-100 align-top">
                        <td className="py-2.5 pr-3 font-medium text-gray-900">{keyName(k.keyId, labels)}</td>
                        <td className="py-2.5 pr-3">
                          {k.scopes.length ? k.scopes.join(", ") : "—"}
                        </td>
                        <td className="py-2.5 pr-3 tabular-nums">{k.total}</td>
                        <td className="py-2.5 pr-3 tabular-nums">
                          <span className="text-emerald-600">{k.allowed}</span>
                          {" / "}
                          <span className={k.denied ? "text-red-600" : "text-gray-400"}>{k.denied}</span>
                        </td>
                        <td className="py-2.5 pr-3">
                          <div className="flex flex-wrap gap-1">
                            {k.ips.map((ip) => (
                              <span key={ip} className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-700 tabular-nums">
                                {ip}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-2.5 pr-3 whitespace-nowrap text-gray-500">{timeAgo(k.lastUsed)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Recent activity */}
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Recent requests</p>
              <div className="max-h-80 overflow-auto rounded-lg border border-gray-100">
                <table className="w-full min-w-[720px] text-xs">
                  <thead className="sticky top-0 bg-gray-50">
                    <tr className="text-left text-gray-500">
                      <th className="px-3 py-2 font-medium">When</th>
                      <th className="px-3 py-2 font-medium">Caller</th>
                      <th className="px-3 py-2 font-medium">Result</th>
                      <th className="px-3 py-2 font-medium">Method</th>
                      <th className="px-3 py-2 font-medium">Path</th>
                      <th className="px-3 py-2 font-medium">IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent.map((r, i) => (
                      <tr key={i} className="border-t border-gray-100">
                        <td className="whitespace-nowrap px-3 py-1.5 text-gray-500">{timeAgo(r.at)}</td>
                        <td className="px-3 py-1.5 text-gray-800">
                          {r.keyId ? keyName(r.keyId, labels) : r.via === "session" ? "Dashboard" : "Anonymous"}
                        </td>
                        <td className="px-3 py-1.5">
                          <span className={`rounded px-1.5 py-0.5 font-medium ${REASON_STYLE[r.reason] ?? "bg-gray-100 text-gray-600"}`}>
                            {r.ok ? "ok" : r.reason}
                          </span>
                        </td>
                        <td className="px-3 py-1.5 font-mono text-gray-700">{r.method}</td>
                        <td className="px-3 py-1.5 font-mono text-gray-600">{r.path.replace("/api/admin/leads", "…")}</td>
                        <td className="whitespace-nowrap px-3 py-1.5 font-mono text-gray-600 tabular-nums">{r.ip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
