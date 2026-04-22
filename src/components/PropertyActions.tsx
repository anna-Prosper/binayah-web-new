"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Heart, Share2, ArrowLeftRight, Link2, Check, X } from "lucide-react";
import { useFavorites as _useFavorites } from "@/context/FavoritesContext";
import { useCompare as _useCompare } from "@/context/CompareContext";

// Re-export from context so existing import paths keep working
export { useFavorites } from "@/context/FavoritesContext";
export { useCompare } from "@/context/CompareContext";

// ─── Outside-click hook ──────────────────────────────────────────────────────

function useOutsideClick(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    const listener = (e: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

// ─── Share ───────────────────────────────────────────────────────────────────

function SharePopover({ url, title, onClose }: { url: string; title: string; onClose: () => void }) {
  const t = useTranslations("share");
  const [copied, setCopied] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  useOutsideClick(popoverRef, onClose);

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
      ref={popoverRef}
      className="absolute right-0 top-full mt-1 z-30 bg-card border border-border rounded-xl shadow-xl p-3 w-56 animate-in fade-in zoom-in-95 duration-150"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-foreground">{t("title")}</p>
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
          {copied ? t("copied") : t("copyLink")}
        </button>
        <button
          onClick={shareWhatsApp}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted rounded-lg transition-colors"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          {t("whatsapp")}
        </button>
        <button
          onClick={shareEmail}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted rounded-lg transition-colors"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          {t("email")}
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
  const { toggle: toggleFav, has: hasFav } = _useFavorites();
  const { toggle: toggleCmp, has: hasCmp, ids: cmpIds } = _useCompare();
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
        aria-label={isFav ? "Remove from favorites" : "Save to favorites"}
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
          aria-label={cmpFull ? "Max 3 properties for comparison" : isCmp ? "Remove from comparison" : "Add to comparison"}
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
          aria-label="Share this property"
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
  variant?: "light" | "hero";
}

export function DetailActions({ propertyId, slug, title, type = "property", variant = "light" }: DetailActionsProps) {
  const t = useTranslations("share");
  const { toggle: toggleFav, has: hasFav } = _useFavorites();
  const { toggle: toggleCmp, has: hasCmp, ids: cmpIds } = _useCompare();
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const isFav = hasFav(propertyId);
  const isCmp = hasCmp(propertyId);
  const cmpFull = cmpIds.length >= 3 && !isCmp;

  const url = typeof window !== "undefined"
    ? window.location.href
    : `https://binayah.com/${type === "project" ? "project" : "property"}/${slug}`;

  const sharePopoverRef = useRef<HTMLDivElement>(null);
  useOutsideClick(sharePopoverRef, () => setShareOpen(false));

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title, url }); } catch { /* cancelled */ }
    } else {
      setShareOpen((prev) => !prev);
    }
  };

  const isHero = variant === "hero";
  const base = "flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-xl border transition-all";
  const favClasses = isHero
    ? (isFav
        ? "bg-red-500/90 text-white border-red-400 backdrop-blur-sm shadow-lg"
        : "bg-white/10 text-white border-white/25 backdrop-blur-sm hover:bg-white/20 hover:border-white/40")
    : (isFav
        ? "bg-red-50 text-red-500 border-red-200"
        : "bg-card text-foreground border-border hover:border-red-200 hover:text-red-500");
  const cmpClasses = isHero
    ? (isCmp
        ? "bg-accent/90 text-white border-accent/60 backdrop-blur-sm"
        : cmpFull
          ? "bg-white/5 text-white/40 border-white/10 backdrop-blur-sm cursor-not-allowed"
          : "bg-white/10 text-white border-white/25 backdrop-blur-sm hover:bg-white/20 hover:border-white/40")
    : (isCmp
        ? "bg-[#1A7A5A]/10 text-[#1A7A5A] border-[#1A7A5A]/20"
        : cmpFull
          ? "bg-muted text-muted-foreground border-border cursor-not-allowed opacity-50"
          : "bg-card text-foreground border-border hover:border-[#1A7A5A]/30 hover:text-[#1A7A5A]");
  const shareClasses = isHero
    ? "bg-white/10 text-white border-white/25 backdrop-blur-sm hover:bg-white/20 hover:border-white/40"
    : "bg-card text-foreground border-border hover:bg-muted";

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => toggleFav(propertyId)}
        aria-label={isFav ? "Remove from favorites" : "Save to favorites"}
        className={`${base} ${favClasses}`}
      >
        <Heart className={`h-3.5 w-3.5 ${isFav ? "fill-current" : ""}`} />
        {isFav ? t("saved") : t("save")}
      </button>

      {type === "property" && (
        <button
          onClick={() => { if (!cmpFull) toggleCmp(propertyId); }}
          disabled={cmpFull}
          aria-label={isCmp ? "Remove from comparison" : "Add to comparison"}
          className={`${base} ${cmpClasses}`}
        >
          <ArrowLeftRight className="h-3.5 w-3.5" />
          {isCmp ? "Comparing" : "Compare"}
        </button>
      )}

      <div className="relative" ref={sharePopoverRef}>
        <button
          onClick={handleShare}
          aria-label="Share this property"
          className={`${base} ${shareClasses}`}
        >
          {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Share2 className="h-3.5 w-3.5" />}
          {copied ? t("copied") : t("share")}
        </button>
        {shareOpen && (
          <SharePopover url={url} title={title} onClose={() => setShareOpen(false)} />
        )}
      </div>
    </div>
  );
}
