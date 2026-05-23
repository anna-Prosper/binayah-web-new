/* eslint-disable i18next/no-literal-string */
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Search, ChevronDown, X } from "lucide-react";
import { COUNTRIES, flagEmoji } from "@/lib/country-codes";

const PREFERRED_ISO: Record<string, string> = {
  "+1": "US", "+7": "RU", "+44": "GB", "+47": "NO",
  "+61": "AU", "+39": "IT", "+212": "MA", "+262": "RE",
  "+590": "GP", "+599": "CW",
};

const uniqueCountries = (() => {
  const byDial = new Map<string, { iso: string; name: string; dial: string }>();
  for (const c of COUNTRIES) {
    const existing = byDial.get(c.dial);
    const preferred = PREFERRED_ISO[c.dial];
    if (!existing || preferred === c.iso) byDial.set(c.dial, c);
  }
  return Array.from(byDial.values()).sort((a, b) => a.name.localeCompare(b.name));
})();

function isoForDial(dial: string): string {
  return PREFERRED_ISO[dial] || uniqueCountries.find((c) => c.dial === dial)?.iso || "AE";
}

interface Props {
  value: string;
  onChange: (dial: string) => void;
  className?: string;
}

export default function PhoneCodePicker({ value, onChange, className }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 80);
  }, [open]);

  const filtered = useMemo(() => {
    if (!search.trim()) return uniqueCountries;
    const q = search.toLowerCase().replace(/^\+/, "");
    return uniqueCountries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dial.replace("+", "").startsWith(q) ||
        c.iso.toLowerCase().startsWith(q)
    );
  }, [search]);

  const flag = flagEmoji(isoForDial(value));

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex items-center gap-1.5 bg-background border border-border/80 rounded-xl px-3 py-3.5 text-sm text-foreground cursor-pointer shrink-0 hover:border-border transition-all focus:outline-none focus:ring-2 focus:ring-accent/30 ${className ?? ""}`}
      >
        <span className="text-base leading-none">{flag}</span>
        <span className="font-medium">{value}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => { setOpen(false); setSearch(""); }}
          />
          {/* Sheet */}
          <div className="relative bg-background w-full sm:w-[360px] sm:mx-4 rounded-t-2xl sm:rounded-2xl max-h-[75vh] flex flex-col shadow-2xl">
            {/* Handle bar (mobile) */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>
            {/* Search header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <input
                ref={searchRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country or code…"
                className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/50"
              />
              {search && (
                <button type="button" onClick={() => setSearch("")}>
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
            {/* Country list */}
            <div className="overflow-y-auto overscroll-contain">
              {filtered.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">No results</p>
              )}
              {filtered.map((c) => (
                <button
                  key={c.iso}
                  type="button"
                  onClick={() => { onChange(c.dial); setOpen(false); setSearch(""); }}
                  className={`flex items-center gap-3 w-full px-4 py-3 text-left text-sm transition-colors hover:bg-muted active:bg-muted ${c.dial === value ? "bg-accent/10" : ""}`}
                >
                  <span className="text-lg leading-none w-7 text-center">{flagEmoji(c.iso)}</span>
                  <span className="flex-1 text-foreground">{c.name}</span>
                  <span className="text-muted-foreground tabular-nums">{c.dial}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
