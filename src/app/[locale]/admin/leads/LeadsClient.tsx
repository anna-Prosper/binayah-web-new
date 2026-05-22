"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { LeadSource, LeadStatus, LeadsListResponse, UnifiedLead } from "@/lib/leads/types";
import { LEAD_STATUSES } from "@/lib/leads/types";
import LeadDetailDrawer from "./LeadDetailDrawer";
import LeadsStatsStrip from "./LeadsStatsStrip";

const SOURCES: { value: LeadSource; label: string; color: string }[] = [
  { value: "inquiry", label: "Inquiry", color: "bg-emerald-100 text-emerald-700" },
  { value: "newsletter", label: "Newsletter", color: "bg-blue-100 text-blue-700" },
  { value: "list-property", label: "List property", color: "bg-amber-100 text-amber-700" },
  { value: "project-subscribe", label: "Project sub", color: "bg-purple-100 text-purple-700" },
];

const STATUS_COLOR: Record<LeadStatus, string> = {
  new: "bg-blue-50 text-blue-700 border-blue-200",
  contacted: "bg-yellow-50 text-yellow-700 border-yellow-200",
  qualified: "bg-violet-50 text-violet-700 border-violet-200",
  meeting: "bg-orange-50 text-orange-700 border-orange-200",
  won: "bg-emerald-50 text-emerald-700 border-emerald-200",
  lost: "bg-gray-100 text-gray-600 border-gray-200",
};

