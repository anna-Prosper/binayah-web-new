"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Phone, Menu, X, Home, Search, Building2, Mail,
  Loader2, MapPin, TrendingUp, ChevronRight, Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────
   Nav + bottom bar items
───────────────────────────────────────────── */
const navItems = [
  { label: "Off Plan",    href: "/off-plan" },
  { label: "Developers",  href: "/developers" },
  { label: "Communities", href: "/communities" },
  { label: "Services",    href: "/services" },
  { label: "News",        href: "/news" },
  { label: "About",       href: "/about" },
];

const bottomNavItems = [
  { label: "Home",     href: "/",         icon: Home },
  { label: "Search",   href: "/search",   icon: Search },
  { label: "Off Plan", href: "/off-plan", icon: Building2 },
  { label: "Contact",  href: "/contact",  icon: Mail },
];

/* ─────────────────────────────────────────────
   AI Search types
───────────────────────────────────────────── */
interface SearchSuggestion {
  label: string;
  sublabel?: string;
  href: string;
  type: "project" | "community" | "search" | "intent";
  icon?: "map" | "trend" | "search";
}

interface SuggestResponse {
  suggestions: SearchSuggestion[];
}

/* ─────────────────────────────────────────────
   Debounce hook
───────────────────────────────────────────── */
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/* ─────────────────────────────────────────────
   AI Search hook — /api/search/suggest (GPT-5.4-nano)
───────────────────────────────────────────── */
function useAISearch(query: string) {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);

    fetch(`/api/search/suggest?q=${encodeURIComponent(query.trim())}`, {
      signal: abortRef.current.signal,
    })
      .then((r) => r.json())
      .then((data: SuggestResponse) => {
        setSuggestions(data.suggestions ?? []);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setSuggestions([]);
          setLoading(false);
        }
      });

    return () => abortRef.current?.abort();
  }, [query]);

  return { suggestions, loading };
}

/* ─────────────────────────────────────────────
   Suggestion icon
───────────────────────────────────────────── */
function SuggestionIcon({ type }: { type?: "map" | "trend" | "search" }) {
  if (type === "map")   return <MapPin     className="h-3.5 w-3.5 flex-shrink-0" />;
  if (type === "trend") return <TrendingUp className="h-3.5 w-3.5 flex-shrink-0" />;
  return <Search className="h-3.5 w-3.5 flex-shrink-0" />;
}

