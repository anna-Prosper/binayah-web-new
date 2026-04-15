"use client";

import { useState, useEffect, useCallback } from "react";
import { Heart, Share2, ArrowLeftRight, Link2, Check, X } from "lucide-react";

// ─── Favorites ───────────────────────────────────────────────────────────────

const FAV_KEY = "binayah_favorites";

export function useFavorites() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAV_KEY);
      if (stored) setIds(JSON.parse(stored));
    } catch {
      /* ignore */
    }
    const handler = () => {
      try {
        const stored = localStorage.getItem(FAV_KEY);
        setIds(stored ? JSON.parse(stored) : []);
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("favorites-update", handler);
    return () => window.removeEventListener("favorites-update", handler);
  }, []);

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(FAV_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("favorites-update"));
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setIds([]);
    localStorage.removeItem(FAV_KEY);
    window.dispatchEvent(new Event("favorites-update"));
  }, []);

  return { ids, toggle, clear, has: (id: string) => ids.includes(id) };
}

// ─── Compare ────────────────────────────────────────────────────────────────

const CMP_KEY = "binayah_compare";

export function useCompare() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CMP_KEY);
      if (stored) setIds(JSON.parse(stored));
    } catch {
      /* ignore */
    }
    const handler = () => {
      try {
        const stored = localStorage.getItem(CMP_KEY);
        setIds(stored ? JSON.parse(stored) : []);
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("compare-update", handler);
    return () => window.removeEventListener("compare-update", handler);
  }, []);

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < 3
          ? [...prev, id]
          : prev;
      localStorage.setItem(CMP_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("compare-update"));
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setIds([]);
    localStorage.removeItem(CMP_KEY);
    window.dispatchEvent(new Event("compare-update"));
  }, []);

  return { ids, toggle, clear, has: (id: string) => ids.includes(id) };
}

// ─── Share ───────────────────────────────────────────────────────────────────

function SharePopover({ url, title, onClose }: { url: string; title: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback — select text */
    }
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`, "_blank");
    onClose();
  };

  const shareEmail = () => {
    window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this property:\n${url}`)}`, "_blank");
    onClose();
  };

  return (
    <div
      className="absolute right-0 top-full mt-1 z-30 bg-card border border-border rounded-xl shadow-xl p-3 w-56 animate-in fade-in zoom-in-95 duration-150"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-foreground">Share</p>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-3 w-3" />
        </button>
      </div>
      <div className="space-y-1">
        <button
          onClick={copyLink}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted rounded-lg transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Link2 className="h-3.5 w-3.5" />}
          {copied ? "Link copied!" : "Copy link"}
        </button>
        <button
          onClick={shareWhatsApp}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted rounded-lg transition-colors"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          WhatsApp
        </button>
        <button
          onClick={shareEmail}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted rounded-lg transition-colors"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          Email
        </button>
      </div>
    </div>
  );
}

// ─── Card Action Buttons (overlay on image) ─────────────────────────────────

interface CardActionsProps {
  propertyId: string;
  slug: string;
  title: string;
  type?: "property" | "project";
}

export function CardActions({ propertyId, slug, title, type = "property" }: CardActionsProps) {
  const { toggle: toggleFav, has: hasFav } = useFavorites();
  const { toggle: toggleCmp, has: hasCmp, ids: cmpIds } = useCompare();
  const [shareOpen, setShareOpen] = useState(false);
  const isFav = hasFav(propertyId);
  const isCmp = hasCmp(propertyId);
  const cmpFull = cmpIds.length >= 3 && !isCmp;

  const url = typeof window !== "undefined"
    ? `${window.location.origin}/${type === "project" ? "project" : "property"}/${slug}`
    : `https://binayah.com/${type === "project" ? "project" : "property"}/${slug}`;

  return (
    <div
      className="absolute top-3 right-3 flex gap-1.5 z-10 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
    >
      {/* Favorite */}
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFav(propertyId); }}
        title={isFav ? "Remove from favorites" : "Save to favorites"}
        className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110 ${
          isFav
            ? "bg-red-500 text-white"
            : "bg-white/90 text-foreground/70 hover:text-red-500"
        }`}
      >
        <Heart className={`h-3.5 w-3.5 ${isFav ? "fill-current" : ""}`} />
      </button>

      {/* Compare */}
      {type === "property" && (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (!cmpFull) toggleCmp(propertyId); }}
          disabled={cmpFull}
          title={cmpFull ? "Max 3 properties" : isCmp ? "Remove from comparison" : "Compare"}
          className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110 ${
            isCmp
              ? "bg-[#1A7A5A] text-white"
              : cmpFull
                ? "bg-white/50 text-foreground/30 cursor-not-allowed"
                : "bg-white/90 text-foreground/70 hover:text-[#1A7A5A]"
          }`}
        >
          <ArrowLeftRight className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Share */}
      <div className="relative">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (navigator.share) {
              navigator.share({ title, url }).catch(() => {});
            } else {
              setShareOpen(!shareOpen);
            }
          }}
          title="Share"
          className="w-8 h-8 rounded-full bg-white/90 text-foreground/70 flex items-center justify-center shadow-md hover:text-primary hover:scale-110 transition-all"
        >
          <Share2 className="h-3.5 w-3.5" />
        </button>
        {shareOpen && (
          <SharePopover url={url} title={title} onClose={() => setShareOpen(false)} />
        )}
      </div>
    </div>
  );
}

// ─── Detail Page Actions (inline buttons) ───────────────────────────────────

interface DetailActionsProps {
  propertyId: string;
  slug: string;
  title: string;
  type?: "property" | "project";
}

export function DetailActions({ propertyId, slug, title, type = "property" }: DetailActionsProps) {
  const { toggle: toggleFav, has: hasFav } = useFavorites();
  const { toggle: toggleCmp, has: hasCmp, ids: cmpIds } = useCompare();
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const isFav = hasFav(propertyId);
  const isCmp = hasCmp(propertyId);
  const cmpFull = cmpIds.length >= 3 && !isCmp;

  const url = typeof window !== "undefined"
    ? window.location.href
    : `https://binayah.com/${type === "project" ? "project" : "property"}/${slug}`;

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title, url }); } catch { /* cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch { /* fallback */ }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => toggleFav(propertyId)}
        className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-xl border transition-all ${
          isFav
            ? "bg-red-50 text-red-500 border-red-200"
            : "bg-card text-foreground border-border hover:border-red-200 hover:text-red-500"
        }`}
      >
        <Heart className={`h-3.5 w-3.5 ${isFav ? "fill-current" : ""}`} />
        {isFav ? "Saved" : "Save"}
      </button>

      {type === "property" && (
        <button
          onClick={() => { if (!cmpFull) toggleCmp(propertyId); }}
          disabled={cmpFull}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-xl border transition-all ${
            isCmp
              ? "bg-[#1A7A5A]/10 text-[#1A7A5A] border-[#1A7A5A]/20"
              : cmpFull
                ? "bg-muted text-muted-foreground border-border cursor-not-allowed opacity-50"
                : "bg-card text-foreground border-border hover:border-[#1A7A5A]/30 hover:text-[#1A7A5A]"
          }`}
        >
          <ArrowLeftRight className="h-3.5 w-3.5" />
          {isCmp ? "Comparing" : "Compare"}
        </button>
      )}

      <div className="relative">
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-xl bg-card text-foreground border border-border hover:bg-muted transition-all"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Share2 className="h-3.5 w-3.5" />}
          {copied ? "Copied!" : "Share"}
        </button>
      </div>
    </div>
  );
}