function formatDate(d: Date | string): string {
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

function sourceLabel(s: LeadSource): { label: string; color: string } {
  return SOURCES.find((x) => x.value === s) || { label: s, color: "bg-gray-100 text-gray-700" };
}

export default function LeadsClient() {
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [sourceFilter, setSourceFilter] = useState<LeadSource[]>([]);
  const [statusFilter, setStatusFilter] = useState<LeadStatus[]>([]);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

  // Debounce search input so we don't flood the API per-keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  // Reset to page 1 whenever any filter changes.
  useEffect(() => {
    setPage(1);
  }, [sourceFilter, statusFilter, debouncedQ]);

  const params = useMemo(() => {
    const p = new URLSearchParams();
    p.set("page", String(page));
    p.set("limit", String(limit));
    if (sourceFilter.length) p.set("source", sourceFilter.join(","));
    if (statusFilter.length) p.set("status", statusFilter.join(","));
    if (debouncedQ.trim()) p.set("q", debouncedQ.trim());
    return p.toString();
  }, [page, limit, sourceFilter, statusFilter, debouncedQ]);

  const { data, isLoading, isFetching, refetch } = useQuery<LeadsListResponse>({
    queryKey: ["admin", "leads", params],
    queryFn: async () => {
      const res = await fetch(`/api/admin/leads?${params}`);
      if (!res.ok) throw new Error("Failed to load leads");
      return res.json();
    },
    staleTime: 30 * 1000,
  });

  const [openLeadId, setOpenLeadId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  // Selection drops whenever the visible page changes — selecting across
  // pages is confusing and operationally rare.
  useEffect(() => {
    setSelected(new Set());
  }, [params]);

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function runBulk(action: "patch" | "delete", patch?: Record<string, unknown>) {
    if (selected.size === 0) return;
    if (action === "delete" && !confirm(`Soft-delete ${selected.size} leads?`)) return;
    setBulkBusy(true);
    try {
      const res = await fetch("/api/admin/leads/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected), action, ...(patch || {}) }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`Bulk failed: ${data.error || "unknown"}`);
        return;
      }
      if (data.failed?.length > 0) {
        alert(`${data.succeeded} succeeded, ${data.failed.length} failed.`);
      }
      setSelected(new Set());
      refetch();
    } finally {
      setBulkBusy(false);
    }
  }

  function toggleSource(s: LeadSource) {
    setSourceFilter((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }
  function toggleStatus(s: LeadStatus) {
    setStatusFilter((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  const leads = data?.leads ?? [];
  const totalPages = data ? Math.max(1, Math.ceil(data.total / limit)) : 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-500">
            {data
              ? `${data.total.toLocaleString()} total across all sources`
              : "Loading…"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/api/admin/leads/export?${params}`}
            className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Export CSV
          </a>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90"
          >
            {isFetching ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {/* Stats summary strip */}
      <LeadsStatsStrip />

      {/* Source counts */}
      {data?.counts && (
        <div className="flex flex-wrap gap-2 mb-4">
          {SOURCES.map((s) => {
            const count = data.counts[s.value] ?? 0;
            const active = sourceFilter.includes(s.value);
            return (
              <button
                key={s.value}
                onClick={() => toggleSource(s.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                  active
                    ? "border-gray-900 bg-gray-900 text-white"
                    : `border-gray-200 ${s.color} hover:opacity-80`
                }`}
              >
                {s.label} · {count.toLocaleString()}
              </button>
            );
          })}
        </div>
      )}

      {/* Status + search filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {LEAD_STATUSES.map((s) => {
            const active = statusFilter.includes(s);
            return (
              <button
                key={s}
                onClick={() => toggleStatus(s)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium border transition ${
                  active
                    ? "border-gray-900 bg-gray-900 text-white"
                    : `${STATUS_COLOR[s]} hover:opacity-80`
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
        <input
          type="search"
          placeholder="Search name / email / phone…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-1.5 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="bg-gray-900 text-white rounded-xl px-4 py-3 mb-3 flex items-center gap-3 flex-wrap text-sm">
          <span className="font-semibold">{selected.size} selected</span>
          <span className="text-gray-400">|</span>
          <span className="text-gray-300 text-xs">Set status:</span>
          {LEAD_STATUSES.map((s) => (
            <button
              key={s}
              disabled={bulkBusy}
              onClick={() => runBulk("patch", { status: s })}
              className="px-2.5 py-1 rounded-md bg-gray-800 hover:bg-gray-700 text-xs font-medium disabled:opacity-50"
            >
              {s}
            </button>
          ))}
          <span className="text-gray-400">|</span>
          <button
            disabled={bulkBusy}
            onClick={() => {
              const email = prompt("Assign to (email, blank to unassign):", "");
              if (email === null) return;
              runBulk("patch", { assignedTo: email.trim() || null });
            }}
            className="px-3 py-1 rounded-md bg-gray-800 hover:bg-gray-700 text-xs font-medium disabled:opacity-50"
          >
            Assign…
          </button>
          <button
            disabled={bulkBusy}
            onClick={() => runBulk("delete")}
            className="px-3 py-1 rounded-md bg-red-700 hover:bg-red-600 text-xs font-medium disabled:opacity-50 ml-auto"
          >
            Delete
          </button>
          <button
            disabled={bulkBusy}
            onClick={() => setSelected(new Set())}
            className="px-3 py-1 rounded-md border border-gray-600 text-xs disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-3 w-8">
                <input
                  type="checkbox"
                  checked={leads.length > 0 && leads.every((l) => selected.has(l.id))}
                  onChange={(e) => {
                    if (e.target.checked) setSelected(new Set(leads.map((l) => l.id)));
                    else setSelected(new Set());
                  }}
                  aria-label="Select all on page"
                />
              </th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Context</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center text-gray-500 py-12">
                  Loading leads…
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-gray-500 py-12">
                  No leads match these filters.
                </td>
              </tr>
            ) : (
              leads.map((l) => (
                <LeadRow
                  key={l.id}
                  lead={l}
                  onOpen={() => setOpenLeadId(l.id)}
                  selected={selected.has(l.id)}
                  onToggleSelect={() => toggleSelected(l.id)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-xs text-gray-500">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 rounded-md border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 rounded-md border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>

      <LeadDetailDrawer
        leadId={openLeadId}
        onClose={() => setOpenLeadId(null)}
        onChange={() => refetch()}
      />
    </div>
  );
}

function LeadRow({
  lead,
  onOpen,
  selected,
  onToggleSelect,
}: {
  lead: UnifiedLead;
  onOpen: () => void;
  selected: boolean;
  onToggleSelect: () => void;
}) {
  const src = sourceLabel(lead.source);
  const context =
    lead.property?.title ||
    lead.project?.name ||
    lead.community ||
    (lead.intent && lead.intent.length ? lead.intent.join(", ") : "") ||
    "—";

  return (
    <tr className={`hover:bg-gray-50 transition cursor-pointer ${selected ? "bg-emerald-50/50" : ""}`} onClick={onOpen}>
      <td className="px-4 py-3 w-8" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          aria-label={`Select ${lead.name || lead.id}`}
        />
      </td>
      <td className="px-4 py-3">
        <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${src.color}`}>
          {src.label}
        </span>
        {lead.channel && lead.channel !== src.label.toLowerCase() && (
          <p className="text-[10px] text-gray-400 mt-0.5">{lead.channel}</p>
        )}
      </td>
      <td className="px-4 py-3 text-gray-900 font-medium">
        {lead.name || <span className="text-gray-400">(no name)</span>}
      </td>
      <td className="px-4 py-3 text-gray-700" onClick={(e) => e.stopPropagation()}>
        {lead.email && (
          <a href={`mailto:${lead.email}`} className="block hover:underline">
            {lead.email}
          </a>
        )}
        {lead.phone && (
          <a
            href={`tel:${lead.phone.replace(/\s+/g, "")}`}
            className="block text-xs text-gray-500 hover:underline"
          >
            {lead.phone}
          </a>
        )}
      </td>
      <td className="px-4 py-3 text-gray-700 max-w-[260px] truncate">{context}</td>
      <td className="px-4 py-3">
        <span
          className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium border ${STATUS_COLOR[lead.status]}`}
        >
          {lead.status}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
        {formatDate(lead.createdAt)}
      </td>
    </tr>
  );
}
