/* eslint-disable i18next/no-literal-string */
"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { COUNTRIES, flagEmoji } from "@/lib/country-codes";

interface Props {
  value: string;
  onChange: (dial: string) => void;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
}

// When several countries share a dial code keep one canonical entry per code.
const PREFERRED_ISO_PER_DIAL: Record<string, string> = {
  "+1": "US", "+7": "RU", "+44": "GB", "+47": "NO",
  "+61": "AU", "+39": "IT", "+212": "MA", "+262": "RE",
  "+590": "GP", "+599": "CW",
};

// Pinned at top regardless of search (unless search filters them out).
const PINNED_DIALS = ["+971", "+1", "+44", "+91", "+7", "+86", "+33", "+49", "+81", "+61"];

export default function CountryCodeSelect({ value, onChange, className, style, ariaLabel }: Props) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const options = useMemo(() => {
    const byDial = new Map<string, { iso: string; name: string; dial: string }>();
    for (const c of COUNTRIES) {
      const existing = byDial.get(c.dial);
      const preferred = PREFERRED_ISO_PER_DIAL[c.dial];
      if (!existing || preferred === c.iso) byDial.set(c.dial, c);
    }
    const all = Array.from(byDial.values());
    const pinned = PINNED_DIALS.map(d => byDial.get(d)).filter(Boolean) as typeof all;
    const rest = all.filter(c => !PINNED_DIALS.includes(c.dial)).sort((a, b) => a.name.localeCompare(b.name));
    return [...pinned, ...rest];
  }, []);

  const filtered = useMemo(() => {
    if (!query) return options;
    const q = query.toLowerCase();
    return options.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.dial.includes(q) ||
      c.iso.toLowerCase().startsWith(q)
    );
  }, [options, query]);

  const selected = options.find(c => c.dial === value);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Focus search when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  // Keyboard: close on Escape
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative" style={style}>
      {/* Trigger */}
      <button
        id={id}
        type="button"
        aria-label={ariaLabel ?? "Country code"}
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className={className ?? "h-11 rounded-xl bg-muted/30 border border-border/50 px-3 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"}
      >
        {selected ? `${flagEmoji(selected.iso)} ${selected.dial}` : value}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          onKeyDown={onKeyDown}
          className="absolute z-50 left-0 top-full mt-1 w-64 rounded-xl border border-border bg-popover shadow-xl overflow-hidden"
        >
          {/* Search */}
          <div className="p-2 border-b border-border">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search country or code..."
              className="w-full px-3 py-1.5 text-sm rounded-lg bg-background border border-border outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground"
            />
          </div>
          {/* List */}
          <ul className="max-h-56 overflow-y-auto" role="listbox">
            {filtered.length === 0 && (
              <li className="px-4 py-3 text-sm text-muted-foreground">No results</li>
            )}
            {filtered.map(c => (
              <li
                key={c.iso}
                role="option"
                aria-selected={c.dial === value}
                onMouseDown={() => { onChange(c.dial); setOpen(false); }}
                className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer select-none transition-colors
                  ${c.dial === value ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted text-foreground"}`}
              >
                <span className="text-base leading-none">{flagEmoji(c.iso)}</span>
                <span className="text-muted-foreground w-12 shrink-0">{c.dial}</span>
                <span className="truncate">{c.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
