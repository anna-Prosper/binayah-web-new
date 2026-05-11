"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  applyLabel: string;
  clearLabel?: string;
  onClear?: () => void;
  resultsLabel?: string;
  children: React.ReactNode;
}

/**
 * Bottom-sheet drawer for mobile. Slides up from the bottom, locks body
 * scroll while open, dismisses on backdrop tap and Escape.
 *
 * Designed to be conditionally rendered alongside an inline desktop
 * filter row — `className="lg:hidden"` on the parent keeps it
 * mobile-only.
 */
export default function FilterSheet({ open, onClose, title, applyLabel, clearLabel, onClear, resultsLabel, children }: Props) {
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-200 ${open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close filters"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <div
        className={`absolute bottom-0 left-0 right-0 max-h-[88vh] bg-card rounded-t-3xl shadow-2xl flex flex-col transition-transform duration-300 ease-out ${open ? "translate-y-0" : "translate-y-full"}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="pt-2.5 pb-1 flex justify-center">
          <span className="w-10 h-1 rounded-full bg-muted" />
        </div>
        <div className="flex items-center justify-between px-5 pb-3 border-b border-border/40">
          <h2 className="text-base font-bold text-foreground">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto flex-1">{children}</div>
        <div className="border-t border-border/40 px-5 py-3 flex items-center gap-3 bg-card">
          {clearLabel && onClear && (
            <button
              type="button"
              onClick={onClear}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {clearLabel}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:brightness-110 transition-all"
            style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
          >
            {applyLabel}
            {resultsLabel && <span className="ml-1 opacity-80">· {resultsLabel}</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
