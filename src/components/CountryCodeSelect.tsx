/* eslint-disable i18next/no-literal-string */
"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { COUNTRIES, flagEmoji } from "@/lib/country-codes";

interface Props {
  value: string;
  onChange: (dial: string) => void;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
}

const PREFERRED_ISO_PER_DIAL: Record<string, string> = {
  "+1": "US", "+7": "RU", "+44": "GB", "+47": "NO",
  "+61": "AU", "+39": "IT", "+212": "MA", "+262": "RE",
  "+590": "GP", "+599": "CW",
};

const PINNED_DIALS = ["+971", "+1", "+44", "+91", "+7", "+86", "+33", "+49", "+81", "+61"];

export default function CountryCodeSelect({ value, onChange, className, style, ariaLabel }: Props) {
  const t = useTranslations("countryCode");
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
    const rest = all
      .filter(c => !PINNED_DIALS.includes(c.dial))
      .sort((a, b) => a.name.localeCompare(b.name));
    return [...pinned, ...rest];
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.dial.replace("+", "").startsWith(q.replace("+", "")) ||
      c.iso.toLowerCase().startsWith(q)
    );
  }, [options, query]);

  const selected = useMemo(() => options.find(c => c.dial === value), [options, value]);

  // Close on outside click/tap — use pointerdown so it works on touch devices
  useEffect(() => {
    if (!open) return;
    const handler = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  return (
    <div ref={containerRef} className="relative" style={style}>
      {/* Trigger */}
      <button
        id={id}
        type="button"
        aria-label={ariaLabel ?? "Country code"}
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className={className ?? "h-11 rounded-xl bg-muted/30 border border-border/50 px-3 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"}
      >
        {selected ? `${flagEmoji(selected.iso)} ${selected.dial}` : value}
      </button>

      {/* Dropdown — anchored right-0 so it never overflows off the right edge */}
      {open && (
        <div
          onKeyDown={e => e.key === "Escape" && setOpen(false)}
          className="absolute z-50 right-0 top-full mt-1 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-background shadow-2xl overflow-hidden"
        >
          {/* Search bar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search country or code..."
              className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* List */}
          <ul className="max-h-64 overflow-y-auto" role="listbox">
            {filtered.length === 0 && (
              <li className="px-4 py-4 text-sm text-muted-foreground text-center">No results</li>
            )}
            {filtered.map(c => (
              <li
                key={c.iso}
                role="option"
                aria-selected={c.dial === value}
                onPointerDown={() => { onChange(c.dial); setOpen(false); }}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer select-none transition-colors
                  ${c.dial === value
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted text-foreground"}`}
              >
                <span className="text-lg leading-none w-7 shrink-0">{flagEmoji(c.iso)}</span>
                <span className="text-sm text-muted-foreground w-14 shrink-0">{c.dial}</span>
                <span className="flex-1 text-sm font-medium truncate">{c.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
