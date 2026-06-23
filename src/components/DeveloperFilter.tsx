"use client";

import { ChevronDown, Check, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

interface Props {
  value: string;
  onChange: (next: string) => void;
  options: string[];
  placeholder: string;
  searchPlaceholder: string;
  /** label for the "any developer" reset row */
  anyLabel: string;
}

/**
 * Searchable single-select developer dropdown. Trigger matches the filter-bar
 * style; popover has a type-to-filter box over the full developer list from the DB.
 */
export default function DeveloperFilter({ value, onChange, options, placeholder, searchPlaceholder, anyLabel }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, query]);

  const select = (dev: string) => {
    onChange(dev);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`flex items-center gap-1 pl-2 pr-1.5 py-2 text-sm whitespace-nowrap transition-colors ${value ? "text-foreground font-medium" : "text-foreground hover:text-foreground/80"}`}
      >
        <span className="max-w-[160px] truncate">{value || placeholder}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-[260px] bg-card border border-border rounded-2xl shadow-xl z-40 overflow-hidden">
          <div className="p-2 border-b border-border/60">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-background border border-border rounded-lg pl-8 pr-2.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            <button
              type="button"
              onClick={() => select("")}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left hover:bg-muted/60 transition-colors"
            >
              <span className={value ? "text-muted-foreground" : "text-foreground font-medium"}>{anyLabel}</span>
              {!value && <Check className="h-4 w-4 text-primary" />}
            </button>
            {filtered.map((dev) => (
              <button
                key={dev}
                type="button"
                onClick={() => select(dev)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left hover:bg-muted/60 transition-colors"
              >
                <span className={`truncate ${value === dev ? "text-primary font-semibold" : "text-foreground"}`}>{dev}</span>
                {value === dev && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
              </button>
            ))}
            {filtered.length === 0 && <p className="px-3 py-3 text-xs text-muted-foreground text-center">-</p>}
          </div>
        </div>
      )}
    </div>
  );
}
