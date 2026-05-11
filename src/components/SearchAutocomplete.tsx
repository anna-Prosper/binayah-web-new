"use client";

import { apiUrl } from "@/lib/api";
import {
  Building,
  Building2,
  Hash,
  Loader2,
  MapPin,
  Search,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { HomeSearchSuggestion, HomeSearchSuggestionGroups } from "@/lib/home-smart-search";

const EMPTY: HomeSearchSuggestionGroups = {
  askAi: [],
  communities: [],
  developers: [],
  places: [],
  projects: [],
  smart: [],
};

interface Props {
  value: string;
  onChange: (next: string) => void;
  /** Fires when the user commits a query — pressing Enter or clicking a suggestion. */
  onSubmit?: (committedValue: string) => void;
  placeholder?: string;
  tab?: "Buy" | "Rent" | "Off-Plan" | "All";
}

function sectionIcon(kind: HomeSearchSuggestion["kind"]) {
  switch (kind) {
    case "community":
      return <MapPin className="h-4 w-4 text-primary" />;
    case "project":
      return <Building2 className="h-4 w-4 text-primary" />;
    case "developer":
      return <Building className="h-4 w-4 text-primary" />;
    case "place":
      return <Hash className="h-4 w-4 text-muted-foreground" />;
    case "smart-search":
      return <Sparkles className="h-4 w-4 text-accent" />;
    default:
      return <Search className="h-4 w-4 text-muted-foreground" />;
  }
}

export default function SearchAutocomplete({ value, onChange, onSubmit, placeholder, tab = "All" }: Props) {
  const [groups, setGroups] = useState<HomeSearchSuggestionGroups>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Flatten suggestions in display order for keyboard nav.
  const flat: Array<{ section: string; item: HomeSearchSuggestion }> = [];
  for (const item of groups.communities) flat.push({ section: "Communities", item });
  for (const item of groups.projects) flat.push({ section: "Projects", item });
  for (const item of groups.developers) flat.push({ section: "Developers", item });
  for (const item of groups.places) flat.push({ section: "Places", item });

  useEffect(() => {
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setGroups(EMPTY);
      setLoading(false);
      return;
    }
    const handle = setTimeout(() => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setLoading(true);
      fetch(
        apiUrl(`/api/home-smart-search?q=${encodeURIComponent(trimmed)}&tab=${encodeURIComponent(tab)}`),
        { cache: "no-store", signal: ctrl.signal }
      )
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.suggestions) setGroups(data.suggestions);
          else setGroups(EMPTY);
        })
        .catch((err) => {
          if (err?.name !== "AbortError") setGroups(EMPTY);
        })
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(handle);
  }, [value, tab]);

  // Outside-click closes the dropdown.
  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const choose = useCallback(
    (item: HomeSearchSuggestion) => {
      const next = item.title;
      onChange(next);
      onSubmit?.(next);
      setOpen(false);
      setActive(-1);
      inputRef.current?.blur();
    },
    [onChange, onSubmit]
  );

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (flat.length > 0) setActive((idx) => (idx + 1) % flat.length);
      setOpen(true);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (flat.length > 0) setActive((idx) => (idx <= 0 ? flat.length - 1 : idx - 1));
      return;
    }
    if (event.key === "Enter") {
      if (active >= 0 && flat[active]) {
        event.preventDefault();
        choose(flat[active].item);
      } else {
        onSubmit?.(value);
        setOpen(false);
      }
      return;
    }
    if (event.key === "Escape") {
      setOpen(false);
      setActive(-1);
    }
  };

  // Reset active on new groups.
  useEffect(() => setActive(-1), [groups]);

  const totalItems = flat.length;
  const showDropdown = open && (loading || totalItems > 0);

  let flatIdx = -1;
  const renderSection = (title: string, items: HomeSearchSuggestion[]) => {
    if (items.length === 0) return null;
    return (
      <div key={title} className="border-b border-border/30 last:border-b-0">
        <p className="px-4 pt-3 pb-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
        {items.map((item) => {
          flatIdx += 1;
          const isActive = flatIdx === active;
          return (
            <button
              key={item.id}
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                choose(item);
              }}
              onMouseEnter={() => setActive(flatIdx)}
              className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors ${isActive ? "bg-primary/8" : "hover:bg-muted/60"}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isActive ? "bg-primary/12" : "bg-muted/60"}`}>
                {sectionIcon(item.kind)}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium truncate ${isActive ? "text-primary" : "text-foreground"}`}>{item.title}</p>
                {item.subtitle && <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>}
              </div>
              {item.badge && (
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div ref={wrapRef} className="relative flex-1">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        ref={inputRef}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="w-full pl-11 pr-10 py-3 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
      />
      {loading && (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
      )}

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-xl rounded-2xl border border-border/60 shadow-2xl z-40 overflow-hidden">
          <div className="max-h-[26rem] overflow-y-auto">
            {totalItems === 0 && loading ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">…</div>
            ) : (
              <>
                {renderSection("Communities", groups.communities)}
                {renderSection("Projects", groups.projects)}
                {renderSection("Developers", groups.developers)}
                {renderSection("Places", groups.places)}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