/* ─────────────────────────────────────────────
   Desktop AI Search Bar
───────────────────────────────────────────── */
function AISearchBar() {
  const router = useRouter();
  const [query,  setQuery]  = useState("");
  const [open,   setOpen]   = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef     = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 350);
  const { suggestions, loading } = useAISearch(debouncedQuery);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActive(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const showDropdown = open && query.trim().length >= 2;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0 && suggestions[active]) {
        router.push(suggestions[active].href);
      } else {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
      setQuery(""); setOpen(false);
    } else if (e.key === "Escape") {
      setOpen(false); inputRef.current?.blur();
    }
  };

  const handleSelect = (s: SearchSuggestion) => {
    router.push(s.href);
    setQuery(""); setOpen(false); setActive(-1);
  };

  return (
    <div ref={containerRef} className="relative hidden lg:block">
      {/* Input pill */}
      <div className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/15 hover:border-white/25 rounded-xl px-3 py-2 transition-all duration-200 w-[220px] xl:w-[280px]">
        {loading
          ? <Loader2 className="h-3.5 w-3.5 text-white/40 animate-spin flex-shrink-0" />
          : <Search  className="h-3.5 w-3.5 text-white/40 flex-shrink-0" />
        }
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setActive(-1); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search properties, areas…"
          className="bg-transparent text-white text-xs placeholder:text-white/35 outline-none w-full min-w-0"
          autoComplete="off"
          suppressHydrationWarning
        />
        {query && (
          <button onClick={() => { setQuery(""); setSuggestions([]); inputRef.current?.focus(); }}
            className="text-white/30 hover:text-white/60 transition-colors flex-shrink-0">
            <X className="h-3 w-3" />
          </button>
        )}
        <span className="hidden xl:flex items-center gap-0.5 text-[9px] font-bold text-[#d1ae4a]/60 flex-shrink-0">
          <Sparkles className="h-2.5 w-2.5" />AI
        </span>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{ opacity: 0, y: -6,    scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-[340px] bg-[#004e41] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[200]"
          >
            {/* Header */}
            <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/8">
              <Sparkles className="h-3 w-3 text-[#d1ae4a]" />
              <span className="text-[10px] font-bold text-[#d1ae4a] uppercase tracking-wider">AI Search</span>
              <span className="text-[10px] text-white/30 ml-auto">GPT-5.4 nano</span>
            </div>

            {loading && suggestions.length === 0 ? (
              <div className="px-4 py-5 flex items-center gap-2.5 text-white/50 text-xs">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#d1ae4a]" />
                Searching Dubai properties…
              </div>
            ) : suggestions.length > 0 ? (
              <ul>
                {suggestions.map((s, i) => (
                  <li key={i}>
                    <button
                      onMouseDown={() => handleSelect(s)}
                      onMouseEnter={() => setActive(i)}
                      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${
                        active === i ? "bg-white/10" : "hover:bg-white/5"
                      }`}
                    >
                      <span className={`mt-0.5 ${
                        s.type === "project"   ? "text-[#d1ae4a]"   :
                        s.type === "community" ? "text-white/60"    :
                        s.type === "intent"    ? "text-emerald-400" :
                        "text-white/40"
                      }`}>
                        <SuggestionIcon type={s.icon} />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm text-white font-medium truncate">{s.label}</span>
                        {s.sublabel && (
                          <span className="block text-[11px] text-white/45 mt-0.5 truncate">{s.sublabel}</span>
                        )}
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 text-white/20 flex-shrink-0 mt-0.5" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-5 text-xs text-white/40">
                No results — try a community or project name
              </div>
            )}

            {/* Full search link */}
            <div className="border-t border-white/8 px-4 py-2.5">
              <button
                onMouseDown={() => {
                  router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                  setQuery(""); setOpen(false);
                }}
                className="flex items-center gap-1.5 text-[11px] text-white/40 hover:text-white/70 transition-colors w-full"
              >
                <Search className="h-3 w-3" />
                See all results for &ldquo;{query}&rdquo;
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // Need to expose setSuggestions in outer scope — workaround
  function setSuggestions(_: SearchSuggestion[]) {}
}

/* ─────────────────────────────────────────────
   Mobile AI Search (inside drawer)
───────────────────────────────────────────── */
function MobileAISearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open,  setOpen]  = useState(false);

  const debouncedQuery = useDebounce(query, 350);
  const { suggestions, loading } = useAISearch(debouncedQuery);

  return (
    <div className="px-3 py-2.5 border-b border-white/8">
      <div className="flex items-center gap-2 bg-white/8 border border-white/10 rounded-xl px-3 py-2.5">
        {loading
          ? <Loader2 className="h-4 w-4 text-white/40 animate-spin flex-shrink-0" />
          : <Search  className="h-4 w-4 text-white/40 flex-shrink-0" />
        }
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          placeholder="Search properties, areas…"
          className="bg-transparent text-white text-sm placeholder:text-white/35 outline-none flex-1 min-w-0"
          autoComplete="off"
          suppressHydrationWarning
        />
        <span className="flex items-center gap-0.5 text-[9px] font-bold text-[#d1ae4a]/60 flex-shrink-0">
          <Sparkles className="h-2.5 w-2.5" />AI
        </span>
      </div>

      <AnimatePresence>
        {open && query.trim().length >= 2 && (suggestions.length > 0 || loading) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="mt-1.5 bg-white/5 rounded-xl border border-white/8 overflow-hidden">
              {loading && suggestions.length === 0 ? (
                <div className="px-4 py-3 flex items-center gap-2 text-white/40 text-xs">
                  <Loader2 className="h-3 w-3 animate-spin" /> Searching…
                </div>
              ) : (
                suggestions.slice(0, 5).map((s, i) => (
                  <button key={i}
                    onMouseDown={() => { router.push(s.href); setQuery(""); setOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                  >
                    <span className="text-white/40"><SuggestionIcon type={s.icon} /></span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm text-white truncate">{s.label}</span>
                      {s.sublabel && (
                        <span className="block text-[10px] text-white/40 truncate">{s.sublabel}</span>
                      )}
                    </span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Navbar
───────────────────────────────────────────── */
interface NavbarProps {
  transparent?: boolean;
  extraItems?: React.ReactNode;
}

const Navbar = ({ transparent = true, extraItems }: NavbarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const isTransparent = transparent && !scrolled;
  const navBg = isTransparent ? "bg-transparent" : "bg-[#004e41] shadow-lg";
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* ── Top Navbar ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className={`flex items-center justify-between transition-all duration-300 ${scrolled ? "h-16" : "h-20"}`}>

            {/* Logo */}
            <Link href="/" aria-label="Binayah Properties — Home" className="flex-shrink-0">
              <img
                src="/assets/binayah-logo.png"
                alt="Binayah Properties"
                className={`w-auto brightness-0 invert transition-all duration-300 ${scrolled ? "h-9" : "h-11"}`}
              />
            </Link>

            {/* Desktop links */}
            <div className="hidden lg:flex items-center gap-0.5">
              {navItems.map((item) => (
                <Link key={item.label} href={item.href}
                  className={`relative px-4 py-2 text-[12px] font-medium uppercase tracking-[0.14em] transition-colors whitespace-nowrap group ${
                    isActive(item.href) ? "text-[#d1ae4a]" : "text-white/75 hover:text-white"
                  }`}
                >
                  {item.label}
                  <span className={`absolute bottom-0 left-4 right-4 h-[2px] bg-[#d1ae4a] transition-transform duration-200 origin-left ${
                    isActive(item.href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`} />
                </Link>
              ))}
            </div>

            {/* Desktop right — AI search + phone + CTA + extraItems */}
            <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
              <AISearchBar />
              <div className="w-px h-6 bg-white/15" />
              <a href="tel:+97154998811"
                className="flex items-center gap-2.5 text-white/75 hover:text-white transition-colors group">
                <div className="w-8 h-8 rounded-full border border-white/20 group-hover:border-[#d1ae4a]/50 flex items-center justify-center transition-colors">
                  <Phone className="h-3.5 w-3.5" />
                </div>
                <div className="hidden xl:block">
                  <p className="text-[9px] uppercase tracking-widest text-white/40 leading-none mb-0.5">Call Us</p>
                  <p className="text-[13px] font-medium leading-none">+971 54 998 8811</p>
                </div>
              </a>
              <div className="w-px h-6 bg-white/15" />
              <Link href="/contact"
                className="bg-[#d1ae4a] hover:bg-[#e0c472] text-[#003530] px-5 py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap">
                Get in Touch
              </Link>
              {extraItems && (
                <>
                  <div className="w-px h-6 bg-white/15" />
                  {extraItems}
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div key="drawer"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              className="lg:hidden overflow-hidden bg-[#004e41] border-t border-white/10"
            >
              {/* Mobile AI search */}
              <MobileAISearch />

              <div className="px-6 py-3 space-y-0.5">
                {navItems.map((item, i) => (
                  <motion.div key={item.label}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link href={item.href}
                      className={`flex items-center justify-between w-full px-3 py-3.5 rounded-lg text-[13px] uppercase tracking-[0.12em] transition-colors ${
                        isActive(item.href)
                          ? "text-[#d1ae4a] bg-white/5"
                          : "text-white/75 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {item.label}
                      {isActive(item.href) && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#d1ae4a]" />
                      )}
                    </Link>
                  </motion.div>
                ))}
                <div className="pt-4 mt-2 border-t border-white/10 space-y-2">
                  <a href="tel:+97154998811"
                    className="flex items-center gap-3 px-3 py-3 text-white/70 text-[13px] hover:text-white transition-colors">
                    <Phone className="h-4 w-4 text-[#d1ae4a] flex-shrink-0" />
                    +971 54 998 8811
                  </a>
                  <Link href="/contact"
                    className="flex items-center justify-center w-full bg-[#d1ae4a] hover:bg-[#e0c472] text-[#003530] py-3.5 rounded-lg text-[13px] font-semibold transition-colors">
                    Get in Touch
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#004e41] border-t border-white/10"
        aria-label="Mobile bottom navigation">
        <div className="flex items-stretch h-16">
          {bottomNavItems.map(({ label, href, icon: Icon }) => (
            <Link key={label} href={href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-medium uppercase tracking-wider transition-colors ${
                isActive(href) ? "text-[#d1ae4a]" : "text-white/50 hover:text-white/80"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive(href) ? "text-[#d1ae4a]" : "text-white/50"}`} />
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Spacer so content isn't hidden behind bottom nav on mobile */}
      <div className="lg:hidden h-16" aria-hidden="true" />
    </>
  );
};

export default Navbar;
