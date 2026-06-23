"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface StatCard {
  key: string;
  label: string;
  color: string;
  value: number;
}

export default function UserActionsStrip({ stats }: { stats: StatCard[] }) {
  const [activeAction, setActiveAction] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <button
            key={stat.key}
            onClick={() => setActiveAction(stat.key)}
            className="bg-white rounded-2xl border border-gray-200 p-4 text-left hover:border-gray-300 hover:shadow-sm transition-all group"
          >
            <div className="text-2xl font-bold tabular-nums group-hover:opacity-80 transition-opacity" style={{ color: stat.color }}>
              {stat.value.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            <div className="text-[10px] text-gray-400 mt-1 group-hover:text-gray-600 transition-colors">View list →</div>
          </button>
        ))}
      </div>

      {activeAction && (
        <EventsModal action={activeAction} label={stats.find((s) => s.key === activeAction)?.label ?? activeAction} onClose={() => setActiveAction(null)} />
      )}
    </>
  );
}

interface UserEvent {
  action: string;
  source?: string;
  entityType?: string;
  entitySlug?: string;
  entityTitle?: string;
  createdAt: string;
}

function EventsModal({ action, label, onClose }: { action: string; label: string; onClose: () => void }) {
  const [skip, setSkip] = useState(0);
  const limit = 50;

  const { data, isLoading } = useQuery<{ events: UserEvent[]; total: number }>({
    queryKey: ["admin", "events", action, skip],
    queryFn: async () => {
      const res = await fetch(`/api/admin/events?action=${action}&limit=${limit}&skip=${skip}`);
      if (!res.ok) throw new Error("Failed to load events");
      return res.json();
    },
    staleTime: 60 * 1000,
  });

  const events = data?.events ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const page = Math.floor(skip / limit) + 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900">{label}</h2>
            {!isLoading && <p className="text-xs text-gray-400 mt-0.5">{total.toLocaleString()} total events</p>}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1">
          {isLoading ? (
            <div className="py-16 text-center text-gray-400 text-sm">Loading…</div>
          ) : events.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">No events recorded yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3">When</th>
                  <th className="px-5 py-3">Page / context</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {events.map((ev, i) => (
                  <tr key={i} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap text-xs">
                      {formatDate(ev.createdAt)}
                    </td>
                    <td className="px-5 py-3 text-gray-700 max-w-xs">
                      {ev.entityTitle ? (
                        <span className="font-medium">{ev.entityTitle}</span>
                      ) : ev.source ? (
                        <span className="text-gray-500 font-mono text-xs truncate block">{ev.source}</span>
                      ) : (
                        <span className="text-gray-300">, </span>
                      )}
                      {ev.source && ev.entityTitle && (
                        <span className="block text-[10px] text-gray-400 font-mono truncate">{ev.source}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-xs text-gray-500">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setSkip((s) => Math.max(0, s - limit))}
                className="px-3 py-1.5 rounded-md border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setSkip((s) => s + limit)}
                className="px-3 py-1.5 rounded-md border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(d: string): string {
  try {
    return new Date(d).toLocaleString("en-GB", {
      timeZone: "Asia/Dubai",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(d);
  }
}
