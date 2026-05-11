"use client";

import { Check, ChevronDown, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  placeholder: string;
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
}

export default function MultiSelectFilter({ placeholder, options, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const toggle = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((entry) => entry !== option));
    } else {
      onChange([...value, option]);
    }
  };

  const clearOne = (event: React.MouseEvent, option: string) => {
    event.stopPropagation();
    onChange(value.filter((entry) => entry !== option));
  };

  const label = value.length === 0
    ? placeholder
    : value.length === 1
      ? value[0]
      : `${value[0]} +${value.length - 1}`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-left flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
      >
        <span className={`truncate ${value.length === 0 ? "text-muted-foreground" : "text-foreground"}`}>{label}</span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border rounded-xl shadow-xl z-30 overflow-hidden">
          <div className="max-h-64 overflow-y-auto py-1">
            {options.map((option) => {
              const selected = value.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggle(option)}
                  className={`w-full text-left px-3.5 py-2 text-sm flex items-center justify-between gap-2 transition-colors ${selected ? "text-primary bg-primary/8" : "text-foreground hover:bg-muted/60"}`}
                >
                  <span className="truncate">{option}</span>
                  {selected && <Check className="h-4 w-4 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
          {value.length > 0 && (
            <div className="border-t border-border/40 p-2 flex flex-wrap gap-1.5">
              {value.map((entry) => (
                <span key={entry} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">
                  {entry}
                  <button type="button" onClick={(event) => clearOne(event, entry)} aria-label={`Remove ${entry}`} className="hover:text-primary/70">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
