"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

interface ProjectItem {
  _id: string;
  name: string;
  slug: string;
  developerName?: string;
  community?: string;
  city?: string;
  startingPrice?: number;
  currency?: string;
  featuredImage?: string;
  imageGallery?: string[];
  source?: string;
  sourceUrl?: string;
  createdAt?: string;
}

function formatMoney(amount?: number, currency = "AED") {
  if (!amount) return "";
  return `${currency} ${amount.toLocaleString()}`;
}

export default function AdminProjectsPage() {
  const [secret, setSecret] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("projectAdminSecret");
    if (saved) setSecret(saved);
  }, []);

  const countLabel = useMemo(() => `${items.length} draft${items.length === 1 ? "" : "s"}`, [items.length]);

  const loadDrafts = async () => {
    setStatus(null);
    setLoading(true);
    try {
      if (!secret.trim()) {
        setStatus("Missing admin secret.");
        return;
      }
      window.localStorage.setItem("projectAdminSecret", secret.trim());
      const res = await fetch("/api/admin/projects?status=Draft&limit=200", {
        headers: { "x-admin-secret": secret.trim() },
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data?.error || "Failed to load drafts.");
        return;
      }
      setItems(data.items || []);
      setStatus(null);
    } catch (err: any) {
      setStatus(err?.message || "Failed to load drafts.");
    } finally {
      setLoading(false);
    }
  };

  const approveItem = async (id: string) => {
    setStatus(null);
    setApprovingId(id);
    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret.trim(),
        },
        body: JSON.stringify({ action: "approve" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data?.error || "Approval failed.");
        return;
      }
      setItems((prev) => prev.filter((p) => p._id !== id));
    } catch (err: any) {
      setStatus(err?.message || "Approval failed.");
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Draft Projects</h1>
            <p className="text-sm text-muted-foreground mt-1">Review and approve imported properties.</p>
          </div>
          <Link href="/" className="text-sm text-primary hover:underline">Back to site</Link>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-5 sm:p-6 mb-6">
          <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-end">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Admin Secret</label>
              <input
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="PROJECT_ADMIN_SECRET"
                className="mt-1 w-full h-10 rounded-xl bg-muted/40 border border-border/50 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <button
              onClick={loadDrafts}
              disabled={loading}
              className="h-10 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-60"
            >
              {loading ? "Loading..." : "Load Drafts"}
            </button>
          </div>
          {status && <p className="text-xs text-muted-foreground mt-3">{status}</p>}
          {!status && items.length > 0 && <p className="text-xs text-muted-foreground mt-3">{countLabel}</p>}
        </div>

        {items.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-16">No drafts found.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((p) => {
              const img = p.imageGallery?.[0] || p.featuredImage;
              const price = formatMoney(p.startingPrice, p.currency || "AED");
              return (
                <div key={p._id} className="rounded-2xl border border-border/50 bg-card overflow-hidden">
                  <div className="aspect-[4/3] bg-muted/30 overflow-hidden">
                    {img ? (
                      <img src={img} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No image</div>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <div>
                      <h3 className="text-sm font-bold text-foreground line-clamp-2">{p.name}</h3>
                      <p className="text-[11px] text-muted-foreground">
                        {p.developerName || "Unknown developer"}
                        {p.community ? ` · ${p.community}` : ""}
                        {p.city ? `, ${p.city}` : ""}
                      </p>
                    </div>
                    {price && <p className="text-sm font-semibold text-primary">{price}</p>}
                    {p.sourceUrl && (
                      <a
                        href={p.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-muted-foreground underline"
                      >
                        Source link
                      </a>
                    )}
                    <button
                      onClick={() => approveItem(p._id)}
                      disabled={approvingId === p._id}
                      className="w-full h-9 rounded-xl bg-emerald-600 text-white text-xs font-semibold disabled:opacity-60"
                    >
                      {approvingId === p._id ? "Approving..." : "Approve"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
