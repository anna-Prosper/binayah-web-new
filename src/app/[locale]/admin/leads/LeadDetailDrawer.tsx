"use client";

import { useEffect, useState } from "react";
import type { LeadStatus, UnifiedLead } from "@/lib/leads/types";
import { LEAD_STATUSES } from "@/lib/leads/types";

interface Props {
  /** Composite id "<source>:<mongoId>" — when set, drawer opens and fetches detail. */
  leadId: string | null;
  onClose: () => void;
  /** Called after any mutation (PATCH/DELETE) so the parent list can refresh. */
  onChange: () => void;
}

function splitId(composite: string): { source: string; mongoId: string } | null {
  const idx = composite.indexOf(":");
  if (idx < 0) return null;
  return { source: composite.slice(0, idx), mongoId: composite.slice(idx + 1) };
}

function formatDate(d: Date | string | undefined): string {
  if (!d) return "";
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

export default function LeadDetailDrawer({ leadId, onClose, onChange }: Props) {
  const [lead, setLead] = useState<UnifiedLead | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [assignedInput, setAssignedInput] = useState("");
  const [noteInput, setNoteInput] = useState("");

  // Fetch detail when leadId changes
  useEffect(() => {
    if (!leadId) {
      setLead(null);
      setError(null);
      return;
    }
    const parts = splitId(leadId);
    if (!parts) {
      setError("Bad lead id");
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`/api/admin/leads/${encodeURIComponent(parts.mongoId)}?source=${encodeURIComponent(parts.source)}`)
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || "Failed to load");
        return r.json() as Promise<UnifiedLead>;
      })
      .then((l) => {
        setLead(l);
        setAssignedInput(l.assignedTo ?? "");
        setNoteInput("");
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [leadId]);

  async function patch(body: Record<string, unknown>) {
    if (!leadId) return;
    const parts = splitId(leadId);
    if (!parts) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/leads/${encodeURIComponent(parts.mongoId)}?source=${encodeURIComponent(parts.source)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Update failed");
      setLead(data as UnifiedLead);
      setNoteInput("");
      onChange();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function softDelete() {
    if (!leadId) return;
    if (!confirm("Soft-delete this lead? It will be hidden from the list but preserved in the database.")) {
      return;
    }
    const parts = splitId(leadId);
    if (!parts) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/leads/${encodeURIComponent(parts.mongoId)}?source=${encodeURIComponent(parts.source)}`,
        { method: "DELETE" }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Delete failed");
      onChange();
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (!leadId) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-end" onClick={onClose}>
      <div
        className="w-full max-w-xl bg-white h-full overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Lead detail</p>
            <p className="text-sm font-semibold text-gray-900 truncate">{lead?.name || (loading ? "Loading…" : "")}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md border border-gray-200 hover:bg-gray-50 flex items-center justify-center"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-4 px-3 py-2 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs">
            {error}
          </div>
        )}

        {!lead && loading && (
          <div className="px-5 py-12 text-center text-sm text-gray-500">Loading lead…</div>
        )}

        {lead && (
          <div className="px-5 py-5 space-y-6">
            {/* Identity card */}
            <section>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Contact</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-500 w-20 inline-block">Source:</span> {lead.source}{lead.channel ? ` / ${lead.channel}` : ""}</p>
                <p><span className="text-gray-500 w-20 inline-block">Email:</span> {lead.email ? <a href={`mailto:${lead.email}`} className="text-emerald-700 hover:underline">{lead.email}</a> : "—"}</p>
                <p><span className="text-gray-500 w-20 inline-block">Phone:</span> {lead.phone ? <a href={`tel:${lead.phone.replace(/\s+/g, "")}`} className="text-emerald-700 hover:underline">{lead.phone}</a> : "—"}</p>
                {lead.community && <p><span className="text-gray-500 w-20 inline-block">Community:</span> {lead.community}</p>}
                {lead.property?.title && <p><span className="text-gray-500 w-20 inline-block">Property:</span> {lead.property.title}</p>}
                {lead.project?.name && <p><span className="text-gray-500 w-20 inline-block">Project:</span> {lead.project.name}</p>}
                {lead.intent && lead.intent.length > 0 && <p><span className="text-gray-500 w-20 inline-block">Intent:</span> {lead.intent.join(", ")}</p>}
                {lead.budget && (lead.budget.min || lead.budget.max) && (
                  <p>
                    <span className="text-gray-500 w-20 inline-block">Budget:</span>
                    AED {(lead.budget.min ?? 0).toLocaleString()} – {(lead.budget.max ?? 0).toLocaleString()}
                  </p>
                )}
                <p><span className="text-gray-500 w-20 inline-block">Created:</span> {formatDate(lead.createdAt)}</p>
              </div>
            </section>

            {lead.message && (
              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Message</h3>
                <p className="text-sm text-gray-800 whitespace-pre-wrap bg-gray-50 rounded-md p-3 border border-gray-200">{lead.message}</p>
              </section>
            )}

            {/* Status */}
            <section>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Status</h3>
              <div className="flex flex-wrap gap-1.5">
                {LEAD_STATUSES.map((s) => (
                  <button
                    key={s}
                    disabled={saving || lead.status === s}
                    onClick={() => patch({ status: s })}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border transition disabled:opacity-50 disabled:cursor-not-allowed ${
                      lead.status === s
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </section>

            {/* Assign to */}
            <section>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Assigned to</h3>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="agent@binayah.com"
                  value={assignedInput}
                  onChange={(e) => setAssignedInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  disabled={saving || assignedInput === (lead.assignedTo ?? "")}
                  onClick={() => patch({ assignedTo: assignedInput || null })}
                  className="px-3 py-1.5 rounded-md bg-primary text-white text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save
                </button>
                {lead.assignedTo && (
                  <button
                    disabled={saving}
                    onClick={() => {
                      setAssignedInput("");
                      patch({ assignedTo: null });
                    }}
                    className="px-3 py-1.5 rounded-md border border-gray-300 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Clear
                  </button>
                )}
              </div>
            </section>

            {/* Add note */}
            <section>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Add a note</h3>
              <textarea
                placeholder="Called — interested in 2BR Marina. Will send 3 options tomorrow."
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <div className="flex justify-end mt-2">
                <button
                  disabled={saving || noteInput.trim().length === 0}
                  onClick={() => patch({ note: { text: noteInput } })}
                  className="px-3 py-1.5 rounded-md bg-primary text-white text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add note
                </button>
              </div>
            </section>

            {/* Timeline */}
            <section>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Timeline ({lead.notes.length})
              </h3>
              {lead.notes.length === 0 ? (
                <p className="text-sm text-gray-400">No notes yet.</p>
              ) : (
                <ul className="space-y-2">
                  {[...lead.notes].reverse().map((n, i) => (
                    <li
                      key={i}
                      className={`text-xs rounded-md p-3 border ${
                        n.system
                          ? "bg-gray-50 border-gray-200 text-gray-600"
                          : "bg-amber-50 border-amber-200 text-gray-800"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-semibold">{n.author}</span>
                        <span className="text-gray-400">{formatDate(n.at)}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{n.text}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Danger zone */}
            <section className="pt-4 border-t border-gray-100">
              <button
                onClick={softDelete}
                disabled={saving}
                className="text-xs text-red-600 hover:text-red-700 hover:underline disabled:opacity-50"
              >
                Soft-delete this lead
              </button>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
